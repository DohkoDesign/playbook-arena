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
import { Calendar as CalendarIcon, Clock, MapPin, Sparkles, Trophy, Users, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  gameType?: string;
  selectedDate?: Date | null;
  onEventCreated: () => void;
}

const QUICK_TEMPLATES = [
  {
    id: "tournament",
    name: "Tournoi",
    type: "tournoi",
    duration: 90,
    description: "Participation à un tournoi",
    icon: Trophy,
    color: "bg-green-500"
  },
  {
    id: "scrim_evening", 
    name: "Scrim du soir",
    type: "scrim",
    duration: 120,
    description: "Scrim contre équipe partenaire",
    icon: Gamepad2,
    color: "bg-primary"
  },
  {
    id: "training_aim",
    name: "Entraînement visée",
    type: "entrainement", 
    duration: 60,
    description: "Session focused visée et aim",
    icon: Users,
    color: "bg-blue-500"
  },
];

export const EventModal = ({ isOpen, onClose, teamId, gameType, selectedDate: initialSelectedDate, onEventCreated }: EventModalProps) => {
  const [showTemplates, setShowTemplates] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [mapName, setMapName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate || new Date());
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

  const handleTemplateSelect = (template: typeof QUICK_TEMPLATES[0]) => {
    // Utiliser la date sélectionnée depuis le calendrier ou une suggestion intelligente
    const targetDate = initialSelectedDate ? new Date(initialSelectedDate) : new Date();
    
    // Si pas de date initiale, appliquer la logique intelligente
    if (!initialSelectedDate) {
      const now = new Date();
      if (now.getHours() < 18) {
        targetDate.setHours(20, 0, 0, 0);
      } else {
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(20, 0, 0, 0);
      }
    } else {
      // Si date fournie depuis le calendrier, proposer 20h sur cette date
      targetDate.setHours(20, 0, 0, 0);
    }
    
    setTitle(template.name);
    setType(template.type);
    setDescription(template.description);
    setSelectedDate(targetDate);
    setStartTime("20:00");
    setDuration(template.duration);
    setShowTemplates(false);
  };

  const applySuggestion = () => {
    const now = new Date();
    
    // Suggestions intelligentes basées sur l'heure actuelle
    if (now.getHours() < 18) {
      const today = new Date();
      today.setHours(20, 0, 0, 0);
      setSelectedDate(today);
      setStartTime("20:00");
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0);
      setSelectedDate(tomorrow);
      setStartTime("20:00");
    }
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Créer un nouvel événement
          </DialogTitle>
        </DialogHeader>
        
        {showTemplates ? (
          // Templates intelligents
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Créateur intelligent d'événements</h3>
                <p className="text-sm text-muted-foreground">
                  Créez rapidement vos événements avec des suggestions intelligentes
                </p>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Templates rapides</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {QUICK_TEMPLATES.map((template) => {
                  const TemplateIcon = template.icon;
                  return (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-3 hover:bg-primary/5 border-2 hover:border-primary/20"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className={`w-10 h-10 rounded-full ${template.color} flex items-center justify-center`}>
                        <TemplateIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.duration}min</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Custom Event */}
            <div className="pt-4 border-t">
              <Button 
                onClick={() => setShowTemplates(false)}
                className="w-full"
                variant="default"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Créer un événement personnalisé
              </Button>
            </div>
          </div>
        ) : (
          // Formulaire personnalisé
          <div className="space-y-4">
            {/* Bouton retour et suggestion */}
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                ← Retour aux templates
              </Button>
            </div>

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
                          <div className="h-40 overflow-y-auto border rounded-md p-2 bg-muted/20">
                            <div className="grid grid-cols-4 gap-1">
                              {getTimeSuggestions().map((time) => (
                                <Button
                                  key={time}
                                  variant={startTime === time ? "default" : "ghost"}
                                  size="sm"
                                  className="text-xs h-8 flex-shrink-0"
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
        )}
      </DialogContent>
    </Dialog>
  );
};