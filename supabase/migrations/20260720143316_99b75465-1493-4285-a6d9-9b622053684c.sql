-- Extend user_settings with the full category schema requested.
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS security_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS chat_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS accessibility_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS local_kv jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Ensure fast lookups by user (idempotent).
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS user_settings_updated_at_idx ON public.user_settings(updated_at DESC);