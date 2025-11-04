
import React, { useContext, useRef, useEffect, useState } from 'react';
import { AudioContext } from '../context/AudioContext';
import { Icon } from './Icon';

const AudioPlayer: React.FC = () => {
  const audioCtx = useContext(AudioContext);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const previewTimeoutRef = useRef<number | null>(null);

  if (!audioCtx) return null; // Don't render if context is not available

  const { currentTrack, isPlaying, togglePlayPause, onTrackEnd, isPreviewing } = audioCtx;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore AbortError which is thrown when a user interrupts playback
          if (error.name !== 'AbortError') {
            console.error("Audio play failed:", error);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);
  
  // Effect for handling preview timeout
  useEffect(() => {
    // Clear any existing timeout when track or preview state changes
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }

    if (isPlaying && isPreviewing) {
      previewTimeoutRef.current = window.setTimeout(() => {
        if (isPlaying && isPreviewing) { // Double check state before pausing
            togglePlayPause();
        }
      }, 30000); // 30 seconds
    }

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [currentTrack, isPlaying, isPreviewing, togglePlayPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset progress when a new track is loaded
    setProgress(0);

    const handleTimeUpdate = () => {
      // Check for a valid, finite duration before calculating progress
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => {
      // If a custom onTrackEnd callback is provided (e.g., for a playlist), use it.
      // Otherwise, just toggle play/pause state.
      if (onTrackEnd) {
        onTrackEnd();
      } else {
        togglePlayPause();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, togglePlayPause, onTrackEnd]);
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    // Guard against trying to seek when duration is not available or non-finite
    if (!audio || !isFinite(audio.duration)) return;
    
    const newPercentage = Number(e.target.value);
    const newTime = (newPercentage / 100) * audio.duration;
    
    // Final check to ensure the calculated time is valid before setting it
    if (isFinite(newTime)) {
        audio.currentTime = newTime;
        setProgress(newPercentage);
    }
  };


  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 h-24 z-50 flex items-center px-4 sm:px-6 lg:px-8">
      <audio ref={audioRef} src={currentTrack.audioSrc} />
      <div className="flex items-center space-x-4">
        <img src={currentTrack.coverArtUrl} alt={currentTrack.title} className="w-16 h-16 rounded-md object-cover" />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{currentTrack.title}</h4>
            {isPreviewing && (
              <span className="text-xs font-bold bg-yellow-500 text-gray-900 px-2 py-0.5 rounded-full">PREVIEW</span>
            )}
          </div>
          <p className="text-sm text-gray-400">{currentTrack.artistName}</p>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center space-x-4 mx-8">
        <button onClick={togglePlayPause} className="text-gray-400 hover:text-white">
          <Icon name="previous" className="w-6 h-6" />
        </button>
        <button onClick={togglePlayPause} className="bg-white rounded-full p-2 text-gray-900 hover:scale-105 transition-transform">
          <Icon name={isPlaying ? 'pause' : 'play'} className="w-8 h-8" />
        </button>
        <button onClick={togglePlayPause} className="text-gray-400 hover:text-white">
          <Icon name="next" className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center space-x-2 w-1/3">
        <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleProgressChange}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
            style={{ 
              background: `linear-gradient(to right, #1DB954 ${progress}%, #4B5563 ${progress}%)`
            }}
          />
      </div>
    </div>
  );
};

export default AudioPlayer;
