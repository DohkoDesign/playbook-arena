import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Trophy, 
  BarChart3,
  RefreshCw,
  Star,
  AlertCircle
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
        // Auto-fetch stats if tracker username is configured but no stats exist
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
        <h1 className="text-2xl font-bold">Performance</h1>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Configuration requise</h3>
            <p className="text-muted-foreground mb-4">
              Configurez votre pseudo de tracker dans les paramètres (icône en haut à droite) pour voir vos statistiques de {gameConfig?.name || 'jeu'}
            </p>
            <Button variant="outline" onClick={() => window.location.href = '#'}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Aller aux paramètres
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {gameConfig?.name === 'Apex Legends' && <span className="text-2xl">🎯</span>}
          {gameConfig?.name === 'Valorant' && <span className="text-2xl">⚡</span>}
          {gameConfig?.name === 'League of Legends' && <span className="text-2xl">⚔️</span>}
          {gameConfig?.name === 'CS:GO / CS2' && <span className="text-2xl">🔫</span>}
          {gameConfig?.name === 'Overwatch 2' && <span className="text-2xl">🛡️</span>}
          {gameConfig?.name === 'Rocket League' && <span className="text-2xl">⚽</span>}
          {gameConfig?.name?.includes('Call of Duty') && <span className="text-2xl">💥</span>}
          <h1 className="text-2xl font-bold">Performance {gameConfig?.name}</h1>
        </div>
        <Button onClick={refreshTrackerStats} disabled={refreshing} variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {trackerStats?.player && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Profil Joueur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Pseudo</p>
                <p className="font-bold text-lg">{trackerStats.player.username}</p>
              </div>
              {trackerStats.player.rank && (
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Rang</p>
                  <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">{trackerStats.player.rank}</Badge>
                </div>
              )}
              {trackerStats.player.level && (
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-bold text-xl text-blue-600">{trackerStats.player.level}</p>
                </div>
              )}
              {trackerStats.player.rankScore && (
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">RP/Score</p>
                  <p className="font-bold text-xl text-green-600">{trackerStats.player.rankScore}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {trackerStats?.stats && (
        <div className="space-y-6">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(trackerStats.stats).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </p>
                      <p className="text-2xl font-bold">
                        {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(2)) : String(value)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistiques par légende/agent */}
          {(trackerStats?.legends || trackerStats?.agents) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {trackerStats?.legends ? 'Légendes' : 'Agents'} les plus joués
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackerStats.legends?.killsByLegend && (
                    <div>
                      <h4 className="font-medium mb-3">Éliminations par Légende</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(trackerStats.legends.killsByLegend).map(([legend, kills]) => (
                          <div key={legend} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="font-medium">{legend}</span>
                            <Badge variant="outline">{String(kills)} kills</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {trackerStats.legends?.winsByLegend && (
                    <div>
                      <h4 className="font-medium mb-3">Victoires par Légende</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(trackerStats.legends.winsByLegend).map(([legend, wins]) => (
                          <div key={legend} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="font-medium">{legend}</span>
                            <Badge variant="outline" className="bg-green-50">{String(wins)} wins</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {trackerStats.agents?.winRateByAgent && (
                    <div>
                      <h4 className="font-medium mb-3">Winrate par Agent</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(trackerStats.agents.winRateByAgent).map(([agent, winRate]) => (
                          <div key={agent} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="font-medium">{agent}</span>
                            <Badge variant="outline">{String(winRate)}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistiques récentes */}
          {trackerStats?.recent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Performances Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(trackerStats.recent.last10Games || trackerStats.recent.last5Games || {}).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/avg/i, 'Moy.')}
                      </p>
                      <p className="text-xl font-bold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations de saison */}
          {trackerStats?.season && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Saison Actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Rang Actuel</p>
                    <Badge className="text-lg px-3 py-1">{trackerStats.season.currentRank}</Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Meilleur Rang</p>
                    <Badge variant="outline" className="text-lg px-3 py-1">{trackerStats.season.highestRank}</Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">RP Actuels</p>
                    <p className="text-xl font-bold">{trackerStats.season.rp}</p>
                  </div>
                  {trackerStats.season.rp_needed > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">RP pour rank up</p>
                      <p className="text-xl font-bold text-blue-600">{trackerStats.season.rp_needed}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {trackerStats?.agents?.mostPlayed && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{trackerStats.agents.mostPlayed}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};