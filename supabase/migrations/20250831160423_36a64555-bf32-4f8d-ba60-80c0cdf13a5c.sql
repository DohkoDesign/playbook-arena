-- Ajouter le créateur manquant à l'équipe "test" qui n'a pas de membres
INSERT INTO public.team_members (team_id, user_id, role)
SELECT t.id, t.created_by, 'owner'
FROM public.teams t
LEFT JOIN public.team_members tm ON tm.team_id = t.id AND tm.user_id = t.created_by
WHERE tm.id IS NULL
ON CONFLICT (team_id, user_id) DO NOTHING;