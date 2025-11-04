import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Track } from '../types';
import { Icon } from './Icon';
import { AudioContext } from '../context/AudioContext';

interface TrackCardProps {
  track: Track;
  onViewComments?: (track: Track) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, onViewComments }) => {
  const audioCtx = useContext(AudioContext);
  if (!audioCtx) {
    throw new Error('TrackCard must be used within an AudioProvider');
  }
  const { playTrack, currentTrack, isPlaying } = audioCtx;
  const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

  const handlePlayPause = () => {
    playTrack(track);
  };

  const getButtonLabel = () => {
    switch (track.uploadType) {
      case 'For Sale':
        return `Buy for $${track.price.toFixed(2)}`;
      case 'Free Download':
        return 'Download';
      default:
        return null;
    }
  }

  const getCategoryBadgeColor = () => {
    switch (track.category) {
        case 'Bootleg': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'Remix': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-2xl group flex flex-col">
      <div className="relative">
        <img src={track.coverArtUrl} alt={`${track.title} cover art`} className="w-full h-48 object-cover" />
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label={`Play or pause ${track.title}`}
        >
          <div className="bg-brand-accent rounded-full p-4 transform transition-transform duration-300 hover:scale-110">
            <Icon name={isCurrentlyPlaying ? 'pause' : 'play'} className="h-8 w-8 text-white" />
          </div>
        </button>
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full border ${getCategoryBadgeColor()}`}>
            {track.category}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-white truncate">{track.title}</h3>
        <div className="text-sm text-gray-400">
          <Link to={`/profile/${track.artistId}`} className="hover:text-white hover:underline">
            {track.artistName}
          </Link>
          {track.labelId && track.labelName && (
            <span className="text-xs">
              {' on '}
              <Link to={`/labels/${track.labelId}`} className="hover:text-white hover:underline font-semibold">
                {track.labelName}
              </Link>
            </span>
          )}
        </div>
        <div className="flex-grow mt-2">
            <div className="flex space-x-1">
                {track.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                ))}
            </div>
        </div>
        <div className="flex justify-between items-center mt-4">
            {onViewComments && (
                <button 
                    onClick={() => onViewComments(track)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                    aria-label={`View comments for ${track.title}`}
                >
                    <Icon name="comment" className="w-4 h-4" />
                    <span className="text-xs font-semibold">{track.comments?.length || 0}</span>
                </button>
            )}
            {getButtonLabel() && (
                <button className="bg-transparent border border-brand-accent text-brand-accent px-3 py-1 rounded-full text-xs font-semibold hover:bg-brand-accent hover:text-white transition-colors">
                {getButtonLabel()}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
