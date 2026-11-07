import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ArrowRight, Bot } from "lucide-react";
import { CopyableValue, useMcpUrl } from "@/components/McpLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/done")({
  head: () => ({
    meta: [
      { title: "You're all set — blew by setupr" },
      {
        name: "description",
        content: "Setup is complete. Return to your AI client and ask it to draft a post.",
      },
      { property: "og:title", content: "You're all set — blew by setupr" },
      { property: "og:description", content: "Return to your AI client to begin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Done,
});

function Done() {
  const mcpUrl = useMcpUrl();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto flex w-full max-w-lg flex-col justify-center px-6 py-16 sm:py-24">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-xs mb-6">
          <Check className="size-5" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          You're all set. Return to your AI to begin.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your social accounts are connected. Try asking your AI client:
        </p>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 text-xs font-mono text-foreground leading-relaxed">
          <span className="text-primary font-bold">Prompt: </span>
          "Draft an insightful LinkedIn and X post about what matters in my industry this week, and publish it."
        </div>

        <div className="mt-8">
          <CopyableValue label="Your Personal MCP Server URL" value={mcpUrl} />
          <p className="mt-2 text-xs text-muted-foreground">
            If you haven't added this link to your AI yet, paste it into ChatGPT (Developer mode connector) or Claude Desktop settings.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between text-xs">
          <Link
            to="/setup"
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Manage social accounts
          </Link>
          <Link
            to="/upgrade"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline underline-offset-4 transition-colors"
          >
            <Sparkles className="size-3.5" />
            Check Quota & Top Up &rarr;
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
