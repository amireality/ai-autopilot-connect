import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-muted/20 mt-28">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/">
              <Logo size="md" />
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mt-2">
              The zero-dashboard social media autopilot for modern AI agents. Publish high-impact thought leadership straight from ChatGPT, Claude, and Codex to X and LinkedIn.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
              Product
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/setup" className="hover:text-foreground transition-colors">
                  Connect Social Accounts
                </Link>
              </li>
              <li>
                <Link to="/upgrade" className="hover:text-foreground transition-colors">
                  Pricing & Subscriptions
                </Link>
              </li>
              <li>
                <a href="/#two-ways" className="hover:text-foreground transition-colors">
                  Setup Methods
                </a>
              </li>
              <li>
                <a href="/#platforms" className="hover:text-foreground transition-colors">
                  Supported AI Clients
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Company links */}
          <div className="space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
              Platform & Trust
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a href="https://setupr.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Built by Setupr
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Shield className="size-3.5" /> Official OAuth 2.0 Verified
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} blew by setupr. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            Zero friction, bring your own AI.
          </div>
        </div>
      </div>
    </footer>
  );
}
