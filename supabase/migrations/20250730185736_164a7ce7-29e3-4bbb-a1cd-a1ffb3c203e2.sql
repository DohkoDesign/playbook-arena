-- Corriger les politiques pour les événements et autres tables manquantes
CREATE POLICY "Events: team members can manage" 
ON public.events FOR ALL 
USING (
  auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
    UNION
    SELECT user_id FROM public.team_members WHERE team_id = events.team_id
  )
);

CREATE POLICY "Strategies: team members can manage" 
ON public.strategies FOR ALL 
USING (
  auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
    UNION
    SELECT user_id FROM public.team_members WHERE team_id = strategies.team_id
  )
);

CREATE POLICY "Player profiles: team members can view and manage" 
ON public.player_profiles FOR ALL 
USING (
  auth.uid() = user_id OR
  auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
    UNION
    SELECT user_id FROM public.team_members WHERE team_id = player_profiles.team_id
  )
);

CREATE POLICY "Coaching sessions: team members can manage" 
ON public.coaching_sessions FOR ALL 
USING (
  auth.uid() IN (
    SELECT t.created_by FROM public.teams t 
    JOIN public.events e ON e.team_id = t.id 
    WHERE e.id = event_id
    UNION
    SELECT tm.user_id FROM public.team_members tm 
    JOIN public.events e ON e.team_id = tm.team_id 
    WHERE e.id = event_id
  )
);

CREATE POLICY "Invitations: team creators can manage" 
ON public.invitations FOR ALL 
USING (
  auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
  )
);