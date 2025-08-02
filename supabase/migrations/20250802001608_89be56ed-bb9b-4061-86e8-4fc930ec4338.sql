-- Supprimer les politiques problématiques qui créent des récursions
DROP POLICY IF EXISTS "Membres peuvent voir les membres de leurs équipes" ON public.team_members;
DROP POLICY IF EXISTS "Managers peuvent ajouter des membres" ON public.team_members;
DROP POLICY IF EXISTS "Managers peuvent voir les invitations de leurs équipes" ON public.invitations;
DROP POLICY IF EXISTS "Managers peuvent créer des invitations" ON public.invitations;

-- Recréer les politiques sans récursion
CREATE POLICY "Team members can view team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = team_members.team_id 
      AND (teams.created_by = auth.uid() OR team_members.user_id = auth.uid())
    )
  );

CREATE POLICY "Team owners can add members" ON public.team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = team_members.team_id 
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team owners can view invitations" ON public.invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = invitations.team_id 
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team owners can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = invitations.team_id 
      AND teams.created_by = auth.uid()
    )
  );