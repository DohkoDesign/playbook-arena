import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Plus, FileText, Upload, Users, Trophy, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoachingSessionModal } from "./CoachingSessionModal";
import { getGameConfig } from "@/data/gameConfigs";

interface CoachingViewProps {
  teamId: string;
  gameType?: string;
}

export const CoachingView = ({ teamId, gameType }: CoachingViewProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const { toast } = useToast();
  
  const gameConfig = gameType ? getGameConfig(gameType) : null;

  useEffect(() => {
    if (teamId) {
      fetchEventsAndSessions();
      fetchTeamData();
    }
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      const { data: team, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;
      setTeamData(team);
    } catch (error: any) {
      console.error("Error fetching team:", error);
    }
  };

  const fetchEventsAndSessions = async () => {
    try {
      // Récupérer les événements de type scrim/match
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .in("type", ["scrim", "match", "tournoi"])
        .order("date_debut", { ascending: false });

      if (eventsError) throw eventsError;

      // Récupérer les sessions de coaching existantes (filtrées par équipe)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("coaching_sessions")
        .select(`
          *,
          events!inner (
            id,
            titre,
            date_debut,
            type,
            team_id
          )
        `)
        .eq("events.team_id", teamId)
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      setEvents(eventsData || []);
      setCoachingSessions(sessionsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de coaching",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCoachingSession = (event: any) => {
    setSelectedEvent(event);
    setShowSessionModal(true);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "scrim":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "match":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "tournoi":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "scrim":
        return Users;
      case "match":
        return Trophy;
      case "tournoi":
        return Trophy;
      default:
        return FileText;
    }
  };

  const hasCoachingSession = (eventId: string) => {
    return coachingSessions.some(session => session.event_id === eventId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des sessions de coaching...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Video className="w-5 h-5" />
          <h2 className="text-2xl font-bold">
            Coaching & Review {gameConfig && `- ${gameConfig.name}`}
          </h2>
        </div>
      </div>

      {/* Événements à analyser */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Événements récents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun événement trouvé. Les scrims et matchs apparaîtront ici automatiquement.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {events.slice(0, 6).map((event) => {
                const Icon = getEventIcon(event.type);
                const hasSession = hasCoachingSession(event.id);
                
                return (
                  <Card key={event.id} className={`border ${hasSession ? 'border-green-200 bg-green-50 dark:bg-green-950' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <h4 className="font-medium truncate">{event.titre}</h4>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.date_debut).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={hasSession ? "secondary" : "default"}
                          onClick={() => openCoachingSession(event)}
                        >
                          {hasSession ? "Modifier" : "Analyser"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions de coaching existantes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Sessions d'analyse</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coachingSessions.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <Video className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">
                  Aucune session d'analyse créée
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Analysez vos scrims et matchs pour améliorer les performances de l'équipe
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {coachingSessions.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {session.events?.titre || "Session de coaching"}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {session.events?.type || "coaching"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {session.events?.date_debut && 
                            new Date(session.events.date_debut).toLocaleDateString("fr-FR")
                          }
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {session.resultat && (
                      <div>
                        <p className="text-sm font-medium mb-1">Résultat:</p>
                        <p className="text-sm text-muted-foreground">{session.resultat}</p>
                      </div>
                    )}

                    {session.notes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Notes d'analyse:</p>
                        <p className="text-sm text-muted-foreground">{session.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {session.vods && Object.keys(session.vods).length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Video className="w-4 h-4" />
                          <span>{Object.keys(session.vods).length} VOD(s)</span>
                        </div>
                      )}
                      
                      {session.composition_equipe && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Composition équipe</span>
                        </div>
                      )}

                      {session.composition_adversaire && (
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4" />
                          <span>Composition adversaire</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de session de coaching */}
      {showSessionModal && selectedEvent && (
        <CoachingSessionModal
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          gameConfig={gameConfig}
          onSessionUpdated={() => {
            fetchEventsAndSessions();
            setShowSessionModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};