import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SamplePack, Comment } from '../types';
import { Icon } from './Icon';
import CommentSection from './CommentSection';
import { addCommentToSamplePack } from '../services/mockData';

const SamplePackCard: React.FC<{ pack: SamplePack }> = ({ pack: initialPack }) => {
  const [pack, setPack] = useState(initialPack);
  const [showComments, setShowComments] = useState(false);
  const isFree = pack.price === 0;

  const handleCommentAdded = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      const newComment = await addCommentToSamplePack(pack.id, commentData);
      setPack(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-2xl group flex flex-col">
      <div className="relative">
        <img src={pack.coverArtUrl} alt={`${pack.title} cover art`} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-brand-accent rounded-full p-4 transform transition-transform duration-300 hover:scale-110">
            <Icon name="play" className="h-8 w-8 text-white" />
          </div>
        </div>
         <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full border ${isFree ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
            {isFree ? 'Free' : `$${pack.price.toFixed(2)}`}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-white truncate">{pack.title}</h3>
        <Link to={`/profile/${pack.creator.id}`} className="text-sm text-gray-400 hover:text-white hover:underline">
          by {pack.creator.name}
        </Link>
         <div className="flex-grow mt-2">
            <div className="flex flex-wrap gap-1">
                {pack.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                ))}
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
             <button className="w-full bg-brand-accent text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-accent-hover transition-colors flex items-center justify-center gap-2">
                <Icon name="download" className="w-4 h-4" />
                <span>{isFree ? 'Download' : 'Purchase'}</span>
            </button>
            <button
                onClick={() => setShowComments(!showComments)}
                className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
                <Icon name="comment" className="w-4 h-4" />
                <span>{pack.comments?.length || 0} Comments</span>
            </button>
        </div>
      </div>
      {showComments && (
        <div className="p-4 border-t border-gray-700">
            <CommentSection comments={pack.comments || []} onAddComment={handleCommentAdded} />
        </div>
      )}
    </div>
  );
};

export default SamplePackCard;
