DROP POLICY IF EXISTS "Users delete own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users manage their own subscriptions" ON public.user_subscriptions;
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_subscriptions' AND cmd IN ('INSERT','UPDATE','DELETE','ALL') AND policyname <> 'Admins can update any subscription' LOOP
    EXECUTE format('DROP POLICY %I ON public.user_subscriptions', p.policyname);
  END LOOP;
END $$;
DROP POLICY IF EXISTS "Users view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS paddle_subscription_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS paddle_customer_id text,
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'sandbox';
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;