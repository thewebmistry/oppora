import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import AppError from '../utils/AppError';
import { generateAccessToken } from '../utils/jwtUtils';

/**
 * Helper function to generate a unique username from email
 * Logic: Take email (e.g., "rahul.k@gmail.com"), extract the part before '@',
 * replace special chars with '.', convert to lowercase.
 * Add a random 4-digit suffix if it already exists in the DB to ensure uniqueness.
 */
const generateUniqueUsername = async (email: string): Promise<string> => {
  // Extract part before '@'
  const emailPart = email.split('@')[0];
  
  // Replace special characters (non-alphanumeric) with '.'
  let baseUsername = emailPart.replace(/[^a-zA-Z0-9]/g, '.').toLowerCase();
  
  // Remove leading/trailing dots and replace multiple consecutive dots with single dot
  baseUsername = baseUsername.replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
  
  // If baseUsername is empty after cleaning, use a default
  if (!baseUsername) {
    baseUsername = 'user';
  }

  // Ensure username length constraints (3-30 characters)
  if (baseUsername.length > 30) {
    baseUsername = baseUsername.substring(0, 30);
  }
  if (baseUsername.length < 3) {
    baseUsername = baseUsername.padEnd(3, 'a');
  }

  let username = baseUsername;
  let suffix = '';
  let attempts = 0;
  const maxAttempts = 10;

  // Check if username exists in DB, if yes append random suffix
  while (attempts < maxAttempts) {
    const existingUser = await User.findOne({ username: username + suffix });
    if (!existingUser) {
      return username + suffix;
    }
    
    // Generate a random 4-digit suffix
    suffix = '.' + Math.floor(1000 + Math.random() * 9000).toString();
    attempts++;
  }

  // If all attempts fail, throw error
  throw new AppError('Could not generate a unique username. Please try again.', 500);
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Email, password, first name, and last name are required', 400);
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique username
    const username = await generateUniqueUsername(email);

    // Create new user object
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      role: role || 'user',
      isVerified: false,
      avatarUrl: '',
      bio: '',
      socialLinks: {},
    });

    // Save to database
    const savedUser = await newUser.save();

    // Generate JWT access token
    const accessToken = generateAccessToken(savedUser);

    // Prepare response user object (exclude passwordHash)
    const userResponse = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      avatarUrl: savedUser.avatarUrl,
      bio: savedUser.bio,
      socialLinks: savedUser.socialLinks,
      isVerified: savedUser.isVerified,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user by email (include passwordHash field which is normally excluded)
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active (isVerified can be used as active flag)
    if (!user.isVerified) {
      throw new AppError('Account is not verified. Please verify your email.', 403);
    }

    // Compare entered password with stored hash using the model's matchPassword method
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT access token
    const accessToken = generateAccessToken(user);

    // Prepare response user object (exclude passwordHash)
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      socialLinks: user.socialLinks,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile (protected route - to be used with auth middleware)
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Assuming user ID is attached to request by auth middleware
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      socialLinks: user.socialLinks,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};