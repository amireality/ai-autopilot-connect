import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/openai-apps-challenge")({
  server: {
    handlers: {
      GET: async () => {
        return new Response("ASrxowjyEd2MTiYu67NmRfJfBL7S_L3dQx3f6kTSdLc", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      },
    },
  },
});
