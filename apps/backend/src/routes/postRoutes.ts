import { Router } from 'express';
import {
  createPost,
  getLatestPosts,
  getPostsByUser,
  likePost,
  deletePost,
} from '../controllers/postController';

const router = Router();

/**
 * @route   POST /api/v1/posts
 * @desc    Create a new post
 * @access  Private (requires authentication)
 */
router.post('/', createPost);

/**
 * @route   GET /api/v1/posts/latest
 * @desc    Get latest posts (sorted by newest first)
 * @access  Public
 */
router.get('/latest', getLatestPosts);

/**
 * @route   GET /api/v1/posts/user/:userId
 * @desc    Get posts by a specific user
 * @access  Public
 */
router.get('/user/:userId', getPostsByUser);

/**
 * @route   POST /api/v1/posts/:postId/like
 * @desc    Like or unlike a post
 * @access  Private (requires authentication)
 */
router.post('/:postId/like', likePost);

/**
 * @route   DELETE /api/v1/posts/:postId
 * @desc    Delete a post (soft delete)
 * @access  Private (requires authentication - author only)
 */
router.delete('/:postId', deletePost);

export default router;