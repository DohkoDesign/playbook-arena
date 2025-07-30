-- Permettre l'accès public aux équipes pour la vérification d'invitations
CREATE POLICY "Public can read teams for invitation verification"
ON public.teams
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE invitations.team_id = teams.id 
    AND invitations.used_at IS NULL 
    AND invitations.expires_at > now()
  )
);