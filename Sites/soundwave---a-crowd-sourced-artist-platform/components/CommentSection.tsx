import React, { useState } from 'react';
import { Comment } from '../types';
import { Icon } from './Icon';
import CommentComponent from './Comment';
import CreateCommentForm from './CreateCommentForm';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (commentData: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  placeholder?: string;
  startExpanded?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment, placeholder, startExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(startExpanded);

  if (!isExpanded && !startExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-2"
      >
        <Icon name="comment" className="w-4 h-4" />
        <span>View {comments.length} Comment{comments.length !== 1 && 's'}</span>
      </button>
    );
  }

  return (
    <div className="w-full">
        {comments.length > 0 && (
             <div className="space-y-4">
                {comments.map(comment => (
                    <CommentComponent key={comment.id} comment={comment} />
                ))}
            </div>
        )}
       
        <CreateCommentForm
            onAddComment={onAddComment}
            placeholder={placeholder}
        />
    </div>
  );
};

export default CommentSection;
