import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "publish_to_social",
  title: "Publish to social",
  description:
    "Queue a finished post for publishing to the signed-in user's X or LinkedIn account. Works with or without the daily paper — pass any content you have written.",
  inputSchema: {
    platform: z.enum(["x", "linkedin"]).describe("Target platform: 'x' or 'linkedin'."),
    post_content: z
      .string()
      .trim()
      .min(1)
      .max(5000)
      .describe("The finished post text, exactly as it should be published."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ platform, post_content }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("publishing_queue")
      .insert({ user_id: ctx.getUserId(), platform, post_content })
      .select("id, platform, status, created_at")
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [
        {
          type: "text",
          text: `Queued for ${platform === "x" ? "X" : "LinkedIn"}. Queue id: ${data.id}. The publisher picks it up automatically.`,
        },
      ],
      structuredContent: { queued: data },
    };
  },
});
