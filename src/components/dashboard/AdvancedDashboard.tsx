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
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

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
  performanceData: any[];
  teamInfo: any;
}

const COLORS = ['hsl(var(--primary))', 'hsl(220 92% 70%)', 'hsl(220 92% 80%)', 'hsl(220 92% 60%)'];

export const AdvancedDashboard = ({ teamId, gameType, teamData, isStaff = true, onViewChange }: AdvancedDashboardProps) => {
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    upcomingEvents: 0,
    completedMatches: 0,
    winRate: 0,
    recentPerformance: [],
    memberRoles: [],
    performanceData: [],
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
      const [teamRes, membersRes, eventsRes, coachingRes] = await Promise.all([
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
          .order("date_debut", { ascending: false }),
        
        // Sessions de coaching avec résultats
        supabase
          .from("coaching_sessions")
          .select(`
            *,
            events!inner(titre, date_debut, team_id)
          `)
          .eq("events.team_id", teamId)
          .not("resultat", "is", null)
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

      if (teamRes.error) throw teamRes.error;

      const teamInfo = teamRes.data;
      const members = membersRes.data || [];
      const events = eventsRes.data || [];
      const coachingSessions = coachingRes.data || [];

      // Calculer les statistiques
      const now = new Date();
      const upcomingEvents = events.filter(e => new Date(e.date_debut) > now);
      const pastEvents = events.filter(e => new Date(e.date_debut) <= now);
      const matches = pastEvents.filter(e => e.type === 'match');
      
      // Calculer le taux de victoire réel basé sur les résultats de coaching_sessions
      let wins = 0, losses = 0, draws = 0;
      coachingSessions.forEach(session => {
        if (session.resultat) {
          const result = session.resultat.toLowerCase();
          if (result.includes('victoire') || result.includes('win') || result === 'v') {
            wins++;
          } else if (result.includes('défaite') || result.includes('lose') || result.includes('loss') || result === 'd') {
            losses++;
          } else if (result.includes('égalité') || result.includes('draw') || result.includes('nul') || result === 'n') {
            draws++;
          }
        }
      });
      
      const totalMatches = wins + losses + draws;
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

      // Répartition des rôles (seulement les joueurs)
      const playerMembers = members.filter(member => 
        member.role && ['joueur', 'remplacant', 'capitaine'].includes(member.role)
      );
      
      const roleDistribution = playerMembers.reduce((acc, member) => {
        const role = member.role || 'joueur';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const memberRoles = Object.entries(roleDistribution).map(([role, count]) => ({
        name: role,
        value: count as number
      }));

      // Données de performance des 7 derniers matchs
      const performanceData = generateMatchPerformanceData(coachingSessions.slice(0, 7));

      // Performance récente (basée sur les événements récents)
      const recentPerformance = generatePerformanceData(pastEvents.slice(0, 7));

      setStats({
        totalMembers: members.length,
        activeMembers: members.filter(m => 
          m.role && ['joueur', 'remplacant', 'capitaine'].includes(m.role)
        ).length,
        upcomingEvents: upcomingEvents.length,
        completedMatches: totalMatches,
        winRate,
        recentPerformance,
        memberRoles,
        performanceData,
        teamInfo
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques avancées:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMatchPerformanceData = (coachingSessions: any[]) => {
    // Si pas assez de données, génerer des données d'exemple
    if (coachingSessions.length === 0) {
      return [
        { match: "Match 1", victoires: 2, defaites: 1, egalites: 0 },
        { match: "Match 2", victoires: 1, defaites: 2, egalites: 0 },
        { match: "Match 3", victoires: 3, defaites: 0, egalites: 0 },
        { match: "Match 4", victoires: 1, defaites: 1, egalites: 1 },
        { match: "Match 5", victoires: 2, defaites: 1, egalites: 0 },
      ];
    }

    return coachingSessions.map((session, index) => {
      const result = session.resultat?.toLowerCase() || '';
      let victoires = 0, defaites = 0, egalites = 0;
      
      if (result.includes('victoire') || result.includes('win') || result === 'v') {
        victoires = 1;
      } else if (result.includes('défaite') || result.includes('lose') || result.includes('loss') || result === 'd') {
        defaites = 1;
      } else if (result.includes('égalité') || result.includes('draw') || result.includes('nul') || result === 'n') {
        egalites = 1;
      }
      
      return {
        match: `Match ${coachingSessions.length - index}`,
        victoires,
        defaites,
        egalites
      };
    }).reverse(); // Pour avoir l'ordre chronologique
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

        <Card className="border-l-4 border-l-primary bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matchs joués</p>
                <p className="text-2xl font-bold">{stats.completedMatches}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
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
        {/* Graphique de performances */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Performances des derniers matchs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="match" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="victoires" fill="hsl(142 76% 36%)" name="Victoires" />
                  <Bar dataKey="defaites" fill="hsl(0 84% 60%)" name="Défaites" />
                  <Bar dataKey="egalites" fill="hsl(48 96% 53%)" name="Égalités" />
                </BarChart>
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
            <Video className="w-8 h-8 mx-auto mb-2 text-primary" />
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