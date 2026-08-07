CREATE OR REPLACE FUNCTION public.shares_chat_thread(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE _a = ANY(t.participant_ids) AND _b = ANY(t.participant_ids)
  );
$$;

DROP POLICY IF EXISTS "Authenticated users can discover chat contacts" ON public.chat_user_directory;

CREATE POLICY "Users can view own and chat contact directory entries"
ON public.chat_user_directory
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.shares_chat_thread(auth.uid(), user_id)
);

CREATE OR REPLACE FUNCTION public.search_chat_contacts(_query text DEFAULT '')
RETURNS TABLE(user_id uuid, display_name text, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.user_id, d.display_name, d.username, d.avatar_url
  FROM public.chat_user_directory d
  WHERE auth.uid() IS NOT NULL
    AND d.user_id <> auth.uid()
    AND (
      coalesce(btrim(_query), '') = ''
      OR d.display_name ILIKE '%' || replace(replace(replace(btrim(_query), '\', '\\'), '%', '\%'), '_', '\_') || '%'
      OR d.username ILIKE '%' || replace(replace(replace(btrim(_query), '\', '\\'), '%', '\%'), '_', '\_') || '%'
    )
  ORDER BY d.display_name ASC
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.search_chat_contacts(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.search_chat_contacts(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_chat_thread(uuid, uuid) TO authenticated;