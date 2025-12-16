/**
 * Redis Service
 *
 * Centralized Redis client for distributed caching, rate limiting, and pub/sub
 * Features:
 * - Connection pooling with automatic reconnection
 * - Rate limiting with token bucket algorithm
 * - Distributed caching with TTL
 * - Pub/sub for real-time events
 * - Graceful fallback to in-memory when Redis unavailable
 */

import Redis from 'ioredis';
import { serviceLoggers } from '../lib/logger';

const logger = serviceLoggers.deployment;

/**
 * Redis connection configuration
 */
interface RedisConfig {
  url: string;
  maxRetries: number;
  retryDelayMs: number;
  connectTimeoutMs: number;
  commandTimeoutMs: number;
  keyPrefix: string;
}

/**
 * Rate limit check result
 */
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Redis Service with fallback support
 */
class RedisService {
  private client: Redis | null = null;
  private isConnected = false;
  private config: RedisConfig;
  private inMemoryFallback: Map<string, { value: string; expiresAt: number }> = new Map();
  private connectionAttempts = 0;

  constructor() {
    this.config = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      maxRetries: 10,
      retryDelayMs: 3000,
      connectTimeoutMs: 10000,
      commandTimeoutMs: 5000,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'ghl:',
    };

    // Initialize connection
    this.connect();
  }

  /**
   * Connect to Redis
   */
  private connect(): void {
    try {
      this.client = new Redis(this.config.url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          this.connectionAttempts = times;
          if (times > this.config.maxRetries) {
            logger.warn(`Redis max retries exceeded (${times}), using in-memory fallback`);
            return null; // Stop retrying
          }
          const delay = Math.min(times * this.config.retryDelayMs, 30000);
          logger.info(`Redis retry attempt ${times}, waiting ${delay}ms`);
          return delay;
        },
        connectTimeout: this.config.connectTimeoutMs,
        commandTimeout: this.config.commandTimeoutMs,
        keyPrefix: this.config.keyPrefix,
        lazyConnect: false,
        enableReadyCheck: true,
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
        this.connectionAttempts = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis ready to accept commands');
      });

      this.client.on('error', (error) => {
        logger.error({ err: error }, 'Redis error');
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to initialize Redis');
      this.isConnected = false;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    attempts: number;
    mode: 'redis' | 'memory';
  } {
    return {
      connected: this.isConnected,
      attempts: this.connectionAttempts,
      mode: this.isAvailable() ? 'redis' : 'memory',
    };
  }

  // ==================== Rate Limiting ====================

  /**
   * Check rate limit using token bucket algorithm
   * Uses Redis Lua script for atomic operations
   */
  async checkRateLimit(
    key: string,
    maxTokens: number,
    refillRate: number, // tokens per interval
    refillIntervalMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const fullKey = `ratelimit:${key}`;

    if (!this.isAvailable()) {
      return this.checkRateLimitMemory(fullKey, maxTokens, refillRate, refillIntervalMs, now);
    }

    try {
      // Lua script for atomic rate limiting
      const luaScript = `
        local key = KEYS[1]
        local maxTokens = tonumber(ARGV[1])
        local refillRate = tonumber(ARGV[2])
        local refillIntervalMs = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])

        -- Get current bucket state
        local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
        local tokens = tonumber(bucket[1])
        local lastRefill = tonumber(bucket[2])

        -- Initialize if bucket doesn't exist
        if not tokens then
          tokens = maxTokens
          lastRefill = now
        end

        -- Calculate tokens to add based on time elapsed
        local elapsed = now - lastRefill
        local tokensToAdd = math.floor(elapsed / refillIntervalMs) * refillRate
        tokens = math.min(tokens + tokensToAdd, maxTokens)

        -- Check if request is allowed
        local allowed = tokens >= 1
        if allowed then
          tokens = tokens - 1
        end

        -- Update bucket
        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
        redis.call('PEXPIRE', key, refillIntervalMs * maxTokens / refillRate * 2)

        -- Calculate reset time
        local resetMs = refillIntervalMs
        if tokens < 1 then
          resetMs = math.ceil((1 - tokens) / refillRate * refillIntervalMs)
        end

        return {allowed and 1 or 0, tokens, now + resetMs}
      `;

      const result = await this.client!.eval(
        luaScript,
        1,
        fullKey,
        maxTokens.toString(),
        refillRate.toString(),
        refillIntervalMs.toString(),
        now.toString()
      ) as [number, number, number];

      const allowed = result[0] === 1;
      const remaining = Math.max(0, Math.floor(result[1]));
      const resetAt = result[2];

      return {
        allowed,
        remaining,
        resetAt,
        retryAfter: allowed ? undefined : Math.ceil((resetAt - now) / 1000),
      };
    } catch (error) {
      logger.error({ err: error }, 'Redis rate limit check failed, using memory fallback');
      return this.checkRateLimitMemory(fullKey, maxTokens, refillRate, refillIntervalMs, now);
    }
  }

  /**
   * In-memory rate limit fallback
   */
  private checkRateLimitMemory(
    key: string,
    maxTokens: number,
    refillRate: number,
    refillIntervalMs: number,
    now: number
  ): RateLimitResult {
    const stored = this.inMemoryFallback.get(key);
    let tokens = maxTokens;
    let lastRefill = now;

    if (stored && stored.expiresAt > now) {
      const data = JSON.parse(stored.value);
      tokens = data.tokens;
      lastRefill = data.lastRefill;

      // Refill tokens
      const elapsed = now - lastRefill;
      const tokensToAdd = Math.floor(elapsed / refillIntervalMs) * refillRate;
      tokens = Math.min(tokens + tokensToAdd, maxTokens);
    }

    const allowed = tokens >= 1;
    if (allowed) {
      tokens -= 1;
    }

    // Store updated state
    const ttl = refillIntervalMs * maxTokens / refillRate * 2;
    this.inMemoryFallback.set(key, {
      value: JSON.stringify({ tokens, lastRefill: now }),
      expiresAt: now + ttl,
    });

    const resetMs = tokens < 1
      ? Math.ceil((1 - tokens) / refillRate * refillIntervalMs)
      : refillIntervalMs;

    return {
      allowed,
      remaining: Math.max(0, Math.floor(tokens)),
      resetAt: now + resetMs,
      retryAfter: allowed ? undefined : Math.ceil(resetMs / 1000),
    };
  }

  /**
   * Check sliding window rate limit
   * Better for bursty traffic patterns
   */
  async checkSlidingWindowRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const fullKey = `ratelimit:sw:${key}`;
    const windowStart = now - windowMs;

    if (!this.isAvailable()) {
      // Simplified memory fallback for sliding window
      return this.checkRateLimitMemory(fullKey, maxRequests, 1, windowMs / maxRequests, now);
    }

    try {
      // Use sorted set for sliding window
      const multi = this.client!.multi();

      // Remove old entries
      multi.zremrangebyscore(fullKey, '-inf', windowStart.toString());

      // Count current entries
      multi.zcard(fullKey);

      // Add current request
      multi.zadd(fullKey, now.toString(), `${now}-${Math.random()}`);

      // Set expiry
      multi.pexpire(fullKey, windowMs);

      const results = await multi.exec();
      const count = results?.[1]?.[1] as number || 0;

      const allowed = count < maxRequests;
      const remaining = Math.max(0, maxRequests - count - 1);
      const resetAt = now + windowMs;

      return {
        allowed,
        remaining,
        resetAt,
        retryAfter: allowed ? undefined : Math.ceil(windowMs / 1000),
      };
    } catch (error) {
      logger.error({ err: error }, 'Redis sliding window check failed');
      return this.checkRateLimitMemory(fullKey, maxRequests, 1, windowMs / maxRequests, now);
    }
  }

  // ==================== Caching ====================

  /**
   * Get cached value
   */
  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      const stored = this.inMemoryFallback.get(key);
      if (stored && stored.expiresAt > Date.now()) {
        return stored.value;
      }
      return null;
    }

    try {
      return await this.client!.get(key);
    } catch (error) {
      logger.error({ err: error }, `Redis GET failed for key: ${key}`);
      return null;
    }
  }

  /**
   * Set cached value with optional TTL
   */
  async set(key: string, value: string, ttlMs?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      this.inMemoryFallback.set(key, {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : Infinity,
      });
      return true;
    }

    try {
      if (ttlMs) {
        await this.client!.psetex(key, ttlMs, value);
      } else {
        await this.client!.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error({ err: error }, `Redis SET failed for key: ${key}`);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  async del(key: string): Promise<boolean> {
    this.inMemoryFallback.delete(key);

    if (!this.isAvailable()) {
      return true;
    }

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      logger.error({ err: error }, `Redis DEL failed for key: ${key}`);
      return false;
    }
  }

  /**
   * Get JSON value
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Set JSON value
   */
  async setJson<T>(key: string, value: T, ttlMs?: number): Promise<boolean> {
    return this.set(key, JSON.stringify(value), ttlMs);
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    if (!this.isAvailable()) {
      const stored = this.inMemoryFallback.get(key);
      const current = stored ? parseInt(stored.value, 10) || 0 : 0;
      const next = current + 1;
      this.inMemoryFallback.set(key, { value: next.toString(), expiresAt: Infinity });
      return next;
    }

    try {
      return await this.client!.incr(key);
    } catch (error) {
      logger.error({ err: error }, `Redis INCR failed for key: ${key}`);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decr(key: string): Promise<number> {
    if (!this.isAvailable()) {
      const stored = this.inMemoryFallback.get(key);
      const current = stored ? parseInt(stored.value, 10) || 0 : 0;
      const next = current - 1;
      this.inMemoryFallback.set(key, { value: next.toString(), expiresAt: Infinity });
      return next;
    }

    try {
      return await this.client!.decr(key);
    } catch (error) {
      logger.error({ err: error }, `Redis DECR failed for key: ${key}`);
      return 0;
    }
  }

  // ==================== Pub/Sub ====================

  /**
   * Publish message to channel
   */
  async publish(channel: string, message: string): Promise<number> {
    if (!this.isAvailable()) {
      logger.warn(`Redis unavailable, cannot publish to channel: ${channel}`);
      return 0;
    }

    try {
      return await this.client!.publish(channel, message);
    } catch (error) {
      logger.error({ err: error }, `Redis PUBLISH failed for channel: ${channel}`);
      return 0;
    }
  }

  /**
   * Subscribe to channel
   * Returns cleanup function
   */
  async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<() => void> {
    if (!this.isAvailable()) {
      logger.warn(`Redis unavailable, cannot subscribe to channel: ${channel}`);
      return () => {};
    }

    try {
      // Create separate client for subscription
      const subClient = this.client!.duplicate();

      subClient.on('message', (ch, message) => {
        if (ch === channel) {
          callback(message);
        }
      });

      await subClient.subscribe(channel);

      // Return cleanup function
      return () => {
        subClient.unsubscribe(channel);
        subClient.disconnect();
      };
    } catch (error) {
      logger.error({ err: error }, `Redis SUBSCRIBE failed for channel: ${channel}`);
      return () => {};
    }
  }

  // ==================== Session Management ====================

  /**
   * Store session data
   */
  async setSession(sessionId: string, data: Record<string, unknown>, ttlMs: number): Promise<boolean> {
    return this.setJson(`session:${sessionId}`, data, ttlMs);
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<Record<string, unknown> | null> {
    return this.getJson(`session:${sessionId}`);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    return this.del(`session:${sessionId}`);
  }

  /**
   * Extend session TTL
   */
  async touchSession(sessionId: string, ttlMs: number): Promise<boolean> {
    if (!this.isAvailable()) {
      const stored = this.inMemoryFallback.get(`session:${sessionId}`);
      if (stored) {
        stored.expiresAt = Date.now() + ttlMs;
        return true;
      }
      return false;
    }

    try {
      const result = await this.client!.pexpire(`session:${sessionId}`, ttlMs);
      return result === 1;
    } catch (error) {
      logger.error({ err: error }, 'Redis session touch failed');
      return false;
    }
  }

  // ==================== Distributed Locks ====================

  /**
   * Acquire distributed lock
   */
  async acquireLock(lockKey: string, ttlMs: number = 30000): Promise<string | null> {
    const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fullKey = `lock:${lockKey}`;

    if (!this.isAvailable()) {
      // Simple in-memory lock
      if (this.inMemoryFallback.has(fullKey)) {
        return null;
      }
      this.inMemoryFallback.set(fullKey, {
        value: lockId,
        expiresAt: Date.now() + ttlMs,
      });
      return lockId;
    }

    try {
      const result = await this.client!.set(fullKey, lockId, 'PX', ttlMs, 'NX');
      return result === 'OK' ? lockId : null;
    } catch (error) {
      logger.error({ err: error }, 'Failed to acquire lock');
      return null;
    }
  }

  /**
   * Release distributed lock
   */
  async releaseLock(lockKey: string, lockId: string): Promise<boolean> {
    const fullKey = `lock:${lockKey}`;

    if (!this.isAvailable()) {
      const stored = this.inMemoryFallback.get(fullKey);
      if (stored && stored.value === lockId) {
        this.inMemoryFallback.delete(fullKey);
        return true;
      }
      return false;
    }

    try {
      // Lua script to ensure we only release our own lock
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.client!.eval(luaScript, 1, fullKey, lockId);
      return result === 1;
    } catch (error) {
      logger.error({ err: error }, 'Failed to release lock');
      return false;
    }
  }

  // ==================== Cleanup ====================

  /**
   * Clean up expired in-memory entries
   */
  cleanupMemory(): void {
    const now = Date.now();
    for (const [key, value] of Array.from(this.inMemoryFallback.entries())) {
      if (value.expiresAt < now) {
        this.inMemoryFallback.delete(key);
      }
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

// Singleton instance
export const redisService = new RedisService();

// Cleanup expired in-memory entries periodically
setInterval(() => {
  redisService.cleanupMemory();
}, 60000);
