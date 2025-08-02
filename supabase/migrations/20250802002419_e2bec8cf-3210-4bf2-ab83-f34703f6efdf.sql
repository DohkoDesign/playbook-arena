-- Désactiver temporairement RLS pour débloquer l'accès
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques problématiques
DROP POLICY IF EXISTS "allow_team_creators_full_access" ON public.teams;
DROP POLICY IF EXISTS "allow_team_members_read_access" ON public.teams;
DROP POLICY IF EXISTS "allow_team_members_view" ON public.team_members;
DROP POLICY IF EXISTS "allow_team_owners_add_members" ON public.team_members;
DROP POLICY IF EXISTS "allow_team_owners_manage_members" ON public.team_members;
DROP POLICY IF EXISTS "allow_users_join_via_invitation" ON public.team_members;