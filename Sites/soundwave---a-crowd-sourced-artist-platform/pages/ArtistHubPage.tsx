import React, { useState, useEffect, useContext, useMemo } from 'react';
import { QueuedTrack, LiveRoom, Track, CommunityPlaylist, Comment } from '../types';
import { getTracks, getPlaylists, addCommentToTrack } from '../services/firebaseService';
import { AudioContext } from '../context/AudioContext';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { Icon } from '../components/Icon';
import LiveStreamView from '../components/LiveStreamView';
import CommentModal from '../components/CommentModal';

type AudioContextType = ReturnType<typeof import('../hooks/useAudio').useAudio>;

interface QueueItemProps {
    track: QueuedTrack;
    onUpvote: (id: string) => void;
    onDownvote: (id: string) => void;
    onPreview: (track: Track) => void;
    // FIX: Changed `onViewComments` to expect a `QueuedTrack` to maintain type information.
    onViewComments: (track: QueuedTrack) => void;
    audioCtx: AudioContextType;
    isNext?: boolean;
}

const QueueItem: React.FC<QueueItemProps> = ({ track, onUpvote, onDownvote, onPreview, onViewComments, audioCtx, isNext = false }) => {
    if (!audioCtx) return null;
    const { currentTrack, isPlaying, isPreviewing } = audioCtx;
    const isThisTrackPreviewing = currentTrack?.id === track.id && isPlaying && isPreviewing;
    const premiereClasses = track.isPremiere 
        ? 'border-2 border-purple-500/50 shadow-lg shadow-purple-500/20' 
        : '';

    return (
        <div className={`relative p-3 rounded-md flex items-center gap-4 transition-all ${isNext ? 'bg-gray-700/70' : 'bg-gray-700/40'} hover:bg-gray-600/50 ${premiereClasses}`}>
             {track.isPremiere && (
                <div className="absolute -top-2.5 -right-2.5 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 transform rotate-[15deg] shadow-md z-10">
                    <Icon name="crown" className="w-3 h-3" />
                    PREMIERE
                </div>
            )}
            <img src={track.coverArtUrl} alt={track.title} className="w-12 h-12 rounded-md object-cover"/>
            <div className="flex-grow">
                <p className="font-semibold text-white">{track.title}</p>
                <p className="text-sm text-gray-400">{track.artistName}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onViewComments(track)} className="p-3 bg-gray-600 rounded-full hover:bg-brand-accent hover:text-white transition-colors flex items-center gap-1.5 text-xs" aria-label={`View comments for ${track.title}`}>
                    <Icon name="comment" className="w-4 h-4"/>
                    <span>{track.comments?.length || 0}</span>
                </button>
                <button onClick={() => onPreview(track)} className="p-3 bg-gray-600 rounded-full hover:bg-brand-accent hover:text-white transition-colors" aria-label={`Preview ${track.title}`}>
                    <Icon name={isThisTrackPreviewing ? 'pause' : 'play'} className="w-5 h-5"/>
                </button>
            </div>
            <div className="flex items-center gap-3 text-sm">
                 <button onClick={() => onUpvote(track.id)} className="p-2 bg-gray-600/50 rounded-full hover:bg-brand-accent hover:text-white transition-colors" aria-label="Upvote">
                    <Icon name="thumbs-up" className="w-4 h-4"/>
                </button>
                <span className="font-bold text-white w-4 text-center">{track.votes}</span>
                <button onClick={() => onDownvote(track.id)} className="p-2 bg-gray-600/50 rounded-full hover:bg-red-500 hover:text-white transition-colors" aria-label="Downvote">
                    <Icon name="thumbs-down" className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
};


const ArtistHubPage: React.FC = () => {
    const [queuedTracks, setQueuedTracks] = useState<QueuedTrack[]>([]);
    const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
    const [allTracks, setAllTracks] = useState<Track[]>([]);
    const [communityPlaylists, setCommunityPlaylists] = useState<CommunityPlaylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStream, setActiveStream] = useState<LiveRoom | null>(null);
    // FIX: Changed state to hold a `QueuedTrack` to preserve all properties like votes and addedBy.
    const [commentModalTarget, setCommentModalTarget] = useState<QueuedTrack | null>(null);

    const audioCtx = useContext(AudioContext);
    if (!audioCtx) {
        throw new Error('ArtistHubPage must be used within an AudioProvider');
    }
    const { playTrack, currentTrack, isPlaying, setOnTrackEnd, playPreview } = audioCtx;
    
    const sortedQueue = useMemo(() => {
        return [...queuedTracks].sort((a, b) => b.votes - a.votes);
    }, [queuedTracks]);
    
    const playingNow = useMemo(() => sortedQueue.find(t => t.id === currentTrack?.id) || sortedQueue[0], [sortedQueue, currentTrack]);
    const playingNext = useMemo(() => sortedQueue.find(t => t.id !== playingNow?.id), [sortedQueue, playingNow]);
    const restOfQueue = useMemo(() => sortedQueue.filter(t => t.id !== playingNow?.id && t.id !== playingNext?.id), [sortedQueue, playingNow, playingNext]);

    const handlePlayNext = React.useCallback(() => {
        if (playingNext) {
            playTrack(playingNext);
        }
    }, [playingNext, playTrack]);
    
    useEffect(() => {
        setOnTrackEnd(() => handlePlayNext);
        return () => setOnTrackEnd(null);
    }, [setOnTrackEnd, handlePlayNext]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [fetchedTracks, fetchedPlaylists] = await Promise.all([
                getTracks(),
                getPlaylists()
            ]);
            setLiveRooms([]); // Live rooms not yet implemented
            setAllTracks(fetchedTracks);
            setCommunityPlaylists(fetchedPlaylists);

            const initialQueue = fetchedTracks.slice(0, 5).map((track, i) => ({
                ...track,
                votes: Math.floor(Math.random() * 5) + (5-i),
                addedBy: 'DJ Gemini',
                isPremiere: true,
            }));
            setQueuedTracks(initialQueue);

            setLoading(false);
            
            if (!currentTrack && initialQueue.length > 0) {
                playTrack(initialQueue.sort((a, b) => b.votes - a.votes)[0]);
            }
        };
        fetchData();
    }, []);

    const handleUpvote = (trackId: string) => {
        setQueuedTracks(prev => prev.map(t => t.id === trackId ? { ...t, votes: t.votes + 1 } : t));
    };

    const handleDownvote = (trackId: string) => {
        setQueuedTracks(prev => {
            const newQueue = prev.map(t => {
                if (t.id === trackId) {
                    return { ...t, votes: t.votes - 1 };
                }
                return t;
            });
            // Remove track if its score is too low and it's not the currently playing track
            return newQueue.filter(t => t.id === currentTrack?.id || t.votes > -3);
        });
    };
    
    const handlePreview = (track: Track) => {
        playPreview(track);
    };

    const handleAddTrack = () => {
        if (allTracks.length === 0) return;
        const unqueuedTracks = allTracks.filter(t => !queuedTracks.some(qt => qt.id === t.id));
        if (unqueuedTracks.length > 0) {
            const randomTrack = unqueuedTracks[Math.floor(Math.random() * unqueuedTracks.length)];
            const newQueuedTrack: QueuedTrack = {
                ...randomTrack,
                votes: 1,
                addedBy: 'Sub-Tropical', // Hardcoded current user
                isPremiere: true,
            };
            setQueuedTracks(prev => [...prev, newQueuedTrack]);
        } else {
            alert("All tracks are already in the queue!");
        }
    };
    
    const handleGoLive = () => {
        const myRoom: LiveRoom = {
            id: 'my_room',
            name: "Sub-Tropical's Studio Session",
            host: { id: 'user_1', name: 'Sub-Tropical', avatarUrl: 'https://picsum.photos/id/1015/200/200', bio: '' },
            viewers: 1,
            isLive: true,
        };
        setActiveStream(myRoom);
    };
    
    const handleAddComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
        if (!commentModalTarget) return;
        try {
            const newComment = await addCommentToTrack(commentModalTarget.id, commentData);
            const updatedTarget = { ...commentModalTarget, comments: [...(commentModalTarget.comments || []), newComment]};
            setCommentModalTarget(updatedTarget);
            setQueuedTracks(prev => prev.map(t => t.id === updatedTarget.id ? updatedTarget : t));
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    if (loading) return <Spinner />;

    if (activeStream) {
        return <LiveStreamView room={activeStream} onLeave={() => setActiveStream(null)} />;
    }

    return (
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
            <h1 className="text-3xl font-bold text-white mb-2">Artist Hub</h1>
            <p className="text-gray-400 mb-8">Collaborate on a live playlist and join live streams from artists.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Global Playlist */}
                <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Global Playlist</h2>
                        <Button onClick={handleAddTrack}>Add Your Track</Button>
                    </div>
                     <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Playing Now Section */}
                        {playingNow && (
                            <div>
                                <h3 className="text-lg font-semibold text-brand-accent mb-2 uppercase tracking-wider">Playing Now</h3>
                                <div className={`relative bg-gray-700/50 rounded-lg p-4 flex gap-4 items-center shadow-lg ${playingNow.isPremiere ? 'ring-2 ring-purple-500 shadow-purple-500/20' : 'ring-2 ring-brand-accent'}`}>
                                    {playingNow.isPremiere && (
                                        <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transform rotate-[15deg] shadow-lg z-10">
                                            <Icon name="crown" className="w-4 h-4" />
                                            PREMIERE
                                        </div>
                                    )}
                                    <img src={playingNow.coverArtUrl} alt={playingNow.title} className="w-24 h-24 rounded-md object-cover"/>
                                    <div className="flex-grow">
                                        <h4 className="text-2xl font-bold text-white">{playingNow.title}</h4>
                                        <p className="text-lg text-gray-300">{playingNow.artistName}</p>
                                        <p className="text-sm text-gray-400 mt-1">Added by {playingNow.addedBy}</p>
                                        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setCommentModalTarget(playingNow)}>
                                            <Icon name="comment" className="w-4 h-4 mr-2" />
                                            {playingNow.comments?.length || 0} Comments
                                        </Button>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <button onClick={() => handleUpvote(playingNow.id)} className="p-2 bg-gray-600 rounded-full hover:bg-brand-accent hover:text-white transition-colors" aria-label="Upvote">
                                            <Icon name="thumbs-up" className="w-5 h-5"/>
                                        </button>
                                        <span className="font-bold text-white text-xl">{playingNow.votes}</span>
                                        <button onClick={() => handleDownvote(playingNow.id)} className="p-2 bg-gray-600 rounded-full hover:bg-red-500 hover:text-white transition-colors" aria-label="Downvote">
                                            <Icon name="thumbs-down" className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Playing Next Section */}
                        {playingNext && (
                            <div>
                                <h3 className="text-md font-semibold text-gray-400 mb-2 uppercase tracking-wider">Playing Next</h3>
                                <QueueItem track={playingNext} onUpvote={handleUpvote} onDownvote={handleDownvote} onPreview={handlePreview} onViewComments={setCommentModalTarget} audioCtx={audioCtx} isNext={true} />
                            </div>
                        )}
                        
                        {/* Rest of Queue */}
                        {restOfQueue.length > 0 && (
                            <div>
                                <h3 className="text-md font-semibold text-gray-400 mb-2 border-t border-gray-700 pt-4 uppercase tracking-wider">Queue</h3>
                                <div className="space-y-3">
                                    {restOfQueue.map(track => (
                                        <QueueItem key={track.id} track={track} onUpvote={handleUpvote} onDownvote={handleDownvote} onPreview={handlePreview} onViewComments={setCommentModalTarget} audioCtx={audioCtx} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Live Rooms */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Live Rooms</h2>
                            <Button onClick={handleGoLive} variant="secondary">
                                <Icon name="video-camera" className="w-5 h-5 mr-2" />
                                Go Live
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {liveRooms.map(room => (
                                <div key={room.id} className="bg-gray-700 p-3 rounded-md flex items-center gap-4">
                                    <img src={room.host.avatarUrl} alt={room.host.name} className="w-12 h-12 rounded-full object-cover"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{room.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            <span>{room.viewers} watching</span>
                                        </div>
                                    </div>
                                    <Button onClick={() => setActiveStream(room)}>Join</Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Playlists */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                         <h2 className="text-2xl font-bold text-white mb-4">Community Playlists</h2>
                         <div className="space-y-4">
                            {communityPlaylists.map(playlist => (
                                <div key={playlist.id} className="bg-gray-700 p-3 rounded-md flex items-center gap-4 transition-colors hover:bg-gray-600/50">
                                    <div className="grid grid-cols-2 gap-0.5 w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-900">
                                        {playlist.tracks.slice(0, 4).map(track => (
                                            <img key={track.id} src={track.coverArtUrl} alt="" className="w-full h-full object-cover" />
                                        ))}
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-semibold text-white truncate">{playlist.title}</p>
                                        <p className="text-sm text-gray-400">by {playlist.curator.name}</p>
                                    </div>
                                    <Button onClick={() => alert(`Now playing ${playlist.title}`)} size="sm">Listen</Button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistHubPage;