CREATE TABLE public.chat_user_directory (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'FitFusion Member',
  username text,
  avatar_url text,
  status text NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away')),
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_user_directory TO authenticated;
GRANT ALL ON public.chat_user_directory TO service_role;

ALTER TABLE public.chat_user_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can discover chat contacts"
ON public.chat_user_directory
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own chat directory profile"
ON public.chat_user_directory
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat directory profile"
ON public.chat_user_directory
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat directory profile"
ON public.chat_user_directory
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

INSERT INTO public.chat_user_directory (user_id, display_name, username, avatar_url, status, last_seen)
SELECT
  p.user_id,
  COALESCE(NULLIF(p.name, ''), NULLIF(p.username, ''), 'FitFusion Member'),
  p.username,
  p.avatar_url,
  'offline',
  now()
FROM public.profiles p
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();

CREATE INDEX idx_chat_user_directory_username ON public.chat_user_directory(username);
CREATE INDEX idx_chat_user_directory_display_name ON public.chat_user_directory(display_name);

CREATE TRIGGER update_chat_user_directory_updated_at
BEFORE UPDATE ON public.chat_user_directory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();