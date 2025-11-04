import React, { useState } from 'react';
import { Post } from '../types';
import { addPost } from '../services/mockData';
import Button from './Button';

interface CreatePostFormProps {
  onPostCreated: (newPost: Post) => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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
        ...currentUser,
      });
      onPostCreated(addedPost);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Failed to add post:", error);
      // Here you would show an error to the user
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
      <h3 className="text-xl font-bold text-white mb-4">Create a New Post</h3>
      <form onSubmit={handlePostSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white placeholder-gray-400"
          />
        </div>
        <div>
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white placeholder-gray-400"
          ></textarea>
        </div>
        <div className="flex justify-end">
          <Button type="submit" isLoading={isPosting}>
            Post
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;
