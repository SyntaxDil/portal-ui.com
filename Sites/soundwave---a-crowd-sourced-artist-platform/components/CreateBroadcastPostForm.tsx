import React, { useState } from 'react';
import { Post, PostAudience } from '../types';
import { addPost } from '../services/firebaseService';
import Button from './Button';
import { Icon } from './Icon';

interface CreateBroadcastPostFormProps {
  onPostCreated: (newPost: Post) => void;
}

const CreateBroadcastPostForm: React.FC<CreateBroadcastPostFormProps> = ({ onPostCreated }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<PostAudience>('followers');

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPosting(true);
    // This is the current logged-in user, hardcoded for now.
    const currentUser = {
      authorId: 'user_1',
      authorName: 'Sub-Tropical',
      authorAvatarUrl: 'https://picsum.photos/id/1015/100/100',
    };
    try {
      const addedPost = await addPost({
        title,
        content,
        audience,
        ...currentUser,
      });
      onPostCreated(addedPost);
      setTitle('');
      setContent('');
      setAudience('followers');
    } catch (error) {
      console.error("Failed to add post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-2xl h-full">
      <h3 className="text-xl font-bold text-white mb-4">Make a Broadcast</h3>
      <p className="text-sm text-gray-400 mb-6">Create a post to share with your audience. This will appear in their community feed.</p>
      <form onSubmit={handlePostSubmit} className="space-y-4">
        <div>
          <label htmlFor="broadcast-title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input
            id="broadcast-title"
            type="text"
            placeholder="e.g. New Track Out Sunday!"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white placeholder-gray-400"
          />
        </div>
        <div>
           <label htmlFor="broadcast-content" className="block text-sm font-medium text-gray-400 mb-1">Message</label>
          <textarea
            id="broadcast-content"
            placeholder="Share some details with your fans..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={5}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white placeholder-gray-400"
          ></textarea>
        </div>
        <div>
            <label htmlFor="broadcast-audience" className="block text-sm font-medium text-gray-400 mb-1">Audience</label>
            <select 
                id="broadcast-audience"
                value={audience}
                onChange={e => setAudience(e.target.value as PostAudience)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white"
            >
                <option value="followers">All Followers</option>
                <option value="subscribers">Paid Subscribers</option>
                <option value="public">Public</option>
            </select>
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isPosting}>
            <Icon name="send" className="w-4 h-4 mr-2"/>
            Broadcast Post
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBroadcastPostForm;