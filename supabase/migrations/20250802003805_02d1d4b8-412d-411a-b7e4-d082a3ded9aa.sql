-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.validate_role_change(
  target_user_id uuid,
  target_team_id uuid,
  new_role player_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.validate_team_member_role_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT auth.uid(),
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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