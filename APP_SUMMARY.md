# Company Intelligence Platform - Master Documentation

## Overview
The Company Intelligence Platform is a full-stack web application designed to analyze, compare, and rate companies across multiple categories (MLM, Crypto, E-commerce). It provides real-time collaboration features, social networking, and intelligent scoring algorithms to help users make informed business decisions.

## Architecture

### Backend (Node.js/Express/MongoDB)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing
- **Real-time**: Socket.IO for WebSocket communication
- **API Design**: RESTful API with structured error handling
- **Security**: Helmet, CORS, rate limiting, security headers

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4
- **State Management**: React Query (TanStack Query) for server state
- **UI Components**: Custom component library with Framer Motion animations
- **Real-time**: Socket.IO client for WebSocket connections
- **Charts**: Recharts for data visualization

### Real-time Features
- **WebSocket Signaling**: Socket.IO for real-time messaging
- **WebRTC Integration**: Peer-to-peer video calls and screen sharing
- **Live Chat**: Real-time messaging between users
- **Collaborative Features**: Real-time company rating updates

## Key Features Matrix

### Social Features
- User profiles with follow/unfollow functionality
- Company reviews and ratings
- Social feed with posts and comments
- Direct messaging and group chats
- Notification system

### Commerce Features
- Company product listings
- Payment integration (Stripe/Razorpay)
- Subscription plans with tiered pricing
- Transaction history and invoicing

### Intelligence Features
- Automated scoring engine (trust score, growth trend, risk level)
- Company comparison tools with radar charts
- MLM vs Crypto vs E-commerce category analysis
- Data visualization with interactive charts
- AI-powered insights (planned)

### Real-time Features
- Live chat between users
- Video conferencing with WebRTC
- Real-time notifications
- Collaborative document editing (planned)
- Live dashboard updates

## Tech Stack Details

### Backend Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5+
- **Web Framework**: Express.js 4.21+
- **Database**: MongoDB 8.8+ with Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **Real-time**: Socket.IO 4.8+
- **Validation**: Built-in Mongoose validation
- **Logging**: Morgan with Winston (custom logger)
- **Security**: Helmet, express-rate-limit, CORS
- **Environment**: dotenv for configuration

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: React Query v5, React Context
- **UI Library**: Custom components with Lucide React icons
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Real-time**: Socket.IO client
- **HTTP Client**: Axios
- **PWA**: Next-PWA for offline capability

### DevOps & Deployment
- **Process Manager**: PM2 for production
- **Web Server**: Nginx for reverse proxy
- **Containerization**: Docker with multi-stage builds
- **SSL**: Let's Encrypt via Certbot
- **Monitoring**: PM2 monitoring dashboard
- **Logging**: Rotating logs with PM2-logrotate

## Project Structure

```
Oppora/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/          # Database, environment config
│   │   │   ├── controllers/     # Route controllers
│   │   │   ├── middleware/      # Auth, error handling, security
│   │   │   ├── models/          # Mongoose schemas
│   │   │   ├── routes/          # API route definitions
│   │   │   ├── types/           # TypeScript type definitions
│   │   │   ├── utils/           # Utilities, logger, handlers
│   │   │   └── server.ts        # Entry point
│   │   ├── ecosystem.config.js  # PM2 configuration
│   │   ├── Dockerfile.backend   # Docker configuration
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── app/             # Next.js App Router pages
│       │   ├── components/      # React components
│       │   ├── hooks/           # Custom React hooks
│       │   ├── lib/             # API clients, utilities
│       │   ├── providers/       # Context providers
│       │   └── types/           # TypeScript types
│       ├── nginx/               # Nginx configuration
│       ├── Dockerfile.frontend  # Docker configuration
│       └── package.json
├── DEPLOYMENT.md                # Deployment documentation
├── APP_SUMMARY.md               # This file
└── DEPLOYMENT_CHECKLIST.md      # Step-by-step deployment guide
```

## How to Run Locally

### Prerequisites
- Node.js 18+ installed
- MongoDB 6+ running locally or accessible
- Git for version control

### Step 1: Clone and Setup
```bash
git clone <repository-url>
cd Oppora
```

### Step 2: Backend Setup
```bash
cd apps/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
# No .env required for basic setup
```

### Step 4: Start Development Servers

**Option A: Separate terminals**
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

**Option B: Using PM2 (development)**
```bash
cd apps/backend
pm2 start ecosystem.config.js --env development
```

### Step 5: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs (if enabled)

## How to Run in Production

### Using PM2 & Nginx (Recommended)
1. Build both projects:
   ```bash
   cd apps/backend && npm run build
   cd ../frontend && npm run build
   ```

2. Start with PM2:
   ```bash
   cd apps/backend
   pm2 start ecosystem.config.js --env production
   ```

3. Configure Nginx as reverse proxy (see DEPLOYMENT_CHECKLIST.md)

### Using Docker
```bash
# Build and run backend
docker build -f Dockerfile.backend -t backend .
docker run -p 5000:5000 backend

# Build and run frontend
docker build -f Dockerfile.frontend -t frontend .
docker run -p 3000:3000 frontend
```

## Database Schema

### Core Models
1. **User**: User accounts with authentication details
2. **Company**: Company profiles with category-specific fields
3. **Post**: Social posts with comments and likes
4. **Product**: Product listings for companies
5. **Transaction**: Payment transactions
6. **Plan**: Subscription plans

### Company Categories
- **MLM**: Multi-level marketing companies with business metrics
- **Crypto**: Cryptocurrency projects with token details
- **E-commerce**: Online retail businesses with product catalogs

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Companies
- `GET /api/companies` - List all companies
- `GET /api/companies/:slug` - Get company by slug
- `POST /api/companies` - Create new company (admin)
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Real-time Endpoints
- WebSocket: `ws://localhost:5000` (Socket.IO)
- WebRTC Signaling: `/socket.io/` namespace

## Troubleshooting Guide

### Common Issues

#### 1. MongoDB Connection Failed
**Symptoms**: "MongoServerError: connect ECONNREFUSED"
**Solution**:
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`: `MONGODB_URI=mongodb://localhost:27017/company_intelligence`
- Start MongoDB service: `sudo systemctl start mongod` (Linux) or `brew services start mongodb-community` (Mac)

#### 2. Port Already in Use
**Symptoms**: "Error: listen EADDRINUSE: address already in use :::5000"
**Solution**:
- Find and kill process: `lsof -ti:5000 | xargs kill -9` (Unix) or `netstat -ano | findstr :5000` (Windows)
- Change port in `.env`: `PORT=5001`

#### 3. TypeScript Compilation Errors
**Symptoms**: "Cannot find module" or type errors
**Solution**:
- Install dependencies: `npm install`
- Check TypeScript version: `npx tsc --version`
- Clean and rebuild: `rm -rf dist && npm run build`

#### 4. Socket.IO Connection Issues
**Symptoms**: WebSocket errors or disconnections
**Solution**:
- Check CORS configuration in backend
- Ensure frontend uses correct WebSocket URL: `ws://localhost:5000`
- Verify Socket.IO server is running: check PM2 logs

#### 5. Next.js Build Failures
**Symptoms**: Build errors or memory issues
**Solution**:
- Clear Next.js cache: `rm -rf .next`
- Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
- Check TypeScript errors: `npx tsc --noEmit`

### Logs Location
- **Backend logs**: `apps/backend/logs/` (access.log, error.log)
- **PM2 logs**: `pm2 logs`
- **Nginx logs**: `/var/log/nginx/` (access.log, error.log)

### Performance Optimization
1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Implement Redis for session and API response caching
3. **CDN**: Use CDN for static assets in production
4. **Compression**: Enable Gzip compression in Nginx
5. **Image Optimization**: Use Next.js Image component with optimized formats

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/company_intelligence
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local) - Optional
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

## Development Workflow

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Commit conventions (feat, fix, chore, etc.)

### Testing
- Jest for unit testing
- Supertest for API testing
- React Testing Library for component testing

### Deployment Pipeline
1. Development → Staging → Production
2. Automated testing on pull requests
3. Docker image builds on main branch
4. PM2 zero-downtime reloads

## Security Considerations

### Implemented Security Measures
- Password hashing with bcrypt
- JWT token expiration and refresh
- Rate limiting on authentication endpoints
- Helmet.js for security headers
- CORS configuration for allowed origins
- Input validation and sanitization
- MongoDB injection prevention via Mongoose

### Recommended Additional Measures
- Implement 2FA for user authentication
- Regular security dependency audits
- SQL/NoSQL injection testing
- XSS and CSRF protection
- Regular backup of database

## Scaling Strategy

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries with indexes
- Implement connection pooling

### Horizontal Scaling
- Load balancing with Nginx
- Database replication (MongoDB replica sets)
- Session storage in Redis
- Microservices architecture for future growth

### Monitoring & Alerting
- PM2 monitoring dashboard
- Application performance monitoring (APM)
- Error tracking with Sentry
- Log aggregation with ELK stack

## Support & Maintenance

### Regular Maintenance Tasks
1. Update dependencies: `npm audit fix`
2. Database backup and optimization
3. Log rotation and cleanup
4. SSL certificate renewal
5. Performance monitoring and tuning

### Getting Help
- Check existing documentation
- Review error logs in `apps/backend/logs/`
- Search for similar issues in GitHub repository
- Contact development team for critical issues

---

*Last Updated: April 2025*  
*Documentation Version: 1.0*  
*Maintained by: Technical Lead & DevOps Team*