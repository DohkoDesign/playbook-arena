import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (team: any) => void;
}

import { getAvailableGames } from "@/data/gameConfigs";

export const TeamSetupModal = ({ isOpen, onClose, onTeamCreated }: TeamSetupModalProps) => {
  const [teamName, setTeamName] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const availableGames = getAvailableGames();

  const handleCreateTeam = async () => {
    console.log("🚀 Starting team creation:", { teamName, selectedGame });
    
    if (!teamName || !selectedGame) {
      console.log("❌ Missing required fields");
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("👤 Current user:", user?.id);
      
      if (!user) throw new Error("Utilisateur non connecté");

      console.log("📝 Creating team with data:", {
        nom: teamName,
        jeu: selectedGame,
        created_by: user.id,
      });

      const { data, error } = await supabase
        .from("teams")
        .insert({
          nom: teamName,
          jeu: selectedGame as any,
          created_by: user.id,
        })
        .select()
        .single();

      console.log("📊 Team creation result:", { data, error });

      if (error) {
        console.error("❌ Team creation error:", error);
        throw error;
      }

      console.log("✅ Team created successfully:", data);

      // Ajouter le créateur comme membre de l'équipe avec le rôle de manager
      console.log("👑 Adding creator as team manager");
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: "manager",
        });

      if (memberError) {
        console.error("❌ Error adding team member:", memberError);
        throw memberError;
      }

      console.log("🎉 Team setup completed successfully");

      toast({
        title: "Équipe créée",
        description: `L'équipe ${teamName} a été créée avec succès !`,
      });

      onTeamCreated(data);
    } catch (error: any) {
      console.error("💥 Full error in handleCreateTeam:", error);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer votre première équipe</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Nom de l'équipe</Label>
            <Input
              id="teamName"
              placeholder="Ex: Shadow Hunters"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="game">Jeu</Label>
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un jeu" />
              </SelectTrigger>
              <SelectContent>
                    {availableGames.map((game) => (
                      <SelectItem key={game.value} value={game.value}>
                        {game.label} ({game.players} joueurs)
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleCreateTeam} disabled={loading}>
              {loading ? "Création..." : "Créer l'équipe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};