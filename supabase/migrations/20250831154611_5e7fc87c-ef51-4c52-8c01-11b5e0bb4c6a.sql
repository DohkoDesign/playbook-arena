-- Créer le trigger pour ajouter automatiquement le créateur comme propriétaire
CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter le créateur comme propriétaire de l'équipe
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger qui se déclenche après insertion d'une équipe
CREATE TRIGGER add_team_creator_as_member_trigger
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.add_team_creator_as_member();