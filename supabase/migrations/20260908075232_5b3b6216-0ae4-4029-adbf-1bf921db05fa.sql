
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'));
$$;

-- site_content
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  section text NOT NULL DEFAULT 'general',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_content_read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "site_content_write" ON public.site_content FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- feature_switches
CREATE TABLE IF NOT EXISTS public.feature_switches (
  feature_id text PRIMARY KEY,
  name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  min_app_version text,
  allowed_tiers text[] NOT NULL DEFAULT ARRAY['free','premium']::text[],
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_switches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feature_switches TO authenticated;
GRANT ALL ON public.feature_switches TO service_role;
ALTER TABLE public.feature_switches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feature_switches_read" ON public.feature_switches FOR SELECT USING (true);
CREATE POLICY "feature_switches_write" ON public.feature_switches FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER update_feature_switches_updated_at BEFORE UPDATE ON public.feature_switches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- app_releases published flag
ALTER TABLE public.app_releases ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

-- realtime
ALTER TABLE public.site_content REPLICA IDENTITY FULL;
ALTER TABLE public.feature_switches REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_switches;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- seeds
INSERT INTO public.feature_switches (feature_id, name, description, is_enabled) VALUES
  ('maintenance_mode','Maintenance Mode','Puts the user-facing app into a maintenance screen',false),
  ('ai_coach','AI Coach','Mobile AI coach assistant',true),
  ('ocr_scanner','OCR Scanner','Nutrition label scanning',true),
  ('one_rm_calculator','1RM Calculator','One-rep-max estimator',true),
  ('nutrition_tracker','Nutrition Tracker','Nutrition logging module',true),
  ('workout_generator','AI Workout Generator','AI generated workout plans',true),
  ('community','Community','Social feed and challenges',true),
  ('vault','Holographic Vault','Secure document vault',true)
ON CONFLICT (feature_id) DO NOTHING;

INSERT INTO public.site_content (key, section, content) VALUES
  ('home.hero','home','{"title":"Train smarter with FitXFusion","subtitle":"Your adaptive fitness companion"}'::jsonb),
  ('home.motivation','home','{"quotes":["Consistency beats intensity.","Small steps, big results."]}'::jsonb),
  ('maintenance.notice','system','{"message":"We are performing scheduled maintenance.","eta":"Back shortly"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
