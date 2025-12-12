/**
 * Validation Cache Service
 * Caches API key validation results to avoid excessive API calls
 *
 * Features:
 * - In-memory cache with TTL (Time To Live)
 * - Automatic cleanup of expired entries
 * - Thread-safe operations
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class ValidationCacheService<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(defaultTTLMinutes: number = 5) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLMinutes * 60 * 1000; // Convert to milliseconds

    // Start automatic cleanup every minute
    this.startCleanup();
  }

  /**
   * Store a value in the cache
   */
  set(key: string, value: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Retrieve a value from the cache
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache (including expired)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries from the cache
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // Convert to array to avoid iterator issues
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`[ValidationCache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);

    // Prevent the interval from keeping the process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Generate a cache key from provider and credentials
   */
  static generateKey(userId: string, provider: string, credentials: Record<string, string>): string {
    // Create a stable key by sorting credential keys
    const credentialKeys = Object.keys(credentials).sort();
    const credentialHash = credentialKeys
      .map(key => `${key}:${credentials[key].substring(0, 8)}`)
      .join("|");

    return `${userId}:${provider}:${credentialHash}`;
  }
}

// Export singleton instance with 5-minute TTL
export const validationCache = new ValidationCacheService(5);
