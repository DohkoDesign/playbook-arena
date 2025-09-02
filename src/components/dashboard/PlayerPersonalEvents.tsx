import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Target, BookOpen, User, Plus, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlayerEventModal } from "./PlayerEventModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PlayerPersonalEventsProps {
  teamId: string;
  playerId: string;
  playerName: string;
}

interface PersonalEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  date_start: string;
  date_end: string;
  created_at: string;
}

export const PlayerPersonalEvents = ({ teamId, playerId, playerName }: PlayerPersonalEventsProps) => {
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<PersonalEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonalEvents();
  }, [teamId, playerId]);

  const fetchPersonalEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("player_personal_events")
        .select("*")
        .eq("team_id", teamId)
        .eq("player_id", playerId)
        .order("date_start", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des événements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements personnels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("player_personal_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });

      fetchPersonalEvents();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    }
    setEventToDelete(null);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "training":
        return <Target className="w-4 h-4" />;
      case "review":
        return <BookOpen className="w-4 h-4" />;
      case "coaching":
        return <User className="w-4 h-4" />;
      case "fitness":
        return <Clock className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "training":
        return "Entraînement";
      case "review":
        return "Révision VOD";
      case "coaching":
        return "Coaching";
      case "fitness":
        return "Préparation physique";
      default:
        return type;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "training":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "review":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "coaching":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "fitness":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime.getTime() - startTime.getTime();
    return Math.round(durationMs / (1000 * 60)); // en minutes
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des événements personnels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Événements personnels</h3>
        </div>
        <Button onClick={() => setShowEventModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un événement
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun événement personnel</h3>
            <p className="text-muted-foreground mb-4">
              Créez des événements personnalisés pour ce joueur : entraînements, sessions de coaching, révision de VODs...
            </p>
            <Button onClick={() => setShowEventModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer le premier événement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getEventTypeIcon(event.type)}
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </div>
                  <Badge className={getEventTypeColor(event.type)}>
                    {getEventTypeLabel(event.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {format(new Date(event.date_start), "PPP", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(event.date_start), "HH:mm")} - {format(new Date(event.date_end), "HH:mm")}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Durée: {calculateDuration(event.date_start, event.date_end)} minutes
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Créé le {format(new Date(event.created_at), "dd/MM/yyyy", { locale: fr })}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEventToDelete(event)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de création d'événement */}
      <PlayerEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        teamId={teamId}
        playerId={playerId}
        playerName={playerName}
        onEventCreated={fetchPersonalEvents}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete?.title}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToDelete && deleteEvent(eventToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};