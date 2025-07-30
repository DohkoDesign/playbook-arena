-- Permettre l'accès public aux invitations pour la vérification
CREATE POLICY "Public can read valid invitations for verification"
ON public.invitations
FOR SELECT
TO anon
USING (
  used_at IS NULL 
  AND expires_at > now()
);