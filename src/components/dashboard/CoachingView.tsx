import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoachingSessionModal } from "./CoachingSessionModal";
import { CoachingSessionDetailsModal } from "./CoachingSessionDetailsModal";
import { CoachingEventCard } from "./CoachingEventCard";
import { CoachingSessionCard } from "./CoachingSessionCard";
import { VODAnalysisModal } from "./VODAnalysisModal";
import { getGameConfig } from "@/data/gameConfigs";

interface CoachingViewProps {
  teamId: string;
  gameType?: string;
  isPlayerView?: boolean;
  currentUserId?: string;
}

export const CoachingView = ({ teamId, gameType, isPlayerView = false, currentUserId }: CoachingViewProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVODAnalysisModal, setShowVODAnalysisModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { toast } = useToast();
  
  const gameConfig = gameType ? getGameConfig(gameType) : null;

  useEffect(() => {
    if (teamId) {
      fetchEventsAndSessions();
    }
  }, [teamId]);

  const fetchEventsAndSessions = async () => {
    try {
      setLoading(true);
      
      // Récupérer les événements de type scrim/match
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .in("type", ["scrim", "match", "tournoi"])
        .order("date_debut", { ascending: false });

      if (eventsError) throw eventsError;

      // Récupérer les sessions de coaching existantes
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

  const openSessionDetails = (session: any) => {
    setSelectedSession(session);
    if (isPlayerView && session?.vods && session.vods.length > 0) {
      setShowVODAnalysisModal(true);
    } else {
      setShowDetailsModal(true);
    }
  };

  const getSessionByEventId = (eventId: string) => {
    return coachingSessions.find(session => session.event_id === eventId);
  };

  const hasCoachingSession = (eventId: string) => {
    return !!getSessionByEventId(eventId);
  };

  const handleViewSessionFromEvent = (eventId: string) => {
    const session = getSessionByEventId(eventId);
    if (session) {
      openSessionDetails(session);
    }
  };

  const getAnalysisStats = () => {
    const totalEvents = events.length;
    const analyzedEvents = coachingSessions.length;
    const recentAnalyses = coachingSessions.filter(
      session => new Date(session.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return { totalEvents, analyzedEvents, recentAnalyses };
  };

  const stats = getAnalysisStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Video className="w-8 h-8 mx-auto animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">
                Coaching & Analyse {gameConfig && `- ${gameConfig.name}`}
              </h2>
              <p className="text-muted-foreground">
                {isPlayerView 
                  ? "Consultez les analyses et commentaires de vos coachs pour améliorer votre jeu"
                  : "Analysez vos performances et améliorez votre jeu"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Événements totaux</p>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Analyses créées</p>
                  <p className="text-2xl font-bold">{stats.analyzedEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Cette semaine</p>
                  <p className="text-2xl font-bold">{stats.recentAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className={`grid w-full ${isPlayerView ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Événements récents
            {events.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {events.length}
              </Badge>
            )}
          </TabsTrigger>
          {!isPlayerView && (
            <TabsTrigger value="analyses" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Analyses créées
              {coachingSessions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {coachingSessions.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Événements à analyser
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">
                      Aucun événement trouvé
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Les scrims, matchs et tournois apparaîtront ici automatiquement
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <CoachingEventCard
                      key={event.id}
                      event={event}
                      hasSession={hasCoachingSession(event.id)}
                      onAnalyze={() => openCoachingSession(event)}
                      onViewSession={() => handleViewSessionFromEvent(event.id)}
                      isPlayerView={isPlayerView}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {!isPlayerView && (
          <TabsContent value="analyses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sessions d'analyse
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coachingSessions.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <Video className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">
                        Aucune analyse créée
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Commencez par analyser vos premiers événements pour améliorer vos performances
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coachingSessions.map((session) => (
                      <CoachingSessionCard
                        key={session.id}
                        session={session}
                        onViewDetails={() => openSessionDetails(session)}
                        onEdit={() => openCoachingSession(session.events)}
                        isPlayerView={isPlayerView}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modales */}
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

      {showDetailsModal && selectedSession && (
        <CoachingSessionDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSession(null);
          }}
          session={selectedSession}
          onEdit={() => {
            setShowDetailsModal(false);
            openCoachingSession(selectedSession.events);
          }}
          isPlayerView={isPlayerView}
        />
      )}

      {showVODAnalysisModal && selectedSession && (
        <VODAnalysisModal
          isOpen={showVODAnalysisModal}
          onClose={() => {
            setShowVODAnalysisModal(false);
            setSelectedSession(null);
          }}
          session={selectedSession}
          teamId={teamId}
          currentUserId={currentUserId}
          isPlayerView={isPlayerView}
        />
      )}
    </div>
  );
};