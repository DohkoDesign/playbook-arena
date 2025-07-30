-- Créer un enum pour les rôles d'utilisateur
CREATE TYPE public.user_role AS ENUM ('staff', 'player');

-- Ajouter une colonne role à la table profiles
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'player';

-- Mettre à jour les profils existants (créateurs d'équipe) comme staff
UPDATE public.profiles 
SET role = 'staff' 
WHERE user_id IN (
  SELECT DISTINCT created_by FROM public.teams
);

-- Ajouter des colonnes pour les joueurs
ALTER TABLE public.profiles ADD COLUMN jeux_joues TEXT[];
ALTER TABLE public.profiles ADD COLUMN personnages_favoris TEXT[];

-- Créer un index pour les performances
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Politique pour que les utilisateurs puissent voir leur propre rôle
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour que le staff puisse voir les profils des joueurs de leurs équipes
CREATE POLICY "Staff can view team players profiles" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'player' AND EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON t.id = tm.team_id
    WHERE tm.user_id = profiles.user_id 
    AND t.created_by = auth.uid()
  )
);

-- Fonction pour vérifier si un utilisateur est staff
CREATE OR REPLACE FUNCTION public.is_staff_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id
    AND role = 'staff'
  );
$$;