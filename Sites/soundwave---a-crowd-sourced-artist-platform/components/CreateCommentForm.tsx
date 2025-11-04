import React, { useState } from 'react';
import { Comment } from '../types';
import Button from './Button';

interface CreateCommentFormProps {
  onAddComment: (commentData: Omit<Comment, 'id' | 'createdAt' | 'authorAvatarUrl'> & { authorAvatarUrl?: string }) => Promise<void>;
  placeholder?: string;
}

const CreateCommentForm: React.FC<CreateCommentFormProps> = ({ onAddComment, placeholder = "Add a comment or tag someone with @" }) => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (isGuest && !guestName.trim()) return;

    setIsPosting(true);
    
    let commentData: Omit<Comment, 'id' | 'createdAt' | 'authorAvatarUrl'> & { authorAvatarUrl?: string };

    if (isGuest) {
      commentData = {
        authorName: `${guestName} (Guest)`,
        authorAvatarUrl: `https://i.pravatar.cc/150?u=${guestName}`,
        content,
      };
    } else {
      // Hardcoded current user for simulation
      commentData = {
        authorId: 'user_1',
        authorName: 'Sub-Tropical',
        authorAvatarUrl: 'https://picsum.photos/id/1015/100/100',
        content,
      };
    }

    try {
      await onAddComment(commentData);
      setContent('');
      setGuestName('');
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-700/50">
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <img 
          src={isGuest ? `https://i.pravatar.cc/150?u=guest` : 'https://picsum.photos/id/1015/100/100'} 
          alt="Your avatar" 
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            required
            rows={2}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-brand-accent focus:border-brand-accent transition text-white placeholder-gray-400 text-sm"
          />
          {isGuest && (
            <div className="flex gap-3">
                <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required placeholder="Your Name" className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-brand-accent focus:border-brand-accent" />
            </div>
          )}
          <div className="flex justify-between items-center">
             <div className="flex items-center">
                <input 
                    id="guest-checkbox"
                    type="checkbox" 
                    checked={isGuest} 
                    onChange={e => setIsGuest(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-accent focus:ring-brand-accent"
                />
                <label htmlFor="guest-checkbox" className="ml-2 text-xs text-gray-400">Comment as guest</label>
             </div>
             <Button type="submit" size="sm" isLoading={isPosting}>Post Comment</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCommentForm;
