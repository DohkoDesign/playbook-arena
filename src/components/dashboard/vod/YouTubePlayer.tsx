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
  Maximize,
  Settings
} from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onReady?: () => void;
  onAddTimestamp?: (time: number) => void;
}

export const YouTubePlayer = ({ videoId, onTimeUpdate, onReady, onAddTimestamp }: YouTubePlayerProps) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout>();

  const opts: YouTubeProps['opts'] = {
    height: '450',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0, // Désactiver les contrôles YouTube pour utiliser les nôtres
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  const onPlayerReady = (event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration());
    setVolume(playerInstance.getVolume());
    onReady?.();
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
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Aucune vidéo sélectionnée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lecteur YouTube */}
      <div className="relative">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="w-full"
        />
      </div>

      {/* Contrôles personnalisés */}
      <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
        {/* Timeline */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={(value) => seekTo(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles de lecture */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={skipBackward}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePlayPause}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={skipForward}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
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
              className="text-gray-300 hover:text-white hover:bg-gray-700"
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
                className={`text-xs px-2 ${
                  playbackRate === rate 
                    ? "bg-primary text-primary-foreground" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
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
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions rapides pour le coaching */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">Actions rapides:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(Math.max(0, currentTime - 5))}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              -5s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(Math.max(0, currentTime - 15))}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              -15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => seekTo(Math.min(duration, currentTime + 15))}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              +15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Utiliser la fonction callback pour ajouter un marqueur
                onAddTimestamp?.(currentTime);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              📍 Marquer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};