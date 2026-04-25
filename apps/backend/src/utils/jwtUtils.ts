import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

/**
 * Generate an access token for a user
 * @param user - The user object (must have _id and email at minimum)
 * @returns JWT token string
 */
export const generateAccessToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    username: user.username,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRY || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Generate a refresh token for a user (optional, for future use)
 * @param user - The user object
 * @returns JWT refresh token string
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    email: user.email,
  };

  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not defined in environment variables');
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRY || '30d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};