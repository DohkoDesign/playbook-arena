-- Drop and recreate functions with correct signatures
DROP FUNCTION IF EXISTS public.validate_team_code(text);
DROP FUNCTION IF EXISTS public.join_team_with_code(text);

-- Add role column to team_codes if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'team_codes' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.team_codes
      ADD COLUMN role player_role NOT NULL DEFAULT 'joueur';
  END IF;
END $$;

-- Fix policies
DROP POLICY IF EXISTS "Team owners can manage their codes" ON public.team_codes;
DROP POLICY IF EXISTS "Team management can manage codes" ON public.team_codes;

-- Owner policies
CREATE POLICY "Team owners can select their codes" 
ON public.team_codes FOR SELECT 
USING (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

CREATE POLICY "Team owners can insert their codes" 
ON public.team_codes FOR INSERT 
WITH CHECK (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

CREATE POLICY "Team owners can update their codes" 
ON public.team_codes FOR UPDATE 
USING (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

CREATE POLICY "Team owners can delete their codes" 
ON public.team_codes FOR DELETE 
USING (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

-- Management policies
CREATE POLICY "Team management can select codes" 
ON public.team_codes FOR SELECT 
USING (team_id IN (
  SELECT tm.team_id FROM public.team_members tm 
  WHERE tm.user_id = auth.uid() AND tm.role IN ('owner','manager','coach')
));

CREATE POLICY "Team management can insert codes" 
ON public.team_codes FOR INSERT 
WITH CHECK (team_id IN (
  SELECT tm.team_id FROM public.team_members tm 
  WHERE tm.user_id = auth.uid() AND tm.role IN ('owner','manager','coach')
));

CREATE POLICY "Team management can update codes" 
ON public.team_codes FOR UPDATE 
USING (team_id IN (
  SELECT tm.team_id FROM public.team_members tm 
  WHERE tm.user_id = auth.uid() AND tm.role IN ('owner','manager','coach')
));

CREATE POLICY "Team management can delete codes" 
ON public.team_codes FOR DELETE 
USING (team_id IN (
  SELECT tm.team_id FROM public.team_members tm 
  WHERE tm.user_id = auth.uid() AND tm.role IN ('owner','manager','coach')
));

-- Recreate validate_team_code function with role return
CREATE OR REPLACE FUNCTION public.validate_team_code(p_code text)
RETURNS TABLE(team_id uuid, team_name text, role player_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.nom, tc.role
  FROM public.team_codes tc
  JOIN public.teams t ON t.id = tc.team_id
  WHERE tc.code = upper(p_code)
  AND tc.is_active = true
  AND tc.expires_at > now()
  AND (
    tc.max_uses IS NULL OR COALESCE(array_length(tc.used_by, 1), 0) < tc.max_uses
  );
END;
$$;

-- Recreate join_team_with_code function with role handling
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
  -- Vérifier que le code existe et est valide
  SELECT tc.id, tc.team_id, tc.max_uses, tc.used_by, tc.role
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
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_record.team_id 
    AND user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT team_record.team_id::uuid, (
      SELECT tm.role FROM public.team_members tm 
      WHERE tm.team_id = team_record.team_id AND tm.user_id = auth.uid() 
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
  VALUES (team_record.team_id, auth.uid(), team_record.role);

  -- Marquer le code comme utilisé par cet utilisateur
  UPDATE public.team_codes
  SET used_by = COALESCE(used_by, '{}') || auth.uid()
  WHERE id = team_record.id;

  RETURN QUERY SELECT team_record.team_id::uuid, team_record.role::player_role;
END;
$$;