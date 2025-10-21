# Render Deployment Guide for Bethlehem Medical Center

## Overview
This guide covers deploying both frontend and backend to Render with a Dynadot domain.

## 1. Backend Deployment (Render Web Service)

### Create Backend Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Backend Configuration
```yaml
# Render Configuration
Name: bethlehem-medical-center-backend
Environment: Node
Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm start
Plan: Starter ($7/month) or Professional ($25/month)
```

### Environment Variables for Backend
```bash
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=https://bethlehemmedcenter.com
JWT_SECRET=your_jwt_secret_32_chars_minimum
LOG_LEVEL=info
```

### Backend Build Settings
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## 2. Frontend Deployment (Render Static Site)

### Create Frontend Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository

### Frontend Configuration
```yaml
# Render Configuration
Name: bethlehem-medical-center-frontend
Environment: Static Site
Build Command: cd frontend && npm install && npm run build:prod
Publish Directory: frontend/dist
Plan: Free (or Pro $7/month for custom domains)
```

### Environment Variables for Frontend
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NODE_ENV=production
```

### Frontend Build Settings
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build:prod`
- **Publish Directory**: `dist`

## 3. Domain Configuration (Dynadot)

### DNS Settings in Dynadot
1. Log into your Dynadot account
2. Go to "My Domains" → "Manage DNS"
3. Add these DNS records:

```dns
# For Frontend (Static Site)
Type: CNAME
Name: @
Value: bethlehem-medical-center-frontend.onrender.com
TTL: 300

# For www subdomain
Type: CNAME  
Name: www
Value: bethlehem-medical-center-frontend.onrender.com
TTL: 300

# For Backend API
Type: CNAME
Name: api
Value: bethlehem-medical-center-backend.onrender.com
TTL: 300
```

### Custom Domain Setup in Render
1. **Frontend (Static Site)**:
   - Go to your frontend service
   - Click "Settings" → "Custom Domains"
   - Add: `bethlehemmedcenter.com`
   - Add: `www.bethlehemmedcenter.com`

2. **Backend (Web Service)**:
   - Go to your backend service
   - Click "Settings" → "Custom Domains"
   - Add: `api.bethlehemmedcenter.com`

## 4. SSL Certificate Setup

### Automatic SSL (Recommended)
Render automatically provides SSL certificates for custom domains:
1. Add your domain in Render dashboard
2. Render will automatically issue SSL certificate
3. Wait 5-10 minutes for certificate to be issued
4. Test: `https://bethlehemmedcenter.com`

### Manual SSL (If needed)
If automatic SSL fails:
1. Contact Render support
2. Provide domain verification
3. They'll manually issue the certificate

## 5. Environment-Specific Configuration

### Update Backend CORS
Update your backend server.ts:
```typescript
app.use(cors({
    origin: [
        'https://bethlehemmedcenter.com',
        'https://www.bethlehemmedcenter.com',
        'https://bethlehem-medical-center-frontend.onrender.com' // Render URL as fallback
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));
```

### Update Frontend API URLs
Update your frontend API calls to use:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.bethlehemmedcenter.com'
    : 'http://localhost:5000';
```

## 6. Render-Specific Optimizations

### Health Check Configuration
Render uses health checks to ensure your service is running:
```typescript
// Your health check endpoint is already configured
app.get('/health', healthCheck);
app.get('/health/simple', simpleHealthCheck);
```

### Auto-Deploy Configuration
1. Go to service settings
2. Enable "Auto-Deploy" from main branch
3. This will automatically deploy when you push to main

### Environment Variables Management
1. Go to service settings
2. Add all environment variables
3. Use "Lock" for sensitive variables
4. Use "Secret" for API keys

## 7. Monitoring and Logs

### Render Logs
- Go to your service dashboard
- Click "Logs" tab
- View real-time logs
- Download logs for analysis

### Health Monitoring
- Render automatically monitors health endpoints
- Set up alerts in Render dashboard
- Configure notification emails

## 8. Deployment Steps

### Initial Deployment
1. Push your code to GitHub main branch
2. Connect repository to Render
3. Configure environment variables
4. Add custom domains
5. Wait for SSL certificates
6. Test all endpoints

### Ongoing Deployments
1. Push changes to main branch
2. Render auto-deploys (if enabled)
3. Monitor deployment logs
4. Test in production

## 9. Performance Optimization for Render

### Backend Optimizations
```typescript
// Add compression middleware
import compression from 'compression';
app.use(compression());

// Optimize for Render's infrastructure
const PORT = process.env.PORT || 10000;
```

### Frontend Optimizations
```typescript
// Optimize build for Render
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

## 10. Troubleshooting

### Common Issues
1. **Build Failures**: Check build logs in Render dashboard
2. **Environment Variables**: Ensure all required vars are set
3. **CORS Issues**: Update CORS settings for production domains
4. **SSL Issues**: Wait for certificate issuance or contact support

### Debug Commands
```bash
# Check if backend is running
curl https://api.bethlehemmedcenter.com/health

# Check frontend
curl https://bethlehemmedcenter.com

# Check SSL certificate
openssl s_client -connect bethlehemmedcenter.com:443
```

## 11. Cost Optimization

### Free Tier Limits
- **Static Site**: 100GB bandwidth/month
- **Web Service**: 750 hours/month (free tier)
- **Custom Domains**: Available on free tier

### Pro Tier Benefits ($7/month each)
- **No bandwidth limits**
- **Always-on services**
- **Priority support**
- **Custom SSL certificates**

## 12. Security Considerations

### Environment Variables
- Never commit `.env` files
- Use Render's environment variable management
- Lock sensitive variables

### HTTPS Enforcement
- Render automatically enforces HTTPS
- Your Helmet configuration will work perfectly
- SSL certificates are automatically managed

## 13. Backup and Recovery

### Code Backup
- GitHub repository (already configured)
- Render keeps deployment history
- Easy rollback through Render dashboard

### Database Backup
- Use Supabase backup features
- Set up automated daily backups
- Test restore procedures

## Final Deployment Checklist

- [ ] Backend service created and configured
- [ ] Frontend static site created and configured
- [ ] Environment variables set in both services
- [ ] Custom domains added
- [ ] SSL certificates issued and working
- [ ] DNS records configured in Dynadot
- [ ] CORS settings updated for production
- [ ] Health checks responding
- [ ] Auto-deploy enabled
- [ ] Monitoring configured

Your application will be live at:
- **Frontend**: https://bethlehemmedcenter.com
- **Backend API**: https://api.bethlehemmedcenter.com
- **Health Check**: https://api.bethlehemmedcenter.com/health
