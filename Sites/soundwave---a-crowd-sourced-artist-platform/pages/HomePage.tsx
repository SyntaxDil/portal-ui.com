import React, { useState, useEffect } from 'react';
import TrackCard from '../components/TrackCard';
import Spinner from '../components/Spinner';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import LiveChatPanel from '../components/LiveChatPanel';
import GlobalizerPanel from '../components/GlobalizerPanel';
import CommentModal from '../components/CommentModal';
import { Track, Post, Comment } from '../types';
import { getTracks, getPosts, addCommentToTrack } from '../services/mockData';

const HomePage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalTarget, setCommentModalTarget] = useState<Track | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fetchedTracks, fetchedPosts] = await Promise.all([
        getTracks(),
        getPosts()
      ]);
      setTracks(fetchedTracks);
      setPosts(fetchedPosts);
      setLoading(false);
    };
    fetchData();
  }, []);
  
  const handlePostCreated = (newPost: Post) => {
    // Add the new post to the top of the list, and keep the list short
    setPosts(prevPosts => [newPost, ...prevPosts].slice(0, 2));
  };

  const handleAddComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!commentModalTarget) return;
    try {
      const newComment = await addCommentToTrack(commentModalTarget.id, commentData);
      const updatedTarget = { ...commentModalTarget, comments: [...(commentModalTarget.comments || []), newComment]};
      setCommentModalTarget(updatedTarget);
      // Update the main tracks list as well
      setTracks(prevTracks => prevTracks.map(t => t.id === updatedTarget.id ? updatedTarget : t));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      {commentModalTarget && (
        <CommentModal
          isOpen={!!commentModalTarget}
          onClose={() => setCommentModalTarget(null)}
          title={`Comments for ${commentModalTarget.title}`}
          comments={commentModalTarget.comments || []}
          onAddComment={handleAddComment}
        />
      )}
      <section id="featured-tracks">
        <h1 className="text-3xl font-bold text-white mb-2">Featured Tracks</h1>
        <p className="text-gray-400 mb-8">Discover new music from artists around the world.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} onViewComments={setCommentModalTarget} />
          ))}
        </div>
      </section>

      <section id="community-spotlight" className="mt-16">
        <h2 className="text-3xl font-bold text-white mb-2">Community Spotlight</h2>
        <p className="text-gray-400 mb-8">Join the conversation or start your own.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                 {posts.slice(0, 2).map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
                 {posts.length === 0 && <p className="text-gray-400">No community posts yet. Be the first!</p>}
            </div>
            <div className="lg:col-span-1">
                <CreatePostForm onPostCreated={handlePostCreated} />
            </div>
        </div>
      </section>

      <section id="activity-hub" className="mt-16">
        <h2 className="text-3xl font-bold text-white mb-2">Activity Hub</h2>
        <p className="text-gray-400 mb-8">See what's happening in the community right now.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">Live Chat</h3>
            <LiveChatPanel />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">Globalizer</h3>
            <GlobalizerPanel />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
