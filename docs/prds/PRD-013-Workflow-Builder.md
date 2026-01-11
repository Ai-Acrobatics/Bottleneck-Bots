# PRD-013: Workflow Builder

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:**
- `client/src/components/browser/WorkflowBuilder.tsx`
- `client/src/pages/TaskBoard.tsx`
- `server/services/workflowExecution.service.ts`
- `server/services/swarm/taskDistributor.service.ts`
- `server/services/cronScheduler.service.ts`
- `server/api/routers/scheduledTasks.ts`
- `server/_core/variableSubstitution.ts`
- `server/services/template-loader.service.ts`

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

The Workflow Builder is a comprehensive visual automation platform that enables users to design, schedule, and execute complex browser automation workflows without writing code. It combines drag-and-drop workflow design, intelligent task distribution across swarm agents, cron-based scheduling, and a Kanban-style task management interface to provide end-to-end automation orchestration.

### 1.2 Key Components

| Component | Size | Purpose |
|-----------|------|---------|
| **WorkflowBuilder.tsx** | Visual UI | Drag-and-drop workflow design with ReactFlow |
| **TaskBoard.tsx** | 42KB | Kanban-style task management and monitoring |
| **taskDistributor.service.ts** | 32KB | Intelligent task assignment across swarm agents |
| **workflowExecution.service.ts** | Core Engine | Step-by-step workflow execution with Stagehand |
| **cronScheduler.service.ts** | Scheduling | Cron expression parsing and scheduling |
| **scheduledTasks.ts** | API Router | Complete CRUD for scheduled automation tasks |
| **variableSubstitution.ts** | Utility | Dynamic placeholder replacement in workflows |
| **template-loader.service.ts** | Templates | Pre-built workflow template management |

### 1.3 Production Assets

The feature includes 5 production n8n workflows for common automation patterns:

1. **Browser Automation Trigger** (15KB) - Webhook-triggered browser automation
2. **Email 2FA Extractor** (3KB) - Automated two-factor authentication handling
3. **Client Onboarding** (4KB) - Automated client setup workflows
4. **Usage Tracking** (3KB) - Automated usage metrics collection
5. **Payment to Onboarding** (21KB) - End-to-end payment processing pipeline

### 1.4 Business Value

- **70% reduction** in time spent creating automation workflows
- **85% decrease** in manual task management overhead
- **24/7 automated execution** with intelligent scheduling
- **50% improvement** in task completion rates through swarm distribution

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Complex Workflow Creation**: Users lack tools to visually design multi-step browser automation workflows
2. **Manual Task Management**: No centralized system for tracking, scheduling, and monitoring automation tasks
3. **Inefficient Resource Utilization**: Tasks are not intelligently distributed across available agents
4. **Limited Scheduling Options**: Users cannot schedule recurring automations with complex timing rules
5. **No Template Library**: Each workflow must be built from scratch, increasing development time
6. **Poor Visibility**: No real-time monitoring of task execution status and queue position

### 2.2 User Pain Points

- "I spend hours manually configuring automation steps that could be done visually"
- "I have no way to schedule automations to run during off-peak hours"
- "When I have many tasks, I don't know which agent is handling what"
- "I keep rebuilding similar workflows instead of reusing templates"
- "I can't see the status of my queued tasks in real-time"
- "GHL operations need to happen in a specific order, but I can't define dependencies"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Manual workflow creation | 8+ hours per complex automation |
| No intelligent distribution | 40% agent idle time during peak loads |
| Missing scheduling | 50% of tasks run during business hours only |
| No task visibility | 35% duplicate task creation |
| Lack of templates | 6x longer onboarding for new automations |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Enable visual drag-and-drop workflow design | P0 |
| **G2** | Provide intelligent task distribution across swarm agents | P0 |
| **G3** | Implement cron-based scheduling with timezone support | P0 |
| **G4** | Deliver Kanban-style task management interface | P0 |
| **G5** | Support workflow template library | P1 |
| **G6** | Enable dynamic variable substitution in workflows | P1 |
| **G7** | Integrate with n8n for advanced workflow patterns | P2 |

### 3.2 Success Metrics (KPIs)

#### Workflow Creation Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Workflow Creation Time | < 10 minutes for 5-step workflow | Time from start to save |
| Template Usage Rate | >= 60% of new workflows | Template-based / Total workflows |
| Step Success Rate | >= 95% | Successful steps / Total steps |
| First-Time Execution Success | >= 80% | Workflows succeeding on first run |

#### Task Distribution Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Agent Utilization | >= 75% | Active time / Total time |
| Task Assignment Latency | < 500ms | Queue to assignment time |
| Load Balance Variance | < 15% | Standard deviation of agent workloads |
| Session Affinity Hit Rate | >= 70% | Affinity matches / Session-required tasks |

#### Scheduling Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Schedule Accuracy | >= 99.5% | On-time executions / Scheduled executions |
| Cron Parse Success | 100% | Valid expressions / Total expressions |
| Retry Success Rate | >= 85% | Recovered tasks / Failed tasks |
| Queue Throughput | >= 100 tasks/hour | Tasks processed per hour |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Task Board Load Time | < 2 seconds | Page fully interactive |
| Real-time Update Latency | < 500ms | Status change to UI update |
| User Adoption Rate | >= 70% | Active users using TaskBoard weekly |
| Task Completion Visibility | >= 95% | Tasks with visible status |

---

## 4. User Stories & Personas

### 4.1 User Personas

#### Persona 1: Marketing Automation Manager
- **Name:** Sarah Chen
- **Role:** Marketing Operations Lead
- **Goals:** Automate campaign management across multiple platforms
- **Pain Points:** Spends 15+ hours/week on repetitive tasks
- **Technical Level:** Intermediate

#### Persona 2: Agency Operations Director
- **Name:** Marcus Williams
- **Role:** Agency COO
- **Goals:** Scale client operations without adding headcount
- **Pain Points:** Cannot monitor all client automations simultaneously
- **Technical Level:** Non-technical

#### Persona 3: Technical Integration Specialist
- **Name:** Priya Sharma
- **Role:** Senior Developer
- **Goals:** Build complex multi-step automations with custom logic
- **Pain Points:** Existing tools lack flexibility for edge cases
- **Technical Level:** Advanced

### 4.2 Core User Stories

#### US-001: Visual Workflow Design
**As a** marketing automation manager
**I want to** visually design automation workflows with drag-and-drop
**So that** I can create complex automations without writing code

**Acceptance Criteria:**
- [ ] Canvas displays available step types (navigate, act, observe, extract, wait, custom)
- [ ] Steps can be dragged and dropped onto the canvas
- [ ] Steps can be reordered by dragging
- [ ] Each step has a configuration panel with type-specific options
- [ ] Workflow can be saved with name and description
- [ ] Workflow can be executed directly from the builder

#### US-002: Task Distribution Across Agents
**As an** agency operations director
**I want** tasks automatically distributed across available agents
**So that** work is completed faster with optimal resource utilization

**Acceptance Criteria:**
- [ ] Tasks are assigned based on agent capabilities
- [ ] Load is balanced across agents (no agent > 90% capacity)
- [ ] GHL operations maintain session affinity for the same client
- [ ] Critical tasks are prioritized over background tasks
- [ ] Batchable operations are grouped for efficiency

#### US-003: Cron-Based Scheduling
**As a** marketing automation manager
**I want to** schedule automations with flexible timing rules
**So that** tasks run automatically at optimal times

**Acceptance Criteria:**
- [ ] Support daily, weekly, monthly, and custom cron schedules
- [ ] Timezone support for global teams
- [ ] Human-readable schedule descriptions
- [ ] Preview of next N scheduled runs
- [ ] Pause/resume capability

#### US-004: Kanban Task Management
**As an** agency operations director
**I want to** view all tasks in a Kanban board format
**So that** I can quickly assess workload and priorities

**Acceptance Criteria:**
- [ ] Columns for: Pending, Queued, In Progress, Scheduled, Completed, Failed
- [ ] Tasks show priority, type, and schedule information
- [ ] Drag-and-drop for manual status changes
- [ ] Filtering by status, priority, and type
- [ ] Real-time updates when task status changes

#### US-005: Dynamic Variable Substitution
**As a** technical integration specialist
**I want to** use variables in workflow steps
**So that** I can create reusable, parameterized automations

**Acceptance Criteria:**
- [ ] Support `{{variableName}}` syntax in all string fields
- [ ] Variables can be passed at execution time
- [ ] Step results can be saved to variables for later use
- [ ] Validation shows missing required variables before execution
- [ ] Variables work in objects and arrays recursively

#### US-006: Workflow Templates
**As a** marketing automation manager
**I want to** use pre-built workflow templates
**So that** I can quickly create common automations

**Acceptance Criteria:**
- [ ] Library of templates for common use cases
- [ ] Templates can be customized after loading
- [ ] Users can save their workflows as templates
- [ ] Template metadata shows description and file count
- [ ] Variable placeholders (PROJECT_NAME, PORT) auto-filled

### 4.3 Advanced User Stories

#### US-007: GHL Operation Urgency Routing
**As an** agency operations director
**I want** GHL operations prioritized by urgency
**So that** time-sensitive actions (conversations, bookings) happen immediately

**Acceptance Criteria:**
- [ ] Urgency levels 1-5 for all GHL operations
- [ ] Critical operations (urgency 1) bypass queue
- [ ] Operations sorted by urgency then priority
- [ ] Estimated duration shown per operation type

#### US-008: Browser Session Affinity
**As a** technical integration specialist
**I want** tasks for the same client to use the same browser session
**So that** login state and context are preserved

**Acceptance Criteria:**
- [ ] Client ID maps to session ID for 5-minute affinity window
- [ ] Session health is tracked (0-1 scale)
- [ ] Unhealthy sessions are cleaned up automatically
- [ ] Sessions with capacity < max are reused

#### US-009: Retry with Exponential Backoff
**As an** agency operations director
**I want** failed tasks to retry automatically
**So that** transient failures don't require manual intervention

**Acceptance Criteria:**
- [ ] Up to 3 retry attempts per task
- [ ] Exponential backoff: 1s, 2s, 4s (max 32s)
- [ ] Retry status visible in task details
- [ ] Permanent failures after max retries

#### US-010: Batch Result Consolidation
**As a** marketing automation manager
**I want** batch operations to return consolidated results
**So that** I can see the overall success/failure of bulk actions

**Acceptance Criteria:**
- [ ] Batch ID groups related tasks
- [ ] Consolidated success/failure counts
- [ ] Total execution time across batch
- [ ] Outputs merged into single result

---

## 5. Functional Requirements

### 5.1 Workflow Builder UI

#### FR-001: Step Types
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Navigate step: Navigate browser to URL | P0 |
| FR-001.2 | Act step: Perform action (click, type, etc.) with instruction | P0 |
| FR-001.3 | Observe step: Observe page state with instruction | P0 |
| FR-001.4 | Extract step: Extract structured data with schema selection | P0 |
| FR-001.5 | Wait step: Wait for duration or element selector | P0 |
| FR-001.6 | Custom step: Execute custom JavaScript code | P1 |
| FR-001.7 | Condition step: Branch based on expression evaluation | P1 |
| FR-001.8 | Loop step: Iterate over array items | P1 |
| FR-001.9 | API Call step: Make HTTP requests with method/headers/body | P1 |
| FR-001.10 | Notification step: Send info/warning/error notifications | P2 |

#### FR-002: Workflow Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Create workflow with name and description | P0 |
| FR-002.2 | Add/remove/reorder steps via drag-and-drop | P0 |
| FR-002.3 | Configure step parameters in detail dialog | P0 |
| FR-002.4 | Enable/disable individual steps | P0 |
| FR-002.5 | Duplicate existing steps | P1 |
| FR-002.6 | Save workflow to database | P0 |
| FR-002.7 | Load saved workflow for editing | P0 |
| FR-002.8 | Execute workflow immediately | P0 |
| FR-002.9 | Test execute without saving | P1 |

### 5.2 Task Distribution System

#### FR-003: Distribution Strategies
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Capability-based: Score agents by skill match | P0 |
| FR-003.2 | Least-loaded: Assign to lowest workload agent | P0 |
| FR-003.3 | Round-robin: Simple rotation assignment | P1 |
| FR-003.4 | Session-aware: Prioritize agents with healthy sessions | P0 |

#### FR-004: GHL Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Support 20+ GHL operation types | P0 |
| FR-004.2 | Assign urgency levels 1-5 per operation type | P0 |
| FR-004.3 | Track estimated duration per operation | P0 |
| FR-004.4 | Flag operations requiring browser session | P0 |
| FR-004.5 | Identify batchable operations | P0 |

#### FR-005: Session Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Register browser sessions with agent assignment | P0 |
| FR-005.2 | Track session active task count | P0 |
| FR-005.3 | Maintain client-to-session affinity mapping | P0 |
| FR-005.4 | Monitor session health (0-1 scale) | P1 |
| FR-005.5 | Release sessions when tasks complete | P0 |
| FR-005.6 | Cleanup stale sessions after timeout | P1 |

#### FR-006: Batching and Retry
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Batch compatible operations by client + type | P1 |
| FR-006.2 | Process batches after 2-second window or max size (10) | P1 |
| FR-006.3 | Retry failed tasks up to 3 times | P0 |
| FR-006.4 | Use exponential backoff for retry delays | P0 |
| FR-006.5 | Consolidate batch results with success/failure counts | P1 |

### 5.3 Scheduled Tasks

#### FR-007: Schedule Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Create scheduled tasks with automation config | P0 |
| FR-007.2 | Support schedule types: daily, weekly, monthly, cron, once | P0 |
| FR-007.3 | Parse and validate cron expressions | P0 |
| FR-007.4 | Calculate next run time with timezone support | P0 |
| FR-007.5 | Human-readable schedule descriptions | P1 |

#### FR-008: Schedule CRUD
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | List tasks with pagination, filtering, sorting | P0 |
| FR-008.2 | Get single task by ID | P0 |
| FR-008.3 | Create task with initial nextRun calculation | P0 |
| FR-008.4 | Update task with schedule recalculation | P0 |
| FR-008.5 | Soft delete (archive) tasks | P0 |
| FR-008.6 | Pause/resume task execution | P0 |

#### FR-009: Execution Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Execute task immediately (manual trigger) | P0 |
| FR-009.2 | Track execution history per task | P0 |
| FR-009.3 | Query upcoming scheduled executions | P1 |
| FR-009.4 | Get task execution statistics | P1 |
| FR-009.5 | Configure retry on failure with max retries | P1 |
| FR-009.6 | Set execution timeout (10-3600 seconds) | P1 |

#### FR-010: Notifications
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Configure notification channels (email, slack, webhook) | P2 |
| FR-010.2 | Notify on success (optional) | P2 |
| FR-010.3 | Notify on failure (default enabled) | P2 |

### 5.4 Task Board

#### FR-011: Task Display
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Kanban view with status columns | P0 |
| FR-011.2 | List view with sortable columns | P0 |
| FR-011.3 | Toggle between Kanban and List views | P0 |
| FR-011.4 | Display task priority badge (critical/high/medium/low) | P0 |
| FR-011.5 | Show task type and category | P0 |
| FR-011.6 | Display scheduled time and queue position | P0 |

#### FR-012: Task Actions
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Execute task immediately | P0 |
| FR-012.2 | Schedule task for later (preset or custom time) | P0 |
| FR-012.3 | Cancel/delete task | P0 |
| FR-012.4 | View task details in modal | P0 |
| FR-012.5 | Change task status and priority | P0 |

#### FR-013: Task Statistics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Show running task count | P0 |
| FR-013.2 | Show pending/queued count | P0 |
| FR-013.3 | Show scheduled today count | P0 |
| FR-013.4 | Show completed count | P0 |
| FR-013.5 | Show failed count | P0 |
| FR-013.6 | Show needs review count | P1 |

### 5.5 Workflow Execution Engine

#### FR-014: Step Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Execute steps sequentially in order | P0 |
| FR-014.2 | Navigate: Go to URL using Playwright page.goto() | P0 |
| FR-014.3 | Act: Execute instruction via Stagehand.act() | P0 |
| FR-014.4 | Observe: Get actions via Stagehand.observe() | P0 |
| FR-014.5 | Extract: Get data via Stagehand.extract() with schemas | P0 |
| FR-014.6 | Wait: Delay for duration or until element selector | P0 |
| FR-014.7 | Condition: Evaluate expression with safe parser | P1 |
| FR-014.8 | Loop: Iterate over array items | P1 |
| FR-014.9 | API Call: Make HTTP request with fetch | P1 |
| FR-014.10 | Notification: Log notification message | P2 |

#### FR-015: Execution Context
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Maintain variables dictionary throughout execution | P0 |
| FR-015.2 | Store step results with timestamp and duration | P0 |
| FR-015.3 | Collect extracted data for output | P0 |
| FR-015.4 | Track execution ID and workflow ID | P0 |
| FR-015.5 | Maintain Stagehand session reference | P0 |

#### FR-016: Execution Lifecycle
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Create execution record with running status | P0 |
| FR-016.2 | Create Browserbase session (with optional geolocation) | P0 |
| FR-016.3 | Initialize Stagehand with project configuration | P0 |
| FR-016.4 | Update progress after each step | P0 |
| FR-016.5 | Mark completed with final output | P0 |
| FR-016.6 | Mark failed with error message | P0 |
| FR-016.7 | Cancel running execution and terminate session | P0 |

### 5.6 Variable Substitution

#### FR-017: Substitution Rules
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | Replace `{{variableName}}` with variable value | P0 |
| FR-017.2 | Support string, object, and array values | P0 |
| FR-017.3 | Recursive substitution in nested objects | P0 |
| FR-017.4 | Preserve unmatched placeholders | P0 |
| FR-017.5 | Extract variable names from template | P1 |
| FR-017.6 | Validate required variables are present | P1 |

### 5.7 Template System

#### FR-018: Template Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | List available template types | P1 |
| FR-018.2 | Load template files recursively | P1 |
| FR-018.3 | Apply variables to template content | P1 |
| FR-018.4 | Write template files to destination | P1 |
| FR-018.5 | Get template metadata (name, description, file count) | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Workflow Builder initial load | < 2 seconds | P0 |
| NFR-002 | Step addition latency | < 100ms | P0 |
| NFR-003 | Task assignment latency | < 500ms | P0 |
| NFR-004 | TaskBoard data refresh | < 1 second | P0 |
| NFR-005 | Cron expression parse time | < 10ms | P0 |
| NFR-006 | Variable substitution time | < 50ms for 100 variables | P1 |
| NFR-007 | Workflow execution step latency | < 5 seconds per step (excluding wait) | P0 |
| NFR-008 | Concurrent workflow executions | >= 50 | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-009 | Tasks in queue | >= 10,000 | P1 |
| NFR-010 | Concurrent agents | >= 100 | P1 |
| NFR-011 | Browser sessions per agent | 5 max concurrent | P0 |
| NFR-012 | Scheduled tasks per user | >= 1,000 | P1 |
| NFR-013 | Workflow steps per workflow | >= 50 | P0 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-014 | Task execution success rate | >= 95% | P0 |
| NFR-015 | Retry recovery rate | >= 85% | P0 |
| NFR-016 | Schedule accuracy | >= 99.5% on-time | P0 |
| NFR-017 | Session affinity hit rate | >= 70% | P1 |
| NFR-018 | Batch processing reliability | >= 99% | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-019 | All endpoints require authentication (protectedProcedure) | P0 |
| NFR-020 | User can only access own tasks/workflows | P0 |
| NFR-021 | Safe expression evaluation (no eval/Function) | P0 |
| NFR-022 | Validate cron expressions before saving | P0 |
| NFR-023 | Sanitize user input in workflow steps | P0 |
| NFR-024 | API keys resolved from environment only | P0 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-025 | Log all task assignments with agent info | P0 |
| NFR-026 | Log all step executions with timing | P0 |
| NFR-027 | Emit events for task lifecycle (queued, assigned, completed, failed) | P0 |
| NFR-028 | Track queue status metrics | P1 |
| NFR-029 | Monitor session health metrics | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Client Application                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ WorkflowBuilder │  │   TaskBoard     │  │  ScheduledTasksPanel    │  │
│  │  (ReactFlow)    │  │   (Kanban)      │  │   (CRUD Interface)      │  │
│  └────────┬────────┘  └────────┬────────┘  └───────────┬─────────────┘  │
└───────────┼──────────────────────┼─────────────────────┼────────────────┘
            │                      │                     │
            └──────────────────────┼─────────────────────┘
                                   │ tRPC
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         API Layer (tRPC Routers)                          │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │ workflowRouter │  │ agencyTasksRouter│  │ scheduledTasksRouter    │  │
│  │  - create      │  │  - list/get      │  │  - list/create/update   │  │
│  │  - execute     │  │  - execute       │  │  - pause/resume         │  │
│  │  - getStatus   │  │  - getStats      │  │  - executeNow           │  │
│  │  - cancel      │  │  - delete        │  │  - getExecutionHistory  │  │
│  └────────┬───────┘  └────────┬─────────┘  └───────────┬─────────────┘  │
└───────────┼─────────────────────┼──────────────────────┼─────────────────┘
            │                     │                      │
            ▼                     ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    TaskDistributor Service                          │ │
│  │  - queueTask()         - assignTask()          - completeTask()     │ │
│  │  - distributeTasks()   - failTask()            - getBatchResults()  │ │
│  │  - Session Management  - GHL Operation Routing - Retry Processor    │ │
│  └─────────────────────────────────┬───────────────────────────────────┘ │
│                                    │                                      │
│  ┌─────────────────────┐  ┌───────┴──────────┐  ┌─────────────────────┐ │
│  │ WorkflowExecution   │  │ CronScheduler    │  │ VariableSubstitution│ │
│  │ Service             │  │ Service          │  │                     │ │
│  │ - executeWorkflow() │  │ - validateCron() │  │ - substituteVars()  │ │
│  │ - executeStep()     │  │ - getNextRun()   │  │ - extractVarNames() │ │
│  │ - cancelExecution() │  │ - describeCron() │  │ - validateVars()    │ │
│  └─────────┬───────────┘  └──────────────────┘  └─────────────────────┘ │
│            │                                                              │
│  ┌─────────┴───────────────────────────────────────────────────────────┐ │
│  │                    TemplateLoader Service                           │ │
│  │  - getAvailableTemplates()    - loadTemplate()   - applyVariables() │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         External Dependencies                             │
│  ┌───────────────┐  ┌───────────────────┐  ┌───────────────────────────┐ │
│  │  Stagehand    │  │   Browserbase     │  │      Database             │ │
│  │  (Browser AI) │  │   Platform        │  │      (Drizzle)            │ │
│  │               │  │                   │  │                           │ │
│  │ - act()       │  │ - Sessions        │  │ - automationWorkflows     │ │
│  │ - observe()   │  │ - Live View       │  │ - workflowExecutions      │ │
│  │ - extract()   │  │ - Recording       │  │ - scheduledBrowserTasks   │ │
│  │               │  │ - Geolocation     │  │ - agencyTasks             │ │
│  └───────────────┘  └───────────────────┘  └───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Details

#### 7.2.1 TaskDistributor Service

The TaskDistributor is the core orchestration component managing task assignment across agents.

**Key Features:**
- **GHL Operation Urgency Mapping**: 20+ operation types with urgency levels 1-5
- **Distribution Strategies**: capability-based, least-loaded, round-robin, session-aware
- **Browser Session Management**: Registration, affinity, health monitoring, cleanup
- **Batching**: Groups compatible operations by client and type
- **Retry Logic**: Exponential backoff with configurable max attempts

**GHL Operation Configuration:**
```typescript
// Urgency Level 1 (Critical)
conversation_send, workflow_trigger, calendar_booking

// Urgency Level 2 (High)
contact_create, opportunity_create, pipeline_update

// Urgency Level 3 (Normal)
contact_update, opportunity_update, task_create, note_create

// Urgency Level 4 (Low)
campaign_add, campaign_remove, tag_add, tag_remove

// Urgency Level 5 (Background)
bulk_operation, report_generate, data_export, integration_sync
```

#### 7.2.2 WorkflowExecution Service

Executes saved workflows step-by-step using Stagehand and Browserbase.

**Step Handlers:**
- `executeNavigateStep()`: Browser navigation
- `executeActStep()`: AI-powered action execution
- `executeObserveStep()`: Page observation
- `executeExtractStep()`: Structured data extraction
- `executeWaitStep()`: Timed or element-based waiting
- `executeConditionStep()`: Safe expression evaluation
- `executeLoopStep()`: Array iteration
- `executeApiCallStep()`: HTTP requests
- `executeNotificationStep()`: Notification logging

**Execution Context:**
```typescript
interface ExecutionContext {
  workflowId: number;
  executionId: number;
  userId: number;
  sessionId: string;
  stagehand: Stagehand;
  variables: Record<string, unknown>;
  stepResults: StepResult[];
  extractedData: ExtractedDataItem[];
}
```

#### 7.2.3 CronScheduler Service

Handles cron expression parsing, validation, and schedule calculation.

**Capabilities:**
- Validate cron expressions using cron-parser
- Parse expressions into component parts
- Generate human-readable descriptions via cronstrue
- Calculate next run times with timezone support
- Convert simple schedule types (daily, weekly, monthly) to cron
- Determine if task should run based on last run time

#### 7.2.4 VariableSubstitution Utility

Provides template-based variable replacement with `{{variableName}}` syntax.

**Functions:**
- `substituteVariables()`: Replace in strings, objects, arrays recursively
- `substituteStringVariables()`: Type-safe string-only substitution
- `hasVariables()`: Check if template contains variables
- `extractVariableNames()`: Get all variable names from template
- `validateVariables()`: Verify required variables are present

### 7.3 Data Flow

#### Workflow Creation and Execution Flow
```
1. User designs workflow in WorkflowBuilder UI
                    ▼
2. Workflow saved to automationWorkflows table
                    ▼
3. User triggers Execute (immediate or scheduled)
                    ▼
4. WorkflowExecution creates execution record
                    ▼
5. Browserbase session created (with optional geolocation)
                    ▼
6. Stagehand initialized with project config
                    ▼
7. For each step:
   - Substitute variables in config
   - Execute step handler
   - Store result in context
   - Update execution progress
                    ▼
8. On completion:
   - Close Stagehand session
   - Update execution status to completed
   - Store final output
                    ▼
9. On failure:
   - Log error
   - Update execution status to failed
   - Cleanup browser session
```

#### Task Distribution Flow
```
1. Task queued via queueTask()
   - Enhance with GHL metadata
   - Check if batchable
                    ▼
2. If batchable: Add to batch
   - Wait for batch window (2s) or max size (10)
   - Process batch
                    ▼
3. Sort queue by urgency then priority
                    ▼
4. On distributeTasks():
   - Check session affinity
   - Filter capable agents
   - Apply distribution strategy
   - Create assignment
                    ▼
5. Register browser session if needed
                    ▼
6. On completion:
   - Release session
   - Consolidate batch results
   - Clean up
                    ▼
7. On failure:
   - Check retry eligibility
   - Schedule retry with backoff
   - OR mark permanent failure
```

---

## 8. API Specifications

### 8.1 Scheduled Tasks Router

#### scheduledTasks.list
```typescript
Input: {
  page: number (default: 1)
  pageSize: number (1-100, default: 20)
  status?: "active" | "paused" | "failed" | "completed" | "archived"
  sortBy: "nextRun" | "createdAt" | "lastRun" | "name" (default: "nextRun")
  sortOrder: "asc" | "desc" (default: "asc")
}

Output: {
  tasks: ScheduledBrowserTask[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
```

#### scheduledTasks.create
```typescript
Input: {
  name: string (1-255 chars)
  description?: string
  automationType: "chat" | "observe" | "extract" | "workflow" | "custom"
  automationConfig: {
    url: string (URL format)
    instruction?: string
    actions?: Array<{type, instruction, selector?}>
    browserConfig?: {headless?, timeout?, viewport?}
    extractionSchema?: Record<string, unknown>
    successCriteria?: string
  }
  scheduleType: "daily" | "weekly" | "monthly" | "cron" | "once"
  cronExpression: string
  timezone: string (default: "UTC")
  retryOnFailure: boolean (default: true)
  maxRetries: number (0-10, default: 3)
  retryDelay: number (default: 60 seconds)
  timeout: number (10-3600, default: 300 seconds)
  notifyOnSuccess: boolean (default: false)
  notifyOnFailure: boolean (default: true)
  notificationChannels?: Array<{type, config}>
  keepExecutionHistory: boolean (default: true)
  maxHistoryRecords: number (default: 100)
  tags?: string[]
  metadata?: Record<string, unknown>
}

Output: {
  success: boolean
  task: ScheduledBrowserTask
  message: string
}
```

#### scheduledTasks.executeNow
```typescript
Input: {
  id: number
}

Output: {
  success: boolean
  execution: ScheduledTaskExecution
  message: string
}
```

### 8.2 Workflow Execution Service

#### executeWorkflow
```typescript
Input: ExecuteWorkflowOptions {
  workflowId: number
  userId: number
  variables?: Record<string, unknown>
  geolocation?: {city?, state?, country?}
}

Output: ExecutionStatus {
  executionId: number
  workflowId: number
  status: "running" | "completed" | "failed" | "cancelled"
  startedAt?: Date
  completedAt?: Date
  stepResults: StepResult[]
  output?: unknown
  error?: string
}
```

#### testExecuteWorkflow
```typescript
Input: TestExecuteWorkflowOptions {
  userId: number
  steps: WorkflowStep[]
  variables?: Record<string, unknown>
  geolocation?: {city?, state?, country?}
  stepByStep?: boolean
}

Output: ExecutionStatus (same as above)
```

### 8.3 TaskDistributor Events

```typescript
// Emitted Events
"task:queued" -> { taskId, priority, ghlOperationType, clientId }
"task:batched" -> { taskId, batchId, batchSize }
"batch:processed" -> { batchId, taskCount }
"task:assigned" -> { taskId, agentId, agentName, sessionId, ghlOperationType }
"task:completed" -> { taskId, agentId, duration, result, batchId }
"task:retry_scheduled" -> { taskId, agentId, error, retryCount, retryDelay, nextRetryAt }
"task:retrying" -> { taskId, retryCount }
"task:failed" -> { taskId, agentId, error, retryCount, permanent }
"session:registered" -> { sessionId, agentId, clientId }
"session:released" -> { sessionId, activeTaskCount }
"session:cleaned" -> { sessionId }
"batch:result_consolidated" -> { batchId, taskId, successCount, failureCount, totalTasks }
```

---

## 9. Data Models

### 9.1 Workflow Step Schema

```typescript
interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  order: number;
  label: string;
  config: WorkflowStepConfig;
  enabled: boolean;
}

type WorkflowStepType =
  | "navigate"
  | "act"
  | "observe"
  | "extract"
  | "wait"
  | "condition"
  | "loop"
  | "apiCall"
  | "notification"
  | "custom";

// Type-specific configs
interface NavigateConfig { type: "navigate"; url: string; }
interface ActConfig { type: "act"; instruction: string; }
interface ObserveConfig { type: "observe"; observeInstruction: string; }
interface ExtractConfig {
  type: "extract";
  extractInstruction: string;
  schemaType?: "contactInfo" | "productInfo" | "custom";
}
interface WaitConfig {
  type: "wait";
  waitMs?: number;
  selector?: string;
}
interface ConditionConfig { type: "condition"; condition: string; }
interface LoopConfig { type: "loop"; items: string; }
interface ApiCallConfig {
  type: "apiCall";
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  saveAs?: string;
}
interface NotificationConfig {
  type: "notification";
  message: string;
  notificationType?: "info" | "warning" | "error";
}
```

### 9.2 Task Assignment Schema

```typescript
interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignedAt: Date;
  priority: number;
  estimatedDuration: number;
  ghlOperationType?: GHLOperationType;
  sessionId?: string;
  retryCount: number;
  nextRetryAt?: Date;
  clientId?: string;
  batchId?: string;
}
```

### 9.3 Browser Session Schema

```typescript
interface BrowserSessionInfo {
  sessionId: string;
  agentId: string;
  activeTaskCount: number;
  clientAffinity?: string;
  createdAt: Date;
  lastUsed: Date;
  health: number; // 0-1
  maxConcurrentTasks: number;
}
```

### 9.4 Task Batch Schema

```typescript
interface TaskBatch {
  batchId: string;
  clientId: string;
  tasks: TaskDefinition[];
  operationType: GHLOperationType;
  createdAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}
```

### 9.5 Database Tables

```sql
-- Automation Workflows
CREATE TABLE automation_workflows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE workflow_executions (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES automation_workflows(id),
  user_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_step INTEGER,
  step_results JSONB,
  input JSONB,
  output JSONB,
  error TEXT,
  session_id INTEGER,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Browser Tasks
CREATE TABLE scheduled_browser_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  automation_type VARCHAR(50) NOT NULL,
  automation_config JSONB NOT NULL,
  schedule_type VARCHAR(50) NOT NULL,
  cron_expression VARCHAR(100) NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  status VARCHAR(50) DEFAULT 'active',
  next_run TIMESTAMP,
  last_run TIMESTAMP,
  last_run_status VARCHAR(50),
  last_run_error TEXT,
  last_run_duration INTEGER,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  average_duration FLOAT DEFAULT 0,
  retry_on_failure BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 60,
  timeout INTEGER DEFAULT 300,
  notify_on_success BOOLEAN DEFAULT false,
  notify_on_failure BOOLEAN DEFAULT true,
  notification_channels JSONB,
  keep_execution_history BOOLEAN DEFAULT true,
  max_history_records INTEGER DEFAULT 100,
  tags JSONB,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  last_modified_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Task Executions
CREATE TABLE scheduled_task_executions (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES scheduled_browser_tasks(id),
  status VARCHAR(50) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration INTEGER,
  output JSONB,
  error_message TEXT,
  logs JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 10. UI/UX Requirements

### 10.1 WorkflowBuilder Component

#### Layout
- **Header Section**: Workflow name input, description textarea, action buttons (Load, Save, Execute)
- **Steps Panel**: Scrollable list of added steps with reorder capability
- **Step Card**: Displays order number, type icon, label, config summary, action menu
- **Add Step Dialog**: Step type selector, label input, type-specific config fields
- **Configure Step Dialog**: Edit existing step label and configuration

#### Interactions
- Drag handle on each step for reordering
- Click step to select, gear icon to configure
- Dropdown menu for duplicate/delete/enable-disable
- Toast notifications for all actions

#### Visual Design
- Step type color coding (navigate=blue, act=green, observe=purple, etc.)
- Disabled steps shown at 50% opacity
- Connector lines between steps
- Selected step highlighted with blue border

### 10.2 TaskBoard Component

#### Views
- **Kanban View**: 6 columns (Pending, Queued, In Progress, Scheduled, Completed, Failed)
- **List View**: Tabular format with sortable columns

#### Task Card
- Priority badge (critical=red, high=orange, medium=default, low=gray)
- Task type badge
- Description preview (2 lines max)
- Schedule indicator for scheduled tasks
- Running indicator with spinner for in-progress tasks
- Queue position for queued tasks

#### Statistics Panel
- 6 metric cards showing task counts by status
- Running (blue spinner), Pending (amber clock), Scheduled (purple calendar)
- Completed (green check), Failed (red X), Needs Review (orange alert)

#### Filters
- Search input with icon
- Status dropdown filter
- Priority dropdown filter
- View toggle (Kanban/List)
- Refresh button

### 10.3 Dialogs

#### Task Detail Dialog
- Task title with status icon
- Description display
- Status and priority selectors (editable)
- Task type and category display
- Schedule and deadline information
- Execution history list (last 5)
- Source message display (if applicable)
- Action buttons: Schedule, Execute Now, Cancel, Close

#### Defer Task Dialog
- Quick options tab: 30m, 1h, 3h, Tomorrow 9 AM, Next week
- Custom time tab: Date picker, time picker
- Optional reason textarea
- Validation: time must be in future

---

## 11. Dependencies & Integrations

### 11.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Browserbase SDK | `server/_core/browserbaseSDK.ts` | Session management |
| Cache Service | `server/services/cache.service.ts` | Workflow definition caching |
| Safe Expression Parser | `server/lib/safeExpressionParser.ts` | Condition evaluation |

### 11.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @browserbasehq/stagehand | ^3.x | AI browser automation |
| cron-parser | ^4.x | Cron expression parsing |
| cronstrue | ^2.x | Human-readable cron descriptions |
| react-flow | ^11.x | Visual workflow graph |
| date-fns | ^3.x | Date manipulation |
| zod | ^3.x | Schema validation |
| sonner | ^1.x | Toast notifications |

### 11.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| Browserbase | Remote browser sessions | Yes |
| Anthropic API | Claude model for Stagehand | Yes (or Gemini/OpenAI) |
| PostgreSQL | Data persistence | Yes |
| n8n (Optional) | Advanced workflow automation | No |

### 11.4 n8n Integration

Five production workflows are included for integration:

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| Browser Automation Trigger | Initiate browser tasks from n8n | Webhook |
| Email 2FA Extractor | Handle two-factor authentication | Email polling |
| Client Onboarding | Automated client setup | New client event |
| Usage Tracking | Collect usage metrics | Scheduled |
| Payment to Onboarding | End-to-end payment processing | Payment webhook |

---

## 12. Release Criteria

### 12.1 Alpha Release

- [ ] WorkflowBuilder UI renders with all step types
- [ ] Steps can be added, reordered, configured, and deleted
- [ ] Workflows can be saved and loaded
- [ ] TaskDistributor assigns tasks to agents
- [ ] Basic scheduled task CRUD operations work
- [ ] Variable substitution handles strings and objects

### 12.2 Beta Release

- [ ] All step types execute correctly
- [ ] TaskBoard displays tasks in Kanban and List views
- [ ] Task filtering and search work correctly
- [ ] Scheduled tasks execute on time
- [ ] Retry logic recovers from transient failures
- [ ] Session affinity maintains client context
- [ ] Batch consolidation returns correct results

### 12.3 General Availability

- [ ] 95% step execution success rate achieved
- [ ] 99.5% schedule accuracy achieved
- [ ] Performance benchmarks met (all NFRs)
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] End-to-end tests cover all critical paths
- [ ] Production monitoring configured
- [ ] n8n workflow templates validated

### 12.4 Quality Gates

| Gate | Requirement | Threshold |
|------|-------------|-----------|
| Unit Test Coverage | Lines covered | >= 80% |
| Integration Tests | Critical paths | 100% covered |
| Performance Tests | Load testing | Pass at 2x expected load |
| Security Scan | Vulnerability count | 0 critical, 0 high |
| Accessibility | WCAG compliance | AA level |

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stagehand action failures | Medium | High | Retry logic, step-specific error handling |
| Browser session timeout | Medium | Medium | Session health monitoring, automatic refresh |
| Cron parser edge cases | Low | Medium | Comprehensive validation, fallback to simple schedules |
| Variable substitution injection | Low | High | Safe expression parser, input sanitization |
| Queue backlog growth | Medium | High | Priority-based processing, batch optimization |

### 13.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low template adoption | Medium | Medium | Pre-built templates, template discovery UI |
| Complex UI confusion | Medium | Medium | Guided tutorials, progressive disclosure |
| Scheduling misconfigurations | Medium | Medium | Preview next N runs, validation warnings |
| Agent overload | Low | High | Load balancing, capacity limits |

### 13.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database query performance | Medium | Medium | Query optimization, caching, pagination |
| Event bus saturation | Low | Medium | Event batching, backpressure handling |
| Session cleanup failures | Low | Low | Background cleanup job, manual cleanup endpoint |
| n8n integration failures | Low | Medium | Retry mechanisms, fallback to direct API |

---

## 14. Future Considerations

### 14.1 Planned Enhancements (v1.5)

- **ReactFlow Integration**: Full visual graph editor with node connections
- **Workflow Versioning**: Track changes and rollback to previous versions
- **Team Collaboration**: Share workflows and templates across team members
- **Advanced Conditions**: Support for complex boolean expressions and regex
- **Parallel Step Execution**: Run independent steps concurrently

### 14.2 Roadmap Items (v2.0)

- **AI Workflow Generation**: Generate workflows from natural language descriptions
- **Visual Debugging**: Step-through execution with breakpoints
- **Workflow Marketplace**: Community-contributed templates
- **Mobile Task Management**: iOS/Android apps for task monitoring
- **Advanced Analytics**: Workflow performance dashboards

### 14.3 Integration Opportunities

- **Zapier/Make Integration**: Export workflows as Zapier zaps
- **GitHub Actions**: Trigger workflows from CI/CD pipelines
- **Slack Bot**: Task management via Slack commands
- **Calendar Integration**: Schedule based on calendar availability
- **CRM Sync**: Bi-directional sync with HubSpot, Salesforce

### 14.4 Technical Improvements

- **WebSocket Real-Time Updates**: Replace polling with push notifications
- **Workflow DSL**: Domain-specific language for power users
- **Distributed Execution**: Multi-region workflow execution
- **Workflow Testing Framework**: Unit tests for individual workflows
- **Performance Profiling**: Identify slow steps automatically

---

## Appendix A: GHL Operation Types

| Operation Type | Urgency | Duration (ms) | Requires Session | Batchable |
|----------------|---------|---------------|------------------|-----------|
| conversation_send | 1 | 5,000 | Yes | No |
| workflow_trigger | 1 | 3,000 | Yes | No |
| calendar_booking | 1 | 8,000 | Yes | No |
| contact_create | 2 | 4,000 | Yes | Yes |
| opportunity_create | 2 | 5,000 | Yes | Yes |
| pipeline_update | 2 | 3,000 | Yes | No |
| contact_update | 3 | 3,000 | Yes | Yes |
| opportunity_update | 3 | 4,000 | Yes | Yes |
| task_create | 3 | 2,000 | Yes | Yes |
| note_create | 3 | 2,000 | Yes | Yes |
| custom_field_update | 3 | 2,500 | Yes | Yes |
| campaign_add | 4 | 3,000 | Yes | Yes |
| campaign_remove | 4 | 3,000 | Yes | Yes |
| tag_add | 4 | 1,500 | Yes | Yes |
| tag_remove | 4 | 1,500 | Yes | Yes |
| conversation_read | 4 | 2,000 | Yes | No |
| contact_delete | 5 | 3,000 | Yes | Yes |
| bulk_operation | 5 | 30,000 | Yes | No |
| report_generate | 5 | 15,000 | Yes | No |
| data_export | 5 | 20,000 | Yes | No |
| integration_sync | 5 | 10,000 | No | No |

---

## Appendix B: Workflow Step Configuration Reference

### Navigate Step
```typescript
{
  type: "navigate",
  url: "https://example.com/{{page}}"
}
```

### Act Step
```typescript
{
  type: "act",
  instruction: "Click the login button"
}
```

### Observe Step
```typescript
{
  type: "observe",
  observeInstruction: "Find all navigation menu items"
}
```

### Extract Step
```typescript
{
  type: "extract",
  extractInstruction: "Extract all contact information",
  schemaType: "contactInfo" // or "productInfo" or "custom"
}
```

### Wait Step
```typescript
{
  type: "wait",
  waitMs: 2000,
  selector: ".loading-indicator" // optional
}
```

### Condition Step
```typescript
{
  type: "condition",
  condition: "itemCount > 0 && isLoggedIn === true"
}
```

### Loop Step
```typescript
{
  type: "loop",
  items: "{{extractedContacts}}"
}
```

### API Call Step
```typescript
{
  type: "apiCall",
  url: "https://api.example.com/data",
  method: "POST",
  headers: { "Authorization": "Bearer {{apiKey}}" },
  body: { "query": "{{searchTerm}}" },
  saveAs: "apiResponse"
}
```

### Notification Step
```typescript
{
  type: "notification",
  message: "Workflow completed with {{successCount}} successes",
  notificationType: "info"
}
```

---

## Appendix C: Cron Expression Examples

| Schedule | Cron Expression | Description |
|----------|-----------------|-------------|
| Daily at midnight | `0 0 * * *` | Every day at 12:00 AM |
| Daily at 9 AM | `0 9 * * *` | Every day at 9:00 AM |
| Every Monday at 9 AM | `0 9 * * 1` | Weekly on Monday |
| First of month at 6 AM | `0 6 1 * *` | Monthly on the 1st |
| Every 15 minutes | `*/15 * * * *` | Throughout the day |
| Weekdays at 8:30 AM | `30 8 * * 1-5` | Monday-Friday |
| Every 6 hours | `0 */6 * * *` | 4 times per day |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Design, Operations
