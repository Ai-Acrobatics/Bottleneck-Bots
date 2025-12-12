/**
 * Redis Cache Service
 * Provides a robust caching layer with Redis backend
 */

import Redis from 'ioredis';

// Cache configuration
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
} as const;

export const CACHE_PREFIX = 'ghl:';

// Redis connection state
let redisClient: Redis | null = null;
let isRedisAvailable = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Initialize Redis connection
 */
function initializeRedis(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('[Cache] REDIS_URL not configured. Cache will operate in no-cache mode.');
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > MAX_RECONNECT_ATTEMPTS) {
          console.error('[Cache] Max reconnection attempts reached. Disabling cache.');
          isRedisAvailable = false;
          return null; // Stop retrying
        }

        reconnectAttempts = times;
        const delay = Math.min(times * 100, 3000);
        console.log(`[Cache] Reconnecting to Redis (attempt ${times})... Retry in ${delay}ms`);
        return delay;
      },
      lazyConnect: true,
      enableReadyCheck: true,
    });

    // Connection event handlers
    client.on('connect', () => {
      console.log('[Cache] Redis connection established');
      isRedisAvailable = true;
      reconnectAttempts = 0;
    });

    client.on('ready', () => {
      console.log('[Cache] Redis is ready to accept commands');
      isRedisAvailable = true;
    });

    client.on('error', (error) => {
      console.error('[Cache] Redis connection error:', error.message);
      isRedisAvailable = false;
    });

    client.on('close', () => {
      console.warn('[Cache] Redis connection closed');
      isRedisAvailable = false;
    });

    client.on('reconnecting', () => {
      console.log('[Cache] Attempting to reconnect to Redis...');
    });

    // Attempt initial connection
    client.connect().catch((error) => {
      console.error('[Cache] Failed to connect to Redis:', error.message);
      isRedisAvailable = false;
    });

    return client;
  } catch (error) {
    console.error('[Cache] Failed to initialize Redis client:', error);
    return null;
  }
}

// Initialize Redis client on module load
redisClient = initializeRedis();

/**
 * Get full cache key with prefix
 */
function getFullKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Serialize value for storage
 */
function serialize<T>(value: T): string {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}

/**
 * Deserialize value from storage
 */
function deserialize<T>(value: string | null): T | null {
  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    // If parsing fails, return as-is (it's a plain string)
    return value as unknown as T;
  }
}

/**
 * Cache Service
 */
export const cacheService = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient || !isRedisAvailable) {
      console.debug(`[Cache] GET ${getFullKey(key)} - Redis unavailable`);
      return null;
    }

    try {
      const fullKey = getFullKey(key);
      const value = await redisClient.get(fullKey);

      if (value !== null) {
        console.debug(`[Cache] HIT ${fullKey}`);
        return deserialize<T>(value);
      }

      console.debug(`[Cache] MISS ${fullKey}`);
      return null;
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cached value with optional TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!redisClient || !isRedisAvailable) {
      console.debug(`[Cache] SET ${getFullKey(key)} - Redis unavailable`);
      return;
    }

    try {
      const fullKey = getFullKey(key);
      const serialized = serialize(value);

      if (ttlSeconds && ttlSeconds > 0) {
        await redisClient.setex(fullKey, ttlSeconds, serialized);
        console.debug(`[Cache] SET ${fullKey} (TTL: ${ttlSeconds}s)`);
      } else {
        await redisClient.set(fullKey, serialized);
        console.debug(`[Cache] SET ${fullKey} (no TTL)`);
      }
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error);
    }
  },

  /**
   * Delete a single key
   */
  async delete(key: string): Promise<void> {
    if (!redisClient || !isRedisAvailable) {
      console.debug(`[Cache] DELETE ${getFullKey(key)} - Redis unavailable`);
      return;
    }

    try {
      const fullKey = getFullKey(key);
      await redisClient.del(fullKey);
      console.debug(`[Cache] DELETE ${fullKey}`);
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error);
    }
  },

  /**
   * Delete keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!redisClient || !isRedisAvailable) {
      console.debug(`[Cache] DELETE_PATTERN ${getFullKey(pattern)}* - Redis unavailable`);
      return 0;
    }

    try {
      const fullPattern = getFullKey(pattern) + '*';
      const stream = redisClient.scanStream({
        match: fullPattern,
        count: 100,
      });

      let deletedCount = 0;
      const keysToDelete: string[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          if (keys.length > 0) {
            keysToDelete.push(...keys);
          }
        });

        stream.on('end', async () => {
          try {
            if (keysToDelete.length > 0) {
              deletedCount = await redisClient!.del(...keysToDelete);
              console.debug(`[Cache] DELETE_PATTERN ${fullPattern} - deleted ${deletedCount} keys`);
            }
            resolve(deletedCount);
          } catch (error) {
            reject(error);
          }
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error(`[Cache] Error deleting pattern ${pattern}:`, error);
      return 0;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!redisClient || !isRedisAvailable) {
      return false;
    }

    try {
      const fullKey = getFullKey(key);
      const result = await redisClient.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error(`[Cache] Error checking existence of key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get remaining TTL in seconds (-1 if no TTL, -2 if key doesn't exist)
   */
  async ttl(key: string): Promise<number> {
    if (!redisClient || !isRedisAvailable) {
      return -2;
    }

    try {
      const fullKey = getFullKey(key);
      return await redisClient.ttl(fullKey);
    } catch (error) {
      console.error(`[Cache] Error getting TTL for key ${key}:`, error);
      return -2;
    }
  },

  /**
   * Get cached value or compute and cache it
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute the value
    const value = await factory();

    // Cache it for future use
    await this.set(key, value, ttlSeconds);

    return value;
  },

  /**
   * Increment a numeric value atomically
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    if (!redisClient || !isRedisAvailable) {
      console.debug(`[Cache] INCREMENT ${getFullKey(key)} - Redis unavailable`);
      return 0;
    }

    try {
      const fullKey = getFullKey(key);
      const result = await redisClient.incrby(fullKey, amount);
      console.debug(`[Cache] INCREMENT ${fullKey} by ${amount} -> ${result}`);
      return result;
    } catch (error) {
      console.error(`[Cache] Error incrementing key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Decrement a numeric value atomically
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    if (!redisClient || !isRedisAvailable) {
      console.debug(`[Cache] DECREMENT ${getFullKey(key)} - Redis unavailable`);
      return 0;
    }

    try {
      const fullKey = getFullKey(key);
      const result = await redisClient.decrby(fullKey, amount);
      console.debug(`[Cache] DECREMENT ${fullKey} by ${amount} -> ${result}`);
      return result;
    } catch (error) {
      console.error(`[Cache] Error decrementing key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Clear all cache (use with caution!)
   */
  async flush(): Promise<void> {
    if (!redisClient || !isRedisAvailable) {
      console.debug('[Cache] FLUSH - Redis unavailable');
      return;
    }

    try {
      // Only flush keys with our prefix to avoid affecting other data
      await this.deletePattern('');
      console.log('[Cache] FLUSH completed');
    } catch (error) {
      console.error('[Cache] Error flushing cache:', error);
    }
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    if (!redisClient) {
      return { healthy: false, error: 'Redis client not initialized' };
    }

    if (!isRedisAvailable) {
      return { healthy: false, error: 'Redis connection unavailable' };
    }

    try {
      const start = Date.now();
      await redisClient.ping();
      const latency = Date.now() - start;

      return { healthy: true, latency };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get cache statistics
   */
  getStats(): { available: boolean; reconnectAttempts: number } {
    return {
      available: isRedisAvailable,
      reconnectAttempts,
    };
  },

  /**
   * Gracefully close Redis connection
   */
  async close(): Promise<void> {
    if (redisClient) {
      try {
        await redisClient.quit();
        console.log('[Cache] Redis connection closed gracefully');
      } catch (error) {
        console.error('[Cache] Error closing Redis connection:', error);
      }
    }
  },
};

export type CacheService = typeof cacheService;

// Legacy method aliases for backwards compatibility
export const cache = {
  get: cacheService.get.bind(cacheService),
  set: cacheService.set.bind(cacheService),
  del: cacheService.delete.bind(cacheService),
  invalidatePattern: cacheService.deletePattern.bind(cacheService),
  flush: cacheService.flush.bind(cacheService),
};
