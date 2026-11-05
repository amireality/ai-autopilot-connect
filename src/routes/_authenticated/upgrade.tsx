import { useEffect, useState } from "@tanstack/react-router";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Terminal, Check, Zap, Sparkles, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade your plan — setupr automate" },
      {
        name: "description",
        content: "Upgrade your posting quota to continue publishing with ChatGPT.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UpgradePage,
});

interface ProfileData {
  available_quota: number;
  tier: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function UpgradePage() {
  const { user } = Route.useRouteContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState<string | null>(null);

  useEffect(() => {
    // Load Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Fetch user profile quota
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("available_quota, tier")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data as ProfileData);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      document.body.removeChild(script);
    };
  }, [user.id]);

  const handleSubscribe = async (planType: "creator" | "pro") => {
    setPayingPlan(planType);

    const planConfig = {
      creator: {
        name: "Creator Plan",
        amount: 49900, // in paise = ₹499
        description: "50 AI posts/month on X and LinkedIn",
      },
      pro: {
        name: "Pro Plan",
        amount: 149900, // in paise = ₹1,499
        description: "200 AI posts/month on X and LinkedIn",
      },
    }[planType];

    const keyId = import.meta.env["VITE_RAZORPAY_KEY_ID"] || "rzp_test_placeholder";

    if (!window.Razorpay) {
      alert("Payment gateway is loading. Please try again in a few seconds.");
      setPayingPlan(null);
      return;
    }

    const options = {
      key: keyId,
      amount: planConfig.amount,
      currency: "INR",
      name: "setupr automate",
      description: planConfig.description,
      prefill: {
        email: user.email || "",
      },
      notes: {
        user_id: user.id,
        plan_type: planType,
      },
      theme: {
        color: "#0f172a",
      },
      handler: function (response: any) {
        alert("Payment successful! Your quota is being updated in your account.");
        // Reload profile after small delay to let n8n webhook finish
        setTimeout(async () => {
          const { data } = await supabase
            .from("profiles")
            .select("available_quota, tier")
            .eq("id", user.id)
            .single();
          if (data) setProfile(data as ProfileData);
          setPayingPlan(null);
        }, 3000);
      },
      modal: {
        ondismiss: function () {
          setPayingPlan(null);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setPayingPlan(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/done"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
          <Terminal className="size-3.5 text-primary" />
          setupr automate
        </div>
      </div>

      {/* Header */}
      <div className="mt-10 text-center">
        <Badge variant="outline" className="mb-3 px-3 py-1 font-normal text-xs text-primary border-primary/20 bg-primary/5">
          Pricing & Subscriptions
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Upgrade your posting superpower
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
          Keep your AI autopilot running with high monthly post limits for X and LinkedIn.
        </p>

        {/* Current Quota Status Pill */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-muted/40 px-5 py-2 text-sm shadow-xs">
          <span className="text-muted-foreground">Your Balance:</span>
          {loading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="font-semibold text-foreground">
              {profile?.available_quota ?? 0} posts remaining
            </span>
          )}
          <span className="text-muted-foreground">|</span>
          <span className="text-xs uppercase font-medium tracking-wider text-primary">
            Tier: {profile?.tier || "Free"}
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 max-w-3xl mx-auto w-full">
        {/* Creator Plan */}
        <Card className="flex flex-col justify-between border-border/80 shadow-xs hover:border-primary/40 transition-all">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Creator</CardTitle>
                <CardDescription className="mt-1">
                  Ideal for solo creators and active professionals
                </CardDescription>
              </div>
              <Zap className="size-5 text-amber-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight">₹499</span>
              <span className="text-xs text-muted-foreground font-normal">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span><strong>50 posts</strong> per month</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Direct publishing to <strong>X & LinkedIn</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Image & text attachments support</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>ChatGPT MCP tool integration</span>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              className="w-full"
              variant="outline"
              disabled={payingPlan !== null}
              onClick={() => handleSubscribe("creator")}
            >
              {payingPlan === "creator" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Processing...
                </>
              ) : (
                "Subscribe to Creator"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="flex flex-col justify-between border-primary/50 shadow-md relative overflow-hidden bg-gradient-to-b from-primary/[0.03] to-transparent">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold uppercase px-3 py-1 rounded-bl-md tracking-wider">
            Popular
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription className="mt-1">
                  For power creators, founders and fast-growing brands
                </CardDescription>
              </div>
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight">₹1,499</span>
              <span className="text-xs text-muted-foreground font-normal">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span><strong>200 posts</strong> per month</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Direct publishing to <strong>X & LinkedIn</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Image & text attachments support</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Priority n8n queue execution</span>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              className="w-full"
              disabled={payingPlan !== null}
              onClick={() => handleSubscribe("pro")}
            >
              {payingPlan === "pro" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Processing...
                </>
              ) : (
                "Subscribe to Pro"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Security note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-emerald-500" />
        Secured by Razorpay. Recurring billing can be cancelled anytime.
      </div>
    </main>
  );
}
