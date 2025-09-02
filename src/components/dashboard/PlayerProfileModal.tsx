import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Target, TrendingUp, TrendingDown, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any;
  teamId: string;
  onProfileUpdated: () => void;
}

export const PlayerProfileModal = ({ 
  isOpen, 
  onClose, 
  player, 
  teamId, 
  onProfileUpdated 
}: PlayerProfileModalProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pointsForts, setPointsForts] = useState<string[]>([]);
  const [pointsFaibles, setPointsFaibles] = useState<string[]>([]);
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [newPointFort, setNewPointFort] = useState("");
  const [newPointFaible, setNewPointFaible] = useState("");
  const [newObjectif, setNewObjectif] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && player) {
      fetchPlayerProfile();
    }
  }, [isOpen, player]);

  const fetchPlayerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", player.user_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setPointsForts(data.points_forts || []);
        setPointsFaibles(data.points_faibles || []);
        setObjectifs(data.objectifs_individuels || []);
        setNotes(data.notes || "");
      } else {
        // Créer un nouveau profil
        const { data: newProfile, error: createError } = await supabase
          .from("player_profiles")
          .insert({
            team_id: teamId,
            user_id: player.user_id,
            points_forts: [],
            points_faibles: [],
            objectifs_individuels: [],
            notes: "",
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        setPointsForts([]);
        setPointsFaibles([]);
        setObjectifs([]);
        setNotes("");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil du joueur",
        variant: "destructive",
      });
    }
  };

  const addPointFort = () => {
    if (newPointFort.trim()) {
      setPointsForts([...pointsForts, newPointFort.trim()]);
      setNewPointFort("");
    }
  };

  const addPointFaible = () => {
    if (newPointFaible.trim()) {
      setPointsFaibles([...pointsFaibles, newPointFaible.trim()]);
      setNewPointFaible("");
    }
  };

  const addObjectif = () => {
    if (newObjectif.trim()) {
      setObjectifs([...objectifs, newObjectif.trim()]);
      setNewObjectif("");
    }
  };

  const removePointFort = (index: number) => {
    setPointsForts(pointsForts.filter((_, i) => i !== index));
  };

  const removePointFaible = (index: number) => {
    setPointsFaibles(pointsFaibles.filter((_, i) => i !== index));
  };

  const removeObjectif = (index: number) => {
    setObjectifs(objectifs.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    if (!profile) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("player_profiles")
        .update({
          points_forts: pointsForts,
          points_faibles: pointsFaibles,
          objectifs_individuels: objectifs,
          notes: notes,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profil sauvegardé",
        description: "Les informations du joueur ont été mises à jour",
      });

      onProfileUpdated();
      onClose();
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Fiche joueur - {player.profiles?.pseudo || "Joueur"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Points forts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Points forts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {pointsForts.map((point, index) => (
                  <Badge
                    key={index}
                    variant="secondary" 
                    className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors group"
                  >
                    {point}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-4 w-4 p-0 hover:bg-transparent group-hover:text-red-500"
                      onClick={() => removePointFort(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {pointsForts.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Aucun point fort ajouté</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Bon aim, Leadership..."
                  value={newPointFort}
                  onChange={(e) => setNewPointFort(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPointFort()}
                  className="flex-1"
                />
                <Button size="sm" onClick={addPointFort} variant="outline" className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Points faibles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span>Points à améliorer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {pointsFaibles.map((point, index) => (
                  <Badge
                    key={index}
                    variant="secondary" 
                    className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors group"
                  >
                    {point}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-4 w-4 p-0 hover:bg-transparent group-hover:text-red-500"
                      onClick={() => removePointFaible(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {pointsFaibles.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Aucun point à améliorer ajouté</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Positionnement, Communication..."
                  value={newPointFaible}
                  onChange={(e) => setNewPointFaible(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPointFaible()}
                  className="flex-1"
                />
                <Button size="sm" onClick={addPointFaible} variant="outline" className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Objectifs individuels */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Objectifs individuels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {objectifs.map((objectif, index) => (
                  <Badge
                    key={index}
                    variant="secondary" 
                    className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors group"
                  >
                    {objectif}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-4 w-4 p-0 hover:bg-transparent group-hover:text-red-500"
                      onClick={() => removeObjectif(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {objectifs.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Aucun objectif ajouté</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Améliorer le KDA, Apprendre de nouveaux agents..."
                  value={newObjectif}
                  onChange={(e) => setNewObjectif(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObjectif()}
                  className="flex-1"
                />
                <Button size="sm" onClick={addObjectif} variant="outline" className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notes supplémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notes sur le joueur, style de jeu, observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={saveProfile} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};