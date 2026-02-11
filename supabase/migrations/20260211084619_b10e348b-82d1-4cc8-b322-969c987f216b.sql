
-- Drop vulnerable SECURITY DEFINER functions
DROP FUNCTION IF EXISTS public.manage_user_profiles(text, uuid, text, text);
DROP FUNCTION IF EXISTS public.recover_password(text);
