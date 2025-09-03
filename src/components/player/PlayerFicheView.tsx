import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, Gamepad2, Users, Star, Target, TrendingUp, 
  TrendingDown, Award, Calendar, Clock, Trophy
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
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center space-x-2 text-primary mb-4">
              <Clock className="w-6 h-6 animate-spin" />
              <span className="text-lg font-medium">Chargement de votre fiche...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center py-16">
            <div className="text-muted-foreground">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Impossible de charger votre fiche</p>
              <p className="text-sm">Contactez un membre du staff si le problème persiste</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header Hero */}
      <div className="relative bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto p-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-primary/20 shadow-elegant">
                  <AvatarImage src={profile.photo_profil} alt={profile.pseudo} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {profile.pseudo.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {profile.pseudo}
                </h1>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Award className="w-3 h-3 mr-1" />
                    {getRoleDisplayName(profile.role)}
                  </Badge>
                  {teamMemberData && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      Membre depuis {new Date(teamMemberData.created_at).toLocaleDateString("fr-FR", { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Fiche joueur dans l'équipe {teamData?.nom}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8 -mt-6">
        {/* Cartes principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Informations de l'équipe */}
          <Card className="bg-gradient-to-br from-card/80 to-card border-border/50 shadow-elegant backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg font-bold">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Mon Équipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-foreground">{teamData?.nom}</h3>
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-accent/10 border-accent/20">
                    <Gamepad2 className="w-4 h-4 text-accent" />
                    {getGameName(teamData?.jeu)}
                  </Badge>
                </div>
              </div>
              
              {profile.personnages_favoris.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Personnages favoris
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.personnages_favoris.map((perso, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {perso}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points forts */}
          <Card className="bg-gradient-to-br from-emerald-500/5 to-card border-emerald-500/20 shadow-elegant backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg font-bold">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                Points Forts
                <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full">
                  {profile.points_forts.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.points_forts.length > 0 ? (
                <div className="space-y-2">
                  {profile.points_forts.map((point, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors group"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm font-medium text-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun point fort défini</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Le staff n'a pas encore évalué vos forces
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points à améliorer */}
          <Card className="bg-gradient-to-br from-orange-500/5 to-card border-orange-500/20 shadow-elegant backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg font-bold">
                <Target className="w-5 h-5 mr-2 text-orange-500" />
                Points à améliorer
                <span className="ml-auto text-xs bg-orange-500/10 text-orange-600 px-2 py-1 rounded-full">
                  {profile.points_faibles.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.points_faibles.length > 0 ? (
                <div className="space-y-2">
                  {profile.points_faibles.map((point, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors group"
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm font-medium text-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun point d'amélioration</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Le staff n'a pas encore identifié d'axes de progression
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Objectifs individuels */}
        <Card className="bg-gradient-to-br from-primary/5 to-card border-primary/20 shadow-elegant backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold">
              <Trophy className="w-6 h-6 mr-2 text-primary" />
              Mes Objectifs Individuels
              <span className="ml-auto text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                {profile.objectifs_individuels.length} objectifs
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.objectifs_individuels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.objectifs_individuels.map((objectif, index) => (
                  <div 
                    key={index}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-4 hover:from-primary/10 hover:to-primary/15 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {objectif}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={Math.random() * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Progression en cours...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Aucun objectif défini</p>
                <p className="text-sm text-muted-foreground/70">
                  Le staff définira vos objectifs personnalisés lors de votre prochain entretien
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes du staff */}
        {profile.notes && (
          <Card className="bg-gradient-to-br from-accent/5 to-card border-accent/20 shadow-elegant backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold">
                <User className="w-6 h-6 mr-2 text-accent" />
                Notes du Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-accent/5 border border-accent/10 rounded-xl p-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
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