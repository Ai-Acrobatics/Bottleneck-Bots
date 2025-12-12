# Redis Cache - Quick Reference

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Add to .env
REDIS_URL=redis://localhost:6379

# 3. Start Redis (local dev)
docker run -d -p 6379:6379 redis:alpine
```

## Import

```typescript
import { cacheService, CACHE_TTL } from '../services/cache.service';
import { cacheKeys } from '../lib/cacheKeys';
```

## Basic Operations

```typescript
// Get
const value = await cacheService.get<User>('user:123');

// Set with TTL
await cacheService.set('user:123', userData, CACHE_TTL.SHORT);

// Delete
await cacheService.delete('user:123');

// Delete pattern
await cacheService.deletePattern('user:');
```

## Cache-Aside Pattern

```typescript
// Best practice - auto-fetch on miss
const data = await cacheService.getOrSet(
  cacheKeys.user(userId),
  async () => fetchFromDatabase(userId),
  CACHE_TTL.MEDIUM
);
```

## TTL Values

```typescript
CACHE_TTL.SHORT   // 60s - Frequently changing
CACHE_TTL.MEDIUM  // 300s (5min) - Moderately stable
CACHE_TTL.LONG    // 3600s (1hr) - Rarely changing
CACHE_TTL.DAY     // 86400s (24hr) - Very stable
```

## Cache Keys

```typescript
// Use centralized key generator
cacheKeys.user(id)
cacheKeys.userCredits(id)
cacheKeys.workflow(id)
cacheKeys.workflowDefinition(id)
cacheKeys.session(id)
cacheKeys.leads(listId)
cacheKeys.rateLimit(userId, endpoint)
```

## Advanced Operations

```typescript
// Check existence
const exists = await cacheService.exists('key');

// Get TTL
const ttl = await cacheService.ttl('key'); // -1: no TTL, -2: not exist

// Atomic increment
const count = await cacheService.increment('counter', 1);

// Atomic decrement
const remaining = await cacheService.decrement('limit', 1);
```

## Health Check

```typescript
const health = await cacheService.healthCheck();
// { healthy: true, latency: 2 }

const stats = cacheService.getStats();
// { available: true, reconnectAttempts: 0 }
```

## Common Patterns

### User Credits
```typescript
async function getCredits(userId: number) {
  return await cacheService.getOrSet(
    cacheKeys.userCredits(userId.toString()),
    () => fetchCreditsFromDB(userId),
    CACHE_TTL.SHORT
  );
}

async function updateCredits(userId: number, amount: number) {
  await db.update(...); // Update DB
  await cacheService.delete(cacheKeys.userCredits(userId.toString()));
}
```

### Rate Limiting
```typescript
async function checkRateLimit(userId: string, limit: number) {
  const key = cacheKeys.rateLimit(userId, 'api');
  const count = await cacheService.increment(key);

  if (count === 1) {
    await cacheService.set(key, count, 60); // 60s window
  }

  return count <= limit;
}
```

### Session Storage
```typescript
async function getSession(sessionId: string) {
  return await cacheService.getOrSet(
    cacheKeys.session(sessionId),
    () => fetchSessionFromDB(sessionId),
    CACHE_TTL.MEDIUM
  );
}
```

## Cache Invalidation

```typescript
// Always invalidate after updates
await db.update(...);
await cacheService.delete(cacheKeys.user(userId));

// Or invalidate all related keys
await cacheService.deletePattern(`user:${userId}`);
```

## Error Handling

```typescript
// Cache operations never throw - they fail silently
// If Redis is down, operations become no-ops
const cached = await cacheService.get('key'); // Returns null if Redis down
await cacheService.set('key', value); // No-op if Redis down

// Application continues working without cache
```

## Production Checklist

- [ ] Redis URL configured in environment
- [ ] Redis connection verified (check logs)
- [ ] TTL values set appropriately
- [ ] Cache invalidation after updates
- [ ] Health monitoring enabled
- [ ] Alerts set up for Redis failures

## Testing

```typescript
// Mock in tests
jest.mock('../services/cache.service', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn(),
    getOrSet: jest.fn((key, factory) => factory()),
  },
}));
```

## Redis CLI Commands

```bash
# Connect
redis-cli

# Test connection
PING

# Get all keys
KEYS ghl:*

# Get value
GET ghl:user:123

# Get TTL
TTL ghl:user:123

# Delete key
DEL ghl:user:123

# Clear all app keys
KEYS ghl:* | xargs redis-cli DEL

# Memory usage
INFO memory
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Cache not working | Check REDIS_URL in .env |
| Connection errors | Verify Redis is running |
| Stale data | Check cache invalidation logic |
| High memory | Review TTL values, run FLUSHDB |

## Key Prefixes

All keys use `ghl:` prefix:
- `ghl:user:*` - User data
- `ghl:credits:*` - Credit balances
- `ghl:workflow:*` - Workflows
- `ghl:session:*` - Sessions
- `ghl:rate:*` - Rate limits
- `ghl:leads:*` - Lead lists

## Performance Tips

1. Use appropriate TTLs based on data change frequency
2. Avoid caching very large objects (>1MB)
3. Use pattern deletion sparingly (it scans all keys)
4. Monitor cache hit/miss ratios
5. Cache database queries, not local operations

## Resources

- Full Documentation: `/docs/REDIS_CACHE_USAGE.md`
- Implementation: `/server/services/cache.service.ts`
- Cache Keys: `/server/lib/cacheKeys.ts`
