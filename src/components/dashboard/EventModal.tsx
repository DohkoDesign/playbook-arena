import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onEventCreated: () => void;
}

export const EventModal = ({ isOpen, onClose, teamId, onEventCreated }: EventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const eventTypes = [
    { value: "scrim", label: "Scrim" },
    { value: "match", label: "Match officiel" },
    { value: "tournoi", label: "Tournoi" },
    { value: "coaching", label: "Session coaching" },
    { value: "session_individuelle", label: "Session individuelle" },
  ];

  const handleCreateEvent = async () => {
    if (!title || !type || !dateDebut || !dateFin) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Utilisateur non connecté");

      const { error } = await supabase
        .from("events")
        .insert({
          team_id: teamId,
          titre: title,
          description: description || null,
          type: type as any,
          date_debut: dateDebut,
          date_fin: dateFin,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Événement créé",
        description: `L'événement "${title}" a été ajouté au calendrier`,
      });

      onEventCreated();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouvel événement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Scrim vs Team Alpha"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type d'événement *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.value} value={eventType.value}>
                    {eventType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date/Heure début *</Label>
              <Input
                id="dateDebut"
                type="datetime-local"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date/Heure fin *</Label>
              <Input
                id="dateFin"
                type="datetime-local"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Détails supplémentaires..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleCreateEvent} disabled={loading}>
              {loading ? "Création..." : "Créer l'événement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};