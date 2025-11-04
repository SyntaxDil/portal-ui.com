import React, { useState } from 'react';
import { Masterclass, Comment } from '../types';
import { Icon } from './Icon';
import Button from './Button';
import CommentSection from './CommentSection';
import { addCommentToMasterclass } from '../services/mockData';

interface MasterclassCardProps {
  masterclass: Masterclass;
}

const MasterclassCard: React.FC<MasterclassCardProps> = ({ masterclass: initialMasterclass }) => {
  const [masterclass, setMasterclass] = useState(initialMasterclass);

  const handleCommentAdded = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      const newComment = await addCommentToMasterclass(masterclass.id, commentData);
      setMasterclass(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl transition-colors hover:bg-gray-700/50">
      <div className="flex flex-col md:flex-row items-center gap-8 p-8">
        <div className="flex-shrink-0">
          <img src={masterclass.coverArtUrl} alt={masterclass.title} className="w-full md:w-64 h-auto rounded-lg object-cover shadow-lg" />
        </div>
        <div className="flex flex-col items-start text-center md:text-left">
          <h2 className="text-3xl font-bold text-white">{masterclass.title}</h2>
          <div className="flex items-center gap-2 mt-2 text-gray-400">
              <img src={masterclass.instructor.avatarUrl} alt={masterclass.instructor.name} className="w-6 h-6 rounded-full" />
              <span>with {masterclass.instructor.name}</span>
          </div>
          <p className="text-gray-300 my-4 max-w-lg">{masterclass.description}</p>
          <div className="flex items-center gap-6 text-gray-300 text-sm mb-6">
              <div className="flex items-center gap-2">
                  <Icon name="book-open" className="w-5 h-5 text-brand-accent"/>
                  <span>{masterclass.durationHours} hours of content</span>
              </div>
          </div>
          <div className="flex items-center gap-4">
              <Button>Enroll for ${masterclass.price.toFixed(2)}</Button>
              <Button variant="secondary">Learn More</Button>
          </div>
        </div>
      </div>
      <div className="p-8 border-t border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Community Discussion</h3>
        <CommentSection
          comments={masterclass.comments || []}
          onAddComment={handleCommentAdded}
        />
      </div>
    </div>
  );
};

export default MasterclassCard;
