import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Users, Trophy, Calendar, Eye, FileText, Target } from "lucide-react";

interface CoachingSessionCardProps {
  session: any;
  onViewDetails: () => void;
  onEdit?: () => void;
  isPlayerView?: boolean;
}

export const CoachingSessionCard = ({ 
  session, 
  onViewDetails, 
  onEdit,
  isPlayerView = false 
}: CoachingSessionCardProps) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "scrim":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300";
      case "match":
        return "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300";
      case "tournoi":
        return "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSessionHighlights = () => {
    const highlights = [];
    
    if (session.resultat) {
      highlights.push({
        icon: Target,
        label: "Résultat",
        value: session.resultat
      });
    }
    
    if (session.vods && Object.keys(session.vods).length > 0) {
      highlights.push({
        icon: Video,
        label: "VODs",
        value: `${Object.keys(session.vods).length} replay(s)`
      });
    }
    
    if (session.composition_equipe) {
      highlights.push({
        icon: Users,
        label: "Composition",
        value: "Équipe analysée"
      });
    }
    
    if (session.composition_adversaire) {
      highlights.push({
        icon: Trophy,
        label: "Adversaire",
        value: "Compo adverse"
      });
    }
    
    return highlights;
  };

  const highlights = getSessionHighlights();

  return (
    <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {session.events?.titre || "Session de coaching"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getEventTypeColor(session.events?.type || "coaching")}>
                {session.events?.type || "coaching"}
              </Badge>
              {session.events?.date_debut && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(session.events.date_debut)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onViewDetails} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Détails
            </Button>
            {!isPlayerView && onEdit && (
              <Button onClick={onEdit} variant="secondary" size="sm">
                <FileText className="w-4 h-4 mr-1" />
                Modifier
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Aperçu des notes */}
        {session.notes && (
          <div className="p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {session.notes}
            </p>
          </div>
        )}

        {/* Points clés */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div key={index} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                  <Icon className="w-3 h-3" />
                  <span className="font-medium">{highlight.label}:</span>
                  <span className="text-muted-foreground">{highlight.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-muted/50">
          <span>Créé le {formatDate(session.created_at)}</span>
          {session.updated_at !== session.created_at && (
            <span>Modifié le {formatDate(session.updated_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};