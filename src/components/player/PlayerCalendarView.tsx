import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PlayerCalendarViewProps {
  teamId: string;
  playerId: string;
}

interface Event {
  id: string;
  titre: string;
  description?: string;
  type: string;
  date_debut: string;
  date_fin: string;
  map_name?: string;
}

export const PlayerCalendarView = ({ teamId, playerId }: PlayerCalendarViewProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchPlayerEvents();
    }
  }, [teamId]);

  const fetchPlayerEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .gte("date_debut", new Date().toISOString())
        .order("date_debut", { ascending: true })
        .limit(10);

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos événements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "coaching":
      case "session_individuelle":
        return <Target className="w-4 h-4" />;
      case "match":
        return <Users className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "coaching":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "session_individuelle":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "match":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "scrim":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "coaching":
        return "Coaching";
      case "session_individuelle":
        return "Session individuelle";
      case "match":
        return "Match";
      case "scrim":
        return "Scrim";
      case "tournoi":
        return "Tournoi";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement de votre calendrier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Mon Calendrier</h2>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun événement à venir</h3>
            <p className="text-muted-foreground">
              Votre calendrier est vide pour le moment. Les prochains entraînements et matchs apparaîtront ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {getEventTypeIcon(event.type)}
                    <span>{event.titre}</span>
                  </CardTitle>
                  <Badge className={getEventTypeColor(event.type)}>
                    {getEventTypeLabel(event.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(event.date_debut), "PPP 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {event.map_name && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.map_name}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      Durée: {Math.round((new Date(event.date_fin).getTime() - new Date(event.date_debut).getTime()) / (1000 * 60))} min
                    </div>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};