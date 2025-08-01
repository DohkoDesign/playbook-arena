import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Target, 
  Trophy, 
  Star,
  Zap,
  BarChart3,
  Clock,
  Award,
  Activity,
  GamepadIcon,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Video
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdvancedDashboardProps {
  teamId: string;
  gameType?: string;
  teamData?: any;
  isStaff?: boolean;
  onViewChange: (view: string) => void;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  upcomingEvents: number;
  completedMatches: number;
  winRate: number;
  recentPerformance: any[];
  memberRoles: any[];
  activityData: any[];
  teamInfo: any;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--cyan))', 'hsl(var(--orange))', 'hsl(var(--violet))'];

export const AdvancedDashboard = ({ teamId, gameType, teamData, isStaff = true, onViewChange }: AdvancedDashboardProps) => {
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    upcomingEvents: 0,
    completedMatches: 0,
    winRate: 0,
    recentPerformance: [],
    memberRoles: [],
    activityData: [],
    teamInfo: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadAdvancedStats();
    }
  }, [teamId]);

  const loadAdvancedStats = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [teamRes, membersRes, eventsRes] = await Promise.all([
        // Informations de l'équipe
        supabase.from("teams").select("*").eq("id", teamId).single(),
        
        // Membres de l'équipe avec leurs profils
        supabase
          .from("team_members")
          .select("*, profiles!inner(pseudo, photo_profil, tracker_last_updated)")
          .eq("team_id", teamId),
        
        // Événements (passés et futurs)
        supabase
          .from("events")
          .select("*")
          .eq("team_id", teamId)
          .order("date_debut", { ascending: false })
      ]);

      if (teamRes.error) throw teamRes.error;

      const teamInfo = teamRes.data;
      const members = membersRes.data || [];
      const events = eventsRes.data || [];

      // Calculer les statistiques
      const now = new Date();
      const upcomingEvents = events.filter(e => new Date(e.date_debut) > now);
      const pastEvents = events.filter(e => new Date(e.date_debut) <= now);
      const matches = pastEvents.filter(e => e.type === 'match');
      
      // Simuler un taux de victoire basé sur les événements
      const winRate = matches.length > 0 ? Math.round(Math.random() * 40 + 60) : 0;

      // Répartition des rôles
      const roleDistribution = members.reduce((acc, member) => {
        const role = member.role || 'joueur';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const memberRoles = Object.entries(roleDistribution).map(([role, count]) => ({
        name: role,
        value: count as number
      }));

      // Données d'activité simulées
      const activityData = generateActivityData(events, []);

      // Performance récente (basée sur les événements récents)
      const recentPerformance = generatePerformanceData(pastEvents.slice(0, 7));

      setStats({
        totalMembers: members.length,
        activeMembers: members.filter(m => 
          m.role && ['joueur', 'remplacant', 'capitaine'].includes(m.role)
        ).length,
        upcomingEvents: upcomingEvents.length,
        completedMatches: matches.length,
        winRate,
        recentPerformance,
        memberRoles,
        activityData,
        teamInfo
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques avancées:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateActivityData = (events: any[], coachingSessions: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    return last7Days.map(date => {
      const dayEvents = events.filter(e => 
        new Date(e.date_debut).toDateString() === date.toDateString()
      );
      const daySessions = coachingSessions.filter(s => 
        new Date(s.created_at).toDateString() === date.toDateString()
      );

      return {
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        events: dayEvents.length,
        sessions: daySessions.length,
        activity: dayEvents.length + daySessions.length
      };
    });
  };

  const generatePerformanceData = (recentEvents: any[]) => {
    return recentEvents.map((event, index) => ({
      match: `Match ${recentEvents.length - index}`,
      performance: Math.floor(Math.random() * 40) + 60, // Simulé entre 60-100
      date: new Date(event.date_debut).toLocaleDateString('fr-FR')
    }));
  };

  const getGameDisplayName = (gameType: string) => {
    const gameNames: {[key: string]: string} = {
      'valorant': 'Valorant',
      'rocket_league': 'Rocket League',
      'league_of_legends': 'League of Legends',
      'counter_strike': 'CS2',
      'overwatch': 'Overwatch 2',
      'apex_legends': 'Apex Legends',
      'call_of_duty': 'Call of Duty'
    };
    return gameNames[gameType] || gameType;
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

  return (
    <div className="space-y-8">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Joueurs actifs</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Événements à venir</p>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matchs joués</p>
                <p className="text-2xl font-bold">{stats.completedMatches}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{stats.winRate}%</p>
                  {stats.winRate >= 70 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique d'activité */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Activité de l'équipe (7 derniers jours)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition des rôles */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Répartition des rôles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.memberRoles}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.memberRoles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance récente */}
      {stats.recentPerformance.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.recentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="match" className="text-sm" />
                  <YAxis domain={[0, 100]} className="text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="hsl(var(--cyan))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--cyan))', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          onClick={() => onViewChange("calendar")}
          variant="outline"
          className="h-auto p-6 border-2 hover:bg-accent"
        >
          <div className="text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold">Calendrier</p>
            <p className="text-xs text-muted-foreground">Gérer les événements</p>
          </div>
        </Button>

        <Button 
          onClick={() => onViewChange("players")}
          variant="outline"
          className="h-auto p-6 border-2 hover:bg-accent"
        >
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="font-semibold">Équipe</p>
            <p className="text-xs text-muted-foreground">Gérer les membres</p>
          </div>
        </Button>

        <Button 
          onClick={() => onViewChange("coaching")}
          variant="outline"
          className="h-auto p-6 border-2 hover:bg-accent"
        >
          <div className="text-center">
            <Video className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="font-semibold">Coaching</p>
            <p className="text-xs text-muted-foreground">Analyser les performances</p>
          </div>
        </Button>

        <Button 
          onClick={() => onViewChange("strategies")}
          variant="outline"
          className="h-auto p-6 border-2 hover:bg-accent"
        >
          <div className="text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="font-semibold">Stratégies</p>
            <p className="text-xs text-muted-foreground">Créer des tactiques</p>
          </div>
        </Button>
      </div>
    </div>
  );
};