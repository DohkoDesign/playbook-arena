import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Trophy, 
  RefreshCw,
  Star,
  AlertCircle,
  Target,
  Award,
  Zap,
  BarChart3,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PlayerPerformanceViewProps {
  teamId: string;
  playerId: string;
  userProfile?: any;
  teamData?: any;
}

const gameIcons = {
  'apex_legends': '🎯',
  'valorant': '⚡',
  'league_of_legends': '⚔️',
  'csgo': '🔫',
  'overwatch': '🛡️',
  'rocket_league': '⚽',
  'cod_warzone': '💥',
  'cod_multiplayer': '🎮'
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const PlayerPerformanceView = ({ 
  teamId, 
  playerId, 
  userProfile, 
  teamData 
}: PlayerPerformanceViewProps) => {
  const [trackerStats, setTrackerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const gameConfig = teamData?.jeu ? getGameConfig(teamData.jeu) : null;
  const gameIcon = gameIcons[teamData?.jeu as keyof typeof gameIcons] || '🎮';

  const refreshTrackerStats = async () => {
    if (!teamData?.jeu || !userProfile?.tracker_usernames?.[teamData.jeu]) {
      toast({
        title: "Configuration requise",
        description: "Configurez votre pseudo de tracker dans les paramètres",
        variant: "destructive",
      });
      return;
    }

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-tracker-stats', {
        body: {
          game: teamData.jeu,
          username: userProfile.tracker_usernames[teamData.jeu]
        }
      });

      if (error) throw error;

      if (data.success) {
        setTrackerStats(data.data);
        
        await supabase
          .from("profiles")
          .update({ 
            tracker_stats: data.data,
            tracker_last_updated: new Date().toISOString()
          })
          .eq("user_id", playerId);

        toast({
          title: "Statistiques mises à jour",
          description: "Vos statistiques ont été actualisées",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les statistiques",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeTrackerData = async () => {
      if (userProfile?.tracker_stats && Object.keys(userProfile.tracker_stats).length > 0) {
        setTrackerStats(userProfile.tracker_stats);
        setLoading(false);
      } else if (userProfile?.tracker_usernames?.[teamData?.jeu]) {
        try {
          setRefreshing(true);
          const { data, error } = await supabase.functions.invoke('fetch-tracker-stats', {
            body: {
              game: teamData.jeu,
              username: userProfile.tracker_usernames[teamData.jeu]
            }
          });

          if (error) throw error;

          if (data.success) {
            setTrackerStats(data.data);
            
            await supabase
              .from("profiles")
              .update({ 
                tracker_stats: data.data,
                tracker_last_updated: new Date().toISOString()
              })
              .eq("user_id", playerId);

            toast({
              title: "Statistiques récupérées",
              description: "Vos statistiques de tracker ont été récupérées automatiquement",
            });
          }
        } catch (error: any) {
          console.error('Error auto-fetching tracker stats:', error);
        } finally {
          setRefreshing(false);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (userProfile && teamData) {
      initializeTrackerData();
    } else {
      setLoading(false);
    }
  }, [userProfile?.user_id, teamData?.jeu]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-8 h-8 mx-auto mb-4 text-muted-foreground animate-pulse" />
        <p>Chargement de vos performances...</p>
      </div>
    );
  }

  if (!userProfile?.tracker_usernames?.[teamData?.jeu]) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {gameIcon} Performance {gameConfig?.name}
          </h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Configuration requise</h3>
            <p className="text-muted-foreground mb-4">
              Configurez votre pseudo de tracker dans les paramètres (icône en haut à droite) pour voir vos statistiques de {gameConfig?.name || 'jeu'}
            </p>
            <Button variant="outline">
              <AlertCircle className="w-4 h-4 mr-2" />
              Aller aux paramètres
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const performanceData = [
    { name: 'Match 1', kills: 3, damage: 450, placement: 12 },
    { name: 'Match 2', kills: 1, damage: 320, placement: 8 },
    { name: 'Match 3', kills: 5, damage: 680, placement: 3 },
    { name: 'Match 4', kills: 2, damage: 410, placement: 15 },
    { name: 'Match 5', kills: 4, damage: 590, placement: 6 },
    { name: 'Match 6', kills: 0, damage: 180, placement: 18 },
    { name: 'Match 7', kills: 6, damage: 720, placement: 2 },
    { name: 'Match 8', kills: 3, damage: 480, placement: 9 },
    { name: 'Match 9', kills: 2, damage: 390, placement: 11 },
    { name: 'Match 10', kills: 4, damage: 620, placement: 4 },
  ];

  const legendsData = trackerStats?.legends?.killsByLegend ? 
    Object.entries(trackerStats.legends.killsByLegend).map(([name, value]) => ({
      name,
      value: Number(value),
      fill: COLORS[Object.keys(trackerStats.legends.killsByLegend).indexOf(name) % COLORS.length]
    })) : [];

  const winRate = trackerStats?.stats?.winRate ? parseFloat(trackerStats.stats.winRate) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {gameIcon} Performance {gameConfig?.name}
        </h1>
        <Button onClick={refreshTrackerStats} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Profil joueur */}
      {trackerStats?.player && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Profil Joueur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pseudo</p>
                <p className="font-bold">{trackerStats.player.username}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Rang</p>
                <Badge variant="outline">{trackerStats.player.rank}</Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-bold">{trackerStats.player.level}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">RP</p>
                <p className="font-bold text-green-600">{trackerStats.player.rankScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Plateforme</p>
                <p className="font-medium">{trackerStats.player.platform || 'PC'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales en grille */}
      {trackerStats?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(trackerStats.stats).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(1)) : String(value)}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/([a-z])([A-Z])/g, '$1 $2')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique de performance des derniers matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance des 10 derniers matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="kills" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="damage" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par légende */}
        {legendsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Répartition par Légende
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={legendsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {legendsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Progress bars pour les stats importantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Winrate</span>
                <span className="text-sm text-muted-foreground">{winRate}%</span>
              </div>
              <Progress value={winRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">K/D Ratio</span>
                <span className="text-sm text-muted-foreground">{trackerStats?.stats?.kd || '0.00'}</span>
              </div>
              <Progress value={Math.min((parseFloat(trackerStats?.stats?.kd || '0') / 3) * 100, 100)} className="h-2" />
            </div>

            {trackerStats?.stats?.avgDamage && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Damage moyen</span>
                  <span className="text-sm text-muted-foreground">{trackerStats.stats.avgDamage}</span>
                </div>
                <Progress value={Math.min((trackerStats.stats.avgDamage / 1000) * 100, 100)} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performances récentes */}
        {trackerStats?.recent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performances Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(trackerStats.recent.last10Games || trackerStats.recent.last5Games || {}).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">{String(value)}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/avg/i, 'Moy.')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Légende principale */}
      {(trackerStats?.legends?.mostPlayed || trackerStats?.agents?.mostPlayed) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {trackerStats?.legends ? 'Légende' : 'Agent'} Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {trackerStats.legends?.mostPlayed || trackerStats.agents?.mostPlayed}
              </Badge>
              <span className="text-muted-foreground">Votre personnage le plus joué</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};