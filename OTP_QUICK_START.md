# OTP Authentication - Quick Start Guide

Get your OTP login system up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd /home/ubuntu/positron-vivek-permanent
pnpm install
```

## Step 2: Set Up Database

```bash
npm run db:push
```

This creates the required OTP tables in your database.

## Step 3: Configure Email (Required for OTP login)

Email OTP now requires valid SMTP configuration. The server will return an error if SMTP is missing or invalid.

For production email delivery:

### Gmail (Recommended for Testing)

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the generated password
4. Add SMTP settings in your `.env` file (see `.env.example`)

Example:

```env
EMAIL_FROM=vivekkatiyar638694@email.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vivekkatiyar638694@email.com
SMTP_PASS=your-16-char-gmail-app-password
```

> Tip: Gmail app passwords are often shown with spaces (like `abcd efgh ijkl mnop`).  
> You can paste it as-is in `SMTP_PASS`; the server strips spaces automatically.

### SendGrid

1. Get API key from SendGrid dashboard
2. Use "apikey" as username
3. Use your API key as password

### AWS SES

1. Get SMTP credentials from AWS SES console
2. Verify sender email address
3. Configure in environment

## Step 4: Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Step 5: Test OTP Login

1. Open `http://localhost:3000/login` in your browser
2. Enter your email address
3. Check your mailbox for the OTP code
4. Enter the 6-digit code
5. For first-time users, enter your name
6. You're logged in! 🎉

## File Structure

```
positron-vivek-permanent/
├── server/
│   ├── otp.ts                    # OTP database functions
│   ├── otpRouter.ts              # tRPC API endpoints
│   ├── _core/
│   │   └── otpService.ts         # Email/SMS sending
│   └── routers.ts                # Updated with OTP router
├── client/
│   └── src/
│       ├── pages/
│       │   └── OTPLogin.tsx       # Login UI
│       ├── App.tsx               # Updated with /login route
│       └── pages/Home.tsx        # Updated with login button
├── drizzle/
│   └── schema.ts                 # OTP table schemas
├── OTP_IMPLEMENTATION.md         # Full documentation
├── OTP_QUICK_START.md           # This file
└── todo.md                       # Feature tracking
```

## Key Features

✅ **Email OTP** - Verify users via email  
✅ **Phone OTP** - API-ready for SMS integration  
✅ **Auto Registration** - New users auto-created  
✅ **10-Minute Expiry** - Security through expiration  
✅ **Mobile Responsive** - Works on all devices  
✅ **Secure Sessions** - JWT-based authentication  

## Common Tasks

### Reset OTP for a User

```bash
# In your database
DELETE FROM otpVerifications WHERE contact = 'user@example.com';
DELETE FROM userContacts WHERE contact = 'user@example.com';
```

### Check Active Users

```bash
# In your database
SELECT * FROM users WHERE loginMethod = 'otp';
```

### View User Contacts

```bash
# In your database
SELECT * FROM userContacts WHERE userId = 1;
```

## Troubleshooting

### "OTP not sending"

1. Check if SMTP is configured in environment
2. For Gmail, use App Password (not regular password)
3. Check server logs for error messages
4. Verify EMAIL_FROM is a valid email

### "Invalid OTP"

- OTP expires after 10 minutes
- Request a new OTP
- Ensure you entered the correct 6-digit code

### "Database error"

1. Run `npm run db:push` again
2. Verify DATABASE_URL is correct
3. Check database is running

### "Login not working"

1. Check JWT_SECRET is set
2. Verify cookies are enabled in browser
3. Check browser console for errors (F12)

## Next Steps

1. **Configure Production Email** - Set up SMTP for real emails
2. **Add SMS Support** - Integrate Twilio for SMS OTP
3. **Customize Email Template** - Edit in `server/_core/otpService.ts`
4. **Add Rate Limiting** - Prevent OTP brute force
5. **Set Up Monitoring** - Track OTP delivery success

## Production Checklist

Before deploying to production:

- [ ] Set strong JWT_SECRET
- [ ] Configure production email provider
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Test email delivery
- [ ] Backup database
- [ ] Review security settings

## Support

For detailed documentation, see `OTP_IMPLEMENTATION.md`

For issues:
1. Check server logs: `npm run dev`
2. Check browser console (F12)
3. Verify environment configuration
4. Review error messages carefully

---

**Happy coding! 🚀**

Your OTP authentication system is ready to use.
