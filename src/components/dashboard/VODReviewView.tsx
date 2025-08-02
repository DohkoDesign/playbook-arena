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
  Share,
  Download,
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
  const [selectedVODIndex, setSelectedVODIndex] = useState<number>(0);
  const [currentReview, setCurrentReview] = useState<ReviewSession | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: "all",
    player: "all",
    tag: "all"
  });
  const [loading, setLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPlayerTime, setCurrentPlayerTime] = useState(0);
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

  const [playerRef, setPlayerRef] = useState<any>(null);
  const getCurrentVOD = () => {
    if (!selectedVOD || !selectedVOD.vods || selectedVOD.vods.length === 0) return null;
    return selectedVOD.vods[selectedVODIndex] || selectedVOD.vods[0];
  };

  if (isFullscreen && selectedVOD && getCurrentVOD()) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Header pleine page */}
        <div className="bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-sm border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="text-white hover:bg-white/10"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-white">{selectedVOD.events?.titre}</h2>
              <p className="text-sm text-white/70">{getCurrentVOD()?.title || getCurrentVOD()?.player || 'VOD'}</p>
            </div>
          </div>
          
          {selectedVOD.vods.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white/70">VOD:</span>
              <Select 
                value={selectedVODIndex.toString()} 
                onValueChange={(value) => setSelectedVODIndex(parseInt(value))}
              >
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
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
        </div>

        {/* Lecteur pleine page */}
        <div className="flex-1 flex">
          <div className="flex-1 bg-black">
            <div className="w-full h-full">
              <YouTubePlayer 
                videoId={getYouTubeVideoId(getCurrentVOD()?.url) || ""}
                onTimeUpdate={(time) => {
                  // Callback pour mise à jour du timestamp
                }}
              />
            </div>
          </div>
          
          {/* Panel d'annotations latéral */}
          <div className="w-96 bg-background border-l flex flex-col max-h-screen">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Annotations en Direct</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <Tabs defaultValue="timestamps" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="timestamps" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Timestamps
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timestamps" className="mt-4">
                  <div className="space-y-2">
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
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <div className="space-y-2">
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
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center space-x-2"
                  >
                    <Maximize className="w-4 h-4" />
                    <span>Plein Écran</span>
                  </Button>
                  
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
                  <YouTubePlayer 
                    videoId={getYouTubeVideoId(getCurrentVOD()?.url) || ""}
                    onTimeUpdate={(time) => {
                      setCurrentPlayerTime(time);
                    }}
                    onSeekTo={(time) => {
                      setCurrentPlayerTime(time);
                    }}
                    onAddTimestamp={(time) => {
                      // Ajouter un marqueur automatiquement quand on clique sur "Marquer"
                      if (currentReview) {
                        const newTimestamp = {
                          id: Date.now().toString(),
                          time: time,
                          comment: `Moment important à ${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`,
                          type: "important" as const,
                          created_at: new Date().toISOString()
                        };
                        const updatedTimestamps = [...(currentReview.timestamps || []), newTimestamp].sort((a, b) => a.time - b.time);
                        const updated = { ...currentReview, timestamps: updatedTimestamps };
                        setCurrentReview(updated);
                        saveReviewSession({ timestamps: updatedTimestamps });
                      }
                    }}
                  />
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
                      // Naviguer vers le timestamp dans le lecteur
                      if (playerRef && playerRef.seekTo) {
                        playerRef.seekTo(time, true);
                        setCurrentPlayerTime(time);
                      }
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