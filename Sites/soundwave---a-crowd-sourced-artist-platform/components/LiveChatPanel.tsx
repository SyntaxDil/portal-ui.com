
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { getUsers, getSampleChatMessages } from '../services/firebaseService';
import { Icon } from './Icon';

const LiveChatPanel: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // This is the current logged-in user, hardcoded for consistency
    const currentUser: User = { id: 'user_1', name: 'Sub-Tropical', avatarUrl: 'https://picsum.photos/id/1015/200/200', bio: '' };

    // Fetch all users on component mount
    useEffect(() => {
        getUsers().then(setAllUsers);
    }, []);

    // Effect to simulate live chat activity
    useEffect(() => {
        if (allUsers.length === 0) return;

        const sampleMessages = getSampleChatMessages();

        // Start with a couple of messages
        const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
        if (otherUsers.length > 0) {
            setMessages([
                {
                    id: `msg_${Date.now() - 5000}`,
                    user: otherUsers[0],
                    text: "Welcome to the live chat!",
                    timestamp: new Date(Date.now() - 5000).toISOString()
                },
                {
                    id: `msg_${Date.now() - 2000}`,
                    user: otherUsers[1 % otherUsers.length],
                    text: "Anyone working on new tunes?",
                    timestamp: new Date(Date.now() - 2000).toISOString()
                },
            ]);
        }

        const interval = setInterval(() => {
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
            
            const newSimulatedMessage: ChatMessage = {
                id: `msg_${Date.now()}`,
                user: randomUser,
                text: randomMessage,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, newSimulatedMessage]);

        }, 8000); // New message every 8 seconds

        return () => clearInterval(interval);

    }, [allUsers]);

    // Effect to scroll to the bottom of the chat
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

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-[500px]">
            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                            <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className={`p-3 rounded-lg max-w-sm shadow ${msg.user.id === currentUser.id ? 'bg-brand-accent text-white' : 'bg-gray-700 text-gray-300'}`}>
                                <p className="font-bold text-sm mb-1">{msg.user.name}</p>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Form */}
            <div className="p-4 bg-gray-700/50 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                    <img src={currentUser.avatarUrl} alt="Your avatar" className="w-8 h-8 rounded-full" />
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Join the conversation..."
                        className="flex-grow bg-gray-600 border border-gray-500 rounded-full py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white placeholder-gray-400"
                    />
                    <button type="submit" className="bg-brand-accent text-white rounded-full p-2 hover:bg-brand-accent-hover disabled:bg-gray-500 transition-colors" disabled={!newMessage.trim()}>
                         <Icon name="send" className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LiveChatPanel;
