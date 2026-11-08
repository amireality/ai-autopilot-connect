import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ArrowRight, 
  Send, 
  Terminal, 
  Check, 
  Sparkles, 
  Zap, 
  Linkedin, 
  X as XIcon, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  Laptop,
  Bot
} from "lucide-react";
import { useState } from "react";
import { CopyableValue, useMcpUrl } from "@/components/McpLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "blew by setupr — Zero-Dashboard Social Autopilot for AI" },
      {
        name: "description",
        content:
          "The zero-dashboard social autopilot for AI. Connect ChatGPT, Claude, and Codex directly to X and LinkedIn from regular chat through one MCP link.",
      },
      { property: "og:title", content: "blew by setupr — Zero-Dashboard Social Autopilot" },
      {
        property: "og:description",
        content: "Zero dashboard. Bring your own AI. Publish directly to X and LinkedIn from your regular chat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const mcpUrl = useMcpUrl();
  const claudeCommand = mcpUrl ? `claude mcp add --scope user --transport http blew '${mcpUrl}'` : "";
  const [activeTab, setActiveTab] = useState<"chatgpt" | "claude" | "claudecode" | "other">("chatgpt");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent pointer-events-none" />

          <div className="mx-auto max-w-5xl px-6 text-center">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs text-primary shadow-xs mb-8">
              <Sparkles className="size-3.5" />
              <span>Zero-Dashboard Social Autopilot • Powered by Model Context Protocol (MCP)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
              Your AI writes the thoughts. <br className="hidden sm:inline" />
              <span className="text-primary">blew</span> publishes them to X & LinkedIn.
            </h1>

            {/* Subhead */}
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              <strong className="text-foreground">Zero dashboard. Zero tab-switching.</strong> Bring your own AI (ChatGPT, Claude, or Codex). It drafts, you approve, and Blew publishes directly to your personal X and LinkedIn profiles straight from your regular chat conversations.
            </p>

            {/* Hero CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" search={{ next: "/setup" }}>
                <Button size="lg" className="w-full sm:w-auto h-12 px-7 text-sm font-medium gap-2 shadow-sm">
                  Get Started Free (5 Free Posts)
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/upgrade">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 text-sm">
                  View Subscription Plans
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500" /> Zero dashboard — lives in your chat
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500" /> Bring your own AI (ChatGPT, Claude, Codex)
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500" /> Official OAuth 2.0 verified
              </span>
            </div>

            {/* Interactive Mockup Preview */}
            <div className="mt-14 max-w-3xl mx-auto text-left rounded-2xl border border-border/80 bg-card/90 shadow-xl overflow-hidden backdrop-blur-xs">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-xs text-muted-foreground">ChatGPT with blew MCP</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> connected
                </div>
              </div>

              <div className="p-6 space-y-4 text-sm font-sans">
                {/* User Message */}
                <div className="flex gap-3">
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                    You
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3.5 max-w-xl text-foreground">
                    "Draft an insightful post analyzing why local AI models are trending, and publish it to my <strong>X</strong> and <strong>LinkedIn</strong> with our infographic image."
                  </div>
                </div>

                {/* AI Assistant Tool Execution */}
                <div className="flex gap-3">
                  <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                    AI
                  </div>
                  <div className="space-y-3 max-w-xl w-full">
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-primary font-semibold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="size-3.5" /> Calling tool: publish_to_social
                        </span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Quota Valid (4 posts left)
                        </span>
                      </div>
                      <div className="text-muted-foreground text-[11px] space-y-0.5">
                        <div>platforms: ["x", "linkedin"]</div>
                        <div>content: "Why local models are taking over enterprise workflows..."</div>
                        <div>image_url: "https://blew.setupr.com/assets/chart.png"</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="size-4 shrink-0" />
                      Queued and published directly to your X and LinkedIn feeds!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ================= TWO WAYS TO GET STARTED ================= */}
        <section id="two-ways" className="py-20 md:py-28 border-b border-border/40 bg-muted/10">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3 px-3 py-1 text-xs text-primary border-primary/20 bg-primary/5">
                Simple Setup
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Two ways to connect. Pick what fits your flow.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Whether you like configuring your accounts on our dashboard first or starting directly inside your AI client, blew works both ways seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Option 1: Web First (Recommended) */}
              <Card className="flex flex-col justify-between border-primary/40 shadow-sm relative overflow-hidden bg-card">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                      Option A • Recommended
                    </span>
                    <Badge variant="secondary" className="text-[10px]">Fastest Setup</Badge>
                  </div>
                  <CardTitle className="text-xl mt-2">Connect on Web First</CardTitle>
                  <CardDescription>
                    Configure your social profiles on our website, then grab your authenticated link.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                      1
                    </span>
                    <div>
                      <strong className="text-foreground">Log into blew:</strong> Sign up in 10 seconds to activate your 5 free posts.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                      2
                    </span>
                    <div>
                      <strong className="text-foreground">Authorize X & LinkedIn:</strong> Click "Connect" on your dashboard with 1-click OAuth.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                      3
                    </span>
                    <div>
                      <strong className="text-foreground">Add MCP Link to your AI:</strong> Paste your link into ChatGPT or Claude. Everything is pre-authorized!
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-2 border-t border-border/40">
                  <Link to="/login" search={{ next: "/setup" }}>
                    <Button className="w-full text-xs font-medium gap-1.5">
                      Start Web Setup (Connect Accounts)
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Option 2: AI First */}
              <Card className="flex flex-col justify-between border-border bg-card shadow-sm">
                <CardHeader>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Option B • In-Chat Setup
                  </span>
                  <CardTitle className="text-xl mt-2">Connect Inside Your AI Client</CardTitle>
                  <CardDescription>
                    Add the universal MCP server directly into ChatGPT or Claude first.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-mono text-xs font-bold">
                      1
                    </span>
                    <div>
                      <strong className="text-foreground">Paste Universal MCP URL:</strong> Add the link below to your AI client's connector settings.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-mono text-xs font-bold">
                      2
                    </span>
                    <div>
                      <strong className="text-foreground">Complete Sign-In:</strong> When prompted by your AI, approve the one-time authentication window.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-mono text-xs font-bold">
                      3
                    </span>
                    <div>
                      <strong className="text-foreground">Connect Accounts & Post:</strong> Link X and LinkedIn, then return to chat to start publishing.
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <CopyableValue label="Universal MCP Server URL" value={mcpUrl} />
                  </div>
                </CardContent>
                <div className="p-6 pt-2 border-t border-border/40">
                  <a href="#platforms">
                    <Button variant="outline" className="w-full text-xs font-medium gap-1.5">
                      View Client Instructions
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>


        {/* ================= HOW IT WORKS / ARCHITECTURE ================= */}
        <section id="how-it-works" className="py-20 md:py-28 border-b border-border/40">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3 px-3 py-1 text-xs text-primary border-primary/20 bg-primary/5">
                Architecture & Privacy
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Built for enterprise-grade privacy and speed</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Your AI creates the content. blew handles the heavy lifting, rate limits, and platform APIs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-base">Your Own Social Identity</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Each user authorizes their personal or corporate handle via official OAuth 2.0. No developer accounts or API keys needed.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Send className="size-5" />
                </div>
                <h3 className="font-semibold text-base">Rich Media & Text Support</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Publish full-length LinkedIn posts, X threads, and high-resolution attached images effortlessly from conversation.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Zap className="size-5" />
                </div>
                <h3 className="font-semibold text-base">Automatic Quota Management</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Enjoy 5 free posts right away. Upgrade to 50 or 200 posts per month anytime with seamless Razorpay recurring billing.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ================= CLIENT CONFIGURATION GUIDE ================= */}
        <section id="platforms" className="py-20 md:py-28 border-b border-border/40 bg-muted/10">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <Badge variant="outline" className="mb-3 px-3 py-1 text-xs text-primary border-primary/20 bg-primary/5">
                Client Compatibility
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Works with any MCP-enabled AI</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Follow the 30-second setup for your favorite conversational assistant.
              </p>
            </div>

            {/* Client Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <Button
                variant={activeTab === "chatgpt" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab("chatgpt")}
              >
                ChatGPT
              </Button>
              <Button
                variant={activeTab === "claude" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab("claude")}
              >
                Claude Desktop
              </Button>
              <Button
                variant={activeTab === "claudecode" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab("claudecode")}
              >
                Claude Code (CLI)
              </Button>
              <Button
                variant={activeTab === "other" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab("other")}
              >
                Other MCP Clients
              </Button>
            </div>

            {/* Tab Contents */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              {activeTab === "chatgpt" && (
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Bot className="size-4 text-primary" /> Setup in ChatGPT:
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <li>Go to ChatGPT <strong>Settings</strong> $\rightarrow$ <strong>Connectors</strong> $\rightarrow$ <strong>Developer mode</strong>.</li>
                    <li>Click <strong>Create new connector</strong> and name it <strong>blew by setupr</strong>.</li>
                    <li>Paste the Universal MCP Server URL below.</li>
                    <li>When prompted during your first query, click the login link to authorize.</li>
                  </ol>
                  <CopyableValue className="mt-4" label="Server URL" value={mcpUrl} />
                </div>
              )}

              {activeTab === "claude" && (
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Laptop className="size-4 text-primary" /> Setup in Claude Desktop:
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <li>Open Claude Desktop $\rightarrow$ <strong>Settings</strong> $\rightarrow$ <strong>Connectors</strong>.</li>
                    <li>Click <strong>Add custom connector</strong>.</li>
                    <li>Name it <strong>blew</strong> and paste the server link below.</li>
                    <li>Complete the one-time sign in when prompted.</li>
                  </ol>
                  <CopyableValue className="mt-4" label="Server URL" value={mcpUrl} />
                </div>
              )}

              {activeTab === "claudecode" && (
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Terminal className="size-4 text-primary" /> Setup in Claude Code (Terminal):
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Run this single command in your terminal to register blew with Claude Code:
                  </p>
                  <CopyableValue className="mt-2" label="Terminal Command" value={claudeCommand} />
                </div>
              )}

              {activeTab === "other" && (
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Layers className="size-4 text-primary" /> Any Remote MCP Client:
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    blew follows standard Model Context Protocol (MCP) HTTP/SSE specifications. In your client's remote server configuration, paste the URL below as a remote HTTP transport endpoint.
                  </p>
                  <CopyableValue className="mt-4" label="Remote Endpoint" value={mcpUrl} />
                </div>
              )}
            </div>
          </div>
        </section>


        {/* ================= PRICING OVERVIEW ================= */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs text-primary border-primary/20 bg-primary/5">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Fair pricing for creators and brands</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
              Every plan includes official X and LinkedIn publishing, image uploads, and priority queue dispatch.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              {/* Free Starter */}
              <Card className="flex flex-col justify-between border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Starter</CardTitle>
                  <CardDescription>Test out the AI automation</CardDescription>
                  <div className="mt-4 text-2xl font-bold">Free</div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> 5 free AI posts</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> X and LinkedIn publishing</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Image attachment support</div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link to="/login" search={{ next: "/setup" }}>
                    <Button variant="outline" className="w-full text-xs">Get Started Free</Button>
                  </Link>
                </div>
              </Card>

              {/* Creator */}
              <Card className="flex flex-col justify-between border-primary/40 bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Creator</CardTitle>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Monthly</Badge>
                  </div>
                  <CardDescription>For active creators & founders</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">₹499</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground"><Check className="size-3.5 text-emerald-500" /> 50 AI posts per month</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Both X & LinkedIn connected</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Image and media processing</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Standard queue priority</div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link to="/upgrade">
                    <Button className="w-full text-xs font-medium">Subscribe Creator</Button>
                  </Link>
                </div>
              </Card>

              {/* Pro */}
              <Card className="flex flex-col justify-between border-primary bg-gradient-to-b from-primary/[0.04] to-card shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-bl">
                  Popular
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pro</CardTitle>
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <CardDescription>For power creators and teams</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">₹1,499</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground"><Check className="size-3.5 text-emerald-500" /> 200 AI posts per month</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Both X & LinkedIn connected</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Priority queue execution</div>
                  <div className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Cancel or pause anytime</div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link to="/upgrade">
                    <Button className="w-full text-xs font-medium shadow-xs">Subscribe Pro</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>


        {/* ================= FINAL CTA ================= */}
        <section className="py-16 md:py-24 border-t border-border/40 bg-muted/20">
          <div className="mx-auto max-w-3xl px-6 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to give your AI real publishing power?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Join founders and creators saving hours each week with automated thought leadership.
            </p>
            <div className="pt-2">
              <Link to="/login" search={{ next: "/setup" }}>
                <Button size="lg" className="h-11 px-7 text-xs font-medium gap-2">
                  Connect Your Accounts Now
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
