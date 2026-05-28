
-- Replace function: award points only when an order transitions to status 'approved'
CREATE OR REPLACE FUNCTION public.award_points_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid;
  pts integer;
BEGIN
  IF NEW.status IS DISTINCT FROM 'approved' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' THEN
    RETURN NEW;
  END IF;
  SELECT user_id INTO uid FROM public.profiles WHERE email = NEW.email LIMIT 1;
  IF uid IS NULL THEN RETURN NEW; END IF;
  pts := floor(NEW.total / 5);
  IF pts <= 0 THEN RETURN NEW; END IF;
  UPDATE public.profiles SET points = points + pts WHERE user_id = uid;
  INSERT INTO public.point_transactions (user_id, delta, reason, order_id)
  VALUES (uid, pts, 'Zatwierdzone zamówienie #' || substr(NEW.id::text,1,8), NEW.id);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS award_points_on_order_approve ON public.orders;
CREATE TRIGGER award_points_on_order_approve
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_points_on_order();
