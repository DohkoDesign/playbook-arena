import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlayCircle, 
  Clock, 
  Users, 
  Filter,
  Share,
  Download,
  Eye,
  Calendar,
  Tag,
  Video,
  FileText,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { YouTubePlayer } from "./vod/YouTubePlayer";
import { TimestampManager } from "./vod/TimestampManager";
import { CoachingNotes } from "./vod/CoachingNotes";
import { VODFilters } from "./vod/VODFilters";
import { VODShare } from "./vod/VODShare";

interface VODReviewViewProps {
  teamId: string;
  gameType: string;
}

interface VODSession {
  id: string;
  event_id: string;
  vods: any[];
  created_at: string;
  events: {
    titre: string;
    type: string;
    date_debut: string;
    map_name?: string;
  };
}

interface ReviewSession {
  id?: string;
  vod_id: string;
  coach_id: string;
  notes: string;
  timestamps: any[];
  created_at?: string;
  updated_at?: string;
}

export const VODReviewView = ({ teamId, gameType }: VODReviewViewProps) => {
  const [vodSessions, setVodSessions] = useState<VODSession[]>([]);
  const [selectedVOD, setSelectedVOD] = useState<VODSession | null>(null);
  const [currentReview, setCurrentReview] = useState<ReviewSession | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: "all",
    player: "all",
    tag: "all"
  });
  const [loading, setLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVODSessions();
  }, [teamId, filters]);

  const loadVODSessions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("coaching_sessions")
        .select(`
          id,
          event_id,
          vods,
          created_at,
          events:event_id (
            titre,
            type,
            date_debut,
            map_name
          )
        `)
        .eq("events.team_id", teamId)
        .not("vods", "is", null)
        .order("created_at", { ascending: false });

      // Appliquer les filtres
      if (filters.type !== "all") {
        query = query.eq("events.type", filters.type as any);
      }

      if (filters.dateRange !== "all") {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.dateRange) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "3months":
            startDate.setMonth(now.getMonth() - 3);
            break;
        }
        
        query = query.gte("events.date_debut", startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrer seulement les sessions avec des VODs valides
      const validVODs = (data || []).filter(session => 
        session.vods && 
        Array.isArray(session.vods) && 
        session.vods.length > 0 &&
        session.vods.some((vod: any) => vod.url)
      ).map(session => ({
        ...session,
        event: session.events // Mapper events vers event pour compatibilité
      }));

      setVodSessions(validVODs as any);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les VODs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReviewSession = async (vodId: string) => {
    try {
      // Simuler le chargement pour le moment, car la table n'est pas encore typée
      console.log("Loading review session for VOD:", vodId);
      
      // Créer une nouvelle session de review
      setCurrentReview({
        vod_id: vodId,
        coach_id: "current-user-id", // À remplacer par l'ID utilisateur réel
        notes: "",
        timestamps: []
      });
    } catch (error) {
      console.error("Error loading review session:", error);
    }
  };

  const saveReviewSession = async (reviewData: Partial<ReviewSession>) => {
    if (!currentReview) return;

    try {
      const updatedReview = { ...currentReview, ...reviewData };
      setCurrentReview(updatedReview);

      console.log("Saving review session:", updatedReview);

      toast({
        title: "Review sauvegardée",
        description: "Vos annotations ont été enregistrées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const filteredVODs = vodSessions.filter(vod => {
    if (filters.tag !== "all") {
      const eventType = vod.events?.type || "";
      if (filters.tag === "scrim" && eventType !== "scrim") return false;
      if (filters.tag === "officiel" && !["match", "tournoi"].includes(eventType)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Review VOD</h2>
          <p className="text-muted-foreground">
            Analysez et annotez les VODs de votre équipe
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedVOD && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowShare(true)}
                className="flex items-center space-x-2"
              >
                <Share className="w-4 h-4" />
                <span>Partager</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (currentReview) {
                    const exportData = {
                      vod: selectedVOD,
                      review: currentReview,
                      exportedAt: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], 
                      { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `review-${selectedVOD.events?.titre}-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtres */}
      <VODFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        teamId={teamId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des VODs */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>VODs Disponibles ({filteredVODs.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredVODs.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune VOD disponible</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les VODs apparaîtront après validation des matchs
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVODs.map((vod) => (
                    <Card 
                      key={vod.id} 
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedVOD?.id === vod.id ? 'bg-accent border-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedVOD(vod);
                        loadReviewSession(vod.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <PlayCircle className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {vod.events?.titre}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {vod.events?.type}
                              </Badge>
                              {vod.events?.map_name && (
                                <Badge variant="secondary" className="text-xs">
                                  {vod.events.map_name}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(vod.events?.date_debut).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              <span>{vod.vods?.length || 0} VOD(s)</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Zone principale */}
        <div className="lg:col-span-2">
          {selectedVOD ? (
            <div className="space-y-6">
              {/* Lecteur YouTube */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlayCircle className="w-5 h-5" />
                      <span>{selectedVOD.events?.titre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {selectedVOD.events?.type}
                      </Badge>
                      {selectedVOD.events?.map_name && (
                        <Badge variant="secondary">
                          {selectedVOD.events.map_name}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVOD.vods && selectedVOD.vods.length > 0 && (
                    <YouTubePlayer 
                      videoId={getYouTubeVideoId(selectedVOD.vods[0].url) || ""}
                      onTimeUpdate={(time) => {
                        // Optionnel : callback pour mise à jour du timestamp
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Outils de coaching */}
              <Tabs defaultValue="timestamps" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="timestamps" className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Timestamps</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Notes Coach</span>
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Feedback</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timestamps" className="mt-6">
                  <TimestampManager 
                    timestamps={currentReview?.timestamps || []}
                    onTimestampsChange={(timestamps) => {
                      if (currentReview) {
                        const updated = { ...currentReview, timestamps };
                        setCurrentReview(updated);
                        saveReviewSession({ timestamps });
                      }
                    }}
                    teamId={teamId}
                  />
                </TabsContent>

                <TabsContent value="notes" className="mt-6">
                  <CoachingNotes 
                    notes={currentReview?.notes || ""}
                    onNotesChange={(notes) => {
                      if (currentReview) {
                        const updated = { ...currentReview, notes };
                        setCurrentReview(updated);
                        saveReviewSession({ notes });
                      }
                    }}
                  />
                </TabsContent>

                <TabsContent value="feedback" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Feedback Équipe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Fonctionnalité de feedback collaborative à venir...
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Sélectionnez une VOD
                </h3>
                <p className="text-muted-foreground">
                  Choisissez une VOD dans la liste pour commencer l'analyse
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de partage */}
      {showShare && selectedVOD && currentReview && (
        <VODShare 
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          vod={selectedVOD}
          review={currentReview}
          teamId={teamId}
        />
      )}
    </div>
  );
};