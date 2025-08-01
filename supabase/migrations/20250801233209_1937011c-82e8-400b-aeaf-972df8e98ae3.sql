-- Créer la table pour les reviews de VOD
CREATE TABLE public.vod_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vod_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  notes TEXT DEFAULT '',
  timestamps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les partages de VOD
CREATE TABLE public.vod_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vod_id UUID NOT NULL,
  review_id UUID,
  title TEXT NOT NULL,
  message TEXT,
  include_timestamps BOOLEAN DEFAULT true,
  include_notes BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.vod_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vod_shares ENABLE ROW LEVEL SECURITY;

-- Politiques pour vod_reviews
CREATE POLICY "Coaches can manage their own VOD reviews" 
ON public.vod_reviews 
FOR ALL 
USING (auth.uid() = coach_id);

-- Politiques pour vod_shares
CREATE POLICY "Users can view shared VOD reviews" 
ON public.vod_shares 
FOR SELECT 
USING (true);

CREATE POLICY "Coaches can create VOD shares" 
ON public.vod_shares 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Trigger pour updated_at
CREATE TRIGGER update_vod_reviews_updated_at
BEFORE UPDATE ON public.vod_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();