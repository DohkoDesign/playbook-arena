-- Corriger les fonctions avec search_path manquant pour améliorer la sécurité

-- Correction de la fonction add_team_creator_as_member
CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Ajouter le créateur comme propriétaire de l'équipe
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

-- Correction de la fonction handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, pseudo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'pseudo', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;