-- Accept invitation by token and add current user to the team
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
  already_member boolean;
BEGIN
  -- Fetch valid invitation
  SELECT id, team_id, role
  INTO inv
  FROM public.invitations
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation invalide ou expirée';
  END IF;

  -- Check if already team member
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = inv.team_id AND user_id = auth.uid()
  ) INTO already_member;

  IF NOT already_member THEN
    INSERT INTO public.team_members(team_id, user_id, role)
    VALUES (inv.team_id, auth.uid(), inv.role::player_role);
  END IF;

  -- Mark invitation as used (idempotent)
  UPDATE public.invitations
  SET used_at = now(), used_by = auth.uid()
  WHERE id = inv.id AND used_at IS NULL;

  RETURN inv.team_id;
END;
$$;