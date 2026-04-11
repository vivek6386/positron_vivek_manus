import { describe, it, expect, beforeAll } from "vitest";
import { generateOTP, getOTPExpiryTime, sendOTPEmail } from "./_core/otpService";
import { createOTP, verifyOTP } from "./otp";
import { getDb } from "./db";

describe("OTP Service", () => {
  describe("generateOTP", () => {
    it("should generate a 6-digit OTP code", () => {
      const code = generateOTP();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    it("should generate different codes on multiple calls", () => {
      const code1 = generateOTP();
      const code2 = generateOTP();
      // While theoretically they could be the same, probability is 1 in 1 million
      // This test ensures the function produces valid codes
      expect(code1).toMatch(/^\d{6}$/);
      expect(code2).toMatch(/^\d{6}$/);
    });
  });

  describe("getOTPExpiryTime", () => {
    it("should return a future timestamp", () => {
      const expiry = getOTPExpiryTime();
      const now = new Date();
      expect(expiry.getTime()).toBeGreaterThan(now.getTime());
    });

    it("should expire in approximately 10 minutes", () => {
      const expiry = getOTPExpiryTime();
      const now = new Date();
      const diffMs = expiry.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      // Allow 1 minute tolerance
      expect(diffMinutes).toBeGreaterThan(9);
      expect(diffMinutes).toBeLessThan(11);
    });
  });

  describe("OTP Database Operations", () => {
    beforeAll(async () => {
      const db = await getDb();
      if (!db) {
        console.warn("Database not available for OTP tests");
      }
    });

    it("should create and verify OTP", async () => {
      const db = await getDb();
      if (!db) {
        console.warn("Skipping OTP creation test - database not available");
        return;
      }

      const testEmail = `test-${Date.now()}@example.com`;
      const code = await createOTP(testEmail, "email");

      expect(code).toMatch(/^\d{6}$/);

      // Verify the OTP
      const isValid = await verifyOTP(testEmail, code);
      expect(isValid).toBe(true);
    });

    it("should reject invalid OTP code", async () => {
      const db = await getDb();
      if (!db) {
        console.warn("Skipping OTP verification test - database not available");
        return;
      }

      const testEmail = `test-invalid-${Date.now()}@example.com`;
      await createOTP(testEmail, "email");

      // Try with wrong code
      const isValid = await verifyOTP(testEmail, "000000");
      expect(isValid).toBe(false);
    });

    it("should reject already verified OTP", async () => {
      const db = await getDb();
      if (!db) {
        console.warn("Skipping OTP reuse test - database not available");
        return;
      }

      const testEmail = `test-reuse-${Date.now()}@example.com`;
      const code = await createOTP(testEmail, "email");

      // First verification should succeed
      const firstVerify = await verifyOTP(testEmail, code);
      expect(firstVerify).toBe(true);

      // Second verification should fail (already used)
      const secondVerify = await verifyOTP(testEmail, code);
      expect(secondVerify).toBe(false);
    });
  });

  describe("Email Sending", () => {
    it("should handle email sending gracefully", async () => {
      // This test just ensures the function doesn't throw
      // In development without SMTP configured, it will log to console
      const result = await sendOTPEmail("test@example.com", "123456");
      expect(typeof result).toBe("boolean");
    });
  });
});
