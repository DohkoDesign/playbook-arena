-- Corriger définitivement la récursion infinie sur teams

-- Supprimer toutes les politiques existantes sur teams
DROP POLICY IF EXISTS "teams_members_can_view" ON public.teams;
DROP POLICY IF EXISTS "teams_owners_full_access" ON public.teams;

-- Créer une fonction security definer pour vérifier l'appartenance à une équipe
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
  );
$$;

-- Recréer les politiques sans récursion en utilisant la fonction
CREATE POLICY "teams_owners_full_access" ON public.teams
FOR ALL USING (
  created_by = auth.uid()
);

CREATE POLICY "teams_members_can_view" ON public.teams
FOR SELECT USING (
  created_by = auth.uid() 
  OR public.is_team_member(id)
);