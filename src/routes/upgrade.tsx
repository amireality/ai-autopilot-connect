import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  createRazorpayOrder,
  getMyQuota,
  verifyRazorpayPayment,
} from "@/lib/razorpay.functions";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade — setupr automate" },
      { name: "description", content: "Add 100 AI-published posts to your setupr automate account." },
      { property: "og:title", content: "Upgrade — setupr automate" },
      { property: "og:description", content: "Top up 100 posts your AI can publish to X and LinkedIn." },
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

const FREE = ["5 posts included", "X and LinkedIn publishing", "Works with any MCP client"];
const PRO = ["+100 posts added instantly", "Credits never expire", "Priority publishing queue", "Buy again anytime"];

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
        name: "setupr automate",
        description: "100 post credits",
        prefill: { email: data.user?.email },
        theme: { color: "#f97316" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const r = await verify({ data: resp });
            setQuota(r.quota);
            setMsg({ ok: true, text: "Payment received — 100 posts added." });
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
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-16 sm:py-24">
      <Link to="/" className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
        <Terminal className="size-3.5 text-primary" />
        setupr automate
      </Link>

      <h1 className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">Keep your AI posting.</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Every call to <code className="text-foreground">publish_to_social</code> uses one post credit. Top up
        whenever you run low.
      </p>
      {quota !== null && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          balance: <span className="text-primary">{quota}</span> posts
        </p>
      )}

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Free</h2>
          <p className="mt-4 text-4xl font-semibold">₹0</p>
          <p className="mt-1 text-sm text-muted-foreground">to get started</p>
          <ul className="mt-8 space-y-3 text-sm">
            {FREE.map((f) => (
              <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 text-muted-foreground" />{f}</li>
            ))}
          </ul>
        </section>

        <section className="relative rounded-2xl border border-primary/60 bg-card p-8 shadow-[0_0_60px_-20px_var(--primary)]">
          <span className="absolute right-6 top-6 rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
            Pro pack
          </span>
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">100 posts</h2>
          <p className="mt-4 text-4xl font-semibold">₹499</p>
          <p className="mt-1 text-sm text-muted-foreground">one-time · ≈ ₹5 per post</p>
          <ul className="mt-8 space-y-3 text-sm">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 text-primary" />{f}</li>
            ))}
          </ul>
          <div className="mt-8">
            {signedIn === false ? (
              <Button asChild className="w-full" size="lg">
                <Link to="/login" search={{ next: "/upgrade" }}>Sign in to buy</Link>
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={checkout} disabled={busy || signedIn === null}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Pay with Razorpay"}
              </Button>
            )}
          </div>
          {msg && (
            <p className={`mt-4 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>
          )}
        </section>
      </div>
    </main>
  );
}
