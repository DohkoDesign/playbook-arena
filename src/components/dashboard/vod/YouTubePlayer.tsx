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
  const [hoveredTimestamp, setHoveredTimestamp] = useState<Timestamp | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const opts: YouTubeProps['opts'] = {
    height: showFullscreenEditor ? '100vh' : '320',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0, // Désactiver les contrôles YouTube pour utiliser les nôtres
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
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
        className="fixed inset-0 z-50 bg-black cursor-none"
        onMouseMove={handleMouseMove}
      >
        {/* Lecteur YouTube en plein écran */}
        <div className="w-full h-full">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onPlayerReadyHandler}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
          />
        </div>

        {/* Contrôles overlay avec animation de fondu */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ pointerEvents: showControls ? 'auto' : 'none' }}
        >
          {/* Header avec bouton fermer */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <h3 className="text-lg font-semibold">Éditeur VOD</h3>
                <p className="text-sm text-white/70">{formatTime(currentTime)} / {formatTime(duration)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseFullscreen}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Timeline et contrôles en bas */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="space-y-4">
              {/* Timeline avec markers */}
              <div className="relative">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={(value) => seekTo(value[0])}
                  className="w-full slider-enhanced"
                />
                
                {/* Markers dans la timeline */}
                <div className="relative w-full h-6 mt-2">
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
                        onMouseEnter={(e) => {
                          setHoveredTimestamp(timestamp);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10
                          });
                        }}
                        onMouseLeave={() => setHoveredTimestamp(null)}
                      >
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-inherit rotate-45 border-l border-t border-white"></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contrôles principaux */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={skipBackward}
                  className="text-white hover:bg-white/10"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/10"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={skipForward}
                  className="text-white hover:bg-white/10"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>

                {/* Actions rapides */}
                {!isPlayerView && (
                  <Button
                    onClick={() => {
                      const exactTime = player ? player.getCurrentTime() : currentTime;
                      if (player && isPlaying) {
                        player.pauseVideo();
                      }
                      onAddTimestamp?.(exactTime);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground ml-8"
                  >
                    📍 Ajouter Marker
                  </Button>
                )}
              </div>

              {/* Volume et vitesse */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/10"
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
                    className="w-24"
                  />
                </div>

                <div className="flex items-center space-x-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant={playbackRate === rate ? "default" : "ghost"}
                      size="sm"
                      onClick={() => changePlaybackRate(rate)}
                      className="text-xs px-2 text-white hover:bg-white/10"
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip pour les markers en mode plein écran */}
        {hoveredTimestamp && (
          <div 
            className="fixed z-[100] bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs"
            style={{
              left: tooltipPosition.x - 150,
              top: tooltipPosition.y - 120,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {formatTime(hoveredTimestamp.time)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                  hoveredTimestamp.type === 'important' ? 'bg-blue-100 text-blue-700' :
                  hoveredTimestamp.type === 'error' ? 'bg-red-100 text-red-700' :
                  hoveredTimestamp.type === 'success' ? 'bg-green-100 text-green-700' :
                  hoveredTimestamp.type === 'strategy' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {hoveredTimestamp.type}
                </span>
              </div>
              <p className="text-sm font-medium">{hoveredTimestamp.comment}</p>
              {hoveredTimestamp.player && (
                <p className="text-xs text-muted-foreground">
                  Joueur: {hoveredTimestamp.player}
                </p>
              )}
              {hoveredTimestamp.category && (
                <p className="text-xs text-muted-foreground">
                  Catégorie: {hoveredTimestamp.category}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => seekTo(hoveredTimestamp.time)}
                  className="text-xs"
                >
                  Aller au moment
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    console.log("Afficher détails pour:", hoveredTimestamp.id);
                  }}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Détails
                </Button>
              </div>
            </div>
          </div>
        )}
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
                    onMouseEnter={(e) => {
                      setHoveredTimestamp(timestamp);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10
                      });
                    }}
                    onMouseLeave={() => setHoveredTimestamp(null)}
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

          {/* Plein écran */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
          >
            <Maximize className="w-4 h-4" />
          </Button>
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
      
      {/* Tooltip pour les markers */}
      {hoveredTimestamp && (
        <div 
          className="fixed z-[100] bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs"
          style={{
            left: tooltipPosition.x - 150,
            top: tooltipPosition.y - 120,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {formatTime(hoveredTimestamp.time)}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                hoveredTimestamp.type === 'important' ? 'bg-blue-100 text-blue-700' :
                hoveredTimestamp.type === 'error' ? 'bg-red-100 text-red-700' :
                hoveredTimestamp.type === 'success' ? 'bg-green-100 text-green-700' :
                hoveredTimestamp.type === 'strategy' ? 'bg-yellow-100 text-yellow-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {hoveredTimestamp.type}
              </span>
            </div>
            <p className="text-sm font-medium">{hoveredTimestamp.comment}</p>
            {hoveredTimestamp.player && (
              <p className="text-xs text-muted-foreground">
                Joueur: {hoveredTimestamp.player}
              </p>
            )}
            {hoveredTimestamp.category && (
              <p className="text-xs text-muted-foreground">
                Catégorie: {hoveredTimestamp.category}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => seekTo(hoveredTimestamp.time)}
                className="text-xs"
              >
                Aller au moment
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  // Ajouter logique pour afficher les détails
                  console.log("Afficher détails pour:", hoveredTimestamp.id);
                }}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Détails
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};