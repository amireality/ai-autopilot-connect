CREATE OR REPLACE FUNCTION public.fulfill_razorpay_order(_order_id text, _payment_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order public.razorpay_orders%ROWTYPE;
  _new_quota integer;
BEGIN
  SELECT * INTO _order FROM public.razorpay_orders WHERE order_id = _order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order not found';
  END IF;

  -- Idempotent: a retried/duplicate verification must not credit twice
  IF _order.status = 'paid' THEN
    SELECT available_quota INTO _new_quota FROM public.profiles WHERE id = _order.user_id;
    RETURN _new_quota;
  END IF;

  UPDATE public.razorpay_orders
  SET status = 'paid', payment_id = _payment_id, paid_at = now()
  WHERE order_id = _order_id;

  UPDATE public.profiles
  SET available_quota = available_quota + _order.quota_added, updated_at = now()
  WHERE id = _order.user_id
  RETURNING available_quota INTO _new_quota;

  RETURN _new_quota;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fulfill_razorpay_order(text, text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.fulfill_razorpay_order(text, text) FROM anon, authenticated;