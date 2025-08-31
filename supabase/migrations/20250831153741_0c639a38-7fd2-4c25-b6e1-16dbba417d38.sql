-- Ajouter la colonne team_id manquante à vod_reviews
ALTER TABLE public.vod_reviews 
ADD COLUMN IF NOT EXISTS team_id uuid;