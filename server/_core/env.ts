export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // OTP Configuration
  otpEnabled: process.env.OTP_ENABLED !== "false",
  // Email Configuration (SMTP)
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587"),
  smtpSecure: process.env.SMTP_SECURE ?? "false",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, ""),
  emailFrom: process.env.EMAIL_FROM ?? "noreply@example.com",
  appName: process.env.APP_NAME ?? "Positron Vivek",
  // SMS Configuration (optional)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER ?? "",
};
