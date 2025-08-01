import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Trophy, 
  RefreshCw,
  Star,
  AlertCircle,
  Target,
  Award,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement de vos performances...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.tracker_usernames?.[teamData?.jeu]) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Configuration requise</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configurez votre pseudo de tracker dans les paramètres pour voir vos statistiques de {gameConfig?.name}
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Target className="w-4 h-4 mr-2" />
            Aller aux paramètres
          </Button>
        </div>
      </div>
    );
  }

  const mainStats = [
    { label: "Matches", value: trackerStats?.stats?.matchesPlayed || trackerStats?.stats?.gamesPlayed, icon: Target },
    { label: "Victoires", value: trackerStats?.stats?.wins, icon: Trophy },
    { label: "K/D", value: trackerStats?.stats?.kd, icon: Zap },
    { label: "Winrate", value: trackerStats?.stats?.winRate + "%", icon: Award }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center text-2xl">
            {gameIcon}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Performance</h1>
            <p className="text-muted-foreground">{gameConfig?.name}</p>
          </div>
        </div>
        <Button 
          onClick={refreshTrackerStats} 
          disabled={refreshing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* Profil joueur */}
      {trackerStats?.player && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {trackerStats.player.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{trackerStats.player.username}</h3>
                  <p className="text-muted-foreground">Level {trackerStats.player.level || 'N/A'}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  {trackerStats.player.rank}
                </Badge>
                {trackerStats.player.rankScore && (
                  <p className="text-sm text-muted-foreground mt-1">{trackerStats.player.rankScore} RP</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value || '0'}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Légendes/Agents */}
      {(trackerStats?.legends?.mostPlayed || trackerStats?.agents?.mostPlayed) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {trackerStats?.legends ? 'Légende' : 'Agent'} Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">
                  {trackerStats.legends?.mostPlayed || trackerStats.agents?.mostPlayed}
                </h4>
                <p className="text-muted-foreground">Votre personnage le plus joué</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performances récentes */}
      {trackerStats?.recent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Performances Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(trackerStats.recent.last10Games || trackerStats.recent.last5Games || {}).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-muted rounded-lg">
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
  );
};