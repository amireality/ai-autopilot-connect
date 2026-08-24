import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
      { title: "Authorize your AI client — setupr automate" },
      {
        name: "description",
        content: "Approve or deny access for the AI client requesting your setupr automate account.",
      },
      { property: "og:title", content: "Authorize your AI client — setupr automate" },
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
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold">Could not load this authorization request</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
  component: Consent,
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "this AI client";
  const redirectUri = details?.client?.redirect_uris?.[0];
  const scopes = details?.scopes ?? (details?.scope ? details.scope.split(" ") : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: decideError } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect was returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-7">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
          <Terminal className="size-3.5 text-primary" />
          setupr automate
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Connect {clientName} to your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName} will be able to read the daily paper and queue posts to your connected social
          accounts while you are signed in.
        </p>

        <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
          {redirectUri ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Redirects to</dt>
              <dd className="truncate font-mono text-xs">{redirectUri}</dd>
            </div>
          ) : null}
          {scopes.length ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shares</dt>
              <dd className="text-right text-xs">{scopes.join(", ")}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-5 text-xs text-muted-foreground">
          This does not bypass this app's permissions — the client only ever sees your own data.
        </p>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex gap-3">
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? "Working…" : "Approve"}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancel connection
          </Button>
        </div>
      </div>
    </main>
  );
}
