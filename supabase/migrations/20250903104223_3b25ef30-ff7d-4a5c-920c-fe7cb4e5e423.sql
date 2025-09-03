-- Phase 1: Critical Data Protection Fixes

-- 1. Remove public profile exposure - drop the overly permissive policy
DROP POLICY IF EXISTS "Utilisateurs peuvent voir tous les profils" ON public.profiles;

-- 2. Remove public access to invitations table
DROP POLICY IF EXISTS "Allow anonymous read for invitations" ON public.invitations;
DROP POLICY IF EXISTS "invitations_public_view" ON public.invitations;

-- 3. Add proper invitation policy - only allow access to valid, unexpired invitations by token
CREATE POLICY "Valid invitations can be viewed by token" 
ON public.invitations 
FOR SELECT 
USING (used_at IS NULL AND expires_at > now());

-- 4. Improve password validation function
CREATE OR REPLACE FUNCTION public.validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $function$
BEGIN
  -- Minimum 8 characters
  IF length(password) < 8 THEN
    RETURN false;
  END IF;

  -- Must contain at least one letter and one number
  IF NOT (password ~ '[a-zA-Z]' AND password ~ '[0-9]') THEN
    RETURN false;
  END IF;

  -- Must contain at least one special character
  IF NOT (password ~ '[^a-zA-Z0-9]') THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;

-- 5. Add admin role to user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('player', 'staff', 'admin');
    ELSE
        -- Add admin to existing enum if not present
        BEGIN
            ALTER TYPE user_role ADD VALUE 'admin';
        EXCEPTION 
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- 6. Create function to check admin role securely
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
$function$;

-- 7. Fix all database functions to have proper search_path
CREATE OR REPLACE FUNCTION public.has_team_role(team_uuid uuid, required_role player_role, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role = required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_management_role(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role IN ('owner', 'manager', 'coach')
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_admin_role(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role = 'owner'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_staff_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id
    AND role = 'staff'
  );
$function$;