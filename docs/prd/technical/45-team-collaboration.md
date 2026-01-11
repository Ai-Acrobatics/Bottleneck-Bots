# PRD: Team & Collaboration

## Overview
Implement comprehensive team management and collaboration features enabling organizations to manage users, assign roles with granular permissions, collaborate on bots and workflows, and coordinate task assignments. This system forms the foundation for multi-user organizational usage of Bottleneck-Bots.

## Problem Statement
Individual usage of automation tools is limited; organizations need team collaboration features to scale bot development and management. Without proper team functionality:
- No access control leads to security risks
- Collaboration is blocked by lack of sharing mechanisms
- Accountability is unclear without ownership and audit trails
- Onboarding new team members is difficult
- Work coordination requires external tools

## Goals & Objectives
- **Primary Goals**
  - Implement role-based access control (RBAC) with customizable permission sets
  - Enable resource sharing and collaboration (bots, workflows, credentials)
  - Support organizational hierarchy (organizations, teams, members)
  - Provide task assignment and workload management
  - Maintain complete audit trail of user actions

- **Success Metrics**
  - 80% of organizations create multiple team roles
  - 50% of bots are collaboratively developed (multiple contributors)
  - Zero unauthorized access incidents
  - < 5 minutes to onboard a new team member

## User Stories
- As an org admin, I want to invite team members so that they can contribute to our automation projects
- As an org admin, I want to create custom roles so that I can tailor permissions to job functions
- As a team lead, I want to assign tasks to members so that work is distributed effectively
- As a developer, I want to share my bot with colleagues so that we can collaborate on improvements
- As a security officer, I want to audit user actions so that I can ensure compliance
- As a new member, I want to see what I have access to so that I can start contributing quickly
- As a manager, I want to view team activity so that I understand project progress

## Functional Requirements

### Must Have (P0)
- **Organization Management**: Create, update, delete organizations; org settings and billing
- **User Invitation**: Invite users via email; pending invitation management
- **Role System**: Predefined roles (Owner, Admin, Member, Viewer) with permission sets
- **Permission Controls**: Granular permissions for resources (bots, workflows, credentials, analytics)
- **Resource Ownership**: Clear ownership of bots, workflows with transfer capability
- **Resource Sharing**: Share resources with specific users, teams, or entire org
- **Team Creation**: Create sub-teams within organizations
- **Activity Audit**: Log all user actions with timestamps and details

### Should Have (P1)
- **Custom Roles**: Create organization-specific roles with custom permissions
- **Task Assignment**: Assign tasks to users with due dates and status tracking
- **Comments & Discussion**: Comment threads on bots, workflows, tasks
- **Notifications**: Email and in-app notifications for assignments, mentions, updates
- **User Directory**: Searchable member list with profiles and contact info
- **Team Analytics**: Activity metrics, contribution stats per user/team
- **Access Requests**: Request access to resources with approval workflow

### Nice to Have (P2)
- **SCIM Provisioning**: Automated user provisioning from identity providers
- **SSO Integration**: SAML/OIDC single sign-on support
- **Guest Access**: Limited access for external collaborators
- **Workload Balancing**: Automatic task distribution based on capacity
- **Real-Time Presence**: See who's currently viewing/editing a resource
- **Change Requests**: Approval workflow for production bot modifications
- **Time Tracking**: Optional time tracking for tasks

## Non-Functional Requirements

### Performance
- User list loads < 500ms for organizations with 1000+ members
- Permission checks complete < 10ms
- Invitation emails sent within 30 seconds
- Activity feed loads < 1 second

### Security
- Permissions enforced server-side (never trust client)
- Sensitive actions require re-authentication
- Audit logs immutable and tamper-evident
- PII encrypted at rest
- Session management with timeout and concurrent session limits

### Scalability
- Support organizations with 10,000+ members
- Handle 100+ concurrent users per organization
- Activity logs scale to millions of entries

### Compliance
- GDPR data subject access and deletion
- SOC 2 audit trail requirements
- Data residency options for enterprise

## Technical Requirements

### Architecture
```
/src/features/team/
  ├── components/
  │   ├── member-list.tsx          # Team member directory
  │   ├── member-invite.tsx        # Invitation dialog
  │   ├── role-manager.tsx         # Role assignment UI
  │   ├── permission-editor.tsx    # Custom permission matrix
  │   ├── team-selector.tsx        # Team switcher
  │   ├── activity-feed.tsx        # User activity timeline
  │   └── task-board.tsx           # Task assignment kanban
  ├── hooks/
  │   ├── use-permissions.ts       # Permission checking hook
  │   ├── use-team.ts              # Current team context
  │   └── use-activity.ts          # Activity feed data
  ├── api/
  │   ├── members.router.ts        # Member CRUD endpoints
  │   ├── roles.router.ts          # Role management endpoints
  │   ├── invitations.router.ts    # Invitation endpoints
  │   ├── teams.router.ts          # Team endpoints
  │   └── activity.router.ts       # Activity log endpoints
  └── lib/
      ├── permissions.ts           # Permission definitions
      ├── rbac.ts                  # RBAC logic
      └── audit.ts                 # Audit logging utility
```

### Database Schema
```typescript
// organizations table
{
  id: uuid,
  name: text,
  slug: text unique,
  settings: jsonb,
  plan: enum('free', 'pro', 'enterprise'),
  createdAt: timestamp,
  updatedAt: timestamp
}

// organization_members table
{
  id: uuid,
  organizationId: uuid,
  userId: uuid,
  roleId: uuid,
  status: enum('active', 'suspended', 'pending'),
  joinedAt: timestamp,
  invitedBy: uuid
}

// roles table
{
  id: uuid,
  organizationId: uuid | null,  // null = system role
  name: text,
  description: text,
  permissions: jsonb,  // Permission key array
  isCustom: boolean,
  createdAt: timestamp
}

// teams table
{
  id: uuid,
  organizationId: uuid,
  name: text,
  description: text,
  memberIds: uuid[],
  createdAt: timestamp
}

// invitations table
{
  id: uuid,
  organizationId: uuid,
  email: text,
  roleId: uuid,
  teamIds: uuid[],
  token: text unique,
  expiresAt: timestamp,
  acceptedAt: timestamp | null,
  invitedBy: uuid,
  createdAt: timestamp
}

// resource_shares table
{
  id: uuid,
  resourceType: enum('bot', 'workflow', 'credential'),
  resourceId: uuid,
  sharedWith: uuid,  // user, team, or org id
  shareType: enum('user', 'team', 'organization'),
  permission: enum('view', 'edit', 'admin'),
  sharedBy: uuid,
  createdAt: timestamp
}

// activity_logs table
{
  id: uuid,
  organizationId: uuid,
  userId: uuid,
  action: text,
  resourceType: text,
  resourceId: uuid,
  metadata: jsonb,
  ipAddress: text,
  userAgent: text,
  timestamp: timestamp
}

// tasks table
{
  id: uuid,
  organizationId: uuid,
  title: text,
  description: text,
  assigneeId: uuid,
  assignedBy: uuid,
  status: enum('todo', 'in_progress', 'review', 'done'),
  priority: enum('low', 'medium', 'high', 'urgent'),
  dueDate: timestamp,
  relatedResourceType: text,
  relatedResourceId: uuid,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Permission System
```typescript
// Permission definitions
export const permissions = {
  // Bot permissions
  'bots:create': 'Create new bots',
  'bots:read': 'View bot details',
  'bots:update': 'Edit bot configurations',
  'bots:delete': 'Delete bots',
  'bots:execute': 'Run bots',
  'bots:share': 'Share bots with others',

  // Workflow permissions
  'workflows:create': 'Create workflows',
  'workflows:read': 'View workflows',
  'workflows:update': 'Edit workflows',
  'workflows:delete': 'Delete workflows',

  // Team permissions
  'members:invite': 'Invite new members',
  'members:remove': 'Remove members',
  'members:manage': 'Manage member roles',
  'roles:create': 'Create custom roles',
  'roles:update': 'Modify roles',

  // Admin permissions
  'organization:settings': 'Manage org settings',
  'organization:billing': 'Manage billing',
  'audit:view': 'View audit logs',
} as const;

// Role definitions
export const systemRoles = {
  owner: {
    name: 'Owner',
    permissions: Object.keys(permissions), // All permissions
  },
  admin: {
    name: 'Admin',
    permissions: [
      'bots:*', 'workflows:*', 'members:invite',
      'members:manage', 'audit:view'
    ],
  },
  member: {
    name: 'Member',
    permissions: [
      'bots:create', 'bots:read', 'bots:update', 'bots:execute',
      'workflows:create', 'workflows:read', 'workflows:update',
    ],
  },
  viewer: {
    name: 'Viewer',
    permissions: ['bots:read', 'workflows:read'],
  },
};

// Permission check hook
function usePermission(permission: string): boolean {
  const { user, role } = useAuth();
  return hasPermission(role.permissions, permission);
}

// Server-side permission middleware
const requirePermission = (permission: string) =>
  middleware(async ({ ctx, next }) => {
    if (!hasPermission(ctx.user.permissions, permission)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    return next();
  });
```

### Dependencies
- `@auth/core` or custom auth - Authentication infrastructure
- `resend` - Email delivery for invitations
- `zod` - Permission schema validation
- PostgreSQL row-level security - Database-level access control

### APIs & Integrations
```typescript
// tRPC Router Examples
export const membersRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(/* ... */),

  invite: protectedProcedure
    .use(requirePermission('members:invite'))
    .input(inviteSchema)
    .mutation(/* ... */),

  updateRole: protectedProcedure
    .use(requirePermission('members:manage'))
    .input(updateRoleSchema)
    .mutation(/* ... */),

  remove: protectedProcedure
    .use(requirePermission('members:remove'))
    .input(z.object({ memberId: z.string() }))
    .mutation(/* ... */),
});
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Multi-role adoption | 80% of orgs | Database query |
| Collaborative bots | 50%+ multi-contributor | Contribution analysis |
| Security incidents | Zero unauthorized access | Security monitoring |
| Onboarding time | < 5 minutes | User journey tracking |
| Invitation acceptance rate | > 70% | Invitation analytics |

## Dependencies
- Authentication system (user sessions, tokens)
- Email service for invitations
- Database with relational support
- Real-time infrastructure (for presence, optional)

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Permission bypass vulnerabilities | Critical - Security breach | Server-side enforcement; security audits; automated testing |
| Complex permission debugging | Medium - Support burden | Permission preview UI; comprehensive logging |
| Invitation token abuse | High - Unauthorized access | Token expiration; rate limiting; single-use tokens |
| Audit log storage growth | Medium - Cost/performance | Log archival; aggregation; retention policies |
| Role sprawl in large orgs | Medium - Management overhead | Role templates; permission inheritance; cleanup tools |
| Slow permission checks at scale | Medium - Performance | Permission caching; denormalized permission sets |
