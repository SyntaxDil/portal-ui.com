import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post, Comment } from '../types';
import { Icon } from './Icon';
import CommentSection from './CommentSection';
import { addReplyToPost } from '../services/firebaseService';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [showReplies, setShowReplies] = useState(false);

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
    return Math.floor(seconds) + " seconds ago";
  };

  const authorLink = post.authorId.startsWith('label_')
    ? `/labels/${post.authorId}`
    : `/profile/${post.authorId}`;
    
  const handleReplyAdded = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
      try {
          const newReply = await addReplyToPost(post.id, commentData);
          setPost(prevPost => ({
              ...prevPost,
              replies: [...(prevPost.replies || []), newReply],
              replyCount: (prevPost.replies || []).length + 1
          }));
      } catch (error) {
          console.error("Failed to add reply:", error);
      }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-2xl">
      <div className="flex items-start space-x-4">
        <Link to={authorLink}>
          <img src={post.authorAvatarUrl} alt={post.authorName} className="w-12 h-12 rounded-full object-cover" />
        </Link>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-white mb-1">{post.title}</h3>
          <div className="text-sm text-gray-400 mb-3">
            Posted by <Link to={authorLink} className="font-medium hover:text-white hover:underline">{post.authorName}</Link>
            <span className="mx-2">&middot;</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center space-x-6 text-gray-400">
        <button className="flex items-center space-x-2 hover:text-brand-accent transition-colors">
          <Icon name="heart" className="w-5 h-5" />
          <span>{post.likes} Likes</span>
        </button>
        <button 
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center space-x-2 hover:text-white transition-colors"
        >
          <Icon name="comment" className="w-5 h-5" />
          <span>{post.replyCount} Replies</span>
        </button>
      </div>
      {showReplies && (
        <div className="mt-4">
          <CommentSection 
            comments={post.replies || []}
            onAddComment={handleReplyAdded}
            placeholder="Write a reply..."
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
