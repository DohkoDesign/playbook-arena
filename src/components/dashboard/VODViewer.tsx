import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, 
  ExternalLink, 
  X,
  Youtube,
  Twitch,
  Video,
  User,
  Edit
} from "lucide-react";
import { YouTubePlayer } from "./vod/YouTubePlayer";

interface VODViewerProps {
  vod: {
    url: string;
    title?: string;
    description?: string;
    platform?: 'youtube' | 'twitch';
    type?: string;
    player?: string;
    player_id?: string;
    validated?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  showExternalLink?: boolean;
  isPlayerView?: boolean;
  onOpenFullscreenEditor?: () => void;
}

export const VODViewer = ({ vod, isOpen, onClose, showExternalLink = true, isPlayerView = false, onOpenFullscreenEditor }: VODViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getPlatformIcon = () => {
    if (vod.platform === 'twitch' || vod.url.includes('twitch.tv')) {
      return <Twitch className="w-4 h-4" />;
    }
    if (vod.platform === 'youtube' || vod.url.includes('youtube.com') || vod.url.includes('youtu.be')) {
      return <Youtube className="w-4 h-4" />;
    }
    return <Video className="w-4 h-4" />;
  };

  const isYouTube = vod.platform === 'youtube' || vod.url.includes('youtube.com') || vod.url.includes('youtu.be');
  const videoId = isYouTube ? getYouTubeVideoId(vod.url) : null;

  if (isFullscreen) {
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
              <X className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {vod.title || 'VOD'}
              </h2>
              {vod.player && (
                <p className="text-sm text-white/70">
                  <User className="w-3 h-3 inline mr-1" />
                  {vod.player}
                </p>
              )}
            </div>
          </div>
          
          {showExternalLink && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(vod.url, '_blank')}
              className="text-white hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir l'original
            </Button>
          )}
        </div>

        {/* Lecteur pleine page */}
        <div className="flex-1 bg-black">
          {isYouTube && videoId ? (
            <YouTubePlayer
              videoId={videoId}
              onTimeUpdate={() => {}}
              onAddTimestamp={() => {}}
              onSeekTo={() => {}}
              timestamps={[]}
              onPlayerReady={() => {}}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-4">Lecteur intégré non disponible</p>
                <p className="text-sm opacity-75 mb-4">
                  Cette plateforme ne supporte pas la lecture intégrée
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.open(vod.url, '_blank')}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ouvrir dans {vod.platform === 'twitch' ? 'Twitch' : 'la plateforme'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getPlatformIcon()}
              <span>{vod.title || 'VOD'}</span>
              {vod.validated && (
                <Badge variant="default" className="text-xs">
                  Validée
                </Badge>
              )}
              {vod.type && (
                <Badge variant="outline" className="text-xs">
                  {vod.type}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                title="Mode cinéma"
              >
                <PlayCircle className="w-4 h-4" />
              </Button>
              {/* Éditeur plein écran uniquement pour les joueurs */}
              {isPlayerView && onOpenFullscreenEditor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenFullscreenEditor}
                  title="Éditeur plein écran"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {showExternalLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(vod.url, '_blank')}
                  title="Ouvrir l'original"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {vod.player && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Joueur: {vod.player}</span>
            </div>
          )}
          
          {vod.description && (
            <div>
              <p className="text-sm text-muted-foreground">{vod.description}</p>
            </div>
          )}

          <div className="aspect-video bg-black rounded-lg overflow-hidden max-h-[50vh]">
            {isYouTube && videoId ? (
              <div className="h-full overflow-y-auto">
                <YouTubePlayer
                  videoId={videoId}
                  onTimeUpdate={() => {}}
                  onAddTimestamp={() => {}}
                  onSeekTo={() => {}}
                  timestamps={[]}
                  onPlayerReady={() => {}}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Lecture intégrée non disponible</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(vod.url, '_blank')}
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ouvrir dans {vod.platform === 'twitch' ? 'Twitch' : 'la plateforme'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};