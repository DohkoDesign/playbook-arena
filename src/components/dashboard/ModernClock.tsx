import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  titre: string;
  type: string;
  date_debut: string;
  date_fin: string;
  map_name?: string;
}

interface ModernClockProps {
  teamId?: string;
  gameType?: string;
}

export const ModernClock = ({ teamId, gameType }: ModernClockProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (teamId) {
      fetchNextEvent();
      const interval = setInterval(fetchNextEvent, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [teamId]);

  const fetchNextEvent = async () => {
    if (!teamId) return;

    try {
      const now = new Date().toISOString();
      
      // Check for live events
      const { data: liveEvents } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .lte("date_debut", now)
        .gte("date_fin", now)
        .order("date_debut", { ascending: true })
        .limit(1);

      if (liveEvents && liveEvents.length > 0) {
        setNextEvent(liveEvents[0]);
        setIsLive(true);
        return;
      }

      // Get next upcoming event
      const { data: upcomingEvents } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .gt("date_debut", now)
        .order("date_debut", { ascending: true })
        .limit(1);

      if (upcomingEvents && upcomingEvents.length > 0) {
        setNextEvent(upcomingEvents[0]);
        setIsLive(false);
      } else {
        setNextEvent(null);
        setIsLive(false);
      }
    } catch (error) {
      console.error("Error fetching next event:", error);
    }
  };

  const getTimeUntilEvent = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event.getTime() - now.getTime();

    if (diff <= 0) return "Maintenant";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "scrim":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "match":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "tournoi":
        return "bg-primary/10 text-primary border-primary/20";
      case "coaching":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "session_individuelle":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/40 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Current Time Display */}
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-foreground tracking-wider">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Live Event or Next Event */}
          {nextEvent && (
            <>
              <div className="border-t border-border/20 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {isLive ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-red-600">EN DIRECT</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Prochain</span>
                      </>
                    )}
                  </div>
                  {!isLive && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {getTimeUntilEvent(nextEvent.date_debut)}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {nextEvent.titre}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getEventTypeColor(nextEvent.type)}`}>
                      {nextEvent.type}
                    </Badge>
                    {nextEvent.map_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {nextEvent.map_name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {isLive ? (
                      `Jusqu'à ${new Date(nextEvent.date_fin).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}`
                    ) : (
                      new Date(nextEvent.date_debut).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quick Stats */}
          <div className="border-t border-border/20 pt-2">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{currentTime.getDate()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>S{Math.ceil(currentTime.getDate() / 7)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};