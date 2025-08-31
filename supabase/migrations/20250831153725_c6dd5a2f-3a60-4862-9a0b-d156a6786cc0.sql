-- Ajouter la colonne team_id manquante à vod_reviews
ALTER TABLE public.vod_reviews 
ADD COLUMN IF NOT EXISTS team_id uuid;

-- Créer un trigger pour les timestamps automatiques
CREATE TRIGGER update_vod_reviews_updated_at
BEFORE UPDATE ON public.vod_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();