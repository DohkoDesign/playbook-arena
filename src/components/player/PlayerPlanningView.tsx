import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  Coffee,
  ChevronDown,
  ChevronRight,
  Settings,
  Users,
  Lightbulb,
  Plus,
  Check,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

interface PlayerPlanningViewProps {
  teamId: string;
  playerId: string;
}

interface PersonalEvent {
  id: string;
  title: string;
  type: 'training' | 'review' | 'personal' | 'break' | 'objective';
  category: 'aim' | 'strategy' | 'teamwork' | 'mental' | 'physical' | 'other';
  date: string;
  duration: number;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  folder?: string;
}

interface EventFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  events: PersonalEvent[];
  isOpen: boolean;
}

interface TimeSlot {
  id: string;
  start: number; // Minutes depuis minuit (ex: 540 = 9h00)
  end: number;   // Minutes depuis minuit (ex: 720 = 12h00)
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WeeklyAvailability {
  [key: string]: DayAvailability;
}

export const PlayerPlanningView = ({ teamId, playerId }: PlayerPlanningViewProps) => {
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [teamEvents, setTeamEvents] = useState<any[]>([]);
  const [eventFolders, setEventFolders] = useState<EventFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>({
    monday: { enabled: false, slots: [] },
    tuesday: { enabled: false, slots: [] },
    wednesday: { enabled: false, slots: [] },
    thursday: { enabled: false, slots: [] },
    friday: { enabled: false, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] }
  });
  const { toast } = useToast();

  // Initialiser les dossiers par défaut avec un design moderne
  const initializeFolders = () => {
    const defaultFolders: EventFolder[] = [
      {
        id: 'aim-training',
        name: 'Entraînement Aim',
        icon: 'Target',
        color: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800',
        events: [],
        isOpen: true
      },
      {
        id: 'strategy-review',
        name: 'Analyse Stratégique',
        icon: 'TrendingUp',
        color: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800',
        events: [],
        isOpen: true
      },
      {
        id: 'team-practice',
        name: 'Pratique Équipe',
        icon: 'Users',
        color: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800',
        events: [],
        isOpen: true
      },
      {
        id: 'personal-goals',
        name: 'Objectifs Personnels',
        icon: 'Award',
        color: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-800',
        events: [],
        isOpen: true
      },
      {
        id: 'recovery',
        name: 'Récupération',
        icon: 'Coffee',
        color: 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-800',
        events: [],
        isOpen: false
      }
    ];
    setEventFolders(defaultFolders);
  };

  useEffect(() => {
    fetchEvents();
    initializeFolders();
  }, [teamId, playerId, selectedDate]);

  const fetchEvents = async () => {
    try {
      // Charger les événements d'équipe
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId);

      if (error) throw error;
      setTeamEvents(events || []);

      // Simuler des événements personnels organisés par dossiers
      const mockPersonalEvents: PersonalEvent[] = [
        {
          id: '1',
          title: 'Session aim Kovaak\'s',
          type: 'training',
          category: 'aim',
          date: new Date().toISOString(),
          duration: 45,
          description: 'Entraînement précision avec Kovaak\'s',
          priority: 'high',
          folder: 'aim-training',
          completed: false
        },
        {
          id: '2',
          title: 'Analyse VOD dernier scrim',
          type: 'review',
          category: 'strategy',
          date: new Date(Date.now() + 86400000).toISOString(),
          duration: 30,
          description: 'Revoir les erreurs du scrim d\'hier',
          priority: 'medium',
          folder: 'strategy-review',
          completed: false
        },
        {
          id: '3',
          title: 'Objectif: Améliorer crosshair placement',
          type: 'objective',
          category: 'aim',
          date: new Date(Date.now() + 2 * 86400000).toISOString(),
          duration: 60,
          description: 'Travailler le placement du crosshair en aim training',
          priority: 'high',
          folder: 'personal-goals',
          completed: false
        }
      ];

      setPersonalEvents(mockPersonalEvents);
      organizeEventsInFolders(mockPersonalEvents);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le planning",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeEventsInFolders = (events: PersonalEvent[]) => {
    setEventFolders(prevFolders => 
      prevFolders.map(folder => ({
        ...folder,
        events: events.filter(event => event.folder === folder.id)
      }))
    );
  };

  const toggleFolderOpen = (folderId: string) => {
    setEventFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isOpen: !folder.isOpen }
          : folder
      )
    );
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Target, TrendingUp, Users, Award, Coffee, Lightbulb
    };
    return icons[iconName] || Target;
  };

  // Utilitaires pour la gestion du temps
  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getDayName = (dayKey: string) => {
    const days = {
      monday: 'Lundi',
      tuesday: 'Mardi', 
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    };
    return days[dayKey as keyof typeof days];
  };

  const toggleDayEnabled = (dayKey: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayKey]: {
        enabled: !prev[dayKey].enabled,
        slots: !prev[dayKey].enabled ? [
          {
            id: '1',
            start: 540, // 9h00
            end: 1080   // 18h00
          }
        ] : []
      }
    }));
  };

  const addAvailabilitySlot = (dayKey: string) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      start: 540, // 9h00 par défaut
      end: 720    // 12h00 par défaut
    };

    setWeeklyAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: [...prev[dayKey].slots, newSlot]
      }
    }));
  };

  const removeAvailabilitySlot = (dayKey: string, slotId: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const updateSlotTime = (dayKey: string, slotId: string, field: 'start' | 'end', minutes: number) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map(slot => 
          slot.id === slotId ? { ...slot, [field]: minutes } : slot
        )
      }
    }));
  };

  const saveAvailabilities = async () => {
    try {
      // Ici on sauvegarderait en base
      toast({
        title: "Disponibilités sauvegardées",
        description: "Vos créneaux ont été enregistrés avec succès",
      });
      setShowAvailabilityModal(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      });
    }
  };


  // Composant Apple-style time picker
  const AppleTimePicker = ({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    // Générer les options d'heures (0-23)
    const hourOptions = Array.from({ length: 24 }, (_, i) => i);
    // Générer les options de minutes par tranches de 15 (0, 15, 30, 45)
    const minuteOptions = [0, 15, 30, 45];

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
          <div className="flex items-center justify-center space-x-1">
            {/* Sélecteur d'heures style Apple */}
            <div className="flex flex-col items-center">
              <Label className="text-xs text-muted-foreground mb-2">Heure</Label>
              <div className="relative">
                <select
                  value={hours}
                  onChange={(e) => onChange(parseInt(e.target.value) * 60 + minutes)}
                  className="appearance-none bg-background/80 border border-border/50 rounded-xl px-4 py-3 text-lg font-medium text-center min-w-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:bg-background/90"
                >
                  {hourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-2xl font-light text-muted-foreground self-end pb-3">:</div>

            {/* Sélecteur de minutes style Apple */}
            <div className="flex flex-col items-center">
              <Label className="text-xs text-muted-foreground mb-2">Minutes</Label>
              <div className="relative">
                <select
                  value={minutes}
                  onChange={(e) => onChange(hours * 60 + parseInt(e.target.value))}
                  className="appearance-none bg-background/80 border border-border/50 rounded-xl px-4 py-3 text-lg font-medium text-center min-w-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:bg-background/90"
                >
                  {minuteOptions.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Affichage du temps sélectionné style Apple */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 rounded-full px-4 py-2">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              <span className="text-lg font-medium">
                {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getEventsForDate = (date: Date) => {
    return [...personalEvents, ...teamEvents].filter(event => 
      isSameDay(new Date(event.date || event.date_debut), date)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement du planning...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mon Planning</h2>
          <p className="text-muted-foreground">Organisez votre entraînement et vos disponibilités</p>
        </div>
        <Button onClick={() => setShowAvailabilityModal(true)} className="space-x-2">
          <Settings className="w-4 h-4" />
          <span>Configurer mes disponibilités</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Calendrier - Section principale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Calendrier</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mini calendrier */}
              <div>
                <ShadcnCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  locale={fr}
                />
              </div>

              {/* Événements du jour sélectionné */}
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                </h3>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event, index) => (
                      <div key={event.id || index} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title || event.titre}</h4>
                          <Badge variant="outline" className="text-xs">
                            {event.type || 'Équipe'}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{event.duration ? `${event.duration}min` : 'Durée non définie'}</span>
                        </div>
                      </div>
                    ))}
                    {getEventsForDate(selectedDate).length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        Aucun événement prévu pour cette date
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dossiers d'événements - Section en dessous */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Mes Entraînements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventFolders.map((folder) => {
                const Icon = getIconComponent(folder.icon);
                return (
                  <div key={folder.id} className="border border-border rounded-lg overflow-hidden">
                    <div 
                      className={`p-3 cursor-pointer transition-all hover:opacity-80 ${folder.color}`}
                      onClick={() => toggleFolderOpen(folder.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{folder.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {folder.events.length}
                          </Badge>
                          {folder.isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {folder.isOpen && (
                      <div className="p-3 bg-background border-t">
                        {folder.events.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            Aucun événement dans ce dossier
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {folder.events.map((event) => (
                              <div key={event.id} className="p-2 border border-border rounded text-xs">
                                <div className="font-medium">{event.title}</div>
                                <div className="text-muted-foreground">
                                  {event.duration}min • {event.priority}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de configuration des disponibilités - NOUVEAU SYSTÈME */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Mes Disponibilités</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Définissez vos créneaux de disponibilité pour chaque jour de la semaine. Utilisez les curseurs pour ajuster précisément vos horaires.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Object.entries(weeklyAvailability).map(([dayKey, dayData]) => (
                <div key={dayKey} className={`transition-all duration-200 ${dayData.enabled ? "bg-primary/5 border-primary/20" : "bg-background/50 border-border/30"} backdrop-blur-sm rounded-xl border`}>
                  {/* En-tête compact */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${dayData.enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {getDayName(dayKey).substring(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{getDayName(dayKey)}</h4>
                        <p className="text-xs text-muted-foreground">
                          {dayData.enabled && dayData.slots.length > 0 
                            ? `${dayData.slots.length} créneau${dayData.slots.length > 1 ? 'x' : ''}` 
                            : "Indisponible"}
                        </p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={dayData.enabled}
                      onCheckedChange={() => toggleDayEnabled(dayKey)}
                    />
                  </div>
                  
                  {/* Créneaux compacts */}
                  {dayData.enabled && (
                    <div className="px-4 pb-4 space-y-2">
                      {dayData.slots.map((slot, index) => (
                        <div key={slot.id} className="bg-background/60 rounded-lg p-3 border border-border/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-xs font-medium">#{index + 1}</span>
                              <span className="text-xs text-muted-foreground">
                                {minutesToTime(slot.start)} - {minutesToTime(slot.end)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAvailabilitySlot(dayKey, slot.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <AppleTimePicker
                              value={slot.start}
                              onChange={(value) => updateSlotTime(dayKey, slot.id, 'start', value)}
                              label="Début"
                            />
                            <AppleTimePicker
                              value={slot.end}
                              onChange={(value) => updateSlotTime(dayKey, slot.id, 'end', value)}
                              label="Fin"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAvailabilitySlot(dayKey)}
                        className="w-full h-8 border-dashed border-border/40 hover:border-primary/40 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
                Annuler
              </Button>
              <Button onClick={saveAvailabilities} className="space-x-2">
                <Check className="w-4 h-4" />
                <span>Sauvegarder</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};