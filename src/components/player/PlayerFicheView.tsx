import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, Gamepad2, Users, Star, Target, TrendingUp, 
  CheckCircle, AlertCircle, FileText, Award
} from "lucide-react";
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
  points_forts: string[];
  points_faibles: string[];
  objectifs_individuels: string[];
  notes?: string;
}

interface TeamMemberData {
  role: string;
  created_at: string;
}

export const PlayerFicheView = ({ teamId, playerId, userProfile, teamData }: PlayerFicheViewProps) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [teamMemberData, setTeamMemberData] = useState<TeamMemberData | null>(null);
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
      // Charger le profil utilisateur de base
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", playerId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Charger les données du membre de l'équipe
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select("role, created_at")
        .eq("team_id", teamId)
        .eq("user_id", playerId)
        .maybeSingle();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      setTeamMemberData(memberData);

      // Charger les données de la fiche joueur (points forts/faibles, etc.)
      const { data: playerProfileData, error: playerProfileError } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", playerId)
        .maybeSingle();

      if (playerProfileError && playerProfileError.code !== 'PGRST116') {
        throw playerProfileError;
      }

      const playerProfile: PlayerProfile = {
        id: profileData?.id || '',
        pseudo: profileData?.pseudo || userProfile?.email?.split('@')[0] || 'Joueur',
        role: memberData?.role || 'joueur',
        photo_profil: profileData?.photo_profil,
        personnages_favoris: profileData?.personnages_favoris || [],
        points_forts: playerProfileData?.points_forts || [],
        points_faibles: playerProfileData?.points_faibles || [],
        objectifs_individuels: playerProfileData?.objectifs_individuels || [],
        notes: playerProfileData?.notes
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

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'joueur': 'Joueur',
      'capitaine': 'Capitaine',
      'coach': 'Coach',
      'manager': 'Manager',
      'owner': 'Propriétaire'
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ma Fiche</h1>
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ma Fiche</h1>
        <div className="text-center py-8">
          <p>Impossible de charger le profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ma Fiche</h1>
      </div>

      <div className="space-y-6">
        {/* Profil principal */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.photo_profil} alt={profile.pseudo} />
                <AvatarFallback className="text-2xl">
                  {profile.pseudo.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{profile.pseudo}</h2>
                  <p className="text-muted-foreground">{teamData?.nom}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">
                    <Award className="w-3 h-3 mr-1" />
                    {getRoleDisplayName(profile.role)}
                  </Badge>
                  <Badge variant="outline">
                    <Gamepad2 className="w-3 h-3 mr-1" />
                    {getGameName(teamData?.jeu)}
                  </Badge>
                  {teamMemberData && (
                    <Badge variant="outline" className="text-xs">
                      Membre depuis {new Date(teamMemberData.created_at).toLocaleDateString("fr-FR", { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </Badge>
                  )}
                </div>
                
                {profile.personnages_favoris.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Personnages favoris</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.personnages_favoris.map((perso, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {perso}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Évaluation du staff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Points forts */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Points Forts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.points_forts.length > 0 ? (
                <div className="space-y-2">
                  {profile.points_forts.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Aucune évaluation disponible
                </p>
              )}
            </CardContent>
          </Card>

          {/* Points à améliorer */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2 text-orange-600" />
                Points à améliorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.points_faibles.length > 0 ? (
                <div className="space-y-2">
                  {profile.points_faibles.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Aucune évaluation disponible
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes du staff */}
        {profile.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-muted-foreground" />
                Notes du Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.notes}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};