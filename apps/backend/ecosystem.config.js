/**
 * PM2 Ecosystem Configuration for Company Intelligence Platform
 * 
 * This file configures PM2 to manage both backend API and frontend production server.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 delete ecosystem.config.js
 *   pm2 logs
 * 
 * Deployment:
 *   1. Build both applications first:
 *      - Backend: npm run build (in apps/backend)
 *      - Frontend: npm run build (in apps/frontend)
 *   2. Start PM2: pm2 start ecosystem.config.js
 *   3. Enable startup: pm2 startup && pm2 save
 */

module.exports = {
  apps: [
    {
      name: 'company-intel-platform-backend',
      script: 'npm',
      args: 'start',
      cwd: './apps/backend',
      instances: 'max',           // Utilize all CPU cores (cluster mode)
      exec_mode: 'cluster',       // Run in cluster mode for load balancing
      watch: true,                // Auto-restart on file changes (development)
      ignore_watch: [             // Ignore these paths from triggering restart
        'node_modules',
        'logs',
        '.git',
        'dist'
      ],
      max_memory_restart: '1G',   // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true                  // Prefix logs with timestamp
    },
    {
      name: 'company-intel-platform-frontend',
      script: 'npm',
      args: 'start',
      cwd: './apps/frontend',
      instances: 1,               // Next.js doesn't support cluster mode natively
      exec_mode: 'fork',          // Fork mode for Next.js
      watch: false,               // Disable watch in production (use Nginx for static serving)
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/company-intelligence-platform.git',
      path: '/var/www/company-intel-platform',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};