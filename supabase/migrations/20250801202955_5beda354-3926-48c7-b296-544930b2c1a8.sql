-- Corriger le search_path pour la fonction add_team_creator_as_member
CREATE OR REPLACE FUNCTION add_team_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter le créateur comme membre "owner" de l'équipe
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';