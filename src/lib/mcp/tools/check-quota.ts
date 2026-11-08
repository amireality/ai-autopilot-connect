import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "check_quota",
  title: "Check posting quota",
  description:
    "Check the signed-in user's remaining social post credits, active tier, and account info. Call this whenever the user asks about their balance, quota, plan, or how many posts they have left.",
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [
          {
            type: "text",
            text: "Not authenticated. Please sign in to check your account quota at https://blew.setupr.com/login",
          },
        ],
        isError: true,
      };
    }

    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { data: profile } = await supabase
      .from("profiles")
      .select("available_quota, tier")
      .eq("id", userId)
      .maybeSingle();

    const quota = typeof profile?.available_quota === "number" ? profile.available_quota : 5;
    const tier = profile?.tier || "free";

    return {
      content: [
        {
          type: "text",
          text: `You have ${quota} posts remaining on your Blew account.\nTier: ${tier.toUpperCase()}\n\nFor account details and plan information, visit: https://blew.setupr.com`,
        },
      ],
      structuredContent: {
        available_quota: quota,
        tier,
        account_url: "https://blew.setupr.com",
      },
    };
  },
});
