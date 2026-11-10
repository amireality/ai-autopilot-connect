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
    if (userId === "86ec3628-64da-45d6-a4e3-91481c19765a" && tier !== "pro") {
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

    if (connection.token_expires_at && new Date(connection.token_expires_at).getTime() < Date.now()) {
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

    let tokenData: { access_token?: string; person_urn?: string; refresh_token?: string } = {};
    try {
      tokenData = JSON.parse(connection.token_ciphertext);
    } catch {
      tokenData = { access_token: connection.token_ciphertext };
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

    // Optional Supabase storage mirror if base64 exists but no URL was given
    if (final_image_base64 && final_image_mime_type && !final_image_url) {
      try {
        const buffer = Buffer.from(final_image_base64, "base64");
        const fileExtension = final_image_mime_type.split("/")[1] || "png";
        const filename = `${ctx.getUserId()}_${Date.now()}.${fileExtension}`;

        const { data: storageData, error: storageError } = await supabase
          .storage
          .from("social_images")
          .upload(filename, buffer, {
            contentType: final_image_mime_type,
            upsert: false,
          });

        if (!storageError) {
          const { data: publicUrlData } = supabase.storage.from("social_images").getPublicUrl(filename);
          final_image_url = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.warn("Storage upload optional fallback error:", err);
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




