DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;

CREATE POLICY "Users can insert own events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);