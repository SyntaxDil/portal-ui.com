import React, { useContext } from 'react';
import { Track } from '../types';
import { Icon } from './Icon';
import { AudioContext } from '../context/AudioContext';
import Button from './Button';

interface FeaturedReleaseCardProps {
  track: Track;
  onViewComments?: (track: Track) => void;
}

const FeaturedReleaseCard: React.FC<FeaturedReleaseCardProps> = ({ track, onViewComments }) => {
  const audioCtx = useContext(AudioContext);
  if (!audioCtx) {
    throw new Error('FeaturedReleaseCard must be used within an AudioProvider');
  }
  const { playTrack, currentTrack, isPlaying } = audioCtx;
  const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

  const handlePlayPause = () => {
    playTrack(track);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-1/3 flex-shrink-0">
        <img src={track.coverArtUrl} alt={track.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-8 flex flex-col justify-center">
        <h3 className="text-3xl lg:text-4xl font-bold text-white">{track.title}</h3>
        <p className="text-xl text-gray-400 mt-1 mb-4">by {track.artistName}</p>
        <p className="text-gray-300 max-w-prose mb-6">{track.description}</p>
        <div className="flex items-center gap-4">
            <Button onClick={handlePlayPause} size="md">
                <Icon name={isCurrentlyPlaying ? 'pause' : 'play'} className="w-5 h-5 mr-2"/>
                {isCurrentlyPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button variant="secondary">
                View Release
            </Button>
             {onViewComments && (
                <button 
                    onClick={() => onViewComments(track)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Icon name="comment" className="w-5 h-5" />
                    <span className="font-semibold">{track.comments?.length || 0}</span>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedReleaseCard;
