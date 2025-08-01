import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, Target, Bell, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SmartDashboardProps {
  teamId: string;
  gameType?: string;
  isStaff?: boolean;
  onViewChange: (view: string) => void;
}

interface DashboardStats {
  upcomingEvents: number;
  teamMembers: number;
  completedObjectives: number;
  pendingTasks: number;
  recentActivity: any[];
  quickActions: any[];
}

export const SmartDashboard = ({ teamId, gameType, isStaff = true, onViewChange }: SmartDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingEvents: 0,
    teamMembers: 0,
    completedObjectives: 0,
    pendingTasks: 0,
    recentActivity: [],
    quickActions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [teamId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques en parallèle
      const [eventsRes, membersRes, objectivesRes] = await Promise.all([
        // Événements à venir
        supabase
          .from("events")
          .select("*")
          .eq("team_id", teamId)
          .gte("date", new Date().toISOString())
          .limit(5),
        
        // Membres de l'équipe
        supabase
          .from("team_members")
          .select("*, profiles(pseudo)")
          .eq("team_id", teamId),
        
        // Placeholder pour les objectifs (feature à implémenter)
        Promise.resolve({ data: [] })
      ]);

      // Générer les actions rapides intelligentes
      const quickActions = generateQuickActions(eventsRes.data || [], membersRes.data || [], isStaff);
      
      setStats({
        upcomingEvents: eventsRes.data?.length || 0,
        teamMembers: membersRes.data?.length || 0,
        completedObjectives: 0, // À implémenter selon vos besoins
        pendingTasks: eventsRes.data?.filter(e => new Date(e.date_debut) <= new Date(Date.now() + 24*60*60*1000)).length || 0,
        recentActivity: eventsRes.data?.slice(0, 3) || [],
        quickActions
      });
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuickActions = (events: any[], members: any[], isStaff: boolean) => {
    const actions = [];
    
    if (isStaff) {
      if (events.length === 0) {
        actions.push({
          title: "Planifier un événement",
          description: "Aucun événement prévu cette semaine",
          action: () => onViewChange("calendar"),
          icon: Calendar,
          variant: "primary"
        });
      }
      
      if (members.length < 5) {
        actions.push({
          title: "Recruter des joueurs",
          description: `${members.length} membres dans l'équipe`,
          action: () => onViewChange("recruitment"),
          icon: Users,
          variant: "secondary"
        });
      }
      
      actions.push({
        title: "Analyser les performances",
        description: "Voir les derniers matchs",
        action: () => onViewChange("coaching"),
        icon: TrendingUp,
        variant: "outline"
      });
    } else {
      actions.push({
        title: "Mes objectifs",
        description: "Consulter mes objectifs personnels",
        action: () => onViewChange("objectives"),
        icon: Target,
        variant: "primary"
      });
      
      if (events.length > 0) {
        actions.push({
          title: "Prochain match",
          description: "Se préparer pour le prochain événement",
          action: () => onViewChange("calendar"),
          icon: Clock,
          variant: "secondary"
        });
      }
    }
    
    return actions;
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Événements à venir</p>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan/10 to-cyan/5 border-cyan/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membres équipe</p>
                <p className="text-2xl font-bold">{stats.teamMembers}</p>
              </div>
              <Users className="h-8 w-8 text-cyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange/10 to-orange/5 border-orange/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isStaff ? "Tâches urgentes" : "Objectifs atteints"}
                </p>
                <p className="text-2xl font-bold">{isStaff ? stats.pendingTasks : stats.completedObjectives}</p>
              </div>
              {isStaff ? <AlertCircle className="h-8 w-8 text-orange" /> : <CheckCircle2 className="h-8 w-8 text-orange" />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet/10 to-violet/5 border-violet/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-violet" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides intelligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Actions recommandées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.quickActions.map((action, index) => (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{action.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.titre}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.date_debut).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant={activity.type === 'match' ? 'default' : 'secondary'}>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};