# Redis Cache Service - Usage Guide

## Overview

The Redis Cache Service provides a robust caching layer with graceful fallback to no-cache mode when Redis is unavailable. It's designed to improve application performance by reducing database queries and expensive computations.

## Features

- **Automatic Connection Management**: Handles Redis connection, reconnection, and failure gracefully
- **Graceful Fallback**: Continues operating without caching if Redis is unavailable
- **Type-Safe**: Full TypeScript support with generics
- **Pattern-Based Invalidation**: Delete multiple related keys at once
- **TTL Support**: Automatic expiration of cached data
- **Atomic Operations**: Support for increment/decrement operations
- **Health Monitoring**: Built-in health checks and statistics

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
REDIS_URL=redis://localhost:6379
```

For production environments:

```bash
# AWS ElastiCache
REDIS_URL=redis://your-cache.cache.amazonaws.com:6379

# Redis Cloud
REDIS_URL=redis://username:password@your-endpoint.redislabs.com:16379

# Heroku Redis
REDIS_URL=redis://h:password@ec2-xxx.compute-1.amazonaws.com:5432
```

## Basic Usage

### Import the Service

```typescript
import { cacheService, CACHE_TTL } from '../services/cache.service';
import { cacheKeys } from '../lib/cacheKeys';
```

### Get and Set Operations

```typescript
// Set a value with TTL (time-to-live)
await cacheService.set('user:123', userData, CACHE_TTL.SHORT); // 60 seconds

// Get a value
const user = await cacheService.get<User>('user:123');
if (user) {
  console.log('Cache hit!', user);
} else {
  console.log('Cache miss - fetch from database');
}

// Delete a value
await cacheService.delete('user:123');
```

### Cache-Aside Pattern (Get or Set)

The most common caching pattern - automatically fetch and cache if not present:

```typescript
async function getUserCredits(userId: number, creditType: string) {
  const cacheKey = cacheKeys.userCredits(userId.toString());

  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      // This function only runs on cache miss
      const db = await getDb();
      const result = await db
        .select()
        .from(user_credits)
        .where(eq(user_credits.userId, userId))
        .limit(1);

      return result[0]?.balance || 0;
    },
    CACHE_TTL.SHORT // 60 seconds
  );
}
```

## Advanced Usage

### Pattern-Based Invalidation

Delete all cache keys matching a pattern:

```typescript
// Delete all user-related cache
await cacheService.deletePattern(`user:${userId}`);

// Delete all workflow definitions
await cacheService.deletePattern('workflow:');

// Delete all rate limit keys for a user
await cacheService.deletePattern(`rate:${userId}`);
```

### Atomic Operations

For counters and rate limiting:

```typescript
// Increment a counter
const newCount = await cacheService.increment(`api:calls:${userId}`);

// Increment by a specific amount
const credits = await cacheService.increment(`credits:${userId}`, 100);

// Decrement
const remaining = await cacheService.decrement(`rate:limit:${userId}`);
```

### Check Existence and TTL

```typescript
// Check if a key exists
const exists = await cacheService.exists('session:abc123');

// Get remaining TTL in seconds
const ttl = await cacheService.ttl('session:abc123');
if (ttl > 0) {
  console.log(`Key expires in ${ttl} seconds`);
} else if (ttl === -1) {
  console.log('Key exists but has no expiration');
} else {
  console.log('Key does not exist');
}
```

## Cache Keys Helper

Use the centralized cache key generator for consistency:

```typescript
import { cacheKeys, cachePatterns } from '../lib/cacheKeys';

// User-related keys
const userKey = cacheKeys.user('123');
const creditsKey = cacheKeys.userCredits('123');

// Workflow keys
const workflowKey = cacheKeys.workflow('456');
const definitionKey = cacheKeys.workflowDefinition('456');

// Session keys
const sessionKey = cacheKeys.session('session-id');

// Rate limiting
const rateLimitKey = cacheKeys.rateLimit('123', '/api/endpoint');

// Pattern-based operations
await cacheService.deletePattern(cachePatterns.userAll('123'));
await cacheService.deletePattern(cachePatterns.allWorkflows());
```

## TTL Constants

Pre-defined TTL values for common use cases:

```typescript
import { CACHE_TTL } from '../services/cache.service';

CACHE_TTL.SHORT   // 60 seconds (1 minute)
CACHE_TTL.MEDIUM  // 300 seconds (5 minutes)
CACHE_TTL.LONG    // 3600 seconds (1 hour)
CACHE_TTL.DAY     // 86400 seconds (24 hours)
```

### Recommended TTLs

- **User Credits**: `CACHE_TTL.SHORT` (60s) - Frequently changing data
- **Workflow Definitions**: `CACHE_TTL.MEDIUM` (5min) - Relatively stable
- **Lead Metadata**: `CACHE_TTL.MEDIUM` (2min) - Moderate update frequency
- **Configuration**: `CACHE_TTL.LONG` (1hr) - Rarely changing
- **Feature Flags**: `CACHE_TTL.DAY` (24hr) - Very stable

## Cache Invalidation

Always invalidate cache after data modifications:

```typescript
async function updateUserCredits(userId: number, amount: number) {
  // 1. Update database
  await db.update(user_credits)
    .set({ balance: newBalance })
    .where(eq(user_credits.userId, userId));

  // 2. Invalidate cache
  const cacheKey = cacheKeys.userCredits(userId.toString());
  await cacheService.delete(cacheKey);

  // Or invalidate all user-related cache
  await cacheService.deletePattern(cachePatterns.userAll(userId.toString()));
}
```

## Health Monitoring

### Health Check

```typescript
const health = await cacheService.healthCheck();
if (health.healthy) {
  console.log(`Redis is healthy. Latency: ${health.latency}ms`);
} else {
  console.error(`Redis is unhealthy: ${health.error}`);
}
```

### Get Statistics

```typescript
const stats = cacheService.getStats();
console.log(`Cache available: ${stats.available}`);
console.log(`Reconnect attempts: ${stats.reconnectAttempts}`);
```

## Best Practices

### 1. Always Use Cache Keys Helper

```typescript
// Good
const key = cacheKeys.user(userId);

// Bad
const key = `user:${userId}`;
```

### 2. Set Appropriate TTLs

```typescript
// Good - Frequently changing data with short TTL
await cacheService.set(key, value, CACHE_TTL.SHORT);

// Bad - Stale data risk
await cacheService.set(key, value); // No TTL = never expires
```

### 3. Handle Cache Misses Gracefully

```typescript
// Good
const cached = await cacheService.get<User>(key);
const user = cached || await fetchFromDatabase();

// Better - Use getOrSet
const user = await cacheService.getOrSet(
  key,
  () => fetchFromDatabase(),
  CACHE_TTL.SHORT
);
```

### 4. Invalidate After Updates

```typescript
// Good
async function updateUser(userId: string, data: UserData) {
  await db.update(users).set(data).where(eq(users.id, userId));
  await cacheService.delete(cacheKeys.user(userId));
}

// Bad - Stale cache
async function updateUser(userId: string, data: UserData) {
  await db.update(users).set(data).where(eq(users.id, userId));
  // Forgot to invalidate cache!
}
```

### 5. Use Pattern Deletion Sparingly

Pattern deletion scans all keys, which can be slow:

```typescript
// Good - Delete specific keys
await cacheService.delete(cacheKeys.user(userId));

// Use with caution - Scans all keys
await cacheService.deletePattern('user:');
```

### 6. Serialize Complex Objects

The cache service automatically handles JSON serialization:

```typescript
// Automatically serialized/deserialized
const user = { id: 1, name: 'John', meta: { role: 'admin' } };
await cacheService.set('user:1', user);
const cached = await cacheService.get<typeof user>('user:1');
// cached is properly typed and deserialized
```

## Common Patterns

### Rate Limiting

```typescript
async function checkRateLimit(userId: string, limit: number, window: number) {
  const key = cacheKeys.rateLimit(userId, 'api');
  const count = await cacheService.increment(key);

  if (count === 1) {
    // First request - set expiration
    await cacheService.set(key, count, window);
  }

  return count <= limit;
}
```

### Session Management

```typescript
async function getSession(sessionId: string) {
  return await cacheService.getOrSet(
    cacheKeys.session(sessionId),
    async () => {
      const db = await getDb();
      return await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId)
      });
    },
    CACHE_TTL.MEDIUM
  );
}
```

### Feature Flags

```typescript
async function isFeatureEnabled(flag: string): Promise<boolean> {
  return await cacheService.getOrSet(
    cacheKeys.featureFlag(flag),
    async () => {
      const db = await getDb();
      const result = await db.query.featureFlags.findFirst({
        where: eq(featureFlags.name, flag)
      });
      return result?.enabled || false;
    },
    CACHE_TTL.LONG
  );
}
```

## Graceful Degradation

The cache service automatically handles Redis unavailability:

```typescript
// If Redis is down, this returns null without throwing
const cached = await cacheService.get('key');

// If Redis is down, this just executes the factory function
const data = await cacheService.getOrSet('key', fetchData, 60);

// All operations fail silently and log warnings
await cacheService.set('key', value); // No-op if Redis unavailable
```

## Cleanup on Shutdown

Gracefully close the Redis connection:

```typescript
process.on('SIGTERM', async () => {
  await cacheService.close();
  process.exit(0);
});
```

## Troubleshooting

### Cache Not Working

1. Check Redis URL: `echo $REDIS_URL`
2. Verify Redis is running: `redis-cli ping`
3. Check connection logs in application output
4. Run health check: `await cacheService.healthCheck()`

### High Memory Usage

1. Review TTL values - ensure data expires
2. Use `flush()` to clear all cache (admin only)
3. Monitor cache statistics

### Stale Data

1. Ensure proper cache invalidation after updates
2. Reduce TTL values if data changes frequently
3. Use shorter TTL for critical data

## Testing

For testing, you can mock the cache service:

```typescript
// Mock in tests
jest.mock('../services/cache.service', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    getOrSet: jest.fn().mockImplementation((key, factory) => factory()),
  },
  CACHE_TTL: {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 3600,
    DAY: 86400,
  },
}));
```

## Performance Considerations

1. **Cache Hit Rate**: Monitor hit/miss ratio to optimize TTL
2. **Key Size**: Keep keys short but descriptive
3. **Value Size**: Avoid caching very large objects
4. **Network Latency**: Use cache for database queries, not local operations
5. **Stampede Protection**: Consider adding jitter to TTL for high-traffic keys

## Resources

- [Redis Documentation](https://redis.io/documentation)
- [ioredis GitHub](https://github.com/redis/ioredis)
- [Caching Strategies](https://aws.amazon.com/caching/best-practices/)
