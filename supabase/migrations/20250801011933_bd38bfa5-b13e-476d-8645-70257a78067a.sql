-- Créer une table pour les disponibilités des joueurs
CREATE TABLE public.player_availabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL,
  week_start DATE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = lundi, 6 = dimanche
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id, week_start, day_of_week)
);

-- Activer RLS
ALTER TABLE public.player_availabilities ENABLE ROW LEVEL SECURITY;

-- Politique pour voir les disponibilités de son équipe
CREATE POLICY "Team members can view team availabilities"
ON public.player_availabilities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = player_availabilities.team_id 
    AND (
      t.created_by = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = t.id AND tm.user_id = auth.uid()
      )
    )
  )
);

-- Politique pour créer ses propres disponibilités
CREATE POLICY "Players can create their own availabilities"
ON public.player_availabilities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique pour modifier ses propres disponibilités
CREATE POLICY "Players can update their own availabilities"
ON public.player_availabilities
FOR UPDATE
USING (auth.uid() = user_id);

-- Politique pour supprimer ses propres disponibilités
CREATE POLICY "Players can delete their own availabilities"
ON public.player_availabilities
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_player_availabilities_updated_at
BEFORE UPDATE ON public.player_availabilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();