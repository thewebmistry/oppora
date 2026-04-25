import { Request, Response, NextFunction } from 'express';
import { Post } from '../models/Post';
import { User } from '../models/User';
import AppError from '../utils/AppError';

/**
 * Create a new post
 * POST /api/v1/posts
 */
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content, mediaUrl, tags } = req.body;
    
    // Extract user ID from authenticated request (attached by auth middleware)
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    // Validate required fields
    if (!content || content.trim() === '') {
      throw new AppError('Content is required', 400);
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Process tags - ensure they're formatted as hashtags
    let processedTags: string[] = [];
    if (tags && Array.isArray(tags)) {
      processedTags = tags
        .map((tag: string) => {
          // Remove # if already present and trim
          const cleanTag = tag.replace(/^#/, '').trim().toLowerCase();
          return cleanTag ? `#${cleanTag}` : '';
        })
        .filter(Boolean)
        .slice(0, 10); // Limit to 10 tags
    }

    // Create new post
    const newPost = new Post({
      author: userId,
      content: content.trim(),
      mediaUrl: mediaUrl || '',
      tags: processedTags,
      likes: [],
      commentsCount: 0,
      isActive: true,
    });

    await newPost.save();

    // Populate author details for response
    await newPost.populate({
      path: 'author',
      select: 'firstName lastName username avatarUrl',
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest posts (sorted by newest first)
 * GET /api/v1/posts/latest
 */
export const getLatestPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const posts = await Post.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: 'author',
        select: 'firstName lastName username avatarUrl',
      })
      .populate({
        path: 'likes',
        select: 'firstName lastName username',
        options: { limit: 5 }, // Show first 5 likers
      });

    // Transform response to include like count
    const postsWithLikeCount = posts.map(post => ({
      ...post.toObject(),
      likeCount: post.likes.length,
    }));

    res.status(200).json({
      success: true,
      count: posts.length,
      posts: postsWithLikeCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get posts by a specific user
 * GET /api/v1/posts/user/:userId
 */
export const getPostsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ 
      author: userId,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({
        path: 'author',
        select: 'firstName lastName username avatarUrl',
      });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Like a post
 * POST /api/v1/posts/:postId/like
 */
export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (!post.isActive) {
      throw new AppError('Post is not available', 400);
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
      await post.save();
      
      res.status(200).json({
        success: true,
        message: 'Post unliked',
        liked: false,
        likeCount: post.likes.length,
      });
    } else {
      // Like the post
      post.likes.push(userId as any);
      await post.save();
      
      res.status(200).json({
        success: true,
        message: 'Post liked',
        liked: true,
        likeCount: post.likes.length,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a post (soft delete by setting isActive to false)
 * DELETE /api/v1/posts/:postId
 */
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user is the author or an admin
    if (post.author.toString() !== userId.toString()) {
      // In a real app, you'd check user role here
      throw new AppError('Not authorized to delete this post', 403);
    }

    post.isActive = false;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};