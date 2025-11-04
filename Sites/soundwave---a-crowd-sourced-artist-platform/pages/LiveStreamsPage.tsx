
import React, { useState, useEffect } from 'react';
import { LiveRoom } from '../types';
import { getLiveRooms } from '../services/mockData';
import Spinner from '../components/Spinner';
import LiveStreamView from '../components/LiveStreamView';
import LiveStreamCard from '../components/LiveStreamCard';

const LiveStreamsPage: React.FC = () => {
    const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStream, setActiveStream] = useState<LiveRoom | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const fetchedRooms = await getLiveRooms();
            setLiveRooms(fetchedRooms);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (activeStream) {
        return <LiveStreamView room={activeStream} onLeave={() => setActiveStream(null)} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Live Streams</h1>
            <p className="text-gray-400 mb-8">Join live sessions from artists around the world. Watch performances, get feedback, or learn new skills.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {liveRooms.map(room => (
                    <LiveStreamCard key={room.id} room={room} onJoin={setActiveStream} />
                ))}
            </div>
        </div>
    );
};

export default LiveStreamsPage;
