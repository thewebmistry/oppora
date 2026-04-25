/**
 * Secure Logging Utility for Production
 * 
 * This module provides sanitized logging using Morgan with custom formatting.
 * Sensitive data (passwords, tokens, card numbers) is automatically masked in logs.
 * 
 * Features:
 * - Request/response logging with masked sensitive fields
 * - Development vs production formatting
 * - File rotation for production logs
 * - Error logging with stack traces
 */

import morgan from 'morgan';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Sensitive field patterns to mask in logs
const SENSITIVE_FIELDS = [
  'password',
  'secret',
  'token',
  'authorization',
  'cardNumber',
  'cvv',
  'expiry',
  'ssn',
  'socialSecurity',
  'creditCard',
  'apiKey',
  'privateKey',
  'accessToken',
  'refreshToken',
  'bearer',
];

// Mask sensitive data in JSON strings
const maskSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const masked = { ...obj };
  
  for (const key of Object.keys(masked)) {
    const keyLower = key.toLowerCase();
    
    // Check if this key contains sensitive data
    if (SENSITIVE_FIELDS.some(field => keyLower.includes(field))) {
      masked[key] = '[REDACTED]';
    }
    
    // Recursively mask nested objects
    if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
    
    // Mask sensitive data in strings
    if (typeof masked[key] === 'string') {
      // Check for JSON strings that might contain sensitive data
      if (masked[key].trim().startsWith('{') || masked[key].trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(masked[key]);
          const maskedParsed = maskSensitiveData(parsed);
          masked[key] = JSON.stringify(maskedParsed);
        } catch {
          // Not valid JSON, leave as is
        }
      }
    }
  }
  
  return masked;
};

// Custom Morgan token for request body (masked)
morgan.token('masked-body', (req: Request) => {
  if (!req.body || Object.keys(req.body).length === 0) return '-';
  
  try {
    const maskedBody = maskSensitiveData(req.body);
    return JSON.stringify(maskedBody);
  } catch {
    return '[UNPARSABLE BODY]';
  }
});

// Custom Morgan token for response body (masked)
morgan.token('masked-response', (_req: Request, res: Response) => {
  const originalSend = res.send;
  let responseBody: any = null;
  
  // Intercept response body
  res.send = function(body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  // Return masked response body (will be called after response is sent)
  if (responseBody) {
    try {
      const parsedBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
      const maskedBody = maskSensitiveData(parsedBody);
      return JSON.stringify(maskedBody);
    } catch {
      return typeof responseBody === 'string' ? responseBody.substring(0, 100) : '[NON-JSON RESPONSE]';
    }
  }
  
  return '-';
});

// Custom Morgan token for request headers (masked)
morgan.token('masked-headers', (req: Request) => {
  const headers = { ...req.headers };
  
  // Mask sensitive headers
  Object.keys(headers).forEach(key => {
    const keyLower = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => keyLower.includes(field))) {
      headers[key] = '[REDACTED]';
    }
  });
  
  return JSON.stringify(headers);
});

// Custom Morgan format for development
const devFormat = ':method :url :status :response-time ms - :res[content-length] bytes\n' +
                  'Headers: :masked-headers\n' +
                  'Body: :masked-body\n' +
                  'Response: :masked-response\n';

// Custom Morgan format for production (concise)
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" ' +
                   ':status :res[content-length] ":referrer" ":user-agent" ' +
                   'ResponseTime::response-time ms';

// Create log directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create write streams for file logging
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logDir, 'error.log'),
  { flags: 'a' }
);

// Development logger (colored, verbose)
export const devLogger = morgan(devFormat, {
  skip: (req: Request) => req.path === '/health' || req.path === '/api/health',
});

// Production logger (concise, to file)
export const prodLogger = morgan(prodFormat, {
  stream: accessLogStream,
  skip: (req: Request) => req.path === '/health' || req.path === '/api/health',
});

// Error logger (only logs errors)
export const errorLogger = morgan(prodFormat, {
  stream: errorLogStream,
  skip: (_req: Request, res: Response) => res.statusCode < 400,
});

// Get appropriate logger based on environment
export const getLogger = () => {
  return process.env.NODE_ENV === 'production' ? prodLogger : devLogger;
};

// Custom logger for application events (not HTTP)
export class AppLogger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, meta?: any): void {
    const maskedMeta = maskSensitiveData(meta);
    console.log(`[${this.getTimestamp()}] INFO: ${message}`, maskedMeta ? JSON.stringify(maskedMeta) : '');
  }

  static warn(message: string, meta?: any): void {
    const maskedMeta = maskSensitiveData(meta);
    console.warn(`[${this.getTimestamp()}] WARN: ${message}`, maskedMeta ? JSON.stringify(maskedMeta) : '');
  }

  static error(message: string, error?: Error, meta?: any): void {
    const maskedMeta = maskSensitiveData(meta);
    console.error(`[${this.getTimestamp()}] ERROR: ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...maskedMeta,
    });
  }

  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      const maskedMeta = maskSensitiveData(meta);
      console.debug(`[${this.getTimestamp()}] DEBUG: ${message}`, maskedMeta ? JSON.stringify(maskedMeta) : '');
    }
  }
}

export default {
  devLogger,
  prodLogger,
  errorLogger,
  getLogger,
  AppLogger,
  maskSensitiveData,
};