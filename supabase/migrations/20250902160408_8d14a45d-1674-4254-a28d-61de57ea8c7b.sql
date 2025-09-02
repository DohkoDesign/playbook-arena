-- Create beta_codes table to manage beta access
CREATE TABLE public.beta_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '6 months')
);

-- Enable RLS on beta_codes
ALTER TABLE public.beta_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_codes
CREATE POLICY "Anyone can check if beta code exists and is valid" 
ON public.beta_codes 
FOR SELECT 
USING (used_at IS NULL AND expires_at > now());

-- Only authenticated users can update beta codes (mark as used)
CREATE POLICY "Authenticated users can mark codes as used" 
ON public.beta_codes 
FOR UPDATE 
TO authenticated
USING (used_at IS NULL AND expires_at > now())
WITH CHECK (used_by = auth.uid());

-- Function to validate and use beta code
CREATE OR REPLACE FUNCTION public.validate_and_use_beta_code(beta_code TEXT, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  code_record RECORD;
BEGIN
  -- Check if code exists and is valid
  SELECT id, used_at, expires_at INTO code_record
  FROM public.beta_codes
  WHERE code = beta_code;
  
  -- Code doesn't exist
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Code already used
  IF code_record.used_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Code expired
  IF code_record.expires_at <= now() THEN
    RETURN FALSE;
  END IF;
  
  -- Mark code as used
  UPDATE public.beta_codes
  SET used_by = user_id, used_at = now()
  WHERE code = beta_code;
  
  RETURN TRUE;
END;
$$;

-- Insert 50 beta codes
INSERT INTO public.beta_codes (code) VALUES
('SH-BETA-2024-001-ALPHA'),
('SH-BETA-2024-002-BRAVO'),
('SH-BETA-2024-003-CHARLIE'),
('SH-BETA-2024-004-DELTA'),
('SH-BETA-2024-005-ECHO'),
('SH-BETA-2024-006-FOXTROT'),
('SH-BETA-2024-007-GOLF'),
('SH-BETA-2024-008-HOTEL'),
('SH-BETA-2024-009-INDIA'),
('SH-BETA-2024-010-JULIET'),
('SH-BETA-2024-011-KILO'),
('SH-BETA-2024-012-LIMA'),
('SH-BETA-2024-013-MIKE'),
('SH-BETA-2024-014-NOVEMBER'),
('SH-BETA-2024-015-OSCAR'),
('SH-BETA-2024-016-PAPA'),
('SH-BETA-2024-017-QUEBEC'),
('SH-BETA-2024-018-ROMEO'),
('SH-BETA-2024-019-SIERRA'),
('SH-BETA-2024-020-TANGO'),
('SH-BETA-2024-021-UNIFORM'),
('SH-BETA-2024-022-VICTOR'),
('SH-BETA-2024-023-WHISKEY'),
('SH-BETA-2024-024-XRAY'),
('SH-BETA-2024-025-YANKEE'),
('SH-BETA-2024-026-ZULU'),
('SH-BETA-2024-027-PHOENIX'),
('SH-BETA-2024-028-DRAGON'),
('SH-BETA-2024-029-THUNDER'),
('SH-BETA-2024-030-LIGHTNING'),
('SH-BETA-2024-031-STORM'),
('SH-BETA-2024-032-BLADE'),
('SH-BETA-2024-033-SHADOW'),
('SH-BETA-2024-034-GHOST'),
('SH-BETA-2024-035-NINJA'),
('SH-BETA-2024-036-WARRIOR'),
('SH-BETA-2024-037-GUARDIAN'),
('SH-BETA-2024-038-HUNTER'),
('SH-BETA-2024-039-RANGER'),
('SH-BETA-2024-040-SCOUT'),
('SH-BETA-2024-041-VIPER'),
('SH-BETA-2024-042-FALCON'),
('SH-BETA-2024-043-EAGLE'),
('SH-BETA-2024-044-HAWK'),
('SH-BETA-2024-045-RAVEN'),
('SH-BETA-2024-046-WOLF'),
('SH-BETA-2024-047-LION'),
('SH-BETA-2024-048-TIGER'),
('SH-BETA-2024-049-PANTHER'),
('SH-BETA-2024-050-COBRA');