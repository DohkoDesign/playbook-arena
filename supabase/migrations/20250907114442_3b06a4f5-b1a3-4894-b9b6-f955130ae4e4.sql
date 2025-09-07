-- Supprimer et recréer la policy pour les VOD reviews
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