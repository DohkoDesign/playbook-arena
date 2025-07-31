-- Supprimer la politique problématique
DROP POLICY IF EXISTS "Team members can view their team info" ON public.teams;

-- Créer une fonction sécurisée pour vérifier si un utilisateur est membre d'une équipe
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
  );
$$;

-- Créer une nouvelle politique utilisant cette fonction
CREATE POLICY "Team members can view their team info" 
ON public.teams 
FOR SELECT 
USING (public.is_team_member(id));