-- Créer une table pour les événements personnels des joueurs
CREATE TABLE public.player_personal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  player_id UUID NOT NULL,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'personal',
  date_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.player_personal_events ENABLE ROW LEVEL SECURITY;

-- Policies pour les événements personnels
CREATE POLICY "Team staff can manage player personal events"
ON public.player_personal_events
FOR ALL
USING (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.created_by = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() 
    AND team_members.role IN ('manager', 'coach', 'owner')
  )
);

CREATE POLICY "Players can view their own personal events"
ON public.player_personal_events
FOR SELECT
USING (player_id = auth.uid());

-- Trigger pour updated_at
CREATE TRIGGER update_player_personal_events_updated_at
BEFORE UPDATE ON public.player_personal_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();