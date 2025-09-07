-- Ajouter une politique pour permettre aux membres d'équipe de voir les profils des autres membres
CREATE POLICY "Team members can view teammates profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_id IN (
    SELECT DISTINCT tm2.user_id 
    FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid()
  )
);

-- Ajouter une politique pour permettre aux membres d'équipe de voir les autres membres
CREATE POLICY "Team members can view teammates" 
ON public.team_members 
FOR SELECT 
USING (
  team_id IN (
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);