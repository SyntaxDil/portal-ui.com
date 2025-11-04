
import React from 'react';
import { LiveRoom } from '../types';
import { Icon } from './Icon';
import Button from './Button';

interface LiveStreamCardProps {
  room: LiveRoom;
  onJoin: (room: LiveRoom) => void;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ room, onJoin }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-2xl group flex flex-col">
      <div className="relative h-48 w-full bg-gray-900 flex items-center justify-center">
        <img src={room.host.avatarUrl} alt={room.host.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-md">
          <Icon name="rss" className="w-3 h-3 animate-pulse" />
          LIVE
        </div>
         <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-md text-xs">{room.viewers} watching</div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-white truncate">{room.name}</h3>
        <p className="text-sm text-gray-400">Hosted by {room.host.name}</p>
        <div className="flex-grow mt-4">
            <Button onClick={() => onJoin(room)} className="w-full">Join Stream</Button>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamCard;
