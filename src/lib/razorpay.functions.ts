import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PRO_PACK = { amount: 49900, currency: "INR", quota: 100 } as const;

function creds() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const secret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !secret) throw new Error("Payments are not configured yet.");
  return { keyId, secret };
}

export const getMyQuota = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("available_quota, tier")
      .eq("id", context.userId)
      .maybeSingle();
    return { quota: data?.available_quota ?? 0, tier: data?.tier ?? "free" };
  });

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { keyId, secret } = creds();
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${keyId}:${secret}`)}`,
      },
      body: JSON.stringify({
        amount: PRO_PACK.amount,
        currency: PRO_PACK.currency,
        receipt: `q_${Date.now()}`,
        notes: { user_id: context.userId },
      }),
    });
    if (!res.ok) {
      console.error("Razorpay order failed", res.status, await res.text());
      throw new Error("Could not start checkout. Please try again.");
    }
    const order = (await res.json()) as { id: string; amount: number; currency: string };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("razorpay_orders").insert({
      order_id: order.id,
      user_id: context.userId,
      amount: order.amount,
      currency: order.currency,
      quota_added: PRO_PACK.quota,
    });
    if (error) throw new Error("Could not start checkout.");
    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        razorpay_order_id: z.string().min(1).max(100),
        razorpay_payment_id: z.string().min(1).max(100),
        razorpay_signature: z.string().min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { secret } = creds();
    const { createHmac, timingSafeEqual } = await import("crypto");
    const expected = createHmac("sha256", secret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Payment verification failed.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("razorpay_orders")
      .select("user_id")
      .eq("order_id", data.razorpay_order_id)
      .maybeSingle();
    if (!order || order.user_id !== context.userId) throw new Error("Order not found.");

    const { data: quota, error } = await supabaseAdmin.rpc("fulfill_razorpay_order", {
      _order_id: data.razorpay_order_id,
      _payment_id: data.razorpay_payment_id,
    });
    if (error) throw new Error("Could not credit your posts. Contact support.");
    return { quota: quota as number };
  });
