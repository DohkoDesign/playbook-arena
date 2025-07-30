-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage team members" ON public.team_members;

-- Créer des politiques simplifiées sans récursion
CREATE POLICY "Users can view teams they created" 
ON public.teams FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can view teams they are members of" 
ON public.teams FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid())
);

-- Politique simple pour team_members sans récursion
CREATE POLICY "Users can view team members where they are creator" 
ON public.team_members FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

CREATE POLICY "Users can view their own team membership" 
ON public.team_members FOR SELECT 
USING (auth.uid() = user_id);

-- Politique simple pour la gestion des membres
CREATE POLICY "Team creators can manage team members" 
ON public.team_members FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);