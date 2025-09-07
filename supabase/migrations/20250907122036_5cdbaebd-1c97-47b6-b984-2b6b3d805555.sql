-- Modifier la table vod_reviews pour assurer la compatibilité et ajouter des contraintes
ALTER TABLE public.vod_reviews 
ADD COLUMN IF NOT EXISTS vod_url text,
ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.coaching_sessions(id);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_vod_reviews_session_team ON public.vod_reviews(session_id, team_id);
CREATE INDEX IF NOT EXISTS idx_vod_reviews_team_timestamps ON public.vod_reviews(team_id, timestamps) WHERE timestamps IS NOT NULL;