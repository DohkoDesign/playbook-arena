-- Corriger toutes les politiques RLS avec récursion infinie

-- Supprimer toutes les politiques problématiques sur teams
DROP POLICY IF EXISTS "teams_members_can_view" ON public.teams;
DROP POLICY IF EXISTS "teams_owners_full_access" ON public.teams;

-- Recréer les politiques teams sans récursion
CREATE POLICY "teams_owners_full_access" ON public.teams
FOR ALL USING (
  created_by = auth.uid()
);

CREATE POLICY "teams_members_can_view" ON public.teams
FOR SELECT USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id 
    AND user_id = auth.uid()
  )
);