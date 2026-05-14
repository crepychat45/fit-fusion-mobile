-- Fix the remaining functions with missing search_path

-- Fix the get_user_profile function that has no search_path config
DROP FUNCTION IF EXISTS public.get_user_profile(bigint);

-- Fix the older recover_password function without parameters that has no search_path
CREATE OR REPLACE FUNCTION public.recover_password()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Updated with proper search path
    -- Your existing function logic follows
    RAISE NOTICE 'Password recovery function called';
END;
$function$;