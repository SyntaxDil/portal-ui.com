
import React from 'react';
import { PremiumPack } from '../types';
import { Icon } from './Icon';
import Button from './Button';

interface PremiumPackCardProps {
  pack: PremiumPack;
}

const PremiumPackCard: React.FC<PremiumPackCardProps> = ({ pack }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-800/80 border border-brand-accent/30 rounded-lg shadow-2xl p-6 flex flex-col h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-brand-accent/20">
      <div className="flex-grow">
        <div className="mb-4">
          <Icon name="package" className="w-10 h-10 text-brand-accent mb-2" />
          <h3 className="text-2xl font-bold text-white">{pack.title}</h3>
          <p className="text-gray-400 mt-1">{pack.description}</p>
        </div>
        <ul className="space-y-3 my-6">
          {pack.items.map((item, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="bg-gray-700 rounded-full p-2">
                <Icon name={item.icon} className="w-4 h-4 text-brand-accent-hover" />
              </div>
              <span className="text-gray-300">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 text-center">
         <p className="text-4xl font-bold text-white mb-4">
            ${pack.price.toFixed(2)} <span className="text-lg font-normal text-gray-400">{pack.currency}</span>
        </p>
        <Button className="w-full">
            Purchase Pack
        </Button>
      </div>
    </div>
  );
};

export default PremiumPackCard;
