-- ===================================================================
-- COMPREHENSIVE SECURITY FIXES FOR FITFUSION
-- ===================================================================

-- 1. FIX: Add RLS policies to Fit-FusionXS table (if it exists)
-- First check if the table exists and has RLS enabled
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Fit-FusionXS'
    ) THEN
        -- Enable RLS if not already enabled
        ALTER TABLE public."Fit-FusionXS" ENABLE ROW LEVEL SECURITY;
        
        -- Add comprehensive RLS policies
        CREATE POLICY "Users can view their own Fit-FusionXS records"
            ON public."Fit-FusionXS"
            FOR SELECT
            USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own Fit-FusionXS records"
            ON public."Fit-FusionXS"
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own Fit-FusionXS records"
            ON public."Fit-FusionXS"
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own Fit-FusionXS records"
            ON public."Fit-FusionXS"
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. FIX: Secure phone numbers - Create separate user_contacts table
CREATE TABLE IF NOT EXISTS public.user_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number text,
    emergency_contact_name text,
    emergency_contact_phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS on user_contacts
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

-- Strict RLS policies - users can ONLY see their own contacts
CREATE POLICY "Users can view only their own contact info"
    ON public.user_contacts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact info"
    ON public.user_contacts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact info"
    ON public.user_contacts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact info"
    ON public.user_contacts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Migrate existing phone numbers from profiles to user_contacts
INSERT INTO public.user_contacts (user_id, phone_number)
SELECT user_id, phone_number
FROM public.profiles
WHERE phone_number IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Remove phone_number column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_number;

-- 3. FIX: Set up proper RBAC system for future use
-- Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');
    END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'user',
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    granted_by uuid REFERENCES auth.users(id),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles - users can see their own roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only admins can modify roles (enforced via security definer function)
CREATE POLICY "Only system can manage roles"
    ON public.user_roles
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Create security definer function for safe role management (admin use only)
CREATE OR REPLACE FUNCTION public.grant_user_role(
    _user_id uuid,
    _role public.app_role,
    _admin_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only admins can grant roles
    IF NOT public.has_role(_admin_id, 'admin') THEN
        RAISE EXCEPTION 'Only administrators can grant roles';
    END IF;
    
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (_user_id, _role, _admin_id)
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- 4. FIX: Add missing RLS policies for chat_messages DELETE
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;
CREATE POLICY "Users can delete their own messages"
    ON public.chat_messages
    FOR DELETE
    USING (auth.uid() = sender_id);

-- 5. FIX: Add missing RLS policies for conversation_participants
DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_participants;
CREATE POLICY "Users can leave conversations"
    ON public.conversation_participants
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. FIX: Add missing RLS policies for conversations
DROP POLICY IF EXISTS "Creators can update conversation details" ON public.conversations;
CREATE POLICY "Creators can update conversation details"
    ON public.conversations
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- 7. SECURITY: Remove SMS auth logs SELECT policy for enhanced security
DROP POLICY IF EXISTS "Users can view SMS log metadata only" ON public.sms_auth_logs;

-- Create secure function to check verification status without exposing logs
CREATE OR REPLACE FUNCTION public.is_phone_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.sms_auth_logs
        WHERE user_id = _user_id
        AND verified_at IS NOT NULL
        AND verified_at > now() - interval '30 days'
    )
$$;

-- 8. Create updated_at trigger for user_contacts
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_contacts_updated_at ON public.user_contacts;
CREATE TRIGGER update_user_contacts_updated_at
    BEFORE UPDATE ON public.user_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Add indexes for performance on new tables
CREATE INDEX IF NOT EXISTS idx_user_contacts_user_id ON public.user_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_contacts TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_phone_verified TO authenticated;

-- Assign default 'user' role to all existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::public.app_role
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;