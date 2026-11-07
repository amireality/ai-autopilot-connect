import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

type OAuthResult = {
  redirect_url?: string;
  redirect_to?: string;
  client?: { name?: string; client_id?: string; redirect_uris?: string[] } | null;
  scope?: string;
  scopes?: string[];
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: OAuthResult | null; error: Error | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: Error | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: Error | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search["authorization_id"] === "string" ? search["authorization_id"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Authorize your AI client — blew by setupr" },
      {
        name: "description",
        content: "Approve or deny access for the AI client requesting your blew by setupr account.",
      },
      { property: "og:title", content: "Authorize your AI client — blew by setupr" },
      { property: "og:description", content: "Approve or deny an AI client's access request." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: { next: location.pathname + location.searchStr },
      });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-destructive/40 bg-card p-7 text-center">
        <h1 className="text-lg font-semibold text-destructive">Authorization failed</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </main>
  ),
  component: Consent,
});

function Consent() {
  const { authorization_id: authorizationId } = Route.useSearch();
  const data = Route.useLoaderData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = data?.client?.name ?? "An AI client";
  const redirectUri = data?.client?.redirect_uris?.[0];
  const scopes = data?.scopes ?? (data?.scope ? [data.scope] : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data: result, error: decisionError } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);

    if (decisionError) {
      setError(decisionError.message);
      setBusy(false);
      return;
    }

    const target = result?.redirect_url ?? result?.redirect_to;
    if (!target) {
      setError("No redirect destination returned.");
      setBusy(false);
      return;
    }

    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 bg-background text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-md">
        <Logo size="md" />

        <h1 className="mt-6 text-xl font-bold tracking-tight">
          Connect {clientName} to your account
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {clientName} will be able to queue posts to your connected X and LinkedIn
          accounts while you are signed in.
        </p>

        <dl className="mt-6 space-y-3 border-t border-border pt-5 text-xs">
          {redirectUri ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Redirects to</dt>
              <dd className="truncate font-mono text-[11px] text-foreground">{redirectUri}</dd>
            </div>
          ) : null}
          {scopes.length ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Permissions</dt>
              <dd className="text-right font-medium text-foreground">{scopes.join(", ")}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-5 text-[11px] text-muted-foreground">
          Your credentials and tokens remain strictly isolated. {clientName} only ever accesses your personal posting queue.
        </p>

        {error ? (
          <p role="alert" className="mt-4 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex gap-3">
          <Button className="flex-1 text-xs font-semibold" disabled={busy} onClick={() => decide(true)}>
            {busy ? "Authorizing..." : "Approve Connection"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-xs"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </main>
  );
}
