import { useEffect, useRef, useState, useCallback } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Settings,
  Eye,
  Minimize,
  X
} from "lucide-react";

interface Timestamp {
  id: string;
  time: number;
  comment: string;
  type: "important" | "error" | "success" | "strategy" | "player-specific";
  player?: string;
  category?: string;
  created_at: string;
}

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onReady?: () => void;
  onAddTimestamp?: (time: number) => void;
  onSeekTo?: (time: number) => void;
  timestamps?: Timestamp[];
  onPlayerReady?: (playerInstance: any) => void;
  isPlayerView?: boolean;
  showFullscreenEditor?: boolean;
  onCloseFullscreen?: () => void;
}

export const YouTubePlayer = ({ 
  videoId, 
  onTimeUpdate, 
  onReady, 
  onAddTimestamp, 
  onSeekTo,
  timestamps = [],
  onPlayerReady,
  isPlayerView = false,
  showFullscreenEditor = false,
  onCloseFullscreen
}: YouTubePlayerProps) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const opts: YouTubeProps['opts'] = {
    height: showFullscreenEditor ? '100%' : '320',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0, // Désactiver les contrôles YouTube pour utiliser les nôtres
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3, // Désactiver les annotations
      fs: 0, // Désactiver le bouton plein écran YouTube
    },
  };

  const onPlayerReadyHandler = (event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration());
    setVolume(playerInstance.getVolume());
    onReady?.();
    onPlayerReady?.(playerInstance); // Passer l'instance du player au parent
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    setIsPlaying(playerState === 1); // 1 = playing

    if (playerState === 1) {
      // Démarrer le suivi du temps
      intervalRef.current = setInterval(() => {
        if (player) {
          const time = player.getCurrentTime();
          setCurrentTime(time);
          onTimeUpdate?.(time);
        }
      }, 1000);
    } else {
      // Arrêter le suivi du temps
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Gestion du mouvement de souris pour les contrôles en mode plein écran
  const handleMouseMove = useCallback(() => {
    if (!showFullscreenEditor) return;
    
    setShowControls(true);
    
    if (mouseTimer) {
      clearTimeout(mouseTimer);
    }
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setMouseTimer(timer);
  }, [showFullscreenEditor, mouseTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mouseTimer) {
        clearTimeout(mouseTimer);
      }
    };
  }, [mouseTimer]);

  // Gérer les événements de souris en mode plein écran
  useEffect(() => {
    if (showFullscreenEditor && fullscreenRef.current) {
      const element = fullscreenRef.current;
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseenter', handleMouseMove);
      
      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseenter', handleMouseMove);
      };
    }
  }, [showFullscreenEditor, handleMouseMove]);

  // Debug: Afficher les timestamps reçus
  useEffect(() => {
    console.log("🎯 YouTubePlayer - Timestamps reçus:", timestamps?.length || 0, timestamps);
  }, [timestamps]);

  const togglePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const seekTo = (time: number) => {
    if (player) {
      player.seekTo(time, true);
      setCurrentTime(time);
      onSeekTo?.(time); // Informer le parent du changement de position
    }
  };

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    seekTo(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    seekTo(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
        setVolume(player.getVolume());
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (player) {
      player.setPlaybackRate(rate);
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Aucune vidéo sélectionnée</p>
      </div>
    );
  }

  // Mode plein écran
  if (showFullscreenEditor) {
    return (
      <div 
        ref={fullscreenRef}
        className="fixed inset-0 z-[9999] bg-black cursor-none"
        onMouseMove={handleMouseMove}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Lecteur YouTube en plein écran VRAIMENT plein écran */}
        <div className="absolute inset-0 w-full h-full">
          <YouTube
            videoId={videoId}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 0,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                fs: 0,
                playsinline: 1,
              },
            }}
            onReady={onPlayerReadyHandler}
            onStateChange={onPlayerStateChange}
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>

        {/* Contrôles overlay avec animation de fondu */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ pointerEvents: showControls ? 'auto' : 'none' }}
        >
          {/* Timeline et contrôles en bas comme YouTube */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            {/* Timeline principale */}
            <div className="px-4 py-2">
              <div className="relative mb-2">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={(value) => seekTo(value[0])}
                  className="w-full"
                />
                
                {/* Markers sur la timeline */}
                <div className="absolute -top-2 left-0 right-0 h-4">
                  {timestamps && timestamps.length > 0 && timestamps.map((timestamp) => {
                    const position = duration > 0 ? (timestamp.time / duration) * 100 : 0;
                    const markerColors = {
                      important: "bg-blue-500",
                      error: "bg-red-500", 
                      success: "bg-green-500",
                      strategy: "bg-yellow-500",
                      "player-specific": "bg-orange-500"
                    };
                    
                    return (
                      <div
                        key={timestamp.id}
                        className={`absolute w-3 h-3 ${markerColors[timestamp.type]} cursor-pointer hover:scale-125 transition-all duration-200 rounded-full border border-white shadow-lg`}
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '50%', marginTop: '-6px' }}
                        onClick={() => seekTo(timestamp.time)}
                        title={timestamp.comment}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* Barre de contrôles comme YouTube */}
              <div className="flex items-center justify-between text-white">
                {/* Contrôles de lecture */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipBackward}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20 p-3"
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipForward}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>

                  {/* Volume */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      {isMuted || volume === 0 ? 
                        <VolumeX className="w-4 h-4" /> : 
                        <Volume2 className="w-4 h-4" />
                      }
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={5}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>

                  {/* Temps */}
                  <div className="text-sm font-mono ml-4">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Contrôles de droite */}
                <div className="flex items-center space-x-3">
                  {/* Actions pour coaching */}
                  {!isPlayerView && (
                    <Button
                      onClick={() => {
                        const exactTime = player ? player.getCurrentTime() : currentTime;
                        if (player && isPlaying) {
                          player.pauseVideo();
                        }
                        onAddTimestamp?.(exactTime);
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-sm"
                    >
                      📍 Marker
                    </Button>
                  )}

                  {/* Vitesse de lecture */}
                  <div className="flex items-center space-x-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <Button
                        key={rate}
                        variant={playbackRate === rate ? "default" : "ghost"}
                        size="sm"
                        onClick={() => changePlaybackRate(rate)}
                        className="text-xs px-2 py-1 text-white hover:bg-white/20"
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>

                  {/* Bouton fermer */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCloseFullscreen}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Mode popup normal avec scroll
  return (
    <div className="space-y-2 max-h-[80vh] overflow-y-auto">
      {/* Lecteur YouTube */}
      <div className="relative">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReadyHandler}
          onStateChange={onPlayerStateChange}
          className="w-full"
        />
      </div>

        {/* Contrôles personnalisés avec fond plus visible */}
        <div className="space-y-2 p-2 bg-muted/30 rounded-lg border border-border/50 backdrop-blur-sm">
          {/* Timeline avec markers - fond plus contrasté */}
        <div className="space-y-1">
          <div className="relative bg-secondary/40 p-2 rounded-lg border border-border/30">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={(value) => seekTo(value[0])}
              className="w-full slider-enhanced mb-2"
            />
            
            {/* Markers dans la timeline - Version améliorée */}
            <div className="relative w-full h-6 mt-1">
              {timestamps && timestamps.length > 0 && timestamps.map((timestamp) => {
                const position = duration > 0 ? (timestamp.time / duration) * 100 : 0;
                const markerColors = {
                  important: "bg-blue-500 hover:bg-blue-600",
                  error: "bg-red-500 hover:bg-red-600", 
                  success: "bg-green-500 hover:bg-green-600",
                  strategy: "bg-yellow-500 hover:bg-yellow-600",
                  "player-specific": "bg-orange-500 hover:bg-orange-600"
                };
                
                return (
                  <div
                    key={timestamp.id}
                    className={`absolute top-0 w-4 h-6 ${markerColors[timestamp.type]} cursor-pointer hover:scale-125 transition-all duration-200 z-50 shadow-lg rounded-sm border-2 border-white`}
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        onClick={() => seekTo(timestamp.time)}
                  >
                    {/* Petit triangle en haut */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-inherit rotate-45 border-l border-t border-white"></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles de lecture */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={skipBackward}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={skipForward}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? 
                <VolumeX className="w-4 h-4" /> : 
                <Volume2 className="w-4 h-4" />
              }
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={5}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          {/* Vitesse de lecture */}
          <div className="flex items-center space-x-1">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "default" : "ghost"}
                size="sm"
                onClick={() => changePlaybackRate(rate)}
                className="text-xs px-2"
              >
                {rate}x
              </Button>
            ))}
          </div>

        </div>

        {/* Actions rapides pour le coaching */}
        {!isPlayerView && (
          <div className="border-t pt-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-muted-foreground">Actions:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(Math.max(0, currentTime - 5))}
              >
                -5s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(Math.max(0, currentTime - 15))}
              >
                -15s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(Math.min(duration, currentTime + 15))}
              >
                +15s
              </Button>
              <Button
                onClick={() => {
                  // Récupérer le temps actuel exact du lecteur
                  const exactTime = player ? player.getCurrentTime() : currentTime;
                  
                  // Mettre en pause avant d'ouvrir le modal
                  if (player && isPlaying) {
                    player.pauseVideo();
                  }
                  
                  // Utiliser la fonction callback pour ajouter un marqueur avec le temps exact
                  onAddTimestamp?.(exactTime);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                📍 Ajouter Marker
              </Button>
            </div>
          </div>
        )}

        {/* Navigation rapide pour les joueurs */}
        {isPlayerView && (
          <div className="border-t pt-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-muted-foreground">Navigation:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(Math.max(0, currentTime - 5))}
              >
                -5s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(Math.max(0, currentTime - 15))}
              >
                -15s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(Math.min(duration, currentTime + 15))}
              >
                +15s
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};