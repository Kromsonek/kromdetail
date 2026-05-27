
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
  SELECT user_id INTO uid FROM public.profiles WHERE email = NEW.email LIMIT 1;
  IF uid IS NULL THEN RETURN NEW; END IF;
  pts := floor(NEW.total / 5);
  IF pts <= 0 THEN RETURN NEW; END IF;
  UPDATE public.profiles SET points = points + pts WHERE user_id = uid;
  INSERT INTO public.point_transactions (user_id, delta, reason, order_id)
  VALUES (uid, pts, 'Zamówienie #' || substr(NEW.id::text,1,8), NEW.id);
  RETURN NEW;
END;
$function$;

INSERT INTO public.site_content (key, value) VALUES
  ('detailing_intro_title', 'Czym jest detailing?'),
  ('detailing_intro_body', 'Detailing to znacznie więcej niż mycie auta. To kompleksowa pielęgnacja lakieru, wnętrza, felg i szyb przy użyciu profesjonalnych preparatów i technik. Efekt? Twój samochód wygląda i pachnie jak nowy — a powłoki ochronne zabezpieczają go na długie miesiące.')
ON CONFLICT (key) DO NOTHING;
