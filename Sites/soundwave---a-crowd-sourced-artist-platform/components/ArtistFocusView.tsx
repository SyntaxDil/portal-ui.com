import React from 'react';
import { User } from '../types';
import { Icon } from './Icon';

interface ArtistFocusViewProps {
  artist: User;
  onClose: () => void;
}

const ArtistFocusView: React.FC<ArtistFocusViewProps> = ({ artist, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 bg-gray-900/50 p-2 rounded-full">
            <Icon name="x" className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="relative h-64 w-full flex-shrink-0">
            <img src={artist.gallery?.[0] || artist.avatarUrl} alt={`${artist.name}`} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent flex items-end p-8">
                <div className="flex items-center gap-4">
                    <img src={artist.avatarUrl} alt={artist.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-800"/>
                    <div>
                        <p className="text-sm text-gray-300">In Conversation with</p>
                        <h1 className="text-4xl font-bold text-white">{artist.name}</h1>
                    </div>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8">
            <div className="prose prose-invert prose-lg max-w-none">
                <p className="lead text-xl text-gray-300">{artist.bio}</p>
                
                {artist.interview && artist.interview.length > 0 && (
                    <div className="mt-12">
                        {artist.interview.map((item, index) => (
                            <div key={index} className="mb-8">
                                <h3 className="text-brand-accent font-semibold">{item.question}</h3>
                                <p>{item.answer}</p>
                            </div>
                        ))}
                    </div>
                )}

                {artist.gallery && artist.gallery.length > 1 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white">Gallery</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {artist.gallery.map((imgUrl, index) => (
                                <img key={index} src={imgUrl} alt={`Artist gallery image ${index + 1}`} className="w-full h-40 object-cover rounded-lg shadow-md" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ArtistFocusView;