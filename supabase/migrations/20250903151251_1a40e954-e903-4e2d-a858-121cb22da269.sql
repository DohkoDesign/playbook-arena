-- Create secure RPC for creating beta codes by staff
CREATE OR REPLACE FUNCTION public.admin_create_beta_code(p_code text, p_team_name text DEFAULT NULL, p_expires_at timestamptz DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Ensure caller is staff
  IF NOT public.is_staff_user() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Reject duplicate code
  IF EXISTS (SELECT 1 FROM public.beta_codes WHERE code = upper(p_code)) THEN
    RAISE EXCEPTION 'Code already exists';
  END IF;

  INSERT INTO public.beta_codes (code, team_name, expires_at)
  VALUES (
    upper(p_code),
    p_team_name,
    COALESCE(p_expires_at, now() + interval '6 months')
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Harden log_admin_action to avoid NOT NULL violations when no team exists
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  target_table text,
  target_id uuid DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  any_team uuid;
BEGIN
  -- Only log if user is staff
  IF public.is_staff_user() THEN
    SELECT id INTO any_team FROM public.teams LIMIT 1;

    IF any_team IS NOT NULL THEN
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
        any_team,
        'Admin Action',
        'Admin performed: ' || action_type || ' on ' || target_table,
        'info',
        'normal',
        jsonb_build_object(
          'action', action_type,
          'table', target_table,
          'target_id', target_id,
          'timestamp', now(),
          'admin_data', metadata
        )
      );
    END IF;
  END IF;
END;
$$;