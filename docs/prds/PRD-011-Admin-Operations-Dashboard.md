# PRD-011: Admin & Operations Dashboard

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `client/src/pages/admin/`, `client/src/components/agent/`, `server/api/routers/admin/`, `server/api/routers/health.ts`

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

The Admin & Operations Dashboard provides a comprehensive administrative interface for system operators, administrators, and technical staff to monitor, manage, and control the Bottleneck-Bots platform. This feature consolidates user management, system health monitoring, audit logging, configuration management, and agent execution oversight into a unified dashboard experience.

### 1.1 Feature Summary

| Component | Description | Primary File |
|-----------|-------------|--------------|
| **Admin Dashboard** | Central hub for user management, cost monitoring, and system health | `AdminDashboard.tsx` |
| **System Health Monitor** | Real-time API health checks, database connectivity, and service status | `SystemHealth.tsx`, `health.ts` |
| **Audit Log** | Complete action history with 9+ event type filters and date range filtering | `AuditLog.tsx` |
| **Config Center** | Feature flags, system configuration, and maintenance mode management | `ConfigCenter.tsx` |
| **User Management** | User provisioning, role assignment, and account suspension | `UserManagement.tsx` |
| **Agent Dashboard** | Monitor active AI agents, execution metrics, and swarm coordination | `AgentDashboard.tsx` (17KB) |
| **Execution Monitor** | Step-by-step task visualization with live browser view | `ExecutionMonitor.tsx` (21KB) |
| **Execution History** | Complete audit trail of all agent executions | Integrated components |

### 1.2 Target Users

- **System Administrators**: Platform operators managing users and configurations
- **DevOps Engineers**: Infrastructure monitoring and health management
- **Security Officers**: Audit trail review and compliance monitoring
- **Technical Support**: User troubleshooting and issue investigation
- **Operations Managers**: Cost monitoring and resource optimization

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Fragmented Administration**: Admin tasks are scattered across multiple interfaces and require technical knowledge
2. **Limited Visibility**: No centralized view of system health, user activity, and resource utilization
3. **Manual Configuration**: System settings require code changes or database access
4. **Audit Gap**: Insufficient tracking of administrative actions and system events
5. **Reactive Operations**: Issues discovered after user complaints rather than proactive monitoring
6. **Cost Blindness**: No real-time visibility into AI service costs and resource consumption
7. **Agent Opacity**: Lack of insight into AI agent decision-making and execution progress

### 2.2 User Pain Points

| Persona | Pain Point |
|---------|------------|
| System Admin | "I need to check multiple systems to understand platform health" |
| DevOps | "Database issues are discovered too late, causing user-facing outages" |
| Security | "I cannot quickly investigate suspicious user activity patterns" |
| Support | "Finding user issues requires SSH access to production servers" |
| Operations | "I have no idea what our AI costs are until the monthly bill arrives" |

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| No centralized monitoring | 4+ hours/week spent gathering system status |
| Manual configuration changes | 2-3 days deployment cycle for simple config changes |
| Missing audit trails | Compliance risk and incident investigation delays |
| Delayed issue detection | 30+ minute MTTR for critical issues |
| Cost visibility gap | 15-25% budget overruns due to unexpected AI usage |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Provide unified admin dashboard with real-time system visibility | P0 |
| **G2** | Enable comprehensive audit logging with 9+ event types | P0 |
| **G3** | Support dynamic configuration without code deployments | P0 |
| **G4** | Deliver real-time agent execution monitoring | P1 |
| **G5** | Implement role-based access control for admin functions | P0 |
| **G6** | Provide cost monitoring and usage analytics | P1 |

### 3.2 Success Metrics (KPIs)

#### Operational Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Mean Time to Detection (MTTD) | < 5 minutes | Time from issue occurrence to alert |
| Admin Task Completion Time | < 2 minutes | Average time for common admin tasks |
| System Health Visibility | 100% | All critical services monitored |
| Configuration Deployment Time | < 30 seconds | Time from toggle to effect |

#### Audit & Compliance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Event Capture Rate | 100% | All admin actions logged |
| Audit Query Response | < 500ms | P95 for filtered queries |
| Data Retention | 90 days | Minimum audit log retention |
| Export Capability | JSON/CSV | Supported export formats |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Dashboard Load Time | < 2 seconds | P95 page load |
| Auto-Refresh Interval | 30 seconds | Real-time data updates |
| Error Feedback | < 100ms | User action feedback time |
| Mobile Responsiveness | 100% | All views mobile-compatible |

#### Agent Monitoring Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Execution Visibility | 100% | All running agents visible |
| Step Tracking Accuracy | >= 95% | Correct step count/status |
| Live View Latency | < 2 seconds | Browser stream delay |
| History Retention | 30 days | Execution log retention |

---

## 4. User Stories & Personas

### 4.1 Personas

#### Persona 1: Sarah - System Administrator
- **Role**: Platform Administrator
- **Goals**: Manage users, configure system settings, ensure platform stability
- **Technical Level**: Intermediate
- **Primary Tasks**: User provisioning, role assignment, feature flag management

#### Persona 2: Marcus - DevOps Engineer
- **Role**: Infrastructure Operations
- **Goals**: Monitor system health, respond to incidents, optimize performance
- **Technical Level**: Advanced
- **Primary Tasks**: Health monitoring, circuit breaker management, performance analysis

#### Persona 3: Elena - Security Officer
- **Role**: Security & Compliance
- **Goals**: Audit user activity, investigate incidents, ensure compliance
- **Technical Level**: Intermediate
- **Primary Tasks**: Audit log review, access pattern analysis, compliance reporting

#### Persona 4: James - Technical Support
- **Role**: Customer Support Lead
- **Goals**: Troubleshoot user issues, monitor agent executions, resolve failures
- **Technical Level**: Intermediate
- **Primary Tasks**: User lookup, execution monitoring, issue investigation

### 4.2 User Stories

#### US-001: Dashboard Overview
**As a** system administrator
**I want to** see a unified dashboard with key metrics
**So that** I can quickly assess platform health and activity

**Acceptance Criteria:**
- Dashboard displays total users, active sessions, running workflows, and pending jobs
- MCP server connection status is visible (connected/disconnected)
- Deployment status shows production and preview environments
- Recent activity feed shows last 5 system events
- Auto-refresh every 30 seconds with visual indicator
- System health badge shows overall status (Healthy/Degraded)

#### US-002: User Management
**As a** system administrator
**I want to** manage user accounts from a central interface
**So that** I can provision, modify, and suspend users efficiently

**Acceptance Criteria:**
- List all users with pagination (20 per page)
- Search users by name or email with debounced input (300ms)
- Filter by role (admin/user) and status (active/pending)
- Change user role between admin and user
- Suspend user accounts with optional reason
- Unsuspend suspended accounts
- View user statistics (total, by role, new this month)

#### US-003: Audit Log Review
**As a** security officer
**I want to** review comprehensive audit logs with filtering
**So that** I can investigate incidents and ensure compliance

**Acceptance Criteria:**
- View unified audit trail from multiple sources
- Filter by 9+ event types: api_request, workflow, browser_session, job, user_signin
- Filter by date range using calendar picker
- Filter by user ID
- Expand entries to view detailed JSON metadata
- View 24-hour and 7-day statistics summary
- Pagination with 20 entries per page

#### US-004: System Health Monitoring
**As a** DevOps engineer
**I want to** monitor real-time system health
**So that** I can detect and respond to issues proactively

**Acceptance Criteria:**
- View CPU usage with percentage and core count
- View memory usage with used/total and percentage
- View system uptime in days/hours/minutes format
- Check database connectivity with response time
- Monitor 6 external services: Database, Browserbase, OpenAI, Anthropic, Stripe, Email
- View database statistics (row counts per table)
- Auto-refresh every 30 seconds

#### US-005: Configuration Management
**As a** system administrator
**I want to** manage feature flags and system configuration
**So that** I can enable features and adjust settings without deployments

**Acceptance Criteria:**
- List all feature flags with name, description, rollout percentage
- Create new feature flags with name, description, enabled state
- Toggle feature flags on/off with instant effect
- Configure rollout percentage (0-100%)
- Manage system configuration key-value pairs
- Support value types: string, number, boolean, JSON
- Enable/disable maintenance mode with message

#### US-006: Agent Execution Monitoring
**As a** technical support lead
**I want to** monitor AI agent executions in real-time
**So that** I can troubleshoot issues and verify task completion

**Acceptance Criteria:**
- View active tasks count and completion rate
- See average response time and connected swarm agents
- Monitor current execution with progress bar and step count
- View recent execution history with status badges
- Pause/resume executing tasks
- Terminate running tasks with confirmation
- View execution logs in real-time

#### US-007: Execution Detail View
**As a** technical support lead
**I want to** inspect individual execution details
**So that** I can understand exactly what happened during task execution

**Acceptance Criteria:**
- View execution overview with progress and current step
- Navigate through step timeline with action types and durations
- View screenshots gallery captured during execution
- Filter and search execution logs by level (info/warn/error/debug)
- Export logs as JSON or TXT format
- Copy all logs to clipboard
- Control log auto-scroll behavior

#### US-008: Circuit Breaker Management
**As a** DevOps engineer
**I want to** monitor and manage circuit breakers
**So that** I can handle service failures gracefully

**Acceptance Criteria:**
- View circuit breaker states for all services (vapi, apify, browserbase, openai, anthropic, gmail, outlook)
- See failure counts, success counts, and total requests per service
- View state (open/closed/half-open) with visual indicators
- Reset individual circuit breakers
- Reset all circuit breakers (admin only)
- View service availability summary with percentages

---

## 5. Functional Requirements

### 5.1 Admin Dashboard

#### FR-001: Dashboard Overview
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Display total user count with new users this month | P0 |
| FR-001.2 | Show active sessions count and active browser sessions | P0 |
| FR-001.3 | Display running workflows count | P0 |
| FR-001.4 | Show pending jobs count | P0 |
| FR-001.5 | Display MCP server connection status (connected/disconnected) | P1 |
| FR-001.6 | Show deployment status for production and preview environments | P1 |
| FR-001.7 | Auto-refresh all metrics every 30 seconds | P0 |
| FR-001.8 | Display last update timestamp | P0 |

#### FR-002: Recent Activity Feed
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Show last 5 activity entries from audit log | P0 |
| FR-002.2 | Display activity type with appropriate icon | P0 |
| FR-002.3 | Show user name, email, and relative timestamp | P0 |
| FR-002.4 | Display status indicator (success/failed/running) | P0 |
| FR-002.5 | Provide "View All" link to full audit log | P0 |

#### FR-003: Quick Actions
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Provide quick navigation to User Management | P0 |
| FR-003.2 | Provide quick navigation to System Health | P0 |
| FR-003.3 | Provide quick navigation to Audit Logs | P0 |
| FR-003.4 | Provide quick navigation to Configuration | P0 |

### 5.2 System Health Monitor

#### FR-004: System Resources
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Display CPU core count and model | P0 |
| FR-004.2 | Calculate and display CPU usage percentage | P0 |
| FR-004.3 | Display memory used/total with usage percentage | P0 |
| FR-004.4 | Show system uptime in human-readable format | P0 |
| FR-004.5 | Display hostname, platform, and architecture | P1 |
| FR-004.6 | Show Node.js version and process memory | P1 |

#### FR-005: Service Status
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Check database connectivity with response time | P0 |
| FR-005.2 | Verify Browserbase API key configuration | P0 |
| FR-005.3 | Verify OpenAI API key configuration | P0 |
| FR-005.4 | Verify Anthropic API key configuration | P0 |
| FR-005.5 | Verify Stripe API key configuration | P1 |
| FR-005.6 | Verify email service (Resend) configuration | P1 |
| FR-005.7 | Display status badge (Online/Configured/Not Configured) | P0 |

#### FR-006: Database Statistics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Display row count for users table | P0 |
| FR-006.2 | Display row count for sessions table | P0 |
| FR-006.3 | Display row count for browser_sessions table | P0 |
| FR-006.4 | Display row count for workflows table | P0 |
| FR-006.5 | Display row count for jobs table | P0 |
| FR-006.6 | Calculate and display total records | P0 |

### 5.3 Audit Log

#### FR-007: Event Filtering
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Filter by event type: all, api_request, workflow, browser_session, job, user_signin | P0 |
| FR-007.2 | Filter by start date using calendar picker | P0 |
| FR-007.3 | Filter by end date using calendar picker | P0 |
| FR-007.4 | Filter by user ID (numeric input with validation) | P0 |
| FR-007.5 | Sort by timestamp ascending or descending | P0 |
| FR-007.6 | Clear date filters with single action | P1 |

#### FR-008: Event Display
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Display event timestamp in localized format | P0 |
| FR-008.2 | Show event type with color-coded badge | P0 |
| FR-008.3 | Display user name and email | P0 |
| FR-008.4 | Expandable row to view full event details | P0 |
| FR-008.5 | Display details as formatted JSON | P0 |
| FR-008.6 | Show total entry count and current page | P0 |

#### FR-009: Statistics Summary
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Display API requests count for last 24 hours and 7 days | P0 |
| FR-009.2 | Display workflow count for last 24 hours and 7 days | P0 |
| FR-009.3 | Display browser sessions count for last 24 hours and 7 days | P0 |
| FR-009.4 | Display user sign-ins count for last 24 hours and 7 days | P0 |

### 5.4 Configuration Center

#### FR-010: Feature Flags
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | List all feature flags with name, description, status | P0 |
| FR-010.2 | Create new feature flag with name and description | P0 |
| FR-010.3 | Toggle feature flag enabled/disabled | P0 |
| FR-010.4 | Configure rollout percentage (0-100%) | P0 |
| FR-010.5 | Edit existing feature flag properties | P0 |
| FR-010.6 | Delete feature flag with confirmation | P0 |
| FR-010.7 | Copy flag name to clipboard | P1 |
| FR-010.8 | Prevent duplicate flag names | P0 |

#### FR-011: System Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | List all system configurations by key | P0 |
| FR-011.2 | Create new configuration with key, value, description | P0 |
| FR-011.3 | Support value types: string, number, boolean, JSON | P0 |
| FR-011.4 | Validate JSON format for JSON type | P0 |
| FR-011.5 | Update existing configuration values | P0 |
| FR-011.6 | Delete configuration with confirmation | P0 |
| FR-011.7 | Display value type badge | P1 |

#### FR-012: Maintenance Mode
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Toggle maintenance mode on/off | P0 |
| FR-012.2 | Display current maintenance mode status prominently | P0 |
| FR-012.3 | Set custom maintenance message | P1 |
| FR-012.4 | Show warning when maintenance mode is active | P0 |

### 5.5 User Management

#### FR-013: User Listing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | List users with pagination (20 per page) | P0 |
| FR-013.2 | Display name, email, role, status, last login, created date | P0 |
| FR-013.3 | Search by name or email with 300ms debounce | P0 |
| FR-013.4 | Filter by role (all/admin/user) | P0 |
| FR-013.5 | Filter by onboarding status (all/completed/pending) | P0 |
| FR-013.6 | Sort by created date descending | P0 |

#### FR-014: User Actions
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Change user role (admin to user, user to admin) | P0 |
| FR-014.2 | Suspend user account with optional reason | P0 |
| FR-014.3 | Unsuspend suspended account | P0 |
| FR-014.4 | Confirmation dialog for all destructive actions | P0 |
| FR-014.5 | Display success/error toast notifications | P0 |

#### FR-015: User Statistics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Display total user count | P0 |
| FR-015.2 | Display admin count | P0 |
| FR-015.3 | Display regular user count | P0 |
| FR-015.4 | Display new users this month | P0 |

### 5.6 Agent Dashboard

#### FR-016: Agent Metrics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Display active tasks count | P0 |
| FR-016.2 | Calculate and display completion rate | P0 |
| FR-016.3 | Display average response time | P0 |
| FR-016.4 | Show connected swarm agents count | P0 |
| FR-016.5 | Display trend indicators where applicable | P1 |

#### FR-017: Task Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | Input field for new task descriptions | P0 |
| FR-017.2 | Execute task with subscription limit check | P0 |
| FR-017.3 | Display current execution with progress bar | P0 |
| FR-017.4 | Show current step count (X of Y steps) | P0 |
| FR-017.5 | Pause/resume executing tasks | P1 |
| FR-017.6 | Terminate running tasks with confirmation | P1 |
| FR-017.7 | Show estimated time remaining | P1 |

#### FR-018: Execution History
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | List recent executions with status badges | P0 |
| FR-018.2 | Display task description, status, start time, duration | P0 |
| FR-018.3 | Show error message for failed executions | P0 |
| FR-018.4 | Scrollable list with empty state | P0 |
| FR-018.5 | Click to view execution details | P1 |

#### FR-019: Real-Time Features
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-019.1 | SSE connection for real-time agent updates | P0 |
| FR-019.2 | Connection status indicator (connected/disconnected) | P0 |
| FR-019.3 | Live execution log display | P0 |
| FR-019.4 | Browser live view when session is active | P1 |
| FR-019.5 | Reasoning chain visualization | P1 |

### 5.7 Execution Monitor

#### FR-020: Execution Overview
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020.1 | Display execution ID and task ID | P0 |
| FR-020.2 | Show execution status with appropriate badge | P0 |
| FR-020.3 | Display progress bar with step count | P0 |
| FR-020.4 | Show current step description | P0 |
| FR-020.5 | Display started time and duration | P0 |
| FR-020.6 | Show error details for failed executions | P0 |

#### FR-021: Step Timeline
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-021.1 | Display all execution steps in timeline format | P0 |
| FR-021.2 | Show step number, action, target, status, duration | P0 |
| FR-021.3 | Visual indicators for completed/running/pending steps | P0 |
| FR-021.4 | Action type icons (navigate, click, type, etc.) | P1 |
| FR-021.5 | Playback controls (step back, step forward) | P1 |
| FR-021.6 | Playback speed control (1x, 2x, 5x) | P2 |

#### FR-022: Screenshots Gallery
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-022.1 | Display screenshots captured during execution | P1 |
| FR-022.2 | Show timestamp and step number per screenshot | P1 |
| FR-022.3 | Optional description per screenshot | P2 |
| FR-022.4 | Click to view full-size screenshot | P1 |

#### FR-023: Execution Logs
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-023.1 | Display all execution log entries | P0 |
| FR-023.2 | Filter by log level (all/info/warn/error/debug) | P0 |
| FR-023.3 | Search within log messages | P0 |
| FR-023.4 | Show timestamp with milliseconds | P0 |
| FR-023.5 | Display metadata as expandable JSON | P0 |
| FR-023.6 | Auto-scroll with pause/resume control | P0 |
| FR-023.7 | Export logs as JSON | P0 |
| FR-023.8 | Export logs as TXT | P0 |
| FR-023.9 | Copy all logs to clipboard | P0 |

### 5.8 Health Check API

#### FR-024: Circuit Breaker Monitoring
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-024.1 | Get overall system health with circuit breaker states | P0 |
| FR-024.2 | Get detailed circuit breaker states per service | P0 |
| FR-024.3 | Get health for specific service (vapi, apify, browserbase, openai, anthropic, gmail, outlook) | P0 |
| FR-024.4 | Reset specific circuit breaker (admin only) | P0 |
| FR-024.5 | Reset all circuit breakers (admin only) | P0 |
| FR-024.6 | Get service availability summary with percentages | P0 |

#### FR-025: Health Probes
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-025.1 | Liveness probe endpoint returning OK status | P0 |
| FR-025.2 | Readiness probe checking critical services | P0 |
| FR-025.3 | Metrics endpoint with aggregate statistics | P0 |
| FR-025.4 | Browserbase health check with configuration status | P0 |
| FR-025.5 | Database health check with Drizzle and Supabase status | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Dashboard page load time | < 2 seconds (P95) | P0 |
| NFR-002 | API response time for list queries | < 500ms (P95) | P0 |
| NFR-003 | Audit log query with filters | < 1 second (P95) | P0 |
| NFR-004 | Real-time updates via SSE | < 200ms latency | P1 |
| NFR-005 | Auto-refresh interval | 30 seconds | P0 |
| NFR-006 | Debounced search delay | 300ms | P0 |
| NFR-007 | Pagination limit | 20-100 items per page | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Concurrent admin users | Support 50+ simultaneous admins | P1 |
| NFR-009 | Audit log entries | Support 10M+ entries with efficient queries | P1 |
| NFR-010 | User count | Support 100K+ users in listing | P1 |
| NFR-011 | Feature flags | Support 500+ flags | P2 |
| NFR-012 | Configuration entries | Support 1000+ configurations | P2 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-013 | Admin dashboard availability | 99.9% uptime | P0 |
| NFR-014 | Audit log durability | 99.99% data retention | P0 |
| NFR-015 | Configuration change reliability | 100% persistence guarantee | P0 |
| NFR-016 | Graceful degradation | Dashboard functional with service failures | P1 |
| NFR-017 | Circuit breaker recovery | Automatic recovery within 30 seconds | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-018 | All admin endpoints require adminProcedure middleware | P0 |
| NFR-019 | Admin role verification on every request | P0 |
| NFR-020 | All admin actions logged to audit trail | P0 |
| NFR-021 | Sensitive configuration values encrypted at rest | P0 |
| NFR-022 | API key values never displayed in full | P0 |
| NFR-023 | Session validation before admin operations | P0 |
| NFR-024 | Rate limiting on admin endpoints (100 req/min) | P1 |
| NFR-025 | CSRF protection on mutation endpoints | P0 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-026 | Structured logging for all admin operations | P0 |
| NFR-027 | Error tracking with full context (user ID, action, timestamp) | P0 |
| NFR-028 | Performance metrics collection | P1 |
| NFR-029 | Health check endpoints for monitoring integration | P0 |
| NFR-030 | Alert thresholds for system health degradation | P1 |

### 6.6 Accessibility Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-031 | WCAG 2.1 AA compliance | P1 |
| NFR-032 | Keyboard navigation support | P1 |
| NFR-033 | Screen reader compatibility | P1 |
| NFR-034 | Color contrast ratios meeting standards | P1 |
| NFR-035 | Touch targets minimum 44x44px on mobile | P1 |

### 6.7 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-036 | TypeScript strict mode | P0 |
| NFR-037 | Zod schema validation on all inputs | P0 |
| NFR-038 | Component-based architecture with shadcn/ui | P0 |
| NFR-039 | tRPC for type-safe API communication | P0 |
| NFR-040 | Test coverage >= 80% for admin routers | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Admin Frontend (React)                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │AdminDashboard  │  │ SystemHealth   │  │   AuditLog     │  │ConfigCenter│ │
│  │ - Stats Cards  │  │ - Resources    │  │ - Filters      │  │- Flags     │ │
│  │ - Activity     │  │ - Services     │  │ - Timeline     │  │- Configs   │ │
│  │ - Quick Actions│  │ - Database     │  │ - Export       │  │- Maint Mode│ │
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────┘ │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │UserManagement  │  │ AgentDashboard │  │ExecutionMonitor│                 │
│  │ - User List    │  │ - Metrics      │  │ - Steps        │                 │
│  │ - Role Change  │  │ - Task Input   │  │ - Screenshots  │                 │
│  │ - Suspend      │  │ - History      │  │ - Logs         │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                 │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ tRPC + SSE
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Admin API Layer (tRPC)                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           adminRouter                                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │usersRouter│ │systemRouter│ │auditRouter│ │configRouter│ │healthRouter│ │
│  │  │- list    │  │- getHealth│  │- list    │  │- flags.*  │  │- liveness │ │
│  │  │- getStats│  │- getStats │  │- getByUser│ │- config.* │  │- readiness│ │
│  │  │- suspend │  │- getService│ │- getStats │  │- maint.*  │  │- metrics  │ │
│  │  │- unsuspend│ │- getDbStats│ │- getApi..│  │           │  │- circuits │ │
│  │  │- updateRole│ │           │ │           │  │           │  │           │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌───────────────┐            ┌───────────────────┐          ┌───────────────────┐
│   Database    │            │ Circuit Breaker   │          │   External        │
│   (Drizzle)   │            │    Registry       │          │   Services        │
│               │            │                   │          │                   │
│ - users       │            │ - vapi            │          │ - Browserbase     │
│ - sessions    │            │ - apify           │          │ - OpenAI          │
│ - browser_*   │            │ - browserbase     │          │ - Anthropic       │
│ - workflows   │            │ - openai          │          │ - Stripe          │
│ - jobs        │            │ - anthropic       │          │ - Resend          │
│ - feature_*   │            │ - gmail           │          │                   │
│ - system_*    │            │ - outlook         │          │                   │
└───────────────┘            └───────────────────┘          └───────────────────┘
```

### 7.2 Component Architecture

#### 7.2.1 Frontend Components

**AdminLayout** (`components/admin/AdminLayout.tsx`)
- Wraps all admin pages with consistent navigation
- Includes AdminNav sidebar component
- Handles admin-only access control

**AdminDashboard** (`pages/admin/AdminDashboard.tsx`)
- Uses tRPC queries with 30-second refetch interval
- StatCard component for metric display
- ServiceStatus component for external service indicators
- MCPServerStatus for MCP connection display
- DeploymentStatus for Vercel integration

**SystemHealth** (`pages/admin/SystemHealth.tsx`)
- HealthMetricCard for CPU, memory, uptime display
- ServiceStatusItem for external service checks
- DatabaseTableRow for table statistics
- Progress bars with color-coded thresholds

**AuditLog** (`pages/admin/AuditLog.tsx`)
- Collapsible table rows for entry details
- Calendar popover for date range selection
- Badge components for event type visualization
- Pagination with offset-based navigation

**ConfigCenter** (`pages/admin/ConfigCenter.tsx`)
- Dialog components for create/edit operations
- Switch components for toggle actions
- AlertDialog for delete confirmations
- JSON editor with validation for complex values

**UserManagement** (`pages/admin/UserManagement.tsx`)
- Debounced search input
- DropdownMenu for action selection
- AlertDialog for suspend/role change confirmations
- Stats cards for user counts

**AgentDashboard** (`components/agent/AgentDashboard.tsx`)
- Integration with useAgentSSE hook
- useAgentStore for state management
- SubscriptionUsageCard for limits display
- BrowserLiveView for session preview
- ReasoningChain for decision visualization

**ExecutionMonitor** (`components/ExecutionMonitor.tsx`)
- Tabs for Overview, Steps, Screenshots, Logs
- StepTimeline component for step visualization
- ScreenshotGallery for captured images
- ScrollArea with auto-scroll control
- Export functionality for logs

#### 7.2.2 Backend Routers

**usersRouter** (`server/api/routers/admin/users.ts`)
- list: Paginated user listing with filters
- getStats: Aggregate user statistics
- suspend/unsuspend: Account management
- updateRole: Role assignment

**systemRouter** (`server/api/routers/admin/system.ts`)
- getHealth: CPU, memory, uptime, database
- getStats: Session, workflow, job counts
- getServiceStatus: External service configuration check
- getDatabaseStats: Table row counts
- getRecentActivity: Last N hours of activity

**auditRouter** (`server/api/routers/admin/audit.ts`)
- list: Unified audit log from multiple sources
- getByUser: User-specific activity trail
- getApiRequests: API request log filtering
- getStats: 24h and 7d event counts

**configRouter** (`server/api/routers/admin/config.ts`)
- flags.list/create/update/delete/toggle: Feature flag CRUD
- config.list/get/upsert/delete: System config CRUD
- maintenance.get/set: Maintenance mode control

**healthRouter** (`server/api/routers/health.ts`)
- getSystemHealth: Overall health with circuits
- getCircuitStates: Detailed circuit breaker info
- getServiceHealth: Per-service health
- resetCircuit/resetAllCircuits: Circuit management
- getServiceAvailability: Availability percentages
- liveness/readiness: Kubernetes probes
- getMetrics: Aggregate request metrics

### 7.3 Data Flow

#### Admin Dashboard Load
```
1. User navigates to /admin
                    ▼
2. AdminLayout verifies admin role
                    ▼
3. AdminDashboard renders and initiates queries:
   - admin.system.getStats
   - admin.system.getServiceStatus
   - admin.audit.list (limit: 5)
   - admin.users.getStats
   - admin.system.getHealth
                    ▼
4. All queries fetch in parallel
                    ▼
5. Components render with loading skeletons
                    ▼
6. Data populates components
                    ▼
7. Auto-refresh triggers every 30 seconds
```

#### Audit Log Query Flow
```
1. User applies filter (event type, date, user ID)
                    ▼
2. Component resets to page 1
                    ▼
3. admin.audit.list called with filter params
                    ▼
4. Backend aggregates from multiple tables:
   - apiRequestLogs
   - workflowExecutions
   - browserSessions
   - jobs
   - users (for signin)
                    ▼
5. Results merged and sorted by timestamp
                    ▼
6. Pagination applied (offset, limit)
                    ▼
7. Response returned with entries and pagination info
```

#### Feature Flag Toggle Flow
```
1. Admin clicks toggle switch
                    ▼
2. Optimistic update applied to UI
                    ▼
3. admin.config.flags.toggle mutation called
                    ▼
4. Backend updates database
                    ▼
5. Audit log entry created
                    ▼
6. Success toast displayed
                    ▼
7. Query cache invalidated
```

---

## 8. API Specifications

### 8.1 Admin Users Router

| Endpoint | Method | Input | Response | Description |
|----------|--------|-------|----------|-------------|
| `admin.users.list` | Query | `{ limit, offset, search?, role?, onboardingCompleted?, sortBy, sortOrder }` | `{ users, pagination }` | List users with filters |
| `admin.users.getStats` | Query | - | `{ total, byRole, newThisMonth }` | User statistics |
| `admin.users.suspend` | Mutation | `{ userId, reason? }` | `{ success, message }` | Suspend user |
| `admin.users.unsuspend` | Mutation | `{ userId }` | `{ success, message }` | Unsuspend user |
| `admin.users.updateRole` | Mutation | `{ userId, role: 'admin' | 'user' }` | `{ success, message }` | Change role |

### 8.2 Admin System Router

| Endpoint | Method | Input | Response | Description |
|----------|--------|-------|----------|-------------|
| `admin.system.getHealth` | Query | - | `{ status, timestamp, database, system, process, environment }` | System health |
| `admin.system.getStats` | Query | - | `{ users, sessions, workflows, jobs, api, timestamp }` | Real-time stats |
| `admin.system.getRecentActivity` | Query | `{ limit, hours }` | `{ signins, newUsers, browserSessions, workflows, jobs }` | Recent activity |
| `admin.system.getServiceStatus` | Query | - | `{ status, services, timestamp }` | Service configuration status |
| `admin.system.getDatabaseStats` | Query | - | `{ tables, totalRecords, timestamp }` | Database statistics |

### 8.3 Admin Audit Router

| Endpoint | Method | Input | Response | Description |
|----------|--------|-------|----------|-------------|
| `admin.audit.list` | Query | `{ limit, offset, userId?, eventType, startDate?, endDate?, sortOrder }` | `{ entries, pagination, filters }` | Audit entries |
| `admin.audit.getByUser` | Query | `{ userId, limit, offset, eventType }` | `{ user, activities, pagination, stats }` | User activity |
| `admin.audit.getApiRequests` | Query | `{ limit, offset, userId?, statusCode?, method?, startDate?, endDate? }` | `{ logs, pagination, filters }` | API request logs |
| `admin.audit.getStats` | Query | - | `{ apiRequests, workflows, browserSessions, userSignins, timestamp }` | Audit statistics |

### 8.4 Admin Config Router

| Endpoint | Method | Input | Response | Description |
|----------|--------|-------|----------|-------------|
| `admin.config.flags.list` | Query | - | `{ flags }` | List feature flags |
| `admin.config.flags.create` | Mutation | `{ name, description?, enabled, rolloutPercentage, userWhitelist?, metadata? }` | `{ success, flag, message }` | Create flag |
| `admin.config.flags.update` | Mutation | `{ id, name?, description?, enabled?, rolloutPercentage?, userWhitelist?, metadata? }` | `{ success, flag, message }` | Update flag |
| `admin.config.flags.delete` | Mutation | `{ id }` | `{ success, message }` | Delete flag |
| `admin.config.flags.toggle` | Mutation | `{ id, enabled }` | `{ success, flag, message }` | Toggle flag |
| `admin.config.config.list` | Query | - | `{ configs }` | List configurations |
| `admin.config.config.get` | Query | `{ key }` | `{ config }` | Get configuration |
| `admin.config.config.upsert` | Mutation | `{ key, value, description? }` | `{ success, config, message }` | Create/update config |
| `admin.config.config.delete` | Mutation | `{ key }` | `{ success, message }` | Delete config |
| `admin.config.maintenance.get` | Query | - | `{ enabled, message }` | Get maintenance status |
| `admin.config.maintenance.set` | Mutation | `{ enabled, message? }` | `{ success, enabled, message }` | Set maintenance mode |

### 8.5 Health Router

| Endpoint | Method | Input | Response | Description |
|----------|--------|-------|----------|-------------|
| `health.getSystemHealth` | Query | - | `{ healthy, timestamp, circuits }` | Overall health |
| `health.getCircuitStates` | Query | - | `{ [serviceName]: CircuitState }` | Circuit breaker states |
| `health.getServiceHealth` | Query | `{ serviceName }` | `{ exists, serviceName, state?, health? }` | Service health |
| `health.resetCircuit` | Mutation (Admin) | `{ serviceName }` | `{ success, serviceName, message }` | Reset circuit |
| `health.resetAllCircuits` | Mutation (Admin) | - | `{ success, message }` | Reset all circuits |
| `health.getServiceAvailability` | Query | - | `{ available, unavailable, degraded, totalServices, availabilityPercentage }` | Availability summary |
| `health.liveness` | Query | - | `{ status: 'ok', timestamp }` | Liveness probe |
| `health.readiness` | Query | - | `{ ready, timestamp, unavailableServices, reasons }` | Readiness probe |
| `health.getMetrics` | Query | - | `{ timestamp, totalRequests, totalFailures, totalSuccesses, overallFailureRate, overallSuccessRate, services, healthSummary }` | Aggregate metrics |
| `health.getBrowserbaseHealth` | Query | - | `{ healthy, status, details }` | Browserbase health |
| `health.getDatabaseHealth` | Query | - | `{ healthy, timestamp, drizzle, supabase }` | Database health |

---

## 9. Data Models

### 9.1 Database Schema

```sql
-- Feature Flags (schema-admin.ts)
CREATE TABLE feature_flags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_whitelist JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Configuration (schema-admin.ts)
CREATE TABLE system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Request Logs (existing schema)
CREATE TABLE api_request_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  method VARCHAR(10) NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (extended for admin)
-- Existing users table with admin-relevant fields:
-- - id, name, email, role, onboarding_completed
-- - last_signed_in, login_method, created_at, updated_at
```

### 9.2 TypeScript Types

```typescript
// Feature Flag
interface FeatureFlag {
  id: number;
  name: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  userWhitelist: number[] | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

// System Configuration
interface SystemConfig {
  id: number;
  key: string;
  value: any;
  description: string | null;
  updatedBy: number | null;
  updatedAt: Date;
}

// Audit Entry (unified across sources)
interface AuditEntry {
  id: string | number;
  type: 'api_request' | 'workflow' | 'browser_session' | 'job' | 'user_signin';
  timestamp: Date;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  details: Record<string, any>;
  metadata?: any;
}

// System Health
interface SystemHealth {
  status: 'healthy' | 'degraded';
  timestamp: Date;
  database: {
    status: 'healthy' | 'unhealthy';
    message: string;
    responseTime: number;
  };
  system: {
    hostname: string;
    platform: string;
    arch: string;
    uptime: { seconds: number; formatted: string };
    memory: { total: string; used: string; free: string; usagePercentage: number };
    cpu: { count: number; model: string; speed: string; usagePercentage: number };
  };
  process: {
    nodeVersion: string;
    platform: string;
    arch: string;
    pid: number;
    uptime: { seconds: number; formatted: string };
    memory: { rss: string; heapTotal: string; heapUsed: string; external: string };
  };
  environment: {
    nodeEnv: string;
    timezone: string;
  };
}

// Circuit Breaker State
interface CircuitBreakerState {
  state: 'open' | 'closed' | 'half-open';
  failures: number;
  successes: number;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  lastFailure?: Date;
  lastSuccess?: Date;
}

// Execution State (WebSocket store)
interface ExecutionState {
  executionId: number;
  taskId: number;
  taskName: string;
  status: 'queued' | 'running' | 'success' | 'failed' | 'timeout';
  progress: number;
  stepsTotal: number;
  stepsCompleted: number;
  currentStep: string | null;
  startedAt: string;
  duration?: number;
  error?: string;
  logs: ExecutionLogEntry[];
}

// Execution Log Entry
interface ExecutionLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}
```

---

## 10. UI/UX Requirements

### 10.1 Design System

| Element | Specification |
|---------|--------------|
| **Framework** | shadcn/ui with Tailwind CSS |
| **Color Scheme** | Dark theme (slate-900 background, slate-800 borders) |
| **Primary Color** | Indigo-600 for actions, Indigo-400 for icons |
| **Status Colors** | Green-500 (success), Yellow-500 (warning), Red-500 (error) |
| **Typography** | Inter font family, responsive sizing |
| **Icons** | Lucide React icons |
| **Spacing** | 4px base unit, consistent gap-4/gap-6 |

### 10.2 Component Patterns

#### Cards
- Background: `bg-slate-900/50`
- Border: `border-slate-800`
- Padding: `pt-6` for CardContent
- Header with title (white text) and description (slate-400)

#### Badges
- Colored variants: `bg-{color}-500/20 text-{color}-400 border-{color}-500/30`
- Icon + text pattern for status badges
- Size: Small with px-2 py-1

#### Tables
- Header: `text-slate-400` with `hover:bg-transparent`
- Row borders: `border-slate-800`
- Hover state on rows
- Right-aligned action columns

#### Forms
- Input background: `bg-slate-800`
- Border: `border-slate-700`
- Text: `text-white` with `placeholder:text-slate-400`
- Focus ring: Indigo

#### Dialogs
- Background: `bg-slate-900`
- Border: `border-slate-800`
- Title with icon pattern
- Footer with Cancel/Action buttons

### 10.3 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ AdminLayout                                                  │
│ ┌───────────┬─────────────────────────────────────────────┐ │
│ │           │                                             │ │
│ │ AdminNav  │            Page Content                     │ │
│ │           │                                             │ │
│ │ - Dashboard│  ┌─────────────────────────────────────┐   │ │
│ │ - Users   │  │ Page Header (title, description)     │   │ │
│ │ - Audit   │  └─────────────────────────────────────┘   │ │
│ │ - Config  │                                             │ │
│ │ - Health  │  ┌─────────────────────────────────────┐   │ │
│ │           │  │ Stats Grid (4-col on lg)             │   │ │
│ │           │  └─────────────────────────────────────┘   │ │
│ │           │                                             │ │
│ │           │  ┌─────────────────────────────────────┐   │ │
│ │           │  │ Main Content Cards                   │   │ │
│ │           │  │ (2-col grid on lg for some views)   │   │ │
│ │           │  └─────────────────────────────────────┘   │ │
│ └───────────┴─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 10.4 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| **Mobile (< 640px)** | Single column, stacked cards, full-width inputs |
| **Tablet (640-1024px)** | 2-column grids, condensed tables |
| **Desktop (> 1024px)** | Full 4-column stats grid, side-by-side panels |

### 10.5 Loading States

- **Page Load**: Full skeleton cards matching layout
- **Data Refresh**: Spinner icon in header with "Refreshing..." text
- **Mutations**: Button loading state with Loader2 icon
- **Tables**: "Loading..." row spanning full width

### 10.6 Error States

- **API Errors**: Red alert banner with error message and retry action
- **Validation Errors**: Inline red text below input fields
- **Toast Notifications**: Sonner toasts for success/error feedback
- **Empty States**: Centered icon + message + action button

### 10.7 Accessibility

- **Focus Indicators**: Visible focus rings on all interactive elements
- **ARIA Labels**: Labels on icon-only buttons
- **Screen Reader Text**: `sr-only` class for hidden descriptive text
- **Keyboard Navigation**: Tab order follows visual order
- **Color Independence**: Status conveyed with icons + color

---

## 11. Dependencies & Integrations

### 11.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework with adminProcedure |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| SSE Manager | `server/_core/sse-manager.ts` | Real-time event streaming |
| Circuit Breaker | `server/api/lib/circuitBreaker.ts` | Service resilience |
| Agent Store | `client/src/stores/agentStore.ts` | Agent state management |
| WebSocket Store | `client/src/stores/websocketStore.ts` | Execution state |
| useAgentSSE Hook | `client/src/hooks/useAgentSSE.ts` | SSE connection |

### 11.2 External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @trpc/server | ^11.x | API framework |
| @trpc/react-query | ^11.x | React integration |
| drizzle-orm | ^0.30.x | Database ORM |
| zod | ^3.x | Schema validation |
| date-fns | ^3.x | Date formatting |
| lucide-react | ^0.x | Icons |
| sonner | ^1.x | Toast notifications |
| @radix-ui/* | Various | UI primitives (Dialog, Dropdown, etc.) |

### 11.3 External Services

| Service | Purpose | Integration Point |
|---------|---------|------------------|
| PostgreSQL | Data persistence | Drizzle ORM |
| Browserbase | Browser automation | Health check |
| OpenAI | AI services | Configuration check |
| Anthropic | AI services | Configuration check |
| Stripe | Payments | Configuration check |
| Resend | Email | Configuration check |

### 11.4 Environment Variables

```bash
# Database
DATABASE_URL=           # PostgreSQL connection string

# External Services (checked in service status)
BROWSERBASE_API_KEY=    # Browserbase authentication
BROWSERBASE_PROJECT_ID= # Browserbase project
OPENAI_API_KEY=         # OpenAI API
ANTHROPIC_API_KEY=      # Anthropic API
STRIPE_SECRET_KEY=      # Stripe payments
RESEND_API_KEY=         # Email service

# Application
NODE_ENV=               # Environment (development/production)
```

---

## 12. Release Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Admin Dashboard
- [ ] Dashboard loads with all stats cards populated
- [ ] MCP server status displays correct connection state
- [ ] Deployment status shows environment health
- [ ] Recent activity shows last 5 events
- [ ] Auto-refresh works every 30 seconds
- [ ] Quick action buttons navigate correctly
- [ ] System health badge reflects actual status

#### AC-002: User Management
- [ ] User list loads with pagination
- [ ] Search filters users by name/email
- [ ] Role filter works for admin/user
- [ ] Status filter works for active/pending
- [ ] Role change updates immediately
- [ ] Suspend shows confirmation and requires optional reason
- [ ] Unsuspend restores user access
- [ ] Stats cards show accurate counts

#### AC-003: Audit Log
- [ ] Log entries load from all sources
- [ ] Event type filter shows only matching entries
- [ ] Date range filter applies correctly
- [ ] User ID filter validates and works
- [ ] Entry expansion shows full JSON details
- [ ] Statistics show 24h and 7d counts
- [ ] Pagination works across filtered results

#### AC-004: System Health
- [ ] CPU metrics display with usage percentage
- [ ] Memory metrics display with usage percentage
- [ ] Uptime displays in human-readable format
- [ ] Database connectivity tested with response time
- [ ] All 6 external services show configuration status
- [ ] Database table counts are accurate
- [ ] Health thresholds trigger correct status badges

#### AC-005: Configuration Center
- [ ] Feature flags list all flags
- [ ] Create flag validates unique name
- [ ] Toggle flag updates immediately
- [ ] Rollout percentage saves correctly
- [ ] Delete flag shows confirmation
- [ ] System config lists all entries
- [ ] Value type detection works
- [ ] Maintenance mode toggle affects system

#### AC-006: Agent Dashboard
- [ ] Active tasks count reflects reality
- [ ] Completion rate calculates correctly
- [ ] Average response time updates
- [ ] SSE connection status displays
- [ ] New task input works
- [ ] Current execution shows progress
- [ ] Pause/resume controls work
- [ ] Terminate shows confirmation

#### AC-007: Execution Monitor
- [ ] Execution details load correctly
- [ ] Step timeline shows all steps
- [ ] Screenshots display when available
- [ ] Log filtering works by level
- [ ] Log search filters messages
- [ ] Auto-scroll toggle works
- [ ] JSON export downloads correctly
- [ ] TXT export downloads correctly
- [ ] Copy to clipboard works

### 12.2 Integration Criteria

- [ ] All admin endpoints protected by adminProcedure
- [ ] Non-admin users receive 403 Forbidden
- [ ] API responses meet P95 < 500ms target
- [ ] Auto-refresh doesn't cause memory leaks
- [ ] SSE connections reconnect on failure
- [ ] Mutations invalidate related query caches
- [ ] Error toasts display for all failures

### 12.3 Quality Criteria

- [ ] Unit test coverage >= 80% for admin routers
- [ ] Integration tests pass for all endpoints
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Lighthouse accessibility score >= 90
- [ ] Mobile responsive on all views
- [ ] No N+1 query problems

### 12.4 Documentation Criteria

- [ ] API endpoints documented
- [ ] Component props documented
- [ ] Configuration options documented
- [ ] Troubleshooting guide available

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database query performance degradation with large audit logs | High | Medium | Implement pagination, add indexes, consider archiving |
| SSE connection instability | Medium | Medium | Implement reconnection logic with exponential backoff |
| Circuit breaker false positives | Low | Medium | Tune thresholds, add manual override capability |
| Memory leaks from auto-refresh | Medium | Low | Proper cleanup in useEffect, monitor with DevTools |
| Race conditions in optimistic updates | Low | Low | Use tRPC query invalidation, avoid stale data |

### 13.2 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Privilege escalation via role change | Low | Critical | Verify caller is admin before allowing role changes |
| Audit log tampering | Low | High | Make audit logs append-only, consider blockchain verification |
| Configuration injection | Low | High | Validate all config values with Zod schemas |
| Admin session hijacking | Low | Critical | Implement session rotation, monitor for anomalies |

### 13.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Accidental maintenance mode activation | Medium | High | Require confirmation, show warning banner |
| Incorrect feature flag rollout | Medium | Medium | Support percentage rollout, add whitelist testing |
| Mass user suspension | Low | High | Require confirmation, limit batch operations |
| Dashboard overload during incidents | Medium | Medium | Implement request throttling, cache responses |

### 13.4 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Admin tool misuse | Low | Medium | Comprehensive audit logging, access reviews |
| Configuration errors impacting users | Medium | High | Preview changes, implement rollback capability |
| Compliance gaps in audit trails | Medium | High | Ensure complete event capture, retention policies |

---

## 14. Future Considerations

### 14.1 Planned Enhancements

| Enhancement | Description | Timeline |
|-------------|-------------|----------|
| **Cost Dashboard** | Real-time AI service cost tracking and budgets | v1.5 |
| **Alert Configuration** | Custom alert rules for health thresholds | v1.5 |
| **Bulk User Operations** | Multi-select user actions (suspend, role change) | v2.0 |
| **Audit Log Export** | CSV/Excel export with date range selection | v1.5 |
| **Configuration History** | Track changes to flags and configs with diff view | v2.0 |
| **Role-Based Dashboard** | Customizable widgets per admin role | v2.0 |
| **Scheduled Maintenance** | Set future maintenance windows | v2.0 |
| **A/B Test Integration** | Feature flag tied to experiment tracking | v2.0 |

### 14.2 Technical Debt

| Item | Description | Priority |
|------|-------------|----------|
| Dedicated audit_logs table | Single table for all audit events | High |
| API request logging middleware | Automatic capture of all requests | High |
| Admin action logging | Capture all admin mutations | High |
| Configuration validation service | Centralized config schema validation | Medium |
| Real-time dashboard WebSocket | Replace polling with WebSocket | Medium |

### 14.3 Scalability Improvements

| Improvement | Description | When Needed |
|-------------|-------------|-------------|
| Audit log partitioning | Partition by date for faster queries | > 10M entries |
| Read replicas | Separate read traffic for reports | > 100 concurrent admins |
| Caching layer | Redis cache for expensive queries | > 1000 req/min |
| Microservice extraction | Separate admin service | Major scale increase |

### 14.4 Integration Opportunities

| Integration | Purpose | Benefit |
|-------------|---------|---------|
| PagerDuty/OpsGenie | Alert escalation | Faster incident response |
| Slack/Teams | Admin notifications | Real-time awareness |
| Grafana | Advanced metrics visualization | Better observability |
| DataDog | APM and log aggregation | Unified monitoring |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Admin** | User with role='admin' who can access admin dashboard |
| **Audit Log** | Record of system events and user actions |
| **Circuit Breaker** | Pattern preventing cascading failures from external service issues |
| **Feature Flag** | Configuration controlling feature availability |
| **Maintenance Mode** | System state that blocks normal user access |
| **MCP** | Model Context Protocol for AI model communication |
| **Rollout Percentage** | Percentage of users who see a feature flag as enabled |
| **SSE** | Server-Sent Events for real-time data streaming |
| **Swarm** | Multiple coordinated AI agents working together |
| **tRPC** | TypeScript RPC framework for type-safe APIs |

---

## Appendix B: Related Documents

| Document | Description |
|----------|-------------|
| PRD-001 | AI Agent Orchestration |
| PRD-002 | Browser Automation Control |
| PRD-005 | Email Integration |
| PRD-006 | Voice Agent |
| PRD-007 | Webhooks Management |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, DevOps, Security
