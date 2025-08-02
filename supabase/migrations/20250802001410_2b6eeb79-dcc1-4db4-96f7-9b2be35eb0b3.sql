-- Activation de Row Level Security pour toutes les tables principales
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table teams
CREATE POLICY "Créateurs peuvent voir leurs équipes" ON public.teams
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Membres peuvent voir leurs équipes" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Créateurs peuvent modifier leurs équipes" ON public.teams
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Créateurs peuvent créer des équipes" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Politiques pour la table team_members
CREATE POLICY "Membres peuvent voir les membres de leurs équipes" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers peuvent ajouter des membres" ON public.team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
      UNION
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Politiques pour la table profiles
CREATE POLICY "Utilisateurs peuvent voir tous les profils" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Utilisateurs peuvent modifier leur propre profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leur profil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour la table invitations
CREATE POLICY "Managers peuvent voir les invitations de leurs équipes" ON public.invitations
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
      UNION
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Managers peuvent créer des invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
      UNION
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Création de la bucket storage pour les avatars si elle n'existe pas déjà
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de storage pour les avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );