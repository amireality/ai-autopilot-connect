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
    "Queue a finished post for publishing to the signed-in user's X or LinkedIn account. Can accept a base64 image and a scheduled time.",
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
    scheduled_for: z
      .string()
      .optional()
      .describe("Optional. The ISO 8601 timestamp for when this post should be published. Defaults to now if omitted."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ platform, post_content, image_base64, image_mime_type, scheduled_for }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    let image_url = null;

    // Handle Image Upload if provided
    if (image_base64 && image_mime_type) {
      try {
        const buffer = Buffer.from(image_base64, 'base64');
        const fileExtension = image_mime_type.split('/')[1] || 'png';
        const filename = `${ctx.getUserId()}_${Date.now()}.${fileExtension}`;

        const { data: storageData, error: storageError } = await supabase
          .storage
          .from('social_images')
          .upload(filename, buffer, {
            contentType: image_mime_type,
            upsert: false
          });

        if (storageError) {
          return { content: [{ type: "text", text: `Storage upload error: ${storageError.message}` }], isError: true };
        }

        // Get the permanent public URL
        const { data: publicUrlData } = supabase.storage.from('social_images').getPublicUrl(filename);
        image_url = publicUrlData.publicUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Failed to process image: ${message}` }], isError: true };
      }
    }

    const scheduleTime = scheduled_for ? new Date(scheduled_for).toISOString() : new Date().toISOString();

    const { data, error } = await supabase
      .from("publishing_queue")
      .insert({ 
        user_id: ctx.getUserId(), 
        platform, 
        post_content,
        image_url,
        scheduled_for: scheduleTime
      })
      .select("id, platform, status, created_at, scheduled_for")
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const notifyError = await notifyPublisher({
      queue_id: data.id,
      user_id: ctx.getUserId(),
      platform,
      post_content,
      image_url,
      scheduled_for: scheduleTime,
      status: data.status,
      created_at: data.created_at,
    });

    const label = platform === "x" ? "X" : "LinkedIn";
    return {
      content: [
        {
          type: "text",
          text: notifyError
            ? `Queued for ${label} at ${scheduleTime} (queue id: ${data.id}), but the publisher could not be notified directly (${notifyError}). It will still be picked up from the queue. ${image_url ? 'Image attached.' : 'No image attached.'}`
            : `Queued for ${label} at ${scheduleTime} and handed to the publisher. Queue id: ${data.id}. ${image_url ? 'Image attached.' : 'No image attached.'}`,
        },
      ],
      structuredContent: { queued: data, publisher_notified: !notifyError },
    };
  },
});
