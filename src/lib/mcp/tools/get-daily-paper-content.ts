import { defineTool } from "@lovable.dev/mcp-js";
import { runtimeEnv } from "../supabase";

export default defineTool({
  name: "get_daily_paper_content",
  title: "Get daily paper content",
  description:
    "Fetch today's newspaper (PDF text) from the master OneDrive archive and return the raw content. Read it yourself to find stories worth posting about — this tool never summarises or writes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async () => {
    const webhookUrl = runtimeEnv("N8N_PAPER_WEBHOOK_URL")?.trim();
    if (!webhookUrl) {
      return {
        content: [
          {
            type: "text",
            text: "The daily paper source is not configured yet. Ask the operator to set the OneDrive paper webhook, then try again.",
          },
        ],
        isError: true,
      };
    }

    const secret = runtimeEnv("N8N_WEBHOOK_SECRET")?.trim();
    const headers: Record<string, string> = { Accept: "application/json, text/plain" };
    if (secret) headers["x-webhook-secret"] = secret;

    let response: Response;
    try {
      response = await fetch(webhookUrl, { method: "GET", headers });
    } catch {
      return {
        content: [{ type: "text", text: "Could not reach the paper source. Try again shortly." }],
        isError: true,
      };
    }

    if (!response.ok) {
      return {
        content: [
          { type: "text", text: `The paper source returned an error (status ${response.status}).` },
        ],
        isError: true,
      };
    }

    const body = await response.text();
    const text = extractContent(body);
    if (!text.trim()) {
      return {
        content: [{ type: "text", text: "Today's paper is not available yet." }],
        isError: true,
      };
    }

    return { content: [{ type: "text", text }] };
  },
});

/** n8n may return raw text or JSON like { content }, { text }, or [{ content }]. */
function extractContent(body: string): string {
  try {
    const parsed: unknown = JSON.parse(body);
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const record = first as Record<string, unknown>;
      for (const key of ["content", "text", "paper", "data", "body"]) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) return value;
      }
    }
    return body;
  } catch {
    return body;
  }
}
