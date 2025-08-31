import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Clock, Calendar, CheckCircle, Eye } from "lucide-react";

interface CoachingEventCardProps {
  event: any;
  hasSession: boolean;
  onAnalyze?: () => void;
  onViewSession?: () => void;
  isPlayerView?: boolean;
}

export const CoachingEventCard = ({ 
  event, 
  hasSession, 
  onAnalyze, 
  onViewSession,
  isPlayerView = false 
}: CoachingEventCardProps) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "scrim":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300";
      case "match":
        return "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300";
      case "tournoi":
        return "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "scrim":
        return Users;
      case "match":
      case "tournoi":
        return Trophy;
      default:
        return Clock;
    }
  };

  const Icon = getEventIcon(event.type);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR"),
      time: date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(event.date_debut);

  return (
    <Card className={`transition-all hover:shadow-md ${hasSession ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : 'hover:border-muted-foreground/20'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* En-tête avec icône et titre */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-muted/50">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium truncate">{event.titre}</h4>
                {event.map_name && (
                  <p className="text-sm text-muted-foreground truncate">
                    {event.map_name}
                  </p>
                )}
              </div>
            </div>
            {hasSession && (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
          </div>

          {/* Badges et date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getEventTypeColor(event.type)}>
                {event.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{date}</span>
              <Clock className="w-3 h-3 ml-1" />
              <span>{time}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {hasSession && (
              <Button
                size="sm"
                variant="outline"
                onClick={onViewSession}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Voir l'analyse
              </Button>
            )}
            {!isPlayerView && (
              <Button
                size="sm"
                variant={hasSession ? "secondary" : "default"}
                onClick={onAnalyze}
                className="text-xs"
              >
                {hasSession ? "Modifier" : "Analyser"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};