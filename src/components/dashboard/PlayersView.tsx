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
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Aucun membre dans l'équipe. Invitez vos premiers joueurs !
              </p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold">
                        {member.profiles?.pseudo?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {member.profiles?.pseudo || "Joueur"}
                        </CardTitle>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                    {!isPlayerView && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPlayerManagement(member)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Gérer
                      </Button>
                    )}
                  </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Personnages favoris */}
                {member.personnages_favoris && member.personnages_favoris.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Personnages favoris:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.personnages_favoris.slice(0, 3).map((char: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                      {member.personnages_favoris.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.personnages_favoris.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Aperçu des points forts/faibles pour les joueurs */}
                {member.player_profiles && member.player_profiles.length > 0 && (
                  <div className="space-y-2">
                    {member.player_profiles[0].points_forts && member.player_profiles[0].points_forts.length > 0 && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">
                          {member.player_profiles[0].points_forts.length} point(s) fort(s)
                        </span>
                      </div>
                    )}
                    {member.player_profiles[0].points_faibles && member.player_profiles[0].points_faibles.length > 0 && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs">
                          {member.player_profiles[0].points_faibles.length} point(s) à améliorer
                        </span>
                      </div>
                    )}
                    {member.player_profiles[0].objectifs_individuels && member.player_profiles[0].objectifs_individuels.length > 0 && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Target className="w-4 h-4" />
                        <span className="text-xs">
                          {member.player_profiles[0].objectifs_individuels.length} objectif(s)
                        </span>
                      </div>
                    )}
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