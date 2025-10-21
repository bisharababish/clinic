# SSL/HTTPS Setup Guide

## For bethlehemmedcenter.com

### 1. Get SSL Certificate
- Use Let's Encrypt (free) or your domain provider
- Ensure certificate covers both www and non-www domains

### 2. Configure HTTPS Enforcement
Add to your web server (Nginx/Apache):

```nginx
# Force HTTPS
server {
    listen 80;
    server_name bethlehemmedcenter.com www.bethlehemmedcenter.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bethlehemmedcenter.com www.bethlehemmedcenter.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 3. Update Environment Variables
```bash
FRONTEND_URL=https://bethlehemmedcenter.com
```
