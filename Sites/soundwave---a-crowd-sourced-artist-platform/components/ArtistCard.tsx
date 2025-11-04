
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface ArtistCardProps {
  artist: User;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link to={`/profile/${artist.id}`} className="group flex flex-col items-center text-center p-4 bg-gray-800 rounded-lg transition-all duration-300 hover:bg-gray-700 hover:scale-105">
      <img src={artist.avatarUrl} alt={artist.name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-transparent group-hover:border-brand-accent transition-colors" />
      <h4 className="font-semibold text-white">{artist.name}</h4>
    </Link>
  );
};

export default ArtistCard;
