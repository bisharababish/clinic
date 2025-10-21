# Backup and Recovery Strategy

## Database Backup (Supabase)

### Automatic Backups
1. **Enable Point-in-Time Recovery (PITR)**
   - Go to Supabase Dashboard > Settings > Database
   - Enable "Point in Time Recovery"
   - Set retention period to 7 days (minimum)

2. **Schedule Daily Backups**
   - Go to Settings > Database > Backups
   - Enable "Daily Backups"
   - Set retention to 30 days

### Manual Backup Commands
```sql
-- Create backup of critical tables
pg_dump -h your-supabase-host -U postgres -d postgres \
  --table=userinfo \
  --table=appointments \
  --table=payment_bookings \
  --table=lab_results \
  --table=xray_images \
  --table=activity_log \
  -f backup_$(date +%Y%m%d_%H%M%S).sql
```

## File Backup Strategy

### 1. Application Code
- GitHub repository (already done)
- Tag releases for easy rollback

### 2. Environment Configuration
- Store in secure password manager
- Never commit to repository

### 3. SSL Certificates
- Backup certificate files
- Document renewal process

## Recovery Procedures

### Database Recovery
1. **Point-in-Time Recovery**
   ```bash
   # Contact Supabase support for PITR restoration
   # Provide timestamp and affected tables
   ```

2. **Manual Restoration**
   ```bash
   psql -h your-supabase-host -U postgres -d postgres -f backup_file.sql
   ```

### Application Recovery
1. **Code Rollback**
   ```bash
   git tag -l  # List available tags
   git checkout v1.0.0  # Rollback to specific version
   npm install
   npm run production
   ```

2. **Environment Recovery**
   - Restore from password manager
   - Update environment variables
   - Restart services

## Disaster Recovery Plan

### 1. Identify Critical Systems
- Database (Supabase)
- Application servers
- SSL certificates
- Domain configuration

### 2. Recovery Time Objectives (RTO)
- Database: 1 hour
- Application: 30 minutes
- Full system: 2 hours

### 3. Recovery Point Objectives (RPO)
- Database: 15 minutes (with PITR)
- File uploads: 1 hour
- Application logs: 1 day

## Testing Backups

### Monthly Backup Testing
1. Test database restoration
2. Verify application functionality
3. Test SSL certificate renewal
4. Document any issues

### Quarterly Disaster Recovery Drill
1. Simulate complete system failure
2. Test full recovery procedures
3. Measure recovery times
4. Update procedures based on results

## Monitoring Backup Health

### Daily Checks
- [ ] Backup completion status
- [ ] Backup file integrity
- [ ] Storage space availability

### Weekly Checks
- [ ] Test backup restoration
- [ ] Verify backup retention policies
- [ ] Review backup logs

## Backup Storage Locations

### Primary Storage
- Supabase managed backups
- GitHub repository

### Secondary Storage
- Local development machine
- Secure cloud storage (encrypted)

### Emergency Storage
- External encrypted drive
- Offline backup copies
