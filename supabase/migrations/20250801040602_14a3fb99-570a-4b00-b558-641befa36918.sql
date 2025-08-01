-- Ajouter les nouveaux rôles à l'enum player_role
ALTER TYPE player_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE player_role ADD VALUE IF NOT EXISTS 'manager'; 
ALTER TYPE player_role ADD VALUE IF NOT EXISTS 'coach';