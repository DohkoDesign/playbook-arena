import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Clock,
  Video,
  BarChart3,
  Lightbulb,
  MessageSquare,
  Eye,
  PlayCircle,
  CheckCircle,
  Calendar,
  Trophy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VODAnalysisToolsProps {
  teamId: string;
}

export const VODAnalysisTools = ({ teamId }: VODAnalysisToolsProps) => {
  const [currentTool, setCurrentTool] = useState("vod-review");
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [completedMatches, setCompletedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompletedMatches();
  }, [teamId]);

  const fetchCompletedMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*, events!inner(*)")
        .eq("events.team_id", teamId)
        .not("resultat", "is", null);

      if (error) throw error;

      const matches = data?.map(session => ({
        ...session.events,
        analysis_data: session
      })) || [];

      setCompletedMatches(matches);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderVODReview = () => (
    <div className="space-y-6">
      {/* Sélection du match */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Sélection du Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Chargement des matchs...</p>
            </div>
          ) : completedMatches.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun match terminé disponible</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complétez vos analyses post-match pour accéder aux outils VOD
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Choisir un match à analyser</Label>
              <Select value={selectedMatch?.id || ""} onValueChange={(value) => {
                const match = completedMatches.find(m => m.id === value);
                setSelectedMatch(match);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un match" />
                </SelectTrigger>
                <SelectContent>
                  {completedMatches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      <div className="flex items-center space-x-2">
                        <span>{match.titre}</span>
                        <Badge variant="outline" className="text-xs">
                          {new Date(match.date_debut).toLocaleDateString('fr-FR')}
                        </Badge>
                        <Badge variant={match.analysis_data.resultat?.toLowerCase().includes('victoire') ? 'default' : 'destructive'} className="text-xs">
                          {match.analysis_data.resultat}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedMatch && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{selectedMatch.titre}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Date: {new Date(selectedMatch.date_debut).toLocaleDateString('fr-FR')}</p>
                    <p>Résultat: {selectedMatch.analysis_data.resultat}</p>
                    {selectedMatch.analysis_data.vods && selectedMatch.analysis_data.vods.length > 0 && (
                      <p>VODs: {selectedMatch.analysis_data.vods.length} disponible(s)</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMatch && (
        <>
          {/* Analyse temporelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Analyse Temporelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Timestamp de début</Label>
                  <Input placeholder="ex: 05:30" />
                </div>
                <div>
                  <Label>Timestamp de fin</Label>
                  <Input placeholder="ex: 07:45" />
                </div>
              </div>
              <div>
                <Label>Phase de jeu analysée</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early">Début de partie</SelectItem>
                    <SelectItem value="mid">Milieu de partie</SelectItem>
                    <SelectItem value="late">Fin de partie</SelectItem>
                    <SelectItem value="teamfight">Team fight spécifique</SelectItem>
                    <SelectItem value="objective">Prise d'objectif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description de la séquence</Label>
                <Textarea placeholder="Décrivez ce qui se passe dans cette séquence..." />
              </div>
            </CardContent>
          </Card>

          {/* Analyse décisionnelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Analyse Décisionnelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Décision prise</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de décision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engage">Engagement</SelectItem>
                      <SelectItem value="disengage">Désengagement</SelectItem>
                      <SelectItem value="rotate">Rotation</SelectItem>
                      <SelectItem value="objective">Prise d'objectif</SelectItem>
                      <SelectItem value="defensive">Position défensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Qualité de la décision</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Évaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellente</SelectItem>
                      <SelectItem value="good">Bonne</SelectItem>
                      <SelectItem value="average">Moyenne</SelectItem>
                      <SelectItem value="poor">Mauvaise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Alternatives possibles</Label>
                <Textarea placeholder="Quelles autres options auraient pu être envisagées ?" />
              </div>
              <div>
                <Label>Impact sur le match</Label>
                <Textarea placeholder="Comment cette décision a-t-elle influencé la suite du match ?" />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderPatternAnalysis = () => (
    <div className="space-y-6">
      {selectedMatch ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Détection de Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de pattern</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positioning">Positionnement récurrent</SelectItem>
                      <SelectItem value="timing">Timing répétitif</SelectItem>
                      <SelectItem value="communication">Pattern de communication</SelectItem>
                      <SelectItem value="decision">Prise de décision</SelectItem>
                      <SelectItem value="mechanical">Erreurs mécaniques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fréquence observée</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="systematic">Systématique</SelectItem>
                      <SelectItem value="frequent">Fréquent</SelectItem>
                      <SelectItem value="occasional">Occasionnel</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description du pattern</Label>
                <Textarea placeholder="Décrivez le comportement répétitif observé..." />
              </div>
              <div>
                <Label>Impact sur les performances</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-positive">Très positif</SelectItem>
                    <SelectItem value="positive">Positif</SelectItem>
                    <SelectItem value="neutral">Neutre</SelectItem>
                    <SelectItem value="negative">Négatif</SelectItem>
                    <SelectItem value="very-negative">Très négatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Plan d'Amélioration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Objectif d'amélioration</Label>
                <Textarea placeholder="Que voulez-vous améliorer basé sur ce pattern ?" />
              </div>
              <div>
                <Label>Méthodes d'entraînement suggérées</Label>
                <Textarea placeholder="- Exercices spécifiques&#10;- Drills en équipe&#10;- Travail individuel..." />
              </div>
              <div>
                <Label>Métriques de suivi</Label>
                <Textarea placeholder="Comment mesurer les progrès ?" />
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Sélectionnez un match dans l'onglet "Revue VOD" pour analyser les patterns
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTeamSynergy = () => (
    <div className="space-y-6">
      {selectedMatch ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Analyse de Synergie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duo/Trio analysé</Label>
                  <Input placeholder="ex: Joueur A + Joueur B" />
                </div>
                <div>
                  <Label>Type d'interaction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combo">Combo/Synchronisation</SelectItem>
                      <SelectItem value="covering">Couverture mutuelle</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="positioning">Positionnement coordonné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Qualité de la synergie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Évaluation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perfect">Parfaite synchronisation</SelectItem>
                    <SelectItem value="good">Bonne coordination</SelectItem>
                    <SelectItem value="average">Coordination moyenne</SelectItem>
                    <SelectItem value="poor">Manque de coordination</SelectItem>
                    <SelectItem value="conflict">Conflictuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Moments clés observés</Label>
                <Textarea placeholder="Décrivez les moments où la synergie est particulièrement visible..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Communication d'Équipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Clarté des appels</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Évaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-clear">Très claire</SelectItem>
                      <SelectItem value="clear">Claire</SelectItem>
                      <SelectItem value="average">Moyenne</SelectItem>
                      <SelectItem value="unclear">Peu claire</SelectItem>
                      <SelectItem value="chaotic">Chaotique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Réactivité aux appels</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Évaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiate</SelectItem>
                      <SelectItem value="quick">Rapide</SelectItem>
                      <SelectItem value="delayed">Retardée</SelectItem>
                      <SelectItem value="poor">Mauvaise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Points d'amélioration communication</Label>
                <Textarea placeholder="- Appels plus précis&#10;- Meilleur timing des informations&#10;- Réduction du bruit..." />
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Sélectionnez un match dans l'onglet "Revue VOD" pour analyser la synergie d'équipe
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            Outils d'Analyse VOD
          </h2>
          <p className="text-muted-foreground">
            Outils avancés pour analyser vos matchs terminés et améliorer vos performances
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {completedMatches.length} match(s) disponible(s)
        </Badge>
      </div>

      {/* Navigation des outils */}
      <Tabs value={currentTool} onValueChange={setCurrentTool}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vod-review" className="flex items-center">
            <Video className="w-4 h-4 mr-2" />
            Revue VOD
          </TabsTrigger>
          <TabsTrigger value="pattern-analysis" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analyse Patterns
          </TabsTrigger>
          <TabsTrigger value="team-synergy" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Synergie Équipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vod-review">
          {renderVODReview()}
        </TabsContent>

        <TabsContent value="pattern-analysis">
          {renderPatternAnalysis()}
        </TabsContent>

        <TabsContent value="team-synergy">
          {renderTeamSynergy()}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      {selectedMatch && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Prévisualiser l'analyse
          </Button>
          <Button>
            <CheckCircle className="w-4 h-4 mr-2" />
            Sauvegarder l'analyse
          </Button>
        </div>
      )}
    </div>
  );
};