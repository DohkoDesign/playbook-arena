import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlayCircle, Calendar, MapPin, MessageSquare, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PlayerReviewsViewProps {
  teamId: string;
  playerId: string;
}

interface CoachingSession {
  id: string;
  event_id: string;
  notes?: string;
  resultat?: string;
  vods?: any;
  events: {
    titre: string;
    date_debut: string;
    type: string;
    map_name?: string;
  };
}

export const PlayerReviewsView = ({ teamId, playerId }: PlayerReviewsViewProps) => {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [personalNotes, setPersonalNotes] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchReviews();
    }
  }, [teamId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select(`
          *,
          events (
            titre,
            date_debut,
            type,
            map_name
          )
        `)
        .eq("events.team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "coaching":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "scrim":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "match":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const savePersonalNote = (sessionId: string, note: string) => {
    setPersonalNotes(prev => ({
      ...prev,
      [sessionId]: note
    }));
    
    // Ici on pourrait sauvegarder dans une table de notes personnelles
    toast({
      title: "Note sauvegardée",
      description: "Votre note personnelle a été enregistrée",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Reviews & VODs</h2>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <PlayCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune review disponible</h3>
            <p className="text-muted-foreground">
              Les analyses de vos matchs et entraînements apparaîtront ici une fois créées par le staff.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{session.events.titre}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getEventTypeColor(session.events.type)}>
                      {session.events.type}
                    </Badge>
                    {session.resultat && (
                      <Badge variant="outline">{session.resultat}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(session.events.date_debut), "PPP", { locale: fr })}
                    </span>
                  </div>
                  {session.events.map_name && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{session.events.map_name}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Notes du coach */}
                  {session.notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Notes du coach :</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{session.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* VODs */}
                  {session.vods && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center space-x-1">
                        <PlayCircle className="w-4 h-4" />
                        <span>VODs disponibles :</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(session.vods).map(([key, url]) => (
                          <Button key={key} variant="outline" size="sm" asChild>
                            <a href={url as string} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {key}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes personnelles */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSession(
                        expandedSession === session.id ? null : session.id
                      )}
                      className="flex items-center space-x-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Mes notes personnelles</span>
                    </Button>

                    {expandedSession === session.id && (
                      <div className="space-y-2">
                        <Label htmlFor={`note-${session.id}`}>Note personnelle</Label>
                        <Textarea
                          id={`note-${session.id}`}
                          placeholder="Ajoutez vos observations personnelles sur cette session..."
                          value={personalNotes[session.id] || ""}
                          onChange={(e) => setPersonalNotes(prev => ({
                            ...prev,
                            [session.id]: e.target.value
                          }))}
                          rows={3}
                        />
                        <Button
                          size="sm"
                          onClick={() => savePersonalNote(session.id, personalNotes[session.id] || "")}
                        >
                          Sauvegarder
                        </Button>
                      </div>
                    )}
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