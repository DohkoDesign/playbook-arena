-- Ajouter une politique RLS pour permettre aux joueurs de voir les analyses VOD de leur équipe
CREATE POLICY "Team members can view team VOD reviews" 
ON public.vod_reviews 
FOR SELECT 
TO authenticated
USING (
  team_id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    WHERE tm.user_id = auth.uid()
  )
);