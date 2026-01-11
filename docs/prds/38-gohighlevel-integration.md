# PRD-038: GoHighLevel Integration

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Priority:** Critical (P0)
**Feature Location:** `server/_core/dataApi.ts`, `server/services/ghl.service.ts`, `server/workflows/ghl/`

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

The GoHighLevel (GHL) Integration is a comprehensive feature that enables Bottleneck-Bots users to connect, synchronize, and automate their GoHighLevel CRM operations. This integration serves as the primary CRM backbone for agency automation workflows, providing 48+ distinct automation functions for contact management, pipeline operations, campaign execution, workflow triggers, and multi-location account management.

### 1.2 Feature Summary

| Capability | Description |
|------------|-------------|
| **OAuth 2.0 Authentication** | Secure token-based authentication with automatic refresh and multi-tenant isolation |
| **Contact Management** | Full CRUD operations for contacts including bulk import/export, tagging, and custom fields |
| **Pipeline Automation** | Opportunity management, stage transitions, and pipeline analytics |
| **Lead Capture** | Inbound webhook processing for form submissions, appointments, and events |
| **Workflow Integration** | Trigger GHL workflows from external events and vice versa |
| **Multi-Tenant Isolation** | Agency-level and location-level data separation with secure credential storage |
| **Campaign Operations** | Add/remove contacts from campaigns, track performance, and manage sequences |
| **Real-Time Sync** | Bidirectional synchronization via webhooks with sub-5-second latency |

### 1.3 Target Users

| User Type | Primary Use Cases |
|-----------|-------------------|
| **Agency Owners** | Multi-location management, client onboarding automation, cross-account reporting |
| **Marketing Managers** | Campaign automation, lead nurturing sequences, engagement tracking |
| **Sales Representatives** | Pipeline management, opportunity tracking, contact engagement |
| **Operations Teams** | Workflow automation, data synchronization, reporting |
| **System Administrators** | Integration setup, credential management, access control |

### 1.4 Business Context

GoHighLevel is the dominant CRM platform for marketing agencies, with over 1 million active locations. Bottleneck-Bots serves agencies that rely heavily on GHL for their operations. This integration is critical for:

- **Market Fit**: 85%+ of target customers use GHL as their primary CRM
- **Competitive Advantage**: Deep GHL integration differentiates from competitors
- **Revenue Driver**: Premium integration features drive subscription upgrades
- **Retention**: CRM integration creates significant switching costs

---

## 2. Problem Statement

### 2.1 Current Challenges

| Challenge | Description | Impact |
|-----------|-------------|--------|
| **Manual GHL Operations** | Users must manually perform repetitive CRM tasks in GHL UI | 15-20 hours/week wasted per agency |
| **Fragmented Automation** | Third-party tools lack deep GHL integration | 40% failed automation attempts |
| **No Unified Control** | Managing multiple GHL locations requires context switching | 30% productivity loss |
| **Data Silos** | GHL data not accessible to other automation workflows | Limited automation scope |
| **Credential Complexity** | Managing OAuth tokens across locations is error-prone | 25% of integrations break monthly |
| **Webhook Unreliability** | Missed GHL events cause data inconsistencies | 10% event loss rate |

### 2.2 User Pain Points

**Agency Owners:**
- "I manage 50+ GHL locations and spend hours switching between accounts"
- "When a lead comes in, I need it to trigger actions in multiple systems automatically"
- "My team can't access GHL data from our automation platform"

**Marketing Managers:**
- "Adding contacts to campaigns manually takes forever"
- "I can't see which automations are working without logging into each location"
- "Pipeline updates don't sync with our other tools"

**Sales Representatives:**
- "I miss opportunities because I don't see GHL updates in real-time"
- "Moving contacts through stages requires too many clicks"
- "I can't track engagement across all my assigned locations"

**Operations Teams:**
- "GHL webhook delivery is inconsistent; we miss important events"
- "There's no audit trail for GHL operations"
- "Bulk operations on contacts are tedious and error-prone"

### 2.3 Business Impact

| Problem Area | Current State | Target State | Business Value |
|--------------|---------------|--------------|----------------|
| Manual Operations | 15-20 hrs/week | <2 hrs/week | $50K+ annual savings per agency |
| Failed Automations | 40% failure rate | <5% failure rate | 8x improvement in reliability |
| Event Processing | 10% loss rate | <0.1% loss rate | 100x improvement in data integrity |
| Multi-location Overhead | 30% productivity loss | <5% overhead | 6x productivity gain |
| Integration Setup | 4-8 hours | <30 minutes | 16x faster time-to-value |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| ID | Goal | Description | Priority |
|----|------|-------------|----------|
| **G1** | API Coverage | Provide complete API coverage for all GHL automation needs (48+ functions) | P0 |
| **G2** | Real-Time Sync | Enable real-time webhook synchronization with GHL events (<5s latency) | P0 |
| **G3** | Multi-Tenant Support | Support agency and location-level multi-tenancy with strict isolation | P0 |
| **G4** | OAuth Management | Implement secure OAuth 2.0 with automatic token refresh | P0 |
| **G5** | Workflow Integration | Integrate GHL actions as first-class workflow nodes | P1 |
| **G6** | Bulk Operations | Support high-volume bulk operations (10K+ records) | P1 |
| **G7** | Error Recovery | Implement comprehensive error handling with automatic retry | P1 |

### 3.2 Success Metrics (KPIs)

#### API Performance Metrics

| Metric | Target | Measurement Method | Threshold |
|--------|--------|-------------------|-----------|
| API Success Rate | >= 99.9% | Successful GHL API calls / Total calls | Alert at <99.5% |
| API Response Time (P50) | < 150ms | Server-side API latency | Alert at >200ms |
| API Response Time (P95) | < 500ms | Server-side API latency | Alert at >750ms |
| API Response Time (P99) | < 1000ms | Server-side API latency | Alert at >1500ms |
| Rate Limit Compliance | 100% | Requests within GHL limits | Alert at any violation |

#### Webhook Performance Metrics

| Metric | Target | Measurement Method | Threshold |
|--------|--------|-------------------|-----------|
| Webhook Processing Latency | < 5s | Time from receipt to action completion | Alert at >10s |
| Webhook Delivery Rate | >= 99.9% | Successfully processed / Total received | Alert at <99.5% |
| Event Deduplication Accuracy | 100% | Duplicate events correctly identified | Alert at any false negative |
| Webhook Queue Depth | < 100 | Average items in processing queue | Alert at >500 |

#### OAuth & Security Metrics

| Metric | Target | Measurement Method | Threshold |
|--------|--------|-------------------|-----------|
| Token Refresh Success | 100% | Successful refreshes without user intervention | Alert at any failure |
| Token Expiration Buffer | >= 5 min | Time before expiry when refresh triggered | Alert at <2 min |
| Credential Encryption Coverage | 100% | All stored credentials encrypted | Alert at any unencrypted |
| Multi-Tenant Isolation | 100% | Cross-tenant access attempts blocked | Alert at any violation |

#### User Adoption Metrics

| Metric | Target | Measurement Method | Threshold |
|--------|--------|-------------------|-----------|
| GHL Connection Rate | >= 80% | Users with active GHL connection | Alert at <70% |
| Daily Active Integrations | >= 60% | Connected accounts with daily activity | Alert at <50% |
| Automation Functions Used | >= 15 | Average distinct functions per account | Alert at <10 |
| Integration Retention | >= 95% | Connected accounts remaining connected (30-day) | Alert at <90% |

#### Business Metrics

| Metric | Target | Measurement Method | Threshold |
|--------|--------|-------------------|-----------|
| Time Saved per User | >= 10 hrs/week | Survey + automation logs | Alert at <5 hrs |
| Support Tickets (Integration) | < 5% of users | Support ticket categorization | Alert at >10% |
| Upsell Conversion (GHL features) | >= 20% | Free to paid with GHL features | Alert at <15% |

---

## 4. User Stories

### 4.1 Authentication & Setup

#### US-001: OAuth Connection
**As a** new user
**I want to** connect my GoHighLevel account using OAuth
**So that** I can authorize Bottleneck-Bots to access my GHL data securely

**Acceptance Criteria:**
- One-click OAuth flow initiates GHL authorization
- User can select specific locations to authorize
- Scopes are clearly displayed before authorization
- Connection status is visible in settings
- Revocation is possible at any time

**Technical Notes:**
- Implements OAuth 2.0 authorization code flow
- Stores encrypted refresh tokens per location
- Supports agency-level and location-level tokens

#### US-002: Multi-Location Setup
**As an** agency owner with multiple GHL locations
**I want to** connect and manage all my locations from one interface
**So that** I can automate operations across my entire agency

**Acceptance Criteria:**
- View all connected locations in a dashboard
- Add/remove locations individually
- Set location-specific configurations
- View connection health for each location
- Bulk operations span selected locations

#### US-003: API Key Validation
**As a** user setting up GHL integration
**I want to** validate my API key before saving
**So that** I know the integration will work correctly

**Acceptance Criteria:**
- Real-time validation against GHL API
- Clear success/failure messaging
- Display account information on success
- Suggest fixes for common errors
- Support for both API v1 and v2 keys

### 4.2 Contact Management

#### US-004: Contact Synchronization
**As a** marketing manager
**I want to** sync contacts between GHL and Bottleneck-Bots
**So that** I have up-to-date contact data across both platforms

**Acceptance Criteria:**
- Bidirectional sync of contact records
- Configurable sync frequency (real-time, hourly, daily)
- Field mapping configuration
- Conflict resolution rules
- Sync status and history visible

#### US-005: Bulk Contact Import
**As an** operations manager
**I want to** import thousands of contacts into GHL
**So that** I can migrate data from other systems efficiently

**Acceptance Criteria:**
- Support CSV upload up to 50,000 records
- Field mapping with preview
- Duplicate detection and handling
- Progress tracking for large imports
- Error report with row-level details

#### US-006: Contact Tagging Automation
**As a** sales representative
**I want to** automatically tag contacts based on their behavior
**So that** I can segment my audience without manual work

**Acceptance Criteria:**
- Define tag rules based on contact attributes
- Apply tags based on workflow triggers
- Bulk tag/untag operations
- Tag synchronization with GHL
- Tag history and audit trail

#### US-007: Custom Field Management
**As an** administrator
**I want to** manage GHL custom fields through Bottleneck-Bots
**So that** I can maintain consistent data structures

**Acceptance Criteria:**
- View all custom fields per location
- Create new custom fields
- Map custom fields to workflow variables
- Update custom field values via automation
- Validate field types and formats

### 4.3 Pipeline Automation

#### US-008: Pipeline Stage Transitions
**As a** sales representative
**I want to** automatically move contacts through pipeline stages
**So that** my pipeline reflects real engagement without manual updates

**Acceptance Criteria:**
- Define stage transition rules
- Trigger transitions from workflows
- Support conditional logic
- Update opportunity values on transition
- Notify relevant team members

#### US-009: Opportunity Management
**As a** sales manager
**I want to** create and update opportunities automatically
**So that** my team's pipeline is always accurate

**Acceptance Criteria:**
- Create opportunities from workflow triggers
- Update opportunity fields programmatically
- Assign opportunities to team members
- Set expected close dates and values
- Track opportunity history

#### US-010: Pipeline Analytics
**As an** agency owner
**I want to** access pipeline analytics across all locations
**So that** I can track performance without logging into each account

**Acceptance Criteria:**
- Aggregate pipeline metrics across locations
- Filter by date range, stage, and owner
- Compare performance between locations
- Export analytics data
- Schedule automated reports

### 4.4 Campaign Operations

#### US-011: Campaign Contact Management
**As a** marketing manager
**I want to** add/remove contacts from campaigns automatically
**So that** leads are nurtured without manual intervention

**Acceptance Criteria:**
- Add contacts to campaigns via workflow
- Remove contacts based on conditions
- Pause/resume campaign for specific contacts
- Track campaign membership history
- Handle campaign enrollment limits

#### US-012: Campaign Performance Tracking
**As a** marketing analyst
**I want to** track campaign performance metrics
**So that** I can optimize our marketing efforts

**Acceptance Criteria:**
- Retrieve campaign statistics via API
- Track open rates, click rates, conversions
- Compare performance across campaigns
- Set up performance alerts
- Export data for analysis

### 4.5 Workflow Integration

#### US-013: Trigger GHL Workflows
**As an** automation specialist
**I want to** trigger GHL workflows from external events
**So that** my automations span multiple platforms

**Acceptance Criteria:**
- Trigger any GHL workflow via API
- Pass dynamic data to workflow variables
- Track workflow execution status
- Handle workflow errors gracefully
- Support workflow chaining

#### US-014: GHL Event Webhooks
**As a** developer
**I want to** receive real-time GHL events via webhooks
**So that** I can build responsive automations

**Acceptance Criteria:**
- Receive all GHL event types
- Webhook signature verification
- Event filtering and routing
- Retry logic for failed deliveries
- Event history and replay

#### US-015: Workflow Node Integration
**As a** workflow designer
**I want to** use GHL actions as workflow nodes
**So that** I can build complex automations visually

**Acceptance Criteria:**
- GHL nodes available in workflow builder
- Intuitive configuration for each action
- Real-time validation of node configuration
- Preview of expected results
- Error handling for failed nodes

### 4.6 Lead Capture

#### US-016: Form Submission Processing
**As a** marketing manager
**I want to** automatically process GHL form submissions
**So that** new leads are immediately added to my automation workflows

**Acceptance Criteria:**
- Receive form submissions via webhook
- Map form fields to contact properties
- Trigger workflows on submission
- Deduplicate existing contacts
- Track submission sources

#### US-017: Appointment Events
**As a** service business owner
**I want to** receive appointment events from GHL
**So that** I can trigger pre-appointment and follow-up automations

**Acceptance Criteria:**
- Receive appointment created/updated/cancelled events
- Access full appointment details
- Trigger workflows based on appointment type
- Handle rescheduling logic
- Send automated reminders

### 4.7 Multi-Tenant Operations

#### US-018: Agency-Level Management
**As an** agency owner
**I want to** manage all client subaccounts from one interface
**So that** I can efficiently serve all my clients

**Acceptance Criteria:**
- View all subaccounts in dashboard
- Switch between subaccounts seamlessly
- Execute bulk operations across subaccounts
- Maintain strict data isolation
- Track usage per subaccount

#### US-019: Subaccount Creation
**As an** agency administrator
**I want to** create new GHL subaccounts programmatically
**So that** I can automate client onboarding

**Acceptance Criteria:**
- Create subaccounts via API
- Apply default configurations
- Copy templates to new accounts
- Set up initial users
- Track creation status

---

## 5. Functional Requirements

### 5.1 Must Have (P0)

#### 5.1.1 OAuth Authentication

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-001 | OAuth 2.0 Flow | Implement standard OAuth 2.0 authorization code flow with PKCE |
| FR-002 | Token Storage | Securely store access and refresh tokens with AES-256 encryption |
| FR-003 | Token Refresh | Automatically refresh tokens 5 minutes before expiration |
| FR-004 | Multi-Location Auth | Support authorization for multiple GHL locations per user |
| FR-005 | Scope Management | Request and display minimal required scopes |
| FR-006 | Token Revocation | Allow users to revoke access tokens |

#### 5.1.2 Contact Management

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-007 | Contact CRUD | Full create, read, update, delete operations for contacts |
| FR-008 | Bulk Import | Support bulk contact import up to 50,000 records |
| FR-009 | Bulk Export | Export contacts to CSV with field selection |
| FR-010 | Contact Search | Search contacts by name, email, phone, tags, custom fields |
| FR-011 | Tag Management | Add, remove, and list tags for contacts |
| FR-012 | Custom Fields | Read and write custom field values |
| FR-013 | Activity History | Retrieve contact activity timeline |
| FR-014 | Contact Merge | Merge duplicate contacts |

#### 5.1.3 Pipeline Operations

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-015 | Opportunity CRUD | Create, read, update, delete opportunities |
| FR-016 | Stage Management | Move opportunities between pipeline stages |
| FR-017 | Pipeline Listing | List all pipelines and stages per location |
| FR-018 | Opportunity Assignment | Assign opportunities to team members |
| FR-019 | Value Tracking | Update opportunity monetary values |

#### 5.1.4 Webhook Processing

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-020 | Webhook Endpoint | Expose secure endpoints for GHL webhooks |
| FR-021 | Signature Verification | Validate webhook signatures for security |
| FR-022 | Event Processing | Process all GHL event types |
| FR-023 | Event Routing | Route events to appropriate handlers |
| FR-024 | Retry Logic | Implement exponential backoff for failed processing |
| FR-025 | Dead Letter Queue | Store failed events for manual review |

#### 5.1.5 Multi-Tenant Isolation

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-026 | Location Isolation | Strict data isolation between GHL locations |
| FR-027 | Agency Isolation | Strict data isolation between agencies |
| FR-028 | Credential Isolation | Location-specific credential storage |
| FR-029 | Audit Logging | Log all cross-tenant access attempts |
| FR-030 | Access Control | Location-level permission enforcement |

### 5.2 Should Have (P1)

#### 5.2.1 Campaign Operations

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-031 | Campaign Enrollment | Add contacts to campaigns via API |
| FR-032 | Campaign Removal | Remove contacts from campaigns |
| FR-033 | Campaign Pause | Pause campaigns for specific contacts |
| FR-034 | Campaign Stats | Retrieve campaign performance metrics |
| FR-035 | Campaign Creation | Create new campaigns via API |

#### 5.2.2 Workflow Triggers

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-036 | Workflow Execution | Trigger GHL workflows via API |
| FR-037 | Variable Passing | Pass dynamic data to workflow variables |
| FR-038 | Execution Tracking | Track workflow execution status |
| FR-039 | Error Handling | Handle workflow execution failures |

#### 5.2.3 Appointment Management

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-040 | Appointment CRUD | Create, read, update, delete appointments |
| FR-041 | Calendar Availability | Check calendar availability |
| FR-042 | Appointment Events | Process appointment webhooks |
| FR-043 | Reminder Config | Configure appointment reminders |

#### 5.2.4 Communication

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-044 | SMS via GHL | Send SMS messages through GHL |
| FR-045 | Email via GHL | Send emails through GHL templates |
| FR-046 | Message Status | Track message delivery status |
| FR-047 | Template Management | Retrieve and use GHL templates |

### 5.3 Nice to Have (P2)

#### 5.3.1 Advanced Features

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-048 | Funnel Operations | Manage funnels and pages |
| FR-049 | Social Planner | Schedule social media posts |
| FR-050 | Reputation Management | Manage reviews and responses |
| FR-051 | Form Builder | Create and manage forms |
| FR-052 | Invoice Management | Create and track invoices |
| FR-053 | Membership Sites | Manage membership access |
| FR-054 | Call Recording | Access call recordings |
| FR-055 | Conversation Inbox | Interact with GHL conversations |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-001 | API Response Time (P50) | < 150ms | Server-side latency |
| NFR-002 | API Response Time (P95) | < 500ms | Server-side latency |
| NFR-003 | Webhook Processing | < 5s | End-to-end latency |
| NFR-004 | Bulk Operation Throughput | 10,000 records/min | Records processed |
| NFR-005 | Concurrent Connections | 100+ per location | Simultaneous requests |
| NFR-006 | Token Refresh Latency | < 1s | Refresh completion time |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-007 | Locations per Agency | 500+ | Support large agency accounts |
| NFR-008 | Contacts per Location | 1M+ | Handle enterprise volumes |
| NFR-009 | Webhooks per Minute | 10,000+ | Peak event processing |
| NFR-010 | Concurrent Users | 10,000+ | Active integrations |
| NFR-011 | Horizontal Scaling | Auto-scale | Based on load |

### 6.3 Security Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-012 | Encryption at Rest | AES-256-GCM for all credentials |
| NFR-013 | Encryption in Transit | TLS 1.3 for all API calls |
| NFR-014 | OAuth Security | PKCE for authorization flow |
| NFR-015 | Webhook Authentication | HMAC signature verification |
| NFR-016 | IP Allowlisting | Support for webhook IP restrictions |
| NFR-017 | Audit Logging | Log all GHL operations with user context |
| NFR-018 | Credential Rotation | Support for key rotation without downtime |
| NFR-019 | Data Isolation | Strict multi-tenant isolation |
| NFR-020 | Access Control | Role-based permission enforcement |

### 6.4 Reliability Requirements

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-021 | API Availability | 99.9% | Excludes GHL outages |
| NFR-022 | Webhook Delivery | 99.99% | With retry logic |
| NFR-023 | Token Refresh Success | 100% | Automatic refresh |
| NFR-024 | Data Consistency | 99.99% | Sync accuracy |
| NFR-025 | Recovery Time | < 5 min | From failures |

### 6.5 Maintainability Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-026 | API Versioning | Support multiple GHL API versions |
| NFR-027 | Feature Flags | Toggle features without deployment |
| NFR-028 | Configuration | Externalized configuration |
| NFR-029 | Monitoring | Comprehensive observability |
| NFR-030 | Documentation | API documentation and examples |

---

## 7. Technical Architecture

### 7.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Bottleneck-Bots Platform                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    GHL Integration Layer                         │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │   ┌─────────────┐   ┌─────────────┐   ┌───────────────────┐     │   │
│  │   │   OAuth     │   │   API       │   │     Webhook       │     │   │
│  │   │   Manager   │   │   Client    │   │     Processor     │     │   │
│  │   │             │   │             │   │                   │     │   │
│  │   │ - Auth Flow │   │ - REST Ops  │   │ - Event Receive   │     │   │
│  │   │ - Token     │   │ - Rate Limit│   │ - Signature Check │     │   │
│  │   │   Storage   │   │ - Retry     │   │ - Event Route     │     │   │
│  │   │ - Refresh   │   │ - Circuit   │   │ - Dead Letter     │     │   │
│  │   │             │   │   Breaker   │   │   Queue           │     │   │
│  │   └─────────────┘   └─────────────┘   └───────────────────┘     │   │
│  │                                                                   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                     Domain Services                               │   │
│  │                                                                   │   │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │   │  Contact  │  │ Campaign  │  │ Pipeline  │  │ Workflow  │    │   │
│  │   │  Service  │  │  Service  │  │  Service  │  │  Service  │    │   │
│  │   └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  │                                                                   │   │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │   │Subaccount │  │Appointment│  │   SMS/    │  │  Webhook  │    │   │
│  │   │  Service  │  │  Service  │  │  Email    │  │  Routing  │    │   │
│  │   └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  │                                                                   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                Infrastructure Layer                               │   │
│  │                                                                   │   │
│  │   ┌───────────────────────────────────────────────────────────┐ │   │
│  │   │              Rate Limiter & Request Queue                  │ │   │
│  │   │                                                            │ │   │
│  │   │  - Token Bucket Algorithm (per location)                   │ │   │
│  │   │  - Priority Queue for Critical Operations                  │ │   │
│  │   │  - Automatic Backoff on 429 Responses                      │ │   │
│  │   │  - Distributed Rate Limiting via Redis                     │ │   │
│  │   └───────────────────────────────────────────────────────────┘ │   │
│  │                                                                   │   │
│  │   ┌───────────────────────────────────────────────────────────┐ │   │
│  │   │              Credential Vault                               │ │   │
│  │   │                                                            │ │   │
│  │   │  - AES-256-GCM Encryption                                  │ │   │
│  │   │  - Per-Location Token Storage                              │ │   │
│  │   │  - Automatic Key Rotation                                  │ │   │
│  │   │  - Multi-Tenant Isolation                                  │ │   │
│  │   └───────────────────────────────────────────────────────────┘ │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / OAuth 2.0
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GoHighLevel API                                 │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Contacts   │  │  Campaigns  │  │ Opportunities│  │  Workflows  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │Appointments │  │   Forms     │  │   Funnels   │  │ Subaccounts │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Specifications

#### 7.2.1 OAuth Manager

```typescript
interface OAuthManager {
  // Initialize OAuth flow
  initiateAuthorization(config: {
    userId: string;
    redirectUri: string;
    scopes: GHLScope[];
    locationId?: string;
  }): Promise<{ authorizationUrl: string; state: string }>;

  // Handle OAuth callback
  handleCallback(params: {
    code: string;
    state: string;
  }): Promise<OAuthTokenSet>;

  // Get valid access token (auto-refresh if needed)
  getAccessToken(locationId: string): Promise<string>;

  // Revoke access
  revokeAccess(locationId: string): Promise<void>;
}

interface OAuthTokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
  scope: string;
  locationId: string;
  companyId: string;
}
```

#### 7.2.2 GHL API Client

```typescript
interface GHLApiClient {
  // Core request method
  request<T>(config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    locationId: string;
    data?: unknown;
    params?: Record<string, string>;
  }): Promise<GHLApiResponse<T>>;

  // Batch operations
  batchRequest<T>(requests: BatchRequestConfig[]): Promise<BatchResponse<T>[]>;
}

interface GHLApiResponse<T> {
  data: T;
  headers: Record<string, string>;
  rateLimit: {
    remaining: number;
    reset: Date;
    limit: number;
  };
}
```

#### 7.2.3 Webhook Processor

```typescript
interface WebhookProcessor {
  // Process incoming webhook
  processWebhook(payload: {
    headers: Record<string, string>;
    body: unknown;
    locationId: string;
  }): Promise<WebhookResult>;

  // Register webhook handlers
  registerHandler(
    eventType: GHLEventType,
    handler: WebhookHandler
  ): void;

  // Retry failed webhook
  retryWebhook(webhookId: string): Promise<void>;
}

interface WebhookHandler {
  (event: GHLWebhookEvent): Promise<void>;
}

type GHLEventType =
  | 'contact.created'
  | 'contact.updated'
  | 'contact.deleted'
  | 'contact.tag.added'
  | 'contact.tag.removed'
  | 'opportunity.created'
  | 'opportunity.updated'
  | 'opportunity.stage.changed'
  | 'appointment.created'
  | 'appointment.updated'
  | 'appointment.cancelled'
  | 'form.submitted'
  | 'call.completed'
  | 'sms.received'
  | 'email.received';
```

### 7.3 Data Models

#### 7.3.1 Core Data Models

```typescript
// GHL Credentials (Encrypted Storage)
interface GHLCredentials {
  id: string;
  userId: string;
  agencyId: string;
  locationId: string;
  companyId: string;
  accessToken: string;      // AES-256-GCM encrypted
  refreshToken: string;     // AES-256-GCM encrypted
  expiresAt: Date;
  scopes: string[];
  isActive: boolean;
  lastRefreshed: Date;
  createdAt: Date;
  updatedAt: Date;
}

// GHL Location Configuration
interface GHLLocationConfig {
  id: string;
  locationId: string;
  userId: string;
  agencyId: string;
  displayName: string;
  timezone: string;
  syncSettings: {
    contactSync: boolean;
    opportunitySync: boolean;
    appointmentSync: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
  };
  webhookSettings: {
    enabledEvents: GHLEventType[];
    webhookUrl: string;
    webhookSecret: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// GHL Webhook Event Log
interface GHLWebhookEvent {
  id: string;
  locationId: string;
  eventType: GHLEventType;
  eventId: string;          // GHL's event ID for deduplication
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  processedAt: Date | null;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date | null;
  createdAt: Date;
}

// GHL API Call Log (Audit)
interface GHLApiCallLog {
  id: string;
  userId: string;
  locationId: string;
  endpoint: string;
  method: string;
  requestBody: Record<string, unknown> | null;
  responseStatus: number;
  responseTime: number;     // milliseconds
  rateLimitRemaining: number;
  success: boolean;
  errorMessage: string | null;
  createdAt: Date;
}
```

#### 7.3.2 Domain Models

```typescript
// GHL Contact
interface GHLContact {
  id: string;
  locationId: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  dateOfBirth: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  timezone: string | null;
  source: string | null;
  tags: string[];
  customFields: Record<string, unknown>;
  assignedTo: string | null;
  dateAdded: Date;
  dateUpdated: Date;
}

// GHL Opportunity
interface GHLOpportunity {
  id: string;
  locationId: string;
  contactId: string;
  pipelineId: string;
  pipelineStageId: string;
  name: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  monetaryValue: number;
  assignedTo: string | null;
  source: string | null;
  customFields: Record<string, unknown>;
  dateAdded: Date;
  dateUpdated: Date;
  lastStageChangeAt: Date | null;
}

// GHL Pipeline
interface GHLPipeline {
  id: string;
  locationId: string;
  name: string;
  stages: GHLPipelineStage[];
}

interface GHLPipelineStage {
  id: string;
  name: string;
  position: number;
}

// GHL Campaign
interface GHLCampaign {
  id: string;
  locationId: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
  };
}
```

### 7.4 API Endpoints

#### 7.4.1 OAuth Endpoints

```
POST   /api/ghl/oauth/authorize      # Initiate OAuth flow
GET    /api/ghl/oauth/callback       # Handle OAuth callback
POST   /api/ghl/oauth/refresh        # Force token refresh
DELETE /api/ghl/oauth/revoke/:id     # Revoke authorization
GET    /api/ghl/oauth/status         # Get connection status
```

#### 7.4.2 Contact Endpoints

```
GET    /api/ghl/contacts                    # List contacts
POST   /api/ghl/contacts                    # Create contact
GET    /api/ghl/contacts/:id                # Get contact
PUT    /api/ghl/contacts/:id                # Update contact
DELETE /api/ghl/contacts/:id                # Delete contact
POST   /api/ghl/contacts/bulk               # Bulk create/update
POST   /api/ghl/contacts/:id/tags           # Add tags
DELETE /api/ghl/contacts/:id/tags/:tag      # Remove tag
GET    /api/ghl/contacts/:id/activities     # Get activity timeline
POST   /api/ghl/contacts/search             # Search contacts
POST   /api/ghl/contacts/export             # Export contacts
```

#### 7.4.3 Pipeline Endpoints

```
GET    /api/ghl/pipelines                   # List pipelines
GET    /api/ghl/pipelines/:id               # Get pipeline
GET    /api/ghl/opportunities               # List opportunities
POST   /api/ghl/opportunities               # Create opportunity
GET    /api/ghl/opportunities/:id           # Get opportunity
PUT    /api/ghl/opportunities/:id           # Update opportunity
DELETE /api/ghl/opportunities/:id           # Delete opportunity
POST   /api/ghl/opportunities/:id/stage     # Move to stage
```

#### 7.4.4 Campaign Endpoints

```
GET    /api/ghl/campaigns                   # List campaigns
GET    /api/ghl/campaigns/:id               # Get campaign
POST   /api/ghl/campaigns/:id/contacts      # Add contact to campaign
DELETE /api/ghl/campaigns/:id/contacts/:cid # Remove contact
GET    /api/ghl/campaigns/:id/stats         # Get campaign stats
```

#### 7.4.5 Webhook Endpoints

```
POST   /api/ghl/webhooks/:locationId        # Receive GHL webhook
GET    /api/ghl/webhooks/events             # List webhook events
POST   /api/ghl/webhooks/events/:id/retry   # Retry failed event
```

### 7.5 Browser Automation Integration

The existing browser automation workflows in `server/workflows/ghl/` provide supplementary capabilities:

```typescript
// Browser-based GHL operations for actions not available via API
import {
  ghlLogin,
  ghlLogout,
  isGHLLoggedIn,
  extractContacts,
  extractWorkflows,
  extractPipelines,
  extractDashboardMetrics,
  extractContactDetails,
  extractCampaignStats,
} from './workflows/ghl';

// Use cases:
// 1. Extract data not available via API
// 2. Perform UI-only operations
// 3. Validate API data against UI
// 4. Handle edge cases requiring browser interaction
```

---

## 8. Dependencies

### 8.1 External Dependencies

| Dependency | Type | Purpose | Risk Level |
|------------|------|---------|------------|
| **GoHighLevel API v2** | API | Primary integration endpoint | High |
| **GHL OAuth Application** | OAuth | Authentication provider | High |
| **GHL Webhook Infrastructure** | Webhook | Event delivery | Medium |
| **Redis** | Cache/Queue | Rate limiting, job queue | Medium |
| **PostgreSQL** | Database | Credential storage, audit logs | Low |
| **BullMQ** | Job Queue | Async job processing | Low |

### 8.2 Internal Dependencies

| Dependency | Module | Purpose |
|------------|--------|---------|
| **Credential Vault** | `server/services/credentialVault.service.ts` | Secure credential storage |
| **Webhook Service** | `server/services/webhook.service.ts` | Webhook management |
| **Redis Service** | `server/services/redis.service.ts` | Caching and rate limiting |
| **Tenant Isolation** | `server/services/tenantIsolation.service.ts` | Multi-tenant security |
| **Audit Logging** | `server/services/auditLog.service.ts` | Operation logging |
| **Data API** | `server/_core/dataApi.ts` | External API gateway |
| **GHL Workflows** | `server/workflows/ghl/` | Browser automation |

### 8.3 GHL API Version Requirements

| API Version | Features Used | Status |
|-------------|---------------|--------|
| **v2.0** | Contacts, Opportunities, Pipelines | Required |
| **v2.0** | Campaigns, Workflows | Required |
| **v2.0** | OAuth 2.0, Webhooks | Required |
| **v1.0** | Legacy endpoints (fallback) | Optional |

### 8.4 Required GHL Scopes

```typescript
const REQUIRED_SCOPES = [
  'contacts.readonly',
  'contacts.write',
  'opportunities.readonly',
  'opportunities.write',
  'calendars.readonly',
  'calendars.write',
  'campaigns.readonly',
  'workflows.readonly',
  'locations.readonly',
  'users.readonly',
];

const OPTIONAL_SCOPES = [
  'campaigns.write',
  'workflows.write',
  'forms.readonly',
  'funnels.readonly',
  'invoices.readonly',
  'invoices.write',
];
```

---

## 9. Out of Scope

### 9.1 Explicitly Excluded

| Feature | Reason | Future Consideration |
|---------|--------|---------------------|
| **GHL White-Label** | Complexity, limited demand | v3.0 |
| **Custom App Marketplace** | Requires GHL partnership | v3.0 |
| **GHL Phone System Integration** | Separate Twilio integration exists | v2.5 |
| **GHL Reputation Management** | Low priority feature | v2.5 |
| **GHL Membership Sites** | Limited use case | Backlog |
| **GHL Invoice Creation UI** | API-only support | v2.5 |
| **GHL Social Media Posting** | Separate social integration exists | Backlog |
| **GHL Email Builder** | UI complexity | Backlog |
| **Real-Time Conversation Sync** | WebSocket complexity | v3.0 |
| **GHL Mobile App Integration** | SDK limitations | Backlog |

### 9.2 Deferred Features

| Feature | Planned Version | Dependencies |
|---------|-----------------|--------------|
| **Funnel Analytics** | v2.2 | Basic integration complete |
| **A/B Test Management** | v2.3 | Funnel analytics |
| **Review Management** | v2.5 | Basic integration complete |
| **Call Recording Access** | v2.5 | Compliance review |
| **Advanced Reporting** | v2.3 | Analytics infrastructure |

### 9.3 Assumptions

1. Users have valid GHL accounts with appropriate subscription levels
2. GHL API maintains backward compatibility for v2.0 endpoints
3. GHL webhook delivery is reliable (with retry handling)
4. Users grant necessary OAuth scopes
5. Network latency to GHL API is acceptable (<200ms typical)

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **GHL API Rate Limits** | High | High | Token bucket rate limiter with queue-based backpressure |
| **OAuth Token Expiration** | Medium | High | Proactive refresh 5+ minutes before expiry |
| **GHL API Breaking Changes** | Medium | High | Version pinning, integration tests, graceful degradation |
| **Webhook Delivery Failures** | Medium | Medium | Retry logic, event reconciliation, dead letter queue |
| **Credential Security Breach** | Low | Critical | AES-256 encryption, audit logging, access controls |
| **GHL Platform Outages** | Medium | High | Circuit breaker, cached data fallback, status page monitoring |

### 10.2 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **GHL API Access Revocation** | Low | Critical | Maintain GHL partnership, diversify integrations |
| **GHL Pricing Changes** | Medium | Medium | Monitor announcements, build cost controls |
| **Competitor Feature Parity** | High | Medium | Continuous feature development, unique workflows |
| **User Adoption Barriers** | Medium | Medium | Simplified onboarding, guided setup |

### 10.3 Compliance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Data Privacy (GDPR/CCPA)** | Medium | High | Data minimization, consent tracking, deletion support |
| **PCI Compliance** | Low | Medium | No payment data storage in GHL sync |
| **HIPAA (Healthcare Users)** | Low | High | Optional PHI exclusion, BAA support |

### 10.4 Risk Monitoring

```typescript
interface RiskMonitor {
  // Monitor GHL API health
  checkGHLApiHealth(): Promise<HealthStatus>;

  // Monitor rate limit usage
  getRateLimitStatus(locationId: string): RateLimitStatus;

  // Monitor token health
  getTokenHealth(locationId: string): TokenHealth;

  // Monitor webhook delivery
  getWebhookDeliveryRate(): DeliveryMetrics;
}
```

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Foundation (Weeks 1-3)

| Milestone | Deliverables | Success Criteria |
|-----------|--------------|------------------|
| **M1.1** OAuth Implementation | OAuth flow, token storage, refresh | 100% token refresh success |
| **M1.2** API Client Core | Rate limiter, circuit breaker, retry | <1% rate limit violations |
| **M1.3** Multi-Tenant Foundation | Location isolation, credential vault | Zero cross-tenant access |
| **M1.4** Webhook Infrastructure | Endpoint, signature verification, queue | 99%+ delivery rate |

**Phase 1 Exit Criteria:**
- OAuth flow working for 3+ test locations
- Rate limiting prevents all 429 errors
- Webhook events processed within 5 seconds
- All credentials encrypted at rest

### 11.2 Phase 2: Core Features (Weeks 4-6)

| Milestone | Deliverables | Success Criteria |
|-----------|--------------|------------------|
| **M2.1** Contact Management | CRUD, search, bulk operations | <500ms P95 latency |
| **M2.2** Pipeline Operations | Opportunities, stages, analytics | Stage transitions working |
| **M2.3** Tag Management | Add/remove tags, bulk tagging | Tags sync bidirectionally |
| **M2.4** Custom Fields | Read/write custom field values | All field types supported |

**Phase 2 Exit Criteria:**
- 20+ contact operations supported
- Bulk import handles 10K+ records
- Pipeline operations fully functional
- Integration tests passing

### 11.3 Phase 3: Campaign & Workflow (Weeks 7-9)

| Milestone | Deliverables | Success Criteria |
|-----------|--------------|------------------|
| **M3.1** Campaign Operations | Enrollment, removal, stats | Campaign sync working |
| **M3.2** Workflow Triggers | Trigger execution, variable passing | Workflows trigger reliably |
| **M3.3** Appointment Management | CRUD, availability, events | Appointments sync |
| **M3.4** Messaging Integration | SMS/Email via GHL | Message delivery >99% |

**Phase 3 Exit Criteria:**
- Campaign operations functional
- Workflow triggers work reliably
- Appointment webhooks processed
- SMS/Email sending operational

### 11.4 Phase 4: Advanced & Polish (Weeks 10-12)

| Milestone | Deliverables | Success Criteria |
|-----------|--------------|------------------|
| **M4.1** Subaccount Management | Creation, configuration | Multi-location support |
| **M4.2** Advanced Analytics | Cross-location reporting | Reports generate correctly |
| **M4.3** Error Handling | Comprehensive error recovery | <5% operation failures |
| **M4.4** Documentation | API docs, guides, examples | Complete documentation |

**Phase 4 Exit Criteria:**
- All 48+ functions implemented
- Error recovery working
- Documentation complete
- Production-ready release

### 11.5 Timeline Summary

```
Week 1-3:   ████████████ Phase 1: Foundation
Week 4-6:   ████████████ Phase 2: Core Features
Week 7-9:   ████████████ Phase 3: Campaign & Workflow
Week 10-12: ████████████ Phase 4: Advanced & Polish
            ────────────────────────────────────────
            Total: 12 weeks to production release
```

---

## 12. Acceptance Criteria

### 12.1 OAuth & Authentication

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-001 | OAuth flow completes successfully for new users | E2E test |
| AC-002 | Token refresh occurs automatically before expiry | Unit test + monitoring |
| AC-003 | Multiple locations can be connected per user | E2E test |
| AC-004 | Token revocation removes all access | E2E test |
| AC-005 | Invalid credentials are rejected with clear error | Unit test |
| AC-006 | All credentials are encrypted in database | Security audit |

### 12.2 Contact Management

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-007 | Contacts can be created via API | Integration test |
| AC-008 | Contacts can be searched by email/phone/name | Integration test |
| AC-009 | Bulk import handles 10,000+ records | Load test |
| AC-010 | Tags can be added/removed | Integration test |
| AC-011 | Custom fields can be read/written | Integration test |
| AC-012 | Contact sync completes within configured interval | E2E test |

### 12.3 Pipeline Operations

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-013 | Opportunities can be created/updated | Integration test |
| AC-014 | Stage transitions work correctly | Integration test |
| AC-015 | Pipeline analytics return accurate data | Integration test |
| AC-016 | Opportunity assignment updates correctly | Integration test |

### 12.4 Webhook Processing

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-017 | Webhooks are received and processed <5s | Performance test |
| AC-018 | Invalid signatures are rejected | Security test |
| AC-019 | Duplicate events are deduplicated | Unit test |
| AC-020 | Failed webhooks retry with backoff | Unit test |
| AC-021 | Dead letter queue captures failed events | Integration test |

### 12.5 Multi-Tenant Isolation

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-022 | Location data is strictly isolated | Security test |
| AC-023 | Agency data is strictly isolated | Security test |
| AC-024 | Cross-tenant requests are blocked | Security test |
| AC-025 | Audit logs capture all operations | Security audit |

### 12.6 Performance

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-026 | API P95 latency <500ms | Performance test |
| AC-027 | Rate limits are never exceeded | Load test |
| AC-028 | Bulk operations complete in reasonable time | Performance test |
| AC-029 | System handles 100+ concurrent connections | Load test |

### 12.7 Error Handling

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-030 | GHL API errors are handled gracefully | Integration test |
| AC-031 | Circuit breaker activates on repeated failures | Unit test |
| AC-032 | Retry logic uses exponential backoff | Unit test |
| AC-033 | User-friendly error messages displayed | E2E test |

### 12.8 Documentation

| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-034 | API documentation covers all endpoints | Manual review |
| AC-035 | Setup guide is complete and accurate | User testing |
| AC-036 | Code examples work correctly | Integration test |
| AC-037 | Troubleshooting guide covers common issues | Manual review |

---

## Appendix A: GHL API Reference

### A.1 Key GHL API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/contacts/` | GET, POST | List/create contacts |
| `/contacts/{id}` | GET, PUT, DELETE | Contact CRUD |
| `/contacts/{id}/tags` | POST, DELETE | Tag management |
| `/opportunities/` | GET, POST | List/create opportunities |
| `/opportunities/{id}` | GET, PUT, DELETE | Opportunity CRUD |
| `/pipelines/` | GET | List pipelines |
| `/campaigns/` | GET | List campaigns |
| `/campaigns/{id}/contacts` | POST, DELETE | Campaign enrollment |
| `/workflows/{id}/trigger` | POST | Trigger workflow |
| `/calendars/` | GET | List calendars |
| `/appointments/` | GET, POST | List/create appointments |

### A.2 GHL Webhook Events

| Event Type | Trigger |
|------------|---------|
| `contact.created` | New contact added |
| `contact.updated` | Contact modified |
| `contact.deleted` | Contact removed |
| `contact.tag.added` | Tag added to contact |
| `contact.tag.removed` | Tag removed from contact |
| `opportunity.created` | New opportunity created |
| `opportunity.updated` | Opportunity modified |
| `opportunity.stage.changed` | Stage transition |
| `appointment.created` | New appointment booked |
| `appointment.updated` | Appointment modified |
| `appointment.cancelled` | Appointment cancelled |
| `form.submitted` | Form submission received |
| `call.completed` | Call ended |
| `sms.received` | Inbound SMS received |
| `email.received` | Inbound email received |

---

## Appendix B: Error Codes

### B.1 GHL Integration Error Codes

| Code | Name | Description | Resolution |
|------|------|-------------|------------|
| GHL-001 | `OAUTH_FAILED` | OAuth authorization failed | Retry authorization flow |
| GHL-002 | `TOKEN_EXPIRED` | Access token expired | Token will auto-refresh |
| GHL-003 | `TOKEN_INVALID` | Access token invalid | Re-authorize account |
| GHL-004 | `RATE_LIMITED` | GHL API rate limit hit | Request queued, retry automatic |
| GHL-005 | `LOCATION_NOT_FOUND` | Location ID invalid | Check location configuration |
| GHL-006 | `CONTACT_NOT_FOUND` | Contact ID not found | Verify contact exists |
| GHL-007 | `OPPORTUNITY_NOT_FOUND` | Opportunity ID not found | Verify opportunity exists |
| GHL-008 | `INVALID_WEBHOOK` | Webhook signature invalid | Check webhook configuration |
| GHL-009 | `API_ERROR` | GHL API returned error | Check error details |
| GHL-010 | `NETWORK_ERROR` | Network connectivity issue | Check network, retry |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Agency** | Top-level GHL account that can contain multiple locations |
| **Location** | Individual GHL sub-account, typically representing one client |
| **Contact** | Individual person record in GHL CRM |
| **Opportunity** | Sales opportunity associated with a contact in a pipeline |
| **Pipeline** | Sales funnel with multiple stages |
| **Campaign** | Automated email/SMS sequence |
| **Workflow** | GHL automation triggered by events or actions |
| **Custom Field** | User-defined data field on contacts/opportunities |
| **Tag** | Label applied to contacts for segmentation |
| **Subaccount** | Synonym for Location in agency context |

---

**Document Revision History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial comprehensive PRD |

---

**Approvals:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Engineering Lead | | | |
| Security Review | | | |
| QA Lead | | | |
