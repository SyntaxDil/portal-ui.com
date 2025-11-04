import React from 'react';
import { LabelEvent } from '../types';
import { Icon } from './Icon';
import Button from './Button';

interface EventCardProps {
  event: LabelEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const eventDate = new Date(event.date);
    const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = eventDate.getDate();

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col sm:flex-row items-start gap-6 transition-colors hover:bg-gray-700/50">
      <div className="flex-shrink-0 text-center bg-gray-700 rounded-md p-3 w-full sm:w-20">
        <p className="text-sm font-bold text-brand-accent">{month}</p>
        <p className="text-3xl font-bold text-white">{day}</p>
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white">{event.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Icon name="map-pin" className="w-4 h-4" />
            <span>{event.location}</span>
        </div>
        <p className="text-gray-300 mt-2">{event.description}</p>
      </div>
      {event.ticketUrl && (
          <div className="self-center sm:self-auto">
            <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                 <Button>Buy Tickets</Button>
            </a>
          </div>
      )}
    </div>
  );
};

export default EventCard;