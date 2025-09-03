-- Update policies to allow management roles (owner/manager/coach)
DROP POLICY IF EXISTS "Team staff can create feedback responses" ON public.feedback_responses;
DROP POLICY IF EXISTS "Team staff can view feedback responses" ON public.feedback_responses;

CREATE POLICY "Management can create feedback responses" 
ON public.feedback_responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.player_feedbacks pf
    WHERE pf.id = feedback_responses.feedback_id
      AND has_management_role(pf.team_id)
  )
);

CREATE POLICY "Team members and management can view feedback responses" 
ON public.feedback_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.player_feedbacks pf
    WHERE pf.id = feedback_responses.feedback_id
      AND (
        has_management_role(pf.team_id)
        OR pf.user_id = auth.uid()
      )
  )
);