import React, { useState, useEffect, useRef } from 'react';
import { Conversation, DirectMessage, User, Post } from '../types';
import { getConversations } from '../services/mockData';
import Spinner from '../components/Spinner';
import { Icon } from '../components/Icon';
import CreateBroadcastPostForm from '../components/CreateBroadcastPostForm';

const InboxPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = 'user_1'; 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const convos = await getConversations(currentUserId);
      setConversations(convos);
      if (convos.length > 0) {
        setSelectedConversation(convos[0]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation, selectedConversation?.messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message: DirectMessage = {
        id: `msg_${Date.now()}`,
        senderId: currentUserId,
        text: newMessage,
        timestamp: new Date().toISOString()
    };
    
    const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, message]
    };
    setSelectedConversation(updatedConversation);

    setConversations(prev => 
        prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );

    setNewMessage('');
  };
  
  const handlePostCreated = (newPost: Post) => {
    // In a real app, you might show a success toast.
    alert(`Broadcast sent to ${newPost.audience}! Title: ${newPost.title}`);
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return "Just now";
  };

  if (loading) return <Spinner />;

  const otherParticipant = selectedConversation?.participants.find(p => p.id !== currentUserId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex h-[calc(100vh-200px)] bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          {/* Sidebar - Conversation List */}
          <aside className="w-1/3 xl:w-1/4 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white">Direct Messages</h1>
            </div>
            <div className="flex-grow overflow-y-auto">
                {conversations.map(convo => {
                    const otherUser = convo.participants.find(p => p.id !== currentUserId)!;
                    const lastMessage = convo.messages[convo.messages.length - 1];
                    const isSelected = selectedConversation?.id === convo.id;
                    return (
                        <button 
                            key={convo.id} 
                            onClick={() => setSelectedConversation(convo)}
                            className={`w-full text-left p-4 flex items-center gap-4 transition-colors ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover" />
                                {convo.unreadCount > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-brand-accent ring-2 ring-gray-800" />}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`font-semibold truncate ${convo.unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>{otherUser.name}</h3>
                                    <p className="text-xs text-gray-500">{timeAgo(lastMessage.timestamp)}</p>
                                </div>
                                <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                                    {lastMessage.senderId === currentUserId && 'You: '}{lastMessage.text}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
          </aside>

          {/* Main Content - Chat Window */}
          <main className="flex-1 flex flex-col">
            {!selectedConversation || !otherParticipant ? (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    <p>Select a conversation to start chatting.</p>
                </div>
            ) : (
                <>
                <header className="p-4 border-b border-gray-700 flex items-center gap-4 bg-gray-800 z-10">
                    <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-10 h-10 rounded-full object-cover"/>
                    <h2 className="text-lg font-bold text-white">{otherParticipant.name}</h2>
                </header>
                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {selectedConversation.messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-3 ${msg.senderId === currentUserId ? 'flex-row-reverse' : ''}`}>
                                {msg.senderId !== currentUserId && <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
                                <div className={`p-3 rounded-2xl max-w-lg shadow ${msg.senderId === currentUserId ? 'bg-brand-accent text-white rounded-br-none' : 'bg-gray-700 text-gray-300 rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <footer className="p-4 bg-gray-800 border-t border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message ${otherParticipant.name}...`}
                            className="flex-grow bg-gray-700 border-gray-600 rounded-full py-2 px-4 text-sm text-white focus:ring-brand-accent focus:border-brand-accent"
                        />
                        <button type="submit" className="bg-brand-accent text-white rounded-full p-3 hover:bg-brand-accent-hover disabled:bg-gray-600" disabled={!newMessage.trim()}>
                            <Icon name="send" className="w-5 h-5" />
                        </button>
                    </form>
                </footer>
                </>
            )}
          </main>
        </div>
      </div>

      <div className="lg:col-span-1">
        <CreateBroadcastPostForm onPostCreated={handlePostCreated} />
      </div>
    </div>
  );
};

export default InboxPage;