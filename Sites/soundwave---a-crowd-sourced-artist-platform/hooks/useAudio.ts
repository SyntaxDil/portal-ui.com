
import { useState, useCallback } from 'react';
import { Track } from '../types';

export const useAudio = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [onTrackEnd, setOnTrackEnd] = useState<(() => void) | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);


  const playTrack = useCallback((track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
    setIsPreviewing(false); // Ensure full playback
  }, [currentTrack]);

  const playPreview = useCallback((track: Track) => {
    // If clicking preview on the currently playing preview track, toggle pause
    if (currentTrack?.id === track.id && isPreviewing) {
        setIsPlaying(prev => !prev);
    } else {
        setCurrentTrack(track);
        setIsPlaying(true);
        setIsPreviewing(true);
    }
  }, [currentTrack, isPreviewing]);

  const togglePlayPause = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => {
        // If we are pausing, it's no longer a preview session
        if (!prev === false) {
          setIsPreviewing(false);
        }
        return !prev;
      });
    }
  }, [currentTrack]);


  return { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlayPause, 
    onTrackEnd, 
    setOnTrackEnd: setOnTrackEnd as (cb: (() => void) | null) => void,
    isPreviewing,
    playPreview,
  };
};
