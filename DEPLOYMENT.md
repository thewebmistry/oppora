# Production Deployment Configuration

This project includes production-ready deployment configuration files for VPS/PaaS deployment using PM2, Nginx, and Docker.

## Files Created

### 1. PM2 Ecosystem Configuration (`apps/backend/ecosystem.config.js`)
- Manages both backend API and frontend production server
- Configured for cluster mode (utilizes all CPU cores)
- Auto-restart on file changes (development)
- Log rotation and error handling
- Environment-specific configurations

### 2. Nginx Configuration (`apps/frontend/nginx/default.conf`)
- Serves frontend static files from `/usr/share/nginx/html`
- Proxies API requests (`/api/*`) to backend on `localhost:5000`
- WebSocket support for Socket.IO (`/socket.io/`)
- Gzip compression enabled for performance
- Security headers and caching optimizations
- SPA routing support (fallback to `index.html`)

### 3. Updated Package.json Scripts
**Backend (`apps/backend/package.json`):**
- `dev`: Development server with nodemon
- `build`: TypeScript compilation
- `start`: Production server (runs compiled JS)
- `prod`: Production start with NODE_ENV=production
- `deploy`: Build and start with PM2

**Frontend (`apps/frontend/package.json`):**
- `dev`: Next.js development server
- `build`: Next.js production build
- `start`: Next.js production server
- `prod`: Production start with NODE_ENV=production
- `deploy`: Build and start with PM2

### 4. Docker Configuration
**Backend (`apps/backend/Dockerfile.backend`):**
- Multi-stage build using Node 18 Alpine
- Installs dependencies, builds TypeScript
- Runs as non-root user for security
- Health check endpoint included
- Exposes port 5000

**Frontend (`apps/frontend/Dockerfile.frontend`):**
- Multi-stage build for Next.js optimization
- Option to serve with Node.js or Nginx
- Non-root user for security
- Health check endpoint
- Exposes port 3000

## Deployment Instructions

### Option 1: Traditional VPS Deployment (Ubuntu/CentOS)

1. **Install Dependencies:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs nginx
   
   # Install PM2 globally
   sudo npm install -g pm2
   ```

2. **Clone and Setup:**
   ```bash
   git clone <your-repo-url>
   cd company-intelligence-platform
   
   # Install dependencies
   cd apps/backend && npm ci --only=production
   cd ../frontend && npm ci --only=production
   
   # Build applications
   cd ../backend && npm run build
   cd ../frontend && npm run build
   ```

3. **Configure Nginx:**
   ```bash
   # Copy Nginx config
   sudo cp apps/frontend/nginx/default.conf /etc/nginx/sites-available/company-intel
   sudo ln -s /etc/nginx/sites-available/company-intel /etc/nginx/sites-enabled/
   
   # Copy frontend build to Nginx root
   sudo cp -r apps/frontend/.next/static /usr/share/nginx/html/_next/static
   sudo cp -r apps/frontend/public /usr/share/nginx/html
   sudo cp apps/frontend/.next/server/pages-manifest.json /usr/share/nginx/html/
   
   # Test and restart Nginx
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Start Backend with PM2:**
   ```bash
   cd apps/backend
   pm2 start ecosystem.config.js --env production
   
   # Save PM2 process list for auto-start
   pm2 save
   pm2 startup
   ```

5. **Configure Environment Variables:**
   ```bash
   # Create .env file in backend
   cp .env.example .env
   # Edit with your production values
   nano .env
   ```

### Option 2: Docker Deployment

1. **Build Docker Images:**
   ```bash
   # Build backend
   docker build -f apps/backend/Dockerfile.backend -t company-intel-backend .
   
   # Build frontend
   docker build -f apps/frontend/Dockerfile.frontend -t company-intel-frontend .
   ```

2. **Run with Docker Compose (create docker-compose.yml):**
   ```yaml
   version: '3.8'
   services:
     backend:
       image: company-intel-backend
       container_name: company-intel-backend
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongodb:27017/company_intel
       depends_on:
         - mongodb
       restart: unless-stopped
     
     frontend:
       image: company-intel-frontend
       container_name: company-intel-frontend
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - NEXT_PUBLIC_API_URL=http://localhost:5000
       depends_on:
         - backend
       restart: unless-stopped
     
     nginx:
       image: nginx:alpine
       container_name: company-intel-nginx
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./apps/frontend/nginx/default.conf:/etc/nginx/conf.d/default.conf
         - ./apps/frontend/public:/usr/share/nginx/html
       depends_on:
         - frontend
       restart: unless-stopped
     
     mongodb:
       image: mongo:latest
       container_name: company-intel-mongodb
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db
       restart: unless-stopped
   
   volumes:
     mongodb_data:
   ```

3. **Start Services:**
   ```bash
   docker-compose up -d
   ```

### Option 3: PM2 Only (Simplified)

1. **Run both services with PM2:**
   ```bash
   cd apps/backend
   pm2 start ecosystem.config.js
   
   # Monitor logs
   pm2 logs
   
   # Check status
   pm2 status
   ```

## Environment Variables

**Backend (.env):**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/company_intel
JWT_SECRET=your-secret-key
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Monitoring and Maintenance

1. **PM2 Commands:**
   ```bash
   pm2 status                 # Check status
   pm2 logs                  # View logs
   pm2 monit                 # Monitor resources
   pm2 restart all           # Restart all apps
   pm2 delete ecosystem.config.js  # Stop and delete
   ```

2. **Nginx Logs:**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Health Checks:**
   - Backend: `http://localhost:5000/api/health`
   - Frontend: `http://localhost:3000`

## Security Considerations

1. **Firewall:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

2. **SSL/TLS (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

3. **Database Security:**
   - Use strong passwords
   - Enable authentication in MongoDB
   - Restrict network access

## Render.com Deployment (PaaS)

For deploying to Render.com, follow these steps:

### Backend API Service
1. Create a new **Web Service** on Render
2. Set **Build Context** to `apps/backend`
3. Set **Build Command** to `npm run build`
4. Set **Start Command** to `npm start`
5. Set **Health Check Path** to `/health`
6. Add environment variables:
   - `PORT`: (automatically set by Render)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `CLIENT_URL`: Your frontend URL

### Frontend Web Service
1. Create a new **Web Service** on Render
2. Set **Build Context** to `apps/frontend`
3. Set **Build Command** to `npm run build`
4. Set **Start Command** to `npm start`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend-service.onrender.com`)

### Important Notes
- Render automatically sets the `PORT` environment variable
- The backend includes a health check endpoint at `/health` returning `{ status: 'ok' }`
- For WebSocket support (Socket.IO), ensure CORS is properly configured in `server.ts`
- Consider using Render's PostgreSQL or MongoDB Atlas for database

## Troubleshooting

1. **Port Conflicts:**
   ```bash
   sudo lsof -i :5000  # Check what's using port 5000
   sudo kill -9 <PID>  # Kill process if needed
   ```

2. **PM2 Issues:**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js --env production
   ```

3. **Nginx Configuration Test:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
2. Configure monitoring (Prometheus, Grafana)
3. Implement backup strategy for database
4. Set up logging aggregation (ELK stack)
5. Configure CDN for static assets

For detailed instructions, refer to individual configuration files.