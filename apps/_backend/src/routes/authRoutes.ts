import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/me', getCurrentUser);

export default router;