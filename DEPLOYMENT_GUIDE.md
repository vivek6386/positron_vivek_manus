# Deployment Guide

This guide covers deploying the Positron Vivek OTP authentication system to production.

## Pre-Deployment Checklist

### Environment Setup

- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure production email provider (Gmail, SendGrid, AWS SES)
- [ ] Verify `DATABASE_URL` points to production database
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS on your domain
- [ ] Configure CORS if needed

### Security Review

- [ ] Review all environment variables
- [ ] Verify database credentials are secure
- [ ] Check email provider credentials
- [ ] Ensure JWT_SECRET is strong and unique
- [ ] Review rate limiting settings
- [ ] Check SMTP security settings (TLS/SSL)

### Database Preparation

- [ ] Backup production database
- [ ] Test migrations on staging database
- [ ] Verify database user has correct permissions
- [ ] Check database connection string format

### Testing

- [ ] Run full test suite: `pnpm test`
- [ ] Test OTP generation
- [ ] Test email delivery
- [ ] Test login flow
- [ ] Test error scenarios
- [ ] Verify TypeScript compilation: `pnpm check`

## Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build for production
npm run build
```

### 2. Database Migrations

```bash
# Generate migrations from schema changes
npm run db:push

# Verify migrations applied
mysql -u user -p database_name -e "SHOW TABLES;"
```

### 3. Deploy Application

```bash
# Start production server
npm run start

# Or use process manager (PM2 recommended)
pm2 start dist/index.js --name "positron-vivek"
```

### 4. Verify Deployment

```bash
# Check server is running
curl http://localhost:3000

# Check API endpoint
curl http://localhost:3000/api/trpc/auth.me

# Check logs
pm2 logs positron-vivek
```

### 5. Post-Deployment Verification

- [ ] Test login page loads: `https://yourdomain.com/login`
- [ ] Test OTP request
- [ ] Test OTP verification
- [ ] Test user registration
- [ ] Test existing user login
- [ ] Check email delivery
- [ ] Monitor error logs
- [ ] Verify database connections

## Environment Variables

### Required Variables

```env
# Application
NODE_ENV=production
VITE_APP_ID=your-app-id

# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Authentication
JWT_SECRET=your-very-strong-secret-key-32-chars-minimum

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
APP_NAME=Positron Vivek
```

### Optional Variables

```env
# SMS (if using Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# OAuth (if using Manus OAuth)
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-owner-id
```

## Scaling Considerations

### Database

- Use connection pooling for multiple server instances
- Monitor database performance
- Set up automated backups
- Consider read replicas for scaling

### Rate Limiting

- Current implementation uses in-memory storage
- For distributed systems, consider Redis-based rate limiting
- Adjust rate limits based on expected traffic

### Email Delivery

- Monitor email delivery rates
- Set up bounce handling
- Consider email service for higher volumes
- Monitor SMTP connection limits

### Monitoring

- Set up application monitoring (error tracking, performance)
- Monitor OTP delivery success rates
- Track login conversion rates
- Monitor database performance
- Set up alerts for critical errors

## Rollback Procedures

### Application Rollback

```bash
# Stop current version
pm2 stop positron-vivek

# Revert to previous version
git checkout previous-commit-hash

# Rebuild
npm run build

# Start previous version
pm2 start dist/index.js --name "positron-vivek"
```

### Database Rollback

```bash
# If migrations caused issues, restore from backup
mysql -u user -p database_name < backup.sql

# Or manually revert schema changes
# (Keep migration files for reference)
```

### Session Cleanup

```bash
# Clear expired OTP codes
DELETE FROM otpVerifications WHERE expiresAt < NOW();

# Clear old sessions if needed
# (Depends on your session storage)
```

## Performance Optimization

### Frontend

- Enable gzip compression
- Minify CSS/JS
- Use CDN for static assets
- Implement lazy loading

### Backend

- Use connection pooling
- Cache frequently accessed data
- Optimize database queries
- Monitor response times

### Database

- Add indexes on frequently queried columns
- Monitor query performance
- Optimize slow queries
- Regular maintenance (ANALYZE, OPTIMIZE)

## Monitoring and Logging

### Application Logs

Monitor these key events:

- OTP request success/failure
- OTP verification success/failure
- User registration
- User login
- Rate limit exceeded
- Email delivery failures
- Database errors

### Metrics to Track

- OTP delivery rate
- OTP verification success rate
- Login conversion rate
- Error rates
- Response times
- Database query times

### Alerting

Set up alerts for:

- High error rates (>5%)
- OTP delivery failures
- Database connection errors
- Rate limit abuse
- Unusual traffic patterns

## Security Hardening

### HTTPS

- Use valid SSL certificate
- Enable HSTS header
- Redirect HTTP to HTTPS
- Use secure cookies

### CORS

```javascript
// Configure CORS if needed
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```

### Rate Limiting

- Current: 5 OTP requests per 15 minutes
- Current: 10 verification attempts per 15 minutes
- Adjust based on your needs

### Database Security

- Use strong passwords
- Restrict database access
- Use encrypted connections
- Regular backups
- Monitor access logs

## Troubleshooting

### OTP Not Sending

1. Check SMTP configuration
2. Verify email provider credentials
3. Check firewall rules
4. Review error logs
5. Test email provider directly

### Database Connection Errors

1. Verify DATABASE_URL format
2. Check database is running
3. Verify user permissions
4. Check network connectivity
5. Review connection pool settings

### High Error Rates

1. Check server logs
2. Monitor database performance
3. Check email delivery
4. Review rate limiting
5. Check for unusual traffic

### Performance Issues

1. Monitor database queries
2. Check server resources (CPU, memory)
3. Review application logs
4. Check network latency
5. Consider scaling options

## Maintenance

### Regular Tasks

- Monitor error logs daily
- Review OTP delivery metrics weekly
- Check database performance weekly
- Update dependencies monthly
- Review security settings monthly
- Backup database daily

### Updates

- Test updates on staging first
- Plan maintenance windows
- Keep backups before updates
- Monitor after updates
- Have rollback plan ready

## Support and Monitoring

### Key Contacts

- Database administrator
- Email provider support
- Hosting provider support
- Security team

### Documentation

- Keep deployment logs
- Document configuration changes
- Document custom modifications
- Keep runbooks updated

### Incident Response

1. Identify the issue
2. Check monitoring/logs
3. Attempt fix on staging
4. Deploy fix to production
5. Monitor for resolution
6. Document incident
7. Post-mortem analysis

---

**Last Updated:** 2026-04-07  
**Version:** 1.0.0
