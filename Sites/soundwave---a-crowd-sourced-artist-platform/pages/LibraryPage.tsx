import React, { useState, useEffect } from 'react';
import TrackCard from '../components/TrackCard';
import Spinner from '../components/Spinner';
import CommentModal from '../components/CommentModal';
import { Track, Comment } from '../types';
import { getTracks, addCommentToTrack } from '../services/mockData';

const LibraryPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalTarget, setCommentModalTarget] = useState<Track | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedTracks = await getTracks();
      setTracks(fetchedTracks);
      setLoading(false);
    };
    fetchData();
  }, []);

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
      <section id="global-library">
        <h1 className="text-3xl font-bold text-white mb-2">Global Library</h1>
        <p className="text-gray-400 mb-8">Explore all tracks uploaded by the SoundWave community.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} onViewComments={setCommentModalTarget} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default LibraryPage;
