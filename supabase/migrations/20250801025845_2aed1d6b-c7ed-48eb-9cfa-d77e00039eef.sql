-- Créer une table pour les feedbacks des joueurs
CREATE TABLE public.player_feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  user_id UUID NULL, -- NULL si anonyme
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('suggestion', 'complaint', 'compliment', 'bug', 'other')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.player_feedbacks ENABLE ROW LEVEL SECURITY;

-- Politique pour que les joueurs puissent créer leurs feedbacks
CREATE POLICY "Players can create feedbacks" 
ON public.player_feedbacks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = player_feedbacks.team_id 
    AND tm.user_id = auth.uid()
  )
);

-- Politique pour que les coaches/staff puissent voir tous les feedbacks de leur équipe
CREATE POLICY "Team staff can view all feedbacks" 
ON public.player_feedbacks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = player_feedbacks.team_id 
    AND t.created_by = auth.uid()
  )
);

-- Politique pour que les joueurs puissent voir leurs propres feedbacks non-anonymes
CREATE POLICY "Players can view their own non-anonymous feedbacks" 
ON public.player_feedbacks 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND is_anonymous = false
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_player_feedbacks_updated_at
BEFORE UPDATE ON public.player_feedbacks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();