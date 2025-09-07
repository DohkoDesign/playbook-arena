-- Add theme preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system'));