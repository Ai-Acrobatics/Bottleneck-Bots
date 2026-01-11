# PRD: API Key Management

## Overview
A comprehensive API key management system for generating, revoking, and monitoring API keys with scope-based permissions, rate limiting, and detailed usage tracking. This system enables secure programmatic access to Bottleneck-Bots APIs for integrations, automations, and third-party applications.

## Problem Statement
Users and developers need secure, manageable API access for building integrations and automations with Bottleneck-Bots. They need the ability to create multiple API keys with different permission scopes, track usage, set rate limits, and revoke access instantly when needed. Without proper API key management, users cannot safely integrate external systems or control access granularity.

## Goals & Objectives
- **Primary Goals**
  - Enable secure programmatic API access
  - Provide granular permission control via scopes
  - Implement intelligent rate limiting
  - Deliver comprehensive usage analytics

- **Success Metrics**
  - < 1ms API key validation latency
  - 100% of API requests tracked and attributed
  - Zero unauthorized access incidents
  - < 1 second key generation time

## User Stories
- As a developer, I want to create API keys with specific scopes so that I can limit access to only necessary resources
- As a user, I want to see which applications are using my API keys so that I can audit access
- As an admin, I want to set rate limits per key so that no single integration can overwhelm the system
- As a user, I want to revoke keys instantly so that I can respond to security concerns immediately
- As a developer, I want to rotate keys without downtime so that I can maintain security without service interruption

## Functional Requirements

### Must Have (P0)
- **Key Generation**
  - Generate cryptographically secure API keys
  - Support key prefixes for identification (e.g., `bb_live_`, `bb_test_`)
  - Key metadata (name, description, created date)
  - Environment separation (live/test keys)
  - Key hashing for secure storage (only show full key once)

- **Scope-Based Permissions**
  - Define granular permission scopes
  - Scope selection during key creation
  - Scope validation on API requests
  - Scope inheritance hierarchy
  - Read/write permission levels per resource

- **Key Lifecycle Management**
  - Key creation with immediate availability
  - Key revocation (immediate effect)
  - Key expiration dates (optional)
  - Key regeneration/rotation
  - Bulk key operations

- **Rate Limiting**
  - Per-key rate limits
  - Default rate limits by plan tier
  - Custom rate limit overrides
  - Rate limit headers in responses
  - Burst allowance configuration

- **Usage Tracking**
  - Request count per key
  - Endpoint usage breakdown
  - Error rate tracking
  - Response time metrics
  - Last used timestamp

### Should Have (P1)
- **Key Rotation**
  - Generate new key while old remains active
  - Configurable overlap period
  - Automatic old key expiration
  - Rotation reminders/notifications
  - Rotation audit trail

- **IP Restrictions**
  - IP allowlist per key
  - CIDR range support
  - IP validation on requests
  - Blocked IP logging

- **Usage Alerts**
  - Threshold-based alerts
  - Unusual activity detection
  - Rate limit approach warnings
  - Email/webhook notifications

- **Key Groups**
  - Organize keys into groups
  - Group-level rate limits
  - Group usage aggregation
  - Batch operations on groups

### Nice to Have (P2)
- **Advanced Analytics**
  - Usage trend visualization
  - Cost attribution per key
  - Geographic usage distribution
  - Performance impact analysis

- **SDK Support**
  - Auto-generated SDKs with key embedding
  - SDK usage examples
  - Postman/Insomnia collections

## Non-Functional Requirements

### Performance
- Key validation < 1ms (cached)
- Key generation < 1 second
- Rate limit check < 0.5ms
- Usage stats query < 500ms

### Security
- Keys hashed with bcrypt (cost factor 12)
- Only show full key once at creation
- Encrypted at rest (AES-256)
- Secure key transmission (HTTPS only)
- Key entropy minimum 256 bits
- No key logging in application logs

### Scalability
- Support 1M+ active keys
- Handle 100K+ requests/second for validation
- Distributed rate limiting via Redis
- Sharded usage data storage

### Reliability
- Key validation works during partial outages
- Cached key data with TTL refresh
- Graceful degradation if analytics unavailable
- Zero false positive revocations

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    API Key Management                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Key Management UI                  │   │
│  │  Create │ List │ Edit │ Revoke │ Analytics │ Rotate │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │                 API Gateway Layer                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │ │
│  │  │   Key    │  │   Rate   │  │      Scope       │    │ │
│  │  │Validator │  │  Limiter │  │    Enforcer      │    │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Key Store    │  │  Rate Limit   │  │    Usage      │  │
│  │  (PostgreSQL) │  │    (Redis)    │  │   (ClickHouse)│  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- PostgreSQL for key metadata
- Redis for rate limiting and caching
- ClickHouse/TimescaleDB for usage analytics
- Crypto libraries for secure key generation

### APIs
```typescript
// Key Management
POST   /api/v1/api-keys
GET    /api/v1/api-keys
GET    /api/v1/api-keys/:keyId
PUT    /api/v1/api-keys/:keyId
DELETE /api/v1/api-keys/:keyId
POST   /api/v1/api-keys/:keyId/rotate
POST   /api/v1/api-keys/:keyId/revoke

// Key Scopes
GET    /api/v1/api-keys/scopes

// Usage & Analytics
GET    /api/v1/api-keys/:keyId/usage
GET    /api/v1/api-keys/:keyId/usage/breakdown
GET    /api/v1/api-keys/:keyId/usage/timeline

// Rate Limits
GET    /api/v1/api-keys/:keyId/rate-limits
PUT    /api/v1/api-keys/:keyId/rate-limits
```

### Data Models
```typescript
interface ApiKey {
  id: string;
  userId: string;
  name: string;
  description: string;
  keyPrefix: string; // bb_live_ or bb_test_
  keyHash: string; // bcrypt hash
  keyHint: string; // last 4 characters for identification
  environment: 'live' | 'test';
  scopes: string[];
  rateLimit: RateLimitConfig;
  ipAllowlist: string[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  lastUsedIp: string | null;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

interface ApiKeyUsage {
  keyId: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  requestSize: number;
  responseSize: number;
}

interface ApiKeyScope {
  name: string;
  description: string;
  resources: string[];
  permissions: ('read' | 'write' | 'delete')[];
  parent: string | null;
}
```

### Scope Definitions
```typescript
const scopes = {
  // Workflow scopes
  'workflows:read': 'Read workflow configurations',
  'workflows:write': 'Create and update workflows',
  'workflows:execute': 'Execute workflows',
  'workflows:delete': 'Delete workflows',

  // Contact scopes
  'contacts:read': 'Read contact data',
  'contacts:write': 'Create and update contacts',
  'contacts:delete': 'Delete contacts',

  // Email scopes
  'emails:read': 'Read email data',
  'emails:send': 'Send emails',

  // Analytics scopes
  'analytics:read': 'Read analytics data',

  // Webhook scopes
  'webhooks:read': 'Read webhook configurations',
  'webhooks:write': 'Create and manage webhooks',

  // Admin scopes (restricted)
  'admin:users': 'Manage user accounts',
  'admin:billing': 'Access billing information',

  // Full access
  '*': 'Full API access (all scopes)'
};
```

### Rate Limiting Implementation
```typescript
// Redis-based sliding window rate limiter
async function checkRateLimit(keyId: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();
  const windows = [
    { key: `rl:${keyId}:sec`, limit: config.requestsPerSecond, window: 1000 },
    { key: `rl:${keyId}:min`, limit: config.requestsPerMinute, window: 60000 },
    { key: `rl:${keyId}:hour`, limit: config.requestsPerHour, window: 3600000 },
    { key: `rl:${keyId}:day`, limit: config.requestsPerDay, window: 86400000 }
  ];

  for (const { key, limit, window } of windows) {
    const count = await redis.zcount(key, now - window, now);
    if (count >= limit) {
      return {
        allowed: false,
        retryAfter: calculateRetryAfter(key, window),
        limit,
        remaining: 0,
        reset: now + window
      };
    }
  }

  // Record this request
  await redis.zadd(`rl:${keyId}:sec`, now, `${now}`);
  await redis.expire(`rl:${keyId}:sec`, 2);

  return { allowed: true, remaining: limit - count - 1 };
}
```

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Key Validation Latency | < 1ms | Average validation time (cached) |
| Key Generation Time | < 1 sec | Time to create new key |
| Rate Limit Accuracy | 99.99% | Correct rate limit enforcement |
| Usage Attribution | 100% | Requests attributed to keys |
| Key Security Incidents | 0 | Unauthorized access via keys |
| API Availability | 99.99% | Key validation uptime |

## Dependencies
- Secure random number generator
- Redis cluster for rate limiting
- Analytics database infrastructure
- Email service for notifications
- API gateway integration

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Key leakage | Critical - Unauthorized access | One-time display, rotation support, usage alerts |
| Rate limit bypass | High - System overload | Distributed rate limiting, multiple window checks |
| Key database breach | Critical - Mass compromise | Hashed storage, encryption at rest, key rotation |
| Usage data volume | Medium - Storage costs | Data aggregation, retention policies |
| Rate limit cache failure | Medium - Enforcement gaps | Fallback to database, conservative defaults |
| Scope privilege escalation | High - Unauthorized access | Strict scope validation, inheritance controls |
