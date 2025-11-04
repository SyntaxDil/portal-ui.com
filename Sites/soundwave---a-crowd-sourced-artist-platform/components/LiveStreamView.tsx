
import React, { useState, useEffect, useRef } from 'react';
import { LiveRoom, ChatMessage, User } from '../types';
import { Icon } from './Icon';
import Button from './Button';

interface LiveStreamViewProps {
  room: LiveRoom;
  onLeave: () => void;
}

const LiveStreamView: React.FC<LiveStreamViewProps> = ({ room, onLeave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUser: User = { id: 'user_1', name: 'Sub-Tropical', avatarUrl: 'https://picsum.photos/id/1015/200/200', bio: '' };

  useEffect(() => {
    const startStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setError("Could not access camera/microphone. Please check permissions.");
      }
    };

    startStream();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Simulate chat messages
  useEffect(() => {
     const interval = setInterval(() => {
        const sampleMessages = ["This is fire!", "Great stream!", "Loving the vibes", "Tune!"];
        const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        const simulatedMessage: ChatMessage = {
             id: `msg_${Date.now()}`,
             user: { id: `user_${Math.random()}`, name: 'Viewer', avatarUrl: `https://i.pravatar.cc/150?u=${Math.random()}` },
             text: randomMessage,
             timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, simulatedMessage].slice(-10)); // Keep chat history short
     }, 5000 + Math.random() * 3000);
     return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      user: currentUser,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage].slice(-10));
    setNewMessage('');
  };


  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex flex-col items-center justify-center p-4" onClick={onLeave}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Stream Content */}
        <div className="flex-grow bg-black relative flex items-center justify-center">
            {error ? (
                <div className="text-center text-red-400 p-4">
                    <Icon name="x" className="w-12 h-12 mx-auto mb-2"/>
                    <p className="font-semibold">Stream Error</p>
                    <p>{error}</p>
                </div>
            ) : (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
            )}
             <div className="absolute top-4 left-4 bg-black/50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <img src={room.host.avatarUrl} alt={room.host.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-white">{room.name}</h3>
                        <p className="text-sm text-gray-300">Hosted by {room.host.name}</p>
                    </div>
                </div>
            </div>
             <div className="absolute top-4 right-4 flex items-center gap-4">
                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                    <Icon name="rss" className="w-4 h-4 animate-pulse" />
                    LIVE
                </div>
                <div className="bg-black/50 text-white px-3 py-1 rounded-md text-sm">{room.viewers} watching</div>
            </div>
        </div>
        {/* Chat Panel */}
        <div className="w-full md:w-80 lg:w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-1/3 md:h-full">
           <div className="p-4 border-b border-gray-700">
                <h3 className="font-bold text-white">Live Chat</h3>
           </div>
           <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-2">
                    <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-8 h-8 rounded-full" />
                    <div>
                        <p className="text-sm font-semibold text-gray-300">{msg.user.name}</p>
                        <p className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-lg">{msg.text}</p>
                    </div>
                </div>
            ))}
             <div ref={messagesEndRef} />
           </div>
           <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Say something..." className="flex-grow bg-gray-700 border-gray-600 rounded-full py-2 px-3 text-sm text-white focus:ring-brand-accent-hover focus:border-brand-accent-hover" />
                    <button type="submit" className="bg-brand-accent p-2 rounded-full text-white hover:bg-brand-accent-hover"><Icon name="send" className="w-5 h-5" /></button>
                </form>
           </div>
        </div>
        <Button onClick={onLeave} className="absolute bottom-4 left-1/2 -translate-x-1/2" variant="secondary">Leave Stream</Button>
      </div>
    </div>
  );
};

export default LiveStreamView;
