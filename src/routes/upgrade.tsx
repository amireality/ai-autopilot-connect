import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Sparkles, Shield, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import {
  createRazorpayOrder,
  getMyQuota,
  verifyRazorpayPayment,
} from "@/lib/razorpay.functions";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Pricing & Quotas — blew by setupr" },
      { name: "description", content: "Top up AI-published posts for your blew by setupr account." },
      { property: "og:title", content: "Pricing & Quotas — blew by setupr" },
      { property: "og:description", content: "Top up posts your AI can publish directly to X and LinkedIn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Upgrade,
});

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

function loadScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const FREE = ["5 posts included upon sign up", "Direct X and LinkedIn publishing", "Full image and media support", "Works with ChatGPT, Claude & Codex"];
const PRO = ["+100 posts added to your balance", "Credits never expire", "Priority n8n queue execution", "Top up anytime as you grow"];

function Upgrade() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [quota, setQuota] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fetchQuota = useServerFn(getMyQuota);
  const createOrder = useServerFn(createRazorpayOrder);
  const verify = useServerFn(verifyRazorpayPayment);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSignedIn(!!data.session);
      if (data.session) fetchQuota().then((q) => setQuota(q.quota)).catch(() => {});
    });
  }, [fetchQuota]);

  async function checkout() {
    setBusy(true);
    setMsg(null);
    try {
      if (!(await loadScript()) || !window.Razorpay) throw new Error("Could not load checkout.");
      const order = await createOrder();
      const { data } = await supabase.auth.getUser();
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "blew by setupr",
        description: "100 AI Post Credits",
        prefill: { email: data.user?.email },
        theme: { color: "#0f172a" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const r = await verify({ data: resp });
            setQuota(r.quota);
            setMsg({ ok: true, text: "Payment received — 100 posts added to your account!" });
          } catch (e) {
            setMsg({ ok: false, text: e instanceof Error ? e.message : "Verification failed." });
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Checkout failed." });
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/done"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary bg-primary/5">
            Transparent Pricing
          </Badge>
        </div>

        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Keep your AI posting without limits</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every call to <code className="text-foreground">publish_to_social</code> consumes one post credit. Top up your balance anytime.
          </p>

          {quota !== null && (
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs shadow-xs">
              <span className="text-muted-foreground">Active Balance:</span>
              <span className="font-semibold text-primary">{quota} posts remaining</span>
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Free Tier */}
          <section className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Free Starter</div>
              <p className="mt-4 text-4xl font-bold">₹0</p>
              <p className="mt-1 text-xs text-muted-foreground">Included automatically upon signup</p>
              <ul className="mt-8 space-y-3 text-xs text-muted-foreground">
                {FREE.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <Link to="/setup">
                <Button variant="outline" className="w-full text-xs" size="lg">
                  {signedIn ? "Go to Connected Accounts" : "Get Started Free"}
                </Button>
              </Link>
            </div>
          </section>

          {/* Pro Pack */}
          <section className="relative rounded-2xl border border-primary/60 bg-gradient-to-b from-primary/[0.04] to-card p-8 shadow-md flex flex-col justify-between overflow-hidden">
            <span className="absolute right-6 top-6 rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 font-mono text-[10px] uppercase font-semibold tracking-wider">
              Popular
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                <Sparkles className="size-3.5" /> 100 Post Pack
              </div>
              <p className="mt-4 text-4xl font-bold">₹499</p>
              <p className="mt-1 text-xs text-muted-foreground">One-time top-up • ≈ ₹5 per post • No expiry</p>
              <ul className="mt-8 space-y-3 text-xs text-muted-foreground">
                {PRO.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-foreground font-medium">
                    <Check className="size-3.5 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              {signedIn === false ? (
                <Button asChild className="w-full text-xs" size="lg">
                  <Link to="/login" search={{ next: "/upgrade" }}>Sign in to top up</Link>
                </Button>
              ) : (
                <Button className="w-full text-xs font-semibold" size="lg" onClick={checkout} disabled={busy || signedIn === null}>
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Pay with Razorpay"
                  )}
                </Button>
              )}
            </div>

            {msg && (
              <p className={`mt-4 text-xs text-center font-medium ${msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                {msg.text}
              </p>
            )}
          </section>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="size-4 text-emerald-500" />
          Payments securely processed by Razorpay. 100% money-back guarantee if unsatisfied.
        </div>
      </main>

      <Footer />
    </div>
  );
}
