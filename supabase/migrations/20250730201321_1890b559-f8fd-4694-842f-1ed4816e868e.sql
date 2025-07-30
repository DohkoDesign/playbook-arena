-- Ajouter une colonne map_name à la table events pour stocker la map jouée lors des scrims
ALTER TABLE public.events ADD COLUMN map_name TEXT;