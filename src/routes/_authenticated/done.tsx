import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Terminal } from "lucide-react";
import { CopyableValue, useMcpUrl } from "@/components/McpLink";

export const Route = createFileRoute("/_authenticated/done")({
  head: () => ({
    meta: [
      { title: "You're all set — setupr automate" },
      {
        name: "description",
        content: "Setup is complete. Return to your AI client and ask it to read today's paper.",
      },
      { property: "og:title", content: "You're all set — setupr automate" },
      { property: "og:description", content: "Return to your AI client to begin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Done,
});

function Done() {
  const mcpUrl = useMcpUrl();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
        <Terminal className="size-3.5 text-primary" />
        setupr automate
      </div>

      <div className="mt-10 inline-flex size-9 items-center justify-center rounded-full bg-primary/15">
        <Check className="size-4 text-primary" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        You're all set. Return to your AI to begin.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Try asking it: <span className="text-foreground">"Read today's paper and draft a LinkedIn
        post about what matters in my niche."</span> Or skip the paper entirely and ask it to publish
        something you wrote together.
      </p>

      <CopyableValue className="mt-10" label="Your MCP link" value={mcpUrl} />

      <Link
        to="/setup"
        className="mt-8 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Manage connected accounts
      </Link>
    </main>
  );
}
