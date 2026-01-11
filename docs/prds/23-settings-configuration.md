# PRD-023: Settings & Configuration

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/settings.ts`, `client/src/config/tours/settingsTour.ts`

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

---

## 1. Executive Summary

### 1.1 Overview

The Settings & Configuration feature provides a centralized management system for all user preferences, API integrations, OAuth connections, webhook configurations, and system defaults within Bottleneck-Bots. This feature enables users to customize their platform experience, securely manage third-party service credentials, and configure automated workflow behaviors through an intuitive settings interface.

### 1.2 Key Components

| Component | Description | Location |
|-----------|-------------|----------|
| **API Key Management** | Secure encrypted storage for third-party API keys (OpenAI, Anthropic, Browserbase, etc.) | `server/api/routers/settings.ts` |
| **OAuth Integrations** | OAuth 2.0 flows for Google, Gmail, Outlook, Facebook, Instagram, LinkedIn | `server/api/routers/settings.ts`, `server/_core/oauth.ts` |
| **Webhook Configuration** | Create, manage, and monitor webhooks with signature verification | `server/api/routers/settings.ts` |
| **User Preferences** | Theme, notifications, default workflow settings, browser configurations | `server/api/routers/settings.ts` |
| **Feature Flags** | System-wide and user-specific feature toggles | Future enhancement |
| **Settings Tour** | Interactive onboarding tour for settings configuration | `client/src/config/tours/settingsTour.ts` |

### 1.3 Security Highlights

Based on the implementation:

- **AES-256-GCM Encryption**: All API keys and OAuth tokens encrypted at rest
- **PKCE OAuth Flow**: RFC 7636 compliant OAuth with code challenge
- **Webhook Signing**: HMAC SHA-256 signature verification for outgoing webhooks
- **Input Validation**: Comprehensive Zod schema validation on all endpoints
- **Access Control**: User-scoped data isolation with protected procedures

### 1.4 Target Users

- Agency Owners managing integrations
- Technical Administrators configuring platform settings
- Power Users customizing workflow defaults
- Developers integrating third-party services
- Marketing Teams connecting social media accounts

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Scattered Configuration**: Users lack a centralized location to manage all platform settings and integrations
2. **Credential Security Risks**: API keys stored insecurely or shared through unsafe channels
3. **Integration Complexity**: OAuth flows are complex and error-prone without proper state management
4. **Limited Customization**: Users cannot configure default behaviors for workflows and browser sessions
5. **Webhook Management Gaps**: No visibility into webhook delivery status or failure recovery
6. **Onboarding Friction**: New users struggle to understand which settings are critical for platform functionality

### 2.2 User Pain Points

| Pain Point | Impact | User Type |
|------------|--------|-----------|
| "I don't know which API keys I need to configure" | Feature unavailability, failed automations | New Users |
| "I can't tell if my integrations are working" | Time wasted troubleshooting | All Users |
| "OAuth connections randomly disconnect" | Workflow interruptions | Agency Owners |
| "Webhooks fail silently with no way to retry" | Missed events, data loss | Developers |
| "I have to reconfigure settings every time I create a workflow" | Productivity loss | Power Users |
| "Team members share API keys insecurely" | Security vulnerabilities | Administrators |

### 2.3 Business Impact

| Problem | Impact | Cost |
|---------|--------|------|
| Failed integrations causing churn | 15% user abandonment | $50K+ revenue loss monthly |
| Insecure credential handling | Potential data breaches | $150K - $4M per incident |
| Manual webhook retry requirements | Support burden | 20+ hours/week |
| Poor onboarding experience | Low feature adoption | 40% features unused |
| Configuration errors | Failed automations | 30% task failure rate |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Description | Priority | Target |
|---------|-------------|----------|--------|
| **G1** | Provide secure, encrypted storage for all API credentials | P0 | Zero credential exposures |
| **G2** | Enable seamless OAuth integrations with automatic token refresh | P0 | 95%+ integration uptime |
| **G3** | Deliver comprehensive webhook management with delivery tracking | P0 | 99%+ delivery success |
| **G4** | Allow full customization of user preferences and defaults | P1 | 80%+ settings configured |
| **G5** | Implement feature flag system for controlled rollouts | P1 | 100% features flaggable |
| **G6** | Guide users through critical settings via interactive tours | P1 | 90%+ tour completion |

### 3.2 Success Metrics (KPIs)

#### Configuration Adoption Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API key configuration rate | >= 85% | Users with at least one key / Total users |
| OAuth connection success rate | >= 95% | Successful connects / Connection attempts |
| Average settings completion | >= 70% | Settings configured / Total available settings |
| Settings tour completion | >= 60% | Tours completed / Tours started |

#### Security Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Credential encryption coverage | 100% | Encrypted keys / Total stored keys |
| API key validation success | >= 90% | Valid keys / Keys tested |
| OAuth token refresh success | >= 99% | Successful refreshes / Total refresh attempts |
| Webhook signature verification | 100% | Signed webhooks / Total webhooks sent |

#### Reliability Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Webhook delivery success rate | >= 99% | Successful deliveries / Total attempts |
| OAuth integration uptime | >= 99.5% | Connected time / Total time |
| Settings API latency (P95) | < 200ms | Server-side measurement |
| Preference sync reliability | 100% | Synced updates / Total updates |

#### User Experience Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Settings page load time | < 1 second | Client-side measurement |
| Configuration error rate | < 2% | Failed saves / Total save attempts |
| Support tickets for settings | < 5% of total | Settings tickets / Total tickets |
| NPS for configuration experience | >= 40 | User surveys |

---

## 4. User Stories & Personas

### 4.1 Personas

#### Persona 1: Agency Administrator (Alex)
- **Role:** Technical lead at digital marketing agency
- **Goals:** Configure integrations for team, manage API costs, ensure security
- **Pain Points:** Team members sharing keys insecurely, tracking API usage, managing multiple OAuth connections
- **Technical Level:** Medium-High

#### Persona 2: Power User (Patricia)
- **Role:** Marketing automation specialist
- **Goals:** Customize default workflows, connect social accounts, streamline operations
- **Pain Points:** Repetitive configuration, forgotten settings, disconnected integrations
- **Technical Level:** Medium

#### Persona 3: Developer (David)
- **Role:** Full-stack developer integrating with Bottleneck-Bots
- **Goals:** Configure webhooks, validate API keys, customize browser defaults
- **Pain Points:** Complex OAuth flows, webhook debugging, unclear documentation
- **Technical Level:** High

#### Persona 4: New User (Nina)
- **Role:** Small business owner new to automation
- **Goals:** Get started quickly, understand required settings, connect essential services
- **Pain Points:** Overwhelmed by options, unsure which keys are needed, unclear error messages
- **Technical Level:** Low

### 4.2 User Stories

#### API Key Management

##### US-001: Save API Key
**As an** agency administrator
**I want to** securely save API keys for various services
**So that** my team can use integrations without exposing credentials

**Acceptance Criteria:**
- API keys are encrypted with AES-256-GCM before storage
- Supported services: OpenAI, Browserbase, Anthropic, Google, Stripe, Twilio, SendGrid, GoHighLevel, Vapi, Apify, Custom
- Keys are masked in UI display (first 4 and last 4 characters visible)
- Optional labels for key identification
- Confirmation message on successful save

##### US-002: Validate API Key
**As a** developer
**I want to** validate API keys before saving
**So that** I can ensure keys are working correctly

**Acceptance Criteria:**
- Real-time validation against provider APIs
- Clear success/failure messages
- Account details returned when available (name, email, plan)
- Rate limit responses treated as valid (key works but throttled)
- Validation timeout of 10 seconds
- Special handling for Twilio (Account SID + Auth Token)

##### US-003: Test Saved API Key
**As a** power user
**I want to** test my saved API keys
**So that** I can verify they're still working

**Acceptance Criteria:**
- Test endpoint calls provider API with decrypted key
- Cached validation results (5 minutes) for performance
- Clear status indicators (valid, invalid, expired)
- Retry option for failed tests
- Detailed error messages for failures

##### US-004: Delete API Key
**As an** administrator
**I want to** delete API keys when no longer needed
**So that** I can maintain security hygiene

**Acceptance Criteria:**
- Confirmation dialog before deletion
- Key completely removed from database
- Audit log entry for deletion
- Warning if key is in use by active workflows

#### OAuth Integrations

##### US-005: Initiate OAuth Connection
**As a** power user
**I want to** connect my Google/Facebook/LinkedIn accounts
**So that** I can use integrated features like email and social posting

**Acceptance Criteria:**
- Authorization URL generated with PKCE code challenge
- State parameter for CSRF protection (10-minute TTL)
- Code verifier stored securely server-side
- Supported providers: Google, Gmail, Outlook, Facebook, Instagram, LinkedIn
- Clear provider-specific scope descriptions

##### US-006: Complete OAuth Flow
**As a** user completing OAuth
**I want** the system to securely store my access tokens
**So that** my integration works without re-authentication

**Acceptance Criteria:**
- Authorization code exchanged for tokens securely
- Access and refresh tokens encrypted before storage
- Token expiration tracked
- Existing integration updated rather than duplicated
- Success confirmation with connection status

##### US-007: Refresh OAuth Token
**As an** automation running overnight
**I want** my OAuth tokens to refresh automatically
**So that** my integrations don't break due to expiration

**Acceptance Criteria:**
- Automatic refresh when token near expiration
- Manual refresh option available
- New refresh token stored if rotated
- Failed refresh triggers user notification
- Retry logic with exponential backoff

##### US-008: Disconnect Integration
**As a** security-conscious user
**I want to** disconnect OAuth integrations
**So that** I can revoke access when no longer needed

**Acceptance Criteria:**
- Soft delete (isActive set to false)
- Option to revoke token with provider
- Warning about affected workflows
- Audit log entry for disconnection
- Clear confirmation of disconnection

##### US-009: Test Integration
**As a** troubleshooting user
**I want to** test my OAuth integrations
**So that** I can verify they're working correctly

**Acceptance Criteria:**
- Token expiration check
- Provider API test call
- Clear status (working, expired, invalid)
- Suggestions for fixing issues
- Last tested timestamp display

#### Webhook Management

##### US-010: Create Webhook
**As a** developer
**I want to** create webhooks to receive event notifications
**So that** I can integrate Bottleneck-Bots with my systems

**Acceptance Criteria:**
- Configurable webhook URL (HTTPS required)
- Event type selection (quiz.completed, workflow.executed, task.completed, lead.created, integration events, or "all")
- Automatic signing secret generation (whsec_xxx format)
- Plan-based webhook limits enforced (Free: 3, Pro: 10, Enterprise: unlimited)
- Name and description fields
- Active/inactive toggle

##### US-011: Test Webhook
**As a** developer
**I want to** send test webhook payloads
**So that** I can verify my endpoint is receiving events

**Acceptance Criteria:**
- Sample payload sent with correct signature
- Response status code captured
- Response body preview available
- Delivery logged for reference
- Clear success/failure indication

##### US-012: View Webhook Logs
**As a** developer debugging issues
**I want to** view webhook delivery logs
**So that** I can identify and fix delivery problems

**Acceptance Criteria:**
- Paginated log list with filtering
- Filter by: webhook ID, event type, status, date range
- Status types: pending, success, failed, retrying, permanently_failed
- Request/response details expandable
- Retry count and timing visible

##### US-013: Retry Failed Webhook
**As a** developer recovering from issues
**I want to** manually retry failed webhook deliveries
**So that** I don't lose important events

**Acceptance Criteria:**
- Retry button on failed deliveries
- Original payload preserved
- New attempt logged
- Retry count incremented
- Max retry limit enforcement

##### US-014: Regenerate Webhook Secret
**As a** security-conscious developer
**I want to** regenerate my webhook signing secret
**So that** I can rotate credentials when needed

**Acceptance Criteria:**
- New secret generated immediately
- Old secret invalidated
- New secret displayed once for copying
- Warning about endpoint update requirement
- Audit log entry for rotation

##### US-015: View Webhook Statistics
**As a** developer monitoring integrations
**I want to** view webhook delivery statistics
**So that** I can monitor integration health

**Acceptance Criteria:**
- Total deliveries count
- Success/failure rates
- Average response time
- Event type breakdown
- Time-range filtering

#### User Preferences

##### US-016: Configure Theme
**As a** user
**I want to** set my preferred theme (light/dark/system)
**So that** the interface matches my environment

**Acceptance Criteria:**
- Three options: light, dark, system
- Immediate application without reload
- Preference persisted across sessions
- System option follows OS preference

##### US-017: Configure Notifications
**As a** user
**I want to** control notification settings
**So that** I only receive alerts I care about

**Acceptance Criteria:**
- Email notification toggle
- Browser notification toggle
- Workflow notification toggle
- Per-category granularity
- Immediate effect on new notifications

##### US-018: Set Default Browser Config
**As a** power user
**I want to** configure default browser session settings
**So that** new workflows use my preferred configuration

**Acceptance Criteria:**
- Default viewport dimensions
- Default timeout values
- Proxy preferences
- Recording preferences
- Applied to all new sessions

##### US-019: Set Default Workflow Settings
**As a** automation specialist
**I want to** configure default workflow behaviors
**So that** I don't have to reconfigure common settings

**Acceptance Criteria:**
- Default retry settings
- Default timeout values
- Default notification preferences
- Default approval settings
- Overridable per workflow

##### US-020: Reset to Defaults
**As a** user who wants to start fresh
**I want to** reset all preferences to defaults
**So that** I can undo unwanted changes

**Acceptance Criteria:**
- Confirmation dialog required
- All preferences reset to system defaults
- API keys and integrations NOT affected
- Audit log entry created
- Success confirmation displayed

---

## 5. Functional Requirements

### 5.1 API Key Management

#### FR-001: API Key Storage

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Encrypt API keys with AES-256-GCM algorithm | P0 |
| FR-001.2 | Generate random 16-byte IV per encryption | P0 |
| FR-001.3 | Include authentication tag for tamper detection | P0 |
| FR-001.4 | Store encryption format as: iv:authTag:encryptedData | P0 |
| FR-001.5 | Require ENCRYPTION_KEY environment variable (64-char hex) | P0 |
| FR-001.6 | Fail fast with clear error if encryption key misconfigured | P0 |

#### FR-002: API Key Services

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Support OpenAI API key validation | P0 |
| FR-002.2 | Support Browserbase API key validation | P0 |
| FR-002.3 | Support Anthropic API key validation | P0 |
| FR-002.4 | Support Google API key validation | P1 |
| FR-002.5 | Support Stripe API key validation | P1 |
| FR-002.6 | Support Twilio Account SID + Auth Token validation | P1 |
| FR-002.7 | Support SendGrid API key validation | P1 |
| FR-002.8 | Support GoHighLevel API key validation | P0 |
| FR-002.9 | Support Vapi API key validation | P1 |
| FR-002.10 | Support Apify API key validation | P1 |
| FR-002.11 | Support custom API key storage (no validation) | P2 |

#### FR-003: API Key Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | List all configured API keys with masked display | P0 |
| FR-003.2 | Validate API key before saving (optional) | P0 |
| FR-003.3 | Save API key with optional label | P0 |
| FR-003.4 | Delete API key by service type | P0 |
| FR-003.5 | Test saved API key with real provider call | P0 |
| FR-003.6 | Cache validation results for 5 minutes | P1 |
| FR-003.7 | Mask API keys (first 4 + last 4 characters visible) | P0 |

### 5.2 OAuth Integration

#### FR-004: OAuth Providers

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Support Google OAuth with openid, email, profile scopes | P0 |
| FR-004.2 | Support Gmail OAuth with gmail.readonly, gmail.send scopes | P0 |
| FR-004.3 | Support Outlook OAuth with Mail.Read, Mail.Send scopes | P1 |
| FR-004.4 | Support Facebook OAuth with pages scopes | P1 |
| FR-004.5 | Support Instagram OAuth with user_profile, user_media scopes | P2 |
| FR-004.6 | Support LinkedIn OAuth with profile and social scopes | P2 |

#### FR-005: OAuth Flow

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Generate OAuth state parameter for CSRF protection | P0 |
| FR-005.2 | Generate PKCE code verifier and challenge (S256 method) | P0 |
| FR-005.3 | Store state and code verifier server-side with 10-minute TTL | P0 |
| FR-005.4 | Build authorization URL with all required parameters | P0 |
| FR-005.5 | Request offline_access for refresh tokens | P0 |
| FR-005.6 | Force consent prompt to ensure refresh token | P0 |

#### FR-006: OAuth Callback

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Validate state parameter against stored value | P0 |
| FR-006.2 | Exchange authorization code for tokens | P0 |
| FR-006.3 | Include code_verifier in token exchange | P0 |
| FR-006.4 | Encrypt access and refresh tokens before storage | P0 |
| FR-006.5 | Calculate and store token expiration | P0 |
| FR-006.6 | Update existing integration or create new | P0 |
| FR-006.7 | Store token metadata (type, scope) | P1 |

#### FR-007: OAuth Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | List all OAuth integrations with status | P0 |
| FR-007.2 | Show integration expiration status | P0 |
| FR-007.3 | Refresh OAuth token using refresh_token grant | P0 |
| FR-007.4 | Disconnect integration (soft delete) | P0 |
| FR-007.5 | Test integration with provider API call | P1 |
| FR-007.6 | Revoke token with provider on disconnect | P2 |

### 5.3 Webhook Management

#### FR-008: Webhook Creation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Validate webhook URL format (must be HTTPS in production) | P0 |
| FR-008.2 | Generate signing secret (whsec_xxx format, 32 random bytes) | P0 |
| FR-008.3 | Support event types: quiz.completed, workflow.executed, task.completed, lead.created, integration.connected, integration.disconnected, all | P0 |
| FR-008.4 | Enforce plan-based webhook limits | P0 |
| FR-008.5 | Store webhook configuration in user preferences | P0 |
| FR-008.6 | Generate unique webhook ID (UUID) | P0 |

#### FR-009: Webhook Delivery

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Generate HMAC SHA-256 signature for payloads | P0 |
| FR-009.2 | Include signature in X-Webhook-Signature header | P0 |
| FR-009.3 | Use timing-safe comparison for signature verification | P0 |
| FR-009.4 | Log all delivery attempts with status | P0 |
| FR-009.5 | Capture response status code and body | P0 |
| FR-009.6 | Implement retry logic with exponential backoff | P1 |

#### FR-010: Webhook Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | List webhooks with plan limit display | P0 |
| FR-010.2 | Update webhook configuration | P0 |
| FR-010.3 | Delete webhook | P0 |
| FR-010.4 | Test webhook with sample payload | P0 |
| FR-010.5 | Regenerate webhook signing secret | P0 |
| FR-010.6 | Toggle webhook active/inactive | P0 |

#### FR-011: Webhook Monitoring

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Query webhook logs with pagination | P0 |
| FR-011.2 | Filter logs by webhookId, event, status, date range | P0 |
| FR-011.3 | Return log statistics (success rate, avg response time) | P1 |
| FR-011.4 | Manual retry of failed deliveries | P0 |
| FR-011.5 | View individual log details | P0 |

### 5.4 User Preferences

#### FR-012: Preference Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Get all user preferences | P0 |
| FR-012.2 | Update partial preferences (merge with existing) | P0 |
| FR-012.3 | Reset preferences to defaults | P0 |
| FR-012.4 | Support theme preference (light, dark, system) | P0 |
| FR-012.5 | Support notification preferences (email, browser, workflow) | P0 |
| FR-012.6 | Support default browser configuration | P1 |
| FR-012.7 | Support default workflow settings | P1 |

#### FR-013: Default Values

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Default theme: light | P0 |
| FR-013.2 | Default notifications: all enabled | P0 |
| FR-013.3 | Default browser config: null (use system) | P1 |
| FR-013.4 | Default workflow settings: null (use system) | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | API key listing latency (P95) | < 100ms | P0 |
| NFR-002 | API key save latency (P95) | < 200ms | P0 |
| NFR-003 | OAuth initiation latency | < 500ms | P0 |
| NFR-004 | Webhook delivery timeout | 10 seconds | P0 |
| NFR-005 | Webhook log query latency (P95) | < 500ms | P0 |
| NFR-006 | Preference update latency (P95) | < 100ms | P0 |
| NFR-007 | API key validation timeout | 10 seconds | P0 |
| NFR-008 | Encryption/decryption latency | < 5ms | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-009 | API keys per user | Unlimited | P0 |
| NFR-010 | OAuth integrations per user | 50+ | P1 |
| NFR-011 | Webhooks per user | Plan-based (3/10/unlimited) | P0 |
| NFR-012 | Webhook log retention | 30 days minimum | P0 |
| NFR-013 | Concurrent webhook deliveries | 100+ per second | P1 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-014 | Settings API availability | 99.9% | P0 |
| NFR-015 | Webhook delivery success rate | >= 99% (first attempt) | P0 |
| NFR-016 | OAuth token refresh reliability | >= 99.5% | P0 |
| NFR-017 | Data durability | 99.99% | P0 |
| NFR-018 | Preference sync reliability | 100% | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-019 | All API keys encrypted with AES-256-GCM | P0 |
| NFR-020 | All OAuth tokens encrypted with AES-256-GCM | P0 |
| NFR-021 | Webhook secrets generated with crypto.randomBytes (32 bytes) | P0 |
| NFR-022 | PKCE (RFC 7636) for all OAuth flows | P0 |
| NFR-023 | Timing-safe comparison for signatures | P0 |
| NFR-024 | Protected procedures for all settings endpoints | P0 |
| NFR-025 | User data isolation (userId filtering) | P0 |
| NFR-026 | Input validation via Zod schemas | P0 |
| NFR-027 | No sensitive data in error messages | P0 |
| NFR-028 | Encryption key validation on startup | P0 |

### 6.5 Compliance Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-029 | GDPR-compliant data handling | P0 |
| NFR-030 | Audit trail for credential operations | P1 |
| NFR-031 | Data export capability for user data | P1 |
| NFR-032 | Right to deletion for user preferences | P0 |

### 6.6 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-033 | Structured logging for all settings operations | P0 |
| NFR-034 | Error tracking with context | P0 |
| NFR-035 | Webhook delivery metrics | P1 |
| NFR-036 | OAuth flow success/failure tracking | P1 |
| NFR-037 | API key usage tracking | P2 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+-------------------------------------------------------------------+
|                        Client Application                          |
|  (React Frontend with Settings UI Components)                     |
+-------------------------------------------------------------------+
                               |
                               | tRPC
                               v
+-------------------------------------------------------------------+
|                      Settings Router                               |
|  +-----------------+  +----------------+  +-------------------+   |
|  | API Key Mgmt    |  | OAuth Mgmt     |  | Webhook Mgmt      |   |
|  | - listApiKeys   |  | - initiate     |  | - listWebhooks    |   |
|  | - validateApiKey|  | - callback     |  | - createWebhook   |   |
|  | - saveApiKey    |  | - refresh      |  | - testWebhook     |   |
|  | - deleteApiKey  |  | - disconnect   |  | - getWebhookLogs  |   |
|  | - testApiKey    |  | - test         |  | - retryWebhook    |   |
|  +-----------------+  +----------------+  +-------------------+   |
|                                                                   |
|  +-------------------+  +-----------------------------------+     |
|  | User Preferences  |  | Utility Functions                 |     |
|  | - getPreferences  |  | - encrypt() / decrypt()           |     |
|  | - updatePrefs     |  | - maskApiKey()                    |     |
|  | - resetToDefaults |  | - generateWebhookSecret()         |     |
|  +-------------------+  | - generateWebhookSignature()      |     |
|                         | - verifyWebhookSignature()        |     |
|                         | - generateOAuthState()            |     |
|                         | - generatePKCEVerifier()          |     |
|                         | - generatePKCEChallenge()         |     |
|                         +-----------------------------------+     |
+-------------------------------------------------------------------+
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+---------------+    +------------------+    +------------------+
| API Key       |    | OAuth State      |    | Webhook          |
| Validation    |    | Service          |    | Service          |
| Service       |    |                  |    |                  |
| - validate()  |    | - generateState()|    | - sendWebhook()  |
| - provider    |    | - set/get()      |    | - getWebhookLogs |
|   specific    |    | - PKCE helpers   |    | - getStats()     |
+---------------+    +------------------+    +------------------+
        |                      |                      |
        v                      v                      v
+---------------+    +------------------+    +------------------+
| Third-Party   |    | Memory Cache     |    | Database         |
| Provider APIs |    | (State Storage)  |    | (Drizzle ORM)    |
|               |    |                  |    |                  |
| - OpenAI      |    | - 10-min TTL     |    | - userPreferences|
| - Anthropic   |    | - PKCE storage   |    | - integrations   |
| - Stripe      |    |                  |    | - webhookLogs    |
| - etc.        |    |                  |    |                  |
+---------------+    +------------------+    +------------------+
```

### 7.2 Component Details

#### 7.2.1 Encryption Layer

**Responsibilities:**
- Encrypt sensitive data before storage
- Decrypt data for authorized access
- Validate encryption key configuration
- Handle encryption errors gracefully

**Key Functions:**
```typescript
function encrypt(text: string): string
function decrypt(encryptedText: string): string
function maskApiKey(apiKey: string): string
```

**Algorithm Details:**
- Algorithm: AES-256-GCM
- IV Length: 16 bytes (random per encryption)
- Auth Tag Length: 16 bytes
- Storage Format: `{iv}:{authTag}:{ciphertext}` (hex encoded)

#### 7.2.2 OAuth State Service

**Responsibilities:**
- Generate secure state parameters
- Generate PKCE code verifier and challenge
- Store OAuth state with TTL
- Retrieve and validate state on callback

**Key Functions:**
```typescript
function generateOAuthState(): string
function generatePKCEVerifier(): string
function generatePKCEChallenge(verifier: string): string
```

#### 7.2.3 Webhook Service

**Responsibilities:**
- Send webhook HTTP requests
- Sign payloads with HMAC SHA-256
- Log delivery attempts
- Handle retries with backoff
- Aggregate statistics

**Key Functions:**
```typescript
function sendWebhook(options): Promise<WebhookLog>
function getWebhookLogs(options): Promise<{ logs, total }>
function getWebhookStats(options): Promise<WebhookStats>
function retryWebhook(logId, userId): Promise<WebhookLog>
```

#### 7.2.4 API Key Validation Service

**Responsibilities:**
- Validate API keys against provider APIs
- Handle provider-specific authentication
- Return validation results with details
- Cache validation results

**Supported Providers:**
```typescript
type ApiKeyService =
  | 'openai'     // GET /v1/models
  | 'browserbase'// GET /v1/sessions
  | 'anthropic'  // POST /v1/messages
  | 'google'     // GET /maps/api/geocode
  | 'stripe'     // GET /v1/balance
  | 'twilio'     // GET /Accounts/{sid}
  | 'sendgrid'   // GET /v3/user/profile
  | 'gohighlevel'// GET /locations
  | 'vapi'       // GET /call
  | 'apify'      // GET /v2/users/me
  | 'custom';    // No validation
```

### 7.3 Data Flow Diagrams

#### 7.3.1 API Key Save Flow

```
User                    Server                      External API
  |                        |                            |
  |--- Save API Key ------>|                            |
  |    { service, key }    |                            |
  |                        |--- Validate Key ---------->|
  |                        |<-- Validation Result ------|
  |                        |                            |
  |                        |--- Encrypt Key             |
  |                        |    (AES-256-GCM)           |
  |                        |--- Store in DB ----------->|
  |                        |<-- Stored -----------------|
  |<-- Success ------------|                            |
```

#### 7.3.2 OAuth Flow

```
User           Client           Server              OAuth Provider
  |               |                |                       |
  |-- Connect --->|                |                       |
  |               |--- Initiate -->|                       |
  |               |                |--- Generate State     |
  |               |                |--- Generate PKCE      |
  |               |                |--- Store State        |
  |               |<-- Auth URL ---|                       |
  |               |                                        |
  |<-- Redirect --|----------------|---------------------->|
  |               |                |                       |
  |-- Authorize --|----------------|---------------------->|
  |               |                |                       |
  |<-- Callback --|----------------|<-- Code + State ------|
  |               |                |                       |
  |               |--- Callback -->|                       |
  |               |                |--- Validate State     |
  |               |                |--- Exchange Code ---->|
  |               |                |<-- Tokens ------------|
  |               |                |--- Encrypt Tokens     |
  |               |                |--- Store Integration  |
  |               |<-- Success ----|                       |
  |<-- Connected -|                |                       |
```

#### 7.3.3 Webhook Delivery Flow

```
Event Trigger          Server                    User Webhook
      |                   |                           |
      |--- Event -------->|                           |
      |                   |--- Get User Webhooks      |
      |                   |--- Filter by Event Type   |
      |                   |--- For Each Matching:     |
      |                   |    - Build Payload        |
      |                   |    - Generate Signature   |
      |                   |    - Send HTTP POST ----->|
      |                   |<-- Response --------------|
      |                   |    - Log Attempt          |
      |                   |    - Update Stats         |
      |                   |                           |
```

### 7.4 Security Architecture

| Layer | Control | Implementation |
|-------|---------|----------------|
| Transport | HTTPS/TLS | Infrastructure level |
| Authentication | Protected Procedures | tRPC middleware |
| Authorization | User ID validation | Query-level filtering |
| Encryption at Rest | AES-256-GCM | settings.ts encrypt/decrypt |
| OAuth Security | PKCE + State | oauthState.service.ts |
| Webhook Security | HMAC SHA-256 | Signature generation/verification |
| Input Validation | Zod Schemas | All endpoint inputs |
| Secret Management | Environment Variables | ENCRYPTION_KEY, OAuth secrets |

---

## 8. API Specifications

### 8.1 API Key Endpoints

#### settings.listApiKeys

**Description:** List all configured API keys (masked)

**Request:** None (uses authenticated user context)

**Response:**
```typescript
{
  apiKeys: Array<{
    service: string;
    maskedKey: string;
    isConfigured: boolean;
    createdAt: Date;
  }>;
}
```

#### settings.validateApiKey

**Description:** Validate an API key before saving

**Request:**
```typescript
{
  service: 'openai' | 'browserbase' | 'anthropic' | 'google' | 'stripe' |
           'twilio' | 'sendgrid' | 'gohighlevel' | 'vapi' | 'apify' | 'custom';
  apiKey: string;        // Required, min 1 char
  accountSid?: string;   // For Twilio
  authToken?: string;    // For Twilio
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  isValid: boolean;
  details?: {
    accountName?: string;
    accountEmail?: string;
    plan?: string;
    credits?: number;
  };
}
```

#### settings.saveApiKey

**Description:** Save an encrypted API key

**Request:**
```typescript
{
  service: ApiKeyService;
  apiKey: string;        // Required, min 1 char
  label?: string;        // Optional descriptive label
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
  service: string;
}
```

#### settings.deleteApiKey

**Description:** Delete a saved API key

**Request:**
```typescript
{
  service: ApiKeyService;
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
}
```

#### settings.testApiKey

**Description:** Test a saved API key

**Request:**
```typescript
{
  service: ApiKeyService;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  isValid: boolean;
  details?: object;
}
```

### 8.2 OAuth Endpoints

#### settings.listIntegrations

**Description:** List all OAuth integrations

**Request:** None

**Response:**
```typescript
{
  integrations: Array<{
    id: number;
    service: string;
    isActive: string;
    expiresAt: Date | null;
    metadata: string;
    createdAt: Date;
    updatedAt: Date;
    isExpired: boolean;
  }>;
}
```

#### settings.initiateOAuth

**Description:** Start OAuth authorization flow

**Request:**
```typescript
{
  provider: 'google' | 'gmail' | 'outlook' | 'facebook' | 'instagram' | 'linkedin';
}
```

**Response:**
```typescript
{
  success: true;
  authorizationUrl: string;
  state: string;
}
```

#### settings.handleOAuthCallback

**Description:** Complete OAuth flow with authorization code

**Request:**
```typescript
{
  provider: OAuthProvider;
  code: string;
  state: string;
  codeVerifier: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
  provider: string;
  expiresAt: Date | null;
}
```

#### settings.refreshOAuthToken

**Description:** Refresh an OAuth access token

**Request:**
```typescript
{
  integrationId: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
  expiresAt: Date | null;
}
```

#### settings.disconnectIntegration

**Description:** Disconnect an OAuth integration

**Request:**
```typescript
{
  integrationId: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
}
```

#### settings.testIntegration

**Description:** Test an OAuth integration

**Request:**
```typescript
{
  integrationId: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  isValid: boolean;
  isExpired?: boolean;
}
```

### 8.3 Webhook Endpoints

#### settings.listWebhooks

**Description:** List user webhooks with plan limits

**Request:** None

**Response:**
```typescript
{
  webhooks: Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
    createdAt: string;
    lastTriggeredAt: string | null;
    deliveryCount: number;
  }>;
  planLimits: {
    maxWebhooks: number;
    webhooksUsed: number;
  };
  canCreateMore: boolean;
}
```

#### settings.createWebhook

**Description:** Create a new webhook

**Request:**
```typescript
{
  name: string;           // 1-255 chars
  url: string;            // Valid URL
  events: WebhookEvent[]; // Array of event types
  description?: string;
  isActive?: boolean;     // Default: true
}
```

**Response:**
```typescript
{
  success: true;
  webhook: WebhookConfig;
  message: string;
}
```

#### settings.updateWebhook

**Description:** Update webhook configuration

**Request:**
```typescript
{
  id: string;             // UUID
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  description?: string;
  isActive?: boolean;
}
```

**Response:**
```typescript
{
  success: true;
  webhook: WebhookConfig;
  message: string;
}
```

#### settings.deleteWebhook

**Description:** Delete a webhook

**Request:**
```typescript
{
  id: string; // UUID
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
}
```

#### settings.testWebhook

**Description:** Send test payload to webhook

**Request:**
```typescript
{
  id: string; // UUID
}
```

**Response:**
```typescript
{
  success: boolean;
  statusCode?: number;
  message: string;
  responseBody?: string;
  logId?: string;
}
```

#### settings.getWebhookLogs

**Description:** Get webhook delivery logs

**Request:**
```typescript
{
  webhookId?: string;     // UUID, optional filter
  event?: string;         // Optional filter
  status?: 'pending' | 'success' | 'failed' | 'retrying' | 'permanently_failed';
  startDate?: string;     // ISO 8601 datetime
  endDate?: string;       // ISO 8601 datetime
  limit?: number;         // 1-100, default 50
  offset?: number;        // Default 0
}
```

**Response:**
```typescript
{
  logs: WebhookLog[];
  total: number;
  limit: number;
  offset: number;
}
```

#### settings.getWebhookStats

**Description:** Get webhook statistics

**Request:**
```typescript
{
  webhookId?: string;     // UUID, optional
  startDate?: string;     // ISO 8601
  endDate?: string;       // ISO 8601
}
```

**Response:**
```typescript
{
  totalDeliveries: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgResponseTime: number;
  eventBreakdown: Record<string, number>;
}
```

#### settings.retryWebhook

**Description:** Retry a failed webhook delivery

**Request:**
```typescript
{
  logId: string; // UUID
}
```

**Response:**
```typescript
{
  success: boolean;
  status: string;
  message: string;
  log: WebhookLog;
}
```

#### settings.regenerateSecret

**Description:** Regenerate webhook signing secret

**Request:**
```typescript
{
  id: string; // UUID
}
```

**Response:**
```typescript
{
  success: true;
  secret: string;
  message: string;
}
```

### 8.4 Preferences Endpoints

#### settings.getPreferences

**Description:** Get all user preferences

**Request:** None

**Response:**
```typescript
{
  id?: number;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    workflow: boolean;
  };
  defaultBrowserConfig: object | null;
  defaultWorkflowSettings: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### settings.updatePreferences

**Description:** Update user preferences

**Request:**
```typescript
{
  theme?: 'light' | 'dark' | 'system';
  notifications?: Record<string, boolean>;
  defaultBrowserConfig?: Record<string, any>;
  defaultWorkflowSettings?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: true;
  preferences: UserPreference;
  message: string;
}
```

#### settings.resetToDefaults

**Description:** Reset preferences to defaults

**Request:** None

**Response:**
```typescript
{
  success: true;
  message: string;
}
```

---

## 9. Data Models

### 9.1 User Preferences Table

```typescript
userPreferences = {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  apiKeys: text('api_keys'),              // JSON, encrypted values
  defaultBrowserConfig: text('default_browser_config'),  // JSON
  defaultWorkflowSettings: text('default_workflow_settings'),  // JSON + webhooks
  notifications: text('notifications'),   // JSON
  theme: varchar('theme', { length: 50 }).default('light'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}

// Index: (userId) unique
```

### 9.2 Integrations Table

```typescript
integrations = {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  service: varchar('service', { length: 50 }).notNull(),
  accessToken: text('access_token').notNull(),  // AES-256-GCM encrypted
  refreshToken: text('refresh_token'),           // AES-256-GCM encrypted
  expiresAt: timestamp('expires_at'),
  isActive: varchar('is_active', { length: 10 }).default('true'),
  metadata: text('metadata'),                    // JSON: tokenType, scope
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}

// Index: (userId, service) unique
```

### 9.3 Webhook Log Table

```typescript
webhookLogs = {
  id: uuid('id').primaryKey(),
  userId: integer('user_id').notNull(),
  webhookId: uuid('webhook_id').notNull(),
  event: varchar('event', { length: 100 }).notNull(),
  payload: json('payload').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  // 'pending' | 'success' | 'failed' | 'retrying' | 'permanently_failed'
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  retryCount: integer('retry_count').default(0),
  nextRetryAt: timestamp('next_retry_at'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
}

// Indexes:
// - (userId, webhookId)
// - (userId, status)
// - (createdAt) for retention cleanup
```

### 9.4 API Key Storage Schema

```typescript
// Stored in userPreferences.apiKeys as JSON string
type ApiKeysStorage = {
  [service: string]: {
    key: string;      // AES-256-GCM encrypted
    label?: string;
    updatedAt: string; // ISO 8601
  };
};

// Example encrypted value format:
// "a1b2c3d4...:e5f6g7h8...:i9j0k1l2..." (iv:authTag:ciphertext)
```

### 9.5 Webhook Configuration Schema

```typescript
// Stored in userPreferences.defaultWorkflowSettings.webhooks
type WebhookConfig = {
  id: string;           // UUID
  name: string;
  url: string;
  events: WebhookEvent[];
  description?: string;
  secret: string;       // "whsec_xxx" format
  isActive: boolean;
  createdAt: string;    // ISO 8601
  updatedAt?: string;   // ISO 8601
  lastTriggeredAt: string | null;
  deliveryCount: number;
};

type WebhookEvent =
  | 'quiz.completed'
  | 'workflow.executed'
  | 'task.completed'
  | 'lead.created'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'all';
```

### 9.6 OAuth Configuration Schema

```typescript
// Server-side OAuth provider configs
type OAuthConfig = {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

// Stored OAuth state
type OAuthStateData = {
  userId: string;
  provider: string;
  codeVerifier: string;
};
```

---

## 10. UI/UX Requirements

### 10.1 Settings Navigation

#### 10.1.1 Tab Structure
Based on the settings tour configuration:

1. **API Keys** (`data-tour="api-keys"`)
   - List of configured services with status
   - Add/Edit/Delete API keys
   - Test key functionality

2. **OAuth Connections** (`data-tour="oauth-connections"`)
   - Connected accounts with provider icons
   - Connect/Disconnect buttons
   - Refresh/Test actions

3. **Webhooks** (`data-tour="webhooks"`)
   - Webhook list with status indicators
   - Create/Edit/Delete webhooks
   - Delivery logs and statistics

4. **General Preferences**
   - Theme selector
   - Notification toggles
   - Default configurations

### 10.2 API Key Management UI

#### 10.2.1 API Keys List
- Grid/list of supported services with icons
- Status indicators: Configured (green), Not configured (gray)
- Masked key display (sk-xxxx...xxxx)
- Action buttons: Test, Edit, Delete

#### 10.2.2 Add/Edit API Key Modal
- Service dropdown/selector
- API key input (password type, toggle visibility)
- Optional label input
- Validate button with loading state
- Validation result display
- Save/Cancel buttons

#### 10.2.3 Twilio Special Handling
- Account SID input field
- Auth Token input field
- Combined validation

### 10.3 OAuth Integrations UI

#### 10.3.1 Integration Cards
- Provider logo and name
- Connection status (Connected/Disconnected)
- Connected account info (email, name)
- Expiration warning if near expiry
- Action buttons: Connect, Disconnect, Refresh, Test

#### 10.3.2 OAuth Flow
- Connect button opens provider popup
- Loading state during authorization
- Success/error toast notifications
- Automatic page refresh on completion

### 10.4 Webhook Management UI

#### 10.4.1 Webhooks List
- Webhook name and URL (truncated)
- Event types badges
- Active/Inactive toggle
- Success rate indicator
- Last triggered timestamp
- Actions: Edit, Test, Delete, View Logs

#### 10.4.2 Create/Edit Webhook Modal
- Name input
- URL input with validation
- Event type multi-select
- Description textarea (optional)
- Active toggle
- Signing secret display (create only)
- Regenerate secret button (edit only)

#### 10.4.3 Webhook Logs Panel
- Filterable table with columns:
  - Timestamp
  - Event type
  - Status (color-coded)
  - Response code
  - Response time
- Expandable row for payload/response details
- Retry button for failed deliveries
- Pagination controls

#### 10.4.4 Webhook Statistics Dashboard
- Total deliveries card
- Success rate gauge
- Event type breakdown chart
- Response time trend
- Time range selector

### 10.5 Preferences UI

#### 10.5.1 Theme Selector
- Visual preview cards for light/dark/system
- Immediate preview on hover
- Selected state indicator

#### 10.5.2 Notification Toggles
- Email notifications switch
- Browser notifications switch
- Workflow notifications switch
- Per-category expansion (future)

#### 10.5.3 Default Settings
- Browser configuration accordion
- Workflow settings accordion
- JSON editor for advanced users
- Reset to defaults button with confirmation

### 10.6 Settings Tour

Based on `settingsTour.ts`:

| Step | Target | Title | Description |
|------|--------|-------|-------------|
| 1 | settings-tabs | Settings Navigation | Overview of settings sections |
| 2 | api-keys | API Keys Configuration | Importance of API keys for functionality |
| 3 | oauth-connections | OAuth Integrations | Third-party service connections |
| 4 | webhooks | Webhook Setup | Real-time event notifications |
| 5 | save-settings | Save Your Configuration | Reminder to save settings |

**Tour Properties:**
- Estimated time: 2 minutes
- Category: getting-started
- Spotlight padding: 20px on API keys step

---

## 11. Dependencies & Integrations

### 11.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router with auth middleware |
| Database | `server/db/index.ts` | Drizzle ORM for PostgreSQL |
| Schema | `drizzle/schema.ts` | userPreferences, integrations tables |
| API Key Validation | `server/services/apiKeyValidation.service.ts` | Provider-specific validation |
| OAuth State | `server/services/oauthState.service.ts` | PKCE and state management |
| Validation Cache | `server/services/validationCache.service.ts` | API key validation caching |
| Webhook Service | `server/services/webhook.service.ts` | Delivery and logging |

### 11.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| zod | ^3.x | Input validation schemas |
| drizzle-orm | ^0.30.x | Database ORM |
| crypto | Node.js built-in | Encryption, hashing, random |
| @trpc/server | ^11.x | API framework |

### 11.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | Data persistence | Yes |
| Redis | OAuth state cache (optional) | Recommended |
| OpenAI API | API key validation | If using |
| Anthropic API | API key validation | If using |
| Google APIs | OAuth + API validation | If using |
| Microsoft Graph | Outlook OAuth | If using |
| Facebook Graph | Facebook OAuth | If using |
| Instagram API | Instagram OAuth | If using |
| LinkedIn API | LinkedIn OAuth | If using |
| Stripe API | Payment key validation | If using |
| Twilio API | Communication validation | If using |
| SendGrid API | Email key validation | If using |
| GoHighLevel API | CRM key validation | If using |
| Vapi API | Voice AI validation | If using |
| Apify API | Scraping validation | If using |
| Browserbase API | Browser automation validation | If using |

### 11.4 Environment Variables

```bash
# Required for Encryption
ENCRYPTION_KEY=              # 64-char hex string (openssl rand -hex 32)

# OAuth Providers (configure as needed)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=

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

# Database
DATABASE_URL=                # PostgreSQL connection string
```

### 11.5 Related PRDs

| PRD | Relationship |
|-----|--------------|
| PRD-001 AI Agent Orchestration | Uses API keys for LLM providers |
| PRD-002 Browser Automation | Uses Browserbase API key |
| PRD-005 Email Integration | Uses Gmail/Outlook OAuth |
| PRD-007 Webhooks Management | Core webhook functionality |
| PRD-012 Security Compliance | Encryption and access control |

---

## 12. Release Criteria

### 12.1 Pre-Release Checklist

#### Security Testing

- [ ] Encryption implementation verified (AES-256-GCM)
- [ ] PKCE OAuth flow tested against all providers
- [ ] Webhook signature verification tested
- [ ] Input validation comprehensive
- [ ] No secrets in logs or error messages
- [ ] User data isolation verified

#### Functional Testing

- [ ] All API key services can be saved and validated
- [ ] All OAuth providers complete authorization flow
- [ ] Webhook creation, test, and delivery work
- [ ] Preference updates persist correctly
- [ ] Reset to defaults clears appropriate data
- [ ] Settings tour completes without errors

#### Integration Testing

- [ ] API key validation works for all providers
- [ ] OAuth token refresh works
- [ ] Webhook delivery logs recorded correctly
- [ ] Database operations handle edge cases
- [ ] Error handling provides actionable messages

#### Performance Testing

- [ ] API endpoints respond within SLA
- [ ] Encryption/decryption under 5ms
- [ ] Webhook delivery under 10 seconds
- [ ] Settings page loads under 1 second

### 12.2 Go-Live Criteria

| Criterion | Target | Verification |
|-----------|--------|--------------|
| Critical bugs | 0 | Bug tracker |
| High-priority bugs | 0 | Bug tracker |
| Security vulnerabilities | 0 | Security scan |
| Test coverage | >= 80% | Coverage report |
| Documentation | Complete | Review |
| Stakeholder sign-off | Obtained | Approval records |

### 12.3 Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `settings.apiKeys.enabled` | true | Enable API key management |
| `settings.oauth.enabled` | true | Enable OAuth integrations |
| `settings.webhooks.enabled` | true | Enable webhook management |
| `settings.tour.enabled` | true | Enable settings tour |
| `settings.advanced.enabled` | false | Enable advanced settings |

### 12.4 Rollout Plan

| Phase | Scope | Criteria |
|-------|-------|----------|
| Phase 1 | Internal testing | All tests pass |
| Phase 2 | Beta users (10%) | < 1% error rate |
| Phase 3 | Gradual rollout (25%, 50%, 75%) | < 0.5% error rate |
| Phase 4 | General availability | Full monitoring |

### 12.5 Post-Release Monitoring

| Metric | Alert Threshold | Response Time |
|--------|-----------------|---------------|
| API key save errors | > 1% | 15 minutes |
| OAuth failures | > 5% | 15 minutes |
| Webhook delivery failures | > 2% | 30 minutes |
| Settings API latency P95 | > 500ms | 1 hour |
| Encryption errors | Any | Immediate |

### 12.6 Rollback Plan

| Trigger | Action |
|---------|--------|
| > 5% error rate | Disable new features, route to fallback |
| Security incident | Immediate disable, investigate |
| Data corruption | Restore from backup, disable writes |
| Provider outages | Enable fallback modes |

---

## Appendix A: Encryption Implementation

### A.1 Algorithm Details

```typescript
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;  // 128 bits
const KEY_LENGTH = 32;  // 256 bits

// Key derivation from hex string
const key = Buffer.from(ENCRYPTION_KEY, "hex");  // 64 chars = 32 bytes

// Encryption
const iv = crypto.randomBytes(IV_LENGTH);
const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
let encrypted = cipher.update(plaintext, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag();

// Storage format
const stored = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

// Decryption
const [ivHex, authTagHex, encryptedHex] = stored.split(':');
const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

### A.2 Key Generation

```bash
# Generate ENCRYPTION_KEY
openssl rand -hex 32
# Output: 64-character hexadecimal string
```

---

## Appendix B: OAuth Provider Details

### B.1 Provider Configurations

| Provider | Auth URL | Token URL | Scopes |
|----------|----------|-----------|--------|
| Google | accounts.google.com/o/oauth2/v2/auth | oauth2.googleapis.com/token | openid email profile |
| Gmail | accounts.google.com/o/oauth2/v2/auth | oauth2.googleapis.com/token | gmail.readonly gmail.send |
| Outlook | login.microsoftonline.com/.../authorize | login.microsoftonline.com/.../token | openid email profile offline_access Mail.Read Mail.Send |
| Facebook | www.facebook.com/v18.0/dialog/oauth | graph.facebook.com/v18.0/oauth/access_token | email public_profile pages_show_list pages_read_engagement |
| Instagram | api.instagram.com/oauth/authorize | api.instagram.com/oauth/access_token | user_profile user_media |
| LinkedIn | www.linkedin.com/oauth/v2/authorization | www.linkedin.com/oauth/v2/accessToken | r_liteprofile r_emailaddress w_member_social |

### B.2 PKCE Implementation

```typescript
// Code verifier: 32 random bytes, base64url encoded
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// Code challenge: SHA-256 hash of verifier, base64url encoded
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Authorization URL includes:
// code_challenge={codeChallenge}
// code_challenge_method=S256

// Token exchange includes:
// code_verifier={codeVerifier}
```

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **AES-256-GCM** | Advanced Encryption Standard with 256-bit key in Galois/Counter Mode |
| **Auth Tag** | Authentication tag for GCM mode ensuring data integrity |
| **CSRF** | Cross-Site Request Forgery attack |
| **IV** | Initialization Vector for encryption randomization |
| **OAuth** | Open Authorization protocol for third-party access |
| **PKCE** | Proof Key for Code Exchange (RFC 7636) |
| **State Parameter** | Random value for OAuth CSRF protection |
| **Webhook** | HTTP callback for event notifications |
| **HMAC** | Hash-based Message Authentication Code |
| **tRPC** | TypeScript RPC framework for type-safe APIs |
| **Zod** | TypeScript-first schema validation library |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Security, Product, Design
