import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Trophy, Users, Gamepad2, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

interface IntelligentEventCreatorProps {
  teamId: string;
  gameType?: string;
  onEventCreated: () => void;
}

const EVENT_TYPES = [
  { value: "match", label: "Match", icon: Trophy, color: "bg-green-500" },
  { value: "entrainement", label: "Entraînement", icon: Users, color: "bg-blue-500" },
  { value: "scrim", label: "Scrim", icon: Gamepad2, color: "bg-purple-500" },
  { value: "tournoi", label: "Tournoi", icon: Trophy, color: "bg-yellow-500" },
];

const QUICK_TEMPLATES = [
  {
    id: "match_ranked",
    name: "Match Ranked",
    type: "match",
    duration: 90,
    description: "Match en équipe classé",
  },
  {
    id: "scrim_evening",
    name: "Scrim du soir",
    type: "scrim",
    duration: 120,
    description: "Scrim contre équipe partenaire",
  },
  {
    id: "training_aim",
    name: "Entraînement visée",
    type: "entrainement",
    duration: 60,
    description: "Session focused visée et aim",
  },
];

export const IntelligentEventCreator = ({ teamId, gameType, onEventCreated }: IntelligentEventCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    titre: "",
    type: "",
    description: "",
    map_name: "",
    date_debut: new Date(),
    date_fin: new Date(),
  });
  
  const { toast } = useToast();
  const gameConfig = gameType ? getGameConfig(gameType) : null;

  const handleTemplateSelect = (template: typeof QUICK_TEMPLATES[0]) => {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(20, 0, 0, 0); // 20h par défaut
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + template.duration);
    
    setFormData({
      titre: template.name,
      type: template.type,
      description: template.description,
      map_name: "",
      date_debut: startTime,
      date_fin: endTime,
    });
    setIsCreating(true);
  };

  const updateDateTime = (field: 'date_debut' | 'date_fin', date: Date, time?: string) => {
    const newDate = new Date(date);
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: newDate,
      // Auto-adjust end time if start time changes
      ...(field === 'date_debut' && {
        date_fin: new Date(newDate.getTime() + (prev.date_fin.getTime() - prev.date_debut.getTime()))
      })
    }));
  };

  const handleSuggestDateTime = () => {
    const now = new Date();
    const suggestions = [];
    
    // Suggestions intelligentes basées sur l'heure actuelle
    if (now.getHours() < 18) {
      const today = new Date();
      today.setHours(20, 0, 0, 0);
      suggestions.push({ label: "Ce soir 20h", date: today });
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0);
    suggestions.push({ label: "Demain soir 20h", date: tomorrow });
    
    const weekend = new Date();
    const daysUntilSunday = 7 - weekend.getDay();
    weekend.setDate(weekend.getDate() + daysUntilSunday);
    weekend.setHours(14, 0, 0, 0);
    suggestions.push({ label: "Dimanche après-midi", date: weekend });
    
    return suggestions[0]; // Prendre la première suggestion
  };

  const applySuggestion = () => {
    const suggestion = handleSuggestDateTime();
    if (suggestion) {
      const endTime = new Date(suggestion.date);
      endTime.setHours(endTime.getHours() + 2); // 2h par défaut
      
      setFormData(prev => ({
        ...prev,
        date_debut: suggestion.date,
        date_fin: endTime,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.titre || !formData.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        titre: formData.titre,
        type: formData.type as any,
        description: formData.description || null,
        map_name: formData.map_name || null,
        date_debut: formData.date_debut.toISOString(),
        date_fin: formData.date_fin.toISOString(),
        team_id: teamId,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { error } = await supabase
        .from("events")
        .insert(eventData);

      if (error) throw error;

      toast({
        title: "Événement créé",
        description: "L'événement a été ajouté avec succès",
      });

      // Reset form
      setFormData({
        titre: "",
        type: "",
        description: "",
        map_name: "",
        date_debut: new Date(),
        date_fin: new Date(),
      });
      
      setIsCreating(false);
      onEventCreated();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isCreating) {
    return (
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Créateur intelligent d'événements</h3>
              <p className="text-muted-foreground">
                Créez rapidement vos événements avec des suggestions intelligentes
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Templates rapides</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {QUICK_TEMPLATES.map((template) => {
                  const EventIcon = EVENT_TYPES.find(t => t.value === template.type)?.icon || Trophy;
                  return (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary/5"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <EventIcon className="w-5 h-5" />
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
                onClick={() => setIsCreating(true)}
                className="w-full"
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un événement personnalisé
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Nouveau événement</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(false)}
          >
            Annuler
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titre">Titre de l'événement *</Label>
            <Input
              id="titre"
              placeholder="Ex: Match vs Team Alpha"
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type d'événement *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map selection for games that have maps */}
        {gameConfig?.maps && gameConfig.maps.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="map">Map (optionnel)</Label>
            <Select value={formData.map_name} onValueChange={(value) => setFormData(prev => ({ ...prev, map_name: value }))}>
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

        {/* Date and Time with Smart Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Date et heure</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={applySuggestion}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Suggestion automatique
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date/Time */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Début</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date_debut, "dd MMM yyyy", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date_debut}
                      onSelect={(date) => date && updateDateTime('date_debut', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={format(formData.date_debut, "HH:mm")}
                  onChange={(e) => updateDateTime('date_debut', formData.date_debut, e.target.value)}
                  className="w-32"
                />
              </div>
            </div>

            {/* End Date/Time */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Fin</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date_fin, "dd MMM yyyy", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date_fin}
                      onSelect={(date) => date && updateDateTime('date_fin', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={format(formData.date_fin, "HH:mm")}
                  onChange={(e) => updateDateTime('date_fin', formData.date_fin, e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </div>
          
          {/* Duration display */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Durée: {Math.round((formData.date_fin.getTime() - formData.date_debut.getTime()) / (1000 * 60))} minutes
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            placeholder="Objectifs, adversaire, notes spéciales..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsCreating(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.titre || !formData.type}
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Création..." : "Créer l'événement"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};