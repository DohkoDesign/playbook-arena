-- Ajouter une colonne email pour les feedbacks anonymes
ALTER TABLE public.player_feedbacks 
ADD COLUMN contact_email text;

-- Créer une table pour les réponses aux feedbacks
CREATE TABLE public.feedback_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id uuid NOT NULL REFERENCES public.player_feedbacks(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  responded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS sur la table des réponses
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- Politique pour que le staff puisse créer des réponses
CREATE POLICY "Team staff can create feedback responses" 
ON public.feedback_responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.player_feedbacks pf
    JOIN public.teams t ON pf.team_id = t.id
    WHERE pf.id = feedback_responses.feedback_id
    AND t.created_by = auth.uid()
  )
);

-- Politique pour que le staff puisse voir les réponses
CREATE POLICY "Team staff can view feedback responses" 
ON public.feedback_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.player_feedbacks pf
    JOIN public.teams t ON pf.team_id = t.id
    WHERE pf.id = feedback_responses.feedback_id
    AND t.created_by = auth.uid()
  )
);

-- Politique pour que l'auteur du feedback puisse voir la réponse
CREATE POLICY "Feedback author can view responses" 
ON public.feedback_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.player_feedbacks pf
    WHERE pf.id = feedback_responses.feedback_id
    AND pf.user_id = auth.uid()
  )
);

-- Trigger pour updated_at
CREATE TRIGGER update_feedback_responses_updated_at
  BEFORE UPDATE ON public.feedback_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modifier la politique pour permettre l'ajout d'email dans les feedbacks
DROP POLICY IF EXISTS "Players can create feedbacks" ON public.player_feedbacks;

CREATE POLICY "Players can create feedbacks" 
ON public.player_feedbacks 
FOR INSERT 
WITH CHECK (
  -- Pour les membres de l'équipe
  (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = player_feedbacks.team_id 
    AND tm.user_id = auth.uid()
  ))
  OR 
  -- Pour les feedbacks anonymes avec email
  (is_anonymous = true AND contact_email IS NOT NULL AND user_id IS NULL)
);