# PRD-013: Sub-Accounts Management System

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-013 |
| **Feature Name** | Sub-Accounts Management System |
| **Category** | Platform Integration & Multi-Tenancy |
| **Priority** | P0 - Critical |
| **Status** | Draft |
| **Owner** | Platform Team |
| **Version** | 1.0.0 |
| **Last Updated** | 2026-01-11 |

---

## 1. Executive Summary

The Sub-Accounts Management System enables seamless integration between Bottleneck-Bots and GoHighLevel (GHL) sub-accounts. This feature provides comprehensive sub-account lifecycle management including creation, configuration, team member management, permission hierarchy enforcement, and resource allocation tracking. The system leverages AI-powered browser automation via Stagehand to automate complex GHL operations while maintaining strict security controls and cost monitoring.

### Key Capabilities
- **GoHighLevel Sub-Account Linking**: Automated creation and linking of GHL sub-accounts to Bottleneck-Bots client profiles
- **Team Member Management**: Multi-user access with role-based permissions per sub-account
- **Permission Hierarchy**: Granular permission controls cascading from agency to sub-account level
- **Sub-Account Settings**: Custom configurations including branding, timezone, and business settings
- **Resource Allocation**: Per-sub-account resource quotas, usage tracking, and cost attribution
- **Metrics & Observability**: Real-time operation tracking, cost estimation, and anomaly detection

---

## 2. Problem Statement

### Current Challenges

**Manual Sub-Account Management**
- Agency owners manually create and configure sub-accounts in GHL, a time-consuming process taking 15-30 minutes per account
- No automated linking between Bottleneck-Bots client profiles and GHL sub-accounts
- Team member invitations and permission setup must be done manually in GHL

**Lack of Centralized Control**
- Users switch between Bottleneck-Bots and GHL interfaces to manage clients
- No unified view of sub-account health, usage, or costs
- Permission management is fragmented across platforms

**Security & Compliance Gaps**
- Inconsistent permission enforcement across sub-accounts
- No audit trail for sub-account access and modifications
- Team members may have excessive permissions by default

**Resource Visibility**
- No per-sub-account cost attribution
- Difficulty tracking which sub-accounts consume the most resources
- No proactive alerts for usage anomalies

### User Pain Points
1. **Agency Owners**: "I spend hours setting up new client accounts and managing team access"
2. **Team Leads**: "I can't easily see what my team members can access across different clients"
3. **Administrators**: "There's no way to enforce consistent permissions or track costs per client"

---

## 3. Goals & Objectives

### Primary Goals
| Goal | Description | Success Indicator |
|------|-------------|-------------------|
| Automated Sub-Account Creation | One-click sub-account creation with full configuration | < 5 min setup time |
| Unified Management Interface | Single pane of glass for all sub-account operations | 80% reduction in GHL interface visits |
| Permission Hierarchy Enforcement | Consistent, auditable permission controls | Zero unauthorized access incidents |
| Resource Optimization | Per-sub-account cost tracking and allocation | 20% improvement in cost attribution accuracy |

### Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Sub-Account Creation Success Rate | > 95% | Operation completion tracking |
| Average Creation Time | < 20 minutes | End-to-end operation timing |
| Team Member Invitation Success | > 98% | User acceptance rate |
| Permission Audit Compliance | 100% | Automated audit checks |
| Cost Attribution Accuracy | > 95% | Reconciliation with GHL billing |
| User Satisfaction Score | > 4.5/5 | Post-feature survey |

### Non-Goals (Out of Scope for v1.0)
- Direct GHL API integration (using browser automation instead)
- Sub-account billing and invoicing
- White-label domain configuration
- Advanced A2P 10DLC registration
- Custom workflow template marketplace

---

## 4. User Stories

### Epic 1: Sub-Account Lifecycle Management

#### US-001: Create New Sub-Account
**As a** agency owner
**I want to** create a new GHL sub-account directly from Bottleneck-Bots
**So that** I can onboard new clients without leaving the platform

**Acceptance Criteria:**
- [ ] Input business name, email, phone, and timezone
- [ ] Optional branding configuration (logo, colors)
- [ ] Optional template snapshot import
- [ ] Real-time progress indicator during creation
- [ ] Sub-account ID linked to client profile upon completion
- [ ] Cost estimate shown before operation starts
- [ ] Error recovery with actionable messages

**Technical Notes:**
- Uses `ghlAutomation.createSubAccount()` via Stagehand
- Links to `clientProfiles` table via `subaccountId` field
- Complexity Level 4 (Advanced), estimated 15-30 minutes

---

#### US-002: Switch Active Sub-Account
**As a** user
**I want to** quickly switch between sub-accounts
**So that** I can work on different client accounts seamlessly

**Acceptance Criteria:**
- [ ] Sub-account selector in navigation
- [ ] Quick switch preserves current workflow context
- [ ] Recent sub-accounts shown for fast access
- [ ] Visual indicator of currently active sub-account
- [ ] Switch operation completes in < 5 seconds

---

#### US-003: List and Search Sub-Accounts
**As a** agency owner
**I want to** view all sub-accounts with search and filter
**So that** I can find and manage clients efficiently

**Acceptance Criteria:**
- [ ] Paginated list with configurable page size
- [ ] Search by business name or email
- [ ] Filter by status (active, inactive, pending)
- [ ] Sort by creation date, name, or last activity
- [ ] Bulk actions (archive, export)

---

#### US-004: Link Existing Sub-Account
**As a** agency owner
**I want to** link an existing GHL sub-account to a client profile
**So that** I can use Bottleneck-Bots with pre-existing clients

**Acceptance Criteria:**
- [ ] Browse available unlinked sub-accounts
- [ ] Match by business name or email
- [ ] One-click linking to client profile
- [ ] Automatic sync of sub-account settings

---

### Epic 2: Team Member Management

#### US-005: Invite Team Member to Sub-Account
**As a** agency owner
**I want to** invite team members to specific sub-accounts
**So that** they can work on client accounts with appropriate access

**Acceptance Criteria:**
- [ ] Invite by email address
- [ ] Select role (admin, user)
- [ ] Choose specific sub-accounts for access
- [ ] Email notification sent to invitee
- [ ] Pending invitation tracking

---

#### US-006: Manage Team Member Permissions
**As a** agency owner
**I want to** modify team member permissions per sub-account
**So that** I can adjust access as roles change

**Acceptance Criteria:**
- [ ] View all team members with sub-account access
- [ ] Modify role assignments
- [ ] Revoke access to specific sub-accounts
- [ ] Bulk permission updates
- [ ] Audit log of permission changes

---

#### US-007: View Team Member Activity
**As a** agency owner
**I want to** see team member activity across sub-accounts
**So that** I can monitor productivity and identify issues

**Acceptance Criteria:**
- [ ] Activity timeline per team member
- [ ] Sub-account access history
- [ ] Operation counts and types
- [ ] Last active timestamp
- [ ] Export activity reports

---

### Epic 3: Permission Hierarchy

#### US-008: Define Permission Templates
**As an** administrator
**I want to** create permission templates
**So that** I can apply consistent access patterns

**Acceptance Criteria:**
- [ ] Template name and description
- [ ] Granular permission selection
- [ ] Template inheritance (base + overrides)
- [ ] Apply template to sub-accounts
- [ ] Template versioning

---

#### US-009: Enforce Permission Hierarchy
**As a** system
**I want to** enforce permission inheritance
**So that** sub-account permissions never exceed parent levels

**Acceptance Criteria:**
- [ ] Agency-level permissions as ceiling
- [ ] Sub-account permissions as subset
- [ ] User permissions as subset of sub-account
- [ ] Real-time permission validation
- [ ] Clear error messages for violations

---

#### US-010: Audit Permission Changes
**As a** compliance officer
**I want to** review all permission changes
**So that** I can ensure security compliance

**Acceptance Criteria:**
- [ ] Immutable audit log
- [ ] Who, what, when, where tracking
- [ ] Before/after state comparison
- [ ] Export for compliance reporting
- [ ] Retention policy (90 days minimum)

---

### Epic 4: Sub-Account Settings

#### US-011: Configure Sub-Account Branding
**As a** agency owner
**I want to** customize sub-account branding
**So that** each client has personalized experience

**Acceptance Criteria:**
- [ ] Upload logo (validation: format, size)
- [ ] Primary brand color selection
- [ ] Company name override
- [ ] Preview before applying
- [ ] Branding sync to GHL

---

#### US-012: Manage Sub-Account Settings
**As a** agency owner
**I want to** configure sub-account operational settings
**So that** each client operates with appropriate configurations

**Acceptance Criteria:**
- [ ] Timezone configuration
- [ ] Business address
- [ ] Contact preferences
- [ ] Notification settings
- [ ] Integration toggles

---

### Epic 5: Resource Allocation

#### US-013: Define Resource Quotas
**As an** administrator
**I want to** set resource limits per sub-account
**So that** I can control costs and prevent abuse

**Acceptance Criteria:**
- [ ] API call limits (daily/monthly)
- [ ] Browser session limits
- [ ] Storage quotas
- [ ] Agent execution limits
- [ ] Overage alerts

---

#### US-014: Track Resource Usage
**As an** agency owner
**I want to** monitor resource consumption per sub-account
**So that** I can optimize costs and identify heavy users

**Acceptance Criteria:**
- [ ] Real-time usage dashboard
- [ ] Historical usage trends
- [ ] Cost attribution by sub-account
- [ ] Usage forecasting
- [ ] Export usage reports

---

#### US-015: Receive Usage Alerts
**As an** agency owner
**I want to** be notified of unusual usage patterns
**So that** I can take action before limits are exceeded

**Acceptance Criteria:**
- [ ] Configurable alert thresholds
- [ ] Multi-channel notifications (email, in-app)
- [ ] Alert acknowledgment workflow
- [ ] Escalation for critical alerts
- [ ] Alert history

---

## 5. Functional Requirements

### FR-001: Sub-Account CRUD Operations
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001.1 | Create sub-account via browser automation | P0 | Implemented |
| FR-001.2 | Switch active sub-account context | P0 | Implemented |
| FR-001.3 | List sub-accounts with pagination | P0 | Implemented |
| FR-001.4 | Get linked sub-accounts from database | P0 | Implemented |
| FR-001.5 | Update sub-account settings | P1 | Planned |
| FR-001.6 | Archive/deactivate sub-account | P1 | Planned |
| FR-001.7 | Delete sub-account (with confirmation) | P2 | Planned |

### FR-002: Team Member Management
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-002.1 | Invite team member to sub-account | P0 | Planned |
| FR-002.2 | List team members per sub-account | P0 | Planned |
| FR-002.3 | Update team member role | P1 | Planned |
| FR-002.4 | Remove team member access | P1 | Planned |
| FR-002.5 | Bulk team member operations | P2 | Planned |
| FR-002.6 | Team member activity logging | P1 | Planned |

### FR-003: Permission Hierarchy
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-003.1 | Define permission templates | P1 | Planned |
| FR-003.2 | Apply template to sub-account | P1 | Planned |
| FR-003.3 | Override template permissions | P2 | Planned |
| FR-003.4 | Validate permission hierarchy | P0 | Planned |
| FR-003.5 | Audit permission changes | P0 | Planned |
| FR-003.6 | Permission inheritance enforcement | P0 | Planned |

### FR-004: Sub-Account Configuration
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-004.1 | Configure branding (logo, colors) | P1 | Partial |
| FR-004.2 | Set timezone | P0 | Implemented |
| FR-004.3 | Configure business address | P1 | Implemented |
| FR-004.4 | Manage notification preferences | P2 | Planned |
| FR-004.5 | Template snapshot import | P1 | Implemented |

### FR-005: Resource Management
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-005.1 | Define resource quotas | P1 | Planned |
| FR-005.2 | Track usage per sub-account | P0 | Partial |
| FR-005.3 | Calculate cost attribution | P0 | Implemented |
| FR-005.4 | Generate usage alerts | P1 | Planned |
| FR-005.5 | Export usage reports | P2 | Planned |

### FR-006: Metrics & Observability
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-006.1 | Track operation metrics | P0 | Implemented |
| FR-006.2 | Cost estimation before operation | P0 | Implemented |
| FR-006.3 | Real-time progress tracking | P0 | Implemented |
| FR-006.4 | Anomaly detection | P1 | Implemented |
| FR-006.5 | Prometheus metrics export | P1 | Implemented |

---

## 6. Data Models

### Sub-Account Entity (Extended Client Profile)
```typescript
interface SubAccount {
  id: number;
  userId: number;

  // Client Profile Fields
  name: string;
  subaccountId: string | null;      // GHL sub-account ID
  subaccountName: string | null;    // GHL sub-account name
  brandVoice: string | null;
  primaryGoal: string | null;
  website: string | null;

  // Extended Sub-Account Fields
  businessEmail: string;
  businessPhone: string | null;
  timezone: string;
  address: SubAccountAddress | null;
  branding: SubAccountBranding | null;

  // Status & Lifecycle
  status: 'pending' | 'active' | 'suspended' | 'archived';
  linkedAt: Date | null;
  lastSyncedAt: Date | null;

  // Resource Allocation
  resourceQuota: ResourceQuota | null;
  currentUsage: ResourceUsage | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

interface SubAccountAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface SubAccountBranding {
  logoUrl: string | null;
  primaryColor: string;  // Hex color code
  companyName: string | null;
}
```

### Team Member Entity
```typescript
interface SubAccountTeamMember {
  id: number;
  subAccountId: number;
  userId: number;

  // User Info
  email: string;
  firstName: string;
  lastName: string;

  // Role & Permissions
  role: 'admin' | 'user' | 'viewer';
  permissions: SubAccountPermission[];
  permissionTemplateId: number | null;

  // Status
  status: 'pending' | 'active' | 'suspended' | 'removed';
  invitedAt: Date;
  acceptedAt: Date | null;
  removedAt: Date | null;

  // Activity
  lastActiveAt: Date | null;
  activityCount: number;

  createdAt: Date;
  updatedAt: Date;
}

interface SubAccountPermission {
  resource: string;           // 'contacts', 'campaigns', 'automations', etc.
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

### Permission Template Entity
```typescript
interface PermissionTemplate {
  id: number;
  organizationId: number;

  name: string;
  description: string | null;

  // Base permissions
  permissions: SubAccountPermission[];

  // Hierarchy
  parentTemplateId: number | null;
  isDefault: boolean;

  // Metadata
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}
```

### Resource Quota Entity
```typescript
interface ResourceQuota {
  id: number;
  subAccountId: number;

  // API Limits
  apiCallsPerDay: number;
  apiCallsPerMonth: number;

  // Browser Session Limits
  browserSessionsPerDay: number;
  concurrentBrowserSessions: number;

  // Agent Limits
  agentExecutionsPerDay: number;
  agentExecutionsPerMonth: number;
  maxConcurrentAgents: number;

  // Storage
  storageQuotaMb: number;

  // Alerts
  warningThreshold: number;  // Percentage (e.g., 80)
  criticalThreshold: number; // Percentage (e.g., 95)

  effectiveFrom: Date;
  effectiveUntil: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

interface ResourceUsage {
  subAccountId: number;
  period: 'daily' | 'monthly';
  periodStart: Date;

  apiCalls: number;
  browserSessions: number;
  agentExecutions: number;
  storageMb: number;

  estimatedCost: number;

  lastUpdatedAt: Date;
}
```

### Operation Metrics Entity (Existing)
```typescript
interface SubAccountOperationMetrics {
  operationId: string;
  operationType: 'create' | 'switch' | 'list' | 'update' | 'delete';
  userId: number;
  sessionId: string;
  startTime: Date;
  endTime: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps: OperationStep[];
  subAccountId?: string;
  subAccountName?: string;
  estimatedCost: number;
  actualCost: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

interface OperationStep {
  step: string;
  startTime: Date;
  endTime: Date | null;
  success: boolean;
  duration: number;
  error?: string;
}
```

---

## 7. API Endpoints

### Sub-Account Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/trpc/subAccounts.create` | Create new sub-account | Protected |
| POST | `/api/trpc/subAccounts.switch` | Switch active sub-account | Protected |
| GET | `/api/trpc/subAccounts.list` | List sub-accounts with pagination | Protected |
| GET | `/api/trpc/subAccounts.getLinkedSubAccounts` | Get DB-linked sub-accounts | Protected |
| GET | `/api/trpc/subAccounts.getOperation` | Get operation status by ID | Protected |
| GET | `/api/trpc/subAccounts.getActiveOperations` | Get currently running operations | Protected |
| GET | `/api/trpc/subAccounts.getMetrics` | Get metrics summary | Protected |
| GET | `/api/trpc/subAccounts.detectAnomalies` | Detect operation anomalies | Protected |
| GET | `/api/trpc/subAccounts.exportPrometheus` | Export Prometheus metrics | Protected |
| GET | `/api/trpc/subAccounts.estimateCost` | Estimate operation cost | Protected |

### Team Member Management (Planned)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/trpc/subAccounts.inviteTeamMember` | Invite user to sub-account | Protected |
| GET | `/api/trpc/subAccounts.listTeamMembers` | List team members | Protected |
| PATCH | `/api/trpc/subAccounts.updateTeamMember` | Update member role/permissions | Protected |
| DELETE | `/api/trpc/subAccounts.removeTeamMember` | Remove member access | Protected |
| GET | `/api/trpc/subAccounts.getTeamMemberActivity` | Get member activity log | Protected |

### Permission Management (Planned)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/trpc/permissions.createTemplate` | Create permission template | Admin |
| GET | `/api/trpc/permissions.listTemplates` | List permission templates | Protected |
| PATCH | `/api/trpc/permissions.updateTemplate` | Update template | Admin |
| POST | `/api/trpc/permissions.applyTemplate` | Apply template to sub-account | Protected |
| GET | `/api/trpc/permissions.getAuditLog` | Get permission audit log | Admin |

### Resource Management (Planned)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/trpc/resources.setQuota` | Set resource quota | Admin |
| GET | `/api/trpc/resources.getQuota` | Get current quota | Protected |
| GET | `/api/trpc/resources.getUsage` | Get usage statistics | Protected |
| GET | `/api/trpc/resources.getUsageHistory` | Get historical usage | Protected |
| POST | `/api/trpc/resources.configureAlerts` | Configure usage alerts | Protected |

---

## 8. System Architecture

### Component Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                        Bottleneck-Bots Platform                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Frontend   │────│  tRPC Router │────│   Services   │          │
│  │   (React)    │    │ subAccounts  │    │              │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                             │                    │                   │
│                             ▼                    ▼                   │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                  Sub-Account Service Layer                │       │
│  ├──────────────────────────────────────────────────────────┤       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │       │
│  │  │ GHL Auto-  │  │ Permission │  │ Resource Alloc.    │ │       │
│  │  │ mation     │  │ Service    │  │ Service            │ │       │
│  │  │ (Stagehand)│  │            │  │                    │ │       │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │       │
│  │  │ Team Mgmt  │  │ Metrics    │  │ Audit Service      │ │       │
│  │  │ Service    │  │ Service    │  │                    │ │       │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │       │
│  └──────────────────────────────────────────────────────────┘       │
│                             │                                        │
│                             ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                      Data Layer                           │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │       │
│  │  │ PostgreSQL │  │ Redis      │  │ Browserbase        │ │       │
│  │  │ (Drizzle)  │  │ (Cache)    │  │ (Sessions)         │ │       │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │     GoHighLevel API      │
                    │   (via Browser Automation)│
                    └──────────────────────────┘
```

### Sub-Account Creation Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  tRPC    │────▶│Stagehand │────▶│   GHL    │
│  Input   │     │  Router  │     │Automation│     │  Portal  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │                ▼                 │                │
     │         Start Metrics           │                │
     │         Tracking                 │                │
     │                │                 ▼                │
     │                │         Create Browser          │
     │                │         Session                  │
     │                │                 │                ▼
     │                │                 │         Navigate to
     │                │                 │         Sub-Account Page
     │                │                 │                │
     │                │                 │                ▼
     │                │                 │         Fill Business
     │                │                 │         Details Form
     │                │                 │                │
     │                │                 │                ▼
     │                │                 │         Configure
     │                │                 │         Branding
     │                │                 │                │
     │                │                 │                ▼
     │                │                 │         Invite Users
     │                │                 │         (if provided)
     │                │                 │                │
     │                │                 │                ▼
     │                │                 │         Import Template
     │                │                 │         (if provided)
     │                │                 │                │
     │                │                 ◀────────────────┘
     │                │                 │
     │                │         Record Steps
     │                │         & Costs
     │                │                 │
     │                ▼                 │
     │         Update Client           │
     │         Profile                  │
     │                │                 │
     ◀────────────────┴─────────────────┘
     │
     ▼
   Success Response with
   SubAccount ID
```

### Permission Hierarchy Model
```
                    ┌─────────────────┐
                    │    Platform     │
                    │   (Bottleneck)  │
                    └────────┬────────┘
                             │
                             │ Inherits
                             ▼
                    ┌─────────────────┐
                    │    Agency       │
                    │   Permissions   │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ Sub-Account │  │ Sub-Account │  │ Sub-Account │
   │ A Perms     │  │ B Perms     │  │ C Perms     │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
    ┌─────┴─────┐    ┌─────┴─────┐    ┌─────┴─────┐
    │           │    │           │    │           │
    ▼           ▼    ▼           ▼    ▼           ▼
 ┌─────┐    ┌─────┐ ┌─────┐  ┌─────┐ ┌─────┐  ┌─────┐
 │User │    │User │ │User │  │User │ │User │  │User │
 │Admin│    │View │ │Admin│  │User │ │User │  │View │
 └─────┘    └─────┘ └─────┘  └─────┘ └─────┘  └─────┘

RULE: Child permissions ⊆ Parent permissions
```

---

## 9. Security Considerations

### Authentication & Authorization

| Requirement | Implementation |
|-------------|----------------|
| All endpoints require authentication | `protectedProcedure` wrapper |
| User can only access their sub-accounts | `userId` filter in all queries |
| Admin operations require elevated role | Role-based access control |
| API key scopes for programmatic access | Scope validation per operation |

### Data Protection

| Data Type | Protection Method |
|-----------|-------------------|
| GHL Credentials | AES-256-GCM encryption at rest |
| Session Tokens | Encrypted, short-lived (1 hour) |
| User PII | Encrypted in transit (TLS 1.3) |
| Audit Logs | Immutable, signed entries |

### Permission Enforcement

```typescript
// Permission check before every operation
async function checkSubAccountAccess(
  userId: number,
  subAccountId: string,
  requiredPermission: string
): Promise<boolean> {
  // 1. Verify user owns or has access to sub-account
  // 2. Check permission hierarchy
  // 3. Validate against permission template
  // 4. Log access attempt in audit
  return allowed;
}
```

### Audit Requirements

| Event | Logged Data |
|-------|-------------|
| Sub-account creation | User, timestamp, config, success/failure |
| Permission changes | Before/after state, modifier, reason |
| Team member changes | Add/remove/modify, affected user |
| Resource quota changes | Old/new limits, effective date |
| Access attempts | User, resource, allowed/denied |

### Rate Limiting

| Operation | Limit | Window |
|-----------|-------|--------|
| Sub-account creation | 5 | Per hour |
| Sub-account switch | 30 | Per minute |
| List operations | 100 | Per minute |
| Team invitations | 20 | Per hour |

---

## 10. Performance Requirements

### Response Time SLAs

| Operation | Target | Maximum |
|-----------|--------|---------|
| List sub-accounts | < 200ms | < 500ms |
| Switch sub-account | < 2s | < 5s |
| Get metrics | < 100ms | < 300ms |
| Create sub-account | < 30 min | < 45 min |

### Scalability Targets

| Metric | Target |
|--------|--------|
| Sub-accounts per agency | Up to 1,000 |
| Team members per sub-account | Up to 50 |
| Concurrent creation operations | 10 per agency |
| Metrics retention | 90 days detailed, 1 year aggregated |

### Caching Strategy

| Data | Cache Duration | Invalidation |
|------|----------------|--------------|
| Sub-account list | 5 minutes | On create/update |
| Permission templates | 15 minutes | On template update |
| User permissions | 5 minutes | On permission change |
| Usage metrics | 1 minute | Rolling window |

---

## 11. Dependencies

### Internal Dependencies

| Component | Purpose | Criticality |
|-----------|---------|-------------|
| `stagehand.service` | GHL browser automation | Critical |
| `agentPermissions.service` | Permission enforcement | Critical |
| `subAccountMetrics.service` | Operation tracking | High |
| `credentialVault.service` | Credential storage | Critical |
| Drizzle ORM | Database operations | Critical |

### External Dependencies

| Service | Purpose | Fallback |
|---------|---------|----------|
| GoHighLevel | Sub-account hosting | None (core dependency) |
| Browserbase | Browser sessions | Queue for retry |
| Gemini API | AI-powered automation | Fallback prompts |
| PostgreSQL | Data persistence | Read replica |
| Redis | Caching | Degrade gracefully |

### Schema Dependencies

```typescript
// Required tables
import { clientProfiles, users } from "@/drizzle/schema";
import { credentials } from "@/drizzle/schema-security";
import { subscriptionTiers, userSubscriptions } from "@/drizzle/schema-subscriptions";
```

---

## 12. Risks & Mitigations

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GHL UI changes break automation | High | Medium | Version detection, graceful degradation, alerts |
| Browser session timeouts | Medium | High | Checkpoint saving, automatic retry |
| Cost overruns from long operations | Medium | Medium | Hard timeout limits, cost caps |
| Permission bypass vulnerabilities | Critical | Low | Defense in depth, regular audits |

### Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| High failure rate degrades trust | High | Medium | Anomaly detection, proactive alerts |
| Support burden from complex feature | Medium | High | Comprehensive documentation, guided flows |
| Resource exhaustion from abuse | High | Low | Rate limiting, quotas, monitoring |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GHL API access restrictions | Critical | Low | Relationship management, compliance |
| Competitor feature parity | Medium | Medium | Continuous innovation, deep integration |
| User adoption challenges | High | Medium | Onboarding flows, migration tools |

---

## Appendix

### A. Validation Schemas (Implemented)

```typescript
// Address validation
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

// Branding validation
const brandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  companyName: z.string().optional(),
});

// User invitation validation
const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "user"]).default("user"),
});

// Create sub-account validation
const createSubAccountSchema = z.object({
  businessName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  address: addressSchema.optional(),
  branding: brandingSchema.optional(),
  users: z.array(userSchema).optional(),
  templateSnapshot: z.string().optional(),
  clientProfileId: z.number().int().positive().optional(),
});
```

### B. Cost Estimation Formula

```typescript
// Base costs
const COST_CONSTANTS = {
  baseSessionCost: 0.01,      // Per session
  llmCallCost: 0.003,         // Per LLM call
  browserMinuteCost: 0.01,    // Per minute of browser time
  subAccountCreate: {
    minCost: 0.30,
    maxCost: 0.50,
    estimatedMinutes: 15,
  },
};

// Estimation logic
function estimateSubAccountCreationCost(config: {
  hasUsers: boolean;
  userCount: number;
  hasTemplate: boolean;
  hasBranding: boolean;
}): { minutes: number; cost: number } {
  let minutes = 15;  // Base
  let cost = 0.30;   // Base

  if (config.hasUsers) {
    minutes += config.userCount * 2;
    cost += config.userCount * 0.02;
  }

  if (config.hasTemplate) {
    minutes += 5;
    cost += 0.05;
  }

  if (config.hasBranding) {
    minutes += 3;
    cost += 0.03;
  }

  return { minutes, cost };
}
```

### C. Prometheus Metrics

```prometheus
# Sub-account operations
ghl_subaccount_operations_total{status="completed"} 150
ghl_subaccount_operations_total{status="failed"} 12
ghl_subaccount_cost_total 45.67
ghl_subaccount_duration_avg_ms 1200000
ghl_subaccount_active_operations 3
ghl_subaccount_operations_by_type{type="create"} 100
ghl_subaccount_operations_by_type{type="switch"} 50
ghl_subaccount_operations_by_type{type="list"} 12
```

### D. File Locations

| File | Purpose |
|------|---------|
| `/server/api/routers/subAccounts.ts` | tRPC router with all endpoints |
| `/server/services/subAccountMetrics.service.ts` | Metrics tracking service |
| `/server/services/stagehand.service.ts` | GHL browser automation |
| `/drizzle/schema.ts` | clientProfiles table definition |
| `/drizzle/schema-security.ts` | Credential and control tables |

### E. Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-11 | 1.0.0 | Initial PRD creation | Platform Team |

---

## Related Documents

- [PRD-001: Browser Automation Engine](/docs/prds/core-automation/PRD-001-browser-automation-engine.md)
- [PRD-005: Autonomous Agent System](/docs/prds/ai-agents/PRD-005-autonomous-agent-system.md)
- [GHL Integration Guide](/docs/guides/ghl-integration.md) (TBD)
- [Permission System Design](/docs/architecture/permissions.md) (TBD)
