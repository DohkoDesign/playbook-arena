-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Public can read valid invitations for verification" ON public.invitations;
DROP POLICY IF EXISTS "Public can read teams for invitation verification" ON public.teams;

-- Créer des politiques plus simples sans récursion
CREATE POLICY "Allow anonymous read for invitations" 
ON public.invitations 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous read for teams" 
ON public.teams 
FOR SELECT 
TO anon 
USING (true);