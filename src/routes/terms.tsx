import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Scale, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — blew by setupr" },
      {
        name: "description",
        content: "Terms of Service for blew by setupr. Read our terms regarding fair use, quotas, subscriptions, and AI publishing responsibility.",
      },
      { property: "og:title", content: "Terms of Service — blew by setupr" },
      { property: "og:description", content: "Terms and conditions governing the use of the blew by setupr MCP server." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
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
              <Scale className="size-3.5" />
              <span>Terms of Service • Effective Date: {lastUpdated}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              Please review these Terms of Service carefully before connecting your social media accounts or invoking the <strong>blew by setupr</strong> MCP server from your AI client.
            </p>
          </div>

          {/* Key Terms Highlights Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <CheckCircle2 className="size-4" />
              </div>
              <h2 className="text-sm font-semibold mb-1">Content Responsibility</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You retain complete ownership and full legal responsibility for all content your AI drafts and submits through Blew.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs">
              <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                <AlertCircle className="size-4" />
              </div>
              <h2 className="text-sm font-semibold mb-1">Zero Spam Tolerance</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated spam, abuse, harassment, or violative bulk-posting in contravention of X or LinkedIn terms is strictly prohibited.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <Scale className="size-4" />
              </div>
              <h2 className="text-sm font-semibold mb-1">Non-Expiring Top-Ups</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paid post credit packs never expire. Use your post credits at your own pace without arbitrary monthly resets.
              </p>
            </div>
          </div>

          {/* Legal Document Body */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-muted-foreground">

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By creating an account, connecting social media accounts, or configuring your AI client (ChatGPT, Claude, Codex, Cursor, etc.) to communicate with <strong>blew by setupr</strong> ("Blew", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms") and our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
              <p>
                If you do not agree to these Terms, do not install or use the Blew MCP server.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Service Description</h2>
              <p>
                Blew is a developer-grade, zero-dashboard Model Context Protocol (MCP) server. It exposes standardized tools—including <code>publish_to_social</code> and <code>check_quota</code>—that allow conversational AI agents to draft, format, and publish posts to personal or brand accounts on X (formerly Twitter) and LinkedIn on the user's behalf.
              </p>
              <p>
                Blew does not provide AI models, prompt engineering, or content generation. Those capabilities are provided solely by your chosen AI client. Blew acts as the authenticated execution pipe to third-party social APIs.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. User Obligations and Acceptable Use</h2>
              <p>
                Because Blew enables direct publishing from conversational AI, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-foreground">Full Content Responsibility:</strong> You are solely responsible for reviewing, vetting, and approving all content generated by your AI prior to authorizing publication. Blew does not pre-screen or censor content.
                </li>
                <li>
                  <strong className="text-foreground">Platform Compliance:</strong> You must comply with all applicable terms, rules, and developer policies of connected platforms, including the <a href="https://twitter.com/tos" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">X Terms of Service</a> and the <a href="https://www.linkedin.com/legal/user-agreement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn User Agreement</a>.
                </li>
                <li>
                  <strong className="text-foreground">Prohibited Activities:</strong> You will NOT use Blew to publish or distribute:
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>Spam, phishing, unsolicited commercial messages, or artificial engagement rings.</li>
                    <li>Defamatory, obscene, harassing, hate speech, or threatening material.</li>
                    <li>Malware, spyware, or deceptive tracking links.</li>
                    <li>Content that infringes any copyright, patent, trademark, or proprietary right.</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. Quotas, Subscriptions, and Payments</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-foreground">Free Starter Quota:</strong> Every newly registered user receives 5 complimentary post credits to test and verify their AI connection.
                </li>
                <li>
                  <strong className="text-foreground">Post Packs & Top-Ups:</strong> Users may purchase additional post credits (e.g., 100 posts for ₹499) via Razorpay. Purchased post credits do not expire and remain associated with your user balance until consumed.
                </li>
                <li>
                  <strong className="text-foreground">Quota Deductions:</strong> One quota credit is deducted each time your AI successfully triggers the <code>publish_to_social</code> tool resulting in an accepted post on the target network. Failed API calls due to platform errors are not charged against your balance.
                </li>
                <li>
                  <strong className="text-foreground">Refund Policy:</strong> Due to the immediate provisioning of infrastructure and social API access, fees paid for post credit packs are non-refundable once credits are partially or wholly consumed. If you experience an unresolved technical error, contact <a href="mailto:support@setupr.com" className="text-primary hover:underline">support@setupr.com</a> for credit adjustment.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Third-Party Platform Dependencies</h2>
              <p>
                Blew relies on APIs provided by third parties, notably X Corp. and LinkedIn Corporation. You acknowledge that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Third-party platform downtime, API rate limiting, policy changes, or algorithmic actions taken on your social account are beyond Blew's direct control.</li>
                <li>We do not guarantee that third parties will maintain perpetual API access, nor do we guarantee specific reach, impressions, or engagement on published posts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">6. Intellectual Property & Ownership</h2>
              <p>
                You retain all rights, title, and intellectual property ownership in and to any posts, media, or copy that you submit through Blew. We claim no ownership over your published posts or personal brand materials.
              </p>
              <p>
                Blew, the Blew logo, setupr, and associated software, documentation, and code are the proprietary intellectual property of Setupr.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">7. Disclaimer of Warranties & Limitation of Liability</h2>
              <p>
                BLEW BY SETUPR IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, SETUPR AND ITS AFFILIATES DISCLAIM ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL SETUPR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, OR BRAND GOODWILL) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO SETUPR IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">8. Termination & Revocation</h2>
              <p>
                You may discontinue use of Blew at any time by disconnecting your social accounts via <Link to="/setup" className="text-primary hover:underline">https://blew.setupr.com/setup</Link>. We reserve the right to suspend or terminate accounts that violate our Acceptable Use Policy or generate malicious traffic.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">9. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts of New Delhi, India.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-border">
              <h2 className="text-lg font-bold text-foreground">10. Contact Us</h2>
              <p>
                For questions concerning these Terms, contact our legal counsel:
              </p>
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-1 text-xs font-mono">
                <div><strong>Email:</strong> legal@setupr.com / support@setupr.com</div>
                <div><strong>Product:</strong> blew by setupr</div>
                <div><strong>Domain:</strong> https://blew.setupr.com</div>
                <div><strong>Entity:</strong> Setupr</div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
