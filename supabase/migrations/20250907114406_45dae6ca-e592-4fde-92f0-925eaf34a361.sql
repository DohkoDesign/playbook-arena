-- Ajouter les permissions pour les joueurs sur les VODs et coaching sessions
-- Mettre à jour les policies pour les vod_reviews pour inclure les joueurs
DROP POLICY IF EXISTS "Team members can view team VOD reviews" ON vod_reviews;

CREATE POLICY "Team members can view team VOD reviews" 
ON vod_reviews 
FOR SELECT 
TO authenticated
USING (
  team_id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    WHERE tm.user_id = auth.uid()
  ) OR 
  team_id IN (
    SELECT t.id 
    FROM teams t 
    WHERE t.created_by = auth.uid()
  )
);

-- Ajouter une policy pour que les joueurs puissent voir les coaching sessions
CREATE POLICY "Team members can view coaching sessions" 
ON coaching_sessions 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 
  FROM events e 
  JOIN team_members tm ON tm.team_id = e.team_id 
  WHERE e.id = coaching_sessions.event_id 
  AND tm.user_id = auth.uid()
));