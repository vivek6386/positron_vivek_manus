/**
 * Simple in-memory rate limiter for OTP requests
 * Tracks requests per contact/IP to prevent abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number; // Time window in milliseconds
  private readonly maxRequests: number; // Max requests per window

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Increment counter
    entry.count++;

    if (entry.count > this.maxRequests) {
      return false;
    }

    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get reset time for a key
   */
  getResetTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) {
      return Date.now();
    }
    return entry.resetTime;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Reset limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }
}

// Create instances for different rate limits
export const otpRequestLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  5 // 5 requests per 15 minutes
);

export const otpVerifyLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  10 // 10 attempts per 15 minutes
);

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(
  contact: string,
  ipAddress?: string
): string {
  // Use contact as primary key, fallback to IP if available
  return contact || ipAddress || "unknown";
}
