-- Corriger les contraintes de clé étrangère pour permettre la suppression en cascade

-- 1. Supprimer l'ancienne contrainte sur teams.created_by
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_created_by_fkey;

-- 2. Créer une nouvelle contrainte avec ON DELETE CASCADE
ALTER TABLE teams 
ADD CONSTRAINT teams_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Corriger les autres tables si nécessaire
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE events 
ADD CONSTRAINT events_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE strategies DROP CONSTRAINT IF EXISTS strategies_created_by_fkey;
ALTER TABLE strategies 
ADD CONSTRAINT strategies_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. S'assurer que profiles.user_id a la bonne contrainte
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. S'assurer que team_members.user_id a la bonne contrainte
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;
ALTER TABLE team_members 
ADD CONSTRAINT team_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. S'assurer que player_availabilities.user_id a la bonne contrainte
ALTER TABLE player_availabilities DROP CONSTRAINT IF EXISTS player_availabilities_user_id_fkey;
ALTER TABLE player_availabilities 
ADD CONSTRAINT player_availabilities_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;