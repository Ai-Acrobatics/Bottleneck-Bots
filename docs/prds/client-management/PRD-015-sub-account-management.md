# PRD-015: Sub-Account Management

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-015 |
| **Feature Name** | Sub-Account Management |
| **Category** | Client Management |
| **Priority** | P1 - High |
| **Status** | Active |
| **Owner** | Platform Team |

---

## 1. Executive Summary

The Sub-Account Management system enables multi-tenant operations where agencies can manage multiple client sub-accounts. It provides data isolation, user role management per sub-account, revenue tracking, and integration with external CRM systems like GoHighLevel.

## 2. Problem Statement

Agencies manage multiple clients who need isolated environments. User permissions must vary by client. Revenue tracking requires per-client granularity. External CRM integration is essential for workflow continuity. Manual sub-account management doesn't scale.

## 3. Goals & Objectives

### Primary Goals
- Enable multi-tenant sub-account architecture
- Provide complete data isolation
- Support role-based access per sub-account
- Track revenue by sub-account

### Success Metrics
| Metric | Target |
|--------|--------|
| Data Isolation | 100% |
| Permission Accuracy | 100% |
| Sub-Account Provisioning | < 1 minute |
| Revenue Attribution Accuracy | 100% |

## 4. User Stories

### US-001: Create Sub-Account
**As an** agency admin
**I want to** create a new sub-account
**So that** I can onboard a new client

**Acceptance Criteria:**
- [ ] Enter sub-account details
- [ ] Configure initial settings
- [ ] Assign users
- [ ] Activate sub-account

### US-002: Manage User Roles
**As a** sub-account admin
**I want to** assign user roles
**So that** team members have appropriate access

**Acceptance Criteria:**
- [ ] Invite users to sub-account
- [ ] Assign predefined roles
- [ ] Customize permissions
- [ ] Remove user access

### US-003: Track Revenue
**As an** agency owner
**I want to** see revenue by sub-account
**So that** I can understand client profitability

**Acceptance Criteria:**
- [ ] View revenue per sub-account
- [ ] See revenue over time
- [ ] Compare sub-accounts
- [ ] Export financial reports

## 5. Functional Requirements

### FR-001: Sub-Account Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Create sub-account | P0 |
| FR-001.2 | Edit sub-account | P0 |
| FR-001.3 | Suspend/Activate sub-account | P0 |
| FR-001.4 | Delete sub-account | P1 |
| FR-001.5 | Sub-account templates | P2 |

### FR-002: Data Isolation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Isolated data storage | P0 |
| FR-002.2 | Cross-account prevention | P0 |
| FR-002.3 | Audit logging | P1 |
| FR-002.4 | Data export | P1 |

### FR-003: User Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Invite users | P0 |
| FR-003.2 | Role assignment | P0 |
| FR-003.3 | Permission customization | P1 |
| FR-003.4 | Remove users | P0 |
| FR-003.5 | View user activity | P2 |

### FR-004: Revenue Tracking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Track revenue events | P0 |
| FR-004.2 | Revenue attribution | P0 |
| FR-004.3 | Revenue reporting | P1 |
| FR-004.4 | Profitability analysis | P2 |

## 6. Data Models

### Sub-Account
```typescript
interface SubAccount {
  id: string;
  agencyId: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'deleted';
  settings: SubAccountSettings;
  externalIds: {
    goHighLevel?: string;
    stripe?: string;
  };
  users: SubAccountUser[];
  revenueTotal: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sub-Account User
```typescript
interface SubAccountUser {
  id: string;
  subAccountId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Permission[];
  status: 'active' | 'invited' | 'suspended';
  invitedAt: Date;
  joinedAt?: Date;
}
```

### Revenue Entry
```typescript
interface RevenueEntry {
  id: string;
  subAccountId: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'service' | 'product' | 'other';
  description?: string;
  externalRef?: string;
  recordedAt: Date;
}
```

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sub-accounts` | List sub-accounts |
| POST | `/api/sub-accounts` | Create sub-account |
| GET | `/api/sub-accounts/:id` | Get sub-account |
| PUT | `/api/sub-accounts/:id` | Update sub-account |
| DELETE | `/api/sub-accounts/:id` | Delete sub-account |
| POST | `/api/sub-accounts/:id/users` | Add user |
| DELETE | `/api/sub-accounts/:id/users/:userId` | Remove user |
| PUT | `/api/sub-accounts/:id/users/:userId/role` | Update role |
| GET | `/api/sub-accounts/:id/revenue` | Get revenue |
| POST | `/api/sub-accounts/:id/revenue` | Record revenue |

## 8. Role Permissions

| Permission | Owner | Admin | Member | Viewer |
|------------|-------|-------|--------|--------|
| View sub-account | ✓ | ✓ | ✓ | ✓ |
| Edit settings | ✓ | ✓ | - | - |
| Manage users | ✓ | ✓ | - | - |
| View revenue | ✓ | ✓ | - | - |
| Delete sub-account | ✓ | - | - | - |
| Create content | ✓ | ✓ | ✓ | - |
| Delete content | ✓ | ✓ | - | - |

## 9. Data Isolation Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Agency Level                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Sub-Account │  │ Sub-Account │  │ Sub-Account │      │
│  │      A      │  │      B      │  │      C      │      │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤      │
│  │ - Users     │  │ - Users     │  │ - Users     │      │
│  │ - Data      │  │ - Data      │  │ - Data      │      │
│  │ - Settings  │  │ - Settings  │  │ - Settings  │      │
│  │ - Revenue   │  │ - Revenue   │  │ - Revenue   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
│         ↑ Complete Data Isolation ↑                      │
└─────────────────────────────────────────────────────────┘
```

## 10. GoHighLevel Integration

- Sync sub-account data
- Map users to GHL contacts
- Sync pipeline data
- Revenue attribution

## 11. Dependencies

| Dependency | Purpose |
|------------|---------|
| Auth System | User management |
| Database | Data isolation |
| GoHighLevel API | CRM sync |
| Stripe | Revenue tracking |

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data leakage | Critical | Strict isolation, auditing |
| Permission errors | High | Testing, defaults |
| Sync failures | Medium | Retry, monitoring |

---

## Appendix

### A. Changelog
| Date | Version | Changes |
|------|---------|---------|
| 2024-01-11 | 1.0 | Initial PRD creation |
