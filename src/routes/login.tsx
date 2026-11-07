import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Terminal, ArrowLeft, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: returnUrl });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    window.location.href = returnUrl;
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

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="size-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-lg tracking-tight">blew</span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-border">
              by setupr
            </span>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in to your account" : "Create your account"}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage your connected accounts, quotas, and MCP connector."
            : "Get started with 5 free posts. Connect your social accounts in 30 seconds."}
        </p>

        <Button type="button" variant="outline" className="mt-8 w-full text-xs font-medium" onClick={google}>
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
              onChange={(e) => setEmail ? setPassword(e.target.value) : undefined}
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
          {message ? <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{message}</p> : null}

          <Button type="submit" className="w-full text-xs font-medium" disabled={busy}>
            {busy ? "Signing in..." : mode === "signin" ? "Sign in" : "Create account & Get 5 Free Posts"}
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
