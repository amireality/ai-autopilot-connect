import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, Lock, EyeOff, Key, Database, RefreshCw, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — blew by setupr" },
      {
        name: "description",
        content: "Privacy Policy for blew by setupr. Learn how we handle OAuth tokens, respect your privacy, and enforce zero prompt retention.",
      },
      { property: "og:title", content: "Privacy Policy — blew by setupr" },
      { property: "og:description", content: "Zero prompt retention, encrypted OAuth tokens, and transparent social media publishing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  const lastUpdated = "November 8, 2026";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="mb-10 space-y-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft className="size-3.5" /> Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-mono">
              <Shield className="size-3.5" />
              <span>Official Policy • Effective Date: {lastUpdated}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              blew by setupr ("Blew", "we", "us", or "our") is built on a single core principle: <strong>Zero dashboard, zero prompt retention, and complete user ownership.</strong> This policy explains what minimal data we collect and how it is secured.
            </p>
          </div>

          {/* Key Privacy Highlights Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <EyeOff className="size-4" />
              </div>
              <h2 className="text-sm font-semibold mb-1">Zero Prompt Retention</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your AI chat prompts, thoughts, and conversations remain in your AI client. We never see or store your conversations.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <Lock className="size-4" />
              </div>
              <h2 className="text-sm font-semibold mb-1">Encrypted OAuth Vault</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tokens for X and LinkedIn are encrypted at rest with AES-256. We never see, store, or ask for your social passwords.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs">
              <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 mb-3">
                <RefreshCw className="size-4" />
              </div>
              <h2 className="text-sm font-semibold mb-1">1-Click Instant Revocation</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Disconnect your social profiles at any time in one click via your Setup portal to immediately purge stored tokens.
              </p>
            </div>
          </div>

          {/* Legal Document Body */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-muted-foreground">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Who We Are</h2>
              <p>
                <strong>blew by setupr</strong> is an AI-native Model Context Protocol (MCP) server operated by Setupr. Blew enables users of modern AI clients—including ChatGPT, Claude, Codex, Cursor, and Windsurf—to publish high-impact thought leadership and content directly to X (formerly Twitter) and LinkedIn from regular conversational chats.
              </p>
              <p>
                For any privacy questions or requests, you can contact our privacy officer directly at <a href="mailto:legal@setupr.com" className="text-primary hover:underline">legal@setupr.com</a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
              <p>We collect only the bare minimum technical data required to securely route your authorized posts to social networks:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-foreground">Authentication Details:</strong> Your email address and unique account identifier provided during Google Sign-In or email signup via Supabase Auth.
                </li>
                <li>
                  <strong className="text-foreground">OAuth 2.0 Credentials:</strong> When you connect X or LinkedIn in your setup dashboard, we receive an authorized access token and refresh token granted by the respective platform through official OAuth 2.0 PKCE / OIDC protocols.
                </li>
                <li>
                  <strong className="text-foreground">Public Handle & Profile Identifiers:</strong> Your public username (e.g., <code>@username</code> on X) and LinkedIn profile ID/vanity name so you can verify connected profiles in your setup view.
                </li>
                <li>
                  <strong className="text-foreground">Publishing Activity & Quotas:</strong> Timestamps of posts published via the MCP tool, post status (published or failed), and your remaining post quota balance.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. What We Never Collect or Store</h2>
              <p>Unlike traditional social media dashboards or monitoring platforms, Blew adheres to strict privacy isolation:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-foreground">No Account Passwords:</strong> We never handle or store your X or LinkedIn passwords.</li>
                <li><strong className="text-foreground">No Chat Transcripts or Prompts:</strong> Your prompts, personal notes, brainstorming sessions, and model chain-of-thought stay strictly inside your AI interface. Blew only receives the final string you explicitly approve to post.</li>
                <li><strong className="text-foreground">No Direct Messages (DMs):</strong> We do not request, read, or process private direct messages.</li>
                <li><strong className="text-foreground">No Timeline or Feed Crawling:</strong> We do not read or scrape your personal timelines, followers' feeds, or reading history.</li>
                <li><strong className="text-foreground">No Payment Card Numbers:</strong> All billing and top-up orders are processed by Razorpay. Blew never sees or stores full credit card numbers or banking passwords.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. How Your Data Is Used</h2>
              <p>We use the data collected strictly for the following operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Authenticating MCP requests using your personal Bearer token or authenticated user session.</li>
                <li>Validating that your account has an active post quota before submitting content.</li>
                <li>Passing the approved post text and media payload to our secure background dispatch engine to publish on your authorized X or LinkedIn account.</li>
                <li>Providing account management features, quota top-ups, and customer support.</li>
              </ul>
              <p className="font-semibold text-foreground">
                We do not sell, rent, monetize, or trade your personal information or connected account tokens to any third parties, data aggregators, or advertising networks.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Third-Party Platforms & APIs</h2>
              <p>When you use Blew to publish content, your data is processed in accordance with the policies of the connected platforms:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-foreground">X (Twitter) API v2:</strong> By connecting your X account, you also agree to <a href="https://twitter.com/tos" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">X Terms of Service</a> and <a href="https://twitter.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">X Privacy Policy</a>.
                </li>
                <li>
                  <strong className="text-foreground">LinkedIn API:</strong> By connecting your LinkedIn account, you also agree to the <a href="https://www.linkedin.com/legal/user-agreement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn User Agreement</a> and <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn Privacy Policy</a>.
                </li>
                <li>
                  <strong className="text-foreground">AI Clients (OpenAI ChatGPT, Anthropic Claude):</strong> The Model Context Protocol establishes an encrypted channel between your client and our MCP server. Data handling inside your chat session is governed by OpenAI's or Anthropic's respective terms.
                </li>
                <li>
                  <strong className="text-foreground">Supabase & Cloud Infrastructure:</strong> Database and authentication services are hosted on ISO 27001 / SOC 2 compliant infrastructure with encrypted database storage.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">6. Data Security & Retention</h2>
              <p>
                We implement strong administrative, technical, and physical safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All network communications are strictly encrypted using TLS 1.3 in transit.</li>
                <li>OAuth refresh and access tokens are secured at rest with AES-256 encryption.</li>
                <li>Post execution logs are retained for up to 90 days for debugging and audit purposes, after which they are automatically pruned.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">7. User Rights and Token Revocation</h2>
              <p>
                You retain complete sovereignty over your data and linked accounts:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-foreground">Instant Disconnect:</strong> You can disconnect your X or LinkedIn profile at any moment by visiting <Link to="/setup" className="text-primary hover:underline">https://blew.setupr.com/setup</Link> and clicking "Disconnect". This deletes the active tokens from our database immediately.</li>
                <li><strong className="text-foreground">Third-Party Revocation:</strong> You can revoke Blew's access directly from your <a href="https://twitter.com/settings/connected_apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">X Connected Apps Settings</a> or <a href="https://www.linkedin.com/psettings/permitted-services" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn Permitted Services Settings</a>.</li>
                <li><strong className="text-foreground">Account Deletion:</strong> To completely delete your account and all associated records, email us at <a href="mailto:legal@setupr.com" className="text-primary hover:underline">legal@setupr.com</a> with the subject "Data Deletion Request".</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">8. Changes to this Policy</h2>
              <p>
                We may periodically update this Privacy Policy to reflect improvements to our MCP server or changes in regulatory standards. If we make material modifications, we will update the "Effective Date" at the top of this page.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-border">
              <h2 className="text-lg font-bold text-foreground">9. Contact & Support</h2>
              <p>
                If you have questions about this Privacy Policy or our security practices:
              </p>
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-1 text-xs font-mono">
                <div><strong>Email:</strong> legal@setupr.com / support@setupr.com</div>
                <div><strong>Product:</strong> blew by setupr</div>
                <div><strong>URL:</strong> https://blew.setupr.com</div>
                <div><strong>Parent Entity:</strong> Setupr</div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
