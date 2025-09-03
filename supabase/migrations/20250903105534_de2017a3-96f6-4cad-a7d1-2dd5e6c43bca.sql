-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.is_staff_of_team_with_player(player_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.has_valid_invitation(team_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM invitations 
    WHERE team_id = team_uuid
    AND used_at IS NULL 
    AND expires_at > now()
  );
$function$;