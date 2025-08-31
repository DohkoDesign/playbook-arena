-- Remove duplicate triggers and harden function to avoid duplicates
DROP TRIGGER IF EXISTS add_creator_as_member_trigger ON public.teams;
DROP TRIGGER IF EXISTS add_team_creator_trigger ON public.teams;
DROP TRIGGER IF EXISTS add_team_creator_as_member_trigger ON public.teams;

-- Recreate function to be idempotent using ON CONFLICT
CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert owner membership, ignore if it already exists
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create a single trigger only
CREATE TRIGGER add_team_creator_as_member_trigger
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.add_team_creator_as_member();