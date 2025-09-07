import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Play, Clock, MessageSquare, Eye, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VODViewer } from "./VODViewer";
import { YouTubePlayer } from "./vod/YouTubePlayer";

interface VODAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  teamId: string;
  currentUserId?: string;
  isPlayerView?: boolean;
}

interface VODReview {
  id: string;
  vod_id: string;
  coach_id: string;
  timestamps: any;
  notes: string;
  team_id: string;
}

export const VODAnalysisModal = ({ isOpen, onClose, session, teamId, currentUserId, isPlayerView = false }: VODAnalysisModalProps) => {
  const [vodReviews, setVodReviews] = useState<VODReview[]>([]);
  const [selectedVOD, setSelectedVOD] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<VODReview | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && session) {
      fetchVODReviews();
    }
  }, [isOpen, session]);

  const fetchVODReviews = async () => {
    if (!session?.vods || session.vods.length === 0) return;

    setLoading(true);
    try {
      // Créer des IDs fictifs pour les VODs si elles n'en ont pas
      const vodsWithIds = session.vods.map((vod: any, index: number) => ({
        ...vod,
        id: vod.id || `vod_${session.id}_${index}`
      }));

      // Filtrer uniquement les IDs valides UUID pour éviter les erreurs côté DB
      const isValidUUID = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const validVodIds = vodsWithIds.map((v: any) => v.id).filter(isValidUUID);

      let reviews: VODReview[] = [];
      if (validVodIds.length > 0) {
        const { data, error } = await supabase
          .from("vod_reviews")
          .select("*")
          .eq("team_id", teamId)
          .in("vod_id", validVodIds);
        if (error) throw error;
        reviews = data || [];
      }

      setVodReviews(reviews);
    } catch (error: any) {
      console.error("Erreur chargement reviews:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analyses VOD",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVOD = (vod: any) => {
    setSelectedVOD(vod);
    const review = vodReviews.find(r => r.vod_id === vod.id);
    setSelectedReview(review || null);
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVODTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'vod_perso': 'VOD Personnelle',
      'match_complet': 'Match Complet',
      'highlights': 'Highlights',
      'playlist': 'Playlist'
    };
    return types[type] || type;
  };

  const parsedTimestamps = selectedReview?.timestamps ? 
    (typeof selectedReview.timestamps === 'string' ? 
      JSON.parse(selectedReview.timestamps) : selectedReview.timestamps) : [];

  const getPlatformIcon = (platform: string) => {
    return platform === 'youtube' ? '▶️' : '🟣';
  };

  const vodsWithIds = session?.vods?.map((vod: any, index: number) => ({
    ...vod,
    id: vod.id || `vod_${session.id}_${index}`
  })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Analyse VOD - {session?.events?.titre}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {vodsWithIds.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Video className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground">
                    Aucune VOD disponible
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Les coachs doivent d'abord ajouter des VODs pour ce match
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 gap-4 overflow-hidden">
              {/* Liste des VODs */}
              <div className="w-80 flex-shrink-0">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">VODs disponibles</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2 max-h-[500px] overflow-y-auto px-6 pb-6">
                      {vodsWithIds.map((vod: any) => {
                        const review = vodReviews.find(r => r.vod_id === vod.id);
                        const hasAnalysis = review && (review.timestamps?.length > 0 || review.notes);
                        
                        return (
                          <Card
                            key={vod.id}
                            className={`cursor-pointer transition-colors ${
                              selectedVOD?.id === vod.id
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-accent/50'
                            }`}
                            onClick={() => handleSelectVOD(vod)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg">
                                      {getPlatformIcon(vod.platform)}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {getVODTypeLabel(vod.type)}
                                    </Badge>
                                  </div>
                                  {hasAnalysis && (
                                    <Badge variant="default" className="text-xs">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Analysée
                                    </Badge>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="font-medium text-sm line-clamp-2">
                                    {vod.title || `VOD ${getVODTypeLabel(vod.type)}`}
                                  </p>
                                  {vod.player_id && (
                                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                      <User className="w-3 h-3 mr-1" />
                                      Joueur spécifique
                                    </div>
                                  )}
                                </div>

                                {hasAnalysis && (
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    {review.timestamps?.length > 0 && (
                                      <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {review.timestamps.length} markers
                                      </div>
                                    )}
                                    {review.notes && (
                                      <div className="flex items-center">
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        Notes disponibles
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visualiseur VOD */}
              <div className="flex-1 overflow-hidden">
                {selectedVOD ? (
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Play className="w-5 h-5 mr-2" />
                        {selectedVOD.title || `VOD ${getVODTypeLabel(selectedVOD.type)}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      <div className="h-full">
                        {selectedReview ? (
                          <Tabs defaultValue="viewer" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="viewer">Visualiseur</TabsTrigger>
                              <TabsTrigger value="analysis">
                                Analyse
                                {selectedReview.timestamps?.length > 0 && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {selectedReview.timestamps.length}
                                  </Badge>
                                )}
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="viewer" className="flex-1 mt-4">
                              <div className="h-full">
                                {selectedVOD.platform === 'youtube' && getYouTubeVideoId(selectedVOD.url) && (
                              <YouTubePlayer
                                videoId={getYouTubeVideoId(selectedVOD.url)!}
                                timestamps={parsedTimestamps}
                                isPlayerView={isPlayerView}
                              />
                                )}
                                {selectedVOD.platform === 'twitch' && (
                                  <div className="aspect-video">
                                    <iframe
                                      src={selectedVOD.url}
                                      className="w-full h-full rounded-lg"
                                      allowFullScreen
                                      sandbox="allow-scripts allow-same-origin allow-presentation"
                                      referrerPolicy="strict-origin-when-cross-origin"
                                    />
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="analysis" className="flex-1 mt-4 overflow-y-auto">
                              <div className="space-y-4">
                                {selectedReview.timestamps && selectedReview.timestamps.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center">
                                      <Clock className="w-4 h-4 mr-2" />
                                      Markers temporels ({selectedReview.timestamps.length})
                                    </h4>
                                    <div className="space-y-2">
                                      {parsedTimestamps.map((timestamp: any, index: number) => (
                                        <Card key={index} className="p-3">
                                         <div className="space-y-2">
                                           <div className="flex items-center justify-between">
                                             <Badge variant="default" className="bg-primary text-primary-foreground font-mono">
                                               {Math.floor(timestamp.time / 60)}:{String(timestamp.time % 60).padStart(2, '0')}
                                             </Badge>
                                             {timestamp.type && (
                                               <Badge variant="secondary" className="text-xs">
                                                 {timestamp.type}
                                               </Badge>
                                             )}
                                           </div>
                                            <p className="text-sm">{timestamp.comment}</p>
                                            {timestamp.player && (
                                              <p className="text-xs text-muted-foreground">
                                                Joueur: {timestamp.player}
                                              </p>
                                            )}
                                          </div>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {selectedReview.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center">
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Notes d'analyse
                                    </h4>
                                    <Card className="p-4">
                                      <p className="text-sm whitespace-pre-wrap">
                                        {selectedReview.notes}
                                      </p>
                                    </Card>
                                  </div>
                                )}

                                {(!selectedReview.timestamps || selectedReview.timestamps.length === 0) && !selectedReview.notes && (
                                  <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                      Aucune analyse disponible pour cette VOD
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div className="h-full">
                            {selectedVOD.platform === 'youtube' && getYouTubeVideoId(selectedVOD.url) && (
                              <YouTubePlayer
                                videoId={getYouTubeVideoId(selectedVOD.url)!}
                                timestamps={[]}
                                isPlayerView={isPlayerView}
                              />
                            )}
                            {selectedVOD.platform === 'twitch' && (
                              <div className="aspect-video">
                                <iframe
                                  src={selectedVOD.url}
                                  className="w-full h-full rounded-lg"
                                  allowFullScreen
                                  sandbox="allow-scripts allow-same-origin allow-presentation"
                                  referrerPolicy="strict-origin-when-cross-origin"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Play className="w-16 h-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium text-muted-foreground">
                          Sélectionnez une VOD
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Choisissez une VOD dans la liste pour la visualiser
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};