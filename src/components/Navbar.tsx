import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Terminal, Sparkles, User, LogOut, Shield, Menu, X as CloseIcon, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser({ email: data.user.email, id: data.user.id });
      } else {
        setUser(null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email, id: session.user.id });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <Terminal className="size-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-lg tracking-tight text-foreground">blew</span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-border/80">
              by setupr
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#two-ways" className="hover:text-foreground transition-colors">
            Setup Options
          </a>
          <a href="#platforms" className="hover:text-foreground transition-colors">
            AI Clients
          </a>
          <Link to="/upgrade" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Right CTA / Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/setup">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Connected Accounts
                </Button>
              </Link>
              <Link to="/upgrade">
                <Button size="sm" className="text-xs h-8 gap-1.5">
                  <Sparkles className="size-3.5" />
                  Quota & Plans
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" search={{ next: "/setup" }}>
                <Button variant="ghost" size="sm" className="text-xs font-medium">
                  Sign in
                </Button>
              </Link>
              <Link to="/login" search={{ next: "/setup" }}>
                <Button size="sm" className="text-xs gap-1.5 shadow-xs">
                  Get Started Free
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <CloseIcon className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <a
              href="#how-it-works"
              className="py-1 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#two-ways"
              className="py-1 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Setup Options
            </a>
            <Link
              to="/upgrade"
              className="py-1 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing & Quota
            </Link>
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/setup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Connected Accounts
                  </Button>
                </Link>
                <Link to="/upgrade" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full text-xs gap-1.5">
                    <Sparkles className="size-3.5" /> Quota & Plans
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-destructive justify-center"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="size-3.5 mr-1.5" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" search={{ next: "/setup" }} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login" search={{ next: "/setup" }} onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full text-xs">
                    Get Started Free (5 Free Posts)
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
