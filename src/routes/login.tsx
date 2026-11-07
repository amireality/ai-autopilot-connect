import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

/** Only same-origin relative paths may be used as a post-auth destination. */
function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/setup";
  if (!value.startsWith("/") || value.startsWith("//")) return "/setup";
  return value;
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    next: safeNext(search["next"]),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — blew by setupr" },
      {
        name: "description",
        content: "Sign in to authorize your AI client and connect your social accounts.",
      },
      { property: "og:title", content: "Sign in — blew by setupr" },
      { property: "og:description", content: "Authorize your AI client to publish on your behalf." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = `${typeof window === "undefined" ? "" : window.location.origin}${next}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: returnUrl },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setMessage("Account created! Check your email to confirm, or sign in below.");
      setMode("signin");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    void navigate({ to: next as any });
  }

  async function google() {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: returnUrl,
        },
      });
      if (error) {
        setError(error.message ?? "Google sign-in failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 bg-background text-foreground">
      <div className="w-full max-w-sm">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to blew home
        </Link>

        {/* Brand Logo */}
        <Logo size="lg" />

        <h1 className="mt-8 text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in to your account" : "Create your account"}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage your connected accounts, quotas, and MCP connector."
            : "Get started with 5 free posts. Connect your social accounts in 30 seconds."}
        </p>

        {/* Google OAuth - Direct Supabase Auth */}
        <Button 
          type="button" 
          variant="outline" 
          className="mt-8 w-full text-xs font-medium flex items-center justify-center gap-2.5 h-10" 
          onClick={google}
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@domain.com"
              required
              className="text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              className="text-xs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
          {message ? <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{message}</p> : null}

          <Button type="submit" className="w-full text-xs font-medium" disabled={busy}>
            {busy ? "Working..." : mode === "signin" ? "Sign in" : "Create account & Get 5 Free Posts"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-6 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors text-center w-full"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
        >
          {mode === "signin" ? "Don't have an account yet? Create one" : "Already have an account? Sign in"}
        </button>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          5 free posts automatically credited to every new account.
        </div>
      </div>
    </main>
  );
}
