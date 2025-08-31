-- Nettoyer les données et recréer le trigger proprement

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS add_team_creator_as_member_trigger ON public.teams;

-- Supprimer les enregistrements orphelins dans team_members
DELETE FROM public.team_members 
WHERE team_id NOT IN (SELECT id FROM public.teams);

-- Recréer la fonction avec une gestion d'erreur
CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Vérifier si l'entrée existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = NEW.id AND user_id = NEW.created_by
  ) THEN
    -- Ajouter le créateur comme propriétaire de l'équipe
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
  END IF;
  RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER add_team_creator_as_member_trigger
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.add_team_creator_as_member();