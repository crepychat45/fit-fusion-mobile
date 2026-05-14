-- Fix remaining function search path security issues

-- Fix the manage_user_profiles function
CREATE OR REPLACE FUNCTION public.manage_user_profiles(action text, user_id bigint DEFAULT NULL::bigint, new_username text DEFAULT NULL::text, new_email text DEFAULT NULL::text)
RETURNS TABLE(id bigint, username text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF action = 'get' THEN
        RETURN QUERY SELECT p.id, p.username, p.email
        FROM public.profiles p
        WHERE p.id = user_id;

    ELSIF action = 'update' THEN
        IF new_username IS NOT NULL THEN
            UPDATE public.profiles
            SET username = new_username
            WHERE id = user_id;
        END IF;

        IF new_email IS NOT NULL THEN
            UPDATE public.profiles
            SET email = new_email
            WHERE id = user_id;
        END IF;

        RETURN QUERY SELECT p.id, p.username, p.email
        FROM public.profiles p
        WHERE p.id = user_id;

    ELSIF action = 'delete' THEN
        DELETE FROM public.profiles
        WHERE id = user_id;
        RETURN;

    ELSIF action = 'count' THEN
        RETURN QUERY SELECT count(*) AS user_count FROM public.profiles;

    ELSIF action = 'get_all' THEN
        RETURN QUERY SELECT p.id, p.username, p.email
        FROM public.profiles p;

    ELSE
        RAISE EXCEPTION 'Invalid action: %', action;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error occurred: %', SQLERRM;
END;
$function$;

-- Fix the "Money Manager pro" function
CREATE OR REPLACE FUNCTION public."Money Manager pro"()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Function logic here
    -- Add your specific implementation details

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error occurred: %', SQLERRM;
END;
$function$;