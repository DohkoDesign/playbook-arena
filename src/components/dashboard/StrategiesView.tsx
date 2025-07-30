import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, FileText, Download, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StrategyModal } from "./StrategyModal";
import { Badge } from "@/components/ui/badge";

interface StrategiesViewProps {
  teamId: string;
}

export const StrategiesView = ({ teamId }: StrategiesViewProps) => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
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

  const getStrategyTypeColor = (type: string) => {
    return type === "attaque" ? "border-l-red-500" : "border-l-blue-500";
  };

  const getStrategyTypeBadge = (type: string) => {
    return type === "attaque" 
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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
          <h2 className="text-2xl font-bold">Playbook & Stratégies</h2>
        </div>
        <Button onClick={() => {
          setSelectedStrategy(null);
          setShowStrategyModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle stratégie
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategies.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
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
          strategies.map((strategy) => (
            <Card key={strategy.id} className={`border-l-4 ${getStrategyTypeColor(strategy.type)} hover:shadow-md transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{strategy.nom}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStrategy(strategy)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportToPDF(strategy)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStrategy(strategy.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStrategyTypeBadge(strategy.type)}>
                    {strategy.type}
                  </Badge>
                  {strategy.map_name && (
                    <Badge variant="outline" className="text-xs">
                      {strategy.map_name}
                    </Badge>
                  )}
                </div>
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
          ))
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