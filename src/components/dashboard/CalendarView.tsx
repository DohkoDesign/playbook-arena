import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventModal } from "./EventModal";

interface CalendarViewProps {
  teamId: string;
}

export const CalendarView = ({ teamId }: CalendarViewProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "scrim":
        return "border-l-blue-500";
      case "match":
        return "border-l-red-500";
      case "tournoi":
        return "border-l-purple-500";
      case "coaching":
        return "border-l-green-500";
      case "session_individuelle":
        return "border-l-orange-500";
      default:
        return "border-l-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des événements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Calendrier de l'équipe</h2>
        </div>
        <Button onClick={() => setShowEventModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Aucun événement planifié. Créez votre premier événement !
              </p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className={`border-l-4 ${getEventTypeColor(event.type)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{event.titre}</CardTitle>
                  <span className="text-sm text-muted-foreground capitalize">
                    {event.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.date_debut)}
                </p>
              </CardHeader>
              {event.description && (
                <CardContent>
                  <p className="text-sm">{event.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          teamId={teamId}
          onEventCreated={() => {
            fetchEvents();
            setShowEventModal(false);
          }}
        />
      )}
    </div>
  );
};