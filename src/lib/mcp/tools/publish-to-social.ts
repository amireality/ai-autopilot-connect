import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { runtimeEnv, supabaseForUser } from "../supabase";

/** Notify the n8n publisher that a new row landed in the queue. Never blocks the tool result. */
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
    "Queue a finished post for publishing to the signed-in user's X or LinkedIn account. Pass any content you have written.",
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

    const notifyError = await notifyPublisher({
      queue_id: data.id,
      user_id: ctx.getUserId(),
      platform,
      post_content,
      status: data.status,
      created_at: data.created_at,
    });

    const label = platform === "x" ? "X" : "LinkedIn";
    return {
      content: [
        {
          type: "text",
          text: notifyError
            ? `Queued for ${label} (queue id: ${data.id}), but the publisher could not be notified directly (${notifyError}). It will still be picked up from the queue.`
            : `Queued for ${label} and handed to the publisher. Queue id: ${data.id}.`,
        },
      ],
      structuredContent: { queued: data, publisher_notified: !notifyError },
    };
  },
});

