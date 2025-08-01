-- Ajouter Fortnite à l'enum game_type s'il n'existe pas déjà
DO $$ 
BEGIN
    -- Vérifier si la valeur existe déjà
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'fortnite' 
        AND enumtypid = 'game_type'::regtype
    ) THEN
        -- Ajouter la nouvelle valeur à l'enum
        ALTER TYPE game_type ADD VALUE 'fortnite';
    END IF;
END $$;