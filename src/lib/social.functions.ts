import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SocialPlatform = "x" | "linkedin";

export const listSocialConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("social_connections")
      .select("platform, status, account_handle, updated_at")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertSocialConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { platform: SocialPlatform }) => {
    if (input.platform !== "x" && input.platform !== "linkedin") {
      throw new Error("Unsupported platform");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("social_connections").upsert(
      {
        user_id: context.userId,
        platform: data.platform,
        status: "connected",
      },
      { onConflict: "user_id,platform" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeSocialConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { platform: SocialPlatform }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("social_connections")
      .delete()
      .eq("user_id", context.userId)
      .eq("platform", data.platform);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
