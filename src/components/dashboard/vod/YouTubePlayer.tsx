import { useEffect, useRef, useState } from "react";
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
  Eye
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
}

export const YouTubePlayer = ({ 
  videoId, 
  onTimeUpdate, 
  onReady, 
  onAddTimestamp, 
  onSeekTo,
  timestamps = [],
  onPlayerReady,
  isPlayerView = false
}: YouTubePlayerProps) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout>();

  const opts: YouTubeProps['opts'] = {
    height: '320',
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

  // Mode normal avec contrôles personnalisés
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

      {/* Contrôles personnalisés */}
      <div className="space-y-3 p-3 bg-card rounded-lg border">
        {/* Timeline avec markers */}
        <div className="relative">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={(value) => seekTo(value[0])}
            className="w-full"
          />
          
          {/* Markers de timestamps */}
          <div className="relative w-full h-4 mt-1">
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
                  className={`absolute top-0 w-3 h-4 ${markerColors[timestamp.type]} cursor-pointer hover:scale-125 transition-all duration-200 z-10 shadow-md rounded-sm border border-white`}
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  onClick={() => seekTo(timestamp.time)}
                  title={`${formatTime(timestamp.time)} - ${timestamp.comment}`}
                />
              );
            })}
          </div>
          
          {/* Temps actuel / durée */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
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