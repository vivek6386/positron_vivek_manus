# OTP Authentication Implementation Guide

## Overview

This document describes the complete OTP (One-Time Password) authentication system implemented for Positron Vivek. The system allows users to sign in using email or phone verification with 6-digit OTP codes.

## Architecture

### Database Schema

**otpVerifications Table**
- Stores temporary OTP codes
- Expires after 10 minutes
- Tracks verification status
- Supports both email and phone

**userContacts Table**
- Maps verified contacts to users
- Tracks contact type (email/phone)
- Supports multiple contacts per user
- Marks primary contact for user

**users Table**
- Extended with `loginMethod` field
- Supports "otp" login method
- Compatible with existing OAuth users

## Backend Components

### OTP Service (`server/_core/otpService.ts`)

**Key Functions:**
- `generateOTP()` - Creates 6-digit random code
- `getOTPExpiryTime()` - Calculates 10-minute expiration
- `sendOTP(contact, type, code)` - Routes to email/SMS
- `sendOTPEmail(email, code)` - Sends via SMTP

**Email Template:**
- Professional HTML template
- Includes OTP code in large, readable format
- Expires in 10 minutes notice
- Responsive design

### OTP Database Helpers (`server/otp.ts`)

**Core Functions:**
- `createOTP(contact, type)` - Generate and store OTP
- `verifyOTP(contact, code)` - Verify and mark as used
- `cleanupExpiredOTPs()` - Remove expired records

**Contact Management:**
- `addUserContact()` - Add verified contact
- `getUserByContact()` - Find user by email/phone
- `getUserContacts()` - List all user contacts
- `setUserPrimaryContact()` - Mark primary contact

### OTP Router (`server/otpRouter.ts`)

**API Endpoints:**

1. **requestOtp** - Request OTP code
   - Input: contact, contactType
   - Validates email/phone format
   - Generates and sends OTP
   - Returns success message

2. **verifyOtp** - Verify OTP code
   - Input: contact, code, contactType
   - Checks if user exists
   - Returns isNewUser flag
   - Validates 6-digit format

3. **login** - Complete login for existing user
   - Input: contact, contactType
   - Creates JWT session
   - Sets session cookie
   - Returns user info

4. **register** - Register new user
   - Input: contact, contactType, name
   - Creates user record
   - Adds contact mapping
   - Creates session
   - Returns user info

## Frontend Components

### OTP Login Page (`client/src/pages/OTPLogin.tsx`)

**Features:**
- Email/Phone tab switching
- Multi-step login flow
- OTP input with 6 slots
- Name collection for new users
- Loading states
- Error handling with toast notifications
- Responsive design

**Login Flow:**
1. User selects email or phone
2. Enters contact information
3. Receives OTP code
4. Enters 6-digit code
5. For new users: enters name
6. Session created and redirected to home

### Home Page Integration

- Sign In button for unauthenticated users
- User profile display for authenticated users
- Logout functionality
- Account information display

## Configuration

### Environment Variables

```env
# OTP Settings
OTP_ENABLED=true

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
APP_NAME=Positron Vivek

# SMS (Optional)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Email Provider Setup

**Gmail (Recommended for Testing):**
1. Enable 2-factor authentication
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Use as SMTP_PASS

**SendGrid:**
- SMTP_HOST: smtp.sendgrid.net
- SMTP_USER: apikey
- SMTP_PASS: SG.xxxxx

**AWS SES:**
- Use SES SMTP endpoint
- Configure IAM credentials
- Verify sender email

## Security Features

### OTP Security
- 6-digit codes (1 in 1 million)
- 10-minute expiration
- One-time use enforcement
- Secure transmission via email/SMS

### Session Security
- JWT-based sessions
- HTTP-only cookies
- Secure flag in production
- SameSite protection
- 1-year expiration (configurable)

### Input Validation
- Email format validation
- Phone number validation (E.164 format)
- 6-digit OTP validation
- Contact uniqueness checks

## Testing

### Unit Tests

Run tests with:
```bash
pnpm test
```

**Test Coverage:**
- OTP generation (6-digit format)
- OTP expiration (10 minutes)
- OTP verification
- OTP reuse prevention
- Email sending
- Database operations

### Manual Testing

1. **Test Email OTP:**
   - Visit `/login`
   - Select "Email" tab
   - Enter test email
   - Check email for OTP
   - Enter code and verify

2. **Test Phone OTP:**
   - Visit `/login`
   - Select "Phone" tab
   - Enter phone number
   - Check console for OTP (if SMS not configured)
   - Enter code and verify

3. **Test New User Registration:**
   - Use new email/phone
   - Complete OTP verification
   - Enter name
   - Verify account creation

4. **Test Existing User Login:**
   - Use previously registered email/phone
   - Complete OTP verification
   - Verify automatic login

## Deployment Checklist

- [ ] Configure SMTP credentials
- [ ] Test email delivery
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Test OTP expiration
- [ ] Backup database
- [ ] Document support process

## Troubleshooting

### OTP Not Sending

**Check:**
1. SMTP credentials in .env
2. Email provider allows SMTP access
3. Firewall/network allows outbound SMTP
4. Server logs for error messages

**Solution:**
- For Gmail: Use App Password, not regular password
- For SendGrid: Verify API key
- For AWS SES: Check IAM permissions

### Invalid OTP Error

**Causes:**
- Wrong code entered
- Code expired (10 minutes)
- Code already used

**Solution:**
- Request new OTP
- Check timestamp on email
- Ensure code not used before

### Database Errors

**Check:**
1. Database connection string
2. Tables created (run migrations)
3. User permissions

**Solution:**
```bash
npm run db:push
```

### Email Template Issues

**Check:**
1. Email client HTML support
2. Image loading (if any)
3. Font rendering

**Solution:**
- Template uses standard HTML
- No external resources
- Fallback text included

## Future Enhancements

- [ ] SMS delivery with Twilio
- [ ] Backup codes for account recovery
- [ ] Device fingerprinting
- [ ] Rate limiting per IP
- [ ] Suspicious activity alerts
- [ ] Passwordless authentication
- [ ] Biometric login
- [ ] Social login integration
- [ ] Multi-factor authentication
- [ ] Account recovery flows

## Support

For issues or questions:
1. Check error messages in server logs
2. Review this documentation
3. Check browser console for client errors
4. Verify environment configuration
5. Review test results

## API Reference

### requestOtp

```typescript
const response = await trpc.otp.requestOtp.mutate({
  contact: "user@example.com",
  contactType: "email"
});
// Returns: { success: true, message: "OTP sent to your email" }
```

### verifyOtp

```typescript
const response = await trpc.otp.verifyOtp.mutate({
  contact: "user@example.com",
  code: "123456",
  contactType: "email"
});
// Returns: { success: true, isNewUser: false, userId: 1, ... }
```

### login

```typescript
const response = await trpc.otp.login.mutate({
  contact: "user@example.com",
  contactType: "email"
});
// Returns: { success: true, user: { id, openId, name, ... } }
```

### register

```typescript
const response = await trpc.otp.register.mutate({
  contact: "user@example.com",
  contactType: "email",
  name: "John Doe"
});
// Returns: { success: true, user: { id, openId, name, ... } }
```

## Database Schema Details

### otpVerifications
```sql
CREATE TABLE otpVerifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contact VARCHAR(320) NOT NULL,
  contactType ENUM('email', 'phone') NOT NULL,
  code VARCHAR(6) NOT NULL,
  verified INT DEFAULT 0,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### userContacts
```sql
CREATE TABLE userContacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  contact VARCHAR(320) NOT NULL,
  contactType ENUM('email', 'phone') NOT NULL,
  verified INT DEFAULT 0,
  isPrimary INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

## Performance Considerations

- OTP lookups are fast (indexed by contact)
- Cleanup runs on demand (consider scheduling)
- Email sending is non-blocking
- Database queries are optimized
- Session tokens are cached in cookies

## Compliance

- GDPR: User data stored securely
- PII: Email/phone stored encrypted in transit
- Session: Secure, HTTP-only cookies
- Password: No passwords stored (OTP-only)

---

**Last Updated:** 2026-04-07
**Version:** 1.0.0
