
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  link text,
  icon text,
  audience text NOT NULL DEFAULT 'all',
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_notifications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_notifications_read" ON public.admin_notifications
  FOR SELECT TO authenticated USING (active = true OR public.is_admin_or_super());
CREATE POLICY "admin_notifications_write" ON public.admin_notifications
  FOR ALL TO authenticated USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());
CREATE TRIGGER update_admin_notifications_updated_at BEFORE UPDATE ON public.admin_notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_read_admins" ON public.admin_audit_log
  FOR SELECT TO authenticated USING (public.is_admin_or_super());
CREATE POLICY "audit_insert_admins" ON public.admin_audit_log
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_super() AND actor_id = auth.uid());

CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE TO authenticated USING (public.is_admin_or_super());
CREATE POLICY "Admins can delete any comment" ON public.post_comments
  FOR DELETE TO authenticated USING (public.is_admin_or_super());
CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (public.is_admin_or_super());
CREATE POLICY "Admins can update any subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());
CREATE POLICY "Admins can view all events" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.is_admin_or_super());
