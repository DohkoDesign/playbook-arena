-- Re-enable RLS on critical tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Créateurs peuvent voir leurs équipes" ON public.teams;
DROP POLICY IF EXISTS "Membres peuvent voir leurs équipes" ON public.teams;
DROP POLICY IF EXISTS "Team members can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can add members" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams via invitation during signup" ON public.team_members;
DROP POLICY IF EXISTS "Users can join via invitation" ON public.team_members;

-- Create secure team policies
CREATE POLICY "Team owners can manage their teams"
ON public.teams
FOR ALL
USING (created_by = auth.uid());

CREATE POLICY "Team members can view their teams"
ON public.teams
FOR SELECT
USING (
  id IN (
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);

-- Create secure team member policies
CREATE POLICY "Team owners can manage members"
ON public.team_members
FOR ALL
USING (
  team_id IN (
    SELECT id 
    FROM public.teams 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Members can view team membership"
ON public.team_members
FOR SELECT
USING (
  user_id = auth.uid() 
  OR team_id IN (
    SELECT id 
    FROM public.teams 
    WHERE created_by = auth.uid()
  )
  OR team_id IN (
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join via valid invitation"
ON public.team_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 
    FROM public.invitations 
    WHERE team_id = team_members.team_id 
    AND used_at IS NULL 
    AND expires_at > now()
  )
);

-- Create secure role validation function
CREATE OR REPLACE FUNCTION public.validate_role_change(
  target_user_id uuid,
  target_team_id uuid,
  new_role player_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only team owners can change roles
  IF NOT EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = target_team_id 
    AND created_by = auth.uid()
  ) THEN
    RETURN false;
  END IF;

  -- Cannot change owner role
  IF new_role = 'owner' AND target_user_id != auth.uid() THEN
    RETURN false;
  END IF;

  -- User must be a team member
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE user_id = target_user_id 
    AND team_id = target_team_id
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Add role change validation trigger
CREATE OR REPLACE FUNCTION public.validate_team_member_role_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Skip validation for new inserts
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Validate role changes
  IF OLD.role != NEW.role THEN
    IF NOT public.validate_role_change(NEW.user_id, NEW.team_id, NEW.role) THEN
      RAISE EXCEPTION 'Unauthorized role change attempt';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for role validation
DROP TRIGGER IF EXISTS validate_role_changes ON public.team_members;
CREATE TRIGGER validate_role_changes
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_team_member_role_update();

-- Add input validation function for passwords
CREATE OR REPLACE FUNCTION public.validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Minimum 8 characters
  IF length(password) < 8 THEN
    RETURN false;
  END IF;

  -- Must contain at least one letter and one number
  IF NOT (password ~ '[a-zA-Z]' AND password ~ '[0-9]') THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Add notification for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT auth.uid(),
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    team_id,
    title,
    message,
    type,
    priority,
    metadata
  )
  SELECT 
    user_id,
    (SELECT team_id FROM public.team_members WHERE user_id = log_security_event.user_id LIMIT 1),
    'Security Alert',
    'Suspicious activity detected: ' || event_type,
    'warning',
    'high',
    metadata
  WHERE user_id IS NOT NULL;
END;
$$;