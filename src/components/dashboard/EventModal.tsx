import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  gameType?: string;
  onEventCreated: () => void;
}

export const EventModal = ({ isOpen, onClose, teamId, gameType, onEventCreated }: EventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [mapName, setMapName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gameConfig = gameType ? getGameConfig(gameType) : null;

  const eventTypes = [
    { value: "scrim", label: "Scrim" },
    { value: "match", label: "Match officiel" },
    { value: "tournoi", label: "Tournoi" },
    { value: "coaching", label: "Session coaching" },
    { value: "session_individuelle", label: "Session individuelle" },
  ];

  const getTimeSuggestions = () => {
    const suggestions = [];
    for (let h = 8; h <= 23; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        suggestions.push(`${hour}:${minute}`);
      }
    }
    return suggestions;
  };

  const getPopularTimes = () => {
    return ["18:00", "19:00", "20:00", "21:00"];
  };

  const calculateEndTime = () => {
    if (!startTime || !selectedDate) return "";
    
    const [hours, minutes] = startTime.split(':');
    const startDate = new Date(selectedDate);
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().slice(0, 5);
  };

  const handleCreateEvent = async () => {
    if (!title || !type || !selectedDate || !startTime) {
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

      // Calcul des dates
      const [hours, minutes] = startTime.split(':');
      const dateDebut = new Date(selectedDate);
      dateDebut.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const dateFin = new Date(dateDebut.getTime() + duration * 60000);

      const { error } = await supabase
        .from("events")
        .insert({
          team_id: teamId,
          titre: title,
          description: description || null,
          type: type as any,
          date_debut: dateDebut.toISOString(),
          date_fin: dateFin.toISOString(),
          map_name: mapName || null,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Événement créé",
        description: `L'événement "${title}" a été ajouté au calendrier`,
      });

      onEventCreated();
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Créer un nouvel événement
          </DialogTitle>
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
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border shadow-lg z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Heure *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !startTime && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {startTime ? (
                      startTime
                    ) : (
                      <span>Choisir une heure</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-background border shadow-lg z-50" align="start">
                  <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Créneaux populaires</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {getPopularTimes().map((time) => (
                            <Button
                              key={time}
                              variant={startTime === time ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setStartTime(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tous les créneaux</Label>
                        <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/20">
                          <div className="grid grid-cols-4 gap-1">
                            {getTimeSuggestions().map((time) => (
                              <Button
                                key={time}
                                variant={startTime === time ? "default" : "ghost"}
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => setStartTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée</Label>
            <Select 
              value={duration.toString()} 
              onValueChange={(value) => setDuration(parseInt(value))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1h</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2h</SelectItem>
                <SelectItem value="150">2h30</SelectItem>
                <SelectItem value="180">3h</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {startTime && (
            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span><strong>Fin prévue :</strong> {calculateEndTime()}</span>
              </div>
            </div>
          )}
          
          {gameConfig?.maps && gameConfig.maps.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="mapName">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Map (optionnel)
                </div>
              </Label>
              <Select value={mapName} onValueChange={setMapName}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une map" />
                </SelectTrigger>
                <SelectContent>
                  {gameConfig.maps.map((map) => (
                    <SelectItem key={map} value={map}>
                      {map}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Détails supplémentaires..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
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