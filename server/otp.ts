import { eq, and, lt, desc } from "drizzle-orm";
import {
  otpVerifications,
  userContacts,
  InsertOtpVerification,
  InsertUserContact,
} from "../drizzle/schema";
import { getDb } from "./db";
import { generateOTP, getOTPExpiryTime } from "./_core/otpService";

/**
 * OTP Database Helper Functions
 */

/**
 * Create and store a new OTP code
 */
export async function createOTP(
  contact: string,
  contactType: "email" | "phone"
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const code = generateOTP();
  const expiresAt = getOTPExpiryTime();

  const otpData: InsertOtpVerification = {
    contact,
    contactType,
    code,
    verified: 0,
    expiresAt,
  };

  await db.insert(otpVerifications).values(otpData);

  return code;
}

/**
 * Verify an OTP code and mark it as used
 */
export async function verifyOTP(
  contact: string,
  code: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find the OTP
  const otp = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.contact, contact),
        eq(otpVerifications.code, code),
        eq(otpVerifications.verified, 0)
      )
    )
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  if (otp.length === 0) {
    return false; // OTP not found or already used
  }

  const otpRecord = otp[0];

  // Check if OTP has expired
  if (otpRecord.expiresAt < new Date()) {
    return false; // OTP expired
  }

  // Mark OTP as verified
  await db
    .update(otpVerifications)
    .set({ verified: 1 })
    .where(eq(otpVerifications.id, otpRecord.id));

  return true;
}

/**
 * Clean up expired OTP records
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(otpVerifications)
    .where(lt(otpVerifications.expiresAt, new Date()));

  return 0; // Return 0 as placeholder
}

/**
 * Add or update a user contact
 */
export async function addUserContact(
  userId: number,
  contact: string,
  contactType: "email" | "phone",
  verified: boolean = false,
  isPrimary: boolean = false
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if contact already exists
  const existing = await db
    .select()
    .from(userContacts)
    .where(
      and(
        eq(userContacts.userId, userId),
        eq(userContacts.contact, contact)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing contact
    await db
      .update(userContacts)
      .set({
        verified: verified ? 1 : 0,
        isPrimary: isPrimary ? 1 : 0,
      })
      .where(eq(userContacts.id, existing[0].id));
  } else {
    // Create new contact
    const contactData: InsertUserContact = {
      userId,
      contact,
      contactType,
      verified: verified ? 1 : 0,
      isPrimary: isPrimary ? 1 : 0,
    };

    await db.insert(userContacts).values(contactData);
  }
}

/**
 * Get user by contact (email or phone)
 */
export async function getUserByContact(
  contact: string
): Promise<{ userId: number; verified: boolean } | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userContacts)
    .where(eq(userContacts.contact, contact))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    userId: result[0].userId,
    verified: result[0].verified === 1,
  };
}

/**
 * Get user's primary contact
 */
export async function getUserPrimaryContact(
  userId: number
): Promise<{ contact: string; contactType: "email" | "phone" } | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userContacts)
    .where(
      and(
        eq(userContacts.userId, userId),
        eq(userContacts.isPrimary, 1)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    contact: result[0].contact,
    contactType: result[0].contactType,
  };
}

/**
 * Get all user contacts
 */
export async function getUserContacts(
  userId: number
): Promise<
  Array<{
    contact: string;
    contactType: "email" | "phone";
    verified: boolean;
    isPrimary: boolean;
  }>
> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(userContacts)
    .where(eq(userContacts.userId, userId));

  return results.map((r) => ({
    contact: r.contact,
    contactType: r.contactType,
    verified: r.verified === 1,
    isPrimary: r.isPrimary === 1,
  }));
}

/**
 * Set primary contact for user
 */
export async function setUserPrimaryContact(
  userId: number,
  contact: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Clear all primary flags for this user
  await db
    .update(userContacts)
    .set({ isPrimary: 0 })
    .where(eq(userContacts.userId, userId));

  // Set the new primary contact
  await db
    .update(userContacts)
    .set({ isPrimary: 1 })
    .where(
      and(
        eq(userContacts.userId, userId),
        eq(userContacts.contact, contact)
      )
    );
}

/**
 * Delete user contact
 */
export async function deleteUserContact(
  userId: number,
  contact: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(userContacts)
    .where(
      and(
        eq(userContacts.userId, userId),
        eq(userContacts.contact, contact)
      )
    );
}
