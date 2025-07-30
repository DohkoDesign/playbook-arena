-- Add missing game types to the enum
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'csgo';
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'rocket_league'; 
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'league_of_legends';
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'overwatch';
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'cod_warzone';
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'cod_multiplayer';
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'apex_legends';