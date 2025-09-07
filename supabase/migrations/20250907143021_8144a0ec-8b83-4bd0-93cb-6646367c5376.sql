-- Modifier la fonction handle_new_user pour assigner le bon rôle selon le type d'utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Déterminer le rôle en fonction du user_type dans les metadata
  IF NEW.raw_user_meta_data ->> 'user_type' = 'staff' THEN
    user_role := 'staff'::user_role;
  ELSE
    user_role := 'player'::user_role;
  END IF;

  INSERT INTO public.profiles (user_id, pseudo, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'pseudo', split_part(NEW.email, '@', 1)),
    user_role
  );
  RETURN NEW;
END;
$$;