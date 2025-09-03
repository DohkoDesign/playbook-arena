import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const GAMES = [
  { value: "valorant", label: "Valorant", players: 5 },
  { value: "rocket_league", label: "Rocket League", players: 3 },
  { value: "league_of_legends", label: "League of Legends", players: 5 },
  { value: "counter_strike", label: "Counter-Strike", players: 5 },
  { value: "overwatch", label: "Overwatch", players: 6 },
  { value: "apex_legends", label: "Apex Legends", players: 3 },
  { value: "fortnite", label: "Fortnite", players: 4 },
  { value: "call_of_duty", label: "Call of Duty", players: 6 },
];

interface TeamSetupModalProps {
  isOpen: boolean;
  user: SupabaseUser;
  onClose: () => void;
  onTeamCreated: () => void;
}

export const TeamSetupModal = ({ isOpen, user, onClose, onTeamCreated }: TeamSetupModalProps) => {
  const [teamName, setTeamName] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateTeam = async () => {
    if (!teamName || !selectedGame) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Créer l'équipe
      const { data, error } = await supabase
        .from("teams")
        .insert({
          nom: teamName,
          jeu: selectedGame as any,
          created_by: user.id,
          logo: avatarUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Si l'utilisateur a mis une photo, l'utiliser aussi comme photo de profil si il n'en a pas
      if (avatarUrl) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("photo_profil")
          .eq("user_id", user.id)
          .single();

        if (!existingProfile?.photo_profil) {
          console.log("📸 Setting team logo as user profile photo");
          await supabase
            .from("profiles")
            .update({ photo_profil: avatarUrl })
            .eq("user_id", user.id);
        }
      }

      // Le créateur est ajouté automatiquement comme propriétaire via un trigger DB

      toast({
        title: "Équipe créée !",
        description: `Bienvenue dans ${teamName}`,
      });

      resetForm();
      onTeamCreated();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTeamName("");
    setSelectedGame("");
    setAvatarUrl("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer votre équipe</DialogTitle>
          <DialogDescription>Ajoutez le nom, le jeu et (facultatif) un logo pour créer votre équipe.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo d'équipe */}
          <div className="flex flex-col items-center space-y-4 pb-6 border-b">
            <h3 className="text-lg font-semibold text-center">Logo d'équipe</h3>
            <ImageUpload
              onImageSelect={setAvatarUrl}
              currentImage={avatarUrl}
              variant="avatar"
              size="lg"
              placeholder="Logo de l'équipe"
            />
          </div>

          {/* Configuration de l'équipe */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Nom de l'équipe *</Label>
              <Input
                id="teamName"
                placeholder="Ex: Shadow Hunters"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game">Jeu principal *</Label>
              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jeu" />
                </SelectTrigger>
                <SelectContent>
                  {GAMES.map((game) => (
                    <SelectItem key={game.value} value={game.value}>
                      {game.label} ({game.players} joueurs)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateTeam}
              disabled={!teamName || !selectedGame || submitting}
              className="w-full"
            >
              {submitting ? "Création..." : "Créer l'équipe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};