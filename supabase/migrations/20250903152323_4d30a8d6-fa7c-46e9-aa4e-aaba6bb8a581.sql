-- Fix critical security vulnerabilities

-- 1. Secure invitations table - restrict token visibility to team owners only
CREATE POLICY "Team owners can view their invitations" 
ON public.invitations 
FOR SELECT 
USING (team_id IN (
  SELECT id FROM public.teams WHERE created_by = auth.uid()
));

-- 2. Secure beta_codes table - only staff can view codes
CREATE POLICY "Staff can view beta codes" 
ON public.beta_codes 
FOR SELECT 
USING (is_staff_user());

-- 3. Fix database function security - update search_path for all functions
CREATE OR REPLACE FUNCTION public.has_team_role(team_uuid uuid, required_role player_role, user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role = required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_management_role(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role IN ('owner', 'manager', 'coach')
  );
$function$;

CREATE OR REPLACE FUNCTION public.current_user_email()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select (auth.jwt() ->> 'email')::text;
$function$;

CREATE OR REPLACE FUNCTION public.validate_beta_code_exists(code_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.beta_codes 
    WHERE code = code_input 
    AND used_at IS NULL 
    AND expires_at > now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_admin_role(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND role = 'owner'
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_valid_invitation(team_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM invitations 
    WHERE team_id = team_uuid
    AND used_at IS NULL 
    AND expires_at > now()
  );
$function$;

CREATE OR REPLACE FUNCTION public.validate_and_use_beta_code(beta_code text, user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  code_record RECORD;
BEGIN
  -- Check if code exists and is valid
  SELECT id, used_at, expires_at INTO code_record
  FROM public.beta_codes
  WHERE code = beta_code;
  
  -- Code doesn't exist
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Code already used
  IF code_record.used_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Code expired
  IF code_record.expires_at <= now() THEN
    RETURN FALSE;
  END IF;
  
  -- Mark code as used
  UPDATE public.beta_codes
  SET used_by = user_id, used_at = now()
  WHERE code = beta_code;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_staff_of_team_with_player(player_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid uuid, user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_staff_user(check_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id
    AND role = 'staff'
  );
$function$;

-- 4. Add audit logging for invitation access
CREATE OR REPLACE FUNCTION public.log_invitation_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log invitation token access for security monitoring
  INSERT INTO public.notifications (
    user_id,
    team_id,
    title,
    message,
    type,
    priority,
    metadata
  )
  VALUES (
    auth.uid(),
    NEW.team_id,
    'Invitation Access',
    'Invitation token was accessed',
    'info',
    'normal',
    jsonb_build_object(
      'invitation_id', NEW.id,
      'action', 'token_access',
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$function$;

-- Create trigger for invitation access logging
CREATE TRIGGER log_invitation_access_trigger
  AFTER SELECT ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.log_invitation_access();