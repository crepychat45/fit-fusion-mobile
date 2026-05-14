-- Fix critical security issues identified in security review

-- 1. Add missing RLS policies for Fitfusion table
ALTER TABLE public."Fitfusion" ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for Fitfusion table (assuming it should be user-specific)
-- Note: Since Fitfusion table doesn't have user_id column, we'll add it first
ALTER TABLE public."Fitfusion" ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create RLS policies for Fitfusion
CREATE POLICY "Users can view their own fitfusion records" 
ON public."Fitfusion" 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fitfusion records" 
ON public."Fitfusion" 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitfusion records" 
ON public."Fitfusion" 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fitfusion records" 
ON public."Fitfusion" 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. Add missing INSERT policy for profiles table
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Fix overly permissive INSERT policy on Crepy Enterprise table
DROP POLICY IF EXISTS "Allow authenticated users to insert records" ON public."Crepy Enterprise";

CREATE POLICY "Users can create their own crepy enterprise records" 
ON public."Crepy Enterprise" 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 4. Fix database function search_path issues
-- Update existing functions to have proper search_path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$function$;

-- Fix get_user_profile function
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'id', u.id,
    'email', u.email,
    'name', p.name,
    'avatar_url', p.avatar_url,
    'website', p.website,
    'bio', p.bio,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'last_sign_in_at', u.last_sign_in_at,
    'user_metadata', u.raw_user_meta_data
  )
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE u.id = user_id;
$function$;

-- Fix recover_password function
CREATE OR REPLACE FUNCTION public.recover_password(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    target_user_id uuid;
BEGIN
    -- Check if the user exists
    SELECT user_id INTO target_user_id FROM public.profiles WHERE bio LIKE '%' || user_email || '%';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % does not exist.', user_email;
    END IF;

    -- Generate password recovery notification
    RAISE NOTICE 'Password recovery email sent to %', user_email;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error occurred: %', SQLERRM;
END;
$function$;