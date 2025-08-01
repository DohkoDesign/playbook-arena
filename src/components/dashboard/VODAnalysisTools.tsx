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
  MapPin,
  BarChart3,
  Zap,
  Shield,
  Crosshair,
  Eye,
  PlayCircle,
  AlertTriangle,
  CheckCircle,
  Timer,
  Activity
} from "lucide-react";
import { getGameConfig } from "@/data/gameConfigs";

interface VODAnalysisToolsProps {
  teamId: string;
  gameType: string;
}

export const VODAnalysisTools = ({ teamId, gameType }: VODAnalysisToolsProps) => {
  const [currentTool, setCurrentTool] = useState("performance");
  const [analysisData, setAnalysisData] = useState<any>({});
  
  const gameConfig = getGameConfig(gameType);

  const renderApexLegendsTools = () => (
    <div className="space-y-6">
      {/* Analyse de rotation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Analyse des Rotations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Zone initiale</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fragment">Fragment Est</SelectItem>
                  <SelectItem value="capitol">Capitol City</SelectItem>
                  <SelectItem value="skyhook">Skyhook</SelectItem>
                  <SelectItem value="sorting">Sorting Factory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timing de rotation</Label>
              <Input placeholder="ex: Round 2, 30s avant fermeture" />
            </div>
          </div>
          <div>
            <Label>Points clés observés</Label>
            <Textarea placeholder="- Position haute prise correctement&#10;- Rotation trop tardive vers zone 3&#10;- Manque de communication sur les ennemis spotted" />
          </div>
        </CardContent>
      </Card>

      {/* Analyse des engagements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crosshair className="w-5 h-5 mr-2" />
            Engagements & Team Fights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Initiateur</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Qui engage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bloodhound">Bloodhound</SelectItem>
                  <SelectItem value="wraith">Wraith</SelectItem>
                  <SelectItem value="octane">Octane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Distance d'engagement</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="courte">Courte (&lt;50m)</SelectItem>
                  <SelectItem value="moyenne">Moyenne (50-100m)</SelectItem>
                  <SelectItem value="longue">Longue (&gt;100m)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Résultat</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Victoire</SelectItem>
                  <SelectItem value="loss">Défaite</SelectItem>
                  <SelectItem value="disengage">Désengagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderValorantTools = () => (
    <div className="space-y-6">
      {/* Analyse économique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Gestion Économique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Round analysé</Label>
              <Input placeholder="ex: R3" />
            </div>
            <div>
              <Label>Crédits début</Label>
              <Input placeholder="ex: 2400" />
            </div>
            <div>
              <Label>Achat effectué</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-buy">Full Buy</SelectItem>
                  <SelectItem value="eco">Éco</SelectItem>
                  <SelectItem value="force">Force Buy</SelectItem>
                  <SelectItem value="save">Save</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Résultat round</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Victoire</SelectItem>
                  <SelectItem value="loss">Défaite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Décision économique</Label>
            <Textarea placeholder="Analyse de la décision d'achat et son impact sur les rounds suivants..." />
          </div>
        </CardContent>
      </Card>

      {/* Analyse des executes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Exécutes & Stratégies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Site visé</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Site A</SelectItem>
                  <SelectItem value="b">Site B</SelectItem>
                  <SelectItem value="mid">Mid control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type d'execute</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="split">Split</SelectItem>
                  <SelectItem value="rush">Rush</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="fake">Fake + Rotate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timing utilities</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Synchro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Bien synchronisé</SelectItem>
                  <SelectItem value="average">Moyen</SelectItem>
                  <SelectItem value="poor">Mal synchronisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCSGOTools = () => (
    <div className="space-y-6">
      {/* Analyse anti-éco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Rounds Anti-Éco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Type de round</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anti-eco">Anti-Éco</SelectItem>
                  <SelectItem value="anti-force">Anti-Force</SelectItem>
                  <SelectItem value="gun-round">Gun Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Position défensive</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Setup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stack">Stack sites</SelectItem>
                  <SelectItem value="spread">Spread out</SelectItem>
                  <SelectItem value="close">Close angles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Résultat</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean">Clean (0-1 mort)</SelectItem>
                  <SelectItem value="messy">Difficile (2-3 morts)</SelectItem>
                  <SelectItem value="upset">Upset (défaite)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Analyse de Performance Individuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Joueur analysé</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un joueur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player1">Joueur 1</SelectItem>
                  <SelectItem value="player2">Joueur 2</SelectItem>
                  <SelectItem value="player3">Joueur 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Période analysée</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Moment du match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early">Early game</SelectItem>
                  <SelectItem value="mid">Mid game</SelectItem>
                  <SelectItem value="late">Late game</SelectItem>
                  <SelectItem value="clutch">Situations clutch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Points positifs observés</Label>
              <Textarea placeholder="- Bon positioning&#10;- Aim précis dans les duels&#10;- Communication claire..." />
            </div>
            <div>
              <Label>Points d'amélioration</Label>
              <Textarea placeholder="- Trop agressif en défense&#10;- Manque d'utility usage&#10;- Timing perfectible..." />
            </div>
            <div>
              <Label>Recommandations d'entraînement</Label>
              <Textarea placeholder="- Travailler le jeu défensif&#10;- S'entraîner sur aim_botz 15min/jour&#10;- Revoir les utilities lineups..." />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGameSpecificTools = () => {
    switch (gameType) {
      case 'apex_legends':
        return renderApexLegendsTools();
      case 'valorant':
        return renderValorantTools();
      case 'cs_go':
      case 'cs2':
        return renderCSGOTools();
      default:
        return (
          <Card>
            <CardContent className="pt-6 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Outils d'analyse spécifiques à {gameConfig?.name || 'ce jeu'} en cours de développement
              </p>
            </CardContent>
          </Card>
        );
    }
  };

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
            Outils spécialisés pour analyser vos VODs en {gameConfig?.name}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {gameConfig?.name}
        </Badge>
      </div>

      {/* Navigation des outils */}
      <Tabs value={currentTool} onValueChange={setCurrentTool}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Équipe
          </TabsTrigger>
          <TabsTrigger value="game-specific" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Spécifique {gameConfig?.name}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          {renderPerformanceAnalysis()}
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Analyse d'Équipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cohésion d'équipe</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Évaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellente</SelectItem>
                      <SelectItem value="good">Bonne</SelectItem>
                      <SelectItem value="average">Moyenne</SelectItem>
                      <SelectItem value="poor">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Communication</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Claire et précise</SelectItem>
                      <SelectItem value="good">Bonne</SelectItem>
                      <SelectItem value="chaotic">Chaotique</SelectItem>
                      <SelectItem value="silent">Trop silencieuse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Moments clés d'équipe</Label>
                <Textarea placeholder="- Excellente coordination sur l'engage 15:30&#10;- Manque de suivi sur l'appel IGL 8:45&#10;- Bonne recover après la perte du rond économique..." />
              </div>
              
              <div>
                <Label>Plan d'amélioration équipe</Label>
                <Textarea placeholder="- Travailler les calls d'information&#10;- Améliorer les executes coordonnées&#10;- Définir des rôles plus clairs en mid-round..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="game-specific">
          {renderGameSpecificTools()}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Prévisualiser le rapport
        </Button>
        <Button>
          <CheckCircle className="w-4 h-4 mr-2" />
          Sauvegarder l'analyse
        </Button>
      </div>
    </div>
  );
};