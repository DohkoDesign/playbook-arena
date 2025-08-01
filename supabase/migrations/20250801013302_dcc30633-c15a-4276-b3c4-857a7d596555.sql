-- Ajouter des colonnes pour les pseudos de tracker selon les jeux
ALTER TABLE public.profiles 
ADD COLUMN tracker_usernames JSONB DEFAULT '{}';

-- Commenter la nouvelle colonne
COMMENT ON COLUMN public.profiles.tracker_usernames IS 'Stocke les pseudos de tracker pour chaque jeu joué {"valorant": "username123", "overwatch": "player456"}';

-- Ajouter une colonne pour stocker les statistiques du tracker
ALTER TABLE public.profiles 
ADD COLUMN tracker_stats JSONB DEFAULT '{}';

-- Commenter la colonne stats
COMMENT ON COLUMN public.profiles.tracker_stats IS 'Cache des statistiques récupérées depuis les trackers externes';

-- Ajouter une colonne pour la dernière mise à jour des stats
ALTER TABLE public.profiles 
ADD COLUMN tracker_last_updated TIMESTAMP WITH TIME ZONE;

-- Commenter la colonne de dernière mise à jour
COMMENT ON COLUMN public.profiles.tracker_last_updated IS 'Timestamp de la dernière mise à jour des statistiques depuis les trackers';