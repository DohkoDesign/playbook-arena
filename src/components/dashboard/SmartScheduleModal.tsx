import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Target, 
  Zap, 
  Plus,
  ChevronDown,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SmartScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  gameType?: string;
  onEventCreated: () => void;
}

interface QuickTemplate {
  name: string;
  type: string;
  duration: number; // en minutes
  description: string;
  icon: any;
  color: string;
}

export const SmartScheduleModal = ({ 
  isOpen, 
  onClose, 
  teamId, 
  gameType, 
  onEventCreated 
}: SmartScheduleModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [mapName, setMapName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("quick");
  const { toast } = useToast();

  const gameConfig = gameType ? getGameConfig(gameType) : null;

  // Templates rapides adaptés au jeu
  const getQuickTemplates = (): QuickTemplate[] => {
    const baseTemplates: QuickTemplate[] = [
      {
        name: "Session d'entraînement",
        type: "coaching",
        duration: 90,
        description: "Session d'entraînement en équipe",
        icon: Target,
        color: "bg-green-500/10 text-green-700 border-green-200"
      },
      {
        name: "Match officiel",
        type: "match",
        duration: 120,
        description: "Match de compétition",
        icon: Zap,
        color: "bg-red-500/10 text-red-700 border-red-200"
      },
      {
        name: "Session individuelle",
        type: "session_individuelle",
        duration: 60,
        description: "Coaching personnel",
        icon: Users,
        color: "bg-orange-500/10 text-orange-700 border-orange-200"
      }
    ];

    // Ajout de templates spécifiques selon le jeu
    if (gameType === "valorant" || gameType === "csgo" || gameType === "overwatch") {
      baseTemplates.unshift({
        name: "Scrim",
        type: "scrim",
        duration: 90,
        description: "Match d'entraînement contre une autre équipe",
        icon: Target,
        color: "bg-blue-500/10 text-blue-700 border-blue-200"
      });
    }

    return baseTemplates;
  };

  const quickTemplates = getQuickTemplates();

  // Suggestions de créneaux intelligents
  const getTimeSuggestions = () => {
    const now = new Date();
    const suggestions = [];
    
    // Créneaux populaires
    const popularTimes = ["18:00", "19:00", "20:00", "21:00"];
    
    for (const time of popularTimes) {
      const [hours, minutes] = time.split(':');
      const suggestedDate = new Date(selectedDate || now);
      suggestedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (suggestedDate > now) {
        suggestions.push(time);
      }
    }
    
    return suggestions;
  };

  const handleQuickCreate = (template: QuickTemplate) => {
    setType(template.type);
    setTitle(template.name);
    setDescription(template.description);
    setDuration(template.duration);
    setActiveTab("custom");
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
        description: `"${title}" a été ajouté au calendrier`,
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto z-50 bg-background border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Planifier un événement
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Création rapide</TabsTrigger>
            <TabsTrigger value="custom">Personnalisé</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Choisir un type d'événement</h3>
              <p className="text-sm text-muted-foreground">Sélectionnez un modèle pour créer rapidement votre événement</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickTemplates.map((template) => (
                <Card 
                  key={template.name}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleQuickCreate(template)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <template.icon className="h-4 w-4" />
                      {template.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <Badge className={template.color}>
                      {template.duration} min
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gauche - Informations de base */}
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
                      {quickTemplates.map((template) => (
                        <SelectItem key={template.type} value={template.type}>
                          <div className="flex items-center gap-2">
                            <template.icon className="h-4 w-4" />
                            {template.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    rows={3}
                  />
                </div>
              </div>

              {/* Droite - Date et heure */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
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
                    <PopoverContent className="w-auto p-0 z-40 bg-background border shadow-lg" align="start">
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
                  <Label>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Heure de début *
                    </div>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
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
                    <PopoverContent className="w-auto p-4 z-40 bg-background border shadow-lg" align="start">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Heure personnalisée</Label>
                          <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Suggestions populaires</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {getTimeSuggestions().map((time) => (
                              <Button
                                key={time}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => setStartTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Select 
                    value={duration.toString()} 
                    onValueChange={(value) => setDuration(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                    <strong>Fin prévue :</strong> {calculateEndTime()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleCreateEvent} disabled={loading}>
                {loading ? "Création..." : "Créer l'événement"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};