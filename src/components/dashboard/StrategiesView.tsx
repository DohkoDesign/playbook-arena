import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, FileText, Download, Edit, Trash2, Folder, FolderOpen, ChevronRight, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StrategyModal } from "./StrategyModal";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getGameConfig } from "@/data/gameConfigs";

interface StrategiesViewProps {
  teamId: string;
  gameType?: string;
}

export const StrategiesView = ({ teamId, gameType }: StrategiesViewProps) => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const gameConfig = gameType ? getGameConfig(gameType) : null;

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

  const handleEditStrategy = (strategy: any) => {
    setSelectedStrategy(strategy);
    setShowStrategyModal(true);
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette stratégie ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("strategies")
        .delete()
        .eq("id", strategyId);

      if (error) throw error;

      toast({
        title: "Stratégie supprimée",
        description: "La stratégie a été supprimée avec succès",
      });

      fetchStrategies();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToPDF = (strategy: any) => {
    // Simulation d'export PDF - dans un vrai projet, on utiliserait une librairie comme jsPDF
    toast({
      title: "Export PDF",
      description: `Exportation de "${strategy.nom}" en cours...`,
    });
  };

  // Grouper les stratégies par map
  const groupStrategiesByMap = () => {
    const grouped: Record<string, any[]> = {};
    const noMapStrategies: any[] = [];

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
        return "border-l-red-500";
      case 'défense':
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getStrategyTypeBadge = (type: string) => {
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
          <BookOpen className="w-5 h-5" />
          <h2 className="text-2xl font-bold">
            Playbook & Stratégies {gameConfig && `- ${gameConfig.name}`}
          </h2>
        </div>
        <Button onClick={() => {
          setSelectedStrategy(null);
          setShowStrategyModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle stratégie
        </Button>
      </div>

      <div className="space-y-4">
        {strategies.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">
                    Aucune stratégie créée. Commencez à construire votre playbook !
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Créez des stratégies d'attaque et de défense, annotez les maps, ajoutez des schémas...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
                        <div className="flex items-center space-x-2">
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
                        <ChevronRight 
                          className={`w-4 h-4 transition-transform ${
                            expandedMaps.has(mapName) ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {mapStrategies.map((strategy) => (
                          <Card key={strategy.id} className={`border-l-4 ${getStrategyTypeColor(strategy.type)} hover:shadow-md transition-shadow`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base truncate">{strategy.nom}</CardTitle>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditStrategy(strategy)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => exportToPDF(strategy)}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteStrategy(strategy.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <Badge className={getStrategyTypeBadge(strategy.type)}>
                                {strategy.type}
                              </Badge>
                            </CardHeader>
                            
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <FileText className="w-4 h-4" />
                                  <span>
                                    {strategy.contenu && Object.keys(strategy.contenu).length > 0 
                                      ? "Contenu disponible" 
                                      : "Aucun contenu"
                                    }
                                  </span>
                                </div>
                                
                                <p className="text-xs text-muted-foreground">
                                  Créé le {new Date(strategy.created_at).toLocaleDateString("fr-FR")}
                                </p>
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
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Stratégies générales</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {noMapStrategies.length} stratégie{noMapStrategies.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {noMapStrategies.map((strategy) => (
                      <Card key={strategy.id} className={`border-l-4 ${getStrategyTypeColor(strategy.type)} hover:shadow-md transition-shadow`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base truncate">{strategy.nom}</CardTitle>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditStrategy(strategy)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => exportToPDF(strategy)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteStrategy(strategy.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <Badge className={getStrategyTypeBadge(strategy.type)}>
                            {strategy.type}
                          </Badge>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              <span>
                                {strategy.contenu && Object.keys(strategy.contenu).length > 0 
                                  ? "Contenu disponible" 
                                  : "Aucun contenu"
                                }
                              </span>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              Créé le {new Date(strategy.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {showStrategyModal && (
        <StrategyModal
          isOpen={showStrategyModal}
          onClose={() => {
            setShowStrategyModal(false);
            setSelectedStrategy(null);
          }}
          teamId={teamId}
          gameConfig={gameConfig}
          strategy={selectedStrategy}
          onStrategyUpdated={() => {
            fetchStrategies();
            setShowStrategyModal(false);
            setSelectedStrategy(null);
          }}
        />
      )}
    </div>
  );
};