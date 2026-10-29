CREATE OR REPLACE FUNCTION public.merge_settings_preferences(p_patch jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  category text;
  existing jsonb;
  incoming jsonb;
  result jsonb;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF jsonb_typeof(p_patch) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid preferences'; END IF;
  FOR category IN SELECT jsonb_object_keys(p_patch) LOOP
    IF category NOT IN ('display_settings','sound_settings','notification_settings','privacy_settings','account_settings','update_settings','developer_settings','security_settings','chat_settings','accessibility_settings','appearance_settings') THEN
      RAISE EXCEPTION 'Unsupported settings category';
    END IF;
    IF jsonb_typeof(p_patch -> category) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid category'; END IF;
    IF (p_patch -> category) ? 'live' AND jsonb_typeof(p_patch -> category -> 'live') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid live preferences'; END IF;
  END LOOP;
  INSERT INTO public.user_settings(user_id) VALUES (uid) ON CONFLICT (user_id) DO NOTHING;
  PERFORM 1 FROM public.user_settings WHERE user_id = uid FOR UPDATE;
  FOR category IN SELECT jsonb_object_keys(p_patch) LOOP
    EXECUTE format('SELECT COALESCE(%I, ''{}''::jsonb) FROM public.user_settings WHERE user_id = $1', category) INTO existing USING uid;
    incoming := p_patch -> category;
    IF incoming ? 'live' THEN
      incoming := jsonb_set(incoming, '{live}', COALESCE(existing -> 'live', '{}'::jsonb) || (incoming -> 'live'));
    END IF;
    EXECUTE format('UPDATE public.user_settings SET %I = $1 WHERE user_id = $2', category) USING existing || incoming, uid;
  END LOOP;
  SELECT to_jsonb(s) INTO result FROM public.user_settings s WHERE user_id = uid;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.merge_settings_preferences(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.merge_settings_preferences(jsonb) TO authenticated;