-- Corriger le search_path pour la fonction add_team_creator_as_member
CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Ajouter le créateur comme propriétaire de l'équipe
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;