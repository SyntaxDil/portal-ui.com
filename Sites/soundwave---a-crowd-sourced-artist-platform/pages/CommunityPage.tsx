import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { getPosts } from '../services/firebaseService';
import Spinner from '../components/Spinner';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Community Hub</h1>
      <p className="text-gray-400 mb-8">Connect with fellow artists and fans. Share your thoughts, ask questions, and collaborate.</p>
      
      <div className="mb-8">
         <CreatePostForm onPostCreated={handlePostCreated} />
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;