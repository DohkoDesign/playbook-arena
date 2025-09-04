-- Créer une fonction pour valider un token d'invitation spécifique
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text, p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM invitations 
    WHERE token = p_token
    AND team_id = p_team_id
    AND used_at IS NULL 
    AND expires_at > now()
  );
$$;

-- Mettre à jour la politique pour utiliser cette nouvelle fonction
DROP POLICY IF EXISTS "team_members_join_with_invitation" ON public.team_members;

CREATE POLICY "team_members_join_with_invitation_token" 
ON public.team_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM invitations i 
    WHERE i.team_id = team_members.team_id 
    AND i.used_at IS NULL 
    AND i.expires_at > now()
  )
);