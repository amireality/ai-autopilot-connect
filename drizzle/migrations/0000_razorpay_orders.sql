GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE TABLE public.razorpay_orders (
  order_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  quota_added integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'created',
  payment_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT SELECT ON public.razorpay_orders TO authenticated;
GRANT ALL ON public.razorpay_orders TO service_role;
ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.razorpay_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Atomically mark an order paid and credit quota exactly once
CREATE OR REPLACE FUNCTION public.fulfill_razorpay_order(_order_id text, _payment_id text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid; _q integer; _new integer;
BEGIN
  UPDATE public.razorpay_orders SET status='paid', payment_id=_payment_id, paid_at=now()
  WHERE order_id=_order_id AND status='created'
  RETURNING user_id, quota_added INTO _uid, _q;
  IF _uid IS NULL THEN
    SELECT p.available_quota INTO _new FROM public.profiles p JOIN public.razorpay_orders o ON o.user_id=p.id WHERE o.order_id=_order_id;
    RETURN _new;
  END IF;
  INSERT INTO public.profiles (id, available_quota, tier) VALUES (_uid, 5 + _q, 'pro')
  ON CONFLICT (id) DO UPDATE SET available_quota = public.profiles.available_quota + _q, tier='pro', updated_at=now()
  RETURNING available_quota INTO _new;
  RETURN _new;
END $$;
REVOKE EXECUTE ON FUNCTION public.fulfill_razorpay_order(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_razorpay_order(text, text) TO service_role;