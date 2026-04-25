import { Router } from 'express';
import { toggleFollow, getFollowStats, getFollowStatus, searchUsers } from '../controllers/userController';

const router = Router();

/**
 * @route   PATCH /api/v1/users/:userId/follow
 * @desc    Toggle follow/unfollow a user
 * @access  Private (requires authentication)
 * @note    In production, authentication middleware should extract currentUserId from JWT
 *          For now, we use x-user-id header or body.currentUserId for testing
 */
router.patch('/:userId/follow', toggleFollow);

/**
 * @route   GET /api/v1/users/:userId/follow-stats
 * @desc    Get user's followers and following counts
 * @access  Public
 */
router.get('/:userId/follow-stats', getFollowStats);

/**
 * @route   GET /api/v1/users/:userId/follow-status
 * @desc    Check if current user is following target user
 * @access  Private (requires authentication)
 */
router.get('/:userId/follow-status', getFollowStatus);

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users by username, firstName, or lastName
 * @query   {string} q - Search term (required)
 * @access  Public (authenticated users will have current user excluded)
 */
router.get('/search', searchUsers);

export default router;