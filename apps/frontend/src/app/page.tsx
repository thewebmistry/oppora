'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon } from 'lucide-react';
import PostCard from '../components/social/PostCard';
import { InputField, Button, Card, PageLoader } from '../components/ui';
import apiClient from '../lib/api';
import { IPost } from '@/types/post';

export default function Home() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/posts/latest');
        // API returns { success: true, posts: IPost[] }
        if (response.data.success) {
          // Transform backend posts to match IPost interface
          const backendPosts = response.data.posts.map((post: any) => ({
            _id: post._id,
            author: {
              _id: post.author?._id || 'unknown',
              name: post.author
                ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || post.author.username
                : 'Unknown User',
              avatar: post.author?.avatarUrl,
            },
            content: post.content,
            mediaUrl: post.mediaUrl || '',
            tags: post.tags || [],
            likes: post.likes?.map((like: any) => like._id) || [],
            commentsCount: post.commentsCount || 0,
            isActive: post.isActive,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
          }));
          setPosts(backendPosts);
        } else {
          console.error('Failed to fetch posts:', response.data.message);
          // Fallback to mock data
          setPosts(getMockPosts());
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        // For demo purposes, set mock data
        setPosts(getMockPosts());
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!postText.trim()) return;

    setIsPosting(true);
    try {
      // Send POST request to create post
      const response = await apiClient.post('/posts', {
        content: postText,
        mediaUrl: mediaUrl || undefined,
        tags: [],
      });

      // Success
      alert('Post created successfully!');
      setPostText('');
      setMediaUrl('');
      
      // Force re-fetch of latest posts
      const fetchResponse = await apiClient.get('/posts/latest');
      if (fetchResponse.data.success) {
        const backendPosts = fetchResponse.data.posts.map((post: any) => ({
          _id: post._id,
          author: {
            _id: post.author?._id || 'unknown',
            name: post.author
              ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || post.author.username
              : 'Unknown User',
            avatar: post.author?.avatarUrl,
          },
          content: post.content,
          mediaUrl: post.mediaUrl || '',
          tags: post.tags || [],
          likes: post.likes?.map((like: any) => like._id) || [],
          commentsCount: post.commentsCount || 0,
          isActive: post.isActive,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        }));
        setPosts(backendPosts);
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome to <span className="text-blue-600 dark:text-blue-400">Oppora Social</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Share updates, insights, and connect with the community.
        </p>
      </div>

      {/* Create New Post Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Card padding="lg" shadow hoverEffect>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Create New Post
          </h2>
          <div className="space-y-4">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all resize-y min-h-[120px] shadow-sm focus:shadow-md"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setMediaUrl(prompt('Enter image URL:') || '')}
                >
                  <ImageIcon size={20} />
                  <span className="text-sm">Add Media</span>
                </button>
                {mediaUrl && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Media attached
                  </div>
                )}
              </div>
              <Button
                variant="primary"
                onClick={handleCreatePost}
                disabled={!postText.trim() || isPosting}
                isLoading={isPosting}
                className="flex items-center space-x-2"
              >
                <Send size={18} />
                <span>{isPosting ? 'Posting...' : 'Post'}</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm font-medium">
            Latest Updates
          </span>
        </div>
      </div>

      {/* Feed Section */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <PageLoader message="Loading posts..." size="md" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Card padding="lg" className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Be the first to share an update!
              </p>
              <Button
                variant="primary"
                onClick={() => setPostText('Hello everyone! 👋')}
              >
                Create First Post
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {posts.length} post{posts.length !== 1 ? 's' : ''} •{' '}
          <button
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top
          </button>
        </p>
      </div>
    </div>
  );
}

// Mock data for demonstration
function getMockPosts(): IPost[] {
  return [
    {
      _id: 'post_1',
      author: {
        _id: 'user_1',
        name: 'Alex Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
      content: 'Just launched our new analytics dashboard! Real-time insights with beautiful visualizations. 🚀\n\nCheck it out and let us know what you think!',
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      tags: ['analytics', 'launch', 'dashboard'],
      likes: ['user_2', 'user_3', 'user_4'],
      commentsCount: 12,
      isActive: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'post_2',
      author: {
        _id: 'user_2',
        name: 'Sam Rivera',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      },
      content: 'Working on improving our ML models for better company predictions. The early results look promising!',
      mediaUrl: '',
      tags: ['machinelearning', 'ai', 'predictions'],
      likes: ['user_1', 'user_5'],
      commentsCount: 5,
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'post_3',
      author: {
        _id: 'user_3',
        name: 'Taylor Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
      },
      content: 'Our team just hit a major milestone: 10,000 companies analyzed! 🎉\n\nThank you to everyone who contributed to this achievement.',
      mediaUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      tags: ['milestone', 'achievement', 'team'],
      likes: ['user_1', 'user_2', 'user_4', 'user_5', 'user_6'],
      commentsCount: 24,
      isActive: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
