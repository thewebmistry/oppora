/**
 * Security Headers Middleware for Production Hardening
 * 
 * This module configures Helmet.js with strict security headers to protect against
 * common web vulnerabilities like XSS, clickjacking, MIME-type sniffing, etc.
 * 
 * Also includes custom security headers and cache control for authentication responses.
 */

import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Sensitive paths that should never be cached
const SENSITIVE_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/logout',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify',
  '/api/v1/profile',
  '/api/v1/user',
];

/**
 * Configure Helmet with production security settings
 */
const helmetConfig = helmet({
  // Basic security headers (defaults are good)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for simplicity
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for legacy
      imgSrc: ["'self'", "data:", "https:"], // Allow images from any HTTPS source
      connectSrc: ["'self'", "ws:", "wss:"], // Allow WebSocket connections
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"], // Disable iframes (prevent clickjacking)
    },
  },
  crossOriginEmbedderPolicy: false, // Allow cross-origin resources (needed for some APIs)
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' }, // Prevent clickjacking
  hidePoweredBy: true, // Remove X-Powered-By header
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true, // Prevent IE from executing downloads
  noSniff: true, // Prevent MIME-type sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true, // Enable XSS filter
});

/**
 * Custom security headers middleware
 * Adds additional security headers not covered by Helmet
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Apply Helmet security headers
  helmetConfig(req, res, () => {});

  // Custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Feature Policy (legacy, replaced by Permissions-Policy)
  res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'; geolocation 'none'");

  // Prevent browser from storing sensitive authentication responses
  if (SENSITIVE_PATHS.some(path => req.path.includes(path))) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  // Add security headers for API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // Prevent search engines from indexing API
  }

  next();
};

/**
 * CORS configuration for production
 * Restrict origins to trusted domains only
 */
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'])
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'Accept',
    'Origin',
    'Cache-Control',
  ],
  exposedHeaders: ['X-API-Version', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
};

/**
 * Content Security Policy (CSP) report-only middleware
 * Use in development to test CSP without breaking the site
 */
export const cspReportOnly = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    reportUri: '/api/v1/security/csp-violation',
  },
  reportOnly: true,
});

export default securityHeaders;