import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlayCircle, 
  Clock, 
  Users, 
  Filter,
  Eye,
  Calendar,
  Tag,
  Video,
  FileText,
  MessageSquare,
  ChevronDown,
  Maximize,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { YouTubePlayer } from "./vod/YouTubePlayer";
import { TimestampManager } from "./vod/TimestampManager";
import { CoachingNotes } from "./vod/CoachingNotes";
import { FullscreenVideoPlayer } from "./vod/FullscreenVideoPlayer";
import { useFullscreenVideo } from "@/hooks/useFullscreenVideo";
import { VODFilters } from "./vod/VODFilters";

import { MarkerModal } from "./vod/MarkerModal";

interface VODReviewViewProps {
  teamId: string;
  gameType: string;
}

interface Timestamp {
  id: string;
  time: number;
  comment: string;
  type: "important" | "error" | "success" | "strategy" | "player-specific";
  player?: string;
  category?: string;
  created_at: string;
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
  timestamps: Timestamp[];
  created_at?: string;
  updated_at?: string;
}

export const VODReviewView = ({ teamId, gameType }: VODReviewViewProps) => {
  const [vodSessions, setVodSessions] = useState<VODSession[]>([]);
  const [selectedVOD, setSelectedVOD] = useState<VODSession | null>(null);
  const [selectedVODIndex, setSelectedVODIndex] = useState<number>(0);
  const [currentReview, setCurrentReview] = useState<ReviewSession | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: "all",
    player: "all",
    tag: "all"
  });
  const [loading, setLoading] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPlayerTime, setCurrentPlayerTime] = useState(0);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const { toast } = useToast();

  // Fonction utilitaire pour obtenir la VOD courante
  const getCurrentVOD = () => {
    if (!selectedVOD || !selectedVOD.vods || selectedVOD.vods.length === 0) return null;
    return selectedVOD.vods[selectedVODIndex] || selectedVOD.vods[0];
  };

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
          events!inner (
            titre,
            type,
            date_debut,
            map_name,
            team_id
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Charger une review existante ou créer une nouvelle
      try {
        // @ts-ignore - Évite l'erreur TypeScript avec les types Supabase complexes
        const response: any = await supabase
          .from("vod_reviews")
          .select("*")
          .eq("vod_id", vodId)
          .eq("coach_id", user.user.id)
          .eq("team_id", teamId)
          .maybeSingle();

        const existingReview = response.data;

        if (existingReview) {
          // Parser les timestamps depuis Json vers Timestamp[]
          let timestamps: Timestamp[] = [];
          try {
            if (typeof existingReview.timestamps === 'string') {
              timestamps = JSON.parse(existingReview.timestamps);
            } else if (Array.isArray(existingReview.timestamps)) {
              timestamps = existingReview.timestamps as unknown as Timestamp[];
            }
          } catch (e) {
            console.error("Error parsing timestamps:", e);
            timestamps = [];
          }
          
          setCurrentReview({
            ...existingReview,
            timestamps
          });
        } else {
          // Créer une nouvelle session de review
          setCurrentReview({
            vod_id: vodId,
            coach_id: user.user.id,
            notes: "",
            timestamps: []
          });
        }
      } catch (supabaseError) {
        console.error("Supabase query error:", supabaseError);
        // Fallback - créer une nouvelle session
        setCurrentReview({
          vod_id: vodId,
          coach_id: user.user.id,
          notes: "",
          timestamps: []
        });
      }
    } catch (error) {
      console.error("Error loading review session:", error);
      // Créer une session par défaut en cas d'erreur
      setCurrentReview({
        vod_id: vodId,
        coach_id: "fallback",
        notes: "",
        timestamps: []
      });
    }
  };

  const saveReviewSession = async (reviewData: Partial<ReviewSession>) => {
    if (!currentReview) return;

    try {
      const updatedReview = { ...currentReview, ...reviewData };
      setCurrentReview(updatedReview);

      // Sauvegarde automatique en base de données
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const reviewToSave = {
        vod_id: updatedReview.vod_id,
        vod_url: selectedVOD?.vods?.[selectedVODIndex]?.url || getCurrentVOD()?.url,
        session_id: selectedVOD?.id,
        coach_id: user.user.id,
        team_id: teamId,
        notes: updatedReview.notes || "",
        timestamps: JSON.stringify(updatedReview.timestamps || []) as any,
        updated_at: new Date().toISOString()
      };

      if (updatedReview.id) {
        // Mise à jour
        await supabase
          .from("vod_reviews")
          .update(reviewToSave)
          .eq("id", updatedReview.id);
      } else {
        // Création
        const { data } = await supabase
          .from("vod_reviews")
          .insert(reviewToSave)
          .select()
          .single();
        
        if (data) {
          setCurrentReview({ ...updatedReview, id: data.id });
        }
      }

      // Toast plus discret pour l'auto-save
      if (Math.random() < 0.1) { // Seulement 10% du temps pour éviter le spam
        toast({
          title: "💾 Sauvegardé",
          description: "Annotations sauvegardées automatiquement",
        });
      }
    } catch (error: any) {
      console.error("Auto-save error:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder automatiquement",
        variant: "destructive",
      });
    }
  };

  const getYouTubeVideoId = (url: string | undefined | null): string | null => {
    if (!url || typeof url !== 'string') {
      return null;
    }
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

  const handleAddTimestamp = (time: number) => {
    // Mettre en pause la vidéo si elle joue encore
    if (youtubePlayer) {
      const playerState = youtubePlayer.getPlayerState();
      if (playerState === 1) { // 1 = playing
        youtubePlayer.pauseVideo();
      }
      // Récupérer le temps exact du lecteur au moment du clic
      const exactTime = youtubePlayer.getCurrentTime();
      setCurrentPlayerTime(exactTime);
      setShowMarkerModal(true);
    } else {
      // Fallback si le player n'est pas disponible
      setCurrentPlayerTime(time);
      setShowMarkerModal(true);
    }
  };

  // Hook pour le plein écran (après les déclarations des fonctions)
  const fullscreenVideo = useFullscreenVideo({
    videoId: getYouTubeVideoId(getCurrentVOD()?.url) || "",
    timestamps: currentReview?.timestamps || [],
    isPlayerView: false,
    onAddTimestamp: handleAddTimestamp
  });

  const handleSaveMarker = (markerData: any) => {
    const timestamp: Timestamp = {
      id: Date.now().toString(),
      time: markerData.time,
      comment: `${markerData.title}: ${markerData.description}`,
      type: markerData.type,
      player: markerData.player,
      category: markerData.category,
      created_at: new Date().toISOString()
    };

    if (currentReview) {
      const updatedTimestamps = [...(currentReview.timestamps || []), timestamp].sort((a, b) => a.time - b.time);
      const updated = { ...currentReview, timestamps: updatedTimestamps };
      setCurrentReview(updated);
      saveReviewSession({ timestamps: updatedTimestamps });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Analyse VOD
          </h2>
          <p className="text-muted-foreground">
            Analysez et annotez les VODs de votre équipe avec des outils professionnels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedVOD && (
            <div className="text-sm text-muted-foreground">
              💾 Sauvegarde automatique active
            </div>
          )}
        </div>
      </div>

      {/* Sélecteur de match avec dropdown */}
      {filteredVODs.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Sélection de Match</h3>
                  <p className="text-muted-foreground">
                    Choisissez un match pour commencer l'analyse VOD
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select 
                  value={selectedVOD?.id || ""} 
                  onValueChange={(value) => {
                    const vod = filteredVODs.find(v => v.id === value);
                    if (vod) {
                      setSelectedVOD(vod);
                      setSelectedVODIndex(0);
                      loadReviewSession(vod.id);
                    }
                  }}
                >
                  <SelectTrigger className="w-80 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Sélectionner un match à analyser" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVODs.map((vod) => (
                      <SelectItem key={vod.id} value={vod.id}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{vod.events?.titre}</span>
                          <Badge variant="outline" className="text-xs">
                            {vod.events?.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {vod.vods?.length || 0} VOD(s)
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                >
                  <Video className="w-4 h-4 mr-2" />
                  VODs Disponibles ({filteredVODs.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone principale */}
      {selectedVOD ? (
        <div className="space-y-6">
          {/* Sélecteur de VOD et lecteur */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg">{selectedVOD.events?.titre}</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(selectedVOD.events?.date_debut).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {selectedVOD.vods && selectedVOD.vods.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">VOD:</span>
                      <Select 
                        value={selectedVODIndex.toString()} 
                        onValueChange={(value) => setSelectedVODIndex(parseInt(value))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedVOD.vods.map((vod, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {vod.title || vod.player || `VOD ${index + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  
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
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {getCurrentVOD() && (
                <div className="relative">
                  {/* Bouton plein écran */}
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={fullscreenVideo.openFullscreen}
                      className="bg-black/70 hover:bg-black/90 text-white border-0"
                    >
                      <Maximize className="w-4 h-4 mr-1" />
                      Plein Écran
                    </Button>
                  </div>

                  {/* Lecteur avec double-clic pour plein écran */}
                  <div 
                    onDoubleClick={fullscreenVideo.openFullscreen}
                    className="cursor-pointer"
                    title="Double-cliquez pour passer en plein écran"
                  >
                    <YouTubePlayer 
                      videoId={getYouTubeVideoId(getCurrentVOD()?.url) || ""}
                      onTimeUpdate={(time) => {
                        setCurrentPlayerTime(time);
                      }}
                      onSeekTo={(time) => {
                        setCurrentPlayerTime(time);
                      }}
                      onAddTimestamp={handleAddTimestamp}
                      timestamps={currentReview?.timestamps || []}
                      onPlayerReady={(playerInstance) => setYoutubePlayer(playerInstance)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outils d'analyse améliorés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Outils d'Analyse Avancés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="timestamps" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="timestamps" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Marqueurs Temporels</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Notes Stratégiques</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timestamps" className="mt-6">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Marqueurs Temporels Intelligents</h4>
                    <p className="text-sm text-muted-foreground">
                      Créez des marqueurs précis avec catégorisation automatique et annotations contextuelles
                    </p>
                  </div>
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
                    onJumpToTime={(time) => {
                      // La navigation se fait maintenant directement via le YouTubePlayer
                      setCurrentPlayerTime(time);
                    }}
                  />
                </TabsContent>

                <TabsContent value="notes" className="mt-6">
                  <div className="bg-gradient-to-r from-secondary/5 to-primary/5 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Notes Stratégiques Avancées</h4>
                    <p className="text-sm text-muted-foreground">
                      Analysez les décisions tactiques, positioning et synergies d'équipe
                    </p>
                  </div>
                  <CoachingNotes 
                    notes={currentReview?.notes || ""}
                    onNotesChange={(notes) => {
                      if (currentReview) {
                        const updated = { ...currentReview, notes };
                        setCurrentReview(updated);
                        // Ne plus sauvegarder automatiquement ici
                      }
                    }}
                    onSave={() => {
                      // Sauvegarder seulement quand on clique sur le bouton
                      if (currentReview) {
                        saveReviewSession({ notes: currentReview.notes });
                      }
                    }}
                  />
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="h-96 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center">
            <div className="p-6 rounded-full bg-primary/10 mx-auto mb-6 w-fit">
              <Video className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Prêt pour l'Analyse VOD
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sélectionnez un match dans le menu déroulant ci-dessus pour commencer l'analyse 
              avec nos outils professionnels de coaching
            </p>
          </div>
        </Card>
      )}

      {/* Marker Modal */}
      <MarkerModal
        isOpen={showMarkerModal}
        onClose={() => setShowMarkerModal(false)}
        onSave={handleSaveMarker}
        currentTime={currentPlayerTime}
      />

      {/* Player plein écran */}
      {fullscreenVideo.isFullscreen && (
        <FullscreenVideoPlayer {...fullscreenVideo.fullscreenProps} />
      )}
    </div>
  );
};