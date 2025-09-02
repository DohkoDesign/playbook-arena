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
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from "recharts";

interface AdvancedDashboardProps {
  teamId: string;
  gameType?: string;
  teamData?: any;
  isStaff?: boolean;
  onViewChange: (view: string) => void;
  currentUserId?: string;
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

export const AdvancedDashboard = ({ teamId, gameType, teamData, isStaff = true, onViewChange, currentUserId }: AdvancedDashboardProps) => {
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
      
      // DONNÉES FICTIVES - À remplacer plus tard
      const fakeMembers = [
        { role: 'joueur', pseudo: 'ProPlayer1' },
        { role: 'joueur', pseudo: 'FragMaster' },
        { role: 'capitaine', pseudo: 'TeamLeader' },
        { role: 'remplacant', pseudo: 'SubPlayer' },
        { role: 'joueur', pseudo: 'AimBot2000' },
        { role: 'joueur', pseudo: 'ClutchKing' },
        { role: 'coach', pseudo: 'MasterCoach' },
        { role: 'analyste', pseudo: 'DataWizard' }
      ];

      const fakeEvents = 12; // événements à venir
      const fakeMatches = 24; // matchs joués
      const fakeWinRate = 78; // 78% de victoires

      // Répartition des rôles fictive
      const fakeRoleDistribution = {
        'joueur': 5,
        'capitaine': 1,
        'remplacant': 1,
        'coach': 1
      };

      const memberRoles = Object.entries(fakeRoleDistribution).map(([role, count]) => ({
        name: role,
        value: count as number
      }));

      // Données de performance fictives (plus impressionnantes)
      const performanceData = [
        { match: "Finale ESL", victoires: 3, defaites: 1, egalites: 0, score: 92 },
        { match: "Semi DreamHack", victoires: 2, defaites: 0, egalites: 1, score: 87 },
        { match: "Quart IEM", victoires: 2, defaites: 1, egalites: 0, score: 84 },
        { match: "8e BLAST", victoires: 3, defaites: 0, egalites: 0, score: 95 },
        { match: "16e Major", victoires: 2, defaites: 2, egalites: 0, score: 76 },
        { match: "Groupe A", victoires: 2, defaites: 0, egalites: 1, score: 89 },
        { match: "Qualif", victoires: 3, defaites: 1, egalites: 0, score: 91 }
      ];

      // Performance récente fictive avec tendance positive
      const recentPerformance = [
        { match: "Semaine 1", performance: 72, kills: 89, deaths: 67, assists: 124 },
        { match: "Semaine 2", performance: 76, kills: 94, deaths: 61, assists: 138 },
        { match: "Semaine 3", performance: 81, kills: 102, deaths: 58, assists: 145 },
        { match: "Semaine 4", performance: 78, kills: 87, deaths: 72, assists: 132 },
        { match: "Semaine 5", performance: 85, kills: 118, deaths: 54, assists: 156 },
        { match: "Semaine 6", performance: 88, kills: 124, deaths: 49, assists: 167 },
        { match: "Semaine 7", performance: 92, kills: 134, deaths: 45, assists: 178 }
      ];

      setStats({
        totalMembers: fakeMembers.length,
        activeMembers: 6, // joueurs actifs
        upcomingEvents: fakeEvents,
        completedMatches: fakeMatches,
        winRate: fakeWinRate,
        recentPerformance,
        memberRoles,
        performanceData,
        teamInfo: { nom: "Team Champions", jeu: gameType }
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
        {/* Graphique de performances moderne */}
        <Card className="shadow-elegant bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Score de Performance par Match</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.performanceData}>
                  <defs>
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis 
                    dataKey="match" 
                    className="text-xs" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={[60, 100]} className="text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)'
                    }}
                    formatter={(value, name) => [
                      `${value}${name === 'score' ? '%' : ''}`, 
                      name === 'score' ? 'Score Performance' : name
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#performanceGradient)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
                  />
                </ComposedChart>
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

      {/* Statistiques détaillées avec plusieurs métriques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-elegant bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span>Évolution Hebdomadaire</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.recentPerformance}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="match" className="text-sm" />
                  <YAxis domain={[60, 100]} className="text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="performance"
                    stroke="hsl(142 76% 36%)"
                    fillOpacity={1}
                    fill="url(#weeklyGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-500" />
              <span>K/D/A Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.recentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="match" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="kills" fill="hsl(142 76% 36%)" name="Kills" />
                  <Bar dataKey="deaths" fill="hsl(0 84% 60%)" name="Deaths" />
                  <Line 
                    type="monotone" 
                    dataKey="assists" 
                    stroke="hsl(48 96% 53%)" 
                    strokeWidth={3}
                    name="Assists"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

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