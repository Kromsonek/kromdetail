
-- Lock down point_transactions self-insert. Users can no longer arbitrarily award themselves points.
DROP POLICY IF EXISTS pt_self_insert ON public.point_transactions;

CREATE POLICY pt_admin_insert ON public.point_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Atomic, server-side redeem flow used by the account page.
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost integer;
  _name text;
  _balance integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT points_cost, name INTO _cost, _name
  FROM public.rewards WHERE id = _reward_id AND is_active = true;
  IF _cost IS NULL THEN
    RAISE EXCEPTION 'reward not available';
  END IF;

  SELECT points INTO _balance FROM public.profiles WHERE user_id = _uid FOR UPDATE;
  IF _balance IS NULL OR _balance < _cost THEN
    RAISE EXCEPTION 'insufficient points';
  END IF;

  UPDATE public.profiles SET points = points - _cost, updated_at = now() WHERE user_id = _uid;
  INSERT INTO public.point_transactions(user_id, delta, reason, reward_id)
  VALUES (_uid, -_cost, 'Nagroda: ' || _name, _reward_id);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid) TO authenticated;

-- Restrict has_role helper to signed-in users only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
