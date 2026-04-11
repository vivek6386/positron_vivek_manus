import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * OTP Verification table for storing temporary OTP codes.
 * Used for email and phone-based authentication.
 */
export const otpVerifications = mysqlTable("otpVerifications", {
  id: int("id").autoincrement().primaryKey(),
  /** Contact identifier (email or phone number) */
  contact: varchar("contact", { length: 320 }).notNull(),
  /** Contact type: 'email' or 'phone' */
  contactType: mysqlEnum("contactType", ["email", "phone"]).notNull(),
  /** 6-digit OTP code */
  code: varchar("code", { length: 6 }).notNull(),
  /** Whether this OTP has been used */
  verified: int("verified").default(0).notNull(),
  /** When this OTP expires */
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

/**
 * User Contacts table for mapping contacts to users.
 * Tracks verified email addresses and phone numbers.
 */
export const userContacts = mysqlTable("userContacts", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to user.id */
  userId: int("userId").notNull(),
  /** Contact value (email or phone) */
  contact: varchar("contact", { length: 320 }).notNull(),
  /** Contact type: 'email' or 'phone' */
  contactType: mysqlEnum("contactType", ["email", "phone"]).notNull(),
  /** Whether this contact is verified */
  verified: int("verified").default(0).notNull(),
  /** Whether this is the primary contact */
  isPrimary: int("isPrimary").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserContact = typeof userContacts.$inferSelect;
export type InsertUserContact = typeof userContacts.$inferInsert;

// TODO: Add your tables here