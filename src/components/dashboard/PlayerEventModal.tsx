import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Target, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  playerId: string;
  playerName: string;
  onEventCreated: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  type: string;
  date: Date | undefined;
  startTime: string;
  duration: string;
}

export const PlayerEventModal = ({
  isOpen,
  onClose,
  teamId,
  playerId,
  playerName,
  onEventCreated,
}: PlayerEventModalProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    type: "training",
    date: undefined,
    startTime: "10:00",
    duration: "60",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const eventTypes = [
    { value: "training", label: "Entraînement personnel", icon: Target },
    { value: "review", label: "Révision de VOD", icon: BookOpen },
    { value: "coaching", label: "Coaching individuel", icon: User },
    { value: "fitness", label: "Préparation physique", icon: Clock },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculer la date de fin
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const startDate = new Date(formData.date);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + parseInt(formData.duration));

      const { error } = await supabase
        .from("player_personal_events")
        .insert({
          team_id: teamId,
          player_id: playerId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          date_start: startDate.toISOString(),
          date_end: endDate.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Événement créé",
        description: `L'événement "${formData.title}" a été ajouté au planning de ${playerName}`,
      });

      onEventCreated();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Erreur lors de la création de l'événement:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'événement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "training",
      date: undefined,
      startTime: "10:00",
      duration: "60",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Ajouter un événement personnel
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Créer un événement pour <strong>{playerName}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'événement *</Label>
            <Input
              id="title"
              placeholder="Ex: Entraînement visée, Révision de match..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type d'événement</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "PPP", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Heure de début</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Select 
              value={formData.duration} 
              onValueChange={(value) => setFormData({ ...formData, duration: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
                <SelectItem value="180">3 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Détails sur l'événement, objectifs, notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer l'événement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};