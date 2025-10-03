-- Fix security warnings by setting search_path on all security definer functions

-- Fix sms_auth_relay function
CREATE OR REPLACE FUNCTION public.sms_auth_relay(fitfusion integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_phone   text;
    v_code    text;
    v_code_hash text;
BEGIN
    -- Look up user ID and phone number
    SELECT p.user_id, p.phone_number
    INTO v_user_id, v_phone
    FROM profiles p
    WHERE p.fitfusion = sms_auth_relay.fitfusion;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found for fitfusion %', sms_auth_relay.fitfusion;
    END IF;

    IF v_phone IS NULL THEN
        RAISE EXCEPTION 'User % has no phone number set', v_user_id;
    END IF;

    -- Invalidate any existing unexpired codes for this user
    UPDATE sms_auth_logs
    SET expires_at = now()
    WHERE user_id = v_user_id 
      AND expires_at > now() 
      AND verified_at IS NULL;

    -- Generate a 6-digit numeric code
    v_code := lpad(floor(random()*1000000)::int::text, 6, '0');
    
    -- Hash the code using SHA-256 before storing
    v_code_hash := encode(digest(v_code, 'sha256'), 'hex');

    -- Insert a log record with hashed code only
    INSERT INTO sms_auth_logs (user_id, phone, code_hash, sent_at, expires_at)
    VALUES (v_user_id, v_phone, v_code_hash, now(), now() + interval '10 minutes');

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Verification code sent',
        'expires_in_minutes', 10
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('SMS relay error: %s', SQLERRM)
        );
END;
$$;

-- Fix cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sms_codes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count integer;
BEGIN
    DELETE FROM sms_auth_logs
    WHERE sent_at < now() - interval '24 hours';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$;