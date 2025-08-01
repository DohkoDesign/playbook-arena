import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  User, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

interface TrackerSettingsProps {
  userId: string;
  userProfile: any;
  teamData: any;
}

export const TrackerSettings = ({ userId, userProfile, teamData }: TrackerSettingsProps) => {
  const [trackerUsernames, setTrackerUsernames] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.tracker_usernames) {
      setTrackerUsernames(userProfile.tracker_usernames);
    }
    if (userProfile?.tracker_last_updated) {
      setLastUpdated(userProfile.tracker_last_updated);
    }
  }, [userProfile]);

  const updateTrackerUsername = async (game: string, username: string) => {
    if (!username.trim()) {
      toast({
        title: "Erreur",
        description: "Le pseudo ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUsernames = {
        ...trackerUsernames,
        [game]: username.trim()
      };

      console.log('Updating tracker username:', { game, username: username.trim(), updatedUsernames });

      const { error } = await supabase
        .from("profiles")
        .update({ 
          tracker_usernames: updatedUsernames 
        })
        .eq("user_id", userId);

      if (error) throw error;

      setTrackerUsernames(updatedUsernames);
      
      toast({
        title: "Pseudo sauvegardé",
        description: `Votre pseudo ${getGameConfig(game)?.name} a été sauvegardé avec succès. Cliquez sur "Actualiser" pour récupérer vos stats.`,
      });
    } catch (error: any) {
      console.error('Error updating tracker username:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le pseudo",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshStats = async () => {
    if (!teamData?.jeu || !trackerUsernames[teamData.jeu]) {
      toast({
        title: "Erreur",
        description: "Aucun pseudo configuré pour ce jeu",
        variant: "destructive",
      });
      return;
    }

    setIsRefreshing(true);
    console.log('Refreshing stats for:', teamData.jeu, 'with username:', trackerUsernames[teamData.jeu]);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-tracker-stats', {
        body: {
          game: teamData.jeu,
          username: trackerUsernames[teamData.jeu]
        }
      });

      if (error) throw error;

      if (data.success) {
        // Mettre à jour les stats en base
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            tracker_stats: data.data,
            tracker_last_updated: new Date().toISOString()
          })
          .eq("user_id", userId);

        if (updateError) throw updateError;

        setLastUpdated(new Date().toISOString());
        
        toast({
          title: "Statistiques mises à jour",
          description: "Vos statistiques ont été récupérées avec succès",
        });
      } else {
        throw new Error(data.error || "Erreur lors de la récupération des stats");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les statistiques",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Obtenir les jeux joués par l'utilisateur
  const gamesPlayed = userProfile?.jeux_joues || [teamData?.jeu].filter(Boolean);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Configuration des Trackers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Pseudos de Tracker</h3>
                <p className="text-sm text-muted-foreground">
                  Configurez vos pseudos pour récupérer automatiquement vos statistiques
                </p>
              </div>
              {lastUpdated && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Dernière mise à jour</p>
                  <p className="text-sm font-medium">{formatLastUpdated(lastUpdated)}</p>
                </div>
              )}
            </div>

            <Separator />

            {gamesPlayed.map((game: string) => {
              const gameConfig = getGameConfig(game);
              if (!gameConfig) return null;

              return (
                <div key={game} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{gameConfig.name}</Badge>
                    {gameConfig.trackerName && (
                      <a 
                        href={gameConfig.trackerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {gameConfig.trackerName}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`tracker-${game}`} className="text-sm">
                        Pseudo sur {gameConfig.trackerName || "Tracker"}
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`tracker-${game}`}
                          className="pl-9"
                          placeholder={`Votre pseudo ${gameConfig.name}`}
                          value={trackerUsernames[game] || ''}
                          onChange={(e) => setTrackerUsernames(prev => ({
                            ...prev,
                            [game]: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button
                        onClick={() => updateTrackerUsername(game, trackerUsernames[game] || '')}
                        disabled={isUpdating || !trackerUsernames[game]?.trim()}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Sauver
                      </Button>
                    </div>
                  </div>

                  {trackerUsernames[game] && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-muted-foreground">
                        Pseudo configuré : {trackerUsernames[game]}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Actions de synchronisation */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Synchronisation des Statistiques</h3>
              <p className="text-sm text-muted-foreground">
                Récupérez vos dernières statistiques depuis les trackers
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Statistiques {getGameConfig(teamData?.jeu)?.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trackerUsernames[teamData?.jeu] 
                    ? `Configuré pour ${trackerUsernames[teamData.jeu]}`
                    : "Pseudo non configuré"
                  }
                </p>
              </div>
              
              <Button
                onClick={refreshStats}
                disabled={isRefreshing || !trackerUsernames[teamData?.jeu]}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Mise à jour...' : 'Actualiser'}
              </Button>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  À propos de la synchronisation
                </p>
                <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
                  <li>• Les statistiques sont mises à jour automatiquement toutes les heures</li>
                  <li>• Vous pouvez forcer une mise à jour manuelle à tout moment</li>
                  <li>• Assurez-vous que votre pseudo est correct et public sur le tracker</li>
                  <li>• Les données peuvent prendre quelques minutes à apparaître après une partie</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};