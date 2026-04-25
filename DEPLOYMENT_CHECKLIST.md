# Deployment Checklist - Hostinger/VPS Linux Server

## Overview
This checklist provides a step-by-step guide for deploying the Company Intelligence Platform on a Linux VPS (Ubuntu 22.04/Debian 12) with Hostinger or any similar hosting provider. The deployment uses PM2 for process management, Nginx as reverse proxy, and MongoDB as database.

## Prerequisites
- Linux VPS with Ubuntu 22.04/Debian 12 (2GB RAM minimum, 4GB recommended)
- Root or sudo access
- Domain name pointed to server IP (for SSL)
- SSH access to server

## Step 1: System Updates & Package Installation

### 1.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 1.2 Install Node.js 20.x (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x
npm --version
```

### 1.3 Install MongoDB 7.0
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod

# Verify MongoDB is running
mongosh --eval "db.runCommand({ping: 1})"
```

### 1.4 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Install PM2 Globally
```bash
sudo npm install -g pm2
pm2 completion install
source ~/.bashrc
```

### 1.6 Install Certbot for SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Step 2: Clone Repository & Environment Setup

### 2.1 Create Application Directory
```bash
sudo mkdir -p /var/www/company-intelligence
sudo chown -R $USER:$USER /var/www/company-intelligence
cd /var/www/company-intelligence
```

### 2.2 Clone Repository
```bash
git clone <your-repository-url> .
# Or if you need to pull specific branch:
# git clone -b main <your-repository-url> .
```

### 2.3 Install Backend Dependencies
```bash
cd apps/backend
npm install --production
```

### 2.4 Configure Environment Variables
```bash
cp .env.example .env
nano .env
```

**Edit `.env` with these values:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/company_intelligence_prod
JWT_SECRET=your-strong-jwt-secret-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### 2.5 Install Frontend Dependencies
```bash
cd ../frontend
npm install --production
```

## Step 3: Build Projects

### 3.1 Build Backend
```bash
cd /var/www/company-intelligence/apps/backend
npm run build
# This creates dist/ directory with compiled JavaScript
```

### 3.2 Build Frontend
```bash
cd /var/www/company-intelligence/apps/frontend
npm run build
# This creates .next/ directory with optimized production build
```

## Step 4: Running with PM2

### 4.1 Configure PM2 Ecosystem
Check the existing `ecosystem.config.js` in backend directory. It should already be configured for both backend and frontend. Verify it looks like:

```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      max_memory_restart: '1G'
    },
    {
      name: 'frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '../frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '../frontend/logs/error.log',
      out_file: '../frontend/logs/out.log'
    }
  ]
};
```

### 4.2 Start Applications with PM2
```bash
cd /var/www/company-intelligence/apps/backend
pm2 start ecosystem.config.js --env production
```

### 4.3 Save PM2 Configuration
```bash
pm2 save
pm2 startup
# Run the command provided by pm2 startup output
```

### 4.4 Verify PM2 Status
```bash
pm2 status
pm2 logs
# Check both backend and frontend are running
```

## Step 5: Nginx Configuration

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/company-intelligence
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/company-intelligence/apps/frontend;

    # Frontend static files
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific settings
        proxy_buffering off;
        proxy_cache off;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 5.2 Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/company-intelligence /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 5.3 Configure Firewall (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## Step 6: SSL Certificate with Certbot

### 6.1 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the interactive prompts:
- Enter email for renewal notifications
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: 2 - Redirect)

### 6.2 Verify Auto-Renewal
```bash
sudo certbot renew --dry-run
```

### 6.3 Check SSL Configuration
Visit `https://yourdomain.com` to verify SSL is working.

## Step 7: Post-Deployment Verification

### 7.1 Check All Services
```bash
# Check MongoDB
sudo systemctl status mongod

# Check Nginx
sudo systemctl status nginx

# Check PM2
pm2 status

# Check application logs
pm2 logs backend --lines 50
pm2 logs frontend --lines 50
```

### 7.2 Test API Endpoints
```bash
curl -X GET https://yourdomain.com/api/health
curl -X GET https://yourdomain.com/api/companies
```

### 7.3 Test Frontend
- Open `https://yourdomain.com` in browser
- Verify page loads without errors
- Test login functionality
- Test real-time features

## Step 8: Database Setup & Seed Data

### 8.1 Create Database Indexes
```bash
cd /var/www/company-intelligence/apps/backend
npm run db:seed  # If seed script is configured
```

### 8.2 Optional: Import Sample Data
```bash
# If you have a seed script
npm run db:seed
```

## Step 9: Monitoring & Maintenance

### 9.1 PM2 Monitoring Setup
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 9.2 Set Up Log Rotation for Nginx
```bash
sudo nano /etc/logrotate.d/nginx
```

### 9.3 Create Backup Script
Create `/var/www/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/company-intelligence"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --out $BACKUP_DIR/mongodb_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/company-intelligence

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
```

Make it executable and schedule with cron:
```bash
chmod +x /var/www/backup.sh
crontab -e
# Add: 0 2 * * * /var/www/backup.sh
```

## Step 10: Security Hardening

### 10.1 Secure MongoDB
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})
```

Edit MongoDB config:
```bash
sudo nano /etc/mongod.conf
```
Add/change:
```yaml
security:
  authorization: enabled
net:
  bindIp: 127.0.0.1
```

### 10.2 Update .env with MongoDB Auth
```env
MONGODB_URI=mongodb://admin:strong-password@localhost:27017/company_intelligence_prod?authSource=admin
```

### 10.3 Harden SSH
```bash
sudo nano /etc/ssh/sshd_config
```
Change:
- `PermitRootLogin no`
- `PasswordAuthentication no` (use SSH keys)
- `Port 2222` (change from default 22)

### 10.4 Fail2ban Installation
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Troubleshooting Deployment Issues

### Issue 1: Port Already in Use
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
# Or change port in .env and ecosystem.config.js
```

### Issue 2: MongoDB Connection Failed
```bash
sudo systemctl restart mongod
sudo tail -f /var/log/mongodb/mongod.log
```

### Issue 3: PM2 Apps Not Starting
```bash
pm2 delete all
pm2 start ecosystem.config.js --env production
pm2 logs
```

### Issue 4: Nginx 502 Bad Gateway
```bash
sudo tail -f /var/log/nginx/error.log
# Check if backend is running on correct port
netstat -tulpn | grep :5000
```

### Issue 5: SSL Certificate Errors
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## Maintenance Commands Cheat Sheet

### Application Management
```bash
# Restart applications
pm2 restart all
pm2 restart backend
pm2 restart frontend

# View logs
pm2 logs
pm2 logs backend --lines 100
pm2 logs frontend --lines 100

# Monitor resources
pm2 monit

# Update application
cd /var/www/company-intelligence
git pull
cd apps/backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

### Database Management
```bash
# MongoDB shell
mongosh

# Backup database
mongodump --out /backup/path

# Restore database
mongorestore /backup/path
```

### Server Management
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check Nginx status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

## Rollback Procedure

If deployment fails, rollback to previous version:

1. Stop applications:
   ```bash
   pm2 stop all
   ```

2. Restore from backup:
   ```bash
   cd /var/www
   rm -rf company-intelligence
   tar -xzf /var/backups/company-intelligence/app_YYYYMMDD.tar.gz
   ```

3. Restore database:
   ```bash
   mongorestore /var/backups/company-intelligence/mongodb_YYYYMMDD
   ```

4. Start applications:
   ```bash
   cd company-intelligence/apps/backend
   pm2 start ecosystem.config.js --env production
   ```

## Emergency Contacts
- Server Hosting Support: Hostinger/Your VPS provider
- Domain Registrar: Your domain provider
- Development Team: Internal contacts

---

**Deployment Checklist Completed:** ✅  
*Last Verified: [Date]*  
*Deployed by: [Your Name]*  
*Next Review: 30 days*

---

## Quick Reference Commands

```bash
# One-liner for common tasks
pm2 status                          # Check app status
sudo systemctl reload nginx         # Reload Nginx
sudo certbot renew --dry-run        # Test SSL renewal
mongosh --eval "db.stats()"         # Check MongoDB stats
curl -I https://yourdomain.com      # Test website headers
```

*Remember to update this checklist as your deployment process evolves.*