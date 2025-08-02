-- Supprimer TOUTES les politiques existantes pour repartir à zéro
DROP POLICY IF EXISTS "Team creators can update their teams" ON public.teams;
DROP POLICY IF EXISTS "Team creators can create teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view team members where they are members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view teams they belong to" ON public.teams;

-- Supprimer aussi les autres politiques potentiellement problématiques
DROP POLICY IF EXISTS "Allow anonymous read for teams" ON public.teams;
DROP POLICY IF EXISTS "Team creators can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Créateurs peuvent créer des équipes" ON public.teams;
DROP POLICY IF EXISTS "Créateurs peuvent modifier leurs équipes" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their team info" ON public.teams;
DROP POLICY IF EXISTS "Teams: owners can view and manage" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;

-- Créer des politiques propres et simples
CREATE POLICY "allow_team_creators_full_access" ON public.teams
  FOR ALL USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "allow_team_members_read_access" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT DISTINCT team_id 
      FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Politique simple pour team_members
CREATE POLICY "allow_team_members_view" ON public.team_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  );