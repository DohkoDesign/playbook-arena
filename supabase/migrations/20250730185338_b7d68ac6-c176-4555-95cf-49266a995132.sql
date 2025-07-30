-- Supprimer TOUTES les politiques problématiques
DROP POLICY IF EXISTS "Users can view teams they created" ON public.teams;
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
DROP POLICY IF EXISTS "Users can view team members where they are creator" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own team membership" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage team members" ON public.team_members;

-- Créer des politiques ULTRA-SIMPLES sans aucune référence croisée
CREATE POLICY "Teams: owners can view and manage" 
ON public.teams FOR ALL 
USING (auth.uid() = created_by);

CREATE POLICY "Team members: simple access" 
ON public.team_members FOR ALL 
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT created_by FROM public.teams WHERE id = team_id
));