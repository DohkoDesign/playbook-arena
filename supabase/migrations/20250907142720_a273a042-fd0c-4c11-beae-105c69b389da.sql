-- Mettre à jour le rôle de l'utilisateur pour qu'il puisse créer des équipes
UPDATE profiles 
SET role = 'staff' 
WHERE user_id = '2e939900-cef3-407a-a967-a0f5c3b789cb';