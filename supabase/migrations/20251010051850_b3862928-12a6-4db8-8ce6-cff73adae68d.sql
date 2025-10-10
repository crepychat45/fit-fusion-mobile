-- Add explicit SELECT policy to prevent direct reads of SMS authentication logs
-- This protects sensitive data like verification codes, phone numbers, and code hashes
-- Only SECURITY DEFINER functions (sms_auth_relay, verify_sms_code) can access this data

CREATE POLICY "Prevent direct reads of SMS auth logs"
ON public.sms_auth_logs
FOR SELECT
USING (false);

-- Add explicit UPDATE policy to prevent modifications
CREATE POLICY "Prevent direct updates of SMS auth logs"
ON public.sms_auth_logs
FOR UPDATE
USING (false);

-- Add explicit DELETE policy to prevent deletions
CREATE POLICY "Prevent direct deletes of SMS auth logs"
ON public.sms_auth_logs
FOR DELETE
USING (false);