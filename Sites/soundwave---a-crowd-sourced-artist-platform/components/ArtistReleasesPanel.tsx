
import React from 'react';
import { ExternalRelease, ExternalPlatform } from '../types';
import { Icon } from './Icon';
import Button from './Button';

interface ArtistReleasesPanelProps {
  releases: ExternalRelease[];
}

const platformStyles: Record<ExternalPlatform, { icon: string; color: string }> = {
  Spotify: { icon: 'spotify', color: 'text-green-500' },
  SoundCloud: { icon: 'soundcloud', color: 'text-orange-500' },
  YouTube: { icon: 'youtube', color: 'text-red-500' },
  Bandcamp: { icon: 'bandcamp', color: 'text-cyan-400' },
};

const ArtistReleasesPanel: React.FC<ArtistReleasesPanelProps> = ({ releases }) => {

  const handleInteraction = (action: string, title: string) => {
    // In a real app, this would trigger a modal or API call
    console.log(`${action} button clicked for: ${title}`);
    alert(`Feature coming soon: ${action} for "${title}"`);
  };

  return (
    <div className="space-y-4">
      {releases.map(release => {
        const platform = platformStyles[release.platform];
        const isFree = release.type === 'Bootleg' ? true : !release.isPaid;

        return (
          <div key={release.id} className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors hover:bg-gray-700/50">
            <a href={release.url} target="_blank" rel="noopener noreferrer" className={`flex-shrink-0 ${platform.color} hover:opacity-80 transition-opacity`}>
              <Icon name={platform.icon} className="w-10 h-10" />
            </a>
            <div className="flex-grow">
              <div className="flex items-center gap-3">
                 <a href={release.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:underline">{release.title}</a>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isFree ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                    {isFree ? 'Free' : 'Paid'}
                  </span>
              </div>
             
              {release.type === 'Remix' && release.sourceArtist && (
                <p className="text-sm text-gray-400">Remix of a track by <span className="font-semibold text-gray-300">{release.sourceArtist}</span></p>
              )}
            </div>
            <div className="w-full sm:w-auto">
              {release.type === 'Remix' && release.sourceSamples && (
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Source Samples:</p>
                    <div className="flex flex-wrap gap-1">
                      {release.sourceSamples.map((sample, index) => (
                        <span key={index} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{sample}</span>
                      ))}
                    </div>
                  </div>
              )}
            </div>
             {release.type === 'Remix' && (
                <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center mt-2 sm:mt-0">
                    <button onClick={() => handleInteraction('Tag Samples', release.title)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors">
                        <Icon name="tag" className="w-3 h-3" /> Tag Samples
                    </button>
                    <button onClick={() => handleInteraction('Request Remix', release.title)} className="text-xs bg-purple-600/50 hover:bg-purple-600/80 text-purple-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors">
                        <Icon name="music-note" className="w-3 h-3" /> Request Remix
                    </button>
                </div>
            )}
          </div>
        )
      })}
    </div>
  );
};

export default ArtistReleasesPanel;
