-- Corriger les politiques RLS avec récursion infinie

-- Supprimer les politiques problématiques sur profiles
DROP POLICY IF EXISTS "Staff can view team players profiles" ON public.profiles;

-- Créer une fonction security definer pour vérifier si l'utilisateur est staff d'une équipe
CREATE OR REPLACE FUNCTION public.is_staff_of_team_with_player(player_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM team_members tm1
    JOIN team_members tm2 ON tm1.team_id = tm2.team_id
    JOIN teams t ON t.id = tm1.team_id
    WHERE tm1.user_id = player_user_id
    AND (
      t.created_by = auth.uid()
      OR (tm2.user_id = auth.uid() AND tm2.role IN ('manager', 'coach', 'owner'))
    )
  );
$$;

-- Supprimer les politiques problématiques sur team_members  
DROP POLICY IF EXISTS "team_members_join_with_invitation" ON public.team_members;

-- Créer une fonction pour vérifier les invitations valides
CREATE OR REPLACE FUNCTION public.has_valid_invitation(team_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM invitations 
    WHERE team_id = team_uuid
    AND used_at IS NULL 
    AND expires_at > now()
  );
$$;

-- Recréer les politiques sans récursion
CREATE POLICY "Staff can view team players profiles" ON public.profiles
FOR SELECT USING (
  (role = 'player' AND public.is_staff_of_team_with_player(user_id))
);

CREATE POLICY "team_members_join_with_invitation" ON public.team_members
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND public.has_valid_invitation(team_id)
);