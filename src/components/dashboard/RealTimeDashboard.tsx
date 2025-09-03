import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Target, 
  Bell,
  Settings,
  BarChart3,
  Gamepad2,
  Eye,
  MessageSquare,
  Plus,
  ArrowRight
} from "lucide-react";
import { TeamStatsService, TeamStats } from "./TeamStatsService";
import { GameSpecificStats } from "./GameSpecificStats";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { useToast } from "@/hooks/use-toast";

interface RealTimeDashboardProps {
  teamId: string;
  gameType?: string;
  teamData?: any;
  isStaff?: boolean;
  onViewChange: (view: string) => void;
  currentUserId?: string;
}

export const RealTimeDashboard = ({ 
  teamId, 
  gameType = '', 
  teamData, 
  isStaff = true, 
  onViewChange, 
  currentUserId 
}: RealTimeDashboardProps) => {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      loadTeamStats();
    }
  }, [teamId]);

  const loadTeamStats = async () => {
    try {
      setLoading(true);
      const teamStats = await TeamStatsService.getTeamStats(teamId);
      setStats(teamStats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de l'équipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Actions rapides intelligentes basées sur les vraies données
  const getIntelligentActions = () => {
    if (!stats) return [];

    const actions = [];

    // Si peu d'événements à venir
    if (stats.upcomingEvents < 3) {
      actions.push({
        title: "Planifier des entraînements",
        description: `Seulement ${stats.upcomingEvents} événement${stats.upcomingEvents > 1 ? 's' : ''} prévu${stats.upcomingEvents > 1 ? 's' : ''}`,
        action: () => onViewChange("calendar"),
        icon: Calendar,
        variant: "primary" as const,
        priority: 1
      });
    }

    // Si équipe incomplète
    if (stats.activeMembers < 5) {
      actions.push({
        title: "Recruter des joueurs",
        description: `${stats.activeMembers} joueurs actifs dans l'équipe`,
        action: () => onViewChange("recruitment"),
        icon: Users,
        variant: "secondary" as const,
        priority: 2
      });
    }

    // Si beaucoup de feedbacks en attente
    if (stats.pendingFeedbacks > 5) {
      actions.push({
        title: "Traiter les feedbacks",
        description: `${stats.pendingFeedbacks} feedbacks en attente`,
        action: () => onViewChange("feedbacks"),
        icon: MessageSquare,
        variant: "outline" as const,
        priority: 3
      });
    }

    // Si peu de VODs analysés
    if (stats.totalVODs > 0 && (stats.reviewedVODs / stats.totalVODs) < 0.5) {
      actions.push({
        title: "Analyser les VODs",
        description: `${stats.totalVODs - stats.reviewedVODs} VODs à analyser`,
        action: () => onViewChange("match-analysis"),
        icon: Eye,
        variant: "outline" as const,
        priority: 4
      });
    }

    // Si taux de participation faible
    if (stats.availabilityRate < 70) {
      actions.push({
        title: "Gérer les disponibilités",
        description: `${stats.availabilityRate}% de participation cette semaine`,
        action: () => onViewChange("availabilities"),
        icon: Target,
        variant: "secondary" as const,
        priority: 5
      });
    }

    // Actions par défaut pour le staff
    if (isStaff) {
      actions.push({
        title: "Voir les performances",
        description: "Analyser les derniers résultats",
        action: () => onViewChange("coaching"),
        icon: BarChart3,
        variant: "outline" as const,
        priority: 6
      });
    }

    return actions.sort((a, b) => a.priority - b.priority).slice(0, 6);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          Impossible de charger les statistiques de l'équipe
        </div>
      </div>
    );
  }

  const intelligentActions = getIntelligentActions();

  return (
    <div className="space-y-8">
      {/* En-tête avec informations de l'équipe */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de bord</h1>
              <p className="text-muted-foreground mt-2">
                {teamData?.nom} - {stats.totalMembers} membre{stats.totalMembers > 1 ? 's' : ''} - {gameType ? gameType.charAt(0).toUpperCase() + gameType.slice(1).replace('_', ' ') : 'Jeu non défini'}
              </p>
            </div>
            <div className="p-4 rounded-full bg-primary/10">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Joueurs actifs</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
                <p className="text-xs text-muted-foreground">sur {stats.totalMembers} total</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Événements à venir</p>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                <p className="text-xs text-muted-foreground">{stats.totalEvents} total</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de victoire</p>
                <p className="text-2xl font-bold">{stats.winRate}%</p>
                <p className="text-xs text-muted-foreground">{stats.totalMatches} matchs joués</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participation</p>
                <p className="text-2xl font-bold">{stats.availabilityRate}%</p>
                <p className="text-xs text-muted-foreground">cette semaine</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions intelligentes */}
      {intelligentActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Actions recommandées</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intelligentActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                  onClick={action.action}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu détaillé avec onglets */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="game-stats">Statistiques {gameType ? gameType.replace('_', ' ').toUpperCase() : 'Jeu'}</TabsTrigger>
          <TabsTrigger value="team-health">Santé de l'équipe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetrics stats={stats} gameType={gameType} />
        </TabsContent>
        
        <TabsContent value="game-stats" className="space-y-6">
          {gameType ? (
            <GameSpecificStats gameType={gameType} stats={stats} />
          ) : (
            <Card className="text-center p-12">
              <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucun jeu défini pour cette équipe
              </p>
              <Button 
                onClick={() => onViewChange("settings")} 
                className="mt-4"
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurer l'équipe
              </Button>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="team-health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.availabilityRate}%</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.currentWeekAvailabilities}/{stats.totalAvailabilitySlots} joueurs disponibles
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analyse VOD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {stats.totalVODs > 0 ? Math.round((stats.reviewedVODs / stats.totalVODs) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.reviewedVODs}/{stats.totalVODs} VODs analysés
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feedbacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">{stats.pendingFeedbacks}</div>
                  <p className="text-sm text-muted-foreground">
                    en attente sur {stats.totalFeedbacks} total
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions rapides en bas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => onViewChange("calendar")}
          variant="outline"
          className="h-auto p-4 flex-col space-y-2"
        >
          <Calendar className="w-6 h-6" />
          <span>Calendrier</span>
        </Button>
        
        <Button 
          onClick={() => onViewChange("players")}
          variant="outline"
          className="h-auto p-4 flex-col space-y-2"
        >
          <Users className="w-6 h-6" />
          <span>Joueurs</span>
        </Button>
        
        <Button 
          onClick={() => onViewChange("coaching")}
          variant="outline"
          className="h-auto p-4 flex-col space-y-2"
        >
          <BarChart3 className="w-6 h-6" />
          <span>Coaching</span>
        </Button>
        
        <Button 
          onClick={() => onViewChange("settings")}
          variant="outline"
          className="h-auto p-4 flex-col space-y-2"
        >
          <Settings className="w-6 h-6" />
          <span>Paramètres</span>
        </Button>
      </div>
    </div>
  );
};