# PRD-012: Security & Compliance

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/services/security/`, `server/auth/`, `server/api/rest/middleware/`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories & Personas](#4-user-stories--personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [API Specifications](#8-api-specifications)
9. [Data Models](#9-data-models)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Dependencies & Integrations](#11-dependencies--integrations)
12. [Release Criteria](#12-release-criteria)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Future Considerations](#14-future-considerations)

---

## 1. Executive Summary

### 1.1 Overview

The Security & Compliance feature provides a comprehensive security framework for Bottleneck-Bots, implementing enterprise-grade authentication, authorization, encryption, and audit capabilities. This feature ensures that the platform meets industry security standards while enabling users to maintain full control over their data and automated workflows.

### 1.2 Key Components

| Component | Description | Location |
|-----------|-------------|----------|
| **JWT Authentication** | Secure session management with email/password login | `server/auth/email-password.ts` |
| **1Password Connect Integration** | Encrypted credential storage via vault service | `server/services/security/credentialVault.service.ts` |
| **OAuth Support** | Third-party authentication (Google, Microsoft, Facebook, LinkedIn) | `server/_core/oauth.ts`, `server/api/routes/oauth.ts` |
| **Permission Validation** | Function-level access control with API key validation | `server/services/apiKeyValidation.service.ts` |
| **Audit Trail** | Comprehensive compliance logging | Documented in `AUDIT_LOG_PRODUCTION_READINESS_REPORT.md` |
| **Data Encryption** | AES-256-GCM encryption at rest and TLS in transit | `server/services/security/credentialVault.service.ts` |
| **Rate Limiting** | Per-user and per-IP request throttling | `server/api/rest/middleware/rateLimitMiddleware.ts` |
| **Action Approval System** | Human-in-the-loop validation for high-risk actions | `server/services/actionApproval.service.ts` |
| **Execution Control** | Pause/resume/cancel capabilities with resource quotas | `server/services/security/executionControl.service.ts` |

### 1.3 Security Posture

Based on the comprehensive security audit (SECURITY_FINAL_AUDIT.md):

- **Overall Security Score:** 7.5/10 (GOOD) - Post-remediation target: 9.0/10
- **Critical Vulnerabilities:** 0
- **High Priority Issues:** 2 (identified and remediation planned)
- **Medium Priority Issues:** 4
- **Low Priority Issues:** 3
- **Positive Security Controls:** 15+

### 1.4 Target Users

- Enterprise Security Officers
- Compliance Managers
- System Administrators
- Agency Owners with security requirements
- IT Operations Teams

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Credential Exposure Risk**: API keys and sensitive credentials require secure storage and access control to prevent unauthorized access
2. **Compliance Requirements**: Organizations need audit trails and compliance logging to meet regulatory requirements (SOC 2, GDPR, HIPAA)
3. **Unauthorized Access Prevention**: Multi-tenant platforms require strict data isolation and access controls
4. **High-Risk Action Governance**: Automated agents performing sensitive operations need human oversight
5. **Attack Surface Management**: API endpoints require protection against brute force, DDoS, and injection attacks
6. **Session Management**: User sessions need secure handling with proper expiration and token management

### 2.2 User Pain Points

| Pain Point | Impact | User Type |
|------------|--------|-----------|
| "We need to demonstrate compliance for our security audits" | Audit failures, lost contracts | Enterprise Customers |
| "Our API keys get exposed when developers share configs" | Security breaches | Development Teams |
| "We can't track who did what in the system" | Accountability gaps | Compliance Officers |
| "Automated bots sometimes take actions we didn't authorize" | Financial/reputational risk | Agency Owners |
| "Our endpoints get hammered by bots and scrapers" | Service degradation | Operations Teams |

### 2.3 Business Impact

| Problem | Impact | Cost |
|---------|--------|------|
| Data breach from credential exposure | Legal liability, customer churn | $150K - $4M per incident |
| Failed compliance audit | Lost enterprise contracts | 30% revenue at risk |
| Unauthorized automated actions | Financial losses, legal issues | Variable, potentially severe |
| DDoS/abuse attacks | Service downtime, infrastructure costs | $10K+ per incident |
| Manual security review processes | Delayed deployments | 20+ hours/month |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Description | Priority | Target |
|---------|-------------|----------|--------|
| **G1** | Implement zero-trust authentication model | P0 | 100% endpoints protected |
| **G2** | Achieve SOC 2 Type II compliance readiness | P0 | Pass audit requirements |
| **G3** | Prevent unauthorized data access | P0 | Zero breaches |
| **G4** | Enable comprehensive audit logging | P0 | 100% action traceability |
| **G5** | Provide human-in-the-loop controls for high-risk actions | P1 | 100% high-risk actions gated |
| **G6** | Implement defense-in-depth against attacks | P1 | Block 99.9% of attacks |

### 3.2 Success Metrics (KPIs)

#### Security Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Authentication failure rate | < 0.1% (legitimate users) | Failed login attempts / Total attempts |
| Unauthorized access attempts blocked | 100% | Security event logs |
| Mean time to detect (MTTD) security events | < 5 minutes | Alert response time |
| Mean time to respond (MTTR) to incidents | < 1 hour | Incident resolution time |
| Credential exposure incidents | 0 | Security audit findings |

#### Compliance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Audit log completeness | 100% | Actions logged / Total actions |
| Audit log retention | 90 days minimum | Storage verification |
| Compliance report accuracy | 100% | Audit verification |
| Data encryption coverage | 100% sensitive data | Encryption audit |

#### Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Authentication latency (P95) | < 200ms | Server-side measurement |
| Rate limit enforcement accuracy | 100% | Test validation |
| Approval request response time | < 5 minutes | User action tracking |
| Session validation overhead | < 50ms | Performance monitoring |

#### Operational Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| False positive rate (security blocks) | < 1% | User complaint ratio |
| High-risk action approval rate | > 90% | Approval decision tracking |
| API key rotation compliance | 100% of expired keys rotated | Key management audit |
| Security patch deployment time | < 24 hours critical, < 7 days high | Deployment tracking |

---

## 4. User Stories & Personas

### 4.1 Personas

#### Persona 1: Security Officer (Sarah)
- **Role:** Chief Information Security Officer at enterprise client
- **Goals:** Ensure platform meets security requirements, demonstrate compliance
- **Pain Points:** Lack of visibility, insufficient audit trails, unclear security controls
- **Technical Level:** High

#### Persona 2: Agency Administrator (Alex)
- **Role:** Technical lead at digital marketing agency
- **Goals:** Manage team access, protect client credentials, oversee automated actions
- **Pain Points:** Credential sharing risks, lack of action oversight, manual approval processes
- **Technical Level:** Medium-High

#### Persona 3: Developer (David)
- **Role:** Full-stack developer integrating with Bottleneck-Bots API
- **Goals:** Secure API integration, proper authentication, rate limit awareness
- **Pain Points:** Complex authentication flows, unclear error messages, rate limit surprises
- **Technical Level:** High

#### Persona 4: Compliance Manager (Carol)
- **Role:** Compliance officer ensuring regulatory adherence
- **Goals:** Generate compliance reports, maintain audit trails, enforce policies
- **Pain Points:** Incomplete logs, difficult reporting, policy enforcement gaps
- **Technical Level:** Low-Medium

### 4.2 User Stories

#### Authentication & Session Management

##### US-001: Secure Email/Password Login
**As a** registered user
**I want to** log in securely with my email and password
**So that** only I can access my account and data

**Acceptance Criteria:**
- Password hashed with bcrypt (cost factor 10+)
- Login attempts rate-limited (5 attempts per hour)
- Account lockout after excessive failures
- Session tokens issued as HttpOnly cookies
- Session expires after inactivity (configurable)

##### US-002: OAuth Single Sign-On
**As a** user with Google/Microsoft account
**I want to** sign in using my existing OAuth provider
**So that** I don't need to manage another password

**Acceptance Criteria:**
- Support Google, Microsoft, Facebook, LinkedIn OAuth
- PKCE (RFC 7636) implementation for enhanced security
- State parameter validation for CSRF protection
- OAuth tokens encrypted before storage
- Automatic session creation on successful OAuth

##### US-003: Session Management
**As a** security-conscious user
**I want to** view and revoke my active sessions
**So that** I can maintain control over my account access

**Acceptance Criteria:**
- List all active sessions with device/location info
- One-click session revocation
- Automatic session cleanup for expired tokens
- Email notification on new session from unrecognized device

#### Credential Management

##### US-004: Secure API Key Storage
**As an** agency administrator
**I want to** store third-party API keys securely
**So that** my team can use integrations without exposing credentials

**Acceptance Criteria:**
- API keys encrypted with AES-256-GCM
- Access control per credential
- Usage logging for audit trail
- Automatic validation of API keys on storage
- Credential expiration warnings

##### US-005: API Key Validation
**As a** user configuring integrations
**I want** the system to validate my API keys on entry
**So that** I know immediately if they're working

**Acceptance Criteria:**
- Real-time validation against provider APIs
- Support for OpenAI, Anthropic, Stripe, Vapi, Apify, Browserbase, SendGrid, Twilio, Google, GoHighLevel
- Clear error messages for invalid keys
- Rate limit awareness in validation responses

##### US-006: Credential Rotation
**As a** security administrator
**I want to** rotate credentials without service interruption
**So that** I can maintain security without downtime

**Acceptance Criteria:**
- Update credentials atomically
- Audit log for rotation events
- Old credential invalidation
- Automatic re-validation after rotation

#### Authorization & Access Control

##### US-007: Role-Based Access Control
**As an** administrator
**I want to** assign roles to team members
**So that** they only have access to appropriate features

**Acceptance Criteria:**
- Three-tier authorization: public, protected, admin
- Role assignment by admin users only
- Permission checking on all protected endpoints
- Clear access denied messages with guidance

##### US-008: API Key Scope Management
**As a** developer
**I want to** create API keys with specific scopes
**So that** each integration has minimal necessary permissions

**Acceptance Criteria:**
- Scope-based permission system with wildcard support
- API key prefix validation (must start with "ghl_")
- SHA-256 hashed key storage
- Last used tracking for security monitoring
- Key revocation capability

##### US-009: User Data Isolation
**As a** multi-tenant platform user
**I want** my data completely isolated from other users
**So that** there's no risk of data leakage

**Acceptance Criteria:**
- User ID filtering on all data queries
- Ownership verification on updates/deletes
- No cross-tenant data access possible
- Audit logging of access attempts

#### Audit & Compliance

##### US-010: Comprehensive Audit Logging
**As a** compliance officer
**I want** all security-relevant actions logged
**So that** I can demonstrate compliance and investigate incidents

**Acceptance Criteria:**
- Log all authentication events (success/failure)
- Log all data access and modifications
- Log all administrative actions
- Tamper-evident log storage
- 90-day minimum retention

##### US-011: Audit Log Viewing
**As an** administrator
**I want to** view and filter audit logs
**So that** I can investigate security events

**Acceptance Criteria:**
- Paginated log viewing with performance < 500ms
- Filtering by event type, user, date range
- Export capability (CSV, JSON)
- Expandable row details for full context

##### US-012: Compliance Reporting
**As a** compliance manager
**I want to** generate compliance reports
**So that** I can demonstrate adherence to security policies

**Acceptance Criteria:**
- Summary statistics for key metrics
- Time-range selection for reports
- Exportable report format
- Evidence of control effectiveness

#### Rate Limiting & Protection

##### US-013: API Rate Limiting
**As a** platform operator
**I want** API requests rate limited
**So that** the system is protected from abuse

**Acceptance Criteria:**
- Global rate limit: 60 requests/minute per IP
- Per-API-key limits: configurable per minute/hour/day
- Strict rate limit for sensitive endpoints: 10 requests/minute
- Rate limit headers in responses (X-RateLimit-*)
- Clear error messages with retry-after guidance

##### US-014: Rate Limit Awareness
**As a** developer
**I want to** know my rate limit status
**So that** I can adjust my request patterns

**Acceptance Criteria:**
- X-RateLimit-Limit header
- X-RateLimit-Remaining header
- X-RateLimit-Reset header
- X-RateLimit-Mode header (redis/fallback)

#### Action Approval

##### US-015: High-Risk Action Approval
**As an** agency owner
**I want** high-risk automated actions to require my approval
**So that** I can prevent unauthorized or accidental damage

**Acceptance Criteria:**
- Risk assessment for all agent actions
- Queue pending approvals with expiration
- Screenshot capture for context
- Approve/reject with reason capture
- Auto-reject on timeout (configurable)

##### US-016: Risk Level Configuration
**As an** administrator
**I want to** configure which actions require approval
**So that** I can balance security with automation efficiency

**Acceptance Criteria:**
- Define high-risk action types (delete, purchase, email, etc.)
- Configure critical risk patterns (rm -rf, DROP TABLE, etc.)
- Set approval timeout per action type
- Configure auto-approve for trusted patterns

#### Execution Control

##### US-017: Execution Pause/Resume
**As a** user monitoring automated tasks
**I want to** pause and resume running executions
**So that** I can intervene when necessary

**Acceptance Criteria:**
- Pause running execution immediately
- Track total paused time
- Resume from paused state
- Maintain checkpoint on pause

##### US-018: Emergency Stop
**As a** security officer
**I want** an emergency stop capability
**So that** I can immediately halt any concerning automation

**Acceptance Criteria:**
- Immediate halt without cleanup
- Admin override capability
- Event logging for emergency stops
- Notification to relevant users

##### US-019: Resource Quotas
**As a** platform operator
**I want** resource quotas enforced
**So that** no single user can exhaust system resources

**Acceptance Criteria:**
- Max API calls per execution
- Max browser actions per execution
- Max tokens per execution
- Max execution time (30 minutes default)
- Max memory usage (512MB default)

---

## 5. Functional Requirements

### 5.1 Authentication System

#### FR-001: Email/Password Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Hash passwords using bcrypt with cost factor 10 | P0 |
| FR-001.2 | Validate password strength (8+ chars, upper, lower, number, special) | P0 |
| FR-001.3 | Track login attempts per email and IP address | P0 |
| FR-001.4 | Rate limit login attempts (5 per hour) | P0 |
| FR-001.5 | Generate secure session tokens (JWT with HS256) | P0 |
| FR-001.6 | Support password reset with 24-hour token expiry | P0 |
| FR-001.7 | Support email verification with 72-hour token expiry | P1 |
| FR-001.8 | Hash reset/verification tokens before storage | P0 |

#### FR-002: OAuth Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Implement PKCE (RFC 7636) for all OAuth flows | P0 |
| FR-002.2 | Validate state parameter for CSRF protection (10-minute TTL) | P0 |
| FR-002.3 | Support Google, Microsoft, Facebook, Instagram, LinkedIn | P1 |
| FR-002.4 | Encrypt OAuth tokens (AES-256-GCM) before storage | P0 |
| FR-002.5 | Calculate and store token expiration | P0 |
| FR-002.6 | Support token refresh for expiring tokens | P1 |
| FR-002.7 | Implement token revocation on disconnect | P1 |

#### FR-003: Session Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Issue HttpOnly cookies for session tokens | P0 |
| FR-003.2 | Set Secure flag for HTTPS connections | P0 |
| FR-003.3 | Configure SameSite attribute (strict/lax based on environment) | P0 |
| FR-003.4 | Default session expiry of 1 year with configurable TTL | P1 |
| FR-003.5 | Update last signed in timestamp on login | P0 |
| FR-003.6 | Track suspended accounts and prevent login | P0 |

### 5.2 Credential Vault

#### FR-004: Credential Storage

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Encrypt all credentials with AES-256-GCM | P0 |
| FR-004.2 | Generate random IV (16 bytes) per encryption | P0 |
| FR-004.3 | Include authentication tag for tamper detection | P0 |
| FR-004.4 | Store credential type (login, api_key, oauth_token, certificate, ssh_key) | P0 |
| FR-004.5 | Support custom fields with encryption | P1 |
| FR-004.6 | Track credential expiration dates | P1 |

#### FR-005: Credential Access Control

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Enforce user-based access control | P0 |
| FR-005.2 | Support allowed actions per credential (read, use, modify, delete) | P0 |
| FR-005.3 | Implement domain-based access restrictions | P1 |
| FR-005.4 | Support approval-required credentials | P1 |
| FR-005.5 | Enforce daily usage limits per credential | P2 |

#### FR-006: Credential Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Log all credential access events | P0 |
| FR-006.2 | Track credential last used timestamp | P0 |
| FR-006.3 | Support credential rotation | P1 |
| FR-006.4 | Support credential sharing (grant/revoke access) | P2 |
| FR-006.5 | Auto-cleanup expired credentials | P1 |

### 5.3 API Key Validation

#### FR-007: Provider Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Validate OpenAI keys via /v1/models endpoint | P0 |
| FR-007.2 | Validate Anthropic keys via /v1/messages endpoint | P0 |
| FR-007.3 | Validate Stripe keys via /v1/balance endpoint | P0 |
| FR-007.4 | Validate Vapi keys via /call endpoint | P1 |
| FR-007.5 | Validate Apify keys via /v2/users/me endpoint | P1 |
| FR-007.6 | Validate Browserbase keys via /v1/sessions endpoint | P1 |
| FR-007.7 | Validate SendGrid keys via /v3/user/profile endpoint | P1 |
| FR-007.8 | Validate Twilio credentials via /Accounts endpoint | P1 |
| FR-007.9 | Validate Google keys via geocoding endpoint | P1 |
| FR-007.10 | Validate GoHighLevel keys via /locations endpoint | P1 |

#### FR-008: Validation Response

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Return valid/invalid status | P0 |
| FR-008.2 | Return descriptive message | P0 |
| FR-008.3 | Return account details when available (name, email, plan) | P1 |
| FR-008.4 | Handle rate limit responses (still consider valid) | P0 |
| FR-008.5 | Timeout validation after 10 seconds | P0 |

### 5.4 Authorization

#### FR-009: tRPC Middleware

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Implement publicProcedure for unauthenticated endpoints | P0 |
| FR-009.2 | Implement protectedProcedure requiring authenticated user | P0 |
| FR-009.3 | Implement adminProcedure requiring admin role | P0 |
| FR-009.4 | Return UNAUTHORIZED error for missing authentication | P0 |
| FR-009.5 | Return FORBIDDEN error for insufficient permissions | P0 |

#### FR-010: API Key Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Validate Bearer token format | P0 |
| FR-010.2 | Validate key prefix ("ghl_") | P0 |
| FR-010.3 | Hash key with SHA-256 for lookup | P0 |
| FR-010.4 | Check key status (active, expired, revoked) | P0 |
| FR-010.5 | Validate scopes against required permissions | P0 |
| FR-010.6 | Update last used timestamp on access | P0 |

### 5.5 Rate Limiting

#### FR-011: Rate Limit Implementation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Implement token bucket algorithm | P0 |
| FR-011.2 | Support sliding window for strict limits | P0 |
| FR-011.3 | Use Redis for distributed rate limiting | P0 |
| FR-011.4 | Fallback to in-memory when Redis unavailable | P1 |
| FR-011.5 | Global limit: 60 requests/minute per IP | P0 |
| FR-011.6 | Strict limit: 10 requests/minute for sensitive endpoints | P0 |
| FR-011.7 | Burst limit: 200 requests/minute for high-traffic endpoints | P1 |

#### FR-012: Per-API-Key Rate Limits

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Per-minute limit from API key configuration | P0 |
| FR-012.2 | Per-hour limit from API key configuration | P0 |
| FR-012.3 | Per-day limit from API key configuration | P0 |
| FR-012.4 | Return rate limit headers in response | P0 |
| FR-012.5 | Return 429 status with retry-after on limit exceeded | P0 |

### 5.6 Action Approval

#### FR-013: Risk Assessment

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Categorize actions as low, medium, high, critical risk | P0 |
| FR-013.2 | Identify high-risk action types (delete, purchase, payment, email, shell) | P0 |
| FR-013.3 | Detect critical patterns (DROP TABLE, rm -rf, sudo) | P0 |
| FR-013.4 | Check for financial keywords (buy, purchase, payment, transfer) | P0 |
| FR-013.5 | Consider bulk operations as higher risk | P1 |
| FR-013.6 | Consider production environment as higher risk | P1 |

#### FR-014: Approval Workflow

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Create approval request with configurable timeout | P0 |
| FR-014.2 | Pause execution pending approval | P0 |
| FR-014.3 | Capture screenshot for approval context | P1 |
| FR-014.4 | Support approve with optional comment | P0 |
| FR-014.5 | Support reject with required reason | P0 |
| FR-014.6 | Auto-reject on timeout (configurable) | P0 |
| FR-014.7 | Resume execution on approval | P0 |

### 5.7 Execution Control

#### FR-015: Execution Lifecycle

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Register new executions with rate limit check | P0 |
| FR-015.2 | Limit concurrent executions per user (default: 3) | P0 |
| FR-015.3 | Support pause/resume with callback hooks | P0 |
| FR-015.4 | Support cancellation with cleanup | P0 |
| FR-015.5 | Support emergency stop (immediate halt) | P0 |
| FR-015.6 | Track execution status history | P0 |

#### FR-016: Resource Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Track API calls per execution | P0 |
| FR-016.2 | Track browser actions per execution | P0 |
| FR-016.3 | Track tokens used per execution | P0 |
| FR-016.4 | Track execution time | P0 |
| FR-016.5 | Track memory usage | P1 |
| FR-016.6 | Enforce quotas and return exceeded resource | P0 |

#### FR-017: Checkpoints

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | Create checkpoints at execution phases | P1 |
| FR-017.2 | Store checkpoint state (URL, cookies, localStorage) | P2 |
| FR-017.3 | Support resume from checkpoint | P2 |
| FR-017.4 | Auto-expire checkpoints with configurable TTL | P1 |

### 5.8 Audit Logging

#### FR-018: Event Logging

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | Log all authentication events | P0 |
| FR-018.2 | Log all approval decisions | P0 |
| FR-018.3 | Log all credential access | P0 |
| FR-018.4 | Log all administrative actions | P0 |
| FR-018.5 | Include user ID, timestamp, IP address, user agent | P0 |
| FR-018.6 | Include action-specific details as JSON | P0 |

#### FR-019: Log Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-019.1 | Index logs for efficient querying | P0 |
| FR-019.2 | Support pagination with offset | P0 |
| FR-019.3 | Support filtering by event type, user, date range | P0 |
| FR-019.4 | Support sorting by timestamp | P0 |
| FR-019.5 | Return total count for pagination | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Authentication latency (P95) | < 200ms | P0 |
| NFR-002 | Token validation latency | < 50ms | P0 |
| NFR-003 | Rate limit check latency | < 10ms | P0 |
| NFR-004 | Audit log query latency (P95) | < 500ms | P0 |
| NFR-005 | Encryption/decryption latency | < 5ms | P0 |
| NFR-006 | Approval request creation | < 100ms | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-007 | Concurrent authenticated sessions | 100,000+ | P1 |
| NFR-008 | Rate limit operations per second | 10,000+ | P0 |
| NFR-009 | Audit log entries per day | 1,000,000+ | P1 |
| NFR-010 | Redis failover recovery | < 30 seconds | P1 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-011 | Authentication availability | 99.99% | P0 |
| NFR-012 | Rate limiting availability | 99.9% (with fallback) | P0 |
| NFR-013 | Audit logging durability | 99.999% | P0 |
| NFR-014 | Credential vault availability | 99.99% | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-015 | All sensitive data encrypted at rest (AES-256-GCM) | P0 |
| NFR-016 | All data encrypted in transit (TLS 1.3) | P0 |
| NFR-017 | Password hashing with bcrypt (cost factor >= 10) | P0 |
| NFR-018 | Secrets stored in environment variables only | P0 |
| NFR-019 | No sensitive data in logs | P0 |
| NFR-020 | SQL injection prevention (parameterized queries) | P0 |
| NFR-021 | XSS prevention (React auto-escaping) | P0 |
| NFR-022 | CSRF protection (state parameter, SameSite cookies) | P0 |
| NFR-023 | Security headers via Helmet.js | P0 |
| NFR-024 | HSTS with 1-year max-age and preload | P0 |

### 6.5 Compliance Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-025 | OWASP Top 10 (2021) compliance | P0 |
| NFR-026 | SOC 2 Type II readiness | P1 |
| NFR-027 | GDPR data protection requirements | P1 |
| NFR-028 | Audit log retention minimum 90 days | P0 |
| NFR-029 | Data encryption documentation | P1 |

### 6.6 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-030 | Structured logging for all security events | P0 |
| NFR-031 | Error tracking with Sentry integration | P0 |
| NFR-032 | Security metrics collection | P1 |
| NFR-033 | Alerting for security anomalies | P1 |
| NFR-034 | Dashboard for security posture | P2 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+-------------------------------------------------------------------+
|                        Client Application                          |
|  (React Frontend with tRPC Client)                                |
+-------------------------------------------------------------------+
                               |
                               | HTTPS (TLS 1.3)
                               v
+-------------------------------------------------------------------+
|                      Security Gateway                              |
|  +-----------+  +------------+  +-----------+  +--------------+   |
|  | Helmet.js |  | Rate Limit |  | CORS      |  | Auth         |   |
|  | Headers   |  | Middleware |  | Middleware|  | Middleware   |   |
|  +-----------+  +------------+  +-----------+  +--------------+   |
+-------------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------------+
|                      API Layer (tRPC + REST)                       |
|  +--------------+  +----------------+  +-------------------+       |
|  | Auth Router  |  | Settings Router|  | Agent Router      |       |
|  | - login      |  | - credentials  |  | - executeTask     |       |
|  | - register   |  | - api keys     |  | - approval        |       |
|  | - oauth      |  | - validation   |  | - execution ctrl  |       |
|  +--------------+  +----------------+  +-------------------+       |
+-------------------------------------------------------------------+
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+---------------+    +------------------+    +------------------+
| Credential    |    | Action Approval  |    | Execution        |
| Vault Service |    | Service          |    | Control Service  |
|               |    |                  |    |                  |
| - encrypt     |    | - assessRisk     |    | - register       |
| - decrypt     |    | - requestApproval|    | - pause/resume   |
| - store       |    | - approve/reject |    | - cancel         |
| - access ctrl |    | - waitForApproval|    | - emergency stop |
+---------------+    +------------------+    +------------------+
        |                      |                      |
        +----------------------+----------------------+
                               |
                               v
+-------------------------------------------------------------------+
|                      Data Layer                                    |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|  | PostgreSQL  |  | Redis       |  | Audit       |  | Security  | |
|  | (Drizzle)   |  | Rate Limits |  | Logs        |  | Events    | |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
+-------------------------------------------------------------------+
```

### 7.2 Component Details

#### 7.2.1 Authentication Layer (`server/auth/email-password.ts`)

**Responsibilities:**
- User registration with password hashing
- Login with email/password verification
- Password reset token management
- Email verification token management
- Login attempt tracking and rate limiting

**Key Functions:**
```typescript
registerUser(data: UserRegistration): Promise<{ user, verificationToken }>
loginWithEmailPassword(credentials, ipAddress, userAgent): Promise<Result>
createPasswordResetToken(email: string): Promise<{ token, expiresAt }>
resetPassword(token: string, newPassword: string): Promise<{ success }>
verifyEmail(token: string): Promise<{ success, userId }>
```

**Security Controls:**
- bcrypt with cost factor 10
- Secure token generation (crypto.randomBytes)
- Token hashing before storage
- Rate limiting (5 attempts/hour)

#### 7.2.2 OAuth Layer (`server/api/routes/oauth.ts`)

**Responsibilities:**
- PKCE code verifier/challenge generation
- State parameter validation
- Authorization code exchange
- Token encryption and storage
- Provider-specific handling

**Supported Providers:**
- Google (Gmail, Google Workspace)
- Microsoft (Outlook, Office 365)
- Facebook
- Instagram
- LinkedIn

**Security Controls:**
- PKCE (RFC 7636) implementation
- State parameter with 10-minute TTL
- AES-256-GCM token encryption
- Timing-safe state comparison

#### 7.2.3 Credential Vault (`server/services/security/credentialVault.service.ts`)

**Responsibilities:**
- Secure credential storage with encryption
- Access control enforcement
- Usage tracking and logging
- Credential rotation support
- Auto-fill configuration for browser automation

**Key Functions:**
```typescript
storeCredential(userId, name, type, domain, data, options): Promise<Result>
getCredential(credentialId, userId, executionId): Promise<Result>
rotateCredential(credentialId, userId, newData): Promise<Result>
grantAccess(credentialId, ownerUserId, targetUserId, actions): Result
revokeAccess(credentialId, ownerUserId, targetUserId): Result
```

**Security Controls:**
- AES-256-GCM authenticated encryption
- Random IV per encryption operation
- User-based access control
- Daily usage limits
- Audit logging

#### 7.2.4 API Key Validation (`server/services/apiKeyValidation.service.ts`)

**Responsibilities:**
- Real API calls to validate keys
- Provider-specific validation endpoints
- Timeout handling
- Rate limit detection
- Account information retrieval

**Validation Flow:**
1. Receive API key and provider
2. Create AbortController with 10s timeout
3. Make validation request to provider API
4. Parse response and extract account info
5. Return validation result

#### 7.2.5 Action Approval (`server/services/actionApproval.service.ts`)

**Responsibilities:**
- Risk assessment for agent actions
- Approval request creation
- Approval queue management
- Execution pause/resume integration
- Audit logging

**Risk Assessment Rules:**
```typescript
HIGH_RISK_ACTIONS = [
  "delete", "purchase", "payment", "send_email",
  "send_message", "shell_exec", "file_write", "database_modify"
]

CRITICAL_RISK_PATTERNS = [
  /drop\s+table/i, /delete\s+from/i, /rm\s+-rf/i, /sudo/i
]
```

#### 7.2.6 Execution Control (`server/services/security/executionControl.service.ts`)

**Responsibilities:**
- Execution registration and lifecycle
- Rate limiting for executions
- Pause/resume/cancel/emergency stop
- Resource tracking and quotas
- Checkpoint management

**Default Quotas:**
```typescript
DEFAULT_QUOTA = {
  maxApiCalls: 1000,
  maxBrowserActions: 500,
  maxTokens: 100000,
  maxExecutionTimeMs: 30 * 60 * 1000, // 30 minutes
  maxMemoryMb: 512
}
```

#### 7.2.7 Rate Limiting (`server/api/rest/middleware/rateLimitMiddleware.ts`)

**Responsibilities:**
- Token bucket algorithm implementation
- Sliding window support
- Redis-based distributed limiting
- In-memory fallback
- Rate limit headers

**Rate Limit Tiers:**
```typescript
globalRateLimit: 60 requests/minute per IP
strictRateLimit: 10 requests/minute (sensitive endpoints)
burstRateLimit: 200 requests/minute (high-traffic endpoints)
apiKeyRateLimit: configurable per minute/hour/day
```

### 7.3 Data Flow Diagrams

#### 7.3.1 Authentication Flow

```
User                    Server                      Database
  |                        |                            |
  |--- POST /login ------->|                            |
  |                        |--- Check rate limit ------>|
  |                        |<-- Rate limit OK ----------|
  |                        |--- Lookup user ----------->|
  |                        |<-- User record ------------|
  |                        |--- Verify password         |
  |                        |    (bcrypt.compare)        |
  |                        |--- Log attempt ----------->|
  |                        |<-- Logged -----------------|
  |                        |--- Generate JWT            |
  |                        |--- Update lastSignedIn --->|
  |<-- Set-Cookie ----------|                            |
  |    (HttpOnly, Secure)  |                            |
```

#### 7.3.2 API Key Validation Flow

```
User                    Server                    External API
  |                        |                            |
  |--- POST /validate ---->|                            |
  |    { provider, key }   |                            |
  |                        |--- Create timeout (10s)    |
  |                        |--- Call provider API ----->|
  |                        |<-- Response ---------------|
  |                        |--- Parse response          |
  |                        |--- Encrypt key             |
  |<-- { valid, details }--|                            |
```

#### 7.3.3 Action Approval Flow

```
Agent                   Server                      User
  |                        |                            |
  |--- Execute action ---->|                            |
  |                        |--- Assess risk             |
  |                        |    (riskLevel: high)       |
  |                        |--- Create approval ------->|
  |                        |--- Pause execution         |
  |                        |                            |
  |                        |<-- Approve/Reject ---------|
  |                        |--- Update approval         |
  |                        |--- Resume/Cancel execution |
  |<-- Result -------------|                            |
```

### 7.4 Security Controls Matrix

| Layer | Control | Implementation | OWASP Mapping |
|-------|---------|----------------|---------------|
| Transport | TLS 1.3 | Enforced by infrastructure | A02, A07 |
| Session | HttpOnly Cookies | `server/_core/cookies.ts` | A07 |
| Session | SameSite Cookies | `server/_core/cookies.ts` | A07 |
| Authentication | bcrypt Hashing | `server/auth/email-password.ts` | A02, A07 |
| Authentication | Rate Limiting | Rate limit middleware | A07 |
| Authorization | RBAC | tRPC middleware | A01 |
| Authorization | API Key Scopes | Auth middleware | A01 |
| Data | AES-256-GCM Encryption | Credential vault | A02 |
| Data | Parameterized Queries | Drizzle ORM | A03 |
| Input | Zod Validation | All endpoints | A03 |
| Headers | Helmet.js | Express middleware | A05 |
| Headers | HSTS | Helmet configuration | A05 |
| Headers | CSP | Helmet configuration | A05 |
| Logging | Structured Audit Logs | Security audit log table | A09 |

---

## 8. API Specifications

### 8.1 Authentication Endpoints

#### POST /api/auth/login

**Description:** Authenticate user with email and password

**Request:**
```typescript
{
  email: string;       // Required, valid email format
  password: string;    // Required, min 8 characters
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: 'user' | 'admin';
  }
}
// Cookie: bb_session (HttpOnly, Secure, SameSite)
```

**Response (Error - 401):**
```typescript
{
  success: false;
  reason: 'invalid_credentials' | 'account_suspended' | 'too_many_attempts';
}
```

#### POST /api/auth/register

**Description:** Register new user account

**Request:**
```typescript
{
  email: string;       // Required, valid email, unique
  password: string;    // Required, meets strength requirements
  name: string;        // Optional
}
```

**Response (Success - 201):**
```typescript
{
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  verificationToken: string;  // For email verification
}
```

### 8.2 OAuth Endpoints

#### GET /api/oauth/:provider/callback

**Description:** OAuth callback handler

**Query Parameters:**
```typescript
{
  code: string;    // Authorization code from provider
  state: string;   // State parameter for CSRF protection
  error?: string;  // Error code if authorization failed
  error_description?: string;  // Error description
}
```

**Response:** Redirect to `/settings?oauth=success` or `/settings?oauth=error&message=...`

### 8.3 Credential Management

#### POST /api/settings/credentials

**Description:** Store encrypted credential

**Request:**
```typescript
{
  name: string;
  type: 'login' | 'api_key' | 'oauth_token' | 'certificate' | 'ssh_key' | 'custom';
  domain: string;
  data: {
    username?: string;
    password?: string;
    apiKey?: string;
    token?: string;
    customFields?: Record<string, string>;
  };
  options?: {
    expiresAt?: Date;
    requireApproval?: boolean;
    maxUsesPerDay?: number;
  };
}
```

**Response (Success - 201):**
```typescript
{
  success: true;
  credentialId: string;
}
```

### 8.4 API Key Validation

#### POST /api/settings/validate-key

**Description:** Validate third-party API key

**Request:**
```typescript
{
  provider: 'openai' | 'anthropic' | 'stripe' | 'vapi' | 'apify' |
            'browserbase' | 'sendgrid' | 'twilio' | 'google' | 'gohighlevel';
  credentials: {
    apiKey?: string;
    accountSid?: string;  // For Twilio
    authToken?: string;   // For Twilio
  };
}
```

**Response:**
```typescript
{
  valid: boolean;
  message: string;
  details?: {
    accountName?: string;
    accountEmail?: string;
    plan?: string;
    credits?: number;
  };
}
```

### 8.5 Action Approval

#### POST /api/approval/request

**Description:** Request approval for high-risk action

**Request:**
```typescript
{
  executionId: number;
  actionType: string;
  actionDescription: string;
  actionParams: Record<string, unknown>;
  screenshotUrl?: string;
  timeoutMinutes?: number;  // Default: 5
}
```

**Response:**
```typescript
{
  approvalId: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  expiresAt: Date;
}
```

#### POST /api/approval/:id/approve

**Description:** Approve pending action

**Response:**
```typescript
{
  success: true;
  executionResumed: true;
}
```

#### POST /api/approval/:id/reject

**Description:** Reject pending action

**Request:**
```typescript
{
  reason: string;  // Required
}
```

**Response:**
```typescript
{
  success: true;
  executionPaused: true;
}
```

### 8.6 Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2026-01-11T10:30:00Z
X-RateLimit-Mode: redis
X-RateLimit-Limit-Minute: 60
X-RateLimit-Remaining-Minute: 55
X-RateLimit-Limit-Hour: 1000
X-RateLimit-Remaining-Hour: 990
X-RateLimit-Limit-Day: 10000
X-RateLimit-Remaining-Day: 9950
```

---

## 9. Data Models

### 9.1 Users Table

```typescript
users = {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),  // bcrypt hash
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  loginMethod: varchar('login_method', { length: 50 }),  // email, google, etc.
  openId: varchar('open_id', { length: 255 }),
  lastSignedIn: timestamp('last_signed_in'),
  suspendedAt: timestamp('suspended_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}
```

### 9.2 Login Attempts Table

```typescript
loginAttempts = {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: text('user_agent'),
  success: boolean('success').notNull(),
  failureReason: varchar('failure_reason', { length: 100 }),
  attemptedAt: timestamp('attempted_at').defaultNow()
}

// Index: (email, ipAddress, attemptedAt) for rate limit checks
```

### 9.3 Password Reset Tokens Table

```typescript
passwordResetTokens = {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  token: varchar('token', { length: 255 }).notNull(),  // bcrypt hash
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow()
}
```

### 9.4 Email Verification Tokens Table

```typescript
emailVerificationTokens = {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  token: varchar('token', { length: 255 }).notNull(),  // bcrypt hash
  expiresAt: timestamp('expires_at').notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow()
}
```

### 9.5 API Keys Table

```typescript
apiKeys = {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),  // SHA-256
  name: varchar('name', { length: 255 }).notNull(),
  scopes: json('scopes').$type<string[]>(),
  rateLimitPerMinute: integer('rate_limit_per_minute').default(60),
  rateLimitPerHour: integer('rate_limit_per_hour').default(1000),
  rateLimitPerDay: integer('rate_limit_per_day').default(10000),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow()
}
```

### 9.6 Integrations Table (OAuth Tokens)

```typescript
integrations = {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  service: varchar('service', { length: 50 }).notNull(),  // google, outlook, etc.
  accessToken: text('access_token').notNull(),  // AES-256-GCM encrypted
  refreshToken: text('refresh_token'),  // AES-256-GCM encrypted
  expiresAt: timestamp('expires_at'),
  isActive: varchar('is_active', { length: 10 }).default('true'),
  metadata: text('metadata'),  // JSON with scope, token type, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}

// Unique index: (userId, service)
```

### 9.7 Action Approvals Table

```typescript
actionApprovals = {
  id: serial('id').primaryKey(),
  executionId: integer('execution_id').notNull(),
  userId: integer('user_id').references(() => users.id),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  actionDescription: text('action_description').notNull(),
  actionParams: json('action_params'),
  riskLevel: varchar('risk_level', { length: 20 }).notNull(),  // low, medium, high, critical
  riskFactors: json('risk_factors').$type<string[]>(),
  screenshotUrl: text('screenshot_url'),
  status: varchar('status', { length: 20 }).default('pending'),  // pending, approved, rejected, timeout
  timeoutAction: varchar('timeout_action', { length: 20 }).default('reject'),
  expiresAt: timestamp('expires_at').notNull(),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}

// Index: (userId, status) for pending approvals query
```

### 9.8 Security Audit Log Table

```typescript
securityAuditLog = {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: integer('resource_id'),
  details: json('details'),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow()
}

// Indexes:
// - (userId, timestamp) for user activity queries
// - (action, timestamp) for event type queries
// - (timestamp) for time-range queries
```

---

## 10. UI/UX Requirements

### 10.1 Authentication Screens

#### 10.1.1 Login Screen
- Email and password input fields with validation feedback
- "Forgot password?" link with inline password reset flow
- OAuth provider buttons (Google, Microsoft, etc.)
- Rate limit warning display when applicable
- Loading state during authentication
- Error messages for invalid credentials, suspended accounts

#### 10.1.2 Registration Screen
- Email, password, confirm password, optional name fields
- Real-time password strength indicator
- Password requirements checklist
- Terms of service acceptance checkbox
- Verification email confirmation message

#### 10.1.3 Password Reset Flow
- Request reset: email input with success confirmation
- Reset form: new password with strength validation
- Expiration warning if token is near expiry
- Success confirmation with login redirect

### 10.2 Settings: Security Section

#### 10.2.1 API Key Management
- List of stored API keys with masked display
- Add new key modal with provider dropdown
- Real-time validation with status indicator
- Key rotation action with confirmation
- Delete key with confirmation dialog
- Usage statistics per key

#### 10.2.2 OAuth Integrations
- Connected accounts list with provider icons
- Connect new account button per provider
- Disconnect with confirmation and warning about impact
- Token expiration status and refresh action
- Scope display for each connection

#### 10.2.3 Session Management
- Active sessions list with device/location info
- Current session indicator
- Revoke individual session action
- Revoke all other sessions action
- Last activity timestamp per session

### 10.3 Action Approval Interface

#### 10.3.1 Pending Approvals Queue
- List of pending approvals with risk level badges
- Action description with expandable details
- Screenshot thumbnail with full-size modal
- Approve/Reject buttons with keyboard shortcuts
- Countdown timer showing time until expiration
- Bulk approve/reject for low-risk actions

#### 10.3.2 Approval Detail View
- Full action description and parameters
- Risk assessment explanation
- Screenshot context viewer
- Approval/rejection history if retry
- Comment field for approval notes

### 10.4 Audit Log Viewer

#### 10.4.1 Log List View
- Paginated table with expandable rows
- Filter panel: event type, user, date range
- Sort by timestamp (ascending/descending)
- Search within logs
- Export button (CSV, JSON)

#### 10.4.2 Log Detail View
- Full event details in structured format
- Related events link
- User action trail
- IP address and geolocation
- User agent parsing display

### 10.5 Rate Limit Awareness

#### 10.5.1 API Dashboard
- Current usage vs. limits visualization
- Usage by time period (minute/hour/day)
- Warning indicators when approaching limits
- Historical usage trends

#### 10.5.2 Limit Exceeded States
- Clear error message with retry guidance
- Countdown to limit reset
- Upgrade prompt for higher limits
- Contact support link

---

## 11. Dependencies & Integrations

### 11.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router with authorization middleware |
| Database | `server/db/index.ts` | Drizzle ORM for PostgreSQL |
| Redis Service | `server/services/redis.service.ts` | Distributed rate limiting |
| SSE Manager | `server/_core/sse-manager.ts` | Real-time approval notifications |
| Execution Service | `server/services/agentOrchestrator.service.ts` | Agent execution integration |

### 11.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| bcryptjs | ^2.x | Password hashing |
| crypto (Node.js) | Built-in | AES encryption, secure random |
| jose | ^5.x | JWT token management |
| helmet | ^7.x | Security headers |
| express-rate-limit | ^7.x | Rate limiting |
| zod | ^3.x | Input validation |
| drizzle-orm | ^0.30.x | Database ORM |

### 11.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | User data, audit logs, credentials | Yes |
| Redis | Distributed rate limiting, session storage | Recommended |
| Sentry | Error tracking and security alerting | Recommended |
| 1Password Connect | Enterprise credential vault | Optional |

### 11.4 Third-Party APIs (for Validation)

| Provider | Endpoint Used | Purpose |
|----------|---------------|---------|
| OpenAI | GET /v1/models | API key validation |
| Anthropic | POST /v1/messages | API key validation |
| Stripe | GET /v1/balance | API key validation |
| Vapi | GET /call | API key validation |
| Apify | GET /v2/users/me | API key validation |
| Browserbase | GET /v1/sessions | API key validation |
| SendGrid | GET /v3/user/profile | API key validation |
| Twilio | GET /Accounts/{sid} | Credential validation |
| Google | GET /maps/api/geocode | API key validation |
| GoHighLevel | GET /locations | API key validation |

### 11.5 Environment Variables

```bash
# Required for Authentication
JWT_SECRET=                    # Secret for JWT signing (64+ char recommended)
ENCRYPTION_KEY=                # 32-byte hex for AES-256 encryption

# Required for Database
DATABASE_URL=                  # PostgreSQL connection string

# Recommended for Rate Limiting
REDIS_URL=                     # Redis connection string

# OAuth Providers (at least one required for OAuth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

OUTLOOK_CLIENT_ID=
OUTLOOK_CLIENT_SECRET=
OUTLOOK_REDIRECT_URI=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=

INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=

# Optional for Credential Vault
CREDENTIAL_VAULT_KEY=          # Alternative encryption key for vault

# Optional for Monitoring
SENTRY_DSN=                    # Sentry error tracking
```

---

## 12. Release Criteria

### 12.1 Pre-Release Checklist

#### Security Testing

- [ ] All authentication endpoints pass penetration testing
- [ ] SQL injection testing on all database queries
- [ ] XSS testing on all user inputs
- [ ] CSRF protection verification
- [ ] Rate limiting effectiveness testing
- [ ] Encryption implementation audit
- [ ] Secrets scanning in codebase

#### Functional Testing

- [ ] Email/password login flow end-to-end
- [ ] OAuth flow for all providers
- [ ] Password reset complete flow
- [ ] API key validation for all providers
- [ ] Action approval workflow complete
- [ ] Execution control (pause/resume/cancel)
- [ ] Audit log generation and querying

#### Performance Testing

- [ ] Authentication latency < 200ms (P95)
- [ ] Rate limit checks < 10ms
- [ ] Audit log queries < 500ms with 1M+ records
- [ ] Concurrent session handling (1000+ users)

#### Documentation

- [ ] API documentation complete
- [ ] Security controls documentation
- [ ] Runbook for security incidents
- [ ] Compliance mapping document

### 12.2 Go-Live Criteria

| Criterion | Target | Verification |
|-----------|--------|--------------|
| Critical bugs | 0 | Bug tracker |
| High-priority bugs | 0 | Bug tracker |
| Security vulnerabilities | 0 critical/high | Security scan |
| Test coverage | >= 80% | Coverage report |
| Performance benchmarks | All passing | Load test results |
| Documentation | 100% complete | Review checklist |
| Stakeholder sign-off | All obtained | Approval records |

### 12.3 Post-Release Monitoring

| Metric | Alert Threshold | Response Time |
|--------|-----------------|---------------|
| Authentication errors | > 1% | 15 minutes |
| Failed logins spike | > 5x baseline | 5 minutes |
| Rate limit violations | > 10% of requests | 30 minutes |
| Audit log failures | Any | 5 minutes |
| Encryption errors | Any | Immediate |

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Redis unavailability causing rate limit bypass | Medium | High | In-memory fallback with degraded functionality |
| JWT secret compromise | Low | Critical | Secret rotation procedure, short-lived tokens |
| Encryption key loss | Low | Critical | Key backup in secure vault, key recovery procedure |
| OAuth provider outage | Medium | Medium | Graceful degradation, provider status monitoring |
| Database connection exhaustion | Low | High | Connection pooling, max connections limit |

### 13.2 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Credential stuffing attack | High | High | Rate limiting, account lockout, CAPTCHA |
| Session hijacking | Low | High | HttpOnly cookies, session invalidation |
| API key exposure | Medium | High | Key rotation, access logging, alerts |
| Privilege escalation | Low | Critical | Thorough authorization testing, code review |
| Audit log tampering | Low | High | Append-only storage, checksums |

### 13.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Key rotation causing service disruption | Medium | Medium | Rolling key rotation, dual-key support |
| False positive rate limit blocks | Medium | Medium | Tunable thresholds, bypass for trusted IPs |
| Approval queue backup | Medium | Medium | Auto-timeout, escalation procedure |
| Audit log storage growth | High | Low | Retention policies, archival strategy |

### 13.4 Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Audit log gaps | Low | High | Redundant logging, completeness monitoring |
| Data retention violations | Low | High | Automated retention enforcement |
| Encryption non-compliance | Low | High | Regular encryption audits |
| Access control failures | Low | Critical | Regular access reviews, testing |

---

## 14. Future Considerations

### 14.1 Planned Enhancements (v2.0)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Multi-Factor Authentication** | TOTP, SMS, or hardware key support | P1 |
| **Single Sign-On (SAML)** | Enterprise SSO integration | P1 |
| **IP Allowlisting** | Restrict access to specific IP ranges | P2 |
| **Geo-Blocking** | Block access from specific countries | P2 |
| **Advanced Threat Detection** | ML-based anomaly detection | P2 |
| **Custom Approval Workflows** | Multi-level approval chains | P2 |

### 14.2 Long-Term Roadmap (v3.0+)

| Feature | Description | Target |
|---------|-------------|--------|
| **Zero-Trust Architecture** | Device trust, continuous authentication | v3.0 |
| **Secrets Manager Integration** | HashiCorp Vault, AWS Secrets Manager | v3.0 |
| **Compliance Automation** | SOC 2, HIPAA, PCI-DSS reports | v3.0 |
| **Security Orchestration** | Automated incident response | v3.5 |
| **Behavioral Biometrics** | Typing patterns, mouse movements | v4.0 |

### 14.3 Technical Debt

| Item | Description | Priority |
|------|-------------|----------|
| Hardcoded userId in AI Calling Router | Replace with ctx.user.id | P0 |
| Public procedures in Tasks Router | Change to protectedProcedure | P0 |
| JWT_SECRET default to empty | Fail fast in production | P1 |
| CORS wildcard origin | Implement origin whitelist | P1 |
| OAuth token logging | Sanitize log output | P2 |
| CSP unsafe-inline | Implement nonce-based CSP | P2 |

### 14.4 Scalability Considerations

| Consideration | Current State | Future State |
|---------------|---------------|--------------|
| Rate limit storage | Redis single instance | Redis Cluster |
| Audit log storage | PostgreSQL | Time-series DB + archival |
| Session storage | Database | Redis with database backup |
| Encryption keys | Environment variables | Key Management Service |
| Credential vault | In-memory | Dedicated secret manager |

---

## Appendix A: Security Audit Summary

Based on SECURITY_FINAL_AUDIT.md (29KB), the comprehensive security audit findings:

### Positive Security Controls Implemented (15+)

1. bcrypt password hashing (cost factor 12)
2. JWT session management with HttpOnly cookies
3. Three-tier authorization (public, protected, admin)
4. API key SHA-256 hashing
5. Scope-based permissions
6. Multi-tier rate limiting (global, per-API-key, strict)
7. Redis-based distributed rate limiting
8. AES-256-GCM encryption for secrets
9. Zod input validation on all endpoints
10. Drizzle ORM SQL injection prevention
11. React auto-escaping for XSS prevention
12. Helmet.js security headers
13. HSTS with preload
14. Request/response logging with sensitive data sanitization
15. Sentry error tracking
16. TLS/SSL database connections
17. Comprehensive audit trails

### OWASP Top 10 (2021) Coverage

| Risk | Status |
|------|--------|
| A01: Broken Access Control | Partial (fix H1, H2) |
| A02: Cryptographic Failures | Compliant |
| A03: Injection | Compliant |
| A04: Insecure Design | Compliant |
| A05: Security Misconfiguration | Compliant |
| A06: Vulnerable Components | Monitor |
| A07: Auth Failures | Compliant |
| A08: Data Integrity | Compliant |
| A09: Logging Failures | Compliant |
| A10: SSRF | Compliant |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **AES-256-GCM** | Advanced Encryption Standard with 256-bit key in Galois/Counter Mode |
| **bcrypt** | Password hashing algorithm with configurable cost factor |
| **CSRF** | Cross-Site Request Forgery attack |
| **HSTS** | HTTP Strict Transport Security header |
| **HttpOnly** | Cookie flag preventing JavaScript access |
| **JWT** | JSON Web Token for session management |
| **OWASP** | Open Web Application Security Project |
| **PKCE** | Proof Key for Code Exchange (OAuth security extension) |
| **RBAC** | Role-Based Access Control |
| **SameSite** | Cookie attribute for CSRF protection |
| **SOC 2** | Service Organization Control 2 compliance framework |
| **TLS** | Transport Layer Security for encrypted communications |
| **TOTP** | Time-based One-Time Password (for MFA) |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Security, Compliance, Product
