import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, Users, TrendingUp, Mail, Download, Calendar,
  UserPlus, Trophy, Clock, Target, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

interface StaffManagementViewProps {
  teamId: string;
  gameType?: string;
}

export const StaffManagementView = ({ teamId, gameType }: StaffManagementViewProps) => {
  const [teamData, setTeamData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const gameConfig = gameType ? getGameConfig(gameType) : null;

  useEffect(() => {
    if (teamId) {
      fetchAllData();
    }
  }, [teamId]);

  const fetchAllData = async () => {
    try {
      // Récupérer les données de l'équipe
      const { data: team } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      // Récupérer les membres
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select(`
          *,
          profiles (
            pseudo,
            photo_profil
          )
        `)
        .eq("team_id", teamId);

      // Récupérer les événements
      const { data: teamEvents } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .order("date_debut", { ascending: false });

      // Récupérer les stratégies
      const { data: teamStrategies } = await supabase
        .from("strategies")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      // Récupérer les sessions de coaching
      const { data: sessions } = await supabase
        .from("coaching_sessions")
        .select(`
          *,
          events!inner (
            team_id
          )
        `)
        .eq("events.team_id", teamId);

      setTeamData(team);
      setMembers(teamMembers || []);
      setEvents(teamEvents || []);
      setStrategies(teamStrategies || []);
      setCoachingSessions(sessions || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) return;

    try {
      // Génération d'un token simple (en production, utiliser crypto.randomUUID())
      const token = Math.random().toString(36).substr(2, 15);
      
      const { error } = await supabase
        .from("invitations")
        .insert({
          team_id: teamId,
          token,
          role: "joueur",
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      // Simulation d'envoi d'email (en production, utiliser un service d'email)
      toast({
        title: "Invitation envoyée",
        description: `Invitation envoyée à ${inviteEmail}`,
      });

      setInviteEmail("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportData = (type: string) => {
    // Simulation d'export de données
    toast({
      title: "Export en cours",
      description: `Export des données ${type} en cours...`,
    });
  };

  const getPerformanceStats = () => {
    const totalEvents = events.length;
    const totalStrategies = strategies.length;
    const totalAnalyses = coachingSessions.length;
    const activeMembers = members.filter(m => m.role !== 'staff').length;

    return {
      totalEvents,
      totalStrategies,
      totalAnalyses,
      activeMembers,
      analysisRate: totalEvents > 0 ? Math.round((totalAnalyses / totalEvents) * 100) : 0
    };
  };

  const stats = getPerformanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des données de gestion...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-2xl font-bold">
            Gestion Staff {gameConfig && `- ${gameConfig.name}`}
          </h2>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Membres actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold">{stats.activeMembers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Événements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold">{stats.totalEvents}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stratégies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span className="text-2xl font-bold">{stats.totalStrategies}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold">{stats.totalAnalyses}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progression */}
          <Card>
            <CardHeader>
              <CardTitle>Taux d'analyse des événements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Événements analysés</span>
                <span className="text-sm font-medium">{stats.analysisRate}%</span>
              </div>
              <Progress value={stats.analysisRate} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {stats.totalAnalyses} analyses sur {stats.totalEvents} événements
              </p>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{event.titre}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.date_debut).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des membres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invitation */}
              <div className="space-y-2">
                <Label htmlFor="invite-email">Inviter un nouveau membre</Label>
                <div className="flex space-x-2">
                  <Input
                    id="invite-email"
                    placeholder="Email du joueur"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={sendInvitation} disabled={!inviteEmail.trim()}>
                    <Mail className="w-4 h-4 mr-2" />
                    Inviter
                  </Button>
                </div>
              </div>

              {/* Liste des membres */}
              <div className="space-y-2">
                <h4 className="font-medium">Membres actuels ({members.length})</h4>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {member.profiles?.pseudo?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{member.profiles?.pseudo || 'Utilisateur'}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                            {member.personnages_favoris && gameConfig && (
                              <span className="text-xs text-muted-foreground">
                                {member.personnages_favoris.slice(0, 2).join(', ')}
                                {member.personnages_favoris.length > 2 && '...'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rejoint le {new Date(member.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance par type d'événement */}
            <Card>
              <CardHeader>
                <CardTitle>Événements par type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['scrim', 'match', 'tournoi'].map((type) => {
                    const count = events.filter(e => e.type === type).length;
                    const percentage = events.length > 0 ? (count / events.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span>{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stratégies par type */}
            {gameConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>Stratégies par type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gameConfig.strategyTypes.slice(0, 5).map((type) => {
                      const count = strategies.filter(s => s.type === type).length;
                      const percentage = strategies.length > 0 ? (count / strategies.length) * 100 : 0;
                      
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{type}</span>
                            <span>{count}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exports" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exporter les données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => exportData('événements')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Événements ({events.length})
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => exportData('stratégies')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Stratégies ({strategies.length})
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => exportData('analyses')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Analyses ({coachingSessions.length})
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => exportData('membres')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Membres ({members.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'équipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de l'équipe</Label>
                <Input value={teamData?.nom || ''} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Jeu</Label>
                <Input value={gameConfig?.name || teamData?.jeu || ''} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Créé le</Label>
                <Input 
                  value={teamData?.created_at ? 
                    new Date(teamData.created_at).toLocaleDateString("fr-FR") : ''
                  } 
                  disabled 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};