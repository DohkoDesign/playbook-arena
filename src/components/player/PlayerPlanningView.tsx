import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Folder,
  FolderOpen,
  Target,
  TrendingUp,
  Award,
  Coffee,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Zap,
  Calendar,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  location?: string;
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

interface Availability {
  id: string;
  user_id: string;
  team_id: string;
  week_start: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface PlayerWithProfile {
  user_id: string;
  pseudo: string;
}

interface SmartSuggestion {
  id: string;
  type: 'training' | 'break' | 'review';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  reason: string;
}

export const PlayerPlanningView = ({ teamId, playerId }: PlayerPlanningViewProps) => {
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [teamEvents, setTeamEvents] = useState<any[]>([]);
  const [teamAvailabilities, setTeamAvailabilities] = useState<Availability[]>([]);
  const [teamMembers, setTeamMembers] = useState<PlayerWithProfile[]>([]);
  const [eventFolders, setEventFolders] = useState<EventFolder[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [availabilityWeek, setAvailabilityWeek] = useState('');
  const [weeklyAvailability, setWeeklyAvailability] = useState({
    monday: { available: false, start: '', end: '' },
    tuesday: { available: false, start: '', end: '' },
    wednesday: { available: false, start: '', end: '' },
    thursday: { available: false, start: '', end: '' },
    friday: { available: false, start: '', end: '' },
    saturday: { available: false, start: '', end: '' },
    sunday: { available: false, start: '', end: '' }
  });
  const { toast } = useToast();

  // Initialiser les dossiers par défaut
  const initializeFolders = () => {
    const defaultFolders: EventFolder[] = [
      {
        id: 'aim-training',
        name: 'Entraînement Aim',
        icon: 'Target',
        color: 'bg-red-500/10 text-red-700 border-red-200',
        events: [],
        isOpen: true
      },
      {
        id: 'strategy-review',
        name: 'Analyse Stratégique',
        icon: 'TrendingUp',
        color: 'bg-blue-500/10 text-blue-700 border-blue-200',
        events: [],
        isOpen: true
      },
      {
        id: 'team-practice',
        name: 'Pratique Équipe',
        icon: 'Users',
        color: 'bg-green-500/10 text-green-700 border-green-200',
        events: [],
        isOpen: true
      },
      {
        id: 'personal-goals',
        name: 'Objectifs Personnels',
        icon: 'Award',
        color: 'bg-purple-500/10 text-purple-700 border-purple-200',
        events: [],
        isOpen: true
      },
      {
        id: 'recovery',
        name: 'Récupération',
        icon: 'Coffee',
        color: 'bg-orange-500/10 text-orange-700 border-orange-200',
        events: [],
        isOpen: false
      }
    ];
    setEventFolders(defaultFolders);
  };

  // Générer des suggestions intelligentes
  const generateSmartSuggestions = () => {
    const suggestions: SmartSuggestion[] = [
      {
        id: '1',
        type: 'training',
        title: 'Session aim intensif',
        description: 'Basé sur tes performances récentes, une session aim pourrait améliorer ta précision',
        priority: 'high',
        estimatedDuration: 45,
        reason: 'Précision en baisse de 15% cette semaine'
      },
      {
        id: '2',
        type: 'review',
        title: 'Analyse VOD du dernier match',
        description: 'Revoir les moments clés du dernier match pour identifier les axes d\'amélioration',
        priority: 'medium',
        estimatedDuration: 30,
        reason: 'Match terminé il y a 2 jours'
      },
      {
        id: '3',
        type: 'break',
        title: 'Pause détente',
        description: 'Tu as joué 8h hier, une pause pourrait t\'aider à rester performant',
        priority: 'medium',
        estimatedDuration: 60,
        reason: 'Temps de jeu élevé récemment'
      }
    ];
    setSmartSuggestions(suggestions);
  };

  useEffect(() => {
    fetchEvents();
    initializeFolders();
    generateSmartSuggestions();
  }, [teamId, playerId, selectedWeek]);

  const fetchEvents = async () => {
    try {
      // Charger les événements d'équipe
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId);

      if (error) throw error;
      setTeamEvents(events || []);

      // Charger les membres de l'équipe
      const { data: memberIds, error: membersError } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId);

      if (membersError) throw membersError;

      // Charger les profils des membres
      if (memberIds && memberIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, pseudo")
          .in("user_id", memberIds.map(m => m.user_id));

        if (profilesError) throw profilesError;
        setTeamMembers(profiles || []);
      }

      // Charger les disponibilités de l'équipe pour la semaine sélectionnée
      const weekStart = getWeekStart(selectedWeek);
      const { data: availabilities, error: availError } = await supabase
        .from("player_availabilities")
        .select("*")
        .eq("team_id", teamId)
        .eq("week_start", weekStart.toISOString().split('T')[0]);

      if (availError) throw availError;
      setTeamAvailabilities(availabilities || []);

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
        },
        {
          id: '4',
          title: 'Pause détente',
          type: 'break',
          category: 'mental',
          date: new Date(Date.now() + 3 * 86400000).toISOString(),
          duration: 120,
          description: 'Temps de récupération',
          priority: 'low',
          folder: 'recovery',
          completed: false
        }
      ];

      setPersonalEvents(mockPersonalEvents);
      
      // Organiser les événements dans les dossiers
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

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const saveAvailability = async () => {
    if (!availabilityWeek) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une semaine",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStartDate = new Date(availabilityWeek);
      
      // Supprimer les anciennes disponibilités pour cette semaine
      await supabase
        .from("player_availabilities")
        .delete()
        .eq("user_id", user.id)
        .eq("team_id", teamId)
        .eq("week_start", weekStartDate.toISOString().split('T')[0]);

      // Insérer les nouvelles disponibilités
      const availabilitiesToInsert = [];
      const dayMapping = {
        monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
        friday: 4, saturday: 5, sunday: 6
      };

      Object.entries(weeklyAvailability).forEach(([day, availability]) => {
        if (availability.available && availability.start && availability.end) {
          availabilitiesToInsert.push({
            user_id: user.id,
            team_id: teamId,
            week_start: weekStartDate.toISOString().split('T')[0],
            day_of_week: dayMapping[day as keyof typeof dayMapping],
            start_time: availability.start,
            end_time: availability.end
          });
        }
      });

      if (availabilitiesToInsert.length > 0) {
        const { error } = await supabase
          .from("player_availabilities")
          .insert(availabilitiesToInsert);

        if (error) throw error;
      }

      fetchEvents();
      
      setShowAvailabilityModal(false);
      setAvailabilityWeek('');
      setWeeklyAvailability({
        monday: { available: false, start: '', end: '' },
        tuesday: { available: false, start: '', end: '' },
        wednesday: { available: false, start: '', end: '' },
        thursday: { available: false, start: '', end: '' },
        friday: { available: false, start: '', end: '' },
        saturday: { available: false, start: '', end: '' },
        sunday: { available: false, start: '', end: '' }
      });

      toast({
        title: "Disponibilités enregistrées",
        description: "Vos disponibilités ont été mises à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les disponibilités",
        variant: "destructive",
      });
    }
  };

  const toggleDayAvailability = (day: keyof typeof weeklyAvailability) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        start: !prev[day].available ? '09:00' : '',
        end: !prev[day].available ? '18:00' : ''
      }
    }));
  };

  const updateDayTime = (day: keyof typeof weeklyAvailability, timeType: 'start' | 'end', value: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeType]: value
      }
    }));
  };

  const getDayName = (day: string) => {
    const days = {
      monday: 'Lundi',
      tuesday: 'Mardi', 
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    };
    return days[day as keyof typeof days];
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const findCommonTimeSlots = (availabilities: Availability[]) => {
    if (availabilities.length < 2) return [];
    
    const timeSlots: { start: string; end: string; playerCount: number }[] = [];
    const minPlayers = 3;
    
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const minutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    for (let minute = 8 * 60; minute < 24 * 60; minute += 30) {
      const startTime = minutesToTime(minute);
      const endTime = minutesToTime(minute + 30);
      
      const playersAvailable = availabilities.filter(avail => {
        const availStart = timeToMinutes(avail.start_time);
        const availEnd = timeToMinutes(avail.end_time);
        return availStart <= minute && availEnd >= minute + 30;
      }).length;
      
      if (playersAvailable >= minPlayers) {
        timeSlots.push({
          start: startTime,
          end: endTime,
          playerCount: playersAvailable
        });
      }
    }
    
    return timeSlots;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventStats = () => {
    const totalEvents = personalEvents.length;
    const completedEvents = personalEvents.filter(e => e.completed).length;
    const highPriorityEvents = personalEvents.filter(e => e.priority === 'high').length;
    const totalDuration = personalEvents.reduce((acc, event) => acc + event.duration, 0);
    
    return { totalEvents, completedEvents, highPriorityEvents, totalDuration };
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Planning Personnel</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse space-y-4">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto"></div>
            <p>Chargement de votre planning intelligent...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Planning Personnel Intelligent
            </h1>
            <p className="text-muted-foreground">
              Organisez votre entraînement avec des suggestions personnalisées
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAvailabilityModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Mes Disponibilités
            </Button>
            <Button onClick={() => setShowEventModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Événement
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Événements</p>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Complétés</p>
                  <p className="text-2xl font-bold">{stats.completedEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Priorité haute</p>
                  <p className="text-2xl font-bold">{stats.highPriorityEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Temps total</p>
                  <p className="text-2xl font-bold">{Math.round(stats.totalDuration / 60)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="folders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="folders" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Mes Dossiers
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions IA
            {smartSuggestions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {smartSuggestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Disponibilités Équipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="folders" className="space-y-4">
          <div className="space-y-4">
            {eventFolders.map((folder) => {
              const IconComponent = getIconComponent(folder.icon);
              
              return (
                <Card key={folder.id} className="border-l-4 border-l-primary/20">
                  <Collapsible 
                    open={folder.isOpen} 
                    onOpenChange={() => toggleFolderOpen(folder.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${folder.color}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{folder.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {folder.events.length} événement(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {folder.events.filter(e => !e.completed).length} à faire
                            </Badge>
                            {folder.isOpen ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {folder.events.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                            <p>Aucun événement dans ce dossier</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {folder.events.map((event) => (
                              <Card key={event.id} className={`transition-all hover:shadow-md ${event.completed ? 'opacity-60' : ''}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className={`font-medium ${event.completed ? 'line-through' : ''}`}>
                                          {event.title}
                                        </h4>
                                        <Badge variant="outline" className={getPriorityColor(event.priority)}>
                                          {event.priority}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <CalendarIcon className="w-3 h-3" />
                                          {formatDate(event.date)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatDuration(event.duration)}
                                        </div>
                                      </div>
                                      
                                      {event.description && (
                                        <p className="text-sm text-muted-foreground">
                                          {event.description}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-4">
                                      <Button 
                                        size="sm" 
                                        variant={event.completed ? "secondary" : "default"}
                                      >
                                        {event.completed ? "Terminé" : "Commencer"}
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Suggestions Intelligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {smartSuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aucune suggestion pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {smartSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{suggestion.title}</h4>
                              <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                                {suggestion.priority}
                              </Badge>
                              <Badge variant="secondary">
                                {formatDuration(suggestion.estimatedDuration)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {suggestion.description}
                            </p>
                            
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                              💡 {suggestion.reason}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              Ignorer
                            </Button>
                            <Button size="sm">
                              Ajouter
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          {/* Calendrier des disponibilités d'équipe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Disponibilités de l'équipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Navigation par semaine */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedWeek);
                      newDate.setDate(newDate.getDate() - 7);
                      setSelectedWeek(newDate);
                    }}
                  >
                    ← Semaine précédente
                  </Button>
                  <div className="text-center">
                    <p className="font-medium">
                      Semaine du {selectedWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedWeek.getFullYear()}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedWeek);
                      newDate.setDate(newDate.getDate() + 7);
                      setSelectedWeek(newDate);
                    }}
                  >
                    Semaine suivante →
                  </Button>
                </div>

                {/* Grille des disponibilités par jour */}
                <div className="grid grid-cols-7 gap-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                    <div key={day} className="space-y-2">
                      <div className="text-center font-medium text-sm bg-muted/50 rounded p-2">
                        {day}
                      </div>
                      
                      {/* Créneaux réels pour chaque jour */}
                      <div className="space-y-1">
                        {teamAvailabilities
                          .filter(avail => avail.day_of_week === index)
                          .map(availability => {
                            const player = teamMembers.find(m => m.user_id === availability.user_id);
                            const colors = [
                              'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
                              'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
                              'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
                              'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300',
                              'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                            ];
                            const colorIndex = teamMembers.findIndex(m => m.user_id === availability.user_id) % colors.length;
                            
                            return (
                              <div 
                                key={availability.id}
                                className={`${colors[colorIndex]} text-xs p-1 rounded`}
                              >
                                <div className="font-medium">{player?.pseudo || 'Joueur'}</div>
                                <div>
                                  {availability.start_time.slice(0, 5)}-{availability.end_time.slice(0, 5)}
                                </div>
                              </div>
                            );
                          })
                        }
                        
                        {/* Afficher les créneaux communs s'il y en a */}
                        {(() => {
                          const dayAvailabilities = teamAvailabilities.filter(avail => avail.day_of_week === index);
                          const commonSlots = findCommonTimeSlots(dayAvailabilities);
                          
                          return commonSlots.map((slot, slotIndex) => (
                            <div 
                              key={`common-${index}-${slotIndex}`}
                              className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-xs p-1 rounded border-2 border-orange-300"
                            >
                              <div className="font-bold">🔥 Créneau commun</div>
                              <div>{slot.start}-{slot.end}</div>
                              <div className="text-[10px]">{slot.playerCount} joueurs</div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-4 text-xs border-t pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded"></div>
                    <span>Disponibilités individuelles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-300 rounded"></div>
                    <span>Créneaux communs (3+ joueurs)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de disponibilités */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter mes disponibilités</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">Semaine</label>
              <Input
                type="week"
                value={availabilityWeek}
                onChange={(e) => setAvailabilityWeek(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Mes créneaux de disponibilité</h3>
              {Object.entries(weeklyAvailability).map(([day, availability]) => (
                <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 min-w-[100px]">
                    <input
                      type="checkbox"
                      checked={availability.available}
                      onChange={() => toggleDayAvailability(day as keyof typeof weeklyAvailability)}
                      className="rounded"
                    />
                    <span className="font-medium">{getDayName(day)}</span>
                  </div>
                  
                  {availability.available && (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        type="time"
                        value={availability.start}
                        onChange={(e) => updateDayTime(day as keyof typeof weeklyAvailability, 'start', e.target.value)}
                        className="w-24"
                      />
                      <span>à</span>
                      <Input
                        type="time"
                        value={availability.end}
                        onChange={(e) => updateDayTime(day as keyof typeof weeklyAvailability, 'end', e.target.value)}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={saveAvailability}>
                Enregistrer mes disponibilités
              </Button>
              <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};