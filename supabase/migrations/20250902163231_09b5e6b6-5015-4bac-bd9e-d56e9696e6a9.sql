-- Supprimer la contrainte d'unicité qui empêche plusieurs créneaux par jour
ALTER TABLE public.player_availabilities 
DROP CONSTRAINT IF EXISTS player_availabilities_user_id_team_id_week_start_day_of_wee_key;

-- Ajouter une nouvelle contrainte d'unicité qui inclut les heures pour permettre plusieurs créneaux par jour
ALTER TABLE public.player_availabilities 
ADD CONSTRAINT player_availabilities_unique_slot 
UNIQUE (user_id, team_id, week_start, day_of_week, start_time, end_time);