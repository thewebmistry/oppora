import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import AppError from '../utils/AppError';
import { Types } from 'mongoose';

/**
 * Helper to extract current user ID from request
 * In production, this would come from auth middleware (req.user.id)
 * For testing, we support x-user-id header or body.currentUserId
 */
const getCurrentUserId = (req: Request): string | null => {
  // Try header first
  const headerValue = req.headers['x-user-id'];
  if (headerValue) {
    if (Array.isArray(headerValue)) {
      return headerValue[0]; // take first
    }
    return headerValue;
  }
  
  // Try body
  if (req.body.currentUserId && typeof req.body.currentUserId === 'string') {
    return req.body.currentUserId;
  }
  
  return null;
};

/**
 * Toggle follow/unfollow a user
 * PATCH /api/v1/users/:userId/follow
 * Requires authentication (currentUserId extracted from request context)
 */
export const toggleFollow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    // Ensure targetUserId is a string
    const targetUserId = Array.isArray(userId) ? userId[0] : userId;
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      throw new AppError('Authentication required', 401);
    }

    if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
      throw new AppError('Invalid target user ID', 400);
    }

    if (currentUserId === targetUserId) {
      throw new AppError('You cannot follow yourself', 400);
    }

    // Find both users
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!currentUser) {
      throw new AppError('Current user not found', 404);
    }
    if (!targetUser) {
      throw new AppError('Target user not found', 404);
    }

    // Check if already following
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    let message: string;
    let action: 'follow' | 'unfollow';

    if (isFollowing) {
      // Unfollow: remove from following and followers
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
      );
      message = `Unfollowed ${targetUser.username}`;
      action = 'unfollow';
    } else {
      // Follow: add to following and followers
      currentUser.following.push(new Types.ObjectId(targetUserId));
      targetUser.followers.push(new Types.ObjectId(currentUserId));
      message = `You are now following ${targetUser.username}`;
      action = 'follow';
    }

    // Save both users
    await Promise.all([currentUser.save(), targetUser.save()]);

    // Get updated counts
    const followingCount = currentUser.following.length;
    const followersCount = targetUser.followers.length;

    res.status(200).json({
      success: true,
      action,
      message,
      data: {
        followingCount,
        followersCount,
        isFollowing: !isFollowing, // new state after toggle
        targetUser: {
          id: targetUser._id,
          username: targetUser.username,
          avatarUrl: targetUser.avatarUrl,
          followersCount
        },
        currentUser: {
          id: currentUser._id,
          username: currentUser.username,
          followingCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's followers and following counts
 * GET /api/v1/users/:userId/follow-stats
 */
export const getFollowStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    // Ensure userId is a string
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    if (!userIdStr || !Types.ObjectId.isValid(userIdStr)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(userIdStr).select('followers following username avatarUrl');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        // Optionally include lists (could be paginated in future)
        // followers: user.followers,
        // following: user.following
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if current user is following target user
 * GET /api/v1/users/:userId/follow-status
 */
export const getFollowStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    // Ensure targetUserId is a string
    const targetUserId = Array.isArray(userId) ? userId[0] : userId;
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      throw new AppError('Authentication required', 401);
    }

    if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
      throw new AppError('Invalid target user ID', 400);
    }

    const currentUser = await User.findById(currentUserId).select('following');
    
    if (!currentUser) {
      throw new AppError('Current user not found', 404);
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    res.status(200).json({
      success: true,
      data: {
        isFollowing,
        targetUserId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search users by username, firstName, or lastName
 * GET /api/v1/users/search
 * Query param: q (search term)
 */
export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const searchTerm = req.query.q as string | undefined;
    const currentUserId = getCurrentUserId(req);

    if (!searchTerm || searchTerm.trim() === '') {
      throw new AppError('Search term (q) is required', 400);
    }

    const searchRegex = { $regex: searchTerm.trim(), $options: 'i' };
    
    // Build filter to search across multiple fields
    const filter: any = {
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
      ],
    };

    // Exclude current user if authenticated
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    // Execute search with limit for performance
    const users = await User.find(filter)
      .select('username firstName lastName avatarUrl')
      .limit(20) // Limit results for performance
      .lean();

    // Format response
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      avatarUrl: user.avatarUrl || '',
    }));

    res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        count: formattedUsers.length,
        searchTerm: searchTerm.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
};