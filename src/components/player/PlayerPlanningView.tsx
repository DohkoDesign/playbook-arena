import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerPlanningViewProps {
  teamId: string;
  playerId: string;
}

interface PersonalEvent {
  id: string;
  title: string;
  type: 'training' | 'review' | 'personal' | 'break';
  date: string;
  duration: number; // en minutes
  description?: string;
  location?: string;
}

export const PlayerPlanningView = ({ teamId, playerId }: PlayerPlanningViewProps) => {
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [teamEvents, setTeamEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
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

  useEffect(() => {
    fetchEvents();
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

      // Simuler des événements personnels
      const mockPersonalEvents: PersonalEvent[] = [
        {
          id: '1',
          title: 'Session aim training',
          type: 'training',
          date: new Date().toISOString(),
          duration: 60,
          description: 'Entraînement aim avec Aim Lab',
          location: 'Maison'
        },
        {
          id: '2',
          title: 'Review VOD personnel',
          type: 'review',
          date: new Date(Date.now() + 86400000).toISOString(),
          duration: 90,
          description: 'Analyser mes derniers matchs ranked'
        },
        {
          id: '3',
          title: 'Pause / Repos',
          type: 'break',
          date: new Date(Date.now() + 2 * 86400000).toISOString(),
          duration: 120,
          description: 'Temps de récupération'
        }
      ];

      setPersonalEvents(mockPersonalEvents);
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

  const saveAvailability = async () => {
    if (!availabilityWeek) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une semaine",
        variant: "destructive",
      });
      return;
    }

    // Ici on sauvegarderait en base de données
    console.log('Disponibilités pour la semaine du', availabilityWeek, ':', weeklyAvailability);
    
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'review':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'personal':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'break':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'training': return 'Entraînement';
      case 'review': return 'Review';
      case 'personal': return 'Personnel';
      case 'break': return 'Pause';
      default: return type;
    }
  };

  const getTeamEventTypeColor = (type: string) => {
    switch (type) {
      case "scrim":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "match":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "tournoi":
        return "bg-purple-500/10 text-purple-700 border-purple-200";
      case "coaching":
        return "bg-green-500/10 text-green-700 border-green-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Combiner et trier tous les événements par date
  const allEvents = [
    ...personalEvents.map(event => ({ ...event, source: 'personal' })),
    ...teamEvents.map(event => ({ ...event, source: 'team' }))
  ].sort((a, b) => new Date(a.date || a.date_debut).getTime() - new Date(b.date || b.date_debut).getTime());

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Planning Personnel</h1>
        </div>
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning Personnel</h1>
          <p className="text-muted-foreground">Consultez vos événements et gérez vos disponibilités</p>
        </div>
        <Button onClick={() => setShowAvailabilityModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter mes Dispo
        </Button>
      </div>

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
                  
                  {/* Créneaux simulés pour chaque jour */}
                  <div className="space-y-1">
                    {/* Joueur 1 */}
                    <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs p-1 rounded">
                      <div className="font-medium">Alex</div>
                      <div>14h-18h</div>
                    </div>
                    
                    {/* Joueur 2 */}
                    {index < 5 && (
                      <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs p-1 rounded">
                        <div className="font-medium">Mike</div>
                        <div>19h-23h</div>
                      </div>
                    )}
                    
                    {/* Joueur 3 */}
                    {index % 2 === 0 && (
                      <div className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs p-1 rounded">
                        <div className="font-medium">Sarah</div>
                        <div>16h-20h</div>
                      </div>
                    )}
                    
                    {/* Créneaux communs */}
                    {index < 4 && (
                      <div className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-xs p-1 rounded border-2 border-orange-300">
                        <div className="font-bold">🔥 Créneau commun</div>
                        <div>17h-18h</div>
                      </div>
                    )}
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

      {/* Statistiques de la semaine */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Cette semaine</p>
                <p className="text-2xl font-bold">{allEvents.length}</p>
                <p className="text-xs text-muted-foreground">événements</p>
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
                <p className="text-2xl font-bold">
                  {Math.round(personalEvents.reduce((acc, event) => acc + event.duration, 0) / 60)}h
                </p>
                <p className="text-xs text-muted-foreground">d'entraînement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Équipe</p>
                <p className="text-2xl font-bold">{teamEvents.length}</p>
                <p className="text-xs text-muted-foreground">événements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Personnel</p>
                <p className="text-2xl font-bold">{personalEvents.length}</p>
                <p className="text-xs text-muted-foreground">événements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des événements */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Événements à venir</h2>
        
        {allEvents.map((event, index) => {
          const isPersonal = event.source === 'personal';
          const eventDate = new Date(event.date || event.date_debut);
          const isToday = eventDate.toDateString() === new Date().toDateString();
          
          return (
            <Card key={`${event.source}-${event.id}`} className={`hover:shadow-md transition-shadow ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{event.title || event.titre}</h3>
                      <Badge 
                        variant="outline" 
                        className={isPersonal ? getEventTypeColor(event.type) : getTeamEventTypeColor(event.type)}
                      >
                        {isPersonal ? getEventTypeLabel(event.type) : event.type}
                      </Badge>
                      {isPersonal && (
                        <Badge variant="outline">Personnel</Badge>
                      )}
                      {!isPersonal && (
                        <Badge variant="outline">Équipe</Badge>
                      )}
                      {isToday && (
                        <Badge className="bg-primary text-primary-foreground">Aujourd'hui</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatDate(event.date || event.date_debut)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(event.date || event.date_debut)}
                        {isPersonal && event.duration && (
                          <span className="ml-1">({formatDuration(event.duration)})</span>
                        )}
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                    {(event.description || event.description) && (
                      <p className="text-sm text-muted-foreground">
                        {event.description || event.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucun événement planifié</h3>
            <p className="text-muted-foreground mb-4">
              Commencez à organiser votre entraînement personnel
            </p>
            <Button onClick={() => setShowAvailabilityModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter mes Dispo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};