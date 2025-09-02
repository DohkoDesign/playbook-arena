-- Supprimer tous les codes beta existants
DELETE FROM public.beta_codes;

-- Ajouter une colonne pour le nom de l'équipe
ALTER TABLE public.beta_codes 
ADD COLUMN team_name text;