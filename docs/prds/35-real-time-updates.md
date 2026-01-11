# PRD-035: Real-Time Updates

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/_core/sse-manager.ts`, `server/_core/agent-sse-events.ts`

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

The Real-Time Updates feature provides comprehensive live streaming capabilities for the Bottleneck-Bots platform. It combines Server-Sent Events (SSE) for unidirectional agent task streaming with WebSocket support for bidirectional live collaboration. This system enables users to monitor agent execution progress, view live browser sessions, receive real-time metrics, and collaborate on automation workflows in real-time.

### 1.1 Feature Summary

- **SSE for Agent Task Streaming**: Unidirectional server-to-client event streaming for agent execution updates, progress tracking, and completion notifications
- **WebSocket for Live Collaboration**: Bidirectional real-time communication for interactive debugging, session control, and collaborative editing
- **Execution Progress Updates**: Granular step-by-step progress with time estimates, current action visibility, and reasoning transparency
- **Real-Time Metrics**: Live performance metrics including execution duration, token usage, step counts, and confidence scores
- **Browser Session Live View**: Real-time browser session streaming with debug URLs, session replays, and interactive debugging capabilities
- **Multi-User Event Broadcasting**: Support for multiple users viewing the same execution with synchronized event delivery

### 1.2 Target Users

- **Agency Operators**: Monitor multiple agent executions in real-time across client workflows
- **Automation Engineers**: Debug and optimize browser automation tasks with live feedback
- **QA Teams**: Verify agent behavior through real-time observation and logging
- **Development Teams**: Build integrations consuming real-time event streams
- **Business Users**: Track task progress without technical knowledge

### 1.3 Current Implementation Status

The SSE infrastructure is partially implemented with the following components:
- `server/_core/sse-manager.ts`: Core SSE connection management and event dispatching
- `server/_core/agent-sse-events.ts`: Agent-specific event emitters and helper functions
- `server/services/agentProgressTracker.service.ts`: Progress tracking with SSE integration

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Lack of Execution Visibility**: Users submit tasks and wait blindly for completion, unable to see what agents are doing or why tasks are taking time
2. **Debugging Difficulty**: When automations fail, users cannot observe the failure context in real-time, making root cause analysis time-consuming
3. **Polling Overhead**: Without real-time updates, clients must poll repeatedly for status changes, creating server load and increased latency
4. **Collaboration Gaps**: Multiple team members cannot observe the same execution simultaneously, limiting collaborative debugging
5. **Progress Uncertainty**: Users cannot estimate completion times or understand the current phase of multi-step workflows
6. **Browser Session Opacity**: Live browser sessions exist but users cannot easily access debug views or understand session state

### 2.2 User Pain Points

- "I submitted a task 5 minutes ago and have no idea if it's stuck or making progress"
- "When an automation fails at step 47, I can't see what happened leading up to the failure"
- "My team needs to debug together but we can't watch the same execution"
- "I want to see exactly what the AI agent is thinking while it works on my task"
- "There's no way to know if I should wait or cancel a long-running task"
- "I need real-time alerts when critical automations fail, not email notifications minutes later"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| No real-time visibility | 35% of users abandon tasks that appear "stuck" |
| Polling overhead | 40% unnecessary API calls consuming server resources |
| Delayed failure detection | Average 8-minute delay in identifying failed automations |
| No collaborative debugging | 2x longer resolution time for complex issues |
| User anxiety about progress | 25% lower task completion rate |
| Missed critical failures | $X,XXX average cost per undetected automation failure |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Provide real-time execution visibility with < 100ms latency | P0 |
| **G2** | Eliminate polling by delivering push-based updates | P0 |
| **G3** | Enable live browser session debugging | P0 |
| **G4** | Support multi-user execution observation | P1 |
| **G5** | Deliver real-time metrics and performance data | P1 |
| **G6** | Enable bidirectional WebSocket communication for interactive features | P1 |
| **G7** | Provide structured reasoning visibility during agent execution | P2 |

### 3.2 Success Metrics (KPIs)

#### Real-Time Delivery Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| SSE Event Delivery Latency | < 100ms (P95) | Server-side timestamp to client receipt |
| WebSocket Message Latency | < 50ms (P95) | Round-trip time measurement |
| Connection Establishment Time | < 500ms | Time from request to first message |
| Event Delivery Rate | 100% | Events sent vs. events received |

#### Connection Reliability Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| SSE Connection Stability | > 99.5% uptime | Connection drops / total connection time |
| WebSocket Connection Stability | > 99.9% uptime | Same as above |
| Auto-Reconnection Success | > 99% | Successful reconnects / reconnection attempts |
| Client Reconnection Time | < 2 seconds | Time from disconnect to reconnected |

#### Scalability Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Concurrent SSE Connections | 10,000+ | Load testing |
| Concurrent WebSocket Connections | 50,000+ | Load testing |
| Events per Second Throughput | 100,000+ | Sustained event rate |
| Memory per Connection | < 10KB | Memory profiling |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Real-Time Adoption Rate | > 70% | Users using live view features |
| Task Abandonment Reduction | 50% decrease | Before/after comparison |
| Debugging Time Reduction | 40% decrease | Issue resolution metrics |
| User Satisfaction (Real-Time Features) | > 4.5/5 | Feature-specific surveys |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: Agent Execution Progress Streaming
**As an** agency operator
**I want to** see real-time progress updates during agent task execution
**So that** I know exactly what step the agent is on and how long until completion

**Acceptance Criteria:**
- Progress events stream within 100ms of server-side changes
- Current step, total steps, and percentage complete are visible
- Elapsed time and estimated time remaining are displayed
- Current action description updates in real-time
- Connection auto-reconnects if dropped

#### US-002: Agent Thinking Transparency
**As a** power user debugging an automation
**I want to** see the agent's reasoning process in real-time
**So that** I can understand why the agent makes specific decisions

**Acceptance Criteria:**
- Thinking events stream as agent processes each step
- Structured reasoning includes hypothesis, evidence, and confidence
- Decision alternatives are visible when available
- Reasoning events are timestamped for debugging
- Iteration number is tracked for multi-step reasoning

#### US-003: Browser Session Live View
**As a** QA engineer
**I want to** watch the browser session in real-time while the agent works
**So that** I can verify automation accuracy and identify issues immediately

**Acceptance Criteria:**
- Live view URL is available within 3 seconds of session creation
- Debug URL provides developer tools access
- Video stream has < 1 second latency
- Session can be viewed in a separate browser tab
- Multiple users can view the same session simultaneously

#### US-004: Execution Completion Notifications
**As a** user running multiple automations
**I want to** receive immediate notification when executions complete or fail
**So that** I can quickly move to the next task or address failures

**Acceptance Criteria:**
- Completion events include success/failure status
- Result summary is included in the event
- Duration and token usage are reported
- Error details are provided for failures
- Events are delivered even if the browser tab is in background

#### US-005: Tool Execution Visibility
**As a** developer integrating with the platform
**I want to** see each tool invocation and its result in real-time
**So that** I can debug tool-related issues and optimize workflows

**Acceptance Criteria:**
- Tool start events include tool name and parameters
- Tool complete events include result and duration
- Tool events are correlated to the parent phase
- Failed tool executions include error details
- Tool event history is available after completion

### 4.2 Advanced User Stories

#### US-006: Multi-Execution Dashboard
**As an** agency manager
**I want to** monitor multiple agent executions simultaneously in real-time
**So that** I can oversee all running automations from a single view

**Acceptance Criteria:**
- Dashboard shows all active executions with live status
- Each execution streams progress independently
- Executions can be expanded for detailed view
- Critical errors bubble up to top-level notifications
- Performance metrics aggregate across executions

#### US-007: Collaborative Execution Viewing
**As a** team member debugging with colleagues
**I want to** share my execution view with team members in real-time
**So that** we can troubleshoot issues together

**Acceptance Criteria:**
- Multiple users can subscribe to the same execution
- All viewers see synchronized event streams
- Viewer count is visible to all participants
- No additional latency for multi-user viewing
- Users can join/leave without affecting others

#### US-008: Real-Time Metrics Streaming
**As a** platform administrator
**I want to** see real-time system metrics and agent performance
**So that** I can monitor system health and identify bottlenecks

**Acceptance Criteria:**
- Token usage streams in real-time during execution
- Step timing metrics are available as events
- Confidence scores update as agent progresses
- System load metrics are available for monitoring
- Metrics can be aggregated and visualized

#### US-009: Interactive Agent Control via WebSocket
**As an** advanced user
**I want to** send commands to running agents via WebSocket
**So that** I can intervene or provide input during execution

**Acceptance Criteria:**
- WebSocket connection supports bidirectional messaging
- Commands are acknowledged within 100ms
- Agent can request user input via WebSocket
- User responses are processed immediately
- Command history is logged for debugging

#### US-010: Plan and Phase Streaming
**As a** workflow designer
**I want to** see the execution plan and phase transitions in real-time
**So that** I can understand workflow structure and optimize phase design

**Acceptance Criteria:**
- Plan created event shows goal and all phases
- Phase start events indicate current phase with name and index
- Phase complete events mark transitions
- Phase duration is tracked and reported
- Phase hierarchy supports nested phases

---

## 5. Functional Requirements

### 5.1 SSE Connection Management

#### FR-001: Connection Lifecycle
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Establish SSE connection per execution ID | P0 |
| FR-001.2 | Support user-scoped connections (userId + executionId) | P0 |
| FR-001.3 | Implement heartbeat mechanism (every 30 seconds) | P0 |
| FR-001.4 | Auto-cleanup connections on client disconnect | P0 |
| FR-001.5 | Track active connection count per execution | P1 |
| FR-001.6 | Support graceful connection termination | P0 |

#### FR-002: Session-Based Connections
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Establish SSE connection per browser session ID | P0 |
| FR-002.2 | Support session progress updates (navigation, actions) | P0 |
| FR-002.3 | Deliver live view URLs via SSE events | P0 |
| FR-002.4 | Clean up session connections on session end | P0 |

### 5.2 Agent SSE Event Types

#### FR-003: Execution Lifecycle Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Emit `execution:started` with task and timestamp | P0 |
| FR-003.2 | Emit `execution:complete` with result, duration, tokens | P0 |
| FR-003.3 | Emit `execution:error` with error message and stack | P0 |
| FR-003.4 | Include executionId in all events | P0 |

#### FR-004: Planning Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Emit `plan:created` with goal and phase list | P0 |
| FR-004.2 | Include estimated duration when available | P1 |
| FR-004.3 | Include planId for correlation | P1 |

#### FR-005: Phase Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Emit `phase:start` with phaseId, name, and index | P0 |
| FR-005.2 | Emit `phase:complete` with phaseId and name | P0 |
| FR-005.3 | Include timestamp in all phase events | P0 |

#### FR-006: Progress Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Emit `progress` with currentStep/totalSteps/percentage | P0 |
| FR-006.2 | Include elapsedTime and estimatedTimeRemaining | P0 |
| FR-006.3 | Include currentAction description | P0 |
| FR-006.4 | Emit progress at each meaningful step transition | P0 |

#### FR-007: Thinking and Reasoning Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Emit `thinking` with thought content and iteration | P1 |
| FR-007.2 | Emit `reasoning` with structured decision data | P1 |
| FR-007.3 | Include evidence, hypothesis, decision, alternatives | P1 |
| FR-007.4 | Include confidence score (0-1) | P1 |

#### FR-008: Tool Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Emit `tool:start` with toolName and params | P0 |
| FR-008.2 | Emit `tool:complete` with toolName, result, duration | P0 |
| FR-008.3 | Support all agent tool types | P0 |

#### FR-009: Browser Session Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Emit `browser:session` with sessionId and debugUrl | P0 |
| FR-009.2 | Include live view URL when available | P0 |
| FR-009.3 | Emit on session creation | P0 |

### 5.3 Session Progress Events

#### FR-010: Browser Automation Progress
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Emit `session_created` on session initialization | P0 |
| FR-010.2 | Emit `live_view_ready` with URLs when available | P0 |
| FR-010.3 | Emit `navigation` events on page changes | P0 |
| FR-010.4 | Emit `action_start` and `action_complete` for browser actions | P0 |
| FR-010.5 | Emit `error` events with context on failures | P0 |
| FR-010.6 | Emit `complete` on session/task completion | P0 |

### 5.4 Event Broadcasting

#### FR-011: Single User Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Send events to specific user's connections | P0 |
| FR-011.2 | Support multiple connections per user per execution | P0 |
| FR-011.3 | Handle connection errors gracefully | P0 |

#### FR-012: Multi-User Broadcasting
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Broadcast events to all users watching an execution | P1 |
| FR-012.2 | Track total viewer count across users | P1 |
| FR-012.3 | Maintain event ordering for all viewers | P1 |

### 5.5 WebSocket Support

#### FR-013: WebSocket Connection
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Establish authenticated WebSocket connections | P1 |
| FR-013.2 | Support JWT-based authentication via query param | P1 |
| FR-013.3 | Implement ping/pong heartbeat mechanism | P1 |
| FR-013.4 | Auto-reconnect with exponential backoff | P1 |
| FR-013.5 | Graceful disconnect handling | P1 |

#### FR-014: WebSocket Channels
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Support channel subscription (session:{id}, agent:{id}) | P1 |
| FR-014.2 | Support channel unsubscription | P1 |
| FR-014.3 | Enforce user permissions per channel | P1 |
| FR-014.4 | Support presence channels for viewer tracking | P2 |

#### FR-015: Bidirectional Messaging
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Send messages from client to server | P1 |
| FR-015.2 | Receive messages from server to client | P1 |
| FR-015.3 | Support message acknowledgment | P1 |
| FR-015.4 | Maintain message ordering per channel | P1 |

### 5.6 Client SDK

#### FR-016: JavaScript/TypeScript SDK
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Provide EventSource wrapper for SSE connections | P0 |
| FR-016.2 | Implement auto-reconnection logic | P0 |
| FR-016.3 | Provide typed event handlers | P0 |
| FR-016.4 | Support event filtering and buffering | P1 |
| FR-016.5 | Provide WebSocket client with channel support | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | SSE event delivery latency (P95) | < 100ms | P0 |
| NFR-002 | WebSocket message latency (P95) | < 50ms | P1 |
| NFR-003 | Connection establishment time | < 500ms | P0 |
| NFR-004 | Events per second per execution | 100+ | P0 |
| NFR-005 | Memory per SSE connection | < 10KB | P0 |
| NFR-006 | Memory per WebSocket connection | < 20KB | P1 |
| NFR-007 | Heartbeat interval | 30 seconds | P0 |
| NFR-008 | Event serialization time | < 5ms | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-009 | Concurrent SSE connections | 10,000+ per node | P0 |
| NFR-010 | Concurrent WebSocket connections | 50,000+ per node | P1 |
| NFR-011 | Horizontal scaling support | Auto-scale with load | P1 |
| NFR-012 | Event throughput | 100,000 events/second | P1 |
| NFR-013 | Connection distribution | Load-balanced across nodes | P1 |
| NFR-014 | Cross-node event delivery | < 50ms additional latency | P2 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-015 | SSE connection uptime | > 99.5% | P0 |
| NFR-016 | WebSocket connection uptime | > 99.9% | P1 |
| NFR-017 | Event delivery guarantee | At-least-once | P0 |
| NFR-018 | Auto-reconnection success rate | > 99% | P0 |
| NFR-019 | Reconnection time | < 2 seconds | P0 |
| NFR-020 | Graceful degradation | Fallback to polling | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-021 | All SSE endpoints require authentication | P0 |
| NFR-022 | User can only access own execution events | P0 |
| NFR-023 | WebSocket authentication via JWT | P1 |
| NFR-024 | Rate limiting on connection attempts | P0 |
| NFR-025 | TLS 1.3 for all connections | P0 |
| NFR-026 | Event data sanitization | P0 |
| NFR-027 | Audit logging for connection events | P1 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-028 | Log all connection lifecycle events | P0 |
| NFR-029 | Track event delivery metrics | P0 |
| NFR-030 | Monitor connection counts in real-time | P0 |
| NFR-031 | Alert on high connection failure rates | P1 |
| NFR-032 | Trace event propagation latency | P1 |
| NFR-033 | Dashboard for real-time connection metrics | P2 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Applications                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐    │
│  │  Web Dashboard   │  │  Mobile App      │  │  External Integrations  │    │
│  │  (React/Next.js) │  │  (React Native)  │  │  (API Consumers)        │    │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────┬────────────┘    │
└───────────│─────────────────────│──────────────────────────│────────────────┘
            │ SSE/WebSocket       │ SSE/WebSocket            │ SSE/WebSocket
            ▼                     ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Real-Time Gateway Layer                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     Connection Router (Express)                        │   │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────┐    │   │
│  │  │  SSE Endpoint      │  │  WebSocket Server  │  │  Auth Guard  │    │   │
│  │  │  /api/events/*     │  │  wss://*/ws        │  │              │    │   │
│  │  └─────────┬──────────┘  └─────────┬──────────┘  └──────────────┘    │   │
│  └────────────│───────────────────────│─────────────────────────────────┘   │
│               ▼                       ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Connection Manager                                │   │
│  │  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────┐   │   │
│  │  │ SSE Manager      │  │ WebSocket Manager │  │ Connection Pool  │   │   │
│  │  │ (sse-manager.ts) │  │ (ws-manager.ts)   │  │                  │   │   │
│  │  └─────────┬────────┘  └─────────┬─────────┘  └──────────────────┘   │   │
│  └────────────│─────────────────────│───────────────────────────────────┘   │
│               ▼                     ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Event Distribution Layer                          │   │
│  │  ┌──────────────────┐  ┌────────────────┐  ┌────────────────────┐    │   │
│  │  │ Session Events   │  │ Agent Events   │  │ Broadcast Events   │    │   │
│  │  │ (Progress, Live  │  │ (Execution,    │  │ (Multi-user sync)  │    │   │
│  │  │  View, Actions)  │  │  Tools, Plan)  │  │                    │    │   │
│  │  └──────────────────┘  └────────────────┘  └────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Event Source Layer                                   │
│  ┌────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐    │
│  │  Agent Orchestrator │  │  Progress Tracker   │  │  Browser Sessions  │    │
│  │  Service            │  │  Service            │  │  Manager           │    │
│  └─────────┬──────────┘  └──────────┬──────────┘  └─────────┬──────────┘    │
│            │                        │                        │               │
│            ▼                        ▼                        ▼               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Event Emitter Utilities                           │   │
│  │                      (agent-sse-events.ts)                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │   │
│  │  │ emitExecution*  │  │ emitProgress    │  │ emitToolStart/End   │   │   │
│  │  │ emitPhase*      │  │ emitThinking    │  │ emitBrowserSession  │   │   │
│  │  │ emitPlanCreated │  │ emitReasoning   │  │                     │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Details

#### 7.2.1 SSE Manager (`sse-manager.ts`)

The core SSE infrastructure managing connections and event delivery.

**Key Data Structures:**
```typescript
// Session-based connections (browser automation)
const connections = new Map<string, Response[]>();

// Agent execution connections (userId -> executionId -> Response[])
const agentConnections = new Map<string, Map<number, Response[]>>();

// Event types
type AgentSSEEventType =
  | 'execution:started' | 'plan:created' | 'phase:start'
  | 'thinking' | 'progress' | 'reasoning'
  | 'tool:start' | 'tool:complete' | 'phase:complete'
  | 'execution:complete' | 'execution:error' | 'browser:session';

// Event structure
interface AgentSSEEvent {
  type: AgentSSEEventType;
  executionId: string;
  data: any;
}
```

**Core Functions:**
- `addConnection(sessionId, res)`: Register session SSE client
- `removeConnection(sessionId, res)`: Unregister session SSE client
- `sendProgress(sessionId, update)`: Send session progress event
- `addAgentConnection(userId, executionId, res)`: Register agent SSE client
- `removeAgentConnection(userId, executionId, res)`: Unregister agent SSE client
- `sendAgentEvent(userId, executionId, event)`: Send to user's connections
- `broadcastAgentEvent(executionId, event)`: Send to all viewers
- `cleanupAgentExecution(userId, executionId)`: Clean up execution connections
- `getAgentConnectionCount(executionId)`: Get viewer count

#### 7.2.2 Agent SSE Events (`agent-sse-events.ts`)

Helper utilities for emitting structured agent events.

**Emitter Functions:**
```typescript
// Execution lifecycle
emitExecutionStarted(userId, executionId, { task, startedAt })
emitExecutionComplete(userId, executionId, { result, duration, tokensUsed })
emitExecutionError(userId, executionId, { error, stack })

// Planning
emitPlanCreated(userId, executionId, { planId, plan: { goal, phases } })

// Phase tracking
emitPhaseStart(userId, executionId, { phaseId, phaseName, phaseIndex })
emitPhaseComplete(userId, executionId, { phaseId, phaseName, phaseIndex })

// Progress and thinking
emitProgress(userId, executionId, {
  currentStep, totalSteps, percentComplete,
  elapsedTime, estimatedTimeRemaining, currentAction
})
emitThinking(userId, executionId, { thought, iteration })
emitReasoning(userId, executionId, {
  step, thought, evidence, hypothesis,
  decision, alternatives, confidence
})

// Tool tracking
emitToolStart(userId, executionId, { toolName, params })
emitToolComplete(userId, executionId, { toolName, result, duration })

// Browser session
emitBrowserSession(userId, executionId, { sessionId, debugUrl })
```

**Emitter Class:**
```typescript
class AgentSSEEmitter {
  constructor(userId: number, executionId: string)

  executionStarted(data)
  planCreated(data)
  phaseStart(data)
  thinking(data)
  progress(data)
  reasoning(data)
  browserSession(data)
  toolStart(data)
  toolComplete(data)
  phaseComplete(data)
  executionComplete(data)
  executionError(data)
}
```

#### 7.2.3 Progress Tracker Service (`agentProgressTracker.service.ts`)

Tracks execution progress and emits progress events.

**Key Features:**
- Step counting and percentage calculation
- Time tracking (elapsed, estimated remaining)
- Current action description
- Automatic progress event emission on state changes

### 7.3 SSE Routes

```
GET /api/events/browser-session/:sessionId
    - Establish SSE connection for browser session
    - Requires authentication
    - Returns session progress events

GET /api/events/agent-execution/:executionId
    - Establish SSE connection for agent execution
    - Requires authentication
    - User-scoped (only own executions)
    - Returns all agent event types
```

### 7.4 Event Format

#### SSE Wire Format
```
event: execution:started
data: {"task":"Navigate to website","startedAt":"2026-01-11T10:00:00Z"}

event: progress
data: {"currentStep":3,"totalSteps":10,"percentComplete":30,"elapsedTime":15000,"estimatedTimeRemaining":35000,"currentAction":"Filling form fields"}

event: thinking
data: {"thought":"Analyzing page structure to find submit button","content":"Analyzing page structure to find submit button","iteration":1,"timestamp":"2026-01-11T10:00:15Z"}

event: tool:start
data: {"toolName":"click","params":{"selector":"#submit-btn"},"timestamp":"2026-01-11T10:00:20Z"}

event: tool:complete
data: {"toolName":"click","result":{"success":true},"duration":500,"timestamp":"2026-01-11T10:00:20.5Z"}

event: execution:complete
data: {"result":{"success":true,"output":"Form submitted successfully"},"duration":45000,"tokensUsed":1234,"timestamp":"2026-01-11T10:00:45Z"}
```

### 7.5 WebSocket Architecture (Future)

```typescript
// Connection URL
wss://api.bottleneck-bots.com/ws?token={jwt}

// Message format
interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'message' | 'ack' | 'ping' | 'pong' | 'error';
  channel?: string;
  data: any;
  id?: string;
  timestamp: Date;
}

// Channel patterns
session:{sessionId}   // Browser session updates
agent:{executionId}   // Agent execution events
user:{userId}         // User notifications
metrics               // Real-time system metrics
```

### 7.6 Client Integration

#### React Hook Example
```typescript
function useAgentExecution(executionId: string) {
  const [status, setStatus] = useState('connecting');
  const [progress, setProgress] = useState(0);
  const [thinking, setThinking] = useState('');
  const [events, setEvents] = useState<AgentEvent[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/events/agent-execution/${executionId}`,
      { withCredentials: true }
    );

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      setProgress(data.percentComplete);
    });

    eventSource.addEventListener('thinking', (e) => {
      const data = JSON.parse(e.data);
      setThinking(data.thought);
    });

    eventSource.addEventListener('execution:complete', (e) => {
      setStatus('complete');
      eventSource.close();
    });

    eventSource.addEventListener('execution:error', (e) => {
      setStatus('error');
    });

    eventSource.onerror = () => {
      // Auto-reconnect logic
      setTimeout(() => eventSource.close(), 1000);
    };

    return () => eventSource.close();
  }, [executionId]);

  return { status, progress, thinking, events };
}
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API authentication and routing |
| Express Server | `server/index.ts` | HTTP/SSE endpoint hosting |
| Agent Orchestrator | `server/services/agentOrchestrator.service.ts` | Execution lifecycle events |
| Progress Tracker | `server/services/agentProgressTracker.service.ts` | Progress calculation |
| Browser Session Manager | `server/_core/browserbaseSDK.ts` | Session lifecycle events |
| Database | `server/db/index.ts` | Connection and execution persistence |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| express | ^4.18.x | HTTP server with SSE support |
| ws (future) | ^8.x | WebSocket server implementation |
| zod | ^3.x | Event schema validation |
| uuid | ^9.x | Event ID generation |

### 8.3 Environment Variables

```bash
# SSE Configuration
SSE_HEARTBEAT_INTERVAL=30000     # Heartbeat interval in ms
SSE_MAX_CONNECTIONS=10000        # Max concurrent connections
SSE_RECONNECT_TIMEOUT=5000       # Client reconnect timeout

# WebSocket Configuration (Future)
WS_HEARTBEAT_INTERVAL=30000      # WebSocket ping interval
WS_MAX_CONNECTIONS=50000         # Max concurrent WebSocket connections
WS_AUTH_TIMEOUT=5000             # Authentication timeout
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Cross-region event delivery | Infrastructure complexity | v2.0 |
| Event persistence/replay | Storage costs | v1.5 |
| Push notifications (mobile) | Different infrastructure | v2.0 |
| GraphQL subscriptions | Current architecture uses tRPC | v2.0 |
| Event compression | Premature optimization | v1.5 |
| Custom event schemas | User complexity | v2.0 |
| Webhook delivery for events | Different feature scope | Separate PRD |
| Event analytics/aggregation | Different feature scope | Separate PRD |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Single-node connections | Connections bound to server node | Sticky sessions or future Redis Pub/Sub |
| Event ordering (multi-node) | Events may arrive out of order across nodes | Include sequence numbers |
| Browser tab throttling | Background tabs may delay SSE | Heartbeat and reconnection |
| Mobile network reliability | Frequent disconnects on mobile | Aggressive reconnection strategy |
| Large event payloads | Events > 64KB may be truncated | Paginate or reference external data |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Connection exhaustion | Medium | High | Connection pooling, max limits, graceful rejection |
| Memory pressure from connections | Medium | Medium | Per-connection memory limits, connection cleanup |
| Event delivery delays | Low | Medium | Heartbeats, connection health monitoring |
| Cross-browser SSE compatibility | Low | Medium | Feature detection, WebSocket fallback |
| Network partitions | Low | High | Reconnection logic, event buffering |

### 10.2 Scalability Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Exceeding connection limits | Medium | High | Horizontal scaling, load balancing |
| Event throughput bottleneck | Low | Medium | Event batching, priority queues |
| Database connection pressure | Medium | Medium | Connection pooling, query optimization |
| Memory exhaustion under load | Low | High | Memory limits, circuit breakers |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unauthorized event access | Low | Critical | Authentication on all endpoints, user validation |
| Event data leakage | Low | High | Data sanitization, sensitive data masking |
| DDoS via connection flood | Medium | Medium | Rate limiting, connection quotas |
| Session hijacking | Low | High | Short-lived tokens, secure cookies |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Monitoring blind spots | Medium | Medium | Comprehensive logging, connection metrics |
| Deployment disconnections | High | Low | Graceful shutdown, client reconnection |
| Configuration drift | Low | Medium | Infrastructure as code, config validation |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core SSE Infrastructure (Weeks 1-2)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | SSE connection manager with lifecycle management | Week 1 |
| M1.2 | Session-based SSE endpoints | Week 1 |
| M1.3 | Agent execution SSE endpoints | Week 2 |
| M1.4 | Heartbeat and cleanup mechanisms | Week 2 |

**Exit Criteria:**
- [ ] SSE connections establish and maintain stability
- [ ] Session progress events stream correctly
- [ ] Agent execution events reach connected clients
- [ ] Connections clean up properly on disconnect

### 11.2 Phase 2: Agent Event Integration (Weeks 3-4)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | All agent event emitters implemented | Week 3 |
| M2.2 | Progress tracking integration | Week 3 |
| M2.3 | Tool execution event streaming | Week 4 |
| M2.4 | Thinking/reasoning event streaming | Week 4 |

**Exit Criteria:**
- [ ] All 12 agent event types emit correctly
- [ ] Progress updates reflect actual execution state
- [ ] Tool events capture start/complete with timing
- [ ] Thinking events provide transparency into agent reasoning

### 11.3 Phase 3: Multi-User & Broadcasting (Weeks 5-6)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Multi-user connection support | Week 5 |
| M3.2 | Broadcast event delivery | Week 5 |
| M3.3 | Viewer count tracking | Week 6 |
| M3.4 | Connection metrics and monitoring | Week 6 |

**Exit Criteria:**
- [ ] Multiple users can view same execution
- [ ] Events synchronized across all viewers
- [ ] Viewer counts accurate and real-time
- [ ] Connection metrics visible in dashboards

### 11.4 Phase 4: Client SDK & UX (Weeks 7-8)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | React hooks for SSE consumption | Week 7 |
| M4.2 | Auto-reconnection logic | Week 7 |
| M4.3 | Progress UI components | Week 8 |
| M4.4 | Live view integration | Week 8 |

**Exit Criteria:**
- [ ] React hooks provide easy SSE consumption
- [ ] Connections recover from disconnects automatically
- [ ] Progress UI updates smoothly in real-time
- [ ] Live view accessible from execution UI

### 11.5 Phase 5: WebSocket Foundation (Weeks 9-12)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M5.1 | WebSocket server implementation | Week 9-10 |
| M5.2 | Channel subscription system | Week 10-11 |
| M5.3 | Bidirectional messaging | Week 11-12 |
| M5.4 | Interactive agent control | Week 12 |

**Exit Criteria:**
- [ ] WebSocket connections authenticate and establish
- [ ] Channel subscriptions work correctly
- [ ] Messages flow bidirectionally
- [ ] Users can interact with running agents

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: SSE Connection Establishment
- [ ] SSE connections establish within 500ms
- [ ] Connections require valid authentication
- [ ] User can only access own execution events
- [ ] Connection IDs are unique and trackable
- [ ] Heartbeats maintain connection every 30 seconds

#### AC-002: Agent Event Streaming
- [ ] All 12 agent event types stream correctly
- [ ] Events include executionId for correlation
- [ ] Events include timestamps (ISO 8601)
- [ ] Event payloads match documented schemas
- [ ] Events deliver within 100ms of emission

#### AC-003: Progress Updates
- [ ] Progress events include currentStep/totalSteps/percentage
- [ ] Elapsed time updates in real-time
- [ ] Estimated time remaining is reasonably accurate
- [ ] Current action description updates at each step
- [ ] Progress reaches 100% on completion

#### AC-004: Session Live View
- [ ] Live view URL available within 3 seconds
- [ ] Debug URL provides developer tools access
- [ ] Session events stream navigation and actions
- [ ] Session completion event includes status
- [ ] Multiple viewers see synchronized stream

#### AC-005: Connection Reliability
- [ ] Connections survive network hiccups
- [ ] Auto-reconnection occurs within 2 seconds
- [ ] Missed events during disconnect are handled gracefully
- [ ] Connection cleanup occurs on client disconnect
- [ ] Memory usage remains stable under load

#### AC-006: Multi-User Viewing
- [ ] Multiple users can subscribe to same execution
- [ ] All viewers receive identical event streams
- [ ] Viewer count is accurate and updates in real-time
- [ ] User join/leave does not affect other viewers
- [ ] No additional latency for multi-user scenarios

### 12.2 Integration Acceptance

- [ ] SSE endpoints integrate with existing authentication
- [ ] Events correlate correctly with database records
- [ ] Agent orchestrator emits events at correct lifecycle points
- [ ] Progress tracker updates emit real-time events
- [ ] Browser session manager integrates with session SSE

### 12.3 Performance Acceptance

- [ ] 10,000 concurrent SSE connections sustained
- [ ] Event delivery latency < 100ms (P95)
- [ ] Memory usage < 10KB per connection
- [ ] Connection establishment < 500ms
- [ ] No memory leaks under sustained load

### 12.4 Quality Acceptance

- [ ] Unit tests cover all event emitter functions
- [ ] Integration tests verify end-to-end event delivery
- [ ] Load tests validate scalability targets
- [ ] Security tests confirm authentication enforcement
- [ ] Documentation covers all event types and client usage

---

## Appendix A: Event Schema Reference

### A.1 Agent SSE Event Types

| Event Type | Payload Fields | Description |
|------------|----------------|-------------|
| `execution:started` | task, startedAt | Execution begins |
| `plan:created` | planId, plan (goal, phases) | Execution plan generated |
| `phase:start` | phaseId, phaseName, phaseIndex, timestamp | Phase begins |
| `progress` | currentStep, totalSteps, percentComplete, elapsedTime, estimatedTimeRemaining, currentAction, timestamp | Progress update |
| `thinking` | thought, content, iteration, timestamp | Agent thinking |
| `reasoning` | step, thought, evidence, hypothesis, decision, alternatives, confidence, timestamp | Structured reasoning |
| `tool:start` | toolName, params, timestamp | Tool invocation begins |
| `tool:complete` | toolName, result, duration, timestamp | Tool invocation ends |
| `phase:complete` | phaseId, phaseName, phaseIndex, timestamp | Phase ends |
| `browser:session` | sessionId, debugUrl, timestamp | Browser session created |
| `execution:complete` | result, duration, tokensUsed, timestamp | Execution succeeds |
| `execution:error` | error, stack, timestamp | Execution fails |

### A.2 Session Progress Event Types

| Event Type | Payload Fields | Description |
|------------|----------------|-------------|
| `session_created` | sessionId | Browser session initialized |
| `live_view_ready` | liveViewUrl, debuggerUrl, sessionUrl | Live view available |
| `navigation` | url, sessionId | Page navigation occurred |
| `action_start` | action, sessionId | Browser action starting |
| `action_complete` | action, result, sessionId | Browser action completed |
| `error` | error, sessionId | Error occurred |
| `complete` | sessionId, result | Session/task completed |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **SSE** | Server-Sent Events - unidirectional HTTP streaming from server to client |
| **WebSocket** | Full-duplex communication protocol over a single TCP connection |
| **Event Source** | Browser API for consuming SSE streams |
| **Channel** | Named topic for WebSocket message routing |
| **Heartbeat** | Periodic message to maintain connection and detect disconnects |
| **Broadcast** | Sending an event to all subscribers of a resource |
| **Execution** | A single run of an agent task |
| **Phase** | A logical grouping of steps within an execution |
| **Live View** | Real-time browser session video stream |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Design
