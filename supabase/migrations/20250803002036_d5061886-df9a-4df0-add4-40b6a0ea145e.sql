-- Nettoyer toutes les politiques existantes et recréer un système simple et fiable
-- DROP ALL EXISTING POLICIES

-- Teams policies
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

-- Team members policies  
DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can view all memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can join via valid invitation" ON public.team_members;
DROP POLICY IF EXISTS "Owners can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view" ON public.team_members;

-- Other tables policies cleanup
DROP POLICY IF EXISTS "Invitations: owners can manage" ON public.invitations;
DROP POLICY IF EXISTS "Owners can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Team members can view invitations for their teams" ON public.invitations;
DROP POLICY IF EXISTS "Team owners can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Team owners can view invitations" ON public.invitations;

-- Events policies cleanup
DROP POLICY IF EXISTS "Events: management can manage events" ON public.events;
DROP POLICY IF EXISTS "Team members can create events" ON public.events;
DROP POLICY IF EXISTS "Team members can view team events" ON public.events;

-- Strategies policies cleanup  
DROP POLICY IF EXISTS "Strategies: management can manage strategies" ON public.strategies;
DROP POLICY IF EXISTS "Team members can create strategies" ON public.strategies;
DROP POLICY IF EXISTS "Team members can view strategies" ON public.strategies;

-- Player profiles cleanup
DROP POLICY IF EXISTS "Player profiles: team members can view and manage" ON public.player_profiles;
DROP POLICY IF EXISTS "Team members can view player profiles" ON public.player_profiles;

-- RECREATE SIMPLE AND EFFECTIVE POLICIES

-- 1. TEAMS: Propriétaires peuvent tout faire, membres peuvent voir
CREATE POLICY "teams_owners_full_access" 
ON public.teams FOR ALL 
USING (created_by = auth.uid());

CREATE POLICY "teams_members_can_view" 
ON public.teams FOR SELECT 
USING (
  created_by = auth.uid() 
  OR id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);

-- 2. TEAM_MEMBERS: Gestion simple
CREATE POLICY "team_members_owners_manage" 
ON public.team_members FOR ALL 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "team_members_view_own" 
ON public.team_members FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "team_members_join_with_invitation" 
ON public.team_members FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND team_id IN (
    SELECT team_id FROM public.invitations 
    WHERE used_at IS NULL 
    AND expires_at > now()
  )
);

-- 3. INVITATIONS: Propriétaires peuvent gérer
CREATE POLICY "invitations_owners_manage" 
ON public.invitations FOR ALL 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "invitations_public_view" 
ON public.invitations FOR SELECT 
USING (true);

-- 4. PLAYER_PROFILES: Sécurité de base
CREATE POLICY "player_profiles_team_access" 
ON public.player_profiles FOR ALL 
USING (
  user_id = auth.uid() 
  OR team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);

-- 5. EVENTS: Membres d'équipe peuvent voir
CREATE POLICY "events_team_members_view" 
ON public.events FOR SELECT 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "events_staff_manage_insert" 
ON public.events FOR INSERT 
WITH CHECK (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'coach', 'capitaine')
  )
);

CREATE POLICY "events_staff_manage_update" 
ON public.events FOR UPDATE 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'coach', 'capitaine')
  )
);

CREATE POLICY "events_staff_manage_delete" 
ON public.events FOR DELETE 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'coach', 'capitaine')
  )
);

-- 6. STRATEGIES: Même logique que events
CREATE POLICY "strategies_team_members_view" 
ON public.strategies FOR SELECT 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "strategies_staff_manage_insert" 
ON public.strategies FOR INSERT 
WITH CHECK (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'coach', 'capitaine')
  )
);

CREATE POLICY "strategies_staff_manage_update" 
ON public.strategies FOR UPDATE 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'coach', 'capitaine')
  )
);

CREATE POLICY "strategies_staff_manage_delete" 
ON public.strategies FOR DELETE 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('manager', 'coach', 'capitaine')
  )
);

-- Nettoyage des anciens triggers et fonctions problématiques
DROP TRIGGER IF EXISTS validate_team_member_role_update_trigger ON public.team_members;
DROP FUNCTION IF EXISTS public.validate_team_member_role_update();
DROP FUNCTION IF EXISTS public.validate_role_change(uuid, uuid, player_role);

-- Assurer que le trigger pour ajouter le créateur comme membre fonctionne
CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter le créateur comme propriétaire de l'équipe
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS add_team_creator_trigger ON public.teams;
CREATE TRIGGER add_team_creator_trigger
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_team_creator_as_member();