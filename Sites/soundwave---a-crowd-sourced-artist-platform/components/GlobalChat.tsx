
import React from 'react';
import { Icon } from './Icon';
import { ChatMessage, User } from '../types';
import { getUsers } from '../services/mockData';
import { generateChatResponse } from '../services/geminiService';

const GlobalChat: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [isThinking, setIsThinking] = React.useState(false);

    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const currentUser: User = { id: 'user_1', name: 'Sub-Tropical', avatarUrl: 'https://picsum.photos/id/1015/200/200', bio: '' };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(scrollToBottom, [messages]);
    
    // Initialize chat with a welcome message
    React.useEffect(() => {
        setMessages([
            {
                id: `msg_${Date.now()}`,
                user: { id: 'dj_gemini', name: 'DJ Gemini', avatarUrl: `https://i.pravatar.cc/150?u=dj_gemini` },
                text: 'Welcome to the SoundWave global chat! Feel free to talk about music, production, or just say hi.',
                timestamp: new Date().toISOString()
            }
        ]);
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            user: {
                id: currentUser.id,
                name: currentUser.name,
                avatarUrl: currentUser.avatarUrl,
            },
            text: newMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsThinking(true);

        // Simulate AI response
        setTimeout(async () => {
            const aiResponseText = await generateChatResponse(newMessage);
            const aiMessage: ChatMessage = {
                id: `msg_${Date.now() + 1}`,
                 user: { id: 'dj_gemini', name: 'DJ Gemini', avatarUrl: `https://i.pravatar.cc/150?u=dj_gemini` },
                text: aiResponseText,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsThinking(false);
        }, 1000 + Math.random() * 1000); // Realistic delay
    };

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && (
                 <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-full p-4 shadow-lg z-50 transition-transform transform hover:scale-110"
                    aria-label="Open global chat"
                >
                    <Icon name="chat-bubble" className="w-8 h-8" />
                </button>
            )}

            {/* Chat Panel */}
            <div className={`fixed bottom-0 right-0 h-full w-full sm:h-auto sm:w-96 bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-700 border-b border-gray-600">
                        <h3 className="font-bold text-white text-lg">Global Chat</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close global chat">
                            <Icon name="x" className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                    <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-8 h-8 rounded-full object-cover" />
                                    <div className={`p-3 rounded-lg max-w-xs ${msg.user.id === currentUser.id ? 'bg-brand-accent text-white' : 'bg-gray-700 text-gray-300'}`}>
                                        <p className="font-bold text-sm">{msg.user.name}</p>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex items-start gap-3">
                                    <img src={`https://i.pravatar.cc/150?u=dj_gemini`} alt="DJ Gemini" className="w-8 h-8 rounded-full object-cover" />
                                    <div className="p-3 rounded-lg max-w-xs bg-gray-700 text-gray-400">
                                        <p className="text-sm italic">DJ Gemini is typing...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Form */}
                    <div className="p-4 bg-gray-700 border-t border-gray-600">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-grow bg-gray-600 border border-gray-500 rounded-full py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white placeholder-gray-400"
                                disabled={isThinking}
                            />
                            <button type="submit" className="bg-brand-accent text-white rounded-full p-3 hover:bg-brand-accent-hover disabled:bg-gray-500" disabled={isThinking || !newMessage.trim()}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GlobalChat;
