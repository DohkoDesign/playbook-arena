import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Image, FileText, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GameConfig } from "@/data/gameConfigs";

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  gameConfig?: GameConfig | null;
  strategy?: any;
  onStrategyUpdated: () => void;
}

const VALORANT_MAPS = [
  "Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Fracture", 
  "Pearl", "Lotus", "Sunset", "Abyss"
];

const STRATEGY_TYPES = [
  { value: "attaque", label: "Attaque" },
  { value: "defense", label: "Défense" },
];

export const StrategyModal = ({ 
  isOpen, 
  onClose, 
  teamId,
  gameConfig,
  strategy, 
  onStrategyUpdated 
}: StrategyModalProps) => {
  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [mapName, setMapName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (strategy) {
      setNom(strategy.nom || "");
      setType(strategy.type || "");
      setMapName(strategy.map_name || "");
      
      // Charger le contenu depuis JSONB
      if (strategy.contenu) {
        setDescription(strategy.contenu.description || "");
        setNotes(strategy.contenu.notes || "");
        setImageUrl(strategy.contenu.imageUrl || "");
      }
    } else {
      // Reset pour nouvelle stratégie
      setNom("");
      setType("");
      setMapName("");
      setDescription("");
      setNotes("");
      setImageUrl("");
    }
  }, [strategy]);

  const handleSave = async () => {
    if (!nom || !type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom et le type de stratégie",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const contenu = {
        description,
        notes,
        imageUrl,
        annotations: [], // Pour futures annotations sur map
        diagrams: [], // Pour futurs schémas
      };

      if (strategy) {
        // Mise à jour
        const { error } = await supabase
          .from("strategies")
          .update({
            nom,
            type,
            map_name: mapName || null,
            contenu,
          })
          .eq("id", strategy.id);

        if (error) throw error;

        toast({
          title: "Stratégie mise à jour",
          description: `La stratégie "${nom}" a été mise à jour`,
        });
      } else {
        // Création
        const { error } = await supabase
          .from("strategies")
          .insert({
            team_id: teamId,
            nom,
            type,
            map_name: mapName || null,
            contenu,
            created_by: user.id,
          });

        if (error) throw error;

        toast({
          title: "Stratégie créée",
          description: `La stratégie "${nom}" a été créée avec succès`,
        });
      }

      onStrategyUpdated();
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
            {strategy ? "Modifier la stratégie" : "Nouvelle stratégie"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la stratégie *</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Rush Site A"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {gameConfig?.strategyTypes ? 
                        gameConfig.strategyTypes.map((strategyType) => (
                          <SelectItem key={strategyType} value={strategyType}>
                            {strategyType}
                          </SelectItem>
                        )) :
                        STRATEGY_TYPES.map((strategyType) => (
                          <SelectItem key={strategyType.value} value={strategyType.value}>
                            {strategyType.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="map">Map (optionnel)</Label>
                <Select value={mapName} onValueChange={setMapName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une map" />
                  </SelectTrigger>
                  <SelectContent>
                    {(gameConfig?.maps || VALORANT_MAPS).map((map) => (
                      <SelectItem key={map} value={map}>
                        {map}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contenu de la stratégie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contenu de la stratégie</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Description</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center space-x-2">
                    <Image className="w-4 h-4" />
                    <span>Image/Schéma</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex items-center space-x-2">
                    <Map className="w-4 h-4" />
                    <span>Notes</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez la stratégie en détail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={8}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL de l'image ou schéma</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://exemple.com/schema.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  
                  {imageUrl && (
                    <div className="mt-4">
                      <Label>Aperçu:</Label>
                      <div className="mt-2 border rounded-lg p-4">
                        <img 
                          src={imageUrl} 
                          alt="Schéma de stratégie" 
                          className="max-w-full h-auto rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Conseils :</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Utilisez des outils comme draw.io pour créer des schémas</li>
                      <li>Uploadez vos images sur imgur ou un autre service</li>
                      <li>Annotez les positions importantes sur la map</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes supplémentaires</Label>
                    <Textarea
                      id="notes"
                      placeholder="Timing, callouts, variations, contre-stratégies..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={8}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};