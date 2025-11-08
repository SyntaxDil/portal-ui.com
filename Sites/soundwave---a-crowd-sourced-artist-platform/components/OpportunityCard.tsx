import React, { useState } from 'react';
import { Opportunity, Comment } from '../types';
import Button from './Button';
import { Icon } from './Icon';
import CommentSection from './CommentSection';
import { addCommentToOpportunity } from '../services/firebaseService';

interface OpportunityCardProps {
  opportunity: Opportunity;
  labelId: string;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity: initialOpportunity, labelId }) => {
    const [opportunity, setOpportunity] = useState(initialOpportunity);
    const [showComments, setShowComments] = useState(false);

    const typeStyles = {
        Artist: { icon: 'music-note', color: 'text-blue-400' },
        Vocalist: { icon: 'microphone', color: 'text-purple-400' },
        Designer: { icon: 'palette', color: 'text-yellow-400' },
        Collaborator: { icon: 'users', color: 'text-green-400' },
    };
    
    const style = typeStyles[opportunity.type] || { icon: 'sparkles', color: 'text-gray-400' };

    const handleCommentAdded = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
        try {
            const newComment = await addCommentToOpportunity(labelId, opportunity.id, commentData);
            setOpportunity(prev => ({
                ...prev,
                comments: [...(prev.comments || []), newComment]
            }));
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

  return (
    <div className="bg-gray-800 rounded-lg p-6 transition-colors hover:bg-gray-700/50">
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 bg-gray-700 p-4 rounded-full">
                <Icon name={style.icon} className={`w-8 h-8 ${style.color}`} />
            </div>
            <div className="flex-grow">
                <span className={`text-sm font-bold uppercase tracking-wider ${style.color}`}>{opportunity.type}</span>
                <h3 className="text-xl font-bold text-white mt-1">{opportunity.title}</h3>
                <p className="text-gray-300 mt-2">{opportunity.description}</p>
            </div>
            <div className="self-center sm:self-auto flex-shrink-0">
                <Button onClick={() => alert('Application form coming soon!')}>
                    Apply Now
                </Button>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
             <button 
                onClick={() => setShowComments(prev => !prev)}
                className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-2"
            >
                <Icon name="comment" className="w-4 h-4" />
                <span>{showComments ? 'Hide' : 'View'} {opportunity.comments?.length || 0} Comment{opportunity.comments?.length !== 1 && 's'}</span>
            </button>
            {showComments && (
                <div className="mt-4">
                    <CommentSection comments={opportunity.comments || []} onAddComment={handleCommentAdded} />
                </div>
            )}
        </div>
    </div>
  );
};

export default OpportunityCard;
