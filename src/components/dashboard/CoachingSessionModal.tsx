import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, Video, Users, Trophy, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GameConfig } from "@/data/gameConfigs";

interface CoachingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  gameConfig?: GameConfig | null;
  onSessionUpdated: () => void;
}

const VALORANT_AGENTS = [
  "Brimstone", "Viper", "Omen", "Killjoy", "Cypher", "Sova", "Sage", "Phoenix",
  "Jett", "Reyna", "Raze", "Breach", "Skye", "Yoru", "Astra", "KAY/O",
  "Chamber", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove"
];

export const CoachingSessionModal = ({ 
  isOpen, 
  onClose, 
  event,
  gameConfig,
  onSessionUpdated 
}: CoachingSessionModalProps) => {
  const [session, setSession] = useState<any>(null);
  const [resultat, setResultat] = useState("");
  const [notes, setNotes] = useState("");
  const [vods, setVods] = useState<any>({});
  const [compositionEquipe, setCompositionEquipe] = useState<string[]>([]);
  const [compositionAdversaire, setCompositionAdversaire] = useState<string[]>([]);
  const [newVodPlayer, setNewVodPlayer] = useState("");
  const [newVodUrl, setNewVodUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      fetchCoachingSession();
    }
  }, [event]);

  const fetchCoachingSession = async () => {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*")
        .eq("event_id", event.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSession(data);
        setResultat(data.resultat || "");
        setNotes(data.notes || "");
        setVods(data.vods || {});
        setCompositionEquipe(Array.isArray(data.composition_equipe) ? data.composition_equipe as string[] : []);
        setCompositionAdversaire(Array.isArray(data.composition_adversaire) ? data.composition_adversaire as string[] : []);
      } else {
        // Nouvelle session
        setSession(null);
        setResultat("");
        setNotes("");
        setVods({});
        setCompositionEquipe([]);
        setCompositionAdversaire([]);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la session de coaching",
        variant: "destructive",
      });
    }
  };

  const addVod = () => {
    if (newVodPlayer && newVodUrl) {
      setVods({ ...vods, [newVodPlayer]: newVodUrl });
      setNewVodPlayer("");
      setNewVodUrl("");
    }
  };

  const removeVod = (player: string) => {
    const newVods = { ...vods };
    delete newVods[player];
    setVods(newVods);
  };

  const toggleCharacterInComposition = (character: string, isEquipe: boolean) => {
    const maxTeamSize = gameConfig?.id === 'rocket_league' ? 3 : 
                       gameConfig?.id === 'apex_legends' ? 3 : 5;
    
    if (isEquipe) {
      if (compositionEquipe.includes(character)) {
        setCompositionEquipe(compositionEquipe.filter(a => a !== character));
      } else if (compositionEquipe.length < maxTeamSize) {
        setCompositionEquipe([...compositionEquipe, character]);
      }
    } else {
      if (compositionAdversaire.includes(character)) {
        setCompositionAdversaire(compositionAdversaire.filter(a => a !== character));
      } else if (compositionAdversaire.length < maxTeamSize) {
        setCompositionAdversaire([...compositionAdversaire, character]);
      }
    }
  };

  // Déterminer les options de composition selon le jeu
  const getCompositionOptions = () => {
    if (!gameConfig) return VALORANT_AGENTS;
    
    switch (gameConfig.id) {
      case 'csgo':
        return gameConfig.roles; // Utiliser les rôles pour CS:GO
      case 'rocket_league':
        return gameConfig.characters; // Voitures pour Rocket League
      default:
        return gameConfig.characters; // Personnages/agents pour les autres jeux
    }
  };

  const getCompositionLabel = () => {
    if (!gameConfig) return 'Agents';
    
    switch (gameConfig.id) {
      case 'csgo':
        return 'Rôles';
      case 'rocket_league':
        return 'Voitures';
      case 'valorant':
        return 'Agents';
      case 'league_of_legends':
        return 'Champions';
      case 'overwatch':
        return 'Héros';
      default:
        return 'Personnages';
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const sessionData = {
        event_id: event.id,
        resultat: resultat || null,
        notes: notes || null,
        vods: Object.keys(vods).length > 0 ? vods : null,
        composition_equipe: compositionEquipe.length > 0 ? compositionEquipe : null,
        composition_adversaire: compositionAdversaire.length > 0 ? compositionAdversaire : null,
      };

      if (session) {
        // Mise à jour
        const { error } = await supabase
          .from("coaching_sessions")
          .update(sessionData)
          .eq("id", session.id);

        if (error) throw error;

        toast({
          title: "Session mise à jour",
          description: "L'analyse a été sauvegardée avec succès",
        });
      } else {
        // Création
        const { error } = await supabase
          .from("coaching_sessions")
          .insert(sessionData);

        if (error) throw error;

        toast({
          title: "Session créée",
          description: "L'analyse a été créée avec succès",
        });
      }

      onSessionUpdated();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Analyse - {event.titre}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{event.type}</Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(event.date_debut).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="compositions">Compositions</TabsTrigger>
            <TabsTrigger value="vods">VODs</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résultat du match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="resultat">Score et résultat</Label>
                  <Input
                    id="resultat"
                    placeholder="Ex: Victoire 13-7, Défaite 10-13"
                    value={resultat}
                    onChange={(e) => setResultat(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compositions" className="space-y-4 mt-4">
            {gameConfig?.id === 'rocket_league' ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    Les compositions ne sont pas pertinentes pour Rocket League
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Composition équipe */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Notre équipe</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {compositionEquipe.map((character, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="cursor-pointer"
                            onClick={() => toggleCharacterInComposition(character, true)}
                          >
                            {character}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-2">
                        {getCompositionLabel()} disponibles ({compositionEquipe.length}/{gameConfig?.id === 'rocket_league' || gameConfig?.id === 'apex_legends' ? 3 : 5}):
                      </div>
                      
                      <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                        {getCompositionOptions().filter(option => !compositionEquipe.includes(option)).map((option) => (
                          <Button
                            key={option}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={compositionEquipe.length >= (gameConfig?.id === 'rocket_league' || gameConfig?.id === 'apex_legends' ? 3 : 5)}
                            onClick={() => toggleCharacterInComposition(option, true)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Composition adversaire */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Trophy className="w-5 h-5" />
                      <span>Équipe adverse</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {compositionAdversaire.map((character, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => toggleCharacterInComposition(character, false)}
                          >
                            {character}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-2">
                        {getCompositionLabel()} disponibles ({compositionAdversaire.length}/{gameConfig?.id === 'rocket_league' || gameConfig?.id === 'apex_legends' ? 3 : 5}):
                      </div>
                      
                      <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                        {getCompositionOptions().filter(option => !compositionAdversaire.includes(option)).map((option) => (
                          <Button
                            key={option}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={compositionAdversaire.length >= (gameConfig?.id === 'rocket_league' || gameConfig?.id === 'apex_legends' ? 3 : 5)}
                            onClick={() => toggleCharacterInComposition(option, false)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="vods" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Video className="w-5 h-5" />
                  <span>VODs des joueurs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* VODs existantes */}
                {Object.keys(vods).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(vods).map(([player, url]) => (
                      <div key={player} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{player}</span>
                          <a 
                            href={url as string} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm ml-2"
                          >
                            Voir la VOD
                          </a>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeVod(player)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajouter nouvelle VOD */}
                <div className="space-y-2">
                  <Label>Ajouter une VOD</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nom du joueur"
                      value={newVodPlayer}
                      onChange={(e) => setNewVodPlayer(e.target.value)}
                    />
                    <Input
                      placeholder="URL de la VOD"
                      value={newVodUrl}
                      onChange={(e) => setNewVodUrl(e.target.value)}
                    />
                    <Button size="sm" onClick={addVod}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes d'analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observations et points d'amélioration</Label>
                  <Textarea
                    id="notes"
                    placeholder="Points positifs, erreurs, stratégies adverses, axes d'amélioration..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Sauvegarde..." : "Sauvegarder l'analyse"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};