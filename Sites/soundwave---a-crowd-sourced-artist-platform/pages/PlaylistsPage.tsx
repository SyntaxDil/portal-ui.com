import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { RadioStation, Track, CommunityPlaylist, Comment } from '../types';
import { getTracks, getPlaylists } from '../services/firebaseService';
import { AudioContext } from '../context/AudioContext';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { Icon } from '../components/Icon';
import CommentModal from '../components/CommentModal';

const PlaylistsPage: React.FC = () => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [myPlaylists, setMyPlaylists] = useState<CommunityPlaylist[]>([]);
    const [allTracks, setAllTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
    const [stationPlaylist, setStationPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [djCommentary, setDjCommentary] = useState('');
    const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
    const [commentModalTarget, setCommentModalTarget] = useState<CommunityPlaylist | null>(null);

    const audioCtx = useContext(AudioContext);
     if (!audioCtx) {
        throw new Error('PlaylistsPage must be used within an AudioProvider');
    }
    const { playTrack, currentTrack, isPlaying, setOnTrackEnd } = audioCtx;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const fetchedTracks = await getTracks();
            // Radio stations and playlists not yet implemented
            setStations([]);
            setAllTracks(fetchedTracks);
            setMyPlaylists([]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleNextTrack = React.useCallback(() => {
        if (stationPlaylist.length === 0) return;
        
        setCurrentTrackIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % stationPlaylist.length;
            const nextTrack = stationPlaylist[nextIndex];
            playTrack(nextTrack);
            generateCommentary(nextTrack);
            return nextIndex;
        });
    }, [stationPlaylist, playTrack]);

    // Setup track end handler
     useEffect(() => {
        if (selectedStation) {
            setOnTrackEnd(() => handleNextTrack);
        }
        return () => { setOnTrackEnd(null); };
    }, [selectedStation, setOnTrackEnd, handleNextTrack]);


    const generateCommentary = (track: Track) => {
        setIsGeneratingCommentary(true);
        setDjCommentary('');
        // Simple commentary without AI
        const commentaries = [
            `This is fire! ${track.title} is bringing the heat!`,
            `Loving the vibes on ${track.title} by ${track.artistName}!`,
            `${track.artistName} never disappoints with tracks like ${track.title}!`,
            `Turn it up! ${track.title} is a certified banger!`,
            `Smooth sounds from ${track.artistName} - ${track.title} hits different!`
        ];
        const randomCommentary = commentaries[Math.floor(Math.random() * commentaries.length)];
        setDjCommentary(randomCommentary);
        setIsGeneratingCommentary(false);
    };

    const handleTuneIn = (station: RadioStation) => {
        let playlist: Track[];
        if (station.artistId) {
            playlist = allTracks.filter(t => t.artistId === station.artistId);
        } else {
            playlist = allTracks.filter(t => t.tags.some(tag => station.tags.includes(tag)));
        }
        const shuffledPlaylist = playlist.sort(() => 0.5 - Math.random());
        setStationPlaylist(shuffledPlaylist);
        setSelectedStation(station);
        setCurrentTrackIndex(0);
        if (shuffledPlaylist.length > 0) {
            playTrack(shuffledPlaylist[0]);
            generateCommentary(shuffledPlaylist[0]);
        }
    };
    
    const handleBackToStations = () => {
        setSelectedStation(null);
        setStationPlaylist([]);
    };

    const handleAddComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
        if (!commentModalTarget) return;
        // Comment functionality for playlists not yet implemented
        console.log('Add comment to playlist:', commentData);
    };

    const nowPlayingTrack = stationPlaylist[currentTrackIndex];

    if (loading) return <Spinner />;

    if (selectedStation && nowPlayingTrack) {
        // Radio Player View
        return <RadioPlayerView 
                    station={selectedStation} 
                    track={nowPlayingTrack} 
                    djCommentary={djCommentary} 
                    isGeneratingCommentary={isGeneratingCommentary}
                    isPlaying={isPlaying}
                    onBack={handleBackToStations} 
                    onNext={handleNextTrack}
                />;
    }

    return (
        // Main Playlists Page View
        <div>
            {commentModalTarget && (
                <CommentModal
                    isOpen={!!commentModalTarget}
                    onClose={() => setCommentModalTarget(null)}
                    title={`Comments for ${commentModalTarget.title}`}
                    comments={commentModalTarget.comments || []}
                    onAddComment={handleAddComment}
                />
            )}
            <section id="my-playlists" className="mb-16">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">My Playlists</h1>
                </div>
                {myPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {myPlaylists.map(playlist => (
                            <PlaylistCard key={playlist.id} playlist={playlist} onViewComments={setCommentModalTarget} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
                        <Icon name="playlist" className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold text-white">No Playlists Yet</h3>
                        <p className="text-gray-400 mt-2">You haven't created any playlists.</p>
                    </div>
                )}
            </section>

            <section id="radio-stations">
                <h2 className="text-3xl font-bold text-white mb-2">Radio Stations</h2>
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
            </section>
        </div>
    );
};


const PlaylistCard: React.FC<{playlist: CommunityPlaylist, onViewComments: (playlist: CommunityPlaylist) => void;}> = ({ playlist, onViewComments }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col gap-4 transition-all duration-300 hover:bg-gray-700 hover:shadow-xl">
            <div className="grid grid-cols-2 gap-1 w-full aspect-square rounded-md overflow-hidden bg-gray-900">
                {playlist.tracks.slice(0, 4).map(track => (
                    <img key={track.id} src={track.coverArtUrl} alt="" className="w-full h-full object-cover" />
                ))}
            </div>
            <div>
                <h3 className="font-semibold text-white truncate">{playlist.title}</h3>
                <p className="text-sm text-gray-400">{playlist.tracks.length} tracks</p>
                 <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                    <button 
                        onClick={() => onViewComments(playlist)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                        <Icon name="comment" className="w-4 h-4" />
                        <span className="text-xs font-semibold">{playlist.comments?.length || 0}</span>
                    </button>
                    <Button size="sm">Play</Button>
                </div>
            </div>
        </div>
    );
}


const RadioPlayerView: React.FC<{
    station: RadioStation;
    track: Track;
    djCommentary: string;
    isGeneratingCommentary: boolean;
    isPlaying: boolean;
    onBack: () => void;
    onNext: () => void;
}> = ({ station, track, djCommentary, isGeneratingCommentary, isPlaying, onBack, onNext }) => (
    <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-sm text-gray-400">Now Playing on</p>
                    <h2 className="text-3xl font-bold text-white">{station.name}</h2>
                </div>
                <Button onClick={onBack} variant="secondary">Change Station</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img src={track.coverArtUrl} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
                        {Array.from({length: 20}).map((_, i) => (
                            <div key={i} className="audio-bar w-2 h-24 bg-white" style={{ animationDelay: `${i * 0.1}s`, animationPlayState: isPlaying ? 'running' : 'paused' }}/>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-4xl font-bold text-white">{track.title}</h3>
                    <p className="text-xl text-gray-400 mb-6">{track.artistName}</p>
                    <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4 mt-6 relative">
                        <div className="absolute -top-3 left-8 w-6 h-6 bg-gray-700/50 border-t border-l border-gray-600 transform rotate-45" style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%)'}} />
                        <div className="flex items-start gap-3">
                            <img src={`https://i.pravatar.cc/150?u=dj_gemini`} alt="DJ Gemini" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            <div>
                                <p className="font-bold text-brand-accent">SoundWave Radio</p>
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
                    <div className="mt-8 flex items-center gap-4">
                        <Button onClick={onNext} className="w-full">
                            <Icon name="next" className="w-5 h-5 mr-2" />
                            Next Track
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PlaylistsPage;
