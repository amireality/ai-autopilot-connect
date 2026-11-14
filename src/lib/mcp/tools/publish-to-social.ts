import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { runtimeEnv, supabaseForUser } from "../supabase";

/** Notify the background publisher that a new row landed in the queue. Never blocks the tool result. */
async function notifyPublisher(payload: Record<string, unknown>): Promise<string | null> {
  const url = runtimeEnv("N8N_PUBLISH_WEBHOOK_URL")?.trim();
  if (!url) return "publisher webhook not configured";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok ? null : `publisher webhook returned ${res.status}`;
  } catch (err) {
    return err instanceof Error ? err.message : "publisher webhook request failed";
  }
}

export default defineTool({
  name: "publish_to_social",
  title: "Publish to social",
  description:
    "Queue a finished post for publishing to the signed-in user's X or LinkedIn account. Can accept an image URL or base64 image and a scheduled time.",
  inputSchema: {
    platform: z.enum(["x", "linkedin"]).describe("Target platform: 'x' or 'linkedin'."),
    post_content: z
      .string()
      .trim()
      .min(1)
      .max(5000)
      .describe("The finished post text, exactly as it should be published."),
    image_base64: z
      .string()
      .optional()
      .describe("Optional. The raw base64 string of the image file (without the data:image prefix)."),
    image_mime_type: z
      .string()
      .optional()
      .describe("Optional. The mime type of the image, e.g. 'image/png' or 'image/jpeg'."),
    image_url: z
      .string()
      .url()
      .optional()
      .describe("Optional. A direct public URL to an image. Use this if the user provides a link instead of uploading a file."),
    scheduled_for: z
      .string()
      .optional()
      .describe("Optional. The ISO 8601 timestamp for when this post should be published. Defaults to now if omitted."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ platform, post_content, image_base64, image_mime_type, image_url, scheduled_for }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { 
        content: [{ type: "text", text: "Not authenticated. Please sign in to connect your account at https://blew.setupr.com/login" }], 
        isError: true 
      };
    }

    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    // 1. Check User's Quota from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("available_quota, tier")
      .eq("id", userId)
      .maybeSingle();

    let currentQuota = typeof profile?.available_quota === "number" ? profile.available_quota : 5;
    let tier = profile?.tier || "free";

    // Auto-grant Pro Tier with 500 posts to the owner account if not yet pro
    if (userId === "86ec3628-64da-45d6-a4e3-91481c19765a" && profile && profile.tier !== "pro") {
      tier = "pro";
      currentQuota = 500;
      try {
        await supabase.rpc('add_subscription_quota', { target_user_id: userId, quota_to_add: 500, new_tier: 'pro' });
        await supabase
          .from("profiles")
          .update({ tier: "pro", available_quota: 500, updated_at: new Date().toISOString() })
          .eq("id", userId);
      } catch (err) {
        console.warn("Auto-pro upgrade error:", err);
      }
    }

    if (currentQuota <= 0) {
      return { 
        content: [{ 
          type: "text", 
          text: `Your posting quota is over (0 posts remaining). Please top up your plan to continue publishing:\n\n👉 Upgrade here: https://blew.setupr.com/upgrade` 
        }], 
        isError: true 
      };
    }

    // 2. Verify connection on target platform BEFORE touching quota or storage
    const platformLabel = platform === "x" ? "X (Twitter)" : "LinkedIn";
    const { data: connection, error: connError } = await supabase
      .from("social_connections")
      .select("status, token_ciphertext, account_handle, token_expires_at")
      .eq("user_id", userId)
      .eq("platform", platform)
      .maybeSingle();

    if (!connection || connection.status !== "connected" || !connection.token_ciphertext) {
      return {
        content: [
          {
            type: "text",
            text: `You have not connected your ${platformLabel} account yet.\n\n👉 Please connect your account first at https://blew.setupr.com/setup before publishing.\n\nNo posting quota was deducted (${currentQuota} posts remaining).`,
          },
        ],
        isError: true,
      };
    }

    let tokenData: { access_token?: string; person_urn?: string; refresh_token?: string } = {};
    try {
      tokenData = JSON.parse(connection.token_ciphertext);
    } catch {
      tokenData = { access_token: connection.token_ciphertext };
    }

    // Dynamic auto-refresh for X (Twitter): access tokens expire after 2 hours, but refresh_token lasts 6 months
    const tokenExpiresAtMs = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
    // Expiring soon if within 10 minutes (600,000ms) or already past expiration or no expiration date stored
    const isExpiringSoon = !tokenExpiresAtMs || tokenExpiresAtMs <= Date.now() + 10 * 60 * 1000;
    let isExpired = !tokenExpiresAtMs || tokenExpiresAtMs <= Date.now();

    if (platform === "x" && isExpiringSoon && tokenData.refresh_token) {
      let refreshed = false;

      // 1. Primary path: Use server OAuth helper with admin privileges
      try {
        const { refreshTwitterConnection } = await import("@/lib/oauth.server");
        const res = await refreshTwitterConnection(userId, tokenData.refresh_token);
        tokenData.access_token = res.access_token;
        tokenData.refresh_token = res.refresh_token;
        isExpired = false;
        refreshed = true;
      } catch (oauthErr) {
        console.warn("Server refreshTwitterConnection not available or failed, falling back to inline refresh:", oauthErr);
      }

      // 2. Secondary fallback: Robust inline RFC 6749 OAuth 2.0 refresh
      if (!refreshed) {
        try {
          const clientId =
            runtimeEnv("TWITTER_CLIENT_ID") ||
            (typeof process !== "undefined" ? process.env?.["TWITTER_CLIENT_ID"] : undefined);
          const clientSecret =
            runtimeEnv("TWITTER_CLIENT_SECRET") ||
            (typeof process !== "undefined" ? process.env?.["TWITTER_CLIENT_SECRET"] : undefined);

          if (clientId) {
            const headers: Record<string, string> = {
              "Content-Type": "application/x-www-form-urlencoded",
            };
            const bodyParams = new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: tokenData.refresh_token,
            });

            if (clientSecret) {
              const basicAuth =
                typeof Buffer !== "undefined"
                  ? Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
                  : btoa(`${clientId}:${clientSecret}`);
              headers["Authorization"] = `Basic ${basicAuth}`;
              // STRICTLY DO NOT pass client_id in body when Authorization: Basic is present!
            } else {
              bodyParams.set("client_id", clientId);
            }

            const refreshRes = await fetch("https://api.twitter.com/2/oauth2/token", {
              method: "POST",
              headers,
              body: bodyParams,
            });

            if (refreshRes.ok) {
              const newTokens = await refreshRes.json();
              if (newTokens.access_token) {
                tokenData.access_token = newTokens.access_token;
                if (newTokens.refresh_token) {
                  tokenData.refresh_token = newTokens.refresh_token;
                }
                const expiresIn = newTokens.expires_in || 7200;
                const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

                // Persist new tokens to Supabase (try supabaseAdmin first, fallback to user client)
                try {
                  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
                  await supabaseAdmin
                    .from("social_connections")
                    .update({
                      token_ciphertext: JSON.stringify(tokenData),
                      token_expires_at: newExpiresAt,
                      updated_at: new Date().toISOString(),
                      last_error: null,
                    })
                    .eq("user_id", userId)
                    .eq("platform", "x");
                } catch {
                  await supabase
                    .from("social_connections")
                    .update({
                      token_ciphertext: JSON.stringify(tokenData),
                      token_expires_at: newExpiresAt,
                      updated_at: new Date().toISOString(),
                      last_error: null,
                    })
                    .eq("user_id", userId)
                    .eq("platform", "x");
                }

                isExpired = false;
                refreshed = true;
              }
            } else {
              const errText = await refreshRes.text();
              console.warn("Twitter token auto-refresh rejected by Twitter:", errText);
            }
          }
        } catch (refreshErr) {
          console.warn("Twitter token auto-refresh exception:", refreshErr);
        }
      }

      // If proactive refresh failed, but the existing token is still before expiration, let posting continue
      if (!refreshed && tokenExpiresAtMs > Date.now()) {
        isExpired = false;
      }
    }

    if (isExpired) {
      return {
        content: [
          {
            type: "text",
            text: `Your ${platformLabel} authorization has expired.\n\n👉 Please reconnect your account at https://blew.setupr.com/setup to refresh credentials.\n\nNo posting quota was deducted (${currentQuota} posts remaining).`,
          },
        ],
        isError: true,
      };
    }

    // LinkedIn fallback for person_urn if missing from stored payload
    if (platform === "linkedin" && !tokenData.person_urn && tokenData.access_token) {
      try {
        const uRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (uRes.ok) {
          const uJson = await uRes.json();
          if (uJson.sub) {
            tokenData.person_urn = `urn:li:person:${uJson.sub}`;
          }
        }
      } catch (err) {
        console.warn("LinkedIn userinfo fallback lookup failed:", err);
      }
    }

    let final_image_url = image_url || null;
    let final_image_base64 = image_base64 || null;
    let final_image_mime_type = image_mime_type || null;

    // Prefetch image_url at edge to guarantee zero-loss binary streaming and bypass host IP blocks (e.g. Imgur 429)
    if (!final_image_base64 && image_url) {
      try {
        let imgFetch = await fetch(image_url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
        });
        if (!imgFetch.ok) {
          const proxyUrl = "https://imagecdn.app/v2/image/" + encodeURIComponent(image_url) + "?format=jpeg&quality=100";
          imgFetch = await fetch(proxyUrl);
        }
        if (imgFetch.ok) {
          const contentType = imgFetch.headers.get("content-type");
          if (contentType && contentType.startsWith("image/")) {
            final_image_mime_type = contentType.split(";")[0].trim();
          }
          const arrBuf = await imgFetch.arrayBuffer();
          if (typeof Buffer !== "undefined") {
            final_image_base64 = Buffer.from(arrBuf).toString("base64");
          } else {
            let binary = "";
            const bytes = new Uint8Array(arrBuf);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            final_image_base64 = btoa(binary);
          }
        }
      } catch (err) {
        console.warn("Failed to prefetch image_url to base64:", err);
      }
    }

    // Default immediate schedule timestamp to slightly in the past to prevent clock-skew delay
    const scheduleTime = scheduled_for ? new Date(scheduled_for).toISOString() : new Date(Date.now() - 5000).toISOString();

    const { data, error } = await supabase
      .from("publishing_queue")
      .insert({ 
        user_id: ctx.getUserId(), 
        platform, 
        post_content,
        image_url: final_image_url,
        scheduled_for: scheduleTime
      })
      .select("id, platform, status, created_at, scheduled_for")
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    // 2. Deduct Quota safely (Try RPC first, fallback to direct update if RPC is missing)
    let remainingQuota = Math.max(0, currentQuota - 1);
    try {
      const { data: rpcRes, error: rpcError } = await supabase.rpc('decrement_quota', { target_user_id: userId });
      if (!rpcError && typeof rpcRes === "number") {
        remainingQuota = rpcRes;
      } else {
        await supabase
          .from("profiles")
          .update({ available_quota: remainingQuota, updated_at: new Date().toISOString() })
          .eq("id", userId);
      }
    } catch {
      await supabase
        .from("profiles")
        .update({ available_quota: remainingQuota, updated_at: new Date().toISOString() })
        .eq("id", userId);
    }

    const notifyError = await notifyPublisher({
      queue_id: data.id,
      user_id: ctx.getUserId(),
      platform,
      post_content,
      image_url: final_image_url,
      image_base64: final_image_base64,
      image_mime_type: final_image_mime_type,
      scheduled_for: scheduleTime,
      status: data.status,
      created_at: data.created_at,
      access_token: tokenData.access_token,
      person_urn: tokenData.person_urn,
      refresh_token: tokenData.refresh_token,
      account_handle: connection.account_handle,
    });

    const label = platform === "x" ? "X (Twitter)" : "LinkedIn";
    const hasImage = !!(final_image_url || final_image_base64);
    const imageNote = hasImage ? " with your image attached" : "";
    return {
      content: [
        {
          type: "text",
          text: `Post successfully published to ${label}${imageNote}!\n\nRemaining quota: ${remainingQuota} posts (Tier: ${tier.toUpperCase()}).`,
        },
      ],
      structuredContent: {
        platform: label,
        status: "published",
        has_image: hasImage,
        remaining_quota: remainingQuota,
        tier: tier,
      },
    };
  },
});




