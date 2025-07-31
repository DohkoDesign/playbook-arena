-- Permettre aux membres d'équipe de voir les informations de leur équipe
CREATE POLICY "Team members can view their team info" 
ON public.teams 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM team_members tm 
    WHERE tm.team_id = teams.id 
    AND tm.user_id = auth.uid()
  )
);