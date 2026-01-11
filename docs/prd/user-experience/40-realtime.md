# PRD: Real-Time Communication

## Overview
A robust real-time communication system utilizing Server-Sent Events (SSE) for delivering agent progress updates, live execution monitoring, and chat-like streaming interfaces. This system enables users to watch automations unfold in real-time, receive instant feedback on agent actions, and interact with long-running processes through streaming interfaces.

## Problem Statement
Web automation tasks can take seconds to minutes to complete, during which users have no visibility into progress. Traditional request-response patterns leave users waiting without feedback, leading to uncertainty about whether tasks are running, stuck, or failed. Users need real-time visibility into agent activities, streaming output as it's generated, and the ability to interact with running processes. This requires efficient, reliable real-time communication that works across various network conditions.

## Goals & Objectives
- **Primary Goals**
  - Stream agent activities and progress in real-time
  - Provide live execution monitoring with visual feedback
  - Enable chat-like streaming for AI responses
  - Support reliable reconnection and message recovery
  - Minimize latency for immediate feedback

- **Success Metrics**
  - Message delivery latency < 100ms
  - Connection reliability > 99.9%
  - Reconnection time < 2 seconds
  - Message loss rate < 0.01%
  - Concurrent connections support > 10,000

## User Stories
- As a user, I want to see agent progress in real-time so that I know my automation is working
- As a developer, I want streaming logs so that I can debug issues as they occur
- As a user, I want chat-like responses so that I don't wait for complete answers
- As an operator, I want to monitor multiple executions so that I can oversee system activity
- As a mobile user, I want reliable reconnection so that spotty connectivity doesn't break my session

## Functional Requirements

### Must Have (P0)
- **Server-Sent Events (SSE)**
  - Persistent HTTP connection
  - Event type differentiation
  - Last-Event-ID for reconnection
  - Keep-alive heartbeats
  - Graceful connection handling

- **Agent Progress Updates**
  - Step-by-step execution updates
  - Current action description
  - Progress percentage (when determinable)
  - Screenshot/visual updates
  - Error notifications

- **Live Execution Monitoring**
  - Real-time log streaming
  - Browser action visualization
  - Network request tracking
  - Performance metrics updates
  - Resource utilization display

- **Chat-Like Streaming**
  - Token-by-token text streaming
  - Markdown rendering on stream
  - Code block detection
  - Tool call notifications
  - Typing indicators

### Should Have (P1)
- **Connection Management**
  - Automatic reconnection with backoff
  - Message buffering during disconnection
  - Connection state indicators
  - Multi-tab coordination

- **Event Filtering**
  - Subscribe to specific event types
  - Filter by execution ID
  - Severity-based filtering
  - Custom event patterns

- **Historical Replay**
  - Replay missed events after reconnect
  - Event history retrieval
  - Time-range event queries

### Nice to Have (P2)
- WebSocket fallback for bidirectional
- GraphQL subscriptions support
- Event aggregation for high-frequency updates
- Offline event queuing
- Push notifications for mobile

## Non-Functional Requirements

### Performance
- Message latency < 100ms (p95)
- First byte < 50ms
- Heartbeat interval: 15 seconds
- Max message size: 64KB
- Connection timeout: 30 minutes

### Reliability
- Connection uptime > 99.9%
- Message delivery guarantee (at-least-once)
- Automatic reconnection
- No duplicate message delivery
- Graceful degradation

### Scalability
- 10,000+ concurrent connections per instance
- Horizontal scaling support
- Load balancer compatibility
- Geographic distribution ready

## Technical Requirements

### Architecture
```
+-------------------+     +------------------+     +------------------+
|   Clients         |     |  SSE Gateway     |     |  Event Sources   |
|   - Browser       |<----|  - Connection    |<----|  - Agent Engine  |
|   - Mobile        |     |  - Router        |     |  - Executions    |
|   - CLI           |     |  - Heartbeat     |     |  - AI Streaming  |
+-------------------+     +------------------+     +------------------+
                                  |
                                  v
                         +------------------+
                         |  Event Store     |
                         |  - Redis Pub/Sub |
                         |  - Event History |
                         +------------------+
```

### Dependencies
- **Redis**: Pub/Sub for event distribution
- **EventSource polyfill**: Cross-browser support
- **compression**: Response compression
- **express-sse**: SSE middleware
- **reconnecting-eventsource**: Client reconnection

### SSE Event Types
```typescript
// Event type definitions
interface SSEEvent {
  id: string;          // Unique event ID
  type: string;        // Event type for filtering
  data: string;        // JSON-stringified payload
  retry?: number;      // Reconnection delay hint
}

// Agent Progress Events
interface AgentProgressEvent {
  type: 'agent:progress';
  executionId: string;
  step: number;
  totalSteps?: number;
  action: string;
  status: 'running' | 'completed' | 'failed';
  screenshot?: string; // Base64 or URL
  timestamp: string;
}

// Execution Log Events
interface ExecutionLogEvent {
  type: 'execution:log';
  executionId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// AI Streaming Events
interface AIStreamEvent {
  type: 'ai:chunk';
  conversationId: string;
  content: string;      // Token or chunk of text
  isComplete: boolean;
  toolCall?: {
    name: string;
    status: 'calling' | 'completed' | 'failed';
  };
}

// System Events
interface SystemEvent {
  type: 'system:status' | 'system:heartbeat';
  status?: string;
  timestamp: string;
}
```

### Server Implementation
```typescript
// SSE Endpoint
app.get('/api/events/:executionId', async (req, res) => {
  const { executionId } = req.params;
  const lastEventId = req.headers['last-event-id'];

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Replay missed events if reconnecting
  if (lastEventId) {
    const missedEvents = await getMissedEvents(executionId, lastEventId);
    for (const event of missedEvents) {
      sendEvent(res, event);
    }
  }

  // Subscribe to new events
  const subscription = eventBus.subscribe(executionId, (event) => {
    sendEvent(res, event);
  });

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    subscription.unsubscribe();
  });
});

function sendEvent(res: Response, event: SSEEvent) {
  res.write(`id: ${event.id}\n`);
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${event.data}\n\n`);
}
```

### Client Implementation
```typescript
// React hook for SSE
function useSSE<T>(url: string, options?: SSEOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');

  useEffect(() => {
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onopen = () => setStatus('open');
    eventSource.onerror = (e) => {
      setError(new Error('Connection failed'));
      setStatus('closed');
    };

    eventSource.addEventListener('agent:progress', (e) => {
      setData(JSON.parse(e.data));
    });

    eventSource.addEventListener('execution:log', (e) => {
      options?.onLog?.(JSON.parse(e.data));
    });

    return () => eventSource.close();
  }, [url]);

  return { data, error, status };
}

// Usage
function ExecutionMonitor({ executionId }: { executionId: string }) {
  const { data, status } = useSSE<AgentProgressEvent>(
    `/api/events/${executionId}`
  );

  return (
    <div>
      <ConnectionStatus status={status} />
      {data && (
        <ProgressDisplay
          step={data.step}
          action={data.action}
          screenshot={data.screenshot}
        />
      )}
    </div>
  );
}
```

### APIs
```typescript
// SSE Endpoints
GET /api/events/:executionId
// Stream events for specific execution

GET /api/events/stream
// Stream all events for authenticated user

GET /api/events/agents/:agentId
// Stream events for specific agent

GET /api/chat/:conversationId/stream
// Stream AI chat responses

// Event History
GET /api/events/:executionId/history
{
  from?: string;  // Event ID or timestamp
  to?: string;
  types?: string[];
  limit?: number;
}

// Connection Management
POST /api/events/subscribe
{
  channels: string[];
  filters?: EventFilter[];
}

DELETE /api/events/subscribe/:subscriptionId
```

### Message Format (SSE)
```
id: evt_123abc
event: agent:progress
data: {"executionId":"exec_456","step":3,"action":"Clicking login button","status":"running","timestamp":"2024-01-15T10:30:00Z"}

id: evt_124abc
event: execution:log
data: {"executionId":"exec_456","level":"info","message":"Found login form","timestamp":"2024-01-15T10:30:01Z"}

id: evt_125abc
event: agent:progress
data: {"executionId":"exec_456","step":4,"action":"Entering credentials","status":"running","screenshot":"https://...","timestamp":"2024-01-15T10:30:02Z"}

: heartbeat

id: evt_126abc
event: agent:progress
data: {"executionId":"exec_456","step":5,"action":"Completed","status":"completed","timestamp":"2024-01-15T10:30:05Z"}
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Message latency | < 100ms | End-to-end timing |
| Connection reliability | > 99.9% | Uptime monitoring |
| Reconnection time | < 2s | Client metrics |
| Message loss | < 0.01% | Delivery confirmation |
| Concurrent connections | > 10k | Load testing |

## Dependencies
- Redis for Pub/Sub
- Load balancer with SSE support
- CDN with streaming support
- Event store for history
- Client SSE libraries

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Connection drops | Medium | Auto-reconnection, buffering |
| Message ordering | Medium | Sequence IDs, client reordering |
| Proxy buffering | High | Headers, nginx config, CDN setup |
| Scale limits | High | Horizontal scaling, connection pools |
| Memory leaks | High | Connection cleanup, monitoring |
| Browser limits | Medium | Connection multiplexing, fallbacks |
