
import React from 'react';
import { Link } from 'react-router-dom';
import { Label } from '../types';

interface LabelCardProps {
  label: Label;
}

const LabelCard: React.FC<LabelCardProps> = ({ label }) => {
  return (
    <Link to={`/labels/${label.id}`} className="group block bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="relative h-40">
        <img src={label.bannerUrl} alt={`${label.name} banner`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent"></div>
      </div>
      <div className="p-4 -mt-16 relative flex items-center space-x-4">
        <img src={label.logoUrl} alt={`${label.name} logo`} className="w-20 h-20 rounded-full object-cover border-4 border-gray-800 group-hover:border-gray-700 transition-colors" />
        <div>
          <h3 className="font-bold text-xl text-white">{label.name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default LabelCard;
