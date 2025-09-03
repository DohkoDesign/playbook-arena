import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Target,
  Eye,
  MessageSquare,
  Clock,
  BarChart3,
  Activity
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TeamStats } from "./TeamStatsService";

interface PerformanceMetricsProps {
  stats: TeamStats;
  gameType?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658'];

export const PerformanceMetrics = ({ stats }: PerformanceMetricsProps) => {
  
  // Données pour le graphique de performances récentes
  const recentPerformanceData = stats.recentMatches.map((match, index) => ({
    match: `M${stats.recentMatches.length - index}`,
    result: match.result === 'win' ? 1 : match.result === 'draw' ? 0.5 : 0,
    date: new Date(match.date).toLocaleDateString('fr-FR')
  }));

  // Données pour la répartition des rôles
  const roleData = Object.entries(stats.playersByRole).map(([role, count]) => ({
    name: getRoleDisplayName(role),
    value: count,
    percentage: Math.round((count / stats.totalMembers) * 100)
  }));

  // Calculer la tendance des performances
  const getPerformanceTrend = () => {
    if (stats.recentMatches.length < 2) return null;
    
    const recent = stats.recentMatches.slice(0, 3);
    const older = stats.recentMatches.slice(3, 6);
    
    const recentWins = recent.filter(m => m.result === 'win').length;
    const olderWins = older.filter(m => m.result === 'win').length;
    
    const recentWinRate = recent.length > 0 ? (recentWins / recent.length) * 100 : 0;
    const olderWinRate = older.length > 0 ? (olderWins / older.length) * 100 : 0;
    
    return recentWinRate - olderWinRate;
  };

  const performanceTrend = getPerformanceTrend();

  return (
    <div className="space-y-6">
      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de victoire</p>
                <p className="text-2xl font-bold flex items-center space-x-2">
                  <span>{stats.winRate}%</span>
                  {performanceTrend !== null && (
                    performanceTrend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.wins}V - {stats.losses}D - {stats.draws}N
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activité équipe</p>
                <p className="text-2xl font-bold">{stats.availabilityRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.currentWeekAvailabilities}/{stats.totalAvailabilitySlots} dispos
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">VODs analysés</p>
                <p className="text-2xl font-bold">{stats.reviewedVODs}</p>
                <p className="text-xs text-muted-foreground">
                  sur {stats.totalVODs} total
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Eye className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Feedbacks</p>
                <p className="text-2xl font-bold">{stats.pendingFeedbacks}</p>
                <p className="text-xs text-muted-foreground">
                  en attente sur {stats.totalFeedbacks}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <MessageSquare className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performances récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performances récentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentPerformanceData}>
                  <defs>
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="match" />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => value === 1 ? 'V' : value === 0.5 ? 'N' : 'D'} />
                  <Tooltip 
                    formatter={(value) => [
                      value === 1 ? 'Victoire' : value === 0.5 ? 'Nul' : 'Défaite',
                      'Résultat'
                    ]}
                    labelFormatter={(label) => `Match ${label}`}
                  />
                  <Area
                    type="step"
                    dataKey="result"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#performanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition des rôles */}
        <Card>
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
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} membre${Number(value) > 1 ? 's' : ''}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution des performances dans le temps */}
      {stats.performanceOverTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Évolution mensuelle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.performanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'winRate' ? `${value}%` : value,
                      name === 'winRate' ? 'Taux de victoire' : 'Matchs joués'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicateurs de santé de l'équipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Santé de l'équipe</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Participation aux entraînements</span>
                  <span className="text-sm text-muted-foreground">{stats.availabilityRate}%</span>
                </div>
                <Progress value={stats.availabilityRate} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">VODs analysés</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalVODs > 0 ? Math.round((stats.reviewedVODs / stats.totalVODs) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalVODs > 0 ? (stats.reviewedVODs / stats.totalVODs) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Performance récente</span>
                  <span className="text-sm text-muted-foreground">{stats.winRate}%</span>
                </div>
                <Progress value={stats.winRate} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Feedbacks traités</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalFeedbacks > 0 ? Math.round(((stats.totalFeedbacks - stats.pendingFeedbacks) / stats.totalFeedbacks) * 100) : 100}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalFeedbacks > 0 ? ((stats.totalFeedbacks - stats.pendingFeedbacks) / stats.totalFeedbacks) * 100 : 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getRoleDisplayName(role: string): string {
  const roleNames: {[key: string]: string} = {
    'owner': 'Propriétaire',
    'manager': 'Manager',
    'coach': 'Coach',
    'capitaine': 'Capitaine',
    'joueur': 'Joueur',
    'remplacant': 'Remplaçant',
    'analyste': 'Analyste'
  };
  return roleNames[role] || role;
}