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
      console.log('PlayerPerformanceView - userProfile:', userProfile);
      console.log('PlayerPerformanceView - teamData:', teamData);
      
      if (userProfile?.tracker_stats && Object.keys(userProfile.tracker_stats).length > 0) {
        console.log('Setting existing tracker stats:', userProfile.tracker_stats);
        setTrackerStats(userProfile.tracker_stats);
        setLoading(false);
      } else if (userProfile?.tracker_usernames?.[teamData?.jeu]) {
        console.log('Auto-fetching stats for game:', teamData.jeu, 'username:', userProfile.tracker_usernames[teamData.jeu]);
        // Auto-fetch stats if tracker username is configured but no stats exist
        try {
          setRefreshing(true);
          const { data, error } = await supabase.functions.invoke('fetch-tracker-stats', {
            body: {
              game: teamData.jeu,
              username: userProfile.tracker_usernames[teamData.jeu]
            }
          });

          console.log('Tracker API response:', data, error);

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
        console.log('No tracker username configured for game:', teamData?.jeu);
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
        <h1 className="text-2xl font-bold">Performance {gameConfig?.name}</h1>
        <Button onClick={refreshTrackerStats} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {trackerStats?.player && (
        <Card>
          <CardHeader>
            <CardTitle>Profil Joueur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pseudo</p>
                <p className="font-bold">{trackerStats.player.username}</p>
              </div>
              {trackerStats.player.rank && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Rang</p>
                  <Badge>{trackerStats.player.rank}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {trackerStats?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(trackerStats.stats).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <p className="text-2xl font-bold">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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