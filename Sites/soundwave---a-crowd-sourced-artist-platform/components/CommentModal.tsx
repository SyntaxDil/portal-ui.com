import React, { useEffect, useRef } from 'react';
import { Comment } from '../types';
import { Icon } from './Icon';
import CommentSection from './CommentSection';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  comments: Comment[];
  onAddComment: (commentData: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, title, comments, onAddComment }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      aria-labelledby="comment-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-full max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 id="comment-modal-title" className="text-xl font-bold text-white truncate">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full"
            aria-label="Close comment modal"
          >
            <Icon name="x" className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-grow overflow-y-auto p-6">
            <CommentSection 
                comments={comments}
                onAddComment={onAddComment}
                startExpanded={true}
            />
        </main>
      </div>
    </div>
  );
};

export default CommentModal;
