import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Gamepad2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerFicheViewProps {
  teamId: string;
  playerId: string;
  userProfile?: any;
  teamData?: any;
}

interface PlayerProfile {
  id: string;
  pseudo: string;
  role: string;
  photo_profil?: string;
  personnages_favoris: string[];
}

export const PlayerFicheView = ({ teamId, playerId, userProfile, teamData }: PlayerFicheViewProps) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayerData();
  }, [teamId, playerId, userProfile]);

  const fetchPlayerData = async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    
    try {
      // Charger le profil du joueur
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", playerId)
        .single();

      if (profileError) {
        throw profileError;
      }

      const playerProfile: PlayerProfile = {
        id: profileData.id,
        pseudo: profileData.pseudo,
        role: profileData.role,
        photo_profil: profileData.photo_profil,
        personnages_favoris: profileData.personnages_favoris || []
      };

      setProfile(playerProfile);
    } catch (error: any) {
      console.error('Error in fetchPlayerData:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du joueur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGameName = (gameCode: string) => {
    const gameNames: Record<string, string> = {
      'valorant': 'Valorant',
      'lol': 'League of Legends', 
      'csgo': 'CS2',
      'rocket_league': 'Rocket League',
      'overwatch': 'Overwatch 2',
      'apex': 'Apex Legends',
      'cod_warzone': 'Call of Duty: Warzone',
      'cod_mp': 'Call of Duty: Modern Warfare'
    };
    return gameNames[gameCode] || gameCode;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ma Fiche</h1>
        </div>
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ma Fiche</h1>
        </div>
        <div className="text-center py-8">
          <p>Impossible de charger le profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ma Fiche Joueur</h1>
          <p className="text-muted-foreground">Votre profil dans l'équipe</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profile.photo_profil} alt={profile.pseudo} />
                <AvatarFallback className="text-xl">
                  {profile.pseudo.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-semibold">{profile.pseudo}</h3>
              <Badge variant="outline" className="mt-2">
                {profile.role === 'player' ? 'Joueur' : profile.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informations de l'équipe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Équipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{teamData?.nom}</h3>
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  {getGameName(teamData?.jeu)}
                </Badge>
              </div>
            </div>
            
            {profile.personnages_favoris.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Personnages favoris
                </label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.personnages_favoris.map((perso, index) => (
                    <Badge key={index} variant="secondary">{perso}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};