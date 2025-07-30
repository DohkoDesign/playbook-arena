import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StrategiesViewProps {
  teamId: string;
}

export const StrategiesView = ({ teamId }: StrategiesViewProps) => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const getStrategyTypeColor = (type: string) => {
    return type === "attaque" ? "border-l-red-500" : "border-l-blue-500";
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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle stratégie
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {strategies.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Aucune stratégie créée. Commencez à construire votre playbook !
              </p>
            </CardContent>
          </Card>
        ) : (
          strategies.map((strategy) => (
            <Card key={strategy.id} className={`border-l-4 ${getStrategyTypeColor(strategy.type)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{strategy.nom}</CardTitle>
                  <span className={`text-sm px-2 py-1 rounded ${
                    strategy.type === "attaque" 
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}>
                    {strategy.type}
                  </span>
                </div>
                {strategy.map_name && (
                  <p className="text-sm text-muted-foreground">
                    Map: {strategy.map_name}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Stratégie détaillée</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};