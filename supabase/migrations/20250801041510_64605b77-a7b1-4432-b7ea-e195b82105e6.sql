-- Mettre à jour les créateurs d'équipe existants pour avoir le rôle owner
UPDATE team_members 
SET role = 'owner'::player_role 
WHERE user_id IN (
  SELECT created_by 
  FROM teams 
  WHERE teams.id = team_members.team_id
);

-- Fonction pour vérifier si un utilisateur a un rôle spécifique dans une équipe
CREATE OR REPLACE FUNCTION public.has_team_role(team_uuid uuid, required_role player_role, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role = required_role
  );
$function$;

-- Fonction pour vérifier si un utilisateur a des permissions de management (owner, manager, coach)
CREATE OR REPLACE FUNCTION public.has_management_role(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role IN ('owner', 'manager', 'coach')
  );
$function$;

-- Fonction pour vérifier si un utilisateur a des permissions administratives (owner seulement)
CREATE OR REPLACE FUNCTION public.has_admin_role(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role = 'owner'
  );
$function$;

-- Mettre à jour les politiques RLS pour les équipes
DROP POLICY IF EXISTS "Teams: owners can view and manage" ON teams;
CREATE POLICY "Teams: owners can view and manage" ON teams
FOR ALL USING (has_admin_role(id));

-- Mettre à jour les politiques pour les événements
DROP POLICY IF EXISTS "Events: team members can manage" ON events;
CREATE POLICY "Events: management can manage events" ON events
FOR ALL USING (has_management_role(team_id));

-- Mettre à jour les politiques pour les stratégies  
DROP POLICY IF EXISTS "Strategies: team members can manage" ON strategies;
CREATE POLICY "Strategies: management can manage strategies" ON strategies
FOR ALL USING (has_management_role(team_id));

-- Mettre à jour les politiques pour les sessions de coaching
DROP POLICY IF EXISTS "Coaching sessions: team members can manage" ON coaching_sessions;
CREATE POLICY "Coaching sessions: management can manage" ON coaching_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = coaching_sessions.event_id 
    AND has_management_role(e.team_id)
  )
);

-- Mettre à jour les politiques pour les invitations (owner seulement)
DROP POLICY IF EXISTS "Invitations: team creators can manage" ON invitations;
CREATE POLICY "Invitations: owners can manage" ON invitations
FOR ALL USING (has_admin_role(team_id));

DROP POLICY IF EXISTS "Team creators can create invitations" ON invitations;
CREATE POLICY "Owners can create invitations" ON invitations
FOR INSERT WITH CHECK (has_admin_role(team_id));

-- Mettre à jour les politiques pour team_members (owner seulement pour modification des rôles)
DROP POLICY IF EXISTS "Team members: simple access" ON team_members;
CREATE POLICY "Team members can view" ON team_members
FOR SELECT USING (
  auth.uid() = user_id OR 
  has_management_role(team_id)
);

CREATE POLICY "Owners can manage team members" ON team_members
FOR INSERT WITH CHECK (has_admin_role(team_id));

CREATE POLICY "Owners can update team members" ON team_members
FOR UPDATE USING (has_admin_role(team_id));

CREATE POLICY "Owners can delete team members" ON team_members
FOR DELETE USING (has_admin_role(team_id));

-- Politique spéciale pour que les utilisateurs puissent se joindre via invitation
CREATE POLICY "Users can join via invitation" ON team_members
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM invitations 
    WHERE invitations.team_id = team_members.team_id 
    AND invitations.used_at IS NULL 
    AND invitations.expires_at > now()
  )
);