-- Créer une fonction pour ajouter automatiquement le créateur d'équipe comme membre
CREATE OR REPLACE FUNCTION add_team_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter le créateur comme membre "owner" de l'équipe
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un trigger pour exécuter cette fonction à chaque création d'équipe
CREATE TRIGGER add_creator_as_member_trigger
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION add_team_creator_as_member();

-- Ajouter les créateurs existants comme membres de leurs équipes
INSERT INTO public.team_members (team_id, user_id, role)
SELECT id, created_by, 'owner'
FROM public.teams
WHERE created_by NOT IN (
  SELECT user_id 
  FROM public.team_members 
  WHERE team_members.team_id = teams.id
);