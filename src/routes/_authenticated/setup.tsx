import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Linkedin, Terminal, X as XIcon, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  listSocialConnections,
  removeSocialConnection,
  getSocialConnectUrl,
  type SocialPlatform,
} from "@/lib/social.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({
    meta: [
      { title: "Connect your accounts — blew by setupr" },
      {
        name: "description",
        content: "Connect X and LinkedIn once so your AI can publish posts on your behalf.",
      },
      { property: "og:title", content: "Connect your accounts — blew by setupr" },
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
  const getConnectUrl = useServerFn(getSocialConnectUrl);
  const disconnect = useServerFn(removeSocialConnection);

  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

  // Check URL params for success/error alerts
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const connectedParam = urlParams?.get("connected");
  const errorParam = urlParams?.get("error");
  const handleParam = urlParams?.get("handle");

  const { data: connections = [], isPending } = useQuery({
    queryKey: ["social-connections"],
    queryFn: () => fetchConnections(),
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: SocialPlatform) => disconnect({ data: { platform } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-connections"] }),
  });

  const handleConnect = async (platform: SocialPlatform) => {
    try {
      setConnectingPlatform(platform);
      const res = await getConnectUrl({ data: { platform } });
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error("Failed to start OAuth:", err);
      alert(err instanceof Error ? err.message : "Failed to initiate login. Please check that client credentials are set in environment variables.");
      setConnectingPlatform(null);
    }
  };

  const connectedCount = connections.filter((c) => c.status === "connected").length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-16 sm:py-24">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
        <Terminal className="size-3.5 text-primary" />
        blew by setupr
      </div>

      <h1 className="mt-10 text-2xl font-semibold tracking-tight">Connect your social accounts</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Connect your personal or brand X and LinkedIn profiles. Once connected, your AI autopilot will publish directly to your feed.
      </p>

      {/* Success Notification */}
      {connectedParam ? (
        <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="size-4 shrink-0" />
          <span>
            Successfully connected {connectedParam.toUpperCase()}{" "}
            {handleParam ? <strong>({decodeURIComponent(handleParam)})</strong> : ""}!
          </span>
        </div>
      ) : null}

      {/* Error Notification */}
      {errorParam ? (
        <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>Failed to connect: {decodeURIComponent(errorParam)}</span>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        {PLATFORMS.map((platform) => {
          const conn = connections.find((c) => c.platform === platform.id);
          const isConnected = conn?.status === "connected";
          const isLoading = connectingPlatform === platform.id || disconnectMutation.isPending;

          return (
            <div
              key={platform.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{platform.icon}</span>
                <div>
                  <div className="text-sm font-medium">{platform.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {isConnected ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Connected as {conn.account_handle || "Account"}
                      </span>
                    ) : (
                      "Not connected"
                    )}
                  </div>
                </div>
              </div>

              {isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  disabled={isLoading || isPending}
                  onClick={() => disconnectMutation.mutate(platform.id)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  disabled={isLoading || isPending}
                  onClick={() => handleConnect(platform.id)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Connecting...
                    </>
                  ) : (
                    `Connect ${platform.label}`
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Button
        className="mt-10"
        disabled={connectedCount === 0}
        onClick={() => void navigate({ to: "/done" })}
      >
        Finish setup
        <ArrowRight className="size-4 ml-1.5" />
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        Connect at least one platform to start. You can manage or switch accounts anytime.
      </p>
    </main>
  );
}
