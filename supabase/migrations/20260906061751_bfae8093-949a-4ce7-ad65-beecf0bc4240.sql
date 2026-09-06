-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- Releases
CREATE TABLE IF NOT EXISTS public.app_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  min_version text,
  channel text NOT NULL DEFAULT 'stable' CHECK (channel IN ('stable','beta')),
  title text NOT NULL DEFAULT '',
  changelog jsonb NOT NULL DEFAULT '[]'::jsonb,
  mandatory boolean NOT NULL DEFAULT false,
  download_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_releases TO anon;
GRANT SELECT ON public.app_releases TO authenticated;
GRANT ALL ON public.app_releases TO service_role;
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active releases" ON public.app_releases;
CREATE POLICY "Anyone can read active releases" ON public.app_releases
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage releases" ON public.app_releases;
CREATE POLICY "Admins manage releases" ON public.app_releases
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP TRIGGER IF EXISTS update_app_releases_updated_at ON public.app_releases;
CREATE TRIGGER update_app_releases_updated_at BEFORE UPDATE ON public.app_releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  is_enabled boolean NOT NULL DEFAULT false,
  description text,
  allowed_roles text[] NOT NULL DEFAULT ARRAY['user','admin']::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO anon;
GRANT SELECT ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins manage feature flags" ON public.feature_flags
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Announcements
CREATE TABLE IF NOT EXISTS public.global_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','critical')),
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.global_announcements TO anon;
GRANT SELECT ON public.global_announcements TO authenticated;
GRANT ALL ON public.global_announcements TO service_role;
ALTER TABLE public.global_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active announcements" ON public.global_announcements;
CREATE POLICY "Anyone can read active announcements" ON public.global_announcements
  FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins manage announcements" ON public.global_announcements;
CREATE POLICY "Admins manage announcements" ON public.global_announcements
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP TRIGGER IF EXISTS update_global_announcements_updated_at ON public.global_announcements;
CREATE TRIGGER update_global_announcements_updated_at BEFORE UPDATE ON public.global_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Beta opt-in + admin visibility on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS beta_opt_in boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Realtime
ALTER TABLE public.app_releases REPLICA IDENTITY FULL;
ALTER TABLE public.feature_flags REPLICA IDENTITY FULL;
ALTER TABLE public.global_announcements REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.app_releases;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.global_announcements;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.feature_flags (key, is_enabled, description) VALUES
  ('maintenance_mode', false, 'Show maintenance banner and lock non-essential modules'),
  ('workout_generator', true, 'AI workout generator module'),
  ('ocr_scanner', true, 'Nutrition label OCR scanner'),
  ('community_feed', true, 'Community social feed'),
  ('beta_channel', true, 'Allow users to opt into beta releases')
ON CONFLICT (key) DO NOTHING;