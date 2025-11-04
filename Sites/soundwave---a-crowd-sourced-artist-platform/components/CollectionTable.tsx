
import React from 'react';
import { RekordboxTrack } from '../types';

interface CollectionTableProps {
    collection: RekordboxTrack[];
}

const CollectionTable: React.FC<CollectionTableProps> = ({ collection }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Collection ({collection.length} tracks)</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3">#</th>
                            <th scope="col" className="px-4 py-3">Title</th>
                            <th scope="col" className="px-4 py-3">Artist</th>
                            <th scope="col" className="px-4 py-3">Album</th>
                            <th scope="col" className="px-4 py-3">Genre</th>
                            <th scope="col" className="px-4 py-3">Key</th>
                            <th scope="col" className="px-4 py-3">Time</th>
                            <th scope="col" className="px-4 py-3">Plays</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collection.map((track, index) => (
                            <tr key={track.trackId || index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-4 py-3">{index + 1}</td>
                                <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">{track.title}</th>
                                <td className="px-4 py-3 whitespace-nowrap">{track.artist}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{track.album}</td>
                                <td className="px-4 py-3">{track.genre}</td>
                                <td className="px-4 py-3">{track.key}</td>
                                <td className="px-4 py-3">{track.totalTime}s</td>
                                <td className="px-4 py-3">{track.playCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CollectionTable;
