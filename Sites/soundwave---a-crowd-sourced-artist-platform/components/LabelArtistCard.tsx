import React from 'react';
import { Link } from 'react-router-dom';
import { User, Track } from '../types';
import { Icon } from './Icon';
import Button from './Button';

interface LabelArtistCardProps {
  artist: User;
  tracks: Track[];
  onViewMore: () => void;
}

const LabelArtistCard: React.FC<LabelArtistCardProps> = ({ artist, tracks, onViewMore }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col md:flex-row items-center p-6 gap-6">
      <div className="flex-shrink-0">
        <img src={artist.avatarUrl} alt={artist.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
      </div>
      <div className="flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
                 <h3 className="text-2xl font-bold text-white">{artist.name}</h3>
                 <p className="text-gray-400 mt-1 max-w-md line-clamp-2">{artist.bio}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                <Button onClick={onViewMore} variant="secondary" size="sm">
                    View More
                </Button>
                 <Link to={`/profile/${artist.id}`}>
                    <Button variant="secondary" size="sm">
                        Profile
                    </Button>
                </Link>
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Latest on this label:</h4>
            {tracks.length > 0 ? (
                <div className="space-y-2">
                    {tracks.map(track => (
                        <div key={track.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                            <div className="flex items-center gap-3">
                                <Icon name="music-note" className="w-4 h-4 text-brand-accent"/>
                                <span className="text-white text-sm">{track.title}</span>
                            </div>
                            <span className="text-xs text-gray-400">{track.category}</span>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-sm text-gray-500">No tracks found on this label.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default LabelArtistCard;