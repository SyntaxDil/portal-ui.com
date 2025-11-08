
import React, { useState, useEffect, useContext } from 'react';
import { RadioStation, Track } from '../types';
import { getRadioStations, getTracks } from '../services/firebaseService';
import { generateAIDJCommentary } from '../services/geminiService';
import { AudioContext } from '../context/AudioContext';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { Icon } from '../components/Icon';

const CuratedPlaylistsPage: React.FC = () => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [allTracks, setAllTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
    const [stationPlaylist, setStationPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [djCommentary, setDjCommentary] = useState('');
    const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);

    const audioCtx = useContext(AudioContext);
     if (!audioCtx) {
        throw new Error('CuratedPlaylistsPage must be used within an AudioProvider');
    }
    const { playTrack, currentTrack, isPlaying, setOnTrackEnd } = audioCtx;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [fetchedStations, fetchedTracks] = await Promise.all([getRadioStations(), getTracks()]);
            setStations(fetchedStations);
            setAllTracks(fetchedTracks);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Setup track end handler
     useEffect(() => {
        if (selectedStation) {
            setOnTrackEnd(() => handleNextTrack);
        }
        // Cleanup on unmount or when station changes
        return () => {
            setOnTrackEnd(null);
        };
    }, [selectedStation, stationPlaylist, currentTrackIndex]);


    const generateCommentary = async (track: Track) => {
        setIsGeneratingCommentary(true);
        setDjCommentary('');
        const commentary = await generateAIDJCommentary(track.title, track.artistName);
        setDjCommentary(commentary);
        setIsGeneratingCommentary(false);
    };

    const handleTuneIn = (station: RadioStation) => {
        let playlist: Track[];
        if (station.artistId) {
            playlist = allTracks.filter(t => t.artistId === station.artistId);
        } else {
            playlist = allTracks.filter(t => t.tags.some(tag => station.tags.includes(tag)));
        }
        
        // Shuffle playlist for variety
        const shuffledPlaylist = playlist.sort(() => 0.5 - Math.random());
        
        setStationPlaylist(shuffledPlaylist);
        setSelectedStation(station);
        setCurrentTrackIndex(0);

        if (shuffledPlaylist.length > 0) {
            playTrack(shuffledPlaylist[0]);
            generateCommentary(shuffledPlaylist[0]);
        }
    };
    
    const handleNextTrack = () => {
        if (stationPlaylist.length === 0) return;
        const nextIndex = (currentTrackIndex + 1) % stationPlaylist.length;
        setCurrentTrackIndex(nextIndex);
        const nextTrack = stationPlaylist[nextIndex];
        playTrack(nextTrack);
        generateCommentary(nextTrack);
    };
    
    const handleBackToStations = () => {
        setSelectedStation(null);
        setStationPlaylist([]);
    };

    const nowPlayingTrack = stationPlaylist[currentTrackIndex];

    if (loading) return <Spinner />;

    if (!selectedStation || !nowPlayingTrack) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Curated Playlists</h1>
                <p className="text-gray-400 mb-8">Tune in to AI-powered radio stations based on genres, moods, and artists.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stations.map(station => (
                        <div key={station.id} className="group relative rounded-lg overflow-hidden shadow-lg h-64">
                            <img src={station.imageUrl} alt={station.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <h3 className="text-2xl font-bold text-white">{station.name}</h3>
                                <p className="text-gray-300 text-sm mb-4">{station.description}</p>
                                <div className="w-1/2">
                                    <Button onClick={() => handleTuneIn(station)}>Tune In</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    const CommentaryDisplay: React.FC = () => (
        <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4 mt-6 relative">
             <div className="absolute -top-3 left-8 w-6 h-6 bg-gray-700/50 border-t border-l border-gray-600 transform rotate-45" style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%)'}} />
            <div className="flex items-start gap-3">
                <img src={`https://i.pravatar.cc/150?u=dj_gemini`} alt="DJ Gemini" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div>
                     <p className="font-bold text-brand-accent">DJ Gemini</p>
                    {isGeneratingCommentary ? (
                        <div className="flex items-center space-x-2 text-gray-400">
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        </div>
                    ) : (
                        <p className="text-gray-300 italic">"{djCommentary}"</p>
                    )}
                </div>
            </div>
        </div>
    );

    const AudioVisualizer: React.FC = () => (
        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
            {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="audio-bar w-2 h-24 bg-white" style={{ animationDelay: `${i * 0.1}s`, animationPlayState: isPlaying ? 'running' : 'paused' }}/>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm text-gray-400">Now Playing on</p>
                        <h2 className="text-3xl font-bold text-white">{selectedStation.name}</h2>
                    </div>
                    <Button onClick={handleBackToStations} variant="secondary">Change Station</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                        <img src={nowPlayingTrack.coverArtUrl} alt={nowPlayingTrack.title} className="w-full h-full object-cover" />
                       <AudioVisualizer />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-4xl font-bold text-white">{nowPlayingTrack.title}</h3>
                        <p className="text-xl text-gray-400 mb-6">{nowPlayingTrack.artistName}</p>
                        
                        <CommentaryDisplay />

                        <div className="mt-8 flex items-center gap-4">
                            <Button onClick={handleNextTrack} className="w-full">
                                <Icon name="next" className="w-5 h-5 mr-2" />
                                Next Track
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CuratedPlaylistsPage;
