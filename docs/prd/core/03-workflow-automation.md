# PRD: Workflow Automation Engine

## Overview
The Workflow Automation Engine is the visual orchestration layer of Bottleneck-Bots, enabling users to create, configure, and execute multi-step browser automation workflows without writing code. It provides a drag-and-drop interface built with ReactFlow for designing complex automation sequences with conditional logic, loops, and multiple trigger mechanisms.

## Problem Statement
While AI agents can execute individual browser tasks, users need a way to:
- Chain multiple actions into coherent workflows
- Add conditional logic based on runtime data
- Schedule automations to run at specific times
- Trigger workflows from external systems via webhooks
- Reuse and share automation patterns across projects
- Monitor and debug complex multi-step processes

## Goals & Objectives

### Primary Goals
- Enable visual workflow creation with drag-and-drop interface
- Support all common automation patterns (sequences, conditions, loops)
- Provide multiple trigger mechanisms (manual, scheduled, webhook, event)
- Allow dynamic variable substitution throughout workflows
- Ensure workflows are reliable, resumable, and observable

### Success Metrics
- Workflow creation time: 5 minutes for simple, 30 minutes for complex
- Workflow execution success rate: >95%
- User adoption: 80% of users create at least one workflow
- Workflow reuse rate: 40% of workflows are cloned/templated
- Support ticket reduction: 50% fewer automation-related issues

## User Stories

### Non-Technical User
- As a non-technical user, I want to create automations by dragging and dropping steps so that I don't need to write code
- As a non-technical user, I want to use pre-built templates so that I can get started quickly

### Automation Developer
- As an automation developer, I want to add conditional branches based on extracted data so that my workflows can handle different scenarios
- As an automation developer, I want to loop through lists of items so that I can process multiple records in a single workflow
- As an automation developer, I want to use variables from previous steps so that I can pass data through the workflow

### Operations Manager
- As an operations manager, I want to schedule workflows to run at specific times so that I can automate recurring tasks
- As an operations manager, I want to trigger workflows from external systems so that I can integrate with our existing tools
- As an operations manager, I want to monitor workflow execution in real-time so that I can identify and resolve issues quickly

## Functional Requirements

### Must Have (P0)

1. **Visual Workflow Builder**
   - ReactFlow-based canvas for workflow design
   - Drag-and-drop step placement
   - Connection lines between steps
   - Step configuration panels
   - Zoom and pan navigation
   - Undo/redo support
   - Auto-layout for complex workflows
   - Workflow validation before save

2. **Step Types**
   - **Navigate**: Go to URL with wait conditions
   - **Act**: Click, type, select, hover actions
   - **Observe**: Extract data or verify state
   - **Extract**: Pull structured data from page
   - **Wait**: Time delay or condition-based wait
   - **Condition**: If/else branching logic
   - **Loop**: Iterate over list or repeat N times
   - **API Call**: Make external HTTP requests
   - **Set Variable**: Assign values to variables
   - **Sub-workflow**: Call another workflow

3. **Trigger Types**
   - **Manual**: User-initiated execution
   - **Scheduled**: Cron-based scheduling
   - **Webhook**: HTTP endpoint trigger
   - **Event**: Internal event subscription
   - **Email**: Trigger on email receipt
   - **File**: Trigger on file upload

4. **Variable System**
   - Global workflow variables
   - Step output variables
   - Environment variables
   - Secret variables (encrypted)
   - Variable interpolation: `{{variable.path}}`
   - Built-in functions: `{{$now}}`, `{{$random}}`, `{{$env.NAME}}`

5. **Execution Engine**
   - Sequential and parallel step execution
   - Step retry with configurable policies
   - Timeout handling per step
   - Error handling and fallback paths
   - Execution state persistence
   - Resume from checkpoint on failure

### Should Have (P1)

1. **Workflow Templates**
   - Pre-built templates for common use cases
   - Template customization wizard
   - Template marketplace
   - User-created template sharing
   - Template versioning

2. **Advanced Conditions**
   - JavaScript expression evaluator
   - Regular expression matching
   - JSON path queries
   - Multiple condition operators (AND, OR, NOT)
   - Null/undefined handling

3. **Loop Controls**
   - Break and continue support
   - Parallel iteration option
   - Rate limiting for loops
   - Error tolerance (continue on N failures)
   - Progress tracking

4. **Monitoring & Debugging**
   - Real-time execution visualization
   - Step-by-step execution mode
   - Variable inspector at each step
   - Execution timeline with durations
   - Screenshot at each step option

### Nice to Have (P2)

1. **Workflow Versioning**
   - Version history with diffs
   - Rollback to previous versions
   - A/B testing between versions
   - Gradual rollout support
   - Change annotations

2. **Collaboration Features**
   - Multi-user editing (view only)
   - Comments on workflow steps
   - Sharing with permissions
   - Team workflow library
   - Change approval workflow

3. **AI-Assisted Building**
   - Natural language workflow creation
   - Step suggestion based on context
   - Automatic error handling addition
   - Optimization recommendations
   - Selector auto-repair

## Non-Functional Requirements

### Performance
- Workflow canvas load: <2 seconds
- Step execution average: <5 seconds
- Workflow save: <1 second
- Maximum workflow size: 500 steps
- Maximum loop iterations: 10,000
- Concurrent workflow executions: 100 per user

### Security
- Secret variable encryption (AES-256)
- Webhook signature verification
- Execution isolation between workflows
- Audit logging for all changes
- Role-based access control
- Rate limiting on webhook endpoints

### Scalability
- Distributed execution across workers
- Queue-based step processing
- Database sharding by tenant
- CDN for workflow assets
- Auto-scaling execution workers

### Reliability
- 99.9% scheduler uptime
- Exactly-once execution guarantee
- Checkpoint/resume for long workflows
- Dead letter queue for failed steps
- Automatic retry with exponential backoff

## Technical Requirements

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ReactFlow     │────▶│  Workflow API    │────▶│  PostgreSQL     │
│   (Builder UI)  │◀────│  (CRUD + Valid)  │◀────│  (Definitions)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Trigger Service │
                        │  (Cron/Webhook)  │
                        └──────────────────┘
                               │
                               ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   BullMQ        │────▶│  Execution       │────▶│  Browser        │
│   (Job Queue)   │◀────│  Workers         │◀────│  Automation     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│   Redis         │     │   Execution      │
│   (State)       │     │   Logs (PG)      │
└─────────────────┘     └──────────────────┘
```

### Dependencies
- **Frontend**
  - ReactFlow (workflow canvas)
  - Zustand (state management)
  - React Query (API caching)
  - Radix UI (components)

- **Backend**
  - BullMQ (job queue)
  - node-cron (scheduler)
  - vm2 (sandboxed JavaScript)
  - JSONPath-plus (data extraction)

- **Storage**
  - PostgreSQL (workflow definitions, execution logs)
  - Redis (execution state, caching)

### API Specifications

#### Create Workflow
```typescript
POST /api/workflows
Request:
{
  name: string;
  description?: string;
  trigger: {
    type: 'manual' | 'scheduled' | 'webhook' | 'event';
    config: TriggerConfig;
  };
  steps: WorkflowStep[];
  variables: VariableDefinition[];
  settings: {
    timeout: number;
    retryPolicy: RetryPolicy;
    notifications: NotificationConfig;
  };
}
Response:
{
  id: string;
  name: string;
  webhookUrl?: string;
  createdAt: string;
  version: number;
}
```

#### Workflow Step Schema
```typescript
interface WorkflowStep {
  id: string;
  type: 'navigate' | 'act' | 'observe' | 'extract' | 'wait' | 'condition' | 'loop' | 'api' | 'setVariable' | 'subWorkflow';
  name: string;
  config: StepConfig;
  position: { x: number; y: number };
  connections: {
    next?: string;
    onSuccess?: string;
    onFailure?: string;
    branches?: { condition: string; targetId: string }[];
  };
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
  timeout?: number;
  outputVariable?: string;
}
```

#### Execute Workflow
```typescript
POST /api/workflows/{id}/execute
Request:
{
  variables?: Record<string, any>;
  options?: {
    dryRun: boolean;
    startFromStep?: string;
    debugMode: boolean;
  };
}
Response:
{
  executionId: string;
  status: 'queued' | 'running';
  startedAt: string;
  streamUrl: string; // SSE endpoint for real-time updates
}
```

#### Get Execution Status
```typescript
GET /api/executions/{executionId}
Response:
{
  id: string;
  workflowId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  variables: Record<string, any>;
  steps: StepExecutionResult[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: ExecutionError;
}
```

#### Webhook Trigger Endpoint
```typescript
POST /api/webhooks/{workflowId}/{webhookToken}
Headers:
  X-Webhook-Signature: sha256=...
Request:
  // Any JSON payload - available as {{trigger.payload}}
Response:
{
  executionId: string;
  message: 'Workflow triggered successfully';
}
```

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Workflow Creation Time (simple) | <5 min | User session tracking |
| Workflow Creation Time (complex) | <30 min | User session tracking |
| Execution Success Rate | >95% | Completed / Total executions |
| User Adoption Rate | 80% | Users with 1+ workflow / Total users |
| Template Usage Rate | 50% | Templates used / Total workflows |
| Average Workflow Steps | 8-15 | Workflow analysis |
| Webhook Response Time | <500ms | API latency monitoring |
| Scheduler Accuracy | 99.9% | Scheduled vs actual execution time |

## Dependencies

### Internal Dependencies
- Browser Automation System (for step execution)
- AI Agent Orchestration (for intelligent steps)
- Email Integration (for email triggers)
- Notification system (for alerts)

### External Dependencies
- None (self-contained with internal services)

### Blocking Dependencies
- Browser Automation System must be functional
- Authentication system for workflow ownership

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex workflows overwhelming users | Medium | Medium | Progressive disclosure, templates, guided creation wizard |
| Infinite loop in user workflows | High | Medium | Iteration limits, execution timeouts, resource quotas |
| Variable injection vulnerabilities | Critical | Low | Sandboxed execution, input sanitization, CSP |
| Webhook abuse/DDoS | High | Medium | Rate limiting, signature verification, IP allowlisting |
| Scheduler drift at scale | Medium | Low | Distributed scheduling, clock synchronization, monitoring |
| State corruption on worker crash | High | Low | Checkpoint persistence, idempotent operations, recovery |
| Long-running workflow timeouts | Medium | Medium | Configurable timeouts, checkpoint/resume, notifications |

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Builder Foundation | 4 weeks | ReactFlow canvas, basic step types, save/load |
| Phase 2: Step Types | 3 weeks | All P0 step types, variable system |
| Phase 3: Triggers | 3 weeks | Manual, scheduled, webhook, event triggers |
| Phase 4: Execution Engine | 4 weeks | Queue-based execution, state management, retry logic |
| Phase 5: Monitoring | 2 weeks | Real-time visualization, logs, debugging tools |
| Phase 6: Templates | 2 weeks | Template system, pre-built templates |
| Phase 7: Testing | 2 weeks | Integration testing, load testing, UX testing |

## Open Questions
1. Should workflows support parallel step execution within the same path?
2. What is the maximum allowed webhook payload size?
3. How do we handle workflow execution during system maintenance?
4. Should we allow custom JavaScript in condition expressions?
5. How do we version workflow definitions for backwards compatibility?
