import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { getUsers, getSampleChatMessages } from '../services/firebaseService';
import { Icon } from './Icon';

const LabelChatPanel: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // The current logged-in user
    const currentUser: User = { id: 'user_1', name: 'Sub-Tropical', avatarUrl: 'https://picsum.photos/id/1015/200/200', bio: '' };

    useEffect(() => {
        getUsers().then(setAllUsers);
    }, []);

    // Simulate live chat activity
    useEffect(() => {
        if (allUsers.length === 0) return;

        const sampleMessages = getSampleChatMessages();
        const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
        
        if (otherUsers.length > 0) {
            setMessages([
                {
                    id: `msg_label_${Date.now()}`,
                    user: otherUsers[0],
                    text: "This label is legendary!",
                    timestamp: new Date(Date.now() - 5000).toISOString()
                },
            ]);
        }

        const interval = setInterval(() => {
            if (document.hidden) return; // Don't add messages if tab is not active
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
            
            const newSimulatedMessage: ChatMessage = {
                id: `msg_label_${Date.now()}`,
                user: randomUser,
                text: randomMessage,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, newSimulatedMessage].slice(-20));
        }, 10000);

        return () => clearInterval(interval);
    }, [allUsers]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: `msg_label_${Date.now()}`,
            user: currentUser,
            text: newMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-[400px]">
             <h3 className="text-xl font-bold text-white p-4 border-b border-gray-700">Community Chat</h3>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                            <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-8 h-8 rounded-full object-cover" />
                            <div className={`p-3 rounded-lg max-w-sm shadow ${msg.user.id === currentUser.id ? 'bg-brand-accent text-white' : 'bg-gray-700 text-gray-300'}`}>
                                <p className="font-bold text-sm mb-1">{msg.user.name}</p>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 bg-gray-700/50 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
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

export default LabelChatPanel;