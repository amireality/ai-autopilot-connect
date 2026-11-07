import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Linkedin, X as XIcon, Loader2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  listSocialConnections,
  removeSocialConnection,
  getSocialConnectUrl,
  type SocialPlatform,
} from "@/lib/social.functions";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto flex w-full max-w-xl flex-col px-6 py-12 md:py-20">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary bg-primary/5">
            Step 1 of 2 • Social Authentication
          </Badge>
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Connect your social accounts</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Authorize your personal or brand X and LinkedIn profiles. Once connected, your AI assistant publishes directly to your feed.
        </p>

        {/* Success Notification */}
        {connectedParam ? (
          <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="size-4 shrink-0" />
            <span>
              Successfully connected {connectedParam.toUpperCase()}{" "}
              {handleParam ? <strong>({decodeURIComponent(handleParam)})</strong> : ""}!
            </span>
          </div>
        ) : null}

        {/* Error Notification */}
        {errorParam ? (
          <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
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
                <div className="flex items-center gap-3.5">
                  <span className="text-muted-foreground size-5 flex items-center justify-center">{platform.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{platform.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
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
                    className="text-xs"
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

        <div className="mt-10 pt-4">
          <Button
            className="w-full text-xs font-medium"
            size="lg"
            disabled={connectedCount === 0}
            onClick={() => void navigate({ to: "/done" })}
          >
            Continue to Next Step (Finish Setup)
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
          <p className="mt-3 text-xs text-center text-muted-foreground">
            Connect at least one platform to continue. You can change accounts anytime.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          Zero passwords stored. All connections are secured via official OAuth 2.0 tokens.
        </div>
      </main>

      <Footer />
    </div>
  );
}
