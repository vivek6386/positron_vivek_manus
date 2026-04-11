import nodemailer from "nodemailer";
import { ENV } from "./env";

/**
 * OTP Service - Handles generation, validation, and delivery of OTP codes
 */

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
  const code = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(OTP_LENGTH, "0");
  return code;
}

/**
 * Calculate OTP expiration timestamp
 */
export function getOTPExpiryTime(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MS);
}

/**
 * Create SMTP transporter for email delivery
 */
function createTransporter() {
  if (
    !ENV.smtpHost ||
    !ENV.smtpPort ||
    !ENV.smtpUser ||
    !ENV.smtpPass
  ) {
    console.warn("[OTP] Email configuration incomplete.");
    return null;
  }

  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure === "true",
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
    },
  });
}

/**
 * Send OTP via email
 */
export async function sendOTPEmail(
  email: string,
  code: string
): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.error(
      `[OTP] Cannot send OTP email to ${email} because SMTP is not configured.`
    );
    return false;
  }

  try {
    const appName = ENV.appName || "Positron Vivek";
    const emailFrom = ENV.emailFrom || "noreply@example.com";

    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: `Your ${appName} Verification Code`,
      html: generateEmailTemplate(code, appName),
      text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    });

    console.log(`[OTP] Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`[OTP] Failed to send email to ${email}:`, error);
    return false;
  }
}

/**
 * Generate HTML email template for OTP
 */
function generateEmailTemplate(code: string, appName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .code-box { 
            background: #f5f5f5; 
            border: 2px solid #007bff; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0;
          }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            letter-spacing: 4px; 
            color: #007bff;
            font-family: 'Courier New', monospace;
          }
          .footer { 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
            <p>Verification Code</p>
          </div>
          
          <p>Hello,</p>
          <p>Your verification code is:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send OTP via SMS (placeholder for future implementation)
 */
export async function sendOTPSMS(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  // TODO: Implement SMS delivery with Twilio or similar service
  console.log(
    `[OTP] SMS not yet implemented. OTP code for ${phoneNumber}: ${code}`
  );
  return true;
}

/**
 * Send OTP based on contact type
 */
export async function sendOTP(
  contact: string,
  contactType: "email" | "phone",
  code: string
): Promise<boolean> {
  if (contactType === "email") {
    return sendOTPEmail(contact, code);
  } else if (contactType === "phone") {
    return sendOTPSMS(contact, code);
  }

  console.error(`[OTP] Unknown contact type: ${contactType}`);
  return false;
}
