-- Corriger les politiques RLS pour team_members lors de l'inscription via invitation
-- Supprimer l'ancienne politique d'insertion
DROP POLICY IF EXISTS "Users can join teams via invitation" ON public.team_members;

-- Créer une nouvelle politique qui permet l'insertion lors de l'inscription
CREATE POLICY "Users can join teams via invitation during signup" 
ON public.team_members 
FOR INSERT 
TO authenticated, anon
WITH CHECK (
  -- Permettre l'insertion si c'est l'utilisateur lui-même
  auth.uid() = user_id 
  OR 
  -- Ou si une invitation valide existe pour cette équipe
  EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE invitations.team_id = team_members.team_id 
    AND invitations.used_at IS NULL 
    AND invitations.expires_at > now()
  )
);