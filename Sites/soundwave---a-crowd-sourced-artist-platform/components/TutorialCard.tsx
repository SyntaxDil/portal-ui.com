import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tutorial, Comment } from '../types';
import { Icon } from './Icon';
import CommentSection from './CommentSection';
import { addCommentToTutorial } from '../services/mockData';

const TutorialCard: React.FC<{ tutorial: Tutorial }> = ({ tutorial: initialTutorial }) => {
  const [tutorial, setTutorial] = useState(initialTutorial);
  const [showComments, setShowComments] = useState(false);

  const getDifficultyColor = () => {
    switch (tutorial.difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
    }
  };
  
  const handleCommentAdded = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
      try {
          const newComment = await addCommentToTutorial(tutorial.id, commentData);
          setTutorial(prev => ({
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
        <img src={tutorial.thumbnailUrl} alt={`${tutorial.title} thumbnail`} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-brand-accent rounded-full p-4 transform transition-transform duration-300 hover:scale-110">
            <Icon name="play" className="h-8 w-8 text-white" />
          </div>
        </div>
         <span className="absolute bottom-2 right-2 text-xs font-semibold bg-gray-900/80 text-white px-2 py-1 rounded">
            {tutorial.duration}
        </span>
         <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full border ${getDifficultyColor()}`}>
            {tutorial.difficulty}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-md text-white truncate">{tutorial.title}</h3>
        <Link to={`/profile/${tutorial.instructor.id}`} className="text-sm text-gray-400 hover:text-white hover:underline">
          {tutorial.instructor.name}
        </Link>
        <div className="flex-grow mt-2">
            <div className="flex flex-wrap gap-1">
                {tutorial.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                ))}
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
            <button 
                onClick={() => setShowComments(!showComments)}
                className="w-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
                <Icon name="comment" className="w-4 h-4"/>
                <span>{tutorial.comments?.length || 0} Comments</span>
            </button>
        </div>
      </div>
       {showComments && (
        <div className="p-4 border-t border-gray-700">
            <CommentSection comments={tutorial.comments || []} onAddComment={handleCommentAdded} />
        </div>
      )}
    </div>
  );
};

export default TutorialCard;
