-- Créer la table team_codes pour remplacer les invitations
CREATE TABLE public.team_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  used_by UUID ARRAY DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL
);

-- Activer RLS
ALTER TABLE public.team_codes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Team owners can manage their codes" 
ON public.team_codes 
FOR ALL 
USING (team_id IN (
  SELECT id FROM public.teams WHERE created_by = auth.uid()
));

CREATE POLICY "Team management can manage codes" 
ON public.team_codes 
FOR ALL 
USING (team_id IN (
  SELECT tm.team_id FROM public.team_members tm 
  WHERE tm.user_id = auth.uid() 
  AND tm.role IN ('owner', 'manager', 'coach')
));

-- Fonction pour valider un code d'équipe
CREATE OR REPLACE FUNCTION public.validate_team_code(p_code text)
RETURNS TABLE(team_id uuid, team_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.nom
  FROM public.team_codes tc
  JOIN public.teams t ON t.id = tc.team_id
  WHERE tc.code = upper(p_code)
  AND tc.is_active = true
  AND tc.expires_at > now()
  AND (tc.max_uses IS NULL OR array_length(tc.used_by, 1) < tc.max_uses OR tc.used_by IS NULL);
END;
$$;

-- Fonction pour rejoindre une équipe avec un code
CREATE OR REPLACE FUNCTION public.join_team_with_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  team_record RECORD;
  current_uses INTEGER;
BEGIN
  -- Vérifier que le code existe et est valide
  SELECT tc.id, tc.team_id, tc.max_uses, tc.used_by
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
    RAISE EXCEPTION 'Vous êtes déjà membre de cette équipe';
  END IF;

  -- Vérifier les limites d'utilisation
  current_uses := COALESCE(array_length(team_record.used_by, 1), 0);
  IF team_record.max_uses IS NOT NULL AND current_uses >= team_record.max_uses THEN
    RAISE EXCEPTION 'Ce code a atteint sa limite d''utilisation';
  END IF;

  -- Ajouter l'utilisateur à l'équipe
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (team_record.team_id, auth.uid(), 'joueur');

  -- Marquer le code comme utilisé par cet utilisateur
  UPDATE public.team_codes
  SET used_by = COALESCE(used_by, '{}') || auth.uid()
  WHERE id = team_record.id;

  RETURN team_record.team_id;
END;
$function$;