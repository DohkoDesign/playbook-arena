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

interface NewFullscreenPlayerProps {
  videoId: string;
  onClose: () => void;
  timestamps?: Timestamp[];
  isPlayerView?: boolean;
  onAddTimestamp?: (time: number) => void;
}

export const NewFullscreenPlayer = ({ 
  videoId, 
  onClose, 
  timestamps = [],
  isPlayerView = false,
  onAddTimestamp
}: NewFullscreenPlayerProps) => {
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
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Gestion du mouvement de souris
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

  // Gérer les touches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime]);

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

  return (
    <div 
      className="fixed inset-0 bg-black z-[10000]"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw', 
        height: '100vh',
        zIndex: 10000
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Lecteur YouTube prenant tout l'écran */}
      <div 
        className="w-full h-full"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%', 
          height: '100%'
        }}
      >
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReadyHandler}
          onStateChange={onPlayerStateChange}
          style={{ 
            width: '100%', 
            height: '100%'
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
          zIndex: 10001
        }}
      >
        {/* Barre de contrôles en bas */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          {/* Timeline */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={(value) => seekTo(value[0])}
              className="w-full"
            />
            
            {/* Markers sur la timeline */}
            <div className="relative w-full h-4 mt-1">
              {timestamps && timestamps.length > 0 && timestamps.map((timestamp) => {
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
                    className={`absolute w-3 h-3 ${markerColors[timestamp.type]} cursor-pointer hover:scale-125 transition-all duration-200 rounded-full border border-white shadow-lg`}
                    style={{ 
                      left: `${position}%`, 
                      transform: 'translateX(-50%)', 
                      top: '50%', 
                      marginTop: '-6px' 
                    }}
                    onClick={() => seekTo(timestamp.time)}
                    title={`${formatTime(timestamp.time)} - ${timestamp.comment}`}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Contrôles principaux */}
          <div className="flex items-center justify-between text-white">
            {/* Gauche - Contrôles de lecture */}
            <div className="flex items-center space-x-4">
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
              <div className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Droite - Actions et fermeture */}
            <div className="flex items-center space-x-3">
              {/* Actions pour coaching */}
              {!isPlayerView && onAddTimestamp && (
                <Button
                  onClick={() => {
                    const exactTime = player ? player.getCurrentTime() : currentTime;
                    if (player && isPlaying) {
                      player.pauseVideo();
                    }
                    onAddTimestamp(exactTime);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-sm"
                >
                  📍 Marker
                </Button>
              )}

              {/* Vitesse */}
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

              {/* Fermer */}
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
        </div>
      </div>
    </div>
  );
};