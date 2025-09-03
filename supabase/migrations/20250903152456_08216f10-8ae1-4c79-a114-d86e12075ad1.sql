-- Fix remaining database functions without proper search_path

CREATE OR REPLACE FUNCTION public.generate_intelligent_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clean up expired notifications
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < now();

  -- Generate availability reminders (weekly)
  INSERT INTO public.notifications (user_id, team_id, title, message, type, priority, expires_at)
  SELECT DISTINCT 
    tm.user_id,
    tm.team_id,
    'Disponibilités manquantes',
    'N''oubliez pas de mettre à jour vos disponibilités pour cette semaine.',
    'warning',
    'normal',
    now() + interval '7 days'
  FROM public.team_members tm
  LEFT JOIN public.player_availabilities pa ON (
    pa.user_id = tm.user_id 
    AND pa.team_id = tm.team_id 
    AND pa.week_start = date_trunc('week', now())::date
  )
  WHERE tm.role IN ('joueur', 'remplacant', 'capitaine')
    AND pa.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = tm.user_id 
        AND n.title = 'Disponibilités manquantes'
        AND n.created_at > now() - interval '7 days'
    );

  -- Generate profile completion reminders
  INSERT INTO public.notifications (user_id, team_id, title, message, type, priority, expires_at)
  SELECT DISTINCT 
    tm.user_id,
    tm.team_id,
    'Profil incomplet',
    'Complétez votre profil joueur pour améliorer l''expérience d''équipe.',
    'info',
    'normal',
    now() + interval '30 days'
  FROM public.team_members tm
  LEFT JOIN public.player_profiles pp ON (pp.user_id = tm.user_id AND pp.team_id = tm.team_id)
  WHERE tm.role IN ('joueur', 'remplacant', 'capitaine')
    AND (
      pp.id IS NULL 
      OR (pp.points_forts IS NULL OR array_length(pp.points_forts, 1) < 3)
      OR (pp.objectifs_individuels IS NULL OR array_length(pp.objectifs_individuels, 1) < 1)
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = tm.user_id 
        AND n.title = 'Profil incomplet'
        AND n.created_at > now() - interval '14 days'
    );

  -- Generate upcoming events reminders
  INSERT INTO public.notifications (user_id, team_id, title, message, type, priority, action_url, action_label, expires_at)
  SELECT DISTINCT 
    tm.user_id,
    e.team_id,
    'Événement à venir: ' || e.titre,
    'Un événement est prévu pour ' || to_char(e.date_debut, 'DD/MM/YYYY à HH24:MI'),
    'info',
    CASE 
      WHEN e.date_debut - now() < interval '2 hours' THEN 'urgent'
      WHEN e.date_debut - now() < interval '24 hours' THEN 'high'
      ELSE 'normal'
    END,
    '/dashboard',
    'Voir le calendrier',
    e.date_debut
  FROM public.events e
  JOIN public.team_members tm ON tm.team_id = e.team_id
  WHERE e.date_debut > now() 
    AND e.date_debut < now() + interval '7 days'
    AND tm.role IN ('joueur', 'remplacant', 'capitaine')
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = tm.user_id 
        AND n.title = 'Événement à venir: ' || e.titre
        AND n.created_at > now() - interval '1 day'
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_admin_action(action_type text, target_table text, target_id uuid DEFAULT NULL::uuid, metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_create_beta_code(p_code text, p_team_name text DEFAULT NULL::text, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert owner membership, ignore if it already exists
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_role_change(target_user_id uuid, target_team_id uuid, new_role player_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, user_id uuid DEFAULT auth.uid(), metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, pseudo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'pseudo', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;