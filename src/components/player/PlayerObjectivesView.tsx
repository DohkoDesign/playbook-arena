import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, CheckCircle, Clock, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerObjectivesViewProps {
  teamId: string;
  playerId: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  status: 'en_cours' | 'termine' | 'suspendu';
  deadline: string;
  created_at: string;
}

export const PlayerObjectivesView = ({ teamId, playerId }: PlayerObjectivesViewProps) => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    target_value: 0,
    deadline: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchObjectives();
  }, [teamId, playerId]);

  const fetchObjectives = async () => {
    try {
      // Récupérer les objectifs depuis la fiche joueur créée par le staff
      const { data: playerProfile, error } = await supabase
        .from("player_profiles")
        .select("objectifs_individuels")
        .eq("team_id", teamId)
        .eq("user_id", playerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Convertir les objectifs texte en format Objective avec des valeurs par défaut
      const objectifsTexte = playerProfile?.objectifs_individuels || [];
      const objectifsFormates: Objective[] = objectifsTexte.map((objectif: string, index: number) => ({
        id: `staff-${index}`,
        title: objectif,
        description: `Objectif défini par le staff: ${objectif}`,
        target_value: 100,
        current_value: 0,
        status: 'en_cours' as const,
        deadline: '',
        created_at: new Date().toISOString()
      }));
      
      setObjectives(objectifsFormates);
    } catch (error: any) {
      console.error("Erreur lors du chargement des objectifs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les objectifs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addObjective = async () => {
    if (!newObjective.title || !newObjective.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const objective: Objective = {
      id: Date.now().toString(),
      title: newObjective.title,
      description: newObjective.description,
      target_value: newObjective.target_value,
      current_value: 0,
      status: 'en_cours',
      deadline: newObjective.deadline,
      created_at: new Date().toISOString()
    };

    setObjectives(prev => [objective, ...prev]);
    setNewObjective({ title: '', description: '', target_value: 0, deadline: '' });
    setShowAddForm(false);

    toast({
      title: "Objectif ajouté",
      description: "Votre nouvel objectif a été créé avec succès",
    });
  };

  const updateProgress = (id: string, newValue: number) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === id 
        ? { ...obj, current_value: Math.min(newValue, obj.target_value) }
        : obj
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'termine': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'suspendu': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-500/10 text-blue-700 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'termine': return 'Terminé';
      case 'suspendu': return 'Suspendu';
      default: return 'En cours';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mes Objectifs</h1>
        </div>
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes Objectifs</h1>
          <p className="text-muted-foreground">Objectifs définis par le staff - Suivez votre progression</p>
          <p className="text-sm text-orange-600 mt-1">
            💡 Les objectifs sont définis par votre staff. Vous ne pouvez pas en créer vous-même.
          </p>
        </div>
      </div>

      {/* Liste des objectifs */}
      <div className="grid gap-4">
        {objectives.map((objective) => {
          const progress = (objective.current_value / objective.target_value) * 100;
          const isCompleted = objective.current_value >= objective.target_value;
          
          return (
            <Card key={objective.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      ) : (
                        <Target className="w-5 h-5 mr-2 text-blue-500" />
                      )}
                      {objective.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {objective.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(objective.status)}>
                      {getStatusLabel(objective.status)}
                    </Badge>
                    {objective.deadline && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(objective.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progression</span>
                    <span>{objective.current_value} / {objective.target_value}</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress)}% complété
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {objectives.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucun objectif défini</h3>
            <p className="text-muted-foreground mb-4">
              Votre staff n'a pas encore défini d'objectifs pour vous. 
              Ils pourront le faire depuis votre fiche joueur.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};