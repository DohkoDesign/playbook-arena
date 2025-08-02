-- Drop all conflicting policies to fix infinite recursion
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Members can view team membership" ON public.team_members;
DROP POLICY IF EXISTS "Users can join via valid invitation" ON public.team_members;

-- Create simple, non-recursive policies for teams
CREATE POLICY "Team owners can manage their teams"
ON public.teams
FOR ALL
USING (created_by = auth.uid());

CREATE POLICY "Team members can view their teams"
ON public.teams
FOR SELECT
USING (
  created_by = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = teams.id 
    AND tm.user_id = auth.uid()
  )
);

-- Create simple, non-recursive policies for team_members
CREATE POLICY "Team owners can manage members"
ON public.team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_members.team_id 
    AND t.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view their own membership"
ON public.team_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Team owners can view all memberships"
ON public.team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_members.team_id 
    AND t.created_by = auth.uid()
  )
);

CREATE POLICY "Users can join via valid invitation"
ON public.team_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE team_id = team_members.team_id 
    AND used_at IS NULL 
    AND expires_at > now()
  )
);