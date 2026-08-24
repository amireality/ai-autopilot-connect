import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Terminal } from "lucide-react";
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
      { title: "Sign in — setupr automate" },
      {
        name: "description",
        content: "Sign in to authorize your AI client and connect your social accounts.",
      },
      { property: "og:title", content: "Sign in — setupr automate" },
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
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.href = returnUrl;
        return;
      }
      setMessage("Check your inbox to confirm your email, then come back to this link.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    void navigate({ to: next });
    window.location.href = returnUrl;
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
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
          <Terminal className="size-3.5 text-primary" />
          setupr automate
        </div>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in to authorize" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your AI client needs this once. After that everything happens inside your assistant.
        </p>

        <Button type="button" variant="secondary" className="mt-8 w-full" onClick={google}>
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {message ? <p className="text-sm text-primary">{message}</p> : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-6 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
        >
          {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
