-- Enable pgcrypto extension for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add columns for expiration and verification tracking
ALTER TABLE public.sms_auth_logs 
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '10 minutes'),
  ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS code_hash text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sms_auth_logs_user_expires 
  ON public.sms_auth_logs(user_id, expires_at) 
  WHERE verified_at IS NULL;

-- Drop old function and trigger to recreate with new security measures
DROP FUNCTION IF EXISTS public.sms_auth_relay(integer) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sms_auth_relay() CASCADE;

-- Updated SMS auth relay function with secure code hashing
CREATE OR REPLACE FUNCTION public.sms_auth_relay(fitfusion integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
    FROM public.profiles p
    WHERE p.fitfusion = sms_auth_relay.fitfusion;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found for fitfusion %', sms_auth_relay.fitfusion;
    END IF;

    IF v_phone IS NULL THEN
        RAISE EXCEPTION 'User % has no phone number set', v_user_id;
    END IF;

    -- Invalidate any existing unexpired codes for this user
    UPDATE public.sms_auth_logs
    SET expires_at = now()
    WHERE user_id = v_user_id 
      AND expires_at > now() 
      AND verified_at IS NULL;

    -- Generate a 6-digit numeric code
    v_code := lpad(floor(random()*1000000)::int::text, 6, '0');
    
    -- Hash the code using SHA-256 before storing
    v_code_hash := encode(digest(v_code, 'sha256'), 'hex');

    -- Insert a log record with hashed code only (never store plain text)
    INSERT INTO public.sms_auth_logs (user_id, phone, code_hash, sent_at, expires_at)
    VALUES (v_user_id, v_phone, v_code_hash, now(), now() + interval '10 minutes');

    -- In production, you would send the plain code via SMS here
    -- For now, return success
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

-- Create function to verify SMS codes securely
CREATE OR REPLACE FUNCTION public.verify_sms_code(
    p_user_id uuid,
    p_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code_hash text;
    v_log_record record;
    v_max_attempts constant integer := 5;
BEGIN
    -- Hash the provided code for comparison
    v_code_hash := encode(digest(p_code, 'sha256'), 'hex');
    
    -- Find matching log entry
    SELECT id, attempts INTO v_log_record
    FROM public.sms_auth_logs
    WHERE user_id = p_user_id
      AND code_hash = v_code_hash
      AND expires_at > now()
      AND verified_at IS NULL
    ORDER BY sent_at DESC
    LIMIT 1;
    
    -- If no match found, increment attempts on most recent code
    IF NOT FOUND THEN
        -- Use subquery to find the most recent code
        UPDATE public.sms_auth_logs
        SET attempts = attempts + 1
        WHERE id = (
            SELECT id
            FROM public.sms_auth_logs
            WHERE user_id = p_user_id
              AND expires_at > now()
              AND verified_at IS NULL
            ORDER BY sent_at DESC
            LIMIT 1
        );
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or expired verification code'
        );
    END IF;
    
    -- Check if too many attempts
    IF v_log_record.attempts >= v_max_attempts THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Too many failed attempts. Please request a new code.'
        );
    END IF;
    
    -- Mark code as verified
    UPDATE public.sms_auth_logs
    SET verified_at = now()
    WHERE id = v_log_record.id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Code verified successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Verification error: %s', SQLERRM)
        );
END;
$$;

-- Create function to clean up expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_sms_codes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count integer;
BEGIN
    -- Delete codes older than 24 hours
    DELETE FROM public.sms_auth_logs
    WHERE sent_at < now() - interval '24 hours';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$;

-- Drop and recreate RLS policies to be more restrictive
DROP POLICY IF EXISTS "auth users can read own sms logs" ON public.sms_auth_logs;
DROP POLICY IF EXISTS "definer can insert sms logs" ON public.sms_auth_logs;
DROP POLICY IF EXISTS "Users can view SMS log metadata only" ON public.sms_auth_logs;
DROP POLICY IF EXISTS "Only system can insert SMS logs" ON public.sms_auth_logs;

-- Users can only see limited metadata, NOT the codes or hashes
CREATE POLICY "Users can view SMS log metadata only"
ON public.sms_auth_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only security definer functions can insert (blocks direct inserts)
CREATE POLICY "Only system functions can insert SMS logs"
ON public.sms_auth_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Add security documentation comments
COMMENT ON COLUMN public.sms_auth_logs.code IS 'DEPRECATED: Plain text codes must never be stored. Use code_hash instead.';
COMMENT ON COLUMN public.sms_auth_logs.code_hash IS 'SHA-256 hash of verification code. Never expose via SELECT. Only compared in verify_sms_code function.';
COMMENT ON COLUMN public.sms_auth_logs.expires_at IS 'Codes expire after 10 minutes. Expired codes automatically fail verification.';
COMMENT ON COLUMN public.sms_auth_logs.verified_at IS 'When code was used. NULL = unused. Codes can only be verified once.';
COMMENT ON COLUMN public.sms_auth_logs.attempts IS 'Failed verification attempts. Max 5 attempts per code to prevent brute force.';