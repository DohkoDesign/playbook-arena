-- Nettoyer complètement la base de données
-- Supprimer tous les événements et données associées
DELETE FROM coaching_sessions;
DELETE FROM events;
DELETE FROM strategies;
DELETE FROM player_profiles;
DELETE FROM invitations;
DELETE FROM team_members;

-- Supprimer toutes les équipes
DELETE FROM teams;

-- Supprimer tous les profils
DELETE FROM profiles;

-- Vider le storage des avatars
DELETE FROM storage.objects WHERE bucket_id = 'avatars';