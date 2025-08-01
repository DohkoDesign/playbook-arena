-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Team management can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (has_management_role(team_id));

-- Create function to generate intelligent notifications
CREATE OR REPLACE FUNCTION public.generate_intelligent_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired notifications
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < now();

  -- Generate availability reminders (weekly)
  INSERT INTO public.notifications (user_id, team_id, title, message, type, priority, expires_at)
  SELECT DISTINCT 
    tm.user_id,
    tm.team_id,
    'Disponibilités manquantes',
    'N''oubliez pas de mettre à jour vos disponibilités pour cette semaine.',
    'warning',
    'normal',
    now() + interval '7 days'
  FROM team_members tm
  LEFT JOIN player_availabilities pa ON (
    pa.user_id = tm.user_id 
    AND pa.team_id = tm.team_id 
    AND pa.week_start = date_trunc('week', now())::date
  )
  WHERE tm.role IN ('joueur', 'remplacant', 'capitaine')
    AND pa.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = tm.user_id 
        AND n.title = 'Disponibilités manquantes'
        AND n.created_at > now() - interval '7 days'
    );

  -- Generate profile completion reminders
  INSERT INTO public.notifications (user_id, team_id, title, message, type, priority, expires_at)
  SELECT DISTINCT 
    tm.user_id,
    tm.team_id,
    'Profil incomplet',
    'Complétez votre profil joueur pour améliorer l''expérience d''équipe.',
    'info',
    'normal',
    now() + interval '30 days'
  FROM team_members tm
  LEFT JOIN player_profiles pp ON (pp.user_id = tm.user_id AND pp.team_id = tm.team_id)
  WHERE tm.role IN ('joueur', 'remplacant', 'capitaine')
    AND (
      pp.id IS NULL 
      OR (pp.points_forts IS NULL OR array_length(pp.points_forts, 1) < 3)
      OR (pp.objectifs_individuels IS NULL OR array_length(pp.objectifs_individuels, 1) < 1)
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = tm.user_id 
        AND n.title = 'Profil incomplet'
        AND n.created_at > now() - interval '14 days'
    );

  -- Generate upcoming events reminders
  INSERT INTO public.notifications (user_id, team_id, title, message, type, priority, action_url, action_label, expires_at)
  SELECT DISTINCT 
    tm.user_id,
    e.team_id,
    'Événement à venir: ' || e.titre,
    'Un événement est prévu pour ' || to_char(e.date_debut, 'DD/MM/YYYY à HH24:MI'),
    'info',
    CASE 
      WHEN e.date_debut - now() < interval '2 hours' THEN 'urgent'
      WHEN e.date_debut - now() < interval '24 hours' THEN 'high'
      ELSE 'normal'
    END,
    '/dashboard',
    'Voir le calendrier',
    e.date_debut
  FROM events e
  JOIN team_members tm ON tm.team_id = e.team_id
  WHERE e.date_debut > now() 
    AND e.date_debut < now() + interval '7 days'
    AND tm.role IN ('joueur', 'remplacant', 'capitaine')
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = tm.user_id 
        AND n.title = 'Événement à venir: ' || e.titre
        AND n.created_at > now() - interval '1 day'
    );
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_team_id ON public.notifications(team_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Add trigger to update updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();