# PRD-024: API Key Management

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/apiKeys.ts`, `drizzle/schema.ts`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Dependencies](#8-dependencies)
9. [Out of Scope](#9-out-of-scope)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Milestones & Timeline](#11-milestones--timeline)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Overview

### 1.1 Executive Summary

The API Key Management feature provides a comprehensive system for generating, managing, and securing API keys that enable programmatic access to the Bottleneck-Bots platform. This feature allows users to create scoped API keys with granular permissions, configurable rate limits, usage tracking, and secure rotation capabilities. The system is designed to support external integrations, automation workflows, and third-party developer access while maintaining enterprise-grade security standards.

### 1.2 Key Components

| Component | Description | Location |
|-----------|-------------|----------|
| **Key Generation** | Cryptographically secure API key generation with `ghl_` prefix | `server/api/routers/apiKeys.ts` |
| **Permission Scopes** | Granular permission system with wildcard and resource-specific scopes | `server/api/routers/apiKeys.ts` |
| **Rate Limiting** | Configurable per-key rate limits at minute/hour/day granularity | `server/api/routers/apiKeys.ts` |
| **Usage Tracking** | Request logging and analytics per API key | `drizzle/schema.ts` (apiRequestLogs) |
| **Key Revocation** | Soft-delete revocation with timestamp tracking | `server/api/routers/apiKeys.ts` |
| **Key Storage** | SHA-256 hashed storage with prefix for identification | `drizzle/schema.ts` (apiKeys) |

### 1.3 Security Highlights

- **SHA-256 Hashing**: API keys are hashed before storage; full key visible only on creation
- **Prefix Display**: Only first 12 characters stored for user identification
- **Scope-Based Access**: Fine-grained permission control per resource type
- **Automatic Expiration**: Optional expiration dates with automatic invalidation
- **Soft Revocation**: Keys can be revoked while maintaining audit trail
- **Rate Limiting**: Per-key configurable limits prevent abuse

### 1.4 Target Users

- **External Developers**: Building integrations with Bottleneck-Bots APIs
- **Agency Owners**: Managing programmatic access across teams
- **Automation Engineers**: Connecting CI/CD pipelines and automation tools
- **Technical Administrators**: Controlling API access and monitoring usage
- **Enterprise IT Teams**: Enforcing API governance policies

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Insecure Access Patterns**: Users share session tokens or credentials for API access, creating security vulnerabilities
2. **Lack of Granular Control**: No ability to restrict API access to specific resources or operations
3. **Usage Visibility Gaps**: Limited insight into API consumption patterns and potential abuse
4. **Credential Management Overhead**: No standardized way to rotate or revoke programmatic access
5. **Rate Limit Enforcement**: Inability to set custom rate limits per integration or use case
6. **Audit Trail Gaps**: Insufficient logging of API access for compliance and debugging

### 2.2 User Pain Points

| Pain Point | Impact | User Type |
|------------|--------|-----------|
| "I need to share my login to let our automation tool access the API" | Security risk from shared credentials | Automation Engineers |
| "I can't tell which integration is consuming our API quota" | Budget overruns and unexpected throttling | Agency Owners |
| "A contractor left and I don't know if they still have access" | Security exposure from stale access | Administrators |
| "Our CI/CD pipeline keeps hitting rate limits unexpectedly" | Failed deployments and workflow disruptions | Developers |
| "I need read-only access for monitoring but got full access instead" | Over-privileged integrations | Enterprise IT |
| "I can't figure out which API key is causing the errors" | Extended debugging time | Developers |

### 2.3 Business Impact

| Problem | Impact | Cost |
|---------|--------|------|
| Shared credential breaches | Unauthorized access, data exposure | $100K - $1M per incident |
| Uncontrolled API usage | Infrastructure cost overruns | 30-50% budget overage |
| Stale API key exposure | Compliance violations, security incidents | $50K+ remediation |
| Integration debugging delays | Developer productivity loss | 15+ hours/month |
| Failed automation workflows | Missed deadlines, revenue impact | Variable, up to $25K/incident |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Description | Priority | Target |
|---------|-------------|----------|--------|
| **G1** | Enable secure programmatic access without sharing credentials | P0 | Zero credential sharing |
| **G2** | Provide granular permission scopes for principle of least privilege | P0 | 6+ distinct scopes |
| **G3** | Implement configurable rate limiting per API key | P0 | 3-tier rate limits |
| **G4** | Deliver comprehensive usage tracking and analytics | P1 | 100% request logging |
| **G5** | Support secure key rotation without service interruption | P1 | < 30 second rotation |
| **G6** | Enable instant key revocation for security incidents | P0 | < 1 second revocation |

### 3.2 Success Metrics (KPIs)

#### Security Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API key adoption rate | >= 80% of API users | Keys created / API users |
| Credential sharing incidents | 0 | Security audit findings |
| Mean time to revoke (MTTR) | < 1 minute | Revocation timestamp - incident detection |
| Key rotation compliance | 100% of expired keys | Rotated keys / Expired keys |
| Unauthorized access attempts blocked | 100% | Invalid key rejections |

#### Usage Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Rate limit violations | < 5% of requests | Rate limited requests / Total requests |
| API key utilization rate | > 50% | Keys with activity / Total active keys |
| Average requests per key | Tracked | Total requests / Active keys |
| Key lifecycle duration | Tracked | Revocation date - Creation date |

#### Operational Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Key creation latency | < 100ms | Server-side measurement |
| Validation latency | < 50ms | Authentication middleware timing |
| Usage stats query latency | < 500ms | Query response time |
| Key list retrieval latency | < 200ms | List endpoint timing |

#### Developer Experience Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Time to first API call | < 5 minutes | Key creation to first use |
| Documentation completeness | 100% | Endpoints documented / Total endpoints |
| Support tickets for API access | < 3% of total | API tickets / Total tickets |
| Developer NPS for API experience | >= 40 | Developer surveys |

---

## 4. User Stories

### 4.1 Personas

#### Persona 1: External Developer (Derek)
- **Role:** Third-party developer building integrations with Bottleneck-Bots
- **Goals:** Programmatic access to API, secure credential management, clear documentation
- **Pain Points:** Complex authentication, unclear rate limits, limited debugging tools
- **Technical Level:** High

#### Persona 2: Agency Administrator (Alice)
- **Role:** Technical lead managing team API access
- **Goals:** Control who has API access, monitor usage, enforce security policies
- **Pain Points:** No visibility into key usage, can't revoke access quickly, shared credentials
- **Technical Level:** Medium-High

#### Persona 3: Automation Engineer (Aaron)
- **Role:** DevOps engineer connecting CI/CD pipelines
- **Goals:** Stable API access for automation, appropriate rate limits, minimal scope
- **Pain Points:** Unexpected rate limits, over-privileged keys, no rotation workflow
- **Technical Level:** High

#### Persona 4: Enterprise IT Manager (Irene)
- **Role:** IT governance and compliance officer
- **Goals:** Audit API access, enforce least privilege, maintain compliance
- **Pain Points:** No audit trail, unlimited key creation, no expiration policies
- **Technical Level:** Medium

### 4.2 User Stories

#### API Key Creation

##### US-001: Create API Key
**As an** external developer
**I want to** create a new API key with specific permissions
**So that** I can access the API programmatically without sharing my account credentials

**Acceptance Criteria:**
- API key generated with cryptographically secure random bytes
- Key format: `ghl_` prefix + 32 base64url characters
- Full key displayed ONLY on creation with copy-to-clipboard
- Warning displayed: "Save this key now - you won't be able to see it again!"
- Key stored as SHA-256 hash (never plain text)
- Key prefix (first 12 chars) stored for identification
- Mandatory name field for key identification
- Optional description for documentation

##### US-002: Define Key Scopes
**As an** agency administrator
**I want to** assign specific permission scopes to API keys
**So that** each key has only the access it needs

**Acceptance Criteria:**
- Available scopes:
  - `*` (wildcard - full access)
  - `tasks:read` (view tasks)
  - `tasks:write` (create/update tasks)
  - `tasks:execute` (run task executions)
  - `executions:read` (view execution history)
  - `templates:read` (view workflow templates)
- At least one scope required
- Scope validation on all API requests
- Clear error messages for scope violations

##### US-003: Configure Rate Limits
**As an** automation engineer
**I want to** set custom rate limits for my API keys
**So that** I can balance throughput with system protection

**Acceptance Criteria:**
- Configurable limits:
  - Per minute: 1-1000 requests (default: 100)
  - Per hour: 1-10000 requests (default: 1000)
  - Per day: 1-100000 requests (default: 10000)
- Rate limit headers in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
- 429 Too Many Requests response when exceeded
- Clear retry-after guidance

##### US-004: Set Key Expiration
**As an** enterprise IT manager
**I want to** set expiration dates on API keys
**So that** keys automatically become invalid after a specified period

**Acceptance Criteria:**
- Optional expiration in days (1-365)
- Expiration date calculated from creation time
- Expired keys automatically rejected
- Expiration status visible in key list
- Warning before keys expire (future enhancement)

#### API Key Management

##### US-005: List API Keys
**As an** agency administrator
**I want to** view all my API keys
**So that** I can audit and manage programmatic access

**Acceptance Criteria:**
- List all keys for authenticated user
- Display:
  - Key name
  - Masked key (`ghl_abc123...`)
  - Description
  - Scopes
  - Active/Inactive status
  - Last used timestamp
  - Total requests
  - Rate limits
  - Expiration date (if set)
  - Creation date
- Keys sorted by creation date (newest first)
- Expired status indicator for expired keys
- Full key value NEVER displayed (only prefix)

##### US-006: Update API Key
**As a** developer
**I want to** update my API key settings
**So that** I can adjust permissions and limits without creating a new key

**Acceptance Criteria:**
- Updatable fields:
  - Name
  - Description
  - Scopes
  - Active status
  - Rate limits (minute/hour/day)
- Key value and hash cannot be changed
- Ownership verification before update
- Audit log entry for changes
- Updated timestamp recorded

##### US-007: Revoke API Key
**As an** administrator responding to a security incident
**I want to** immediately revoke an API key
**So that** I can prevent unauthorized access

**Acceptance Criteria:**
- Soft delete (isActive = false, revokedAt timestamp)
- Key rejected immediately on next request
- Revocation is permanent (cannot be undone)
- Audit log entry for revocation
- Key remains visible in list (marked as revoked)
- All in-flight requests allowed to complete

#### Usage Tracking & Analytics

##### US-008: View Usage Statistics
**As an** agency administrator
**I want to** view usage statistics for my API keys
**So that** I can monitor consumption and identify issues

**Acceptance Criteria:**
- Statistics per key:
  - Total requests in period
  - Successful requests count
  - Error requests count
  - Success rate percentage
  - Last used timestamp
  - Per-endpoint breakdown
- Configurable time range (1-90 days)
- Error breakdown by status code
- Endpoint popularity ranking

##### US-009: Track Request Logs
**As a** developer debugging an issue
**I want to** view detailed request logs for my API key
**So that** I can identify what went wrong

**Acceptance Criteria:**
- Log entry contains:
  - Timestamp
  - HTTP method
  - Endpoint path
  - Status code
  - Response time (ms)
  - IP address
  - User agent
  - Request body (sanitized)
- Paginated log retrieval
- Filter by endpoint, status code, date range
- Performance: < 500ms for log queries

#### API Key Rotation

##### US-010: Rotate API Key
**As a** security-conscious administrator
**I want to** rotate an API key without service interruption
**So that** I can maintain security hygiene

**Acceptance Criteria:**
- Create new key with same settings (scopes, limits, name + " (rotated)")
- Old key remains active for grace period (configurable)
- New key returned immediately for configuration
- Old key automatically revoked after grace period
- Audit log entries for both creation and revocation

---

## 5. Functional Requirements

### 5.1 Key Generation

#### FR-001: Cryptographic Key Generation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Generate API keys using `crypto.randomBytes(24)` for 32 base64url characters | P0 |
| FR-001.2 | Prefix all keys with `ghl_` for identification | P0 |
| FR-001.3 | Hash keys with SHA-256 before database storage | P0 |
| FR-001.4 | Store first 12 characters as `keyPrefix` for display | P0 |
| FR-001.5 | Return full key ONLY during creation response | P0 |
| FR-001.6 | Never log full API key values | P0 |

#### FR-002: Key Limits

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Enforce maximum 5 active API keys per user (Free tier) | P0 |
| FR-002.2 | Plan-based key limits: Free=5, Pro=20, Enterprise=unlimited | P1 |
| FR-002.3 | Count only active (non-revoked) keys against limit | P0 |
| FR-002.4 | Clear error message when limit reached | P0 |

### 5.2 Permission Scopes

#### FR-003: Scope Definition

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Support wildcard scope (`*`) for full access | P0 |
| FR-003.2 | Support `tasks:read` scope for viewing tasks | P0 |
| FR-003.3 | Support `tasks:write` scope for creating/updating tasks | P0 |
| FR-003.4 | Support `tasks:execute` scope for running executions | P0 |
| FR-003.5 | Support `executions:read` scope for viewing execution history | P0 |
| FR-003.6 | Support `templates:read` scope for viewing templates | P0 |
| FR-003.7 | Require at least one scope per key | P0 |
| FR-003.8 | Store scopes as JSON array in database | P0 |

#### FR-004: Scope Enforcement

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Validate scope on every API request | P0 |
| FR-004.2 | Return 403 Forbidden for insufficient scope | P0 |
| FR-004.3 | Include required scope in error message | P0 |
| FR-004.4 | Support scope hierarchy (e.g., `tasks:write` implies `tasks:read`) | P2 |

### 5.3 Rate Limiting

#### FR-005: Rate Limit Configuration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Support per-minute rate limit (1-1000, default 100) | P0 |
| FR-005.2 | Support per-hour rate limit (1-10000, default 1000) | P0 |
| FR-005.3 | Support per-day rate limit (1-100000, default 10000) | P0 |
| FR-005.4 | Store rate limits in database per key | P0 |
| FR-005.5 | Allow rate limit updates without key regeneration | P0 |

#### FR-006: Rate Limit Enforcement

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Track request counts in Redis/memory per time window | P0 |
| FR-006.2 | Return 429 Too Many Requests when limit exceeded | P0 |
| FR-006.3 | Include `Retry-After` header in 429 responses | P0 |
| FR-006.4 | Include rate limit headers in all API responses | P0 |
| FR-006.5 | Use sliding window algorithm for accurate counting | P1 |

### 5.4 Usage Tracking

#### FR-007: Request Logging

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Log all API requests to `api_request_logs` table | P0 |
| FR-007.2 | Capture: method, endpoint, status code, response time | P0 |
| FR-007.3 | Capture: IP address, user agent, referer | P1 |
| FR-007.4 | Sanitize request body before logging (remove sensitive data) | P0 |
| FR-007.5 | Associate logs with API key ID and user ID | P0 |
| FR-007.6 | Update `lastUsedAt` timestamp on key usage | P0 |
| FR-007.7 | Increment `totalRequests` counter on key usage | P0 |

#### FR-008: Usage Analytics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Aggregate statistics by time period (day, week, month) | P1 |
| FR-008.2 | Calculate success/failure rates | P0 |
| FR-008.3 | Provide per-endpoint breakdown | P1 |
| FR-008.4 | Support configurable time range (1-90 days) | P0 |
| FR-008.5 | Return statistics within 500ms | P1 |

### 5.5 Key Lifecycle

#### FR-009: Key Expiration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Support optional expiration date (1-365 days) | P0 |
| FR-009.2 | Store expiration as timestamp in database | P0 |
| FR-009.3 | Reject expired keys on authentication | P0 |
| FR-009.4 | Include `isExpired` flag in key list response | P0 |
| FR-009.5 | Support keys without expiration (null expiresAt) | P0 |

#### FR-010: Key Revocation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Implement soft delete (isActive=false, revokedAt timestamp) | P0 |
| FR-010.2 | Reject revoked keys immediately on authentication | P0 |
| FR-010.3 | Verify ownership before revocation | P0 |
| FR-010.4 | Retain revoked keys in database for audit | P0 |
| FR-010.5 | Revocation is permanent and irreversible | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Security Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | API keys must be hashed with SHA-256 | 100% compliance |
| NFR-002 | Full keys must never be stored or logged | 0 exposure incidents |
| NFR-003 | Keys must be generated with cryptographically secure random | 256-bit entropy |
| NFR-004 | Authentication must fail securely (no information leakage) | Generic error messages |
| NFR-005 | All endpoints must require authentication | 100% protected |
| NFR-006 | User data isolation must be enforced | 0 cross-tenant access |

### 6.2 Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-007 | Key validation latency | < 50ms P95 |
| NFR-008 | Key creation latency | < 100ms P95 |
| NFR-009 | Key list retrieval latency | < 200ms P95 |
| NFR-010 | Usage statistics query latency | < 500ms P95 |
| NFR-011 | Rate limit check latency | < 10ms P95 |
| NFR-012 | System must handle 1000 concurrent API validations | 100% success rate |

### 6.3 Reliability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-013 | API key authentication availability | 99.99% uptime |
| NFR-014 | Rate limit enforcement accuracy | 100% within 1% tolerance |
| NFR-015 | Request logging reliability | 100% of requests logged |
| NFR-016 | Data consistency after key operations | 100% ACID compliance |

### 6.4 Scalability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-017 | Support up to 100,000 API keys per instance | Linear scaling |
| NFR-018 | Support up to 10,000 requests/second per instance | With horizontal scaling |
| NFR-019 | Request log retention | 90 days minimum |
| NFR-020 | Request log storage efficiency | < 1KB per log entry |

### 6.5 Compliance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-021 | SOC 2 Type II audit readiness | Pass audit |
| NFR-022 | GDPR data handling compliance | 100% compliance |
| NFR-023 | Audit trail completeness | All operations logged |
| NFR-024 | Data retention policy adherence | Per policy |

---

## 7. Technical Architecture

### 7.1 System Architecture

```
+------------------+     +------------------+     +------------------+
|   Client App     |     |   API Gateway    |     |   Rate Limiter   |
|   (Web/CLI)      |---->|   (Express)      |---->|   (Redis)        |
+------------------+     +------------------+     +------------------+
                                  |                        |
                                  v                        v
                         +------------------+     +------------------+
                         |   Auth Middleware|     |   Request Logger |
                         |   (apiKeys.ts)   |---->|   (Middleware)   |
                         +------------------+     +------------------+
                                  |                        |
                                  v                        v
                         +------------------+     +------------------+
                         |   PostgreSQL     |     |   Analytics      |
                         |   (api_keys)     |     |   (api_request_  |
                         |                  |     |    logs)         |
                         +------------------+     +------------------+
```

### 7.2 Data Models

#### API Keys Table (`api_keys`)

```typescript
interface ApiKey {
  id: number;                    // Primary key
  userId: number;                // Foreign key to users
  name: string;                  // User-defined name (max 100 chars)
  description: string | null;    // Optional description
  keyHash: string;               // SHA-256 hash of full key
  keyPrefix: string;             // First 12 characters for display
  scopes: string[];              // Permission scopes (JSON array)
  isActive: boolean;             // Active status (default: true)
  rateLimitPerMinute: number;    // Requests per minute (default: 100)
  rateLimitPerHour: number;      // Requests per hour (default: 1000)
  rateLimitPerDay: number;       // Requests per day (default: 10000)
  lastUsedAt: Date | null;       // Last usage timestamp
  totalRequests: number;         // Total request count (default: 0)
  expiresAt: Date | null;        // Optional expiration
  revokedAt: Date | null;        // Revocation timestamp
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

#### API Request Logs Table (`api_request_logs`)

```typescript
interface ApiRequestLog {
  id: number;                    // Primary key
  apiKeyId: number;              // Foreign key to api_keys
  userId: number;                // Foreign key to users
  method: string;                // HTTP method (GET, POST, etc.)
  endpoint: string;              // Request endpoint path
  statusCode: number;            // HTTP response status code
  responseTime: number;          // Response time in milliseconds
  ipAddress: string | null;      // Client IP (IPv4 or IPv6)
  userAgent: string | null;      // Client user agent
  referer: string | null;        // Request referer
  requestBody: object | null;    // Sanitized request body (JSON)
  createdAt: Date;               // Log timestamp
}
```

### 7.3 API Endpoints

#### TRPC Procedures

| Procedure | Type | Description |
|-----------|------|-------------|
| `apiKeys.list` | Query | List all API keys for authenticated user |
| `apiKeys.create` | Mutation | Create new API key with scopes and limits |
| `apiKeys.update` | Mutation | Update key name, description, scopes, or limits |
| `apiKeys.revoke` | Mutation | Revoke (soft delete) an API key |
| `apiKeys.getUsageStats` | Query | Get usage statistics for a specific key |

### 7.4 Authentication Flow

```
1. Client sends request with API key in header:
   Authorization: Bearer ghl_xxxxxxxxxxxxxxxxxxxx

2. API Gateway extracts key from Authorization header

3. Auth Middleware:
   a. Hash the provided key with SHA-256
   b. Query database for matching keyHash
   c. Verify key is active (!isActive = reject)
   d. Verify key not expired (expiresAt < now = reject)
   e. Verify key not revoked (revokedAt != null = reject)
   f. Load scopes and rate limits

4. Rate Limiter:
   a. Check Redis for request counts
   b. Enforce minute/hour/day limits
   c. Return 429 if exceeded

5. Request Logger:
   a. Log request details asynchronously
   b. Update lastUsedAt and totalRequests

6. Route Handler:
   a. Verify required scope
   b. Process request
   c. Return response
```

### 7.5 Key Generation Algorithm

```typescript
function generateApiKey(): string {
  // Generate 24 random bytes (192 bits of entropy)
  const randomBytes = crypto.randomBytes(24);

  // Convert to base64url (32 characters)
  const keyValue = randomBytes.toString("base64url");

  // Prefix with 'ghl_' for identification
  return `ghl_${keyValue}`;
}

function hashApiKey(apiKey: string): string {
  // SHA-256 hash for storage
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

function getKeyPrefix(apiKey: string): string {
  // First 12 characters for display
  return apiKey.substring(0, 12);
}
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Purpose | Location |
|------------|---------|----------|
| TRPC Router | API endpoint framework | `server/_core/trpc.ts` |
| Drizzle ORM | Database operations | `server/db/index.ts` |
| Auth Context | User authentication | `server/_core/trpc.ts` |
| Database Schema | Table definitions | `drizzle/schema.ts` |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `crypto` | Node.js built-in | Secure key generation and hashing |
| `zod` | ^3.22.4 | Input validation schemas |
| `@trpc/server` | ^10.45.0 | TRPC server framework |
| `drizzle-orm` | ^0.29.0 | Database ORM |
| `pg` | ^8.11.0 | PostgreSQL driver |

### 8.3 Infrastructure Dependencies

| Component | Purpose | Requirement |
|-----------|---------|-------------|
| PostgreSQL | Data storage | v14+ |
| Redis (optional) | Rate limit caching | v6+ |
| Node.js | Runtime environment | v18+ |

### 8.4 Related Features

| Feature | Relationship | PRD Reference |
|---------|--------------|---------------|
| Settings & Configuration | API keys for third-party services | PRD-023 |
| Security & Compliance | Authentication framework | PRD-012 |
| Audit Logging | Request tracking | PRD-012 |
| Rate Limiting Middleware | Enforcement layer | PRD-012 |

---

## 9. Out of Scope

### 9.1 Excluded from v1.0

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| **API Key Rotation Grace Period** | Complexity for MVP | v1.1 - Allow overlapping keys during rotation |
| **IP Allowlisting per Key** | Enterprise feature | v2.0 - Restrict key usage to specific IPs |
| **Webhook for Key Events** | Notification complexity | v1.2 - Notify on key creation/revocation |
| **Key Usage Alerts** | Monitoring infrastructure needed | v1.2 - Alert on unusual usage patterns |
| **Team-Shared Keys** | Multi-user complexity | v2.0 - Keys shared across team members |
| **OAuth Scopes Mapping** | OAuth integration scope | Separate feature |
| **GraphQL Support** | REST-first approach | v2.0 - GraphQL API key support |
| **Key Import/Export** | Security considerations | v2.0 - Migration tooling |
| **Programmatic Key Creation** | API-for-API complexity | v1.2 - Create keys via API |
| **Custom Key Prefixes** | Branding complexity | v2.0 - White-label support |

### 9.2 Explicit Non-Goals

- API keys for third-party service credentials (handled by Settings & Configuration)
- User session management (handled by Authentication system)
- Service-to-service authentication (handled by internal auth)
- API versioning (handled by API Gateway)
- API documentation generation (handled by OpenAPI spec)

---

## 10. Risks & Mitigations

### 10.1 Security Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API key exposure in logs | Medium | High | Never log full keys; log only prefix; audit log sanitization |
| Brute force key guessing | Low | High | 256-bit entropy; rate limit auth attempts; account lockout |
| Key theft from database | Low | Critical | SHA-256 hashing; encryption at rest; access controls |
| Scope escalation attack | Low | High | Server-side scope validation; no client trust |
| Rate limit bypass | Medium | Medium | Multiple enforcement points; Redis + DB fallback |

### 10.2 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rate limit cache failure | Medium | Medium | Fallback to in-memory; graceful degradation |
| Database performance degradation | Low | High | Indexing; query optimization; connection pooling |
| Log storage overflow | Medium | Low | Log rotation; retention policies; archival |
| Key validation latency | Low | Medium | Caching; connection pooling; prepared statements |

### 10.3 Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User loses only API key | High | Medium | Clear warning on creation; no recovery (security) |
| Key limit confusion | Medium | Low | Clear error messages; plan upgrade path |
| Revocation propagation delay | Low | Medium | Immediate cache invalidation; short cache TTL |
| Usage stats inaccuracy | Low | Low | Async logging with retry; eventual consistency accepted |

### 10.4 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Competitor feature parity | Medium | Medium | Focus on DX; comprehensive scopes; clear docs |
| Enterprise adoption blockers | Medium | High | Audit logging; compliance features; SOC 2 readiness |
| Developer adoption friction | Medium | Medium | CLI tooling; SDKs; quick-start guides |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Key Management (Week 1-2)

| Milestone | Deliverable | Owner | Due Date |
|-----------|-------------|-------|----------|
| M1.1 | Database schema implementation | Backend | Day 3 |
| M1.2 | Key generation and hashing | Backend | Day 5 |
| M1.3 | CRUD TRPC procedures | Backend | Day 8 |
| M1.4 | Authentication middleware | Backend | Day 10 |
| M1.5 | Unit tests (80% coverage) | QA | Day 12 |
| M1.6 | API documentation | Tech Writer | Day 14 |

### 11.2 Phase 2: Permission & Rate Limiting (Week 3-4)

| Milestone | Deliverable | Owner | Due Date |
|-----------|-------------|-------|----------|
| M2.1 | Scope definition and validation | Backend | Day 17 |
| M2.2 | Rate limit storage and tracking | Backend | Day 19 |
| M2.3 | Rate limit middleware | Backend | Day 21 |
| M2.4 | Rate limit headers | Backend | Day 23 |
| M2.5 | Integration tests | QA | Day 26 |
| M2.6 | Load testing | QA | Day 28 |

### 11.3 Phase 3: Usage Tracking (Week 5-6)

| Milestone | Deliverable | Owner | Due Date |
|-----------|-------------|-------|----------|
| M3.1 | Request logging middleware | Backend | Day 31 |
| M3.2 | Usage statistics aggregation | Backend | Day 33 |
| M3.3 | Analytics queries | Backend | Day 35 |
| M3.4 | Log retention and cleanup | Backend | Day 38 |
| M3.5 | Performance optimization | Backend | Day 40 |
| M3.6 | E2E tests | QA | Day 42 |

### 11.4 Phase 4: UI & Polish (Week 7-8)

| Milestone | Deliverable | Owner | Due Date |
|-----------|-------------|-------|----------|
| M4.1 | API key management UI | Frontend | Day 45 |
| M4.2 | Usage dashboard | Frontend | Day 48 |
| M4.3 | Key creation flow | Frontend | Day 50 |
| M4.4 | Error handling and messaging | Full Stack | Day 52 |
| M4.5 | Security audit | Security | Day 54 |
| M4.6 | Production deployment | DevOps | Day 56 |

### 11.5 Timeline Summary

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Core Key Management | 2 weeks | Week 1 | Week 2 |
| Phase 2: Permission & Rate Limiting | 2 weeks | Week 3 | Week 4 |
| Phase 3: Usage Tracking | 2 weeks | Week 5 | Week 6 |
| Phase 4: UI & Polish | 2 weeks | Week 7 | Week 8 |
| **Total** | **8 weeks** | | |

---

## 12. Acceptance Criteria

### 12.1 Feature Acceptance Criteria

#### AC-001: API Key Creation
- [ ] User can create API key with name, scopes, and optional description
- [ ] Full key displayed only once on creation with copy functionality
- [ ] Key format is `ghl_` + 32 base64url characters
- [ ] Key stored as SHA-256 hash in database
- [ ] Prefix (first 12 chars) stored for display
- [ ] At least one scope required
- [ ] Key limit enforced per user (5 for free tier)
- [ ] Clear warning about key visibility

#### AC-002: Permission Scopes
- [ ] Six scopes available: `*`, `tasks:read`, `tasks:write`, `tasks:execute`, `executions:read`, `templates:read`
- [ ] Scope validated on every API request
- [ ] 403 Forbidden returned for insufficient scope
- [ ] Error message includes required scope
- [ ] Wildcard scope grants all permissions

#### AC-003: Rate Limiting
- [ ] Configurable per-minute limit (1-1000)
- [ ] Configurable per-hour limit (1-10000)
- [ ] Configurable per-day limit (1-100000)
- [ ] Rate limit headers in all responses
- [ ] 429 response when limit exceeded
- [ ] Retry-After header in 429 responses
- [ ] Default limits applied when not specified

#### AC-004: Key Expiration
- [ ] Optional expiration date (1-365 days)
- [ ] Expired keys rejected on authentication
- [ ] Expiration status visible in key list
- [ ] Keys without expiration work indefinitely

#### AC-005: Key Revocation
- [ ] Key revocation is immediate
- [ ] Revoked keys rejected on authentication
- [ ] Revocation is permanent (cannot be undone)
- [ ] Revoked keys visible in list with revoked status
- [ ] Revocation timestamp recorded

#### AC-006: Usage Tracking
- [ ] All API requests logged
- [ ] lastUsedAt updated on key usage
- [ ] totalRequests incremented on usage
- [ ] Usage statistics retrievable by key
- [ ] Statistics include success/error rates
- [ ] Statistics include per-endpoint breakdown

### 12.2 Non-Functional Acceptance Criteria

#### AC-007: Performance
- [ ] Key validation < 50ms P95
- [ ] Key creation < 100ms P95
- [ ] Key list retrieval < 200ms P95
- [ ] Usage statistics < 500ms P95
- [ ] Rate limit check < 10ms P95

#### AC-008: Security
- [ ] Full keys never logged
- [ ] Full keys never stored in plaintext
- [ ] All endpoints require authentication
- [ ] User data isolation enforced
- [ ] Generic error messages (no information leakage)

#### AC-009: Reliability
- [ ] 99.99% authentication availability
- [ ] 100% request logging
- [ ] Rate limit accuracy within 1%
- [ ] ACID compliance for key operations

### 12.3 Documentation Acceptance Criteria

- [ ] API documentation complete for all endpoints
- [ ] Error codes and messages documented
- [ ] Rate limit behavior documented
- [ ] Scope permissions matrix documented
- [ ] Quick-start guide for developers
- [ ] Security best practices guide

### 12.4 Testing Acceptance Criteria

- [ ] Unit test coverage >= 80%
- [ ] Integration tests for all CRUD operations
- [ ] Load tests for 1000 concurrent validations
- [ ] Security tests for authentication bypass attempts
- [ ] E2E tests for complete user flows

---

## Appendix A: API Reference

### A.1 Create API Key

**Procedure:** `apiKeys.create`

**Input:**
```typescript
{
  name: string;                    // Required, 1-100 chars
  description?: string;            // Optional
  scopes: Array<                   // Required, min 1
    | "*"
    | "tasks:read"
    | "tasks:write"
    | "tasks:execute"
    | "executions:read"
    | "templates:read"
  >;
  expiresInDays?: number;          // Optional, 1-365
  rateLimitPerMinute?: number;     // Optional, 1-1000, default 100
  rateLimitPerHour?: number;       // Optional, 1-10000, default 1000
  rateLimitPerDay?: number;        // Optional, 1-100000, default 10000
}
```

**Output:**
```typescript
{
  success: boolean;
  message: string;
  key: {
    id: number;
    name: string;
    apiKey: string;              // Full key - ONLY shown here
    keyPrefix: string;
    scopes: string[];
    expiresAt: Date | null;
  };
  warning: string;               // "Save this key now..."
}
```

### A.2 List API Keys

**Procedure:** `apiKeys.list`

**Input:** None (uses authenticated user)

**Output:**
```typescript
{
  keys: Array<{
    id: number;
    name: string;
    keyPrefix: string;
    maskedKey: string;           // "ghl_abc123..."
    description: string | null;
    scopes: string[];
    isActive: boolean;
    isExpired: boolean;
    lastUsedAt: Date | null;
    totalRequests: number;
    rateLimitPerMinute: number;
    rateLimitPerHour: number;
    rateLimitPerDay: number;
    expiresAt: Date | null;
    createdAt: Date;
  }>;
}
```

### A.3 Update API Key

**Procedure:** `apiKeys.update`

**Input:**
```typescript
{
  id: number;                      // Required
  name?: string;                   // Optional, 1-100 chars
  description?: string;            // Optional
  scopes?: string[];               // Optional, min 1
  isActive?: boolean;              // Optional
  rateLimitPerMinute?: number;     // Optional, 1-1000
  rateLimitPerHour?: number;       // Optional, 1-10000
  rateLimitPerDay?: number;        // Optional, 1-100000
}
```

**Output:**
```typescript
{
  success: boolean;
  message: string;
  key: {
    id: number;
    name: string;
    keyPrefix: string;
    scopes: string[];
    isActive: boolean;
  };
}
```

### A.4 Revoke API Key

**Procedure:** `apiKeys.revoke`

**Input:**
```typescript
{
  id: number;                      // Required
}
```

**Output:**
```typescript
{
  success: boolean;
  message: string;
}
```

### A.5 Get Usage Statistics

**Procedure:** `apiKeys.getUsageStats`

**Input:**
```typescript
{
  id: number;                      // Required
  days?: number;                   // Optional, 1-90, default 30
}
```

**Output:**
```typescript
{
  stats: {
    totalRequests: number;
    successRequests: number;
    errorRequests: number;
    successRate: number;           // Percentage 0-100
    lastUsedAt: Date | null;
    endpoints: Array<{
      endpoint: string;
      count: number;
      errors: number;
    }>;
  };
}
```

---

## Appendix B: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `API_KEY_LIMIT_REACHED` | 403 | Maximum API key limit reached for plan |
| `API_KEY_NOT_FOUND` | 404 | API key not found or not owned by user |
| `API_KEY_EXPIRED` | 401 | API key has expired |
| `API_KEY_REVOKED` | 401 | API key has been revoked |
| `INVALID_API_KEY` | 401 | API key format invalid or not found |
| `INSUFFICIENT_SCOPE` | 403 | API key lacks required scope |
| `RATE_LIMIT_EXCEEDED` | 429 | Request rate limit exceeded |
| `INVALID_SCOPE` | 400 | Invalid scope value provided |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## Appendix C: Scope Permissions Matrix

| Scope | Tasks Read | Tasks Write | Tasks Execute | Executions Read | Templates Read |
|-------|------------|-------------|---------------|-----------------|----------------|
| `*` | Yes | Yes | Yes | Yes | Yes |
| `tasks:read` | Yes | No | No | No | No |
| `tasks:write` | No | Yes | No | No | No |
| `tasks:execute` | No | No | Yes | No | No |
| `executions:read` | No | No | No | Yes | No |
| `templates:read` | No | No | No | No | Yes |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 11, 2026 | Development Team | Initial draft |
