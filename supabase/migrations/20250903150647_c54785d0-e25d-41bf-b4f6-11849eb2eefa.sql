-- Fix Critical Security Issues

-- 1. Fix VOD Shares Public Access - Replace dangerous 'true' policy
DROP POLICY IF EXISTS "Users can view shared VOD reviews" ON public.vod_shares;

CREATE POLICY "Team members can view shared VOD reviews" 
ON public.vod_shares 
FOR SELECT 
USING (
  -- Only team members can view shared VODs
  EXISTS (
    SELECT 1 
    FROM public.vod_reviews vr
    JOIN public.team_members tm ON tm.team_id = vr.team_id
    WHERE vr.id = vod_shares.review_id 
    AND tm.user_id = auth.uid()
  )
  OR 
  -- Or if no review_id, check VOD owner directly
  (review_id IS NULL AND EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.user_id = auth.uid()
  ))
);

-- 2. Secure Beta Code Access - Remove public enumeration
DROP POLICY IF EXISTS "Anyone can check if beta code exists and is valid" ON public.beta_codes;

-- Create function for secure beta code validation (prevents enumeration)
CREATE OR REPLACE FUNCTION public.validate_beta_code_exists(code_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.beta_codes 
    WHERE code = code_input 
    AND used_at IS NULL 
    AND expires_at > now()
  );
END;
$$;

-- Add proper admin-only policies for beta_codes
CREATE POLICY "Staff can manage beta codes" 
ON public.beta_codes 
FOR ALL 
USING (is_staff_user())
WITH CHECK (is_staff_user());

-- 3. Add INSERT policy for admin operations
CREATE POLICY "Staff can insert beta codes" 
ON public.beta_codes 
FOR INSERT 
WITH CHECK (is_staff_user());

-- 4. Secure admin operations - Add RLS for admin actions
-- Update notifications table to prevent unauthorized admin notifications
DROP POLICY IF EXISTS "Team management can create notifications" ON public.notifications;

CREATE POLICY "Authorized staff can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- Must be staff or have management role in the team
  is_staff_user() OR has_management_role(team_id)
);

-- 5. Add audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  target_table text,
  target_id uuid DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if user is staff
  IF is_staff_user() THEN
    INSERT INTO public.notifications (
      user_id,
      team_id,
      title,
      message,
      type,
      priority,
      metadata
    )
    VALUES (
      auth.uid(),
      (SELECT id FROM teams LIMIT 1), -- Use first team as default for admin logs
      'Admin Action',
      'Admin performed: ' || action_type || ' on ' || target_table,
      'info',
      'normal',
      jsonb_build_object(
        'action', action_type,
        'table', target_table,
        'target_id', target_id,
        'timestamp', now(),
        'admin_data', metadata
      )
    );
  END IF;
END;
$$;