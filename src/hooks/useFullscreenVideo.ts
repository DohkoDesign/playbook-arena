import { useState, useCallback, useEffect } from 'react';

interface UseFullscreenVideoProps {
  videoId: string;
  timestamps?: any[];
  isPlayerView?: boolean;
  onAddTimestamp?: (time: number) => void;
}

export const useFullscreenVideo = ({
  videoId,
  timestamps = [],
  isPlayerView = false,
  onAddTimestamp
}: UseFullscreenVideoProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    // Restaurer le scroll du body
    document.body.style.overflow = 'unset';
  }, []);

  // Écouter la touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Nettoyer le style du body au démontage
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, closeFullscreen]);

  return {
    isFullscreen,
    openFullscreen,
    closeFullscreen,
    fullscreenProps: {
      videoId,
      timestamps,
      isPlayerView,
      onAddTimestamp,
      onClose: closeFullscreen
    }
  };
};