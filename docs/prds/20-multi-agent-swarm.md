# PRD-020: Multi-Agent Swarm Coordination

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/swarm.ts`, `server/services/swarm/`

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

The Multi-Agent Swarm Coordination feature enables intelligent orchestration of multiple AI agents working collaboratively to accomplish complex objectives. Inspired by distributed systems and swarm intelligence principles, this system provides sophisticated task distribution, dynamic load balancing, fault tolerance, auto-scaling, health monitoring, and capability-based task assignment across a fleet of specialized agents.

### 1.2 Feature Summary

- **Swarm Lifecycle Management**: Create, start, stop, and monitor multi-agent swarms with configurable strategies
- **40+ Specialized Agent Types**: Access to coordinator, researcher, coder, analyst, architect, tester, reviewer, optimizer, and domain-specific agents
- **Capability-Based Task Assignment**: Match tasks to agents based on required skills, languages, frameworks, and domains
- **Priority Queuing System**: Five-tier priority system (critical, high, normal, low, background) with GHL-specific urgency mapping
- **Load Balancing**: Multiple distribution strategies (capability-based, least-loaded, round-robin, session-aware)
- **Auto-Scaling**: Dynamic agent spawning and termination based on workload demand
- **Fault Tolerance**: Automatic retry with exponential backoff, failover, and checkpoint recovery
- **Health Monitoring**: Real-time agent and task health tracking with issue detection
- **Session Affinity**: Browser session management with client-specific affinity for GHL operations
- **Task Batching**: Intelligent grouping of similar operations for efficiency
- **Result Consolidation**: Aggregation and reporting of swarm execution outcomes

### 1.3 Target Users

- Agency Automation Engineers
- Enterprise IT Operations Teams
- Marketing Automation Specialists
- DevOps and Platform Engineers
- Business Process Automation Managers
- AI/ML Operations Teams
- Quality Assurance Managers

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Sequential Execution Bottleneck**: Complex workflows require many steps executed one at a time, leading to long execution times
2. **Resource Underutilization**: Single-agent execution leaves available compute and AI capacity unused
3. **No Specialization**: Generic agents cannot leverage domain expertise for specialized tasks
4. **Limited Fault Recovery**: Single points of failure cause entire workflows to abort
5. **Manual Scaling**: Users must manually manage agent counts based on workload
6. **No Workload Distribution**: Tasks cannot be intelligently routed to optimal agents
7. **Lack of Coordination**: Multiple parallel operations lack synchronization and result aggregation

### 2.2 User Pain Points

- "Complex GHL migrations take hours when they could run in parallel"
- "When one automation fails, everything stops - there's no automatic retry"
- "I can't tell which agents are overloaded or sitting idle"
- "Tasks keep getting assigned to agents that don't have the right skills"
- "I need to manually start more agents when workload spikes"
- "Browser sessions timeout while waiting for slow tasks to complete"
- "Batch operations across multiple clients aren't coordinated efficiently"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Sequential execution | 5-10x longer completion time for complex workflows |
| Single-agent failures | 40% workflow abort rate requiring manual restart |
| No load balancing | 60% agent underutilization during peak periods |
| Manual scaling | 2-4 hour delay responding to workload spikes |
| Capability mismatch | 25% task retry rate from wrong agent assignment |
| Session timeouts | Lost progress requiring full re-execution |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Enable parallel multi-agent execution with 2-5x speedup | P0 |
| **G2** | Implement intelligent capability-based task routing | P0 |
| **G3** | Provide automatic fault tolerance with retry and failover | P0 |
| **G4** | Support dynamic auto-scaling based on workload | P1 |
| **G5** | Deliver comprehensive health monitoring and alerting | P1 |
| **G6** | Enable GHL-optimized session affinity and batching | P1 |
| **G7** | Support five-tier priority queuing system | P0 |

### 3.2 Success Metrics (KPIs)

#### Swarm Performance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Parallel Speedup | >= 3x | Multi-agent vs single-agent execution time |
| Task Completion Rate | >= 95% | Completed tasks / Total tasks submitted |
| Average Task Wait Time | < 30 seconds | Queue time before agent assignment |
| Swarm Throughput | 100+ tasks/hour | Tasks completed per swarm per hour |
| Agent Utilization | >= 70% | Active time / Available time |

#### Reliability Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Fault Recovery Rate | >= 90% | Successfully retried / Failed tasks |
| Failover Success Rate | >= 95% | Tasks completed after agent failure |
| Health Check Accuracy | >= 99% | Correct health assessments |
| Auto-Scale Response Time | < 60 seconds | Time to spawn/terminate agents |
| Swarm Availability | >= 99.5% | Swarm uptime percentage |

#### Load Balancing Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Workload Variance | < 20% | Standard deviation of agent workload |
| Capability Match Rate | >= 95% | Tasks assigned to capable agents |
| Priority Adherence | >= 99% | Critical tasks processed first |
| Session Affinity Hit Rate | >= 80% | Tasks using existing sessions |
| Batch Efficiency | >= 85% | Batched vs individual operations |

#### Operational Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Swarm Creation Time | < 5 seconds | API response time |
| Agent Spawn Time | < 3 seconds | Time to ready state |
| Health Check Interval | 60 seconds | Monitoring frequency |
| Metrics Collection Interval | 10 seconds | Metrics update frequency |
| Memory Overhead | < 100MB/agent | Memory per active agent |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: Create and Execute Swarm
**As a** marketing automation engineer
**I want to** create a swarm with a specific objective and strategy
**So that** multiple agents work together to complete complex workflows

**Acceptance Criteria:**
- [ ] Create swarm with objective description up to 10,000 characters
- [ ] Select from strategies: research, development, analysis, deployment, auto
- [ ] Configure max agents (1-50), max tasks (1-500), and timeout
- [ ] Swarm decomposes objective into executable tasks
- [ ] Swarm spawns appropriate agent types for strategy
- [ ] Progress updates stream in real-time
- [ ] Results aggregated upon completion

#### US-002: Monitor Swarm Health
**As an** operations manager
**I want to** view real-time health status of swarms and agents
**So that** I can identify and address issues before they impact execution

**Acceptance Criteria:**
- [ ] View overall swarm health score (0-1)
- [ ] See agent counts by status (healthy, unhealthy, offline)
- [ ] See task counts by status (pending, running, completed, failed)
- [ ] View resource utilization (CPU, memory, disk)
- [ ] Receive issue alerts with severity and recommendations
- [ ] Health checks run every 60 seconds

#### US-003: Priority-Based Task Queuing
**As a** workflow designer
**I want to** assign priorities to tasks
**So that** critical operations execute before lower-priority work

**Acceptance Criteria:**
- [ ] Assign priority: critical, high, normal, low, background
- [ ] Critical tasks preempt lower priority tasks in queue
- [ ] GHL operations have urgency levels (1-5) mapped to priorities
- [ ] View queue status by priority distribution
- [ ] Priority changes take effect immediately
- [ ] Queue maintains FIFO within same priority

#### US-004: Capability-Based Agent Selection
**As a** platform administrator
**I want to** tasks routed to agents with matching capabilities
**So that** each task is handled by the most qualified agent

**Acceptance Criteria:**
- [ ] Define required capabilities per task (languages, frameworks, domains, tools)
- [ ] Agent registry includes 40+ specialized agent types
- [ ] Strategy selects agent based on capability match score
- [ ] Agents with better match receive higher priority
- [ ] Fallback to less specialized agent if no exact match
- [ ] View agent capabilities in agent list

#### US-005: Automatic Fault Tolerance
**As a** reliability engineer
**I want** failed tasks to automatically retry with backoff
**So that** transient failures don't cause workflow aborts

**Acceptance Criteria:**
- [ ] Failed tasks retry up to 3 times (configurable)
- [ ] Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s (max)
- [ ] Permanent failure after max retries
- [ ] Failed task moved to retry queue with next retry timestamp
- [ ] Browser session health degrades on failures
- [ ] Agent workload released on task failure

### 4.2 Advanced User Stories

#### US-006: Auto-Scaling Agents
**As an** infrastructure engineer
**I want** the swarm to automatically scale agents based on workload
**So that** resources match demand without manual intervention

**Acceptance Criteria:**
- [ ] Scale up when queue length exceeds threshold
- [ ] Scale down when agents sit idle
- [ ] Respect max agent limits per swarm
- [ ] New agents spawn within 3 seconds
- [ ] Graceful termination waits for current task
- [ ] Scaling events are logged and auditable

#### US-007: Session Affinity for GHL Operations
**As a** GHL automation specialist
**I want** browser sessions to maintain client affinity
**So that** operations for the same client reuse authenticated sessions

**Acceptance Criteria:**
- [ ] Track client ID to session ID mapping
- [ ] Route tasks to agent with existing client session
- [ ] Session affinity timeout of 5 minutes
- [ ] Session health tracked (0-1 score)
- [ ] Unhealthy sessions cleared from affinity map
- [ ] Session concurrency limit of 5 tasks per session

#### US-008: Task Batching for Efficiency
**As a** bulk operations manager
**I want** similar tasks to be batched together
**So that** overhead is reduced and throughput increased

**Acceptance Criteria:**
- [ ] Batchable GHL operations grouped by client + operation type
- [ ] Batch window of 2 seconds for collection
- [ ] Max batch size of 10 tasks
- [ ] Non-batchable operations execute immediately
- [ ] Batch results consolidated with success/failure counts
- [ ] Partial batch failure doesn't abort entire batch

#### US-009: Real-Time Metrics Collection
**As a** performance analyst
**I want** comprehensive metrics on swarm performance
**So that** I can optimize configurations and identify bottlenecks

**Acceptance Criteria:**
- [ ] Global metrics: throughput, latency, efficiency, reliability
- [ ] Per-swarm metrics: quality, utilization, completion rate, error rate
- [ ] Per-agent metrics: tasks completed, success rate, response time
- [ ] Metrics collected every 10 seconds
- [ ] Historical metrics retained for trend analysis
- [ ] Export metrics to monitoring systems

#### US-010: GHL Operation Urgency Mapping
**As a** GHL platform expert
**I want** GHL operations prioritized by business urgency
**So that** time-sensitive operations execute first

**Acceptance Criteria:**
- [ ] 20+ GHL operation types with urgency levels
- [ ] Urgency 1 (critical): conversation_send, workflow_trigger, calendar_booking
- [ ] Urgency 2 (high): contact_create, opportunity_create, pipeline_update
- [ ] Urgency 3 (normal): contact_update, opportunity_update, task_create
- [ ] Urgency 4 (low): campaign_add/remove, tag_add/remove
- [ ] Urgency 5 (background): bulk_operation, report_generate, data_export
- [ ] Queue sorted by urgency then priority then timestamp

---

## 5. Functional Requirements

### 5.1 Swarm Coordinator

#### FR-001: Coordinator Lifecycle
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Initialize coordinator with configuration (maxAgents, maxTasks, strategies) | P0 |
| FR-001.2 | Start background health check process (60-second interval) | P0 |
| FR-001.3 | Start metrics collection process (10-second interval) | P0 |
| FR-001.4 | Support graceful shutdown with active swarm cleanup | P0 |
| FR-001.5 | Emit events for all lifecycle transitions | P1 |
| FR-001.6 | Maintain global metrics aggregated across all swarms | P1 |

#### FR-002: Swarm Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Create swarm with objective, strategy, and configuration | P0 |
| FR-002.2 | Generate unique swarm IDs with timestamp and random suffix | P0 |
| FR-002.3 | Support strategies: research, development, analysis, deployment, auto | P0 |
| FR-002.4 | Configure constraints: maxAgents (1-50), maxTasks (1-500), timeout | P0 |
| FR-002.5 | Decompose objective into task definitions based on strategy | P0 |
| FR-002.6 | Spawn required agent types for selected strategy | P0 |
| FR-002.7 | Start swarm execution with task scheduling | P0 |
| FR-002.8 | Stop swarm with reason logging and agent termination | P0 |
| FR-002.9 | Execute quick swarm (create + start in single operation) | P1 |

#### FR-003: Objective Decomposition
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Research strategy: research -> analysis -> documentation tasks | P0 |
| FR-003.2 | Development strategy: architecture -> coding -> testing -> review tasks | P0 |
| FR-003.3 | Analysis strategy: data collection -> statistical analysis -> report tasks | P0 |
| FR-003.4 | Auto strategy: explore -> execute -> validate tasks | P0 |
| FR-003.5 | Establish task dependencies for sequential execution | P0 |
| FR-003.6 | Assign task priorities (high for core, medium for supporting) | P1 |

### 5.2 Task Distributor

#### FR-004: Task Queuing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Queue tasks with priority (critical, high, normal, low, background) | P0 |
| FR-004.2 | Sort queue by GHL urgency level (1-5) | P0 |
| FR-004.3 | Sort queue by priority within urgency level | P0 |
| FR-004.4 | Sort queue by creation timestamp within priority | P0 |
| FR-004.5 | Support GHL operation type annotation on tasks | P1 |
| FR-004.6 | Support client ID annotation for session affinity | P1 |
| FR-004.7 | Report queue status (length, by priority, by GHL operation) | P0 |

#### FR-005: GHL Operation Urgency
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Map 20+ GHL operation types to urgency levels | P0 |
| FR-005.2 | Urgency 1: conversation_send, workflow_trigger, calendar_booking | P0 |
| FR-005.3 | Urgency 2: contact_create, opportunity_create, pipeline_update | P0 |
| FR-005.4 | Urgency 3: contact_update, opportunity_update, task_create, note_create | P0 |
| FR-005.5 | Urgency 4: campaign_add/remove, tag_add/remove, conversation_read | P0 |
| FR-005.6 | Urgency 5: bulk_operation, report_generate, data_export, integration_sync | P0 |
| FR-005.7 | Include estimated duration per operation type | P1 |
| FR-005.8 | Flag operations requiring browser sessions | P1 |

#### FR-006: Task Assignment
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Filter agents by capability match | P0 |
| FR-006.2 | Filter agents by availability (idle or partially busy) | P0 |
| FR-006.3 | Filter agents by workload (< 90% capacity) | P0 |
| FR-006.4 | Apply distribution strategy to select optimal agent | P0 |
| FR-006.5 | Create task assignment record with metadata | P0 |
| FR-006.6 | Update task status to 'assigned' | P0 |
| FR-006.7 | Update agent workload and status | P0 |
| FR-006.8 | Emit task:assigned event | P1 |

#### FR-007: Distribution Strategies
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Capability-based: score agents by capability match and select highest | P0 |
| FR-007.2 | Least-loaded: select agent with lowest current workload | P0 |
| FR-007.3 | Round-robin: rotate through available agents | P1 |
| FR-007.4 | Session-aware: prefer agents with existing browser sessions | P0 |
| FR-007.5 | Agent scoring: health (30%), success rate (25%), availability (20%), quality (15%), reliability (10%) | P0 |
| FR-007.6 | Session-aware bonus: +15 for having sessions, +health*10 for session health | P1 |

### 5.3 Session Management

#### FR-008: Browser Session Tracking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Register browser sessions with agent ID and client affinity | P0 |
| FR-008.2 | Track session metrics: active task count, health, created/last used | P0 |
| FR-008.3 | Enforce max concurrent tasks per session (default 5) | P0 |
| FR-008.4 | Assign browser sessions to agents on task assignment | P0 |
| FR-008.5 | Release sessions on task completion | P0 |
| FR-008.6 | Degrade session health on task failures | P1 |

#### FR-009: Session Affinity
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Map client IDs to session IDs | P0 |
| FR-009.2 | Route tasks to agents with existing client sessions | P0 |
| FR-009.3 | Session affinity timeout of 5 minutes (configurable) | P0 |
| FR-009.4 | Clear stale affinity mappings on timeout | P0 |
| FR-009.5 | Skip affinity for unhealthy sessions (health < 0.5) | P1 |
| FR-009.6 | Emit events for session registration, release, and cleanup | P1 |

### 5.4 Task Batching

#### FR-010: Batch Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Batch tasks by client ID + GHL operation type | P1 |
| FR-010.2 | Batch window of 2 seconds for task collection | P1 |
| FR-010.3 | Max batch size of 10 tasks | P1 |
| FR-010.4 | Process batch immediately when size limit reached | P1 |
| FR-010.5 | Process pending batches after window timeout | P1 |
| FR-010.6 | Add batch metadata to batched tasks | P1 |
| FR-010.7 | Track batch status: pending, processing, completed, failed | P1 |

#### FR-011: Result Consolidation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Consolidate results by batch ID | P1 |
| FR-011.2 | Track success and failure counts per batch | P1 |
| FR-011.3 | Merge consolidated outputs from batch tasks | P1 |
| FR-011.4 | Calculate total execution time per batch | P1 |
| FR-011.5 | Emit batch:result_consolidated events | P1 |
| FR-011.6 | Support batch result retrieval and cleanup | P1 |

### 5.5 Fault Tolerance

#### FR-012: Retry Logic
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Retry failed tasks up to 3 times (configurable) | P0 |
| FR-012.2 | Exponential backoff: base 1s, max 32s | P0 |
| FR-012.3 | Track retry count per task assignment | P0 |
| FR-012.4 | Move failed tasks to retry queue with next retry timestamp | P0 |
| FR-012.5 | Background retry processor checks every 1 second | P0 |
| FR-012.6 | Re-queue tasks for retry at scheduled time | P0 |
| FR-012.7 | Permanent failure after max retries with notification | P0 |

#### FR-013: Failure Handling
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Release browser session on task failure | P0 |
| FR-013.2 | Degrade session health by 0.2 on failure | P1 |
| FR-013.3 | Handle batch failures without aborting entire batch | P1 |
| FR-013.4 | Emit task:retry_scheduled and task:failed events | P0 |
| FR-013.5 | Log failure details with error context | P0 |
| FR-013.6 | Update agent error history | P1 |

### 5.6 Health Monitoring

#### FR-014: Agent Health
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Track agent health score (0-1) | P0 |
| FR-014.2 | Categorize agents: healthy (>0.7), unhealthy (0.3-0.7), offline (<0.3) | P0 |
| FR-014.3 | Track last heartbeat timestamp | P0 |
| FR-014.4 | Monitor agent metrics: success rate, execution time, resource usage | P1 |
| FR-014.5 | Maintain error history per agent | P1 |
| FR-014.6 | Emit health:warning events for issues | P1 |

#### FR-015: Task Health
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Count tasks by status: pending, running, completed, failed | P0 |
| FR-015.2 | Calculate task completion rate | P0 |
| FR-015.3 | Detect high failure rate (> 10% of completed) | P0 |
| FR-015.4 | Track average task execution time | P1 |
| FR-015.5 | Monitor queue wait times | P1 |

#### FR-016: Issue Detection
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Detect unhealthy agent count | P0 |
| FR-016.2 | Detect high task failure rate | P0 |
| FR-016.3 | Categorize issues by type: agent, task, resource, communication | P1 |
| FR-016.4 | Assign issue severity: low, medium, high, critical | P1 |
| FR-016.5 | Provide recommended actions for issues | P2 |
| FR-016.6 | Track affected components per issue | P1 |

### 5.7 Metrics Collection

#### FR-017: Swarm Metrics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | Track throughput (tasks completed) | P0 |
| FR-017.2 | Track latency (average execution time) | P0 |
| FR-017.3 | Calculate efficiency score | P1 |
| FR-017.4 | Calculate reliability score | P0 |
| FR-017.5 | Track average quality | P1 |
| FR-017.6 | Monitor resource utilization | P1 |
| FR-017.7 | Track agent utilization percentage | P0 |
| FR-017.8 | Calculate error rate | P0 |

#### FR-018: Progress Tracking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | Track total, completed, failed, running task counts | P0 |
| FR-018.2 | Calculate percent complete | P0 |
| FR-018.3 | Estimate completion time | P1 |
| FR-018.4 | Track time remaining | P1 |
| FR-018.5 | Count active and idle agents | P0 |
| FR-018.6 | Update progress every 5 seconds | P0 |

### 5.8 Agent Management

#### FR-019: Agent Types
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-019.1 | Support 40+ agent types across categories | P0 |
| FR-019.2 | Development: coder, developer, frontend-dev, backend-dev, mobile-dev | P0 |
| FR-019.3 | Architecture: architect, design-architect, system-architect | P0 |
| FR-019.4 | Testing: tester, qa-engineer, test-automation-engineer, security-tester | P0 |
| FR-019.5 | DevOps: cicd-engineer, cloud-architect, security-engineer, monitor | P0 |
| FR-019.6 | Data: analyst, data-scientist, ml-engineer, analytics-engineer | P0 |
| FR-019.7 | Business: researcher, documenter, technical-writer, project-manager | P0 |
| FR-019.8 | Specialized: coordinator, optimizer, specialist | P0 |

#### FR-020: Agent Capabilities
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020.1 | Define capability flags: codeGeneration, codeReview, testing, documentation, etc. | P0 |
| FR-020.2 | Specify supported languages per agent type | P0 |
| FR-020.3 | Specify supported frameworks per agent type | P0 |
| FR-020.4 | Specify domain expertise per agent type | P0 |
| FR-020.5 | Specify available tools per agent type | P0 |
| FR-020.6 | Define performance attributes: reliability, speed, quality | P0 |
| FR-020.7 | Set resource limits: maxConcurrentTasks, maxMemoryUsage, maxExecutionTime | P0 |

#### FR-021: Agent State
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-021.1 | Track status: initializing, idle, busy, paused, error, offline, terminating, terminated | P0 |
| FR-021.2 | Track current workload (0-1) | P0 |
| FR-021.3 | Track health score (0-1) | P0 |
| FR-021.4 | Track last heartbeat | P0 |
| FR-021.5 | Maintain task history | P1 |
| FR-021.6 | Maintain error history with context | P1 |
| FR-021.7 | Track agent metrics: tasksCompleted, tasksFailed, successRate, averageExecutionTime | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Swarm creation time | < 5 seconds | P0 |
| NFR-002 | Agent spawn time | < 3 seconds | P0 |
| NFR-003 | Task queue insertion | < 100ms | P0 |
| NFR-004 | Task assignment time | < 200ms | P0 |
| NFR-005 | Health check latency | < 500ms | P0 |
| NFR-006 | Metrics collection latency | < 200ms | P1 |
| NFR-007 | Event emission latency | < 50ms | P1 |
| NFR-008 | API response time (P95) | < 500ms | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-009 | Max agents per swarm | 50 | P0 |
| NFR-010 | Max concurrent swarms | 100 | P1 |
| NFR-011 | Max tasks per swarm | 500 | P0 |
| NFR-012 | Max queued tasks | 10,000 | P1 |
| NFR-013 | Max concurrent sessions | 500 | P1 |
| NFR-014 | Task throughput | 1,000+ tasks/minute | P1 |
| NFR-015 | Horizontal scaling | Linear to 10 instances | P2 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-016 | Swarm availability | >= 99.5% | P0 |
| NFR-017 | Task completion rate | >= 95% | P0 |
| NFR-018 | Fault recovery rate | >= 90% | P0 |
| NFR-019 | Failover time | < 5 seconds | P1 |
| NFR-020 | Data consistency | Eventual (< 1 second) | P0 |
| NFR-021 | Graceful degradation | Yes (on partial failures) | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-022 | All endpoints require authentication (protectedProcedure) | P0 |
| NFR-023 | User-scoped swarm access control | P0 |
| NFR-024 | Agent permission validation | P0 |
| NFR-025 | Input validation via Zod schemas | P0 |
| NFR-026 | Audit logging for all operations | P0 |
| NFR-027 | Sensitive data masking in logs | P0 |
| NFR-028 | Rate limiting per user | P0 |
| NFR-029 | Secure inter-agent communication | P1 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-030 | Structured logging with correlation IDs | P0 |
| NFR-031 | Event emission for all state transitions | P0 |
| NFR-032 | Real-time metrics collection | P0 |
| NFR-033 | Health check dashboards | P1 |
| NFR-034 | Alerting on critical issues | P0 |
| NFR-035 | Distributed tracing support | P2 |

### 6.6 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-036 | TypeScript strict mode | P0 |
| NFR-037 | Zod schema validation | P0 |
| NFR-038 | Test coverage >= 80% | P1 |
| NFR-039 | API documentation | P1 |
| NFR-040 | Modular service architecture | P0 |
| NFR-041 | Event-driven design | P0 |
| NFR-042 | Configuration externalization | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
                                    ┌──────────────────────────────────────────────────────────────────┐
                                    │                      Client Application                           │
                                    │                  (React/Next.js with tRPC)                        │
                                    └─────────────────────────────┬────────────────────────────────────┘
                                                                  │ tRPC / SSE
                                                                  ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          API Layer (swarm.ts)                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   initialize   │  │     create     │  │   start/stop   │  │   getStatus    │  │   getHealth    │   │
│  │                │  │                │  │                │  │                │  │                │   │
│  │ Init global    │  │ Create new     │  │ Start/stop     │  │ Get swarm      │  │ Get health     │   │
│  │ coordinator    │  │ swarm          │  │ execution      │  │ details        │  │ status         │   │
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   listActive   │  │  getMetrics    │  │ getAgentTypes  │  │ getQueueStatus │  │  executeQuick  │   │
│  │                │  │                │  │                │  │                │  │                │   │
│  │ List all       │  │ Get global &   │  │ List agent     │  │ Get queue      │  │ Create + start │   │
│  │ active swarms  │  │ per-swarm      │  │ type registry  │  │ metrics        │  │ in one call    │   │
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘   │
└───────────────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                                    │
            ┌───────────────────────────────────────┴───────────────────────────────────────┐
            ▼                                                                               ▼
┌───────────────────────────────────────────────┐                       ┌───────────────────────────────────────────────┐
│              SwarmCoordinator                  │                       │              TaskDistributor                   │
│                                               │                       │                                               │
│  ┌─────────────────────────────────────────┐  │                       │  ┌─────────────────────────────────────────┐  │
│  │         Active Swarms Map               │  │                       │  │           Task Queue                    │  │
│  │  swarmId -> SwarmExecutionContext       │  │                       │  │  Priority-sorted with GHL urgency       │  │
│  └─────────────────────────────────────────┘  │                       │  └─────────────────────────────────────────┘  │
│                                               │                       │                                               │
│  ┌─────────────────────────────────────────┐  │                       │  ┌─────────────────────────────────────────┐  │
│  │    Objective Decomposition              │  │                       │  │      Distribution Strategies            │  │
│  │    research/development/analysis/auto   │  │                       │  │  capability/least-loaded/session-aware  │  │
│  └─────────────────────────────────────────┘  │                       │  └─────────────────────────────────────────┘  │
│                                               │                       │                                               │
│  ┌─────────────────────────────────────────┐  │                       │  ┌─────────────────────────────────────────┐  │
│  │      Health Check Background            │  │                       │  │       Retry Processor                   │  │
│  │      60-second interval                 │  │                       │  │       Exponential backoff               │  │
│  └─────────────────────────────────────────┘  │                       │  └─────────────────────────────────────────┘  │
│                                               │                       │                                               │
│  ┌─────────────────────────────────────────┐  │                       │  ┌─────────────────────────────────────────┐  │
│  │      Metrics Collection Background      │  │                       │  │       Batch Processor                   │  │
│  │      10-second interval                 │  │                       │  │       2-second window, max 10 tasks     │  │
│  └─────────────────────────────────────────┘  │                       │  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘                       └───────────────────────────────────────────────┘
            │                                                                               │
            │                                                                               │
            ▼                                                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              Session Manager                                                            │
│                                                                                                                         │
│  ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐    ┌────────────────────────────┐  │
│  │     Browser Sessions Map            │    │    Client Session Affinity Map      │    │     Result Consolidations  │  │
│  │  sessionId -> BrowserSessionInfo    │    │    clientId -> sessionId            │    │     batchId -> ResultSet   │  │
│  │  - agentId, activeTaskCount         │    │    5-minute timeout                 │    │     success/failure counts │  │
│  │  - health, maxConcurrentTasks       │    │                                     │    │                            │  │
│  └─────────────────────────────────────┘    └─────────────────────────────────────┘    └────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              Agent Type Registry                                                        │
│                                                                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │  coordinator │ │  researcher  │ │    coder     │ │   analyst    │ │  architect   │ │    tester    │               │
│  │              │ │              │ │              │ │              │ │              │ │              │               │
│  │ Orchestrate  │ │ Research &   │ │ Code gen,    │ │ Data & stats │ │ System       │ │ QA, test     │               │
│  │ & manage     │ │ gather data  │ │ review, test │ │ analysis     │ │ design       │ │ automation   │               │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘               │
│                                                                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │   reviewer   │ │  optimizer   │ │  documenter  │ │   monitor    │ │ backend-dev  │ │ frontend-dev │               │
│  │              │ │              │ │              │ │              │ │              │ │              │               │
│  │ Code quality │ │ Performance  │ │ Tech docs &  │ │ System       │ │ API & server │ │ UI/UX        │               │
│  │ & review     │ │ optimization │ │ knowledge    │ │ monitoring   │ │ development  │ │ development  │               │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘               │
│                                                                                                                         │
│                              + 30 more specialized agent types                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Details

#### 7.2.1 SwarmCoordinator Service

The central orchestration component managing swarm lifecycles.

**Key Responsibilities:**
- Initialize and manage global coordinator instance
- Create and configure swarms with objectives
- Decompose objectives into task graphs
- Spawn appropriate agent types for strategy
- Monitor swarm progress and health
- Aggregate metrics across swarms
- Handle graceful shutdown with cleanup

**Configuration:**
```typescript
interface SwarmConfig {
  name: string;
  description?: string;
  maxAgents: number;          // Default: 10, Max: 50
  maxTasks: number;           // Default: 100, Max: 500
  maxConcurrentTasks: number; // Default: 10
  taskTimeoutMinutes: number; // Default: 30
  coordinationStrategy: 'hierarchical' | 'mesh' | 'adaptive' | 'hybrid';
  autoScaling: boolean;       // Default: true
  loadBalancing: boolean;     // Default: true
  faultTolerance: boolean;    // Default: true
}
```

**Execution Context:**
```typescript
interface SwarmExecutionContext {
  swarmId: string;
  objective: SwarmObjective;
  agents: Map<string, AgentState>;
  tasks: Map<string, TaskDefinition>;
  startTime: Date;
  endTime?: Date;
  metrics: SwarmMetrics;
}
```

#### 7.2.2 TaskDistributor Service

Intelligent task routing and workload management.

**Key Responsibilities:**
- Manage priority task queue with GHL urgency
- Distribute tasks to capable agents
- Track task assignments with metadata
- Manage browser sessions and affinity
- Handle task batching for efficiency
- Process retries with exponential backoff
- Consolidate batch results

**GHL Operation Urgency:**
```typescript
const GHL_OPERATION_URGENCY: Record<GHLOperationType, GHLOperationUrgency> = {
  // Urgency 1 - Critical (execute immediately)
  conversation_send: { urgencyLevel: 1, estimatedDuration: 5000, requiresSession: true, canBatch: false },
  workflow_trigger: { urgencyLevel: 1, estimatedDuration: 3000, requiresSession: true, canBatch: false },
  calendar_booking: { urgencyLevel: 1, estimatedDuration: 8000, requiresSession: true, canBatch: false },

  // Urgency 2 - High
  contact_create: { urgencyLevel: 2, estimatedDuration: 4000, requiresSession: true, canBatch: true },
  opportunity_create: { urgencyLevel: 2, estimatedDuration: 5000, requiresSession: true, canBatch: true },

  // Urgency 3 - Normal
  contact_update: { urgencyLevel: 3, estimatedDuration: 3000, requiresSession: true, canBatch: true },
  task_create: { urgencyLevel: 3, estimatedDuration: 2000, requiresSession: true, canBatch: true },

  // Urgency 4 - Low
  campaign_add: { urgencyLevel: 4, estimatedDuration: 3000, requiresSession: true, canBatch: true },
  tag_add: { urgencyLevel: 4, estimatedDuration: 1500, requiresSession: true, canBatch: true },

  // Urgency 5 - Background
  bulk_operation: { urgencyLevel: 5, estimatedDuration: 30000, requiresSession: true, canBatch: false },
  report_generate: { urgencyLevel: 5, estimatedDuration: 15000, requiresSession: true, canBatch: false },
};
```

**Distribution Strategy Scoring:**
```typescript
// Agent scoring algorithm
function scoreAgent(agent: AgentState, task: TaskDefinition): number {
  let score = 0;
  score += agent.health * 30;           // Health: 0-30 points
  score += agent.metrics.successRate * 25; // Success: 0-25 points
  score += (1 - agent.workload) * 20;   // Availability: 0-20 points
  score += agent.capabilities.quality * 15; // Quality: 0-15 points
  score += agent.capabilities.reliability * 10; // Reliability: 0-10 points
  return score;
}
```

#### 7.2.3 Agent Type Registry

Comprehensive registry of 40+ specialized agent types.

**Agent Categories:**
| Category | Agent Types |
|----------|-------------|
| Development | coder, developer, frontend-dev, backend-dev, mobile-dev |
| Architecture | architect, design-architect, system-architect, database-architect |
| Testing | tester, qa-engineer, test-automation-engineer, security-tester |
| DevOps | cicd-engineer, cloud-architect, security-engineer, performance-engineer |
| Data | analyst, data-scientist, ml-engineer, data-engineer, analytics-engineer |
| Business | researcher, documenter, technical-writer, project-manager, product-owner |
| Specialized | coordinator, optimizer, specialist, monitor |

**Agent Capabilities Schema:**
```typescript
interface AgentCapabilities {
  codeGeneration: boolean;
  codeReview: boolean;
  testing: boolean;
  documentation: boolean;
  research: boolean;
  analysis: boolean;
  webSearch: boolean;
  apiIntegration: boolean;
  fileSystem: boolean;
  terminalAccess: boolean;
  languages: string[];      // ['typescript', 'python', 'rust']
  frameworks: string[];     // ['react', 'node', 'fastapi']
  domains: string[];        // ['web-development', 'data-analysis']
  tools: string[];          // ['git', 'debugger', 'profiler']
  maxConcurrentTasks: number;
  maxMemoryUsage: number;
  maxExecutionTime: number;
  reliability: number;      // 0-1
  speed: number;            // 0-1
  quality: number;          // 0-1
}
```

### 7.3 Data Flow

#### Swarm Creation Flow
```
1. Client calls swarm.create with objective and options
                    ▼
2. SwarmCoordinator generates unique swarm ID
                    ▼
3. Create SwarmObjective with strategy and requirements
                    ▼
4. Initialize SwarmExecutionContext with empty agents/tasks
                    ▼
5. Store context in activeSwarms map
                    ▼
6. Emit 'swarm:created' event
                    ▼
7. Return swarmId to client
```

#### Swarm Start Flow
```
1. Client calls swarm.start with swarmId
                    ▼
2. Validate swarm exists and is in 'planning' state
                    ▼
3. Change status to 'initializing'
                    ▼
4. Decompose objective into TaskDefinitions
                    ▼
5. Store tasks in context.tasks map
                    ▼
6. Get required agent types from strategy
                    ▼
7. Spawn agents from registry
                    ▼
8. Store agents in context.agents map
                    ▼
9. Change status to 'executing'
                    ▼
10. Start task scheduling monitor (5-second interval)
                    ▼
11. Emit 'swarm:started' event
```

#### Task Distribution Flow
```
1. Task queued with priority and GHL metadata
                    ▼
2. Check if task is batchable
   ├── Yes: Add to batch queue, wait for window/size
   └── No: Add directly to task queue
                    ▼
3. Sort queue by: GHL urgency -> priority -> timestamp
                    ▼
4. Check for session affinity (if GHL operation)
   ├── Found: Use existing agent/session
   └── Not found: Continue to strategy selection
                    ▼
5. Filter agents by capability requirements
                    ▼
6. Apply distribution strategy to score agents
                    ▼
7. Select highest-scoring available agent
                    ▼
8. Assign/create browser session if required
                    ▼
9. Create TaskAssignment record
                    ▼
10. Update task status, agent workload
                    ▼
11. Emit 'task:assigned' event
```

#### Retry Flow
```
1. Task fails during execution
                    ▼
2. Release browser session, degrade health
                    ▼
3. Check retry count < max retries
   ├── Yes: Schedule retry
   │   ├── Calculate backoff delay (1s * 2^retryCount)
   │   ├── Set nextRetryAt timestamp
   │   ├── Move to failedTasks queue
   │   └── Emit 'task:retry_scheduled' event
   │
   └── No: Permanent failure
       ├── Handle batch failure if applicable
       └── Emit 'task:failed' event
                    ▼
4. Retry processor checks every 1 second
                    ▼
5. Re-queue tasks where now >= nextRetryAt
                    ▼
6. Emit 'task:retrying' event
```

### 7.4 Database Schema

```sql
-- Swarm Executions
CREATE TABLE swarm_executions (
  id SERIAL PRIMARY KEY,
  swarm_uuid UUID UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  strategy VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planning',
  config JSONB NOT NULL,
  objective JSONB NOT NULL,
  progress JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  metrics JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Swarm Agents
CREATE TABLE swarm_agents (
  id SERIAL PRIMARY KEY,
  agent_uuid UUID UNIQUE NOT NULL,
  swarm_id INTEGER NOT NULL REFERENCES swarm_executions(id),
  agent_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'initializing',
  capabilities JSONB NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  workload DECIMAL(3,2) DEFAULT 0,
  health DECIMAL(3,2) DEFAULT 1.0,
  error_history JSONB DEFAULT '[]',
  task_history JSONB DEFAULT '[]',
  last_heartbeat TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Swarm Tasks
CREATE TABLE swarm_tasks (
  id SERIAL PRIMARY KEY,
  task_uuid UUID UNIQUE NOT NULL,
  swarm_id INTEGER NOT NULL REFERENCES swarm_executions(id),
  assigned_agent_id INTEGER REFERENCES swarm_agents(id),
  task_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  status VARCHAR(50) NOT NULL DEFAULT 'created',
  requirements JSONB NOT NULL,
  constraints JSONB NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  ghl_operation_type VARCHAR(50),
  client_id VARCHAR(255),
  batch_id VARCHAR(255),
  attempts INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Browser Sessions
CREATE TABLE swarm_browser_sessions (
  id SERIAL PRIMARY KEY,
  session_uuid UUID UNIQUE NOT NULL,
  agent_id INTEGER NOT NULL REFERENCES swarm_agents(id),
  client_affinity VARCHAR(255),
  active_task_count INTEGER DEFAULT 0,
  max_concurrent_tasks INTEGER DEFAULT 5,
  health DECIMAL(3,2) DEFAULT 1.0,
  last_used TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Task Batches
CREATE TABLE swarm_task_batches (
  id SERIAL PRIMARY KEY,
  batch_uuid UUID UNIQUE NOT NULL,
  swarm_id INTEGER NOT NULL REFERENCES swarm_executions(id),
  client_id VARCHAR(255) NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  task_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  consolidated_output JSONB DEFAULT '{}',
  total_execution_time INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Health Issues
CREATE TABLE swarm_health_issues (
  id SERIAL PRIMARY KEY,
  swarm_id INTEGER NOT NULL REFERENCES swarm_executions(id),
  issue_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  affected_components JSONB DEFAULT '[]',
  recommended_action TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Swarm Metrics History
CREATE TABLE swarm_metrics_history (
  id SERIAL PRIMARY KEY,
  swarm_id INTEGER NOT NULL REFERENCES swarm_executions(id),
  throughput INTEGER,
  latency INTEGER,
  efficiency DECIMAL(3,2),
  reliability DECIMAL(3,2),
  average_quality DECIMAL(3,2),
  agent_utilization DECIMAL(3,2),
  task_completion_rate DECIMAL(3,2),
  error_rate DECIMAL(3,2),
  resource_utilization JSONB DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_swarm_executions_user_status ON swarm_executions(user_id, status);
CREATE INDEX idx_swarm_agents_swarm ON swarm_agents(swarm_id);
CREATE INDEX idx_swarm_agents_status ON swarm_agents(status);
CREATE INDEX idx_swarm_tasks_swarm_status ON swarm_tasks(swarm_id, status);
CREATE INDEX idx_swarm_tasks_priority ON swarm_tasks(priority, created_at);
CREATE INDEX idx_swarm_tasks_ghl ON swarm_tasks(ghl_operation_type, client_id);
CREATE INDEX idx_swarm_tasks_batch ON swarm_tasks(batch_id);
CREATE INDEX idx_browser_sessions_agent ON swarm_browser_sessions(agent_id);
CREATE INDEX idx_browser_sessions_client ON swarm_browser_sessions(client_affinity);
CREATE INDEX idx_task_batches_status ON swarm_task_batches(status);
CREATE INDEX idx_health_issues_swarm ON swarm_health_issues(swarm_id, resolved);
CREATE INDEX idx_metrics_history_swarm ON swarm_metrics_history(swarm_id, recorded_at);
```

### 7.5 API Endpoints

| Endpoint | Method | Input | Response | Description |
|----------|--------|-------|----------|-------------|
| `swarm.initialize` | mutation | - | `{ success, message }` | Initialize coordinator |
| `swarm.create` | mutation | CreateSwarmInput | `{ success, swarmId, message }` | Create new swarm |
| `swarm.start` | mutation | `{ swarmId }` | `{ success, message }` | Start swarm execution |
| `swarm.stop` | mutation | `{ swarmId, reason? }` | `{ success, message }` | Stop swarm |
| `swarm.getStatus` | query | `{ swarmId }` | SwarmStatus | Get swarm details |
| `swarm.listActive` | query | - | `{ swarms: SwarmSummary[] }` | List active swarms |
| `swarm.getHealth` | query | - | SwarmHealth | Get health status |
| `swarm.getMetrics` | query | - | SwarmMetrics | Get performance metrics |
| `swarm.getAgentTypes` | query | - | AgentTypeInfo[] | List agent types |
| `swarm.getQueueStatus` | query | - | QueueStatus | Get queue metrics |
| `swarm.executeQuick` | mutation | CreateSwarmInput | `{ success, swarmId }` | Create + start |
| `swarm.shutdown` | mutation | - | `{ success, message }` | Shutdown coordinator |

### 7.6 Event Schema

```typescript
type SwarmEventType =
  | 'coordinator:initialized'
  | 'coordinator:shutdown'
  | 'swarm:created'
  | 'swarm:started'
  | 'swarm:completed'
  | 'swarm:stopped'
  | 'agent:spawned'
  | 'agent:terminated'
  | 'task:queued'
  | 'task:batched'
  | 'task:assigned'
  | 'task:completed'
  | 'task:failed'
  | 'task:retry_scheduled'
  | 'task:retrying'
  | 'batch:processed'
  | 'batch:result_consolidated'
  | 'session:registered'
  | 'session:released'
  | 'session:cleaned'
  | 'health:warning';

interface SwarmEvent {
  type: SwarmEventType;
  timestamp: Date;
  swarmId?: string;
  agentId?: string;
  taskId?: string;
  batchId?: string;
  sessionId?: string;
  data: Record<string, any>;
}
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| SSE Manager | `server/_core/sse-manager.ts` | Real-time event streaming |
| Browserbase SDK | `server/_core/browserbaseSDK.ts` | Browser session creation |
| Agent Orchestrator | `server/services/agentOrchestrator.service.ts` | Task execution |
| Subscription Service | `server/services/subscription.service.ts` | Usage limits |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @trpc/server | ^11.x | API framework |
| zod | ^3.x | Schema validation |
| drizzle-orm | ^0.30.x | Database ORM |
| events | Node built-in | Event emitter |
| ioredis | ^5.x | Caching and pub/sub (optional) |

### 8.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | Swarm data persistence | Yes |
| Redis | Distributed coordination (optional) | No |
| Browserbase | Browser session infrastructure | Yes (for GHL) |

### 8.4 Environment Variables

```bash
# Required
DATABASE_URL=                      # PostgreSQL connection

# Browser Automation
BROWSERBASE_API_KEY=               # Browserbase authentication
BROWSERBASE_PROJECT_ID=            # Browserbase project

# Optional Configuration
SWARM_MAX_AGENTS=50                # Max agents per swarm
SWARM_MAX_TASKS=500                # Max tasks per swarm
SWARM_HEALTH_CHECK_INTERVAL=60000  # Health check ms
SWARM_METRICS_INTERVAL=10000       # Metrics collection ms
SWARM_RETRY_MAX_ATTEMPTS=3         # Max retry attempts
SWARM_RETRY_BASE_DELAY=1000        # Base retry delay ms
SWARM_BATCH_WINDOW=2000            # Batch collection window ms
SWARM_SESSION_AFFINITY_TIMEOUT=300000 # Session affinity ms
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Cross-swarm coordination | Complexity, requires distributed consensus | v2.0 |
| Geographic distribution | Requires multi-region infrastructure | v2.0 |
| Custom agent type creation | Focus on core types first | v1.5 |
| Agent marketplace | Separate feature scope | v3.0 |
| Real-time agent chat | Different interaction model | v2.0 |
| Swarm templates/presets | UX feature for later | v1.5 |
| Cost estimation | Requires usage analytics | v1.5 |
| External swarm federation | Enterprise feature | v3.0 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Single coordinator | One coordinator per instance | Scale instances horizontally |
| In-memory state | State lost on restart | Persist to database |
| Synchronous health checks | May slow under high load | Async with batching |
| Agent type limit | 50 types currently defined | Add types as needed |
| Task size limit | 10MB per task input | Split large payloads |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Coordinator overload | Medium | High | Horizontal scaling, request queuing |
| Agent starvation | Medium | Medium | Fair scheduling, priority decay |
| Session exhaustion | Medium | Medium | Session pooling, affinity cleanup |
| Memory leaks | Low | High | Background cleanup, TTL on data |
| Retry storms | Low | High | Exponential backoff, circuit breaker |
| Event loss | Low | Medium | Event persistence, replay |

### 10.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Configuration drift | Medium | Medium | Configuration validation, defaults |
| Metric gaps | Low | Medium | Redundant collection, alerts |
| Health check failures | Low | Medium | Fallback health estimation |
| Queue buildup | Medium | Medium | Queue limits, backpressure |
| Agent spawn failures | Low | High | Retry with fallback types |

### 10.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Underutilization | Medium | Medium | Auto-scaling, user education |
| Cost overruns | Medium | Medium | Resource limits, monitoring |
| Complexity adoption | High | Medium | Templates, examples, docs |
| Performance regression | Low | High | Benchmarking, load testing |

### 10.4 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unauthorized swarm access | Low | High | User-scoped authentication |
| Agent impersonation | Low | Critical | Agent identity verification |
| Task injection | Low | High | Input validation, sandboxing |
| Resource exhaustion | Medium | Medium | Rate limiting, quotas |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Coordinator (Weeks 1-4)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | SwarmCoordinator service with lifecycle management | Week 1-2 |
| M1.2 | Objective decomposition for all strategies | Week 2-3 |
| M1.3 | Agent type registry with 40+ types | Week 3 |
| M1.4 | tRPC router with core endpoints | Week 4 |

**Exit Criteria:**
- [ ] Swarms can be created, started, and stopped
- [ ] Objectives decompose into appropriate tasks
- [ ] Agents spawn based on strategy requirements
- [ ] Health checks run on schedule

### 11.2 Phase 2: Task Distribution (Weeks 5-8)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | Priority queue with GHL urgency | Week 5 |
| M2.2 | Capability-based agent matching | Week 6 |
| M2.3 | Distribution strategies (4 types) | Week 7 |
| M2.4 | Task assignment and tracking | Week 8 |

**Exit Criteria:**
- [ ] Tasks queue in priority order
- [ ] Agents matched by capability
- [ ] All distribution strategies functional
- [ ] Assignment events emitted

### 11.3 Phase 3: Session & Batching (Weeks 9-12)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Browser session management | Week 9 |
| M3.2 | Client session affinity | Week 10 |
| M3.3 | Task batching with window | Week 11 |
| M3.4 | Result consolidation | Week 12 |

**Exit Criteria:**
- [ ] Sessions tracked per agent
- [ ] Affinity routing works
- [ ] Batching groups similar tasks
- [ ] Batch results consolidated

### 11.4 Phase 4: Fault Tolerance (Weeks 13-16)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Retry logic with exponential backoff | Week 13 |
| M4.2 | Failure handling and recovery | Week 14 |
| M4.3 | Health monitoring and alerting | Week 15 |
| M4.4 | Issue detection and reporting | Week 16 |

**Exit Criteria:**
- [ ] Failed tasks retry automatically
- [ ] Session health degrades on failures
- [ ] Health issues detected and reported
- [ ] Alerts trigger on critical issues

### 11.5 Phase 5: Metrics & Optimization (Weeks 17-20)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M5.1 | Metrics collection system | Week 17 |
| M5.2 | Progress tracking | Week 18 |
| M5.3 | Performance optimization | Week 19 |
| M5.4 | Documentation and testing | Week 20 |

**Exit Criteria:**
- [ ] Metrics collected every 10 seconds
- [ ] Progress updates every 5 seconds
- [ ] Performance targets met
- [ ] Test coverage >= 80%

---

## 12. Acceptance Criteria

### 12.1 Core Functionality Acceptance

#### AC-001: Swarm Lifecycle
- [ ] Coordinator initializes with configuration
- [ ] Swarms created with unique IDs
- [ ] Swarms start and spawn agents
- [ ] Swarms stop with graceful cleanup
- [ ] Shutdown terminates all active swarms

#### AC-002: Objective Decomposition
- [ ] Research strategy creates 3 sequential tasks
- [ ] Development strategy creates 4 sequential tasks
- [ ] Analysis strategy creates 3 sequential tasks
- [ ] Auto strategy creates 3 adaptive tasks
- [ ] Task dependencies are established

#### AC-003: Agent Management
- [ ] 40+ agent types registered
- [ ] Agents spawn with correct capabilities
- [ ] Agent status tracked (idle, busy, error, offline)
- [ ] Agent health monitored (0-1 score)
- [ ] Agent metrics collected

### 12.2 Task Distribution Acceptance

#### AC-004: Priority Queuing
- [ ] Five priority levels supported
- [ ] GHL urgency (1-5) affects queue order
- [ ] Critical tasks processed before lower priority
- [ ] FIFO maintained within same priority
- [ ] Queue status reported accurately

#### AC-005: Agent Selection
- [ ] Capability matching filters agents
- [ ] Distribution strategies score agents correctly
- [ ] Session-aware strategy prefers existing sessions
- [ ] Fallback to available agent if no exact match
- [ ] Assignment events emitted

#### AC-006: Session Affinity
- [ ] Client-to-session mapping tracked
- [ ] Tasks routed to agents with client sessions
- [ ] Affinity expires after 5 minutes
- [ ] Unhealthy sessions excluded from affinity
- [ ] Sessions released on task completion

### 12.3 Fault Tolerance Acceptance

#### AC-007: Retry Logic
- [ ] Failed tasks retry up to 3 times
- [ ] Exponential backoff applied (1s, 2s, 4s...)
- [ ] Retry queue processed every second
- [ ] Permanent failure after max retries
- [ ] Retry events emitted

#### AC-008: Session Health
- [ ] Session health tracked (0-1)
- [ ] Health degrades on task failures
- [ ] Unhealthy sessions cleaned up
- [ ] Session concurrency limits enforced

### 12.4 Monitoring Acceptance

#### AC-009: Health Checks
- [ ] Health checks run every 60 seconds
- [ ] Agent health categorized correctly
- [ ] Task status counts accurate
- [ ] Issues detected and categorized
- [ ] Warnings emitted for issues

#### AC-010: Metrics Collection
- [ ] Metrics collected every 10 seconds
- [ ] Per-swarm metrics tracked
- [ ] Global metrics aggregated
- [ ] Progress updated every 5 seconds
- [ ] Completion estimated

### 12.5 Quality Acceptance

- [ ] API response time P95 < 500ms
- [ ] Swarm creation < 5 seconds
- [ ] Agent spawn < 3 seconds
- [ ] Task completion rate >= 95%
- [ ] Test coverage >= 80%
- [ ] No critical security vulnerabilities

---

## Appendix A: GHL Operation Types

| Operation | Urgency | Duration (ms) | Session Required | Batchable |
|-----------|---------|---------------|------------------|-----------|
| conversation_send | 1 | 5000 | Yes | No |
| workflow_trigger | 1 | 3000 | Yes | No |
| calendar_booking | 1 | 8000 | Yes | No |
| contact_create | 2 | 4000 | Yes | Yes |
| opportunity_create | 2 | 5000 | Yes | Yes |
| pipeline_update | 2 | 3000 | Yes | No |
| contact_update | 3 | 3000 | Yes | Yes |
| opportunity_update | 3 | 4000 | Yes | Yes |
| task_create | 3 | 2000 | Yes | Yes |
| note_create | 3 | 2000 | Yes | Yes |
| custom_field_update | 3 | 2500 | Yes | Yes |
| campaign_add | 4 | 3000 | Yes | Yes |
| campaign_remove | 4 | 3000 | Yes | Yes |
| tag_add | 4 | 1500 | Yes | Yes |
| tag_remove | 4 | 1500 | Yes | Yes |
| conversation_read | 4 | 2000 | Yes | No |
| contact_delete | 5 | 3000 | Yes | Yes |
| bulk_operation | 5 | 30000 | Yes | No |
| report_generate | 5 | 15000 | Yes | No |
| data_export | 5 | 20000 | Yes | No |
| integration_sync | 5 | 10000 | No | No |

---

## Appendix B: Agent Type Reference

| Type | Category | Code Gen | Review | Testing | Docs | Research | Analysis |
|------|----------|----------|--------|---------|------|----------|----------|
| coordinator | specialized | No | Yes | No | Yes | No | Yes |
| researcher | business | No | No | No | Yes | Yes | Yes |
| coder | development | Yes | Yes | Yes | Yes | No | Yes |
| analyst | data | No | Yes | No | Yes | No | Yes |
| architect | architecture | No | Yes | No | Yes | Yes | Yes |
| tester | testing | No | Yes | Yes | Yes | No | Yes |
| reviewer | testing | No | Yes | No | Yes | No | Yes |
| optimizer | specialized | Yes | Yes | Yes | Yes | No | Yes |
| documenter | business | No | No | No | Yes | Yes | Yes |
| monitor | devops | No | No | No | Yes | No | Yes |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Swarm** | A collection of agents working on a shared objective |
| **Agent** | A specialized AI worker with defined capabilities |
| **Objective** | The high-level goal a swarm works to accomplish |
| **Task** | A discrete unit of work assigned to an agent |
| **Strategy** | The approach for decomposing objectives (research, development, etc.) |
| **Priority** | Task importance level (critical, high, normal, low, background) |
| **Urgency** | GHL-specific operation priority (1-5 scale) |
| **Capability** | A skill or ability an agent possesses |
| **Session Affinity** | Preference to route tasks to agents with existing client sessions |
| **Batch** | A group of similar tasks processed together |
| **Distribution Strategy** | Algorithm for selecting agents for tasks |
| **Health Score** | Numeric measure (0-1) of agent or session health |
| **Workload** | Current utilization level of an agent (0-1) |
| **Retry Backoff** | Exponentially increasing delay between retry attempts |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, DevOps, QA
