-- Ajouter une policy pour permettre au staff de gérer les disponibilités des joueurs
CREATE POLICY "Team staff can manage player availabilities"
ON public.player_availabilities
FOR ALL
USING (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.created_by = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() 
    AND team_members.role IN ('manager', 'coach', 'owner')
  )
);