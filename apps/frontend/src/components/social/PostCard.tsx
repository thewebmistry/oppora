'use client';

import { IPost } from '@/types/post';
import Card from '../ui/Card';
import { Heart, MessageCircle, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface PostCardProps {
  post: IPost;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    // TODO: Implement API call to like/unlike
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Card
        padding="md"
        border
        hoverEffect={false}
        className="border-b border-gray-200 dark:border-gray-700 rounded-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                post.author.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {post.author.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {post.content}
          </p>
          {post.mediaUrl && (
            <div className="mt-4 rounded-xl overflow-hidden max-h-96">
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            >
              <Heart
                size={20}
                fill={isLiked ? 'currentColor' : 'none'}
                className={isLiked ? 'text-red-500' : ''}
              />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{post.commentsCount}</span>
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {post.isActive ? 'Active' : 'Archived'}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}