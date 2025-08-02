-- Ajouter les politiques manquantes pour team_members
CREATE POLICY "allow_team_owners_add_members" ON public.team_members
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  );

CREATE POLICY "allow_team_owners_manage_members" ON public.team_members
  FOR ALL USING (
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  );

-- Permettre aux utilisateurs de se joindre via invitation
CREATE POLICY "allow_users_join_via_invitation" ON public.team_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE team_id = team_members.team_id 
      AND used_at IS NULL 
      AND expires_at > now()
    )
  );