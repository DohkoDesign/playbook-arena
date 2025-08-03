-- Corriger les dernières fonctions avec search_path manquant

-- Fonction log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, user_id uuid DEFAULT auth.uid(), metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    team_id,
    title,
    message,
    type,
    priority,
    metadata
  )
  SELECT 
    user_id,
    (SELECT team_id FROM public.team_members WHERE user_id = log_security_event.user_id LIMIT 1),
    'Security Alert',
    'Suspicious activity detected: ' || event_type,
    'warning',
    'high',
    metadata
  WHERE user_id IS NOT NULL;
END;
$$;