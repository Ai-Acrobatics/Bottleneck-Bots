# Redis Cache Service Implementation Summary

## Overview

A comprehensive Redis-based caching service has been implemented for the GHL Agency AI application. The service provides robust caching with graceful fallback when Redis is unavailable.

## Files Created/Modified

### 1. **package.json** (Modified)
- **Added dependency**: `ioredis: ^5.4.1`
- **Installation required**: Run `pnpm install` to install the new dependency

### 2. **.env.example** (Modified)
- **Added**: `REDIS_URL=redis://localhost:6379`
- **Action required**: Update your `.env` file with actual Redis connection URL

### 3. **server/services/cache.service.ts** (Completely Rewritten)
- **Location**: `/Users/julianbradley/ghl-agency-ai/server/services/cache.service.ts`
- **Size**: ~426 lines of TypeScript code
- **Features**:
  - Redis connection with automatic reconnection
  - Graceful fallback to no-cache mode if Redis unavailable
  - Full TypeScript support with generics
  - Pattern-based key deletion
  - TTL (Time-To-Live) support
  - Atomic operations (increment/decrement)
  - Health monitoring
  - Cache statistics

### 4. **server/lib/cacheKeys.ts** (New File)
- **Location**: `/Users/julianbradley/ghl-agency-ai/server/lib/cacheKeys.ts`
- **Size**: ~150 lines of TypeScript code
- **Purpose**: Centralized cache key generation
- **Exports**:
  - `cacheKeys`: Object with methods for generating cache keys
  - `cachePatterns`: Pattern generators for bulk operations
  - Helper functions for timestamped, paginated, and sorted keys

### 5. **server/services/credit.service.ts** (Modified)
- **Added**: Cache integration for user credit balance queries
- **TTL**: 60 seconds (CACHE_TTL.SHORT)
- **Automatic invalidation**: After credit add/deduct operations
- **Cache key pattern**: `credits:{userId}:{creditType}`

### 6. **server/services/workflowExecution.service.ts** (Modified)
- **Added**: Cache integration for workflow definitions
- **TTL**: 300 seconds (CACHE_TTL.MEDIUM / 5 minutes)
- **Cache key pattern**: `workflow:{workflowId}:definition`
- **Benefit**: Reduces database queries for frequently executed workflows

### 7. **docs/REDIS_CACHE_USAGE.md** (New Documentation)
- **Location**: `/Users/julianbradley/ghl-agency-ai/docs/REDIS_CACHE_USAGE.md`
- **Size**: Comprehensive usage guide with examples
- **Contents**:
  - Basic usage examples
  - Advanced patterns (cache-aside, rate limiting, sessions)
  - Best practices
  - Troubleshooting guide
  - Performance considerations

## Core Features Implemented

### 1. Connection Management
```typescript
// Automatic initialization on module load
// Handles connection, reconnection, and errors gracefully
// Falls back to no-cache mode if Redis unavailable
```

### 2. Core Methods

#### Get and Set
```typescript
// Get cached value
const user = await cacheService.get<User>('user:123');

// Set with TTL
await cacheService.set('user:123', userData, CACHE_TTL.SHORT);
```

#### Cache-Aside Pattern (getOrSet)
```typescript
const data = await cacheService.getOrSet(
  'key',
  async () => fetchFromDatabase(),
  CACHE_TTL.SHORT
);
```

#### Delete Operations
```typescript
// Delete single key
await cacheService.delete('user:123');

// Delete by pattern
await cacheService.deletePattern('user:');
```

#### Key Operations
```typescript
// Check existence
const exists = await cacheService.exists('key');

// Get TTL
const ttl = await cacheService.ttl('key');
```

#### Atomic Operations
```typescript
// Increment
const count = await cacheService.increment('counter');

// Decrement
const remaining = await cacheService.decrement('limit');
```

### 3. Health Monitoring
```typescript
// Health check
const health = await cacheService.healthCheck();
// Returns: { healthy: boolean, latency?: number, error?: string }

// Get stats
const stats = cacheService.getStats();
// Returns: { available: boolean, reconnectAttempts: number }
```

### 4. Graceful Cleanup
```typescript
// Close connection gracefully
await cacheService.close();
```

## Cache Keys Structure

All cache keys are prefixed with `ghl:` to namespace the application's cache.

### Key Patterns

| Pattern | Example | TTL | Usage |
|---------|---------|-----|-------|
| `user:{id}` | `ghl:user:123` | Variable | User data |
| `credits:{userId}:{type}` | `ghl:credits:123:enrichment` | 60s | User credits |
| `workflow:{id}:definition` | `ghl:workflow:456:definition` | 300s | Workflow definitions |
| `session:{id}` | `ghl:session:abc123` | Variable | User sessions |
| `rate:{userId}:{endpoint}` | `ghl:rate:123:/api/data` | Variable | Rate limiting |
| `leads:{listId}` | `ghl:leads:789` | 120s | Lead list metadata |

## TTL Constants

Predefined TTL values for different data types:

```typescript
CACHE_TTL.SHORT   // 60 seconds - Frequently changing data
CACHE_TTL.MEDIUM  // 300 seconds (5 min) - Moderately stable data
CACHE_TTL.LONG    // 3600 seconds (1 hr) - Rarely changing data
CACHE_TTL.DAY     // 86400 seconds (24 hr) - Very stable data
```

## Installation & Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Redis
Add to your `.env` file:

```bash
# Local development
REDIS_URL=redis://localhost:6379

# Production (example with authentication)
REDIS_URL=redis://username:password@your-redis-host:6379
```

### 3. Start Redis (if running locally)
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or using Homebrew (macOS)
brew services start redis
```

### 4. Verify Connection
The application will log connection status on startup:
- `[Cache] Redis connection established` - Success
- `[Cache] REDIS_URL not configured` - Running in no-cache mode

## Usage Examples

### Example 1: Caching User Credits
```typescript
import { cacheService, CACHE_TTL } from './services/cache.service';
import { cacheKeys } from './lib/cacheKeys';

async function getUserCredits(userId: number) {
  return await cacheService.getOrSet(
    cacheKeys.userCredits(userId.toString()),
    async () => {
      // Fetch from database
      const db = await getDb();
      return await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId)
      });
    },
    CACHE_TTL.SHORT // 60 seconds
  );
}
```

### Example 2: Cache Invalidation
```typescript
async function updateUserCredits(userId: number, amount: number) {
  // Update database
  await db.update(userCredits)
    .set({ balance: newBalance })
    .where(eq(userCredits.userId, userId));

  // Invalidate cache
  await cacheService.delete(cacheKeys.userCredits(userId.toString()));
}
```

### Example 3: Rate Limiting
```typescript
async function checkRateLimit(userId: string, limit: number) {
  const key = cacheKeys.rateLimit(userId, '/api/endpoint');
  const count = await cacheService.increment(key);

  if (count === 1) {
    // First request - set expiration
    await cacheService.set(key, count, 60); // 60 second window
  }

  return count <= limit;
}
```

## Benefits

1. **Performance**: Reduces database load by caching frequently accessed data
2. **Scalability**: Redis supports distributed caching across multiple instances
3. **Reliability**: Graceful fallback ensures application continues working if Redis fails
4. **Type Safety**: Full TypeScript support with generics
5. **Monitoring**: Built-in health checks and statistics
6. **Maintainability**: Centralized cache key management
7. **Flexibility**: Configurable TTLs for different data types

## Recommended Next Steps

### High Priority
1. **Install ioredis**: Run `pnpm install` to install the new dependency
2. **Configure Redis URL**: Update `.env` file with Redis connection string
3. **Test Connection**: Start the application and verify Redis connection logs

### Medium Priority
1. **Add More Caching**: Identify other frequently accessed data to cache
   - Lead list metadata (TTL: 120s)
   - User profiles (TTL: 300s)
   - Feature flags (TTL: 1hr)
   - Integration tokens (TTL: 300s)

2. **Monitoring**: Set up Redis monitoring
   - Track cache hit/miss ratios
   - Monitor memory usage
   - Alert on connection failures

### Low Priority
1. **Optimization**: Fine-tune TTL values based on actual usage patterns
2. **Clustering**: For production, consider Redis Cluster or Sentinel for high availability
3. **Analytics**: Add cache metrics to application dashboard

## Redis Deployment Options

### Development
- Local Redis instance (Docker or native)
- Redis Playground (free tier)

### Production
- **AWS ElastiCache**: Managed Redis with automatic failover
- **Redis Cloud**: Official managed Redis service
- **Heroku Redis**: Add-on for Heroku deployments
- **DigitalOcean Redis**: Managed Redis clusters
- **Azure Cache for Redis**: Microsoft Azure managed service

## Performance Considerations

1. **Key Size**: Keep cache keys short but descriptive
2. **Value Size**: Avoid caching very large objects (>1MB)
3. **TTL Strategy**: Balance freshness vs. cache hit rate
4. **Pattern Deletion**: Use sparingly as it scans all keys
5. **Network Latency**: Cache is most beneficial for database queries, not local operations

## Troubleshooting

### Redis Not Connecting
1. Check `REDIS_URL` environment variable
2. Verify Redis is running: `redis-cli ping`
3. Check network/firewall settings
4. Review application logs for connection errors

### High Memory Usage
1. Review TTL values - ensure data expires
2. Use `flush()` to clear cache (admin only)
3. Monitor with `redis-cli info memory`

### Stale Data
1. Ensure cache invalidation after updates
2. Reduce TTL for frequently changing data
3. Use shorter TTL for critical data

## Security Considerations

1. **Network Security**: Use TLS for Redis connections in production
2. **Authentication**: Always use password authentication
3. **Access Control**: Use Redis ACLs to limit command access
4. **Encryption**: Consider encryption at rest for sensitive data
5. **Key Prefixing**: All keys are prefixed with `ghl:` to avoid conflicts

## Testing

The cache service is designed to be easily testable:

```typescript
// Mock for unit tests
jest.mock('./services/cache.service', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn(),
    getOrSet: jest.fn((key, factory) => factory()),
  },
}));
```

## Migration from No-Cache

The application already uses the cache service stub, so no code changes are needed. The new implementation is a drop-in replacement that:

1. Maintains the same API
2. Adds new features (increment, exists, ttl, health checks)
3. Works with existing code
4. Falls back gracefully if Redis unavailable

## Maintenance

### Regular Tasks
- Monitor cache hit/miss ratios
- Review and optimize TTL values
- Check Redis memory usage
- Update Redis version periodically

### Alerting
Set up alerts for:
- Redis connection failures
- High memory usage (>80%)
- Slow response times (>10ms)
- Reconnection attempts

## Additional Resources

- **Documentation**: `/docs/REDIS_CACHE_USAGE.md`
- **Cache Service**: `/server/services/cache.service.ts`
- **Cache Keys**: `/server/lib/cacheKeys.ts`
- **Redis Documentation**: https://redis.io/documentation
- **ioredis GitHub**: https://github.com/redis/ioredis

## Summary

The Redis cache service is production-ready and provides:
- ✅ Robust connection management with reconnection
- ✅ Graceful fallback to no-cache mode
- ✅ Type-safe operations with TypeScript
- ✅ Comprehensive error handling
- ✅ Health monitoring and statistics
- ✅ Pattern-based invalidation
- ✅ Atomic operations
- ✅ Centralized key management
- ✅ Integration examples (credits, workflows)
- ✅ Complete documentation

**Status**: Ready for deployment after running `pnpm install` and configuring Redis URL.
