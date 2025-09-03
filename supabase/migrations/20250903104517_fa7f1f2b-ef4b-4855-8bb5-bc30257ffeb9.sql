-- Phase 1: Critical security fixes (safe subset)

-- 1) Remove overly permissive public profiles policy
DROP POLICY IF EXISTS "Utilisateurs peuvent voir tous les profils" ON public.profiles;

-- 2) Remove public invitation read policies
DROP POLICY IF EXISTS "Allow anonymous read for invitations" ON public.invitations;
DROP POLICY IF EXISTS "invitations_public_view" ON public.invitations;

-- Keep existing owner manage policy on invitations intact
-- No new public SELECT policy is created, invitations are no longer publicly readable.
