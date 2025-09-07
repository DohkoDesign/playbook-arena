-- Supprimer les politiques problématiques qui causent la récursion infinie
DROP POLICY IF EXISTS "Team members can view teammates" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view teammates profiles" ON public.profiles;

-- Créer une fonction security definer pour éviter la récursion
CREATE OR REPLACE FUNCTION public.get_user_team_ids(user_uuid uuid DEFAULT auth.uid())
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(team_id) 
  FROM team_members 
  WHERE user_id = user_uuid;
$$;

-- Nouvelle politique pour team_members sans récursion
CREATE POLICY "Team members can view teammates safe" 
ON public.team_members 
FOR SELECT 
USING (team_id = ANY(public.get_user_team_ids()));

-- Nouvelle politique pour profiles sans récursion
CREATE POLICY "Team members can view teammates profiles safe" 
ON public.profiles 
FOR SELECT 
USING (
  user_id IN (
    SELECT DISTINCT tm.user_id 
    FROM team_members tm
    WHERE tm.team_id = ANY(public.get_user_team_ids())
  )
);