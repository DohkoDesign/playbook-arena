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
  X,
  Settings
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

interface FullscreenVideoPlayerProps {
  videoId: string;
  timestamps?: Timestamp[];
  isPlayerView?: boolean;
  onAddTimestamp?: (time: number) => void;
  onClose: () => void;
}

export const FullscreenVideoPlayer = ({
  videoId,
  timestamps = [],
  isPlayerView = false,
  onAddTimestamp,
  onClose
}: FullscreenVideoPlayerProps) => {
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

  const opts: YouTubeProps['opts'] = {
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
  };

  const onPlayerReadyHandler = (event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration());
    setVolume(playerInstance.getVolume());
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    setIsPlaying(playerState === 1);

    if (playerState === 1) {
      intervalRef.current = setInterval(() => {
        if (player) {
          const time = player.getCurrentTime();
          setCurrentTime(time);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Gestion de l'affichage des contrôles
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    if (mouseTimer) {
      clearTimeout(mouseTimer);
    }
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setMouseTimer(timer);
  }, [mouseTimer]);

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

  // Contrôles clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.code) {
        case 'Space':
          togglePlayPause();
          break;
        case 'ArrowLeft':
          skipBackward();
          break;
        case 'ArrowRight':
          skipForward();
          break;
        case 'ArrowUp':
          handleVolumeChange([Math.min(100, volume + 5)]);
          break;
        case 'ArrowDown':
          handleVolumeChange([Math.max(0, volume - 5)]);
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Ne pas afficher le composant si pas de videoId
  if (!videoId || videoId.trim() === '') {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999]"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw', 
        height: '100vh',
        zIndex: 9999
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Lecteur YouTube en plein écran */}
      <div className="absolute inset-0 w-full h-full">
        <YouTube
          videoId={videoId}
          opts={opts}
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

      {/* Contrôles superposés */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          pointerEvents: showControls ? 'auto' : 'none',
          zIndex: 10000
        }}
      >
        {/* Timeline et contrôles en bas - Style YouTube */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          style={{ paddingBottom: '20px', paddingTop: '40px' }}
        >
          <div className="px-6">
            {/* Timeline */}
            <div className="mb-4">
              <div className="relative">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={(value) => seekTo(value[0])}
                  className="w-full cursor-pointer"
                />
                
                {/* Markers sur la timeline */}
                {timestamps && timestamps.length > 0 && (
                  <div className="absolute -top-1 left-0 right-0 h-3 pointer-events-none">
                    {timestamps.map((timestamp) => {
                      const position = duration > 0 ? (timestamp.time / duration) * 100 : 0;
                      const markerColors = {
                        important: "bg-blue-400",
                        error: "bg-red-400", 
                        success: "bg-green-400",
                        strategy: "bg-yellow-400",
                        "player-specific": "bg-orange-400"
                      };
                      
                      return (
                        <div
                          key={timestamp.id}
                          className={`absolute w-2 h-3 ${markerColors[timestamp.type]} rounded-sm cursor-pointer pointer-events-auto hover:scale-125 transition-transform`}
                          style={{ 
                            left: `${position}%`, 
                            transform: 'translateX(-50%)',
                            top: '0px'
                          }}
                          onClick={() => seekTo(timestamp.time)}
                          title={`${formatTime(timestamp.time)} - ${timestamp.comment}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Barre de contrôles */}
            <div className="flex items-center justify-between text-white">
              {/* Contrôles de gauche */}
              <div className="flex items-center space-x-4">
                {/* Play/Pause et navigation */}
                <div className="flex items-center space-x-2">
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
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipForward}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center space-x-2">
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
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                {/* Temps */}
                <div className="text-sm font-mono text-white/90">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Contrôles de droite */}
              <div className="flex items-center space-x-3">
                {/* Bouton Marker pour coaching */}
                {!isPlayerView && onAddTimestamp && (
                  <Button
                    onClick={() => {
                      const exactTime = player ? player.getCurrentTime() : currentTime;
                      if (player && isPlaying) {
                        player.pauseVideo();
                      }
                      onAddTimestamp(exactTime);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-sm font-medium"
                  >
                    📍 Marker
                  </Button>
                )}

                {/* Vitesses de lecture */}
                <div className="flex items-center space-x-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant={playbackRate === rate ? "default" : "ghost"}
                      size="sm"
                      onClick={() => changePlaybackRate(rate)}
                      className={`text-xs px-2 py-1 ${
                        playbackRate === rate 
                          ? 'bg-white text-black' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>

                {/* Bouton fermer */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Instructions clavier */}
            <div className="mt-2 text-xs text-white/60 text-center">
              ESPACE: Play/Pause • ← →: -10s/+10s • ↑ ↓: Volume • M: Mute • ESC: Fermer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};