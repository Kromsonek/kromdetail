
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Packages
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  price numeric(10,2) NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_public_read" ON public.packages FOR SELECT USING (true);
CREATE POLICY "packages_admin_write" ON public.packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Services (Custom)
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT USING (true);
CREATE POLICY "services_admin_write" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  car_make_model text NOT NULL,
  location text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL,
  preferred_date text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_public_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_admin_read" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Site content
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_content_public_read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "site_content_admin_write" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed packages
INSERT INTO public.packages (slug, name, description, features, price, is_featured, sort_order) VALUES
('basic', 'Krom Basic', 'Idealny start dla codziennego auta', '["Mycie zewnętrzne","Czyszczenie felg","Osuszanie","Dressing opon"]'::jsonb, 249, false, 1),
('pro', 'Krom Pro', 'Najczęściej wybierany pakiet kompleksowy', '["Wszystko z Basic","Czyszczenie wnętrza","Odkurzanie + dywaniki","Czyszczenie szyb","Dressing plastików"]'::jsonb, 499, true, 2),
('black', 'Krom Black Edition', 'Najwyższy poziom detailingu', '["Wszystko z Pro","Dekontaminacja lakieru","Wosk premium","Ozonowanie","Pranie tapicerki"]'::jsonb, 799, false, 3);

-- Seed services
INSERT INTO public.services (name, description, price, sort_order) VALUES
('Czyszczenie zewnętrzne', 'Mycie, felgi w cenie nie liczone osobno', 149, 1),
('Czyszczenie felg', 'Dokładne czyszczenie felg i opon', 69, 2),
('Czyszczenie wnętrza', 'Odkurzanie, plastiki, tapicerka sucha', 139, 3),
('Czyszczenie dywaników i bagażnika', 'Pranie dywaników i bagażnika', 69, 4),
('Czyszczenie okien', 'Szyby od wewnątrz i z zewnątrz', 49, 5),
('Ozonowanie', 'Usunięcie zapachów i bakterii', 99, 6);

-- Seed content
INSERT INTO public.site_content (key, value) VALUES
('hero_title', 'Przywracamy Autu Godność'),
('hero_subtitle', 'Premium Mobilny Detailing • Przyjeżdżamy na wieś • Najwyższa jakość'),
('about_text', 'KromDetail to mobilny detailing premium prosto na Twojej posesji. Specjalizuję się w usuwaniu zabrudzeń po polnych drogach, błocie i codziennym użytkowaniu.'),
('contact_phone', '+48 000 000 000'),
('contact_email', 'KromBiznes@gmail.com'),
('contact_area', 'Województwo / okolice');
