import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Linkedin, Terminal, X as XIcon } from "lucide-react";
import {
  listSocialConnections,
  removeSocialConnection,
  upsertSocialConnection,
  type SocialPlatform,
} from "@/lib/social.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({
    meta: [
      { title: "Connect your accounts — setupr automate" },
      {
        name: "description",
        content: "Connect X and LinkedIn once so your AI can publish posts on your behalf.",
      },
      { property: "og:title", content: "Connect your accounts — setupr automate" },
      {
        property: "og:description",
        content: "One-time setup: connect X and LinkedIn, then return to your AI.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Setup,
});

const PLATFORMS: { id: SocialPlatform; label: string; icon: React.ReactNode }[] = [
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="size-4" /> },
  { id: "x", label: "X (Twitter)", icon: <XIcon className="size-4" /> },
];

function Setup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchConnections = useServerFn(listSocialConnections);
  const connect = useServerFn(upsertSocialConnection);
  const disconnect = useServerFn(removeSocialConnection);

  const { data: connections = [], isPending } = useQuery({
    queryKey: ["social-connections"],
    queryFn: () => fetchConnections(),
  });

  const mutate = useMutation({
    mutationFn: async ({ platform, connected }: { platform: SocialPlatform; connected: boolean }) =>
      connected ? disconnect({ data: { platform } }) : connect({ data: { platform } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-connections"] }),
  });

  const connectedCount = connections.length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-16 sm:py-24">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
        <Terminal className="size-3.5 text-primary" />
        setupr automate
      </div>

      <h1 className="mt-10 text-2xl font-semibold tracking-tight">Connect your accounts</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This is the only setup step. Once an account is connected, anything your AI queues through{" "}
        <code className="text-foreground">publish_to_social</code> goes out on that platform.
      </p>

      <div className="mt-10 space-y-3">
        {PLATFORMS.map((platform) => {
          const connected = connections.some((c) => c.platform === platform.id);
          return (
            <div
              key={platform.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{platform.icon}</span>
                <div>
                  <div className="text-sm font-medium">{platform.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {connected ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              <Button
                variant={connected ? "secondary" : "default"}
                size="sm"
                disabled={isPending || mutate.isPending}
                onClick={() => mutate.mutate({ platform: platform.id, connected })}
              >
                {connected ? (
                  <>
                    <Check className="size-3.5 text-primary" /> Connected
                  </>
                ) : (
                  `Connect ${platform.label}`
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {mutate.isError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {(mutate.error as Error).message}
        </p>
      ) : null}

      <Button
        className="mt-10"
        disabled={connectedCount === 0}
        onClick={() => void navigate({ to: "/done" })}
      >
        Finish setup
        <ArrowRight className="size-4" />
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        Connect at least one platform to finish. You can come back to this page any time.
      </p>
    </main>
  );
}
