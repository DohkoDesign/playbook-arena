-- Création des types enum pour les jeux et rôles
CREATE TYPE public.game_type AS ENUM (
  'valorant', 'rocket_league', 'league_of_legends', 'counter_strike', 'overwatch',
  'apex_legends', 'fortnite', 'call_of_duty', 'rainbow_six', 'dota2',
  'fifa', 'street_fighter', 'tekken', 'mortal_kombat', 'hearthstone',
  'starcraft2', 'age_of_empires', 'world_of_warcraft', 'pubg', 'fall_guys',
  'among_us', 'minecraft', 'chess', 'trackmania', 'rocket_league_sideswipe'
);

CREATE TYPE public.player_role AS ENUM (
  'joueur', 'remplacant', 'coach', 'manager', 'capitaine'
);

CREATE TYPE public.event_type AS ENUM (
  'scrim', 'match', 'tournoi', 'coaching', 'session_individuelle'
);

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  pseudo TEXT NOT NULL,
  photo_profil TEXT,
  is_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des équipes
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  jeu game_type NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des membres d'équipe
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role player_role NOT NULL DEFAULT 'joueur',
  personnages_favoris TEXT[], -- Pour les jeux avec sélection de personnages
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Table des invitations
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  role player_role NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des événements (calendrier)
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  type event_type NOT NULL,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des stratégies/playbook
CREATE TABLE public.strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  type TEXT NOT NULL, -- 'attaque' ou 'defense'
  map_name TEXT,
  contenu JSONB, -- Stockage des annotations, images, etc.
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des fiches joueurs
CREATE TABLE public.player_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_forts TEXT[],
  points_faibles TEXT[],
  objectifs_individuels TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Table des sessions de review/coaching
CREATE TABLE public.coaching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  resultat TEXT,
  composition_equipe JSONB,
  composition_adversaire JSONB,
  vods JSONB, -- URLs des VODs par joueur
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activation RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour teams
CREATE POLICY "Users can view teams they belong to" 
ON public.teams FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid())
);

CREATE POLICY "Users can create teams" 
ON public.teams FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams" 
ON public.teams FOR UPDATE 
USING (auth.uid() = created_by);

-- Politiques RLS pour team_members
CREATE POLICY "Users can view team members of their teams" 
ON public.team_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_id AND (
      t.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Team creators can manage team members" 
ON public.team_members FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

CREATE POLICY "Users can join teams via invitation" 
ON public.team_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politiques similaires pour les autres tables...
CREATE POLICY "Team members can view invitations for their teams" 
ON public.invitations FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

CREATE POLICY "Team creators can create invitations" 
ON public.invitations FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

-- Events policies
CREATE POLICY "Team members can view team events" 
ON public.events FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_id AND (
      t.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Team members can create events" 
ON public.events FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_id AND (
      t.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
    )
  )
);

-- Strategies policies
CREATE POLICY "Team members can view strategies" 
ON public.strategies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_id AND (
      t.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Team members can create strategies" 
ON public.strategies FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_id AND (
      t.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
    )
  )
);

-- Player profiles policies
CREATE POLICY "Team members can view player profiles" 
ON public.player_profiles FOR SELECT 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_id AND (
      t.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
    )
  )
);

-- Coaching sessions policies
CREATE POLICY "Team members can view coaching sessions" 
ON public.coaching_sessions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.teams t ON e.team_id = t.id 
    WHERE e.id = event_id AND (
      t.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
    )
  )
);

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, pseudo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'pseudo', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON public.strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_profiles_updated_at
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON public.coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();