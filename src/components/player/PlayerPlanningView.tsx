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
  PauseCircle,
  XCircle,
  CheckCircle,
  Users,
  Lightbulb
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
  start: string;
  end: string;
  type: 'available' | 'busy' | 'break' | 'unavailable';
  title?: string;
}

interface WeeklySchedule {
  [key: string]: {
    enabled: boolean;
    slots: TimeSlot[];
  }
}

export const PlayerPlanningView = ({ teamId, playerId }: PlayerPlanningViewProps) => {
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [teamEvents, setTeamEvents] = useState<any[]>([]);
  const [eventFolders, setEventFolders] = useState<EventFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
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
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
        slots: !prev[dayKey].enabled ? [
          { start: '09:00', end: '12:00', type: 'available', title: 'Matinée disponible' },
          { start: '12:00', end: '14:00', type: 'break', title: 'Pause déjeuner' },
          { start: '14:00', end: '18:00', type: 'available', title: 'Après-midi disponible' }
        ] : []
      }
    }));
  };

  const addTimeSlot = (dayKey: string, slotType: 'available' | 'busy' | 'break' | 'unavailable') => {
    const newSlot: TimeSlot = {
      start: '09:00',
      end: '10:00',
      type: slotType,
      title: slotType === 'available' ? 'Disponible' : 
             slotType === 'break' ? 'Pause' :
             slotType === 'busy' ? 'Occupé' : 'Indisponible'
    };

    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: [...prev[dayKey].slots, newSlot]
      }
    }));
  };

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end' | 'title', value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const removeTimeSlot = (dayKey: string, index: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.filter((_, i) => i !== index)
      }
    }));
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'busy':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'break':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'unavailable':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSlotTypeIcon = (type: string) => {
    switch (type) {
      case 'available':
        return CheckCircle;
      case 'busy':
        return XCircle;
      case 'break':
        return PauseCircle;
      case 'unavailable':
        return XCircle;
      default:
        return Clock;
    }
  };

  const saveSchedule = async () => {
    try {
      // Ici on sauvegarderait en base de données
      toast({
        title: "Planning sauvegardé",
        description: "Votre planning personnalisé a été enregistré",
      });
      setShowScheduleModal(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le planning",
        variant: "destructive",
      });
    }
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
        <Button onClick={() => setShowScheduleModal(true)} className="space-x-2">
          <Settings className="w-4 h-4" />
          <span>Gérer mes disponibilités</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier - Section principale à gauche */}
        <Card className="lg:col-span-2">
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

        {/* Dossiers d'événements - Section droite compacte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Mes Entraînements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
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
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Modal de gestion des disponibilités */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Gérer mes disponibilités</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Personnalisez votre planning hebdomadaire avec des créneaux disponibles, pauses et indisponibilités.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(weeklySchedule).map(([dayKey, dayData]) => (
                <Card key={dayKey} className="border-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">{getDayName(dayKey)}</Label>
                      <Switch
                        checked={dayData.enabled}
                        onCheckedChange={() => toggleDayEnabled(dayKey)}
                      />
                    </div>
                  </CardHeader>
                  
                  {dayData.enabled && (
                    <CardContent className="space-y-3">
                      {dayData.slots.map((slot, index) => {
                        const SlotIcon = getSlotTypeIcon(slot.type);
                        return (
                          <div key={index} className={`p-3 rounded-lg border ${getSlotTypeColor(slot.type)}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <SlotIcon className="w-4 h-4" />
                                <Input
                                  value={slot.title}
                                  onChange={(e) => updateTimeSlot(dayKey, index, 'title', e.target.value)}
                                  className="h-6 text-xs border-none p-0 bg-transparent"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeSlot(dayKey, index)}
                                className="h-6 w-6 p-0"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(dayKey, index, 'start', e.target.value)}
                                className="h-6 text-xs"
                              />
                              <span className="text-xs">à</span>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(dayKey, index, 'end', e.target.value)}
                                className="h-6 text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(dayKey, 'available')}
                          className="h-6 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Disponible
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(dayKey, 'break')}
                          className="h-6 text-xs"
                        >
                          <PauseCircle className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(dayKey, 'unavailable')}
                          className="h-6 text-xs"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Indispo
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Annuler
              </Button>
              <Button onClick={saveSchedule}>
                Sauvegarder le planning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};