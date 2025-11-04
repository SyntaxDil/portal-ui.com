import React from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../types';

interface CommentComponentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentComponentProps> = ({ comment }) => {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  const renderContent = (text: string) => {
    // Basic regex to find @mentions
    return text.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        return <strong key={index} className="text-brand-accent font-semibold cursor-pointer hover:underline">{part}</strong>;
      }
      return part;
    });
  };

  const authorLink = comment.authorId ? `/profile/${comment.authorId}` : '#';
  const avatarUrl = comment.authorAvatarUrl || `https://i.pravatar.cc/150?u=${comment.authorName}`; // Generic avatar for guests

  return (
    <div className="flex items-start gap-3">
      <Link to={authorLink}>
        <img src={avatarUrl} alt={comment.authorName} className="w-10 h-10 rounded-full object-cover" />
      </Link>
      <div className="flex-1 bg-gray-700/50 p-3 rounded-lg">
        <div className="flex items-baseline gap-2">
            <Link to={authorLink} className="font-bold text-white text-sm hover:underline">{comment.authorName}</Link>
            <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-gray-300 text-sm mt-1">{renderContent(comment.content)}</p>
      </div>
    </div>
  );
};

export default CommentComponent;