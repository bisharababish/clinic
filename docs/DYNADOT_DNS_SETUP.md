# Dynadot DNS Configuration for Bethlehem Medical Center

## Overview
This guide shows how to configure your Dynadot domain to work with Render deployment.

## Step 1: Access Dynadot DNS Management

1. Log into your [Dynadot account](https://www.dynadot.com)
2. Go to "My Domains" 
3. Find `bethlehemmedcenter.com`
4. Click "Manage DNS"

## Step 2: Configure DNS Records

### Delete Existing Records (if any)
Remove any existing A, CNAME, or other records that might conflict.

### Add New DNS Records

#### For Frontend (Main Website)
```dns
Type: CNAME
Name: @
Value: bethlehem-medical-center-frontend.onrender.com
TTL: 300 (5 minutes)
```

#### For www Subdomain
```dns
Type: CNAME
Name: www
Value: bethlehem-medical-center-frontend.onrender.com
TTL: 300
```

#### For Backend API
```dns
Type: CNAME
Name: api
Value: bethlehem-medical-center-backend.onrender.com
TTL: 300
```

## Step 3: DNS Configuration Details

### Complete DNS Records Table

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| CNAME | @ | bethlehem-medical-center-frontend.onrender.com | 300 | Main website |
| CNAME | www | bethlehem-medical-center-frontend.onrender.com | 300 | www subdomain |
| CNAME | api | bethlehem-medical-center-backend.onrender.com | 300 | API backend |

### Important Notes:
- **@** represents the root domain (bethlehemmedcenter.com)
- **www** is the www subdomain (www.bethlehemmedcenter.com)
- **api** creates api.bethlehemmedcenter.com for your backend
- **TTL 300** means 5 minutes cache time (good for testing)

## Step 4: DNS Propagation

### Wait for Propagation
- DNS changes can take 5 minutes to 24 hours to fully propagate
- TTL 300 means most users will see changes within 5 minutes
- Use tools like `nslookup` or `dig` to check propagation

### Test DNS Resolution
```bash
# Test main domain
nslookup bethlehemmedcenter.com

# Test www subdomain  
nslookup www.bethlehemmedcenter.com

# Test API subdomain
nslookup api.bethlehemmedcenter.com
```

Expected results:
```
bethlehemmedcenter.com -> CNAME bethlehem-medical-center-frontend.onrender.com
www.bethlehemmedcenter.com -> CNAME bethlehem-medical-center-frontend.onrender.com
api.bethlehemmedcenter.com -> CNAME bethlehem-medical-center-backend.onrender.com
```

## Step 5: Render Custom Domain Setup

### Frontend Custom Domain
1. Go to Render Dashboard
2. Open your frontend static site service
3. Go to "Settings" → "Custom Domains"
4. Add these domains:
   - `bethlehemmedcenter.com`
   - `www.bethlehemmedcenter.com`

### Backend Custom Domain
1. Go to Render Dashboard
2. Open your backend web service
3. Go to "Settings" → "Custom Domains"
4. Add this domain:
   - `api.bethlehemmedcenter.com`

## Step 6: SSL Certificate Setup

### Automatic SSL
Render will automatically issue SSL certificates for your custom domains:
1. After adding custom domains in Render
2. Wait 5-10 minutes for certificate issuance
3. Test: `https://bethlehemmedcenter.com`

### Verify SSL
```bash
# Test SSL certificate
openssl s_client -connect bethlehemmedcenter.com:443 -servername bethlehemmedcenter.com
```

## Step 7: Final Testing

### Test All URLs
After DNS propagation and SSL setup:

1. **Frontend**: https://bethlehemmedcenter.com
2. **www**: https://www.bethlehemmedcenter.com  
3. **API Health**: https://api.bethlehemmedcenter.com/health
4. **API Simple Health**: https://api.bethlehemmedcenter.com/health/simple

### Expected Results
- All URLs should load without SSL warnings
- Frontend should show your medical center website
- API health checks should return JSON status

## Step 8: Troubleshooting

### Common Issues

#### DNS Not Resolving
- Wait for propagation (up to 24 hours)
- Check DNS records are correct in Dynadot
- Verify TTL is not too high

#### SSL Certificate Issues
- Wait 10-15 minutes after adding custom domains
- Check Render dashboard for certificate status
- Contact Render support if issues persist

#### CORS Errors
- Verify CORS settings in backend include your domain
- Check that API calls use correct domain (api.bethlehemmedcenter.com)

### Debug Commands
```bash
# Check DNS resolution
dig bethlehemmedcenter.com
dig www.bethlehemmedcenter.com
dig api.bethlehemmedcenter.com

# Check SSL certificate
curl -I https://bethlehemmedcenter.com
curl -I https://api.bethlehemmedcenter.com/health

# Test API endpoint
curl https://api.bethlehemmedcenter.com/health
```

## Step 9: Production Optimization

### Update TTL After Testing
Once everything works:
1. Change TTL from 300 to 3600 (1 hour) for better performance
2. This reduces DNS lookup time for users

### Monitor DNS Health
- Set up monitoring for DNS resolution
- Monitor SSL certificate expiration
- Check domain renewal dates

## Step 10: Backup DNS Configuration

### Document Your Setup
Save this information for future reference:
- DNS record types and values
- Render service URLs
- SSL certificate details
- Domain renewal dates

### DNS Backup
Consider setting up DNS backup with another provider for redundancy.

## Final Checklist

- [ ] DNS records configured in Dynadot
- [ ] Custom domains added in Render
- [ ] SSL certificates issued and working
- [ ] All URLs tested and working
- [ ] DNS propagation verified
- [ ] SSL certificates verified
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] No CORS errors in browser console

Your domain setup is now complete and ready for production use!
