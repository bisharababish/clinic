# Complete Deployment Checklist - Render + Dynadot

## 🚀 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code committed to GitHub main branch
- [ ] Environment variables documented
- [ ] Build scripts tested locally
- [ ] Security fixes implemented
- [ ] Console.log statements removed
- [ ] API endpoints tested

### 2. GitHub Repository Setup
- [ ] Repository is public (for free Render tier)
- [ ] Main branch is protected
- [ ] All secrets removed from code
- [ ] .gitignore properly configured

## 🔧 Render Services Setup

### Backend Service (Web Service)
- [ ] Create new Web Service in Render
- [ ] Connect GitHub repository
- [ ] Set root directory: `backend`
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Choose plan: Starter ($7/month) or Professional ($25/month)

### Frontend Service (Static Site)
- [ ] Create new Static Site in Render
- [ ] Connect GitHub repository
- [ ] Set root directory: `frontend`
- [ ] Set build command: `npm install && npm run build:prod`
- [ ] Set publish directory: `dist`
- [ ] Choose plan: Free or Pro ($7/month)

## 🔐 Environment Variables

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=https://bethlehemmedcenter.com
JWT_SECRET=your_jwt_secret_32_chars_minimum
LOG_LEVEL=info
```

### Frontend Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NODE_ENV=production
```

## 🌐 DNS Configuration (Dynadot)

### DNS Records to Add
- [ ] CNAME @ → bethlehem-medical-center-frontend.onrender.com
- [ ] CNAME www → bethlehem-medical-center-frontend.onrender.com
- [ ] CNAME api → bethlehem-medical-center-backend.onrender.com
- [ ] TTL set to 300 (5 minutes) for testing

### DNS Verification
- [ ] DNS records saved in Dynadot
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Test DNS resolution with nslookup

## 🔒 Custom Domains (Render)

### Frontend Custom Domains
- [ ] Add bethlehemmedcenter.com
- [ ] Add www.bethlehemmedcenter.com
- [ ] Wait for SSL certificate issuance

### Backend Custom Domain
- [ ] Add api.bethlehemmedcenter.com
- [ ] Wait for SSL certificate issuance

## 🚀 Deployment Process

### Initial Deployment
1. [ ] Push code to GitHub main branch
2. [ ] Render auto-deploys both services
3. [ ] Monitor deployment logs
4. [ ] Check build success status

### Post-Deployment Testing
- [ ] Frontend loads: https://bethlehemmedcenter.com
- [ ] www redirects: https://www.bethlehemmedcenter.com
- [ ] API health check: https://api.bethlehemmedcenter.com/health
- [ ] SSL certificates working (no browser warnings)
- [ ] All features functional

## 🔍 Verification Checklist

### Frontend Verification
- [ ] Website loads without errors
- [ ] All pages accessible
- [ ] Forms working correctly
- [ ] Authentication working
- [ ] API calls successful
- [ ] No console errors

### Backend Verification
- [ ] Health check endpoint responding
- [ ] API endpoints accessible
- [ ] Authentication working
- [ ] Database connections working
- [ ] Logs showing no errors
- [ ] Rate limiting working

### Security Verification
- [ ] HTTPS enforced on all domains
- [ ] Security headers present
- [ ] No sensitive data in logs
- [ ] Authentication required for admin endpoints
- [ ] CORS properly configured

## 📊 Monitoring Setup

### Render Monitoring
- [ ] Service health monitoring enabled
- [ ] Log monitoring configured
- [ ] Alert notifications set up
- [ ] Performance metrics tracked

### Application Monitoring
- [ ] Health check endpoints responding
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Security event logging

## 🔄 Ongoing Maintenance

### Regular Checks
- [ ] Weekly health check verification
- [ ] Monthly security audit
- [ ] Quarterly performance review
- [ ] Annual domain renewal check

### Backup Verification
- [ ] Database backups working
- [ ] Code repository backed up
- [ ] Environment variables documented
- [ ] SSL certificate renewal automated

## 🚨 Troubleshooting Guide

### Common Issues

#### Build Failures
- Check Render build logs
- Verify environment variables
- Test build commands locally
- Check Node.js version compatibility

#### DNS Issues
- Wait for DNS propagation
- Verify DNS records in Dynadot
- Check TTL settings
- Test with different DNS servers

#### SSL Issues
- Wait for certificate issuance
- Check custom domain configuration
- Verify DNS resolution
- Contact Render support if needed

#### CORS Errors
- Update CORS settings in backend
- Verify domain URLs
- Check API endpoint URLs
- Test with different browsers

### Debug Commands
```bash
# Test DNS resolution
nslookup bethlehemmedcenter.com
nslookup api.bethlehemmedcenter.com

# Test SSL certificates
curl -I https://bethlehemmedcenter.com
curl -I https://api.bethlehemmedcenter.com/health

# Test API endpoints
curl https://api.bethlehemmedcenter.com/health
curl -X POST https://api.bethlehemmedcenter.com/api/admin/delete-user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"authUserId": "test"}'
```

## ✅ Final Verification

### Production Readiness
- [ ] All services deployed successfully
- [ ] Custom domains working
- [ ] SSL certificates valid
- [ ] DNS resolution correct
- [ ] All features tested
- [ ] Security measures active
- [ ] Monitoring configured
- [ ] Documentation complete

### Performance Check
- [ ] Page load times acceptable (< 3 seconds)
- [ ] API response times good (< 1 second)
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] CDN working (if configured)

## 🎉 Go Live!

Your Bethlehem Medical Center application is now ready for production use at:
- **Main Website**: https://bethlehemmedcenter.com
- **API Backend**: https://api.bethlehemmedcenter.com
- **Health Check**: https://api.bethlehemmedcenter.com/health

## 📞 Support Contacts

- **Render Support**: [Render Help Center](https://render.com/docs)
- **Dynadot Support**: [Dynadot Support](https://www.dynadot.com/support)
- **Supabase Support**: [Supabase Support](https://supabase.com/docs/guides/support)

## 📚 Documentation

- Render Deployment Guide: `docs/RENDER_DEPLOYMENT_GUIDE.md`
- DNS Setup Guide: `docs/DYNADOT_DNS_SETUP.md`
- API Documentation: `docs/API_DOCUMENTATION.md`
- Backup Strategy: `docs/BACKUP_STRATEGY.md`

---

**Congratulations! Your medical center application is now live and production-ready! 🏥✨**
