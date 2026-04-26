/**
 * Rate Limiting Middleware for Production Security
 * 
 * This module provides two rate limiters to protect against DDoS and brute force attacks:
 * 1. standardLimiter: General API usage (100 requests per 15 minutes)
 * 2. authLimiter: Strict limit for authentication endpoints (20 requests per 15 minutes)
 * 
 * Uses express-rate-limit with Redis store recommended for production (not implemented here).
 */

import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

// Common rate limit configuration
const createLimiter = (options: Partial<Options>) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count all requests, successful or not
    skip: (_req: Request) => {
      // Skip rate limiting for health checks and internal IPs in production
      if (_req.path === '/health' || _req.path === '/api/health') return true;
      // Add IP whitelist logic here if needed
      return false;
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil(options.windowMs! / 1000),
      });
    },
    ...options,
  });
};

/**
 * Standard Rate Limiter: 100 requests per 15 minutes
 * Applied to general API endpoints
 */
export const standardLimiter = createLimiter({
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

/**
 * Authentication Rate Limiter: 20 requests per 15 minutes
 * Applied to login, register, password reset endpoints
 * More restrictive to prevent brute force attacks
 */
export const authLimiter = createLimiter({
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  skipFailedRequests: false, // Count failed requests (important for auth)
});

/**
 * API Key Rate Limiter (Optional): For third-party API consumers
 * Applied to endpoints requiring API keys
 *
 * Note: Temporarily commented due to TypeScript compilation issues with ipKeyGenerator
 * To enable: Uncomment and ensure proper ipKeyGenerator import from 'express-rate-limit'
 */
// export const apiKeyLimiter = createLimiter({
//   max: 1000, // Higher limit for authenticated API keys
//   keyGenerator: (req: Request) => {
//     // Use API key instead of IP for rate limiting
//     const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;
//     return apiKey || req.ip || 'unknown';
//   },
// });

/**
 * Socket.IO Rate Limiter (Optional): For WebSocket connections
 * Applied to Socket.IO events to prevent flooding
 */
export const socketLimiter = (max: number = 50) => {
  const connections = new Map<string, { count: number; resetTime: number }>();
  
  return (socketId: string) => {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    
    if (!connections.has(socketId)) {
      connections.set(socketId, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    const data = connections.get(socketId)!;
    
    // Reset counter if window has passed
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return true;
    }
    
    // Increment and check limit
    data.count += 1;
    if (data.count > max) {
      return false;
    }
    
    return true;
  };
};

export default {
  standardLimiter,
  authLimiter,
  socketLimiter,
};