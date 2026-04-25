import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { connectToDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import postRoutes from './routes/postRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';
import errorHandler from './middleware/errorHandler';
import { setupSocketHandlers } from './utils/socketHandlers';
import { setupWebRTCHandlers } from './utils/webrtcHandlers';

// Security middlewares
import { standardLimiter, authLimiter } from './middleware/rateLimiter';
import securityHeaders, { corsOptions } from './middleware/securityHeaders';
import { getLogger } from './utils/logger';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

// Setup Socket.IO event handlers for chat
setupSocketHandlers(io);

// Setup WebRTC signaling handlers
setupWebRTCHandlers(io);

// Middlewares - Security first!
app.use(securityHeaders); // Custom security headers with Helmet
app.use(cors(corsOptions)); // CORS with production settings
app.use(getLogger()); // Secure logging with sensitive data masking
app.use(standardLimiter); // Global rate limiting (100 requests/15min)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Simple health check for Render.com uptime monitoring
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Auth routes with stricter rate limiting (20 requests/15min)
app.use('/api/v1/auth', authLimiter, authRoutes);

// Company routes
app.use('/api/v1/companies', companyRoutes);

// Post routes
app.use('/api/v1/posts', postRoutes);

// Product routes
app.use('/api/v1/products', productRoutes);

// User routes
app.use('/api/v1/users', userRoutes);

// Payment routes
app.use('/api/v1/payment', paymentRoutes);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.send('Company Intelligence Platform Backend');
});

// Error handling middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('Attempting to connect to DB...');
    await connectToDatabase();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`📡 Socket.IO server is ready for real-time connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;