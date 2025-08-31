import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Upload, Loader2, Users } from "lucide-react";
import { User } from "@supabase/supabase-js";

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
  user: User;
  onClose: () => void;
  onTeamCreated: () => void;
}

export const TeamSetupModal = ({ isOpen, user, onClose, onTeamCreated }: TeamSetupModalProps) => {
  const [teamName, setTeamName] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result); // Image en base64 pour usage local
        setUploading(false);
        
        toast({
          title: "Photo téléchargée",
          description: "Votre photo d'équipe a été ajoutée localement",
        });
      };
      
      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Erreur",
          description: "Erreur lors de la lecture du fichier",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      setUploading(false);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName || !selectedGame) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
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
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter le créateur comme membre manager
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: "manager",
        });

      if (memberError) throw memberError;

      toast({
        title: "Équipe créée !",
        description: `Bienvenue dans votre équipe ${teamName}`,
      });

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
    setUploading(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Créer votre équipe</DialogTitle>
              <DialogDescription>
                Configurez votre première équipe pour accéder au dashboard
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium">Photo de profil (optionnel)</h3>
              <p className="text-sm text-muted-foreground">
                Personnalisez votre profil
              </p>
            </div>

            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-lg">
                {(user.user_metadata?.pseudo || user.email)?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {avatarUrl ? "Changer la photo" : "Ajouter une photo"}
                  </span>
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG jusqu'à 2MB
              </p>
            </div>
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
              disabled={submitting || !teamName || !selectedGame}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  Créer mon équipe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Vous pourrez créer d'autres équipes plus tard
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};