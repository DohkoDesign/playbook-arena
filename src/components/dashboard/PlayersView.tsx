import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Target, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InvitationModal } from "./InvitationModal";

interface PlayersViewProps {
  teamId: string;
  isPlayerView?: boolean;
}

export const PlayersView = ({ teamId, isPlayerView = false }: PlayersViewProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (teamId) {
      fetchTeamMembers();
      fetchTeamInfo();
    }
  }, [teamId]);

  const fetchTeamInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;
      setTeam(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement de l'équipe:", error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // D'abord récupérer les membres de l'équipe (seulement les joueurs)
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .in("role", ["joueur", "remplacant", "capitaine"]);

      if (membersError) throw membersError;

      if (!teamMembers || teamMembers.length === 0) {
        setMembers([]);
        return;
      }

      // Récupérer les profils de chaque membre
      const userIds = teamMembers.map(member => member.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Récupérer les profils joueurs
      const { data: playerProfiles, error: playerProfilesError } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("team_id", teamId)
        .in("user_id", userIds);

      if (playerProfilesError) throw playerProfilesError;

      // Joindre les données
      const membersWithProfiles = teamMembers.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        const playerProfile = playerProfiles?.find(pp => pp.user_id === member.user_id);
        
        return {
          ...member,
          profiles: profile,
          player_profiles: playerProfile ? [playerProfile] : []
        };
      });

      setMembers(membersWithProfiles);
    } catch (error: any) {
      console.error("Erreur lors du chargement des membres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de l'équipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openPlayerManagement = (member: any) => {
    navigate(`/player-management/${teamId}/${member.user_id}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "capitaine":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "joueur":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "remplacant":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des joueurs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Gestion de l'équipe</h2>
        </div>
        {!isPlayerView && (
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Inviter un joueur
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Équipe vide</h3>
              <p className="text-muted-foreground">
                Aucun membre dans l'équipe. Invitez vos premiers joueurs !
              </p>
              {!isPlayerView && (
                <Button onClick={() => setShowInviteModal(true)} className="mt-4">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inviter un joueur
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow border">
              <CardContent className="p-6">
                {/* Header avec avatar et informations */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {member.profiles?.photo_profil ? (
                        <img 
                          src={member.profiles.photo_profil} 
                          alt={`Photo de profil de ${member.profiles.pseudo}`}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold">
                          {member.profiles?.pseudo?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {member.profiles?.pseudo || "Joueur"}
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Bouton d'action toujours visible */}
                  {!isPlayerView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPlayerManagement(member)}
                      className="shrink-0"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                  )}
                </div>

                {/* Personnages favoris */}
                {member.personnages_favoris && member.personnages_favoris.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Personnages favoris
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {member.personnages_favoris.slice(0, 2).map((char: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                      {member.personnages_favoris.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.personnages_favoris.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistiques */}
                {member.player_profiles && member.player_profiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-foreground">
                        {member.player_profiles[0].points_forts?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Points forts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-foreground">
                        {member.player_profiles[0].points_faibles?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">À améliorer</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-foreground">
                        {member.player_profiles[0].objectifs_individuels?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Objectifs</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && team && (
        <InvitationModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          teamId={teamId}
          teamName={team.nom}
        />
      )}
    </div>
  );
};