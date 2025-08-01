-- Ajouter une contrainte unique sur event_id dans coaching_sessions pour permettre l'upsert
ALTER TABLE public.coaching_sessions 
ADD CONSTRAINT coaching_sessions_event_id_key UNIQUE (event_id);