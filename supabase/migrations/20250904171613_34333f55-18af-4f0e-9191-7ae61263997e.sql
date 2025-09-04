-- Fix the column ambiguity issue in join_team_with_code function
-- by properly aliasing the tables

DROP FUNCTION IF EXISTS public.join_team_with_code(text);

CREATE OR REPLACE FUNCTION public.join_team_with_code(p_code text)
RETURNS TABLE(team_id uuid, assigned_role player_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  team_record RECORD;
  current_uses INTEGER;
BEGIN
  -- Vérifier que le code existe et est valide - using proper table aliases
  SELECT tc.id as code_id, tc.team_id as team_uuid, tc.max_uses, tc.used_by, tc.role
  INTO team_record
  FROM public.team_codes tc
  WHERE tc.code = upper(p_code)
  AND tc.is_active = true
  AND tc.expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code équipe invalide ou expiré';
  END IF;

  -- Vérifier si l'utilisateur est déjà membre
  IF EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_record.team_uuid 
    AND tm.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT team_record.team_uuid::uuid, (
      SELECT tm.role FROM public.team_members tm 
      WHERE tm.team_id = team_record.team_uuid AND tm.user_id = auth.uid() 
      LIMIT 1
    )::player_role;
    RETURN;
  END IF;

  -- Vérifier les limites d'utilisation
  current_uses := COALESCE(array_length(team_record.used_by, 1), 0);
  IF team_record.max_uses IS NOT NULL AND current_uses >= team_record.max_uses THEN
    RAISE EXCEPTION 'Ce code a atteint sa limite d''utilisation';
  END IF;

  -- Ajouter l'utilisateur à l'équipe avec le rôle du code
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (team_record.team_uuid, auth.uid(), team_record.role);

  -- Marquer le code comme utilisé par cet utilisateur
  UPDATE public.team_codes
  SET used_by = COALESCE(used_by, '{}') || auth.uid()
  WHERE id = team_record.code_id;

  RETURN QUERY SELECT team_record.team_uuid::uuid, team_record.role::player_role;
END;
$$;