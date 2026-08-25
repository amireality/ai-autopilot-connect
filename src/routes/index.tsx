import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Send, Terminal } from "lucide-react";
import { CopyableValue, useMcpUrl } from "@/components/McpLink";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "setupr automate — Publish to social from your AI" },
      {
        name: "description",
        content:
          "A zero-UI automation hub. Your AI writes the post, we publish it to X and LinkedIn through one MCP link. No dashboards, no AI bills.",
      },
      { property: "og:title", content: "setupr automate — Publish to social from your AI" },
      {
        property: "og:description",
        content: "One MCP link connects Claude, ChatGPT or Codex to your X and LinkedIn accounts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const mcpUrl = useMcpUrl();
  const claudeCommand = mcpUrl ? `claude mcp add --scope user --transport http setupr-automate '${mcpUrl}'` : "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16 sm:py-24">
      <header className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
        <Terminal className="size-3.5 text-primary" />
        setupr automate
      </header>

      <section className="mt-16 sm:mt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Model Context Protocol
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          Let your AI publish straight to X and LinkedIn.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          One link. Your own AI client writes the post, then ships it to X and LinkedIn. There is no
          dashboard to learn and no AI bill to pay — your assistant does the thinking, we move the
          bytes.
        </p>
      </section>

      <section className="mt-14">
        <CopyableValue label="Universal MCP link" value={mcpUrl} />
        <p className="mt-3 text-xs text-muted-foreground">
          Adding this link signs you in and walks you through connecting your accounts. There is
          nothing to sign up for here.
        </p>
      </section>

      <section className="mt-16">
        <ToolCard
          icon={<Send className="size-4 text-primary" />}
          name="publish_to_social"
          body="Queues any finished draft to X or LinkedIn and hands it to our publisher immediately."
        />
      </section>


      <section className="mt-20">
        <h2 className="text-lg font-semibold tracking-tight">Add it to your client</h2>
        <div className="mt-6 space-y-8">
          <Step n="01" title="Claude Desktop">
            Open Settings → Connectors → Add custom connector. Name it{" "}
            <span className="text-foreground">setupr automate</span> and paste the link above.
          </Step>
          <Step n="02" title="ChatGPT">
            Settings → Connectors → Advanced → Developer mode, then create a new connector and paste
            the link above.
          </Step>
          <Step n="03" title="Claude Code">
            Run this once in a terminal, then start Claude Code and check <code>/mcp</code>.
            <CopyableValue className="mt-3" value={claudeCommand} />
          </Step>
          <Step n="04" title="Any other MCP client">
            Open its MCP or custom connector settings, create a remote server connection, and paste
            the link. Finish the sign-in prompt when it appears.
          </Step>
        </div>
      </section>

      <section className="mt-20 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold tracking-tight">What happens after you connect</h2>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">1</span> Your client asks you to sign
            in and approve access.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">2</span> You connect X and LinkedIn once
            on the setup screen.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">3</span> You go back to your AI and say
            "read today's paper and post about it".
          </li>
        </ol>
        <a
          href="/setup"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          Already connected? Finish setup
          <ArrowRight className="size-4" />
        </a>
      </section>

      <footer className="mt-20 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        setupr automate — bring your own AI
      </footer>
    </main>
  );
}

function ToolCard({
  icon,
  name,
  body,
}: {
  icon: React.ReactNode;
  name: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        {icon}
        <code className="text-xs text-foreground">{name}</code>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <span className="mt-0.5 font-mono text-xs text-primary">{n}</span>
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
