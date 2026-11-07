import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/callback/linkedin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        if (error) {
          console.error("LinkedIn OAuth error:", error, errorDescription);
          return new Response(null, {
            status: 302,
            headers: {
              Location: `/setup?error=${encodeURIComponent(errorDescription || error)}`,
            },
          });
        }

        if (!code || !state) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/setup?error=missing_code_or_state",
            },
          });
        }

        try {
          const { handleLinkedInCallback } = await import("@/lib/oauth.server");
          const handle = await handleLinkedInCallback(code, state);
          return new Response(null, {
            status: 302,
            headers: {
              Location: `/setup?connected=linkedin&handle=${encodeURIComponent(handle)}`,
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Authentication failed";
          console.error("LinkedIn callback processing error:", message);
          return new Response(null, {
            status: 302,
            headers: {
              Location: `/setup?error=${encodeURIComponent(message)}`,
            },
          });
        }
      },
    },
  },
});
