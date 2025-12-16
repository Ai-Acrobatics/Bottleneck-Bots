/**
 * Rate Limiting Middleware
 * Implements token bucket algorithm for API rate limiting
 * Uses Redis for distributed rate limiting across multiple instances
 */

import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";
import { redisService } from "../../../services/redis.service";

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: Request) => string; // Custom key generator
  useSliding?: boolean; // Use sliding window instead of token bucket
}

/**
 * Default rate limit: 100 requests per minute per API key
 */
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  message: "Too many requests, please try again later",
  useSliding: false,
};

/**
 * Create rate limit middleware
 * Now uses Redis for distributed rate limiting
 *
 * Usage:
 * ```typescript
 * router.use(rateLimit({ windowMs: 60000, maxRequests: 100 }));
 * ```
 */
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const options = { ...DEFAULT_RATE_LIMIT, ...config };

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Generate rate limit key
      const key = options.keyGenerator
        ? options.keyGenerator(req)
        : req.apiKey
        ? `apikey:${req.apiKey.id}`
        : `ip:${req.ip}`;

      // Use sliding window or token bucket
      const result = options.useSliding
        ? await redisService.checkSlidingWindowRateLimit(
            key,
            options.maxRequests,
            options.windowMs
          )
        : await redisService.checkRateLimit(
            key,
            options.maxRequests,
            1, // Refill 1 token per interval
            options.windowMs / options.maxRequests // Interval between refills
          );

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", options.maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
      res.setHeader("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

      // Add Redis mode header for debugging
      const status = redisService.getStatus();
      res.setHeader("X-RateLimit-Mode", status.mode);

      if (!result.allowed) {
        res.status(429).json({
          error: "Too Many Requests",
          message: options.message,
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: result.retryAfter,
          remaining: 0,
          resetAt: new Date(result.resetAt).toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Rate limit error:", error);
      // Don't fail the request on rate limit errors
      next();
    }
  };
}

/**
 * Per-API-key rate limiter based on plan limits
 * Uses Redis for distributed rate limiting
 */
export async function apiKeyRateLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.apiKey) {
    // No API key, skip rate limiting
    next();
    return;
  }

  try {
    const db = await import("../../../db").then((m) => m.getDb());
    if (!db) {
      next();
      return;
    }

    const { apiKeys } = await import("../../../../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    // Fetch API key rate limits from database
    const [apiKeyRecord] = await db
      .select({
        rateLimitPerMinute: apiKeys.rateLimitPerMinute,
        rateLimitPerHour: apiKeys.rateLimitPerHour,
        rateLimitPerDay: apiKeys.rateLimitPerDay,
      })
      .from(apiKeys)
      .where(eq(apiKeys.id, req.apiKey.id))
      .limit(1);

    if (!apiKeyRecord) {
      next();
      return;
    }

    // Check per-minute rate limit using Redis
    const minuteResult = await redisService.checkRateLimit(
      `apikey:${req.apiKey.id}:minute`,
      apiKeyRecord.rateLimitPerMinute,
      1,
      60000 / apiKeyRecord.rateLimitPerMinute
    );

    if (!minuteResult.allowed) {
      res.status(429).json({
        error: "Too Many Requests",
        message: "Per-minute rate limit exceeded",
        code: "RATE_LIMIT_MINUTE_EXCEEDED",
        limit: apiKeyRecord.rateLimitPerMinute,
        window: "1 minute",
        retryAfter: minuteResult.retryAfter,
        remaining: 0,
        resetAt: new Date(minuteResult.resetAt).toISOString(),
      });
      return;
    }

    // Check per-hour rate limit using Redis
    const hourResult = await redisService.checkRateLimit(
      `apikey:${req.apiKey.id}:hour`,
      apiKeyRecord.rateLimitPerHour,
      1,
      3600000 / apiKeyRecord.rateLimitPerHour
    );

    if (!hourResult.allowed) {
      res.status(429).json({
        error: "Too Many Requests",
        message: "Per-hour rate limit exceeded",
        code: "RATE_LIMIT_HOUR_EXCEEDED",
        limit: apiKeyRecord.rateLimitPerHour,
        window: "1 hour",
        retryAfter: hourResult.retryAfter,
        remaining: 0,
        resetAt: new Date(hourResult.resetAt).toISOString(),
      });
      return;
    }

    // Check per-day rate limit using Redis
    const dayResult = await redisService.checkRateLimit(
      `apikey:${req.apiKey.id}:day`,
      apiKeyRecord.rateLimitPerDay,
      1,
      86400000 / apiKeyRecord.rateLimitPerDay
    );

    if (!dayResult.allowed) {
      res.status(429).json({
        error: "Too Many Requests",
        message: "Per-day rate limit exceeded",
        code: "RATE_LIMIT_DAY_EXCEEDED",
        limit: apiKeyRecord.rateLimitPerDay,
        window: "1 day",
        retryAfter: dayResult.retryAfter,
        remaining: 0,
        resetAt: new Date(dayResult.resetAt).toISOString(),
      });
      return;
    }

    // Add rate limit info to headers
    res.setHeader("X-RateLimit-Limit-Minute", apiKeyRecord.rateLimitPerMinute.toString());
    res.setHeader("X-RateLimit-Remaining-Minute", minuteResult.remaining.toString());
    res.setHeader("X-RateLimit-Limit-Hour", apiKeyRecord.rateLimitPerHour.toString());
    res.setHeader("X-RateLimit-Remaining-Hour", hourResult.remaining.toString());
    res.setHeader("X-RateLimit-Limit-Day", apiKeyRecord.rateLimitPerDay.toString());
    res.setHeader("X-RateLimit-Remaining-Day", dayResult.remaining.toString());

    // Add Redis mode header
    const status = redisService.getStatus();
    res.setHeader("X-RateLimit-Mode", status.mode);

    next();
  } catch (error) {
    console.error("API key rate limit error:", error);
    next();
  }
}

/**
 * Global rate limit for unauthenticated requests
 * 60 requests per minute per IP using Redis
 */
export const globalRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 60,
  message: "Too many requests from this IP, please try again later",
  keyGenerator: (req) => `ip:${req.ip}`,
});

/**
 * Strict rate limit for sensitive endpoints
 * 10 requests per minute using sliding window
 */
export const strictRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 10,
  message: "Rate limit exceeded for this endpoint",
  useSliding: true,
});

/**
 * Burst rate limit for endpoints that need to handle traffic spikes
 * 200 requests per minute with token bucket
 */
export const burstRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 200,
  message: "Too many requests, please slow down",
});

/**
 * Get current rate limit status for a key
 * Useful for showing users their remaining quota
 */
export async function getRateLimitStatus(key: string, config: RateLimitConfig) {
  const result = await redisService.checkRateLimit(
    key,
    config.maxRequests + 1, // Don't consume a token
    1,
    config.windowMs / config.maxRequests
  );

  return {
    limit: config.maxRequests,
    remaining: result.remaining,
    resetAt: new Date(result.resetAt).toISOString(),
    mode: redisService.getStatus().mode,
  };
}
