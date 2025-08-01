import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Video, Users, Trophy, Calendar, FileText, Target, TrendingUp, AlertCircle } from "lucide-react";

interface CoachingSessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onEdit?: () => void;
  isPlayerView?: boolean;
}

export const CoachingSessionDetailsModal = ({ 
  isOpen, 
  onClose, 
  session, 
  onEdit,
  isPlayerView = false 
}: CoachingSessionDetailsModalProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComposition = (composition: any, title: string, icon: React.ReactNode) => {
    if (!composition || Object.keys(composition).length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(composition).map(([role, player]: [string, any]) => (
            <div key={role} className="flex justify-between items-center py-1">
              <span className="font-medium capitalize">{role}</span>
              <span className="text-muted-foreground">{player}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderVods = (vods: any) => {
    if (!vods || Object.keys(vods).length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="w-4 h-4" />
            VODs et Replays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(vods).map(([key, url]: [string, any]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="font-medium">{key}</span>
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Voir
                </a>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Analyse : {session.events?.titre || "Session de coaching"}
            </DialogTitle>
            {!isPlayerView && onEdit && (
              <Button onClick={onEdit} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête de la session */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getEventTypeColor(session.events?.type || "coaching")}>
                {session.events?.type || "coaching"}
              </Badge>
              {session.events?.date_debut && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDate(session.events.date_debut)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Résultat */}
          {session.resultat && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Résultat du Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-center p-4 bg-muted/50 rounded-lg">
                  {session.resultat}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes d'analyse */}
          {session.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Notes d'Analyse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {session.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compositions */}
          <div className="grid md:grid-cols-2 gap-4">
            {renderComposition(
              session.composition_equipe,
              "Composition de l'équipe",
              <Users className="w-4 h-4" />
            )}
            {renderComposition(
              session.composition_adversaire,
              "Composition adverse",
              <Trophy className="w-4 h-4" />
            )}
          </div>

          {/* VODs */}
          {renderVods(session.vods)}

          {/* Métadonnées */}
          <Card className="border-muted">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>Créé le {new Date(session.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
                {session.updated_at !== session.created_at && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Modifié le {new Date(session.updated_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};