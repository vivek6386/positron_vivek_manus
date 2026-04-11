import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createOTP,
  verifyOTP,
  addUserContact,
  getUserByContact,
} from "./otp";
import { sendOTP } from "./_core/otpService";
import { upsertUser, getUserByOpenId } from "./db";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { otpRequestLimiter, otpVerifyLimiter, getRateLimitKey } from "./_core/rateLimiter";
import { createOtpProof, consumeOtpProof } from "./_core/otpProofStore";

/**
 * OTP Authentication Router
 * Handles OTP request, verification, and login flows
 */

export const otpRouter = router({
  /**
   * Request an OTP code via email or phone
   */
  requestOtp: publicProcedure
    .input(
      z.object({
        contact: z.string().min(1, "Contact is required"),
        contactType: z.enum(["email", "phone"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { contact, contactType } = input;

      // Rate limiting
      const rateLimitKey = getRateLimitKey(contact);
      if (!otpRequestLimiter.isAllowed(rateLimitKey)) {
        const resetTime = otpRequestLimiter.getResetTime(rateLimitKey);
        const waitSeconds = Math.ceil((resetTime - Date.now()) / 1000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many OTP requests. Please try again in ${waitSeconds} seconds.`,
        });
      }

      // Validate contact format
      if (contactType === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid email address",
          });
        }
      } else if (contactType === "phone") {
        // Basic phone validation (allow +1234567890 format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(contact.replace(/\s/g, ""))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid phone number",
          });
        }
      }

      try {
        // Generate and store OTP
        const code = await createOTP(contact, contactType);

        // Send OTP
        const sent = await sendOTP(contact, contactType, code);

        if (!sent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              contactType === "email"
                ? "Failed to send OTP email. Please verify SMTP/email settings and try again."
                : "Failed to send OTP. Please try again.",
          });
        }

        return {
          success: true,
          message: `OTP sent to your ${contactType}. Check your ${contactType}.`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[OTP] Error requesting OTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request OTP",
        });
      }
    }),

  /**
   * Verify OTP code and check if user exists
   */
  verifyOtp: publicProcedure
    .input(
      z.object({
        contact: z.string().min(1),
        code: z.string().length(6, "OTP must be 6 digits"),
        contactType: z.enum(["email", "phone"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { contact, code, contactType } = input;

      // Rate limiting for verification attempts
      const rateLimitKey = getRateLimitKey(contact);
      if (!otpVerifyLimiter.isAllowed(rateLimitKey)) {
        const resetTime = otpVerifyLimiter.getResetTime(rateLimitKey);
        const waitSeconds = Math.ceil((resetTime - Date.now()) / 1000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many verification attempts. Please try again in ${waitSeconds} seconds.`,
        });
      }

      try {
        // Verify OTP code
        const isValid = await verifyOTP(contact, code);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired OTP code",
          });
        }

        // Check if user exists
        const userInfo = await getUserByContact(contact);

        const otpProofToken = createOtpProof(contact, contactType);

        if (userInfo) {
          // User exists, return user ID
          return {
            success: true,
            isNewUser: false,
            userId: userInfo.userId,
            contact,
            contactType,
            otpProofToken,
          };
        }

        // New user, return contact info for registration
        return {
          success: true,
          isNewUser: true,
          contact,
          contactType,
          otpProofToken,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[OTP] Error verifying OTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify OTP",
        });
      }
    }),

  /**
   * Complete login for existing user
   */
  login: publicProcedure
    .input(
      z.object({
        contact: z.string().min(1),
        contactType: z.enum(["email", "phone"]),
        otpProofToken: z.string().uuid("Valid OTP proof is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contact, contactType, otpProofToken } = input;

      try {
        const hasOtpProof = consumeOtpProof(otpProofToken, contact, contactType);
        if (!hasOtpProof) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "OTP verification required before login",
          });
        }

        // Get user by contact
        const userInfo = await getUserByContact(contact);

        if (!userInfo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (!userInfo.verified) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Contact is not verified",
          });
        }

        // Get user details
        const user = await getUserByOpenId(
          `otp-${contact}`
        );

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        return {
          success: true,
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            loginMethod: user.loginMethod,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[OTP] Error logging in:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to login",
        });
      }
    }),

  /**
   * Register new user with OTP
   */
  register: publicProcedure
    .input(
      z.object({
        contact: z.string().min(1),
        contactType: z.enum(["email", "phone"]),
        name: z.string().min(1, "Name is required"),
        otpProofToken: z.string().uuid("Valid OTP proof is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contact, contactType, name, otpProofToken } = input;

      try {
        const hasOtpProof = consumeOtpProof(otpProofToken, contact, contactType);
        if (!hasOtpProof) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "OTP verification required before registration",
          });
        }

        // Check if user already exists
        const existingUser = await getUserByContact(contact);

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists",
          });
        }

        // Create new user
        const openId = `otp-${contact}`;
        const email = contactType === "email" ? contact : undefined;

        await upsertUser({
          openId,
          name,
          email,
          loginMethod: "otp",
          role: "user",
          lastSignedIn: new Date(),
        });

        // Get the created user
        const user = await getUserByOpenId(openId);

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        // Add contact to user
        await addUserContact(user.id, contact, contactType, true, true);

        // Create session token
        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: 365 * 24 * 60 * 60 * 1000,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        return {
          success: true,
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            loginMethod: user.loginMethod,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[OTP] Error registering user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register user",
        });
      }
    }),
});
