# Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Domain name (optional)
- SSL certificate (for production)

## Environment Setup

### 1. Environment Variables
Create `.env` file in project root:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
FRONTEND_URL=https://yourdomain.com
PORT=5000
NODE_ENV=production

# Optional: Monitoring
VITE_SENTRY_DSN=your_sentry_dsn
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd src/backend
npm install
cd ../..
```

## Local Development

### 1. Start Frontend
```bash
npm run dev
```
Frontend will be available at `http://localhost:3000`

### 2. Start Backend
```bash
cd src/backend
npm run dev
```
Backend will be available at `http://localhost:5000`

## Production Deployment

### Option 1: Vercel (Recommended for Frontend)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure `VITE_` prefixed variables are set

4. **Deploy**
   - Click "Deploy" button
   - Vercel will automatically deploy on every push to main

### Option 2: Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Environment Variables**
   - Add environment variables in Netlify dashboard

4. **Deploy**
   - Netlify will automatically deploy on every push

### Option 3: Traditional Server (VPS/Dedicated)

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/yourrepo.git
   cd yourrepo
   
   # Install dependencies
   npm install
   cd src/backend && npm install && cd ../..
   
   # Build frontend
   npm run build
   
   # Start backend with PM2
   cd src/backend
   pm2 start server.ts --name "bethlehem-backend"
   
   # Serve frontend with nginx
   sudo cp dist/* /var/www/html/
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Frontend
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Backend Deployment

### Option 1: Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Option 2: Heroku
1. Create Heroku app
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Option 3: DigitalOcean App Platform
1. Create new app
2. Connect repository
3. Configure build settings
4. Set environment variables
5. Deploy

## Database Setup

### Supabase Configuration
1. **Create Project**
   - Go to [Supabase](https://supabase.com)
   - Create new project
   - Note down URL and keys

2. **Database Schema**
   - Run SQL scripts from your project
   - Set up Row Level Security (RLS)
   - Configure authentication settings

3. **Environment Variables**
   - Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Set `SUPABASE_SERVICE_ROLE_KEY` for backend

## SSL Certificate

### Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring Setup

### 1. Sentry Error Tracking
1. Create Sentry account
2. Create new project
3. Get DSN from project settings
4. Add `VITE_SENTRY_DSN` to environment variables

### 2. Uptime Monitoring
- Use services like UptimeRobot or Pingdom
- Monitor both frontend and backend endpoints

### 3. Performance Monitoring
- Google Analytics for user analytics
- Sentry for performance monitoring

## Security Checklist

- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers enabled
- [ ] SSL certificate installed
- [ ] Database backups configured
- [ ] Error monitoring active
- [ ] Regular security updates

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify Supabase keys are correct

3. **Database Connection**
   - Verify Supabase URL and keys
   - Check database permissions
   - Ensure RLS policies are correct

4. **CORS Issues**
   - Verify frontend URL in CORS configuration
   - Check if credentials are enabled
   - Ensure proper headers are set

### Support
- Check application logs
- Monitor error tracking dashboard
- Review server metrics
- Test endpoints with Postman/curl

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs weekly
- [ ] Check performance metrics
- [ ] Backup database regularly
- [ ] Review security updates

### Backup Strategy
- Database: Supabase automatic backups
- Code: GitHub repository
- Environment: Secure password manager
- SSL: Automatic renewal with Certbot
