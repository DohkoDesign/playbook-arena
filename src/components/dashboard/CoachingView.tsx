import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Plus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoachingViewProps {
  teamId: string;
}

export const CoachingView = ({ teamId }: CoachingViewProps) => {
  const [coachingSessions, setCoachingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchCoachingSessions();
    }
  }, [teamId]);

  const fetchCoachingSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select(`
          *,
          events (
            titre,
            date_debut,
            type
          )
        `)
        .eq("events.team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoachingSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les sessions de coaching",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold">Coaching & Review</h2>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle session
        </Button>
      </div>

      <div className="grid gap-4">
        {coachingSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Aucune session de coaching enregistrée. Les événements de type "scrim" et "match" apparaîtront ici automatiquement.
              </p>
            </CardContent>
          </Card>
        ) : (
          coachingSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {session.events?.titre || "Session de coaching"}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {session.events?.date_debut && 
                      new Date(session.events.date_debut).toLocaleDateString("fr-FR")
                    }
                  </span>
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
                    <p className="text-sm font-medium mb-1">Notes:</p>
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
                      <FileText className="w-4 h-4" />
                      <span>Composition disponible</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};