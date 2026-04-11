# Positron Vivek - OTP Authentication System

A modern, secure authentication system for Positron Vivek featuring OTP-based verification via email or phone.

## Features

**Authentication**
- 🔐 OTP-based authentication (email or phone)
- 📱 Email/Phone tab switching on login page
- ✅ 6-digit OTP codes with 10-minute expiration
- 🚀 Auto-registration for new users
- 🔒 Secure JWT session management
- ⏱️ Rate limiting for OTP requests

**User Experience**
- 📧 Professional email templates
- 📱 Fully responsive design
- ⚡ Real-time validation
- 🎨 Clean, modern UI
- 🔄 Multi-step login flow

**Security**
- 🛡️ One-time use OTP codes
- 🔐 HTTP-only session cookies
- 🚫 Rate limiting (5 requests per 15 minutes)
- ✔️ Email/phone format validation
- 🔒 Secure password-less authentication

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- pnpm (or npm)

### Installation

```bash
# Clone the repository
cd /home/ubuntu/positron-vivek-permanent

# Install dependencies
pnpm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Configuration

Copy environment variables (already configured via webdev_request_secrets):

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/positron_vivek

# Authentication
JWT_SECRET=your-secret-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
APP_NAME=Positron Vivek
```

## Usage

### For Users

1. **Sign In**: Click "Sign In" button on home page
2. **Choose Method**: Select Email or Phone tab
3. **Enter Contact**: Provide your email or phone number
4. **Receive OTP**: Check email/phone for 6-digit code
5. **Verify**: Enter the code on the verification screen
6. **Complete**: For new users, enter your name
7. **Access**: You're now logged in!

### For Developers

#### API Endpoints

All endpoints are accessible via tRPC at `/api/trpc`:

**Request OTP**
```typescript
await trpc.otp.requestOtp.mutate({
  contact: "user@example.com",
  contactType: "email"
});
```

**Verify OTP**
```typescript
await trpc.otp.verifyOtp.mutate({
  contact: "user@example.com",
  code: "123456",
  contactType: "email"
});
```

**Login**
```typescript
await trpc.otp.login.mutate({
  contact: "user@example.com",
  contactType: "email"
});
```

**Register**
```typescript
await trpc.otp.register.mutate({
  contact: "user@example.com",
  contactType: "email",
  name: "John Doe"
});
```

#### Database Schema

**otpVerifications**
- Stores temporary OTP codes
- Expires after 10 minutes
- Tracks verification status

**userContacts**
- Maps verified contacts to users
- Supports multiple contacts per user
- Tracks primary contact

**users**
- Core user table
- Extended with `loginMethod` field
- Supports "otp" login method

## Project Structure

```
positron-vivek-permanent/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── OTPLogin.tsx       # Login page
│       │   └── Home.tsx           # Home page
│       ├── App.tsx                # Routes
│       └── lib/trpc.ts            # tRPC client
├── server/
│   ├── otp.ts                     # Database helpers
│   ├── otpRouter.ts               # API endpoints
│   ├── routers.ts                 # Main router
│   └── _core/
│       ├── otpService.ts          # OTP generation & sending
│       └── rateLimiter.ts         # Rate limiting
├── drizzle/
│   └── schema.ts                  # Database schema
├── OTP_IMPLEMENTATION.md          # Detailed documentation
├── OTP_QUICK_START.md            # Quick start guide
└── README.md                      # This file
```

## Testing

Run the test suite:

```bash
pnpm test
```

Tests cover:
- OTP generation (6-digit format)
- OTP expiration (10 minutes)
- OTP verification
- OTP reuse prevention
- Email sending
- Database operations

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure production email provider
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Set up monitoring
- [ ] Test email delivery
- [ ] Backup database
- [ ] Review security settings

### Build

```bash
npm run build
npm run start
```

## Email Configuration

### Gmail (Recommended for Testing)

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the generated 16-character password
4. Use as `SMTP_PASS`

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx
```

### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
```

## Rate Limiting

The system implements rate limiting to prevent abuse:

- **OTP Request**: 5 requests per 15 minutes per contact
- **OTP Verification**: 10 attempts per 15 minutes per contact

Limits are tracked per contact (email/phone), not per IP.

## Security Considerations

### OTP Security
- 6-digit codes provide 1 in 1 million uniqueness
- 10-minute expiration prevents long-term attacks
- One-time use prevents replay attacks
- Secure transmission via email/SMS

### Session Security
- JWT tokens signed with secret key
- HTTP-only cookies prevent XSS attacks
- Secure flag set in production
- SameSite protection against CSRF

### Input Validation
- Email format validation (RFC 5322 simplified)
- Phone number validation (E.164 format)
- 6-digit OTP validation
- Contact uniqueness enforcement

## Troubleshooting

### OTP Not Sending

**Check:**
1. SMTP configuration in environment
2. Email provider credentials
3. Firewall/network allows SMTP
4. Server logs for errors

**Solution:**
```bash
# Check logs
npm run dev

# Verify SMTP settings
echo $SMTP_HOST $SMTP_PORT $SMTP_USER
```

### Database Errors

**Solution:**
```bash
# Re-run migrations
npm run db:push

# Check database connection
mysql -u root -p positron_vivek -e "SHOW TABLES;"
```

### Login Not Working

**Check:**
1. JWT_SECRET is set
2. Cookies enabled in browser
3. Browser console for errors (F12)
4. Server logs

## API Reference

See [OTP_IMPLEMENTATION.md](./OTP_IMPLEMENTATION.md) for detailed API documentation.

## Contributing

When adding new features:

1. Update `todo.md` with new items
2. Create feature branch
3. Write tests for new code
4. Update documentation
5. Submit for review

## Documentation

- [OTP_QUICK_START.md](./OTP_QUICK_START.md) - 5-minute setup guide
- [OTP_IMPLEMENTATION.md](./OTP_IMPLEMENTATION.md) - Detailed technical documentation
- [todo.md](./todo.md) - Feature tracking

## License

MIT

## Support

For issues or questions:

1. Check the documentation
2. Review server logs
3. Check browser console
4. Verify environment configuration

## Version

**Current Version:** 1.0.0  
**Last Updated:** 2026-04-07

---

**Built with:** React 19 • Express 4 • tRPC 11 • MySQL 8 • Tailwind 4
