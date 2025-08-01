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
import { IntelligentEventCreator } from "./IntelligentEventCreator";

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
      
      // Récupérer uniquement les analyses validées avec leurs événements
      const { data: analysesData, error: analysesError } = await supabase
        .from("coaching_sessions")
        .select("*, events!inner(*)")
        .eq("events.team_id", teamId)
        .not("resultat", "is", null); // Seulement les analyses avec résultats

      if (analysesError) throw analysesError;

      // Transformer pour l'affichage avec statut
      const eventsWithAnalysis = analysesData?.map(analysis => ({
        ...analysis.events,
        analysis_status: 'completed',
        analysis_id: analysis.id,
        analysis_data: analysis
      })) || [];

      setEvents(eventsWithAnalysis);
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

      {/* Section intelligente pour créer des événements */}
      <IntelligentEventCreator 
        teamId={teamId} 
        gameType={gameType} 
        onEventCreated={fetchData} 
      />

      {/* Liste des matchs avec design amélioré */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Aucun match analysé</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Les matchs terminés et analysés apparaîtront ici. Créez vos premières analyses depuis la section événements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => {
              const analysis = getAnalysisForEvent(event.id);
              const hasAnalysis = !!analysis;
              
              return (
                <Card key={event.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* En-tête du match */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{event.titre}</h3>
                              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(event.date_debut).toLocaleDateString('fr-FR', { 
                                    weekday: 'short', 
                                    day: 'numeric', 
                                    month: 'short' 
                                  })}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                                {event.map_name && (
                                  <Badge variant="secondary" className="text-xs">
                                    {event.map_name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Résultat */}
                          {analysis && analysis.resultat && (
                            <div className="text-right">
                              <Badge 
                                variant={getResultBadgeVariant(analysis.resultat)}
                                className="text-sm font-medium px-3 py-1"
                              >
                                {analysis.resultat}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Informations supplémentaires */}
                        {analysis && (
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                            {analysis.vods && analysis.vods.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Video className="w-4 h-4" />
                                <span>{analysis.vods.length} VOD{analysis.vods.length > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {analysis.notes && (
                              <div className="flex items-center space-x-1">
                                <Edit className="w-4 h-4" />
                                <span>Notes disponibles</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="w-4 h-4" />
                              <span>Analyse complète</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="ml-6 flex flex-col space-y-2">
                        {hasAnalysis ? (
                          <>
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => openAnalysisModal(event, analysis)}
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Consulter
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openAnalysisModal(event, analysis)}
                              className="w-full"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={() => openAnalysisModal(event)}
                            size="sm"
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Analyser
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal d'analyse redesigné */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    {currentAnalysis ? "Modifier l'analyse" : "Nouvelle analyse"}
                  </DialogTitle>
                  {selectedEvent && (
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.titre} • {new Date(selectedEvent.date_debut).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Post-Match
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="result" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg mx-6 mt-4">
                <TabsTrigger value="result" className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Résultat</span>
                </TabsTrigger>
                <TabsTrigger value="vods" className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>VODs</span>
                </TabsTrigger>
                <TabsTrigger value="compositions" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Compositions</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Notes</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 p-6 space-y-6">
                <TabsContent value="result" className="space-y-6">
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Résultat du match</Label>
                          <Select value={formData.result} onValueChange={(value) => setFormData(prev => ({ ...prev, result: value }))}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Sélectionner le résultat" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Victoire" className="text-green-600">
                                🏆 Victoire
                              </SelectItem>
                              <SelectItem value="Défaite" className="text-red-600">
                                ❌ Défaite
                              </SelectItem>
                              <SelectItem value="Nul" className="text-blue-600">
                                🤝 Nul
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Score final (optionnel)</Label>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <Input 
                                placeholder="Notre équipe"
                                value={formData.score_team}
                                onChange={(e) => setFormData(prev => ({ ...prev, score_team: e.target.value }))}
                                className="h-12 text-center text-lg font-semibold"
                              />
                            </div>
                            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                              <span className="text-sm font-medium">VS</span>
                            </div>
                            <div className="flex-1">
                              <Input 
                                placeholder="Adversaire"
                                value={formData.score_opponent}
                                onChange={(e) => setFormData(prev => ({ ...prev, score_opponent: e.target.value }))}
                                className="h-12 text-center text-lg font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vods" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">VODs et Replays</Label>
                      <Button variant="outline" size="sm" onClick={addVodField} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Ajouter un lien
                      </Button>
                    </div>
                    
                    <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="font-medium text-sm">Formats supportés</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>YouTube (vidéos/playlists)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>Twitch (VODs/clips)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Fichiers directs (.mp4, .mov)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Autres plateformes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-3">
                      {formData.vods.map((vod, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                            <Video className="w-4 h-4" />
                          </div>
                          <Input
                            placeholder="https://youtube.com/watch?v=... ou https://youtube.com/playlist?list=..."
                            value={vod}
                            onChange={(e) => updateVod(index, e.target.value)}
                            className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                          />
                          {formData.vods.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeVod(index)}
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
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
              </div>
            </Tabs>
          </div>

          <div className="border-t p-6 bg-muted/20">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {currentAnalysis ? "Dernière modification il y a quelques instants" : "Nouvelle analyse de match"}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowAnalysisModal(false)} className="px-6">
                  Annuler
                </Button>
                <Button onClick={saveAnalysis} className="px-6 gap-2 bg-gradient-to-r from-primary to-primary/80">
                  <Save className="w-4 h-4" />
                  {currentAnalysis ? "Mettre à jour" : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};