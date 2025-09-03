-- 1) Helper function to get current user's email from JWT
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select (auth.jwt() ->> 'email')::text;
$$;

-- 2) Allow players to view their own anonymous feedbacks by contact email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'player_feedbacks' 
      AND policyname = 'Players can view their anonymous feedbacks by email'
  ) THEN
    CREATE POLICY "Players can view their anonymous feedbacks by email"
    ON public.player_feedbacks
    FOR SELECT
    USING (
      is_anonymous = true
      AND contact_email IS NOT NULL
      AND contact_email = public.current_user_email()
    );
  END IF;
END $$;

-- 3) Update feedback_responses view policy to include anonymous author by email
DROP POLICY IF EXISTS "Team members and management can view feedback responses" ON public.feedback_responses;
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
        OR (pf.is_anonymous = true AND pf.contact_email IS NOT NULL AND pf.contact_email = public.current_user_email())
      )
  )
);

-- 4) Ensure insert policy enforces responded_by matches current user (optional hardening)
DROP POLICY IF EXISTS "Management can create feedback responses" ON public.feedback_responses;
CREATE POLICY "Management can create feedback responses"
ON public.feedback_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.player_feedbacks pf
    WHERE pf.id = feedback_responses.feedback_id
      AND has_management_role(pf.team_id)
  )
  AND responded_by = auth.uid()
);
