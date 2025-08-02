-- Supprimer toutes les politiques problématiques qui peuvent créer des récursions
DROP POLICY IF EXISTS "Créateurs peuvent voir leurs équipes" ON public.teams;
DROP POLICY IF EXISTS "Membres peuvent voir leurs équipes" ON public.teams;
DROP POLICY IF EXISTS "Team members can view team members" ON public.team_members;

-- Créer des politiques simples sans récursion pour la table teams
CREATE POLICY "Team creators can view their teams" ON public.teams
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams" ON public.teams
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Team creators can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Créer une politique simple pour team_members
CREATE POLICY "Users can view team members where they are members" ON public.team_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  );

-- Créer une fonction sécurisée pour éviter les récursions
CREATE OR REPLACE FUNCTION public.is_team_owner(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_uuid AND created_by = user_uuid
  );
$$;

-- Politique pour que les membres voient les équipes dont ils font partie
CREATE POLICY "Team members can view teams they belong to" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT DISTINCT team_id 
      FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );