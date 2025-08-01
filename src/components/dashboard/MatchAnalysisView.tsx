import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Video, 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  Edit,
  Upload,
  Link,
  Trophy,
  Users,
  BarChart3,
  Target,
  Calendar,
  PlayCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

interface MatchAnalysisViewProps {
  teamId: string;
  gameType?: string;
}

interface MatchData {
  id?: string;
  event_id: string;
  event_title: string;
  event_date: string;
  result?: string;
  score_team?: string;
  score_opponent?: string;
  vods?: any[];
  composition_team?: any;
  composition_opponent?: any;
  notes?: string;
  analysis_status: 'pending' | 'in_progress' | 'completed';
}

export const MatchAnalysisView = ({ teamId, gameType }: MatchAnalysisViewProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<MatchData | null>(null);
  const { toast } = useToast();

  const gameConfig = gameType ? getGameConfig(gameType) : null;

  // État du formulaire d'analyse
  const [formData, setFormData] = useState({
    result: '',
    score_team: '',
    score_opponent: '',
    vods: [''],
    composition_team: {},
    composition_opponent: {},
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les événements passés
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .in("type", ["match", "scrim", "tournoi"])
        .lt("date_fin", new Date().toISOString())
        .order("date_debut", { ascending: false });

      if (eventsError) throw eventsError;

      // Récupérer les analyses existantes
      const { data: analysesData, error: analysesError } = await supabase
        .from("coaching_sessions")
        .select("*, events!inner(*)")
        .eq("events.team_id", teamId);

      if (analysesError) throw analysesError;

      setEvents(eventsData || []);
      setAnalyses(analysesData || []);
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAnalysisModal = (event: any, existingAnalysis?: any) => {
    setSelectedEvent(event);
    
    if (existingAnalysis) {
      setCurrentAnalysis(existingAnalysis);
      setFormData({
        result: existingAnalysis.resultat || '',
        score_team: '',
        score_opponent: '',
        vods: existingAnalysis.vods || [''],
        composition_team: existingAnalysis.composition_equipe || {},
        composition_opponent: existingAnalysis.composition_adversaire || {},
        notes: existingAnalysis.notes || ''
      });
    } else {
      setCurrentAnalysis(null);
      setFormData({
        result: '',
        score_team: '',
        score_opponent: '',
        vods: [''],
        composition_team: {},
        composition_opponent: {},
        notes: ''
      });
    }
    
    setShowAnalysisModal(true);
  };

  const addVodField = () => {
    setFormData(prev => ({
      ...prev,
      vods: [...prev.vods, '']
    }));
  };

  const updateVod = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      vods: prev.vods.map((vod, i) => i === index ? value : vod)
    }));
  };

  const removeVod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vods: prev.vods.filter((_, i) => i !== index)
    }));
  };

  const saveAnalysis = async () => {
    if (!selectedEvent) return;

    try {
      const analysisData = {
        event_id: selectedEvent.id,
        resultat: formData.result,
        vods: formData.vods.filter(vod => vod.trim() !== ''),
        composition_equipe: formData.composition_team,
        composition_adversaire: formData.composition_opponent,
        notes: formData.notes
      };

      if (currentAnalysis) {
        // Mise à jour
        const { error } = await supabase
          .from("coaching_sessions")
          .update(analysisData)
          .eq("id", currentAnalysis.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from("coaching_sessions")
          .insert(analysisData);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Analyse sauvegardée avec succès",
      });

      setShowAnalysisModal(false);
      fetchData();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'analyse",
        variant: "destructive",
      });
    }
  };

  const getAnalysisForEvent = (eventId: string) => {
    return analyses.find(analysis => analysis.event_id === eventId);
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result?.toLowerCase()) {
      case 'victoire':
      case 'win':
        return 'default';
      case 'défaite':
      case 'loss':
        return 'destructive';
      case 'nul':
      case 'draw':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Video className="w-8 h-8 mx-auto animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">Chargement des matchs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Analyse des Matchs
          </h2>
          <p className="text-muted-foreground">
            Analysez vos performances post-match avec VODs et compositions
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {analyses.length} analyses créées
        </Badge>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground">Matchs joués</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analyses.filter(a => a.resultat?.toLowerCase().includes('victoire')).length}</p>
              <p className="text-sm text-muted-foreground">Victoires</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{analyses.filter(a => a.resultat?.toLowerCase().includes('défaite')).length}</p>
              <p className="text-sm text-muted-foreground">Défaites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analyses.length}</p>
              <p className="text-sm text-muted-foreground">Analyses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des matchs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Matchs récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Aucun match trouvé</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Les matchs terminés apparaîtront ici pour analyse
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const analysis = getAnalysisForEvent(event.id);
                const hasAnalysis = !!analysis;
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold">{event.titre}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date_debut).toLocaleDateString('fr-FR')}</span>
                            <Badge variant="outline">{event.type}</Badge>
                            {event.map_name && (
                              <Badge variant="secondary">{event.map_name}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {analysis && analysis.resultat && (
                        <div className="mt-2">
                          <Badge variant={getResultBadgeVariant(analysis.resultat)}>
                            {analysis.resultat}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {hasAnalysis ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openAnalysisModal(event, analysis)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir l'analyse
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openAnalysisModal(event, analysis)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => openAnalysisModal(event)}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Créer l'analyse
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'analyse */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              {currentAnalysis ? "Modifier l'analyse" : "Créer une analyse"}
              {selectedEvent && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  - {selectedEvent.titre}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Tabs defaultValue="result" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="result">Résultat</TabsTrigger>
                <TabsTrigger value="vods">VODs</TabsTrigger>
                <TabsTrigger value="compositions">Compositions</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="result" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Résultat du match</Label>
                    <Select value={formData.result} onValueChange={(value) => setFormData(prev => ({ ...prev, result: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le résultat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Victoire">Victoire</SelectItem>
                        <SelectItem value="Défaite">Défaite</SelectItem>
                        <SelectItem value="Nul">Nul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Score (optionnel)</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        placeholder="Notre score"
                        value={formData.score_team}
                        onChange={(e) => setFormData(prev => ({ ...prev, score_team: e.target.value }))}
                      />
                      <span>-</span>
                      <Input 
                        placeholder="Score adverse"
                        value={formData.score_opponent}
                        onChange={(e) => setFormData(prev => ({ ...prev, score_opponent: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vods" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>VODs et Replays</Label>
                    <Button variant="outline" size="sm" onClick={addVodField}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un lien
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="flex items-center mb-2">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      <strong>Formats supportés :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-6">
                      <li>Lien YouTube (vidéo unique ou playlist)</li>
                      <li>Lien Twitch (VOD ou clip)</li>
                      <li>Fichier vidéo direct (.mp4, .mov, etc.)</li>
                      <li>Autres plateformes de streaming</li>
                    </ul>
                  </div>
                  {formData.vods.map((vod, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="https://youtube.com/watch?v=... ou https://youtube.com/playlist?list=..."
                        value={vod}
                        onChange={(e) => updateVod(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.vods.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeVod(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="compositions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Composition de l'équipe</Label>
                    <Textarea
                      placeholder="Agents/Personnages/Rôles utilisés par votre équipe..."
                      value={JSON.stringify(formData.composition_team, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData(prev => ({ ...prev, composition_team: parsed }));
                        } catch {
                          // Ignorer les erreurs de parsing pendant la saisie
                        }
                      }}
                      className="min-h-[150px] font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Composition adverse</Label>
                    <Textarea
                      placeholder="Agents/Personnages/Rôles utilisés par l'équipe adverse..."
                      value={JSON.stringify(formData.composition_opponent, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData(prev => ({ ...prev, composition_opponent: parsed }));
                        } catch {
                          // Ignorer les erreurs de parsing pendant la saisie
                        }
                      }}
                      className="min-h-[150px] font-mono text-sm"
                    />
                  </div>
                </div>
                {gameConfig && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium mb-2">Suggestions pour {gameConfig.name} :</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {gameConfig.roles?.map((role, index) => (
                        <div key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {role}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div>
                  <Label>Notes d'analyse</Label>
                  <Textarea
                    placeholder="Points forts, points faibles, stratégies observées, améliorations possibles..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="min-h-[200px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAnalysisModal(false)}>
                Annuler
              </Button>
              <Button onClick={saveAnalysis}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder l'analyse
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};