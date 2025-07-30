import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventModal } from "./EventModal";

interface CalendarViewProps {
  teamId: string;
  gameType?: string;
}

interface Event {
  id: string;
  titre: string;
  type: string;
  date_debut: string;
  date_fin: string;
  description?: string;
  map_name?: string;
}

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "scrim":
      return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300";
    case "match":
      return "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300";
    case "tournoi":
      return "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300";
    case "coaching":
      return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300";
    case "session_individuelle":
      return "bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300";
  }
};

const EventDetailsModal = ({ event, isOpen, onClose }: EventDetailsModalProps) => {
  if (!event) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{event.titre}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge className={getEventTypeColor(event.type)}>
              {event.type}
            </Badge>
            {event.map_name && (
              <Badge variant="outline">
                📍 {event.map_name}
              </Badge>
            )}
          </div>
          
          <div className="text-sm space-y-2">
            <p><span className="font-medium">Début:</span> {new Date(event.date_debut).toLocaleString("fr-FR")}</p>
            <p><span className="font-medium">Fin:</span> {new Date(event.date_fin).toLocaleString("fr-FR")}</p>
            {event.description && (
              <p><span className="font-medium">Description:</span> {event.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CalendarView = ({ teamId, gameType }: CalendarViewProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchEvents();
    }
  }, [teamId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .order("date_debut", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date_debut);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Calendrier</h1>
          </div>
          
          {/* Month navigation */}
          <div className="flex items-center space-x-4 ml-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="rounded-full w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-lg font-medium min-w-[140px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="rounded-full w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => setShowEventModal(true)}
          className="btn-apple bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {/* Calendar */}
      <Card className="card-apple">
        <CardHeader className="pb-4">
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="p-2 text-center">
                <span className="text-sm font-medium text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays().map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentDay = isToday(date);
              const isInCurrentMonth = isCurrentMonth(date);
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 rounded-lg border transition-all duration-200 hover:bg-accent/50
                    ${isCurrentDay 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'border-border/30 hover:border-border/60'
                    }
                    ${!isInCurrentMonth ? 'opacity-30' : ''}
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isCurrentDay ? 'text-primary' : isInCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          text-xs px-2 py-1 rounded-md border truncate cursor-pointer hover:opacity-80 transition-opacity
                          ${getEventTypeColor(event.type)}
                        `}
                        title={`${event.titre} - ${event.type}${event.map_name ? ` - ${event.map_name}` : ''}`}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">
                            {new Date(event.date_debut).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <span className="truncate">{event.titre}</span>
                          {event.map_name && (
                            <span className="text-xs opacity-70">📍</span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 2} autre(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={() => setShowEventDetails(false)}
      />

      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          teamId={teamId}
          gameType={gameType}
          onEventCreated={() => {
            fetchEvents();
            setShowEventModal(false);
          }}
        />
      )}
    </div>
  );
};