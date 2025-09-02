import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Target
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
  type: string;
  date_start: string;
  date_end: string;
  description?: string;
}

export const PlayerPlanningView = ({ teamId, playerId }: PlayerPlanningViewProps) => {
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [teamEvents, setTeamEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    console.log("🗓️ PlayerPlanningView loading...", { teamId, playerId });
    fetchEvents();
  }, [teamId, playerId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Charger les événements d'équipe
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId);

      if (eventsError) {
        console.error("Error fetching team events:", eventsError);
        throw eventsError;
      }
      
      setTeamEvents(events || []);

      // Charger les événements personnels du joueur depuis la base de données
      const { data: personalEventsData, error: personalError } = await supabase
        .from("player_personal_events")
        .select("*")
        .eq("team_id", teamId)
        .eq("player_id", playerId);

      if (personalError) {
        console.error("Error fetching personal events:", personalError);
        throw personalError;
      }

      console.log("📅 Personal events loaded:", personalEventsData);
      setPersonalEvents(personalEventsData || []);
      console.log("✅ Events loaded successfully");
      
    } catch (error: any) {
      console.error("❌ Error loading events:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le planning",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const teamEventsForDate = teamEvents.filter(event => 
      isSameDay(new Date(event.date_debut), date)
    ).map(event => ({
      ...event,
      isTeamEvent: true
    }));
    
    const personalEventsForDate = personalEvents.filter(event => 
      isSameDay(new Date(event.date_start), date)
    ).map(event => ({
      ...event,
      isPersonalEvent: true
    }));
    
    return [...teamEventsForDate, ...personalEventsForDate];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-primary rounded-lg mx-auto animate-pulse"></div>
          <p>Chargement du planning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mon Planning</h2>
          <p className="text-muted-foreground">Organisez votre entraînement personnel</p>
        </div>
      </div>

      {/* Calendrier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Calendrier</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Calendrier - aligné à gauche, plus grand */}
            <div className="flex-shrink-0 pb-4">
              <ShadcnCalendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-auto scale-110 origin-top-left"
                locale={fr}
              />
            </div>

            {/* Événements du jour - à droite, espace réduit */}
            <div className="flex-1 ml-4">
              <h3 className="font-semibold text-lg mb-4">
                {format(selectedDate, "EEEE d MMMM", { locale: fr })}
              </h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div key={event.id || index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{event.title || event.titre}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.isTeamEvent ? 'Équipe' : (event.type || 'Personnel')}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {event.isTeamEvent 
                          ? `${new Date(event.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                          : `${new Date(event.date_start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.date_end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                        }
                      </span>
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun événement prévu pour cette date
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entraînements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Mes Entraînements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge variant="secondary">{event.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(event.date_start).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};