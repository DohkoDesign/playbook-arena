import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Map, Users, Lock, Folder, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PlayerStrategiesViewProps {
  teamId: string;
  gameType: string;
}

interface Strategy {
  id: string;
  nom: string;
  type: string;
  map_name?: string;
  contenu?: any;
  created_at: string;
}

export const PlayerStrategiesView = ({ teamId, gameType }: PlayerStrategiesViewProps) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchStrategies();
    }
  }, [teamId]);

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStrategies(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les stratégies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Grouper les stratégies par map
  const groupStrategiesByMap = () => {
    const grouped: Record<string, Strategy[]> = {};
    const noMapStrategies: Strategy[] = [];

    strategies.forEach(strategy => {
      if (strategy.map_name) {
        if (!grouped[strategy.map_name]) {
          grouped[strategy.map_name] = [];
        }
        grouped[strategy.map_name].push(strategy);
      } else {
        noMapStrategies.push(strategy);
      }
    });

    return { grouped, noMapStrategies };
  };

  const { grouped, noMapStrategies } = groupStrategiesByMap();

  const toggleMapExpansion = (mapName: string) => {
    const newExpanded = new Set(expandedMaps);
    if (newExpanded.has(mapName)) {
      newExpanded.delete(mapName);
    } else {
      newExpanded.add(mapName);
    }
    setExpandedMaps(newExpanded);
  };

  const getStrategyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'attaque':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'défense':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des stratégies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Playbook d'Équipe</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Lecture seule</span>
        </div>
      </div>

      {strategies.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune stratégie disponible</h3>
            <p className="text-muted-foreground">
              Le staff n'a pas encore créé de stratégies pour l'équipe. Elles apparaîtront ici une fois ajoutées.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Stratégies groupées par map */}
          {Object.entries(grouped).map(([mapName, mapStrategies]) => (
            <Card key={mapName} className="overflow-hidden">
              <Collapsible 
                open={expandedMaps.has(mapName)} 
                onOpenChange={() => toggleMapExpansion(mapName)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {expandedMaps.has(mapName) ? (
                          <FolderOpen className="w-5 h-5 text-primary" />
                        ) : (
                          <Folder className="w-5 h-5 text-muted-foreground" />
                        )}
                        <Map className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-lg">{mapName}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {mapStrategies.length} stratégie{mapStrategies.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid gap-3 md:grid-cols-2">
                      {mapStrategies.map((strategy) => (
                        <Card key={strategy.id} className="border-l-4 border-l-primary/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{strategy.nom}</CardTitle>
                              <Badge className={getStrategyTypeColor(strategy.type)}>
                                {strategy.type}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                Créé le {new Date(strategy.created_at).toLocaleDateString("fr-FR")}
                              </div>
                              
                              {strategy.contenu && (
                                <div className="text-sm">
                                  <p className="text-muted-foreground mb-2">Contenu disponible :</p>
                                  {typeof strategy.contenu === 'object' && (
                                    <div className="space-y-1">
                                      {Object.keys(strategy.contenu).map((key) => (
                                        <Badge key={key} variant="outline" className="text-xs mr-1">
                                          {key}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}

          {/* Stratégies sans map */}
          {noMapStrategies.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Stratégies Générales</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {noMapStrategies.length} stratégie{noMapStrategies.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {noMapStrategies.map((strategy) => (
                    <Card key={strategy.id} className="border-l-4 border-l-primary/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{strategy.nom}</CardTitle>
                          <Badge className={getStrategyTypeColor(strategy.type)}>
                            {strategy.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Créé le {new Date(strategy.created_at).toLocaleDateString("fr-FR")}
                          </div>
                          
                          {strategy.contenu && (
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-2">Contenu disponible :</p>
                              {typeof strategy.contenu === 'object' && (
                                <div className="space-y-1">
                                  {Object.keys(strategy.contenu).map((key) => (
                                    <Badge key={key} variant="outline" className="text-xs mr-1">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};