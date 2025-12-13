# ExecutionViewer Integration Guide

This guide shows how to integrate the ExecutionViewer component into your application with SSE events.

## Quick Start Integration

### Step 1: Import Required Dependencies

```tsx
import { ExecutionViewer } from '@/components/agent';
import { useAgentSSE } from '@/hooks/useAgentSSE';
import { useAgentStore } from '@/stores/agentStore';
import { useState, useEffect } from 'react';
```

### Step 2: Create Your Component

```tsx
export function AgentExecutionPage() {
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [execution, setExecution] = useState(null);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  // Get logs from the global agent store (automatically updated by SSE)
  const { logs, status } = useAgentStore();

  // Connect to SSE stream
  const { isConnected, connect, disconnect } = useAgentSSE({
    autoConnect: false,
    sessionId: executionId || undefined,
  });

  return (
    <div className="container mx-auto p-6">
      <ExecutionViewer
        execution={execution}
        thinkingSteps={thinkingSteps}
        showFilters={true}
        autoScroll={true}
        maxHeight="600px"
      />
    </div>
  );
}
```

### Step 3: Connect to Backend API

```tsx
const startExecution = async (task: string) => {
  try {
    // Call your backend API to start execution
    const response = await fetch('/api/agent/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });

    const data = await response.json();

    // Update state with execution data
    setExecutionId(data.executionId);
    setExecution(data.execution);

    // Connect to SSE stream for real-time updates
    connect(data.executionId);
  } catch (error) {
    console.error('Failed to start execution:', error);
  }
};
```

## Complete Working Example

```tsx
import React, { useState } from 'react';
import { ExecutionViewer } from '@/components/agent';
import { useAgentSSE } from '@/hooks/useAgentSSE';
import { useAgentStore } from '@/stores/agentStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgentExecution, ThinkingStep } from '@/types/agent';

export function AgentWorkspace() {
  const [taskInput, setTaskInput] = useState('');
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);

  const { logs, status, clearLogs } = useAgentStore();

  const { isConnected, connect, disconnect } = useAgentSSE({
    autoConnect: false,
    sessionId: executionId || undefined,
  });

  const startExecution = async () => {
    if (!taskInput.trim()) {
      alert('Please enter a task');
      return;
    }

    // Clear previous logs
    clearLogs();

    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskInput,
          options: {
            model: 'claude-opus-4.5',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start execution');
      }

      const data = await response.json();

      setExecutionId(data.executionId);
      setExecution(data.execution);

      // Connect to SSE for real-time updates
      connect(data.executionId);
    } catch (error) {
      console.error('Error starting execution:', error);
      alert('Failed to start execution');
    }
  };

  const stopExecution = async () => {
    if (!executionId) return;

    try {
      await fetch(`/api/agent/execute/${executionId}/cancel`, {
        method: 'POST',
      });

      disconnect();
      setExecutionId(null);
    } catch (error) {
      console.error('Error stopping execution:', error);
    }
  };

  const isExecuting = status === 'executing' || status === 'planning';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Agent Workspace</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Enter your task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={isExecuting}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isExecuting) {
                startExecution();
              }
            }}
          />

          {!isExecuting ? (
            <Button onClick={startExecution} disabled={!taskInput.trim()}>
              Start Task
            </Button>
          ) : (
            <Button onClick={stopExecution} variant="destructive">
              Stop
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div>Status: {status}</div>
          {execution?.metadata?.tokensUsed && (
            <div>Tokens: {execution.metadata.tokensUsed.toLocaleString()}</div>
          )}
        </div>
      </div>

      <ExecutionViewer
        execution={execution || undefined}
        thinkingSteps={thinkingSteps}
        showFilters={true}
        autoScroll={true}
        maxHeight="calc(100vh - 300px)"
      />
    </div>
  );
}
```

## Server-Side Setup

### SSE Endpoint Example (Express/Node.js)

```typescript
// /api/agent/stream/:sessionId
app.get('/api/agent/stream/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    timestamp: new Date().toISOString(),
  })}\n\n`);

  // Subscribe to execution updates
  const subscription = subscribeToExecution(sessionId, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Clean up on disconnect
  req.on('close', () => {
    subscription.unsubscribe();
    res.end();
  });
});
```

### SSE Event Types

The SSE stream should emit events with these types:

```typescript
// Connection established
{
  type: 'connected',
  timestamp: string,
}

// Status update
{
  type: 'status',
  data: { status: 'planning' | 'executing' | 'completed' | 'error' },
  timestamp: string,
}

// Task started
{
  type: 'task_started',
  data: { task: string },
  timestamp: string,
}

// Task completed
{
  type: 'task_completed',
  message: string,
  timestamp: string,
}

// Task failed
{
  type: 'task_failed',
  message: string,
  timestamp: string,
}

// Execution step
{
  type: 'step',
  data: { action: string, detail?: string },
  timestamp: string,
}

// Tool call
{
  type: 'tool_call',
  data: { tool: string, args?: any },
  timestamp: string,
}

// Tool result
{
  type: 'tool_result',
  data: { result: any },
  timestamp: string,
}

// Agent thinking
{
  type: 'thought',
  data: { thought: string },
  timestamp: string,
}

// Error
{
  type: 'error',
  message: string,
  timestamp: string,
}
```

## State Management with Zustand

The component reads logs from `agentStore`, which is automatically updated by the `useAgentSSE` hook:

```typescript
// agentStore.ts
import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'system';
  message: string;
  detail?: string;
}

interface AgentState {
  status: AgentStatus;
  currentTask: string | null;
  logs: LogEntry[];

  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  setStatus: (status: AgentStatus) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  status: 'idle',
  currentTask: null,
  logs: [],

  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, log].slice(-100), // Keep last 100
    })),

  clearLogs: () => set({ logs: [] }),

  setStatus: (status) => set({ status }),
}));
```

## Customization

### Custom Styling

```tsx
<ExecutionViewer
  className="border-2 border-purple-500 shadow-2xl rounded-xl"
  maxHeight="800px"
/>
```

### Disable Filters

```tsx
<ExecutionViewer
  showFilters={false}
  autoScroll={false}
/>
```

### Custom Height Based on Viewport

```tsx
<ExecutionViewer
  maxHeight="calc(100vh - 200px)"
/>
```

## Advanced Patterns

### Multiple Executions

```tsx
const [executions, setExecutions] = useState<Record<string, AgentExecution>>({});
const [activeId, setActiveId] = useState<string | null>(null);

return (
  <div>
    <Tabs value={activeId} onValueChange={setActiveId}>
      {Object.keys(executions).map((id) => (
        <TabsContent key={id} value={id}>
          <ExecutionViewer execution={executions[id]} />
        </TabsContent>
      ))}
    </Tabs>
  </div>
);
```

### With Execution History

```tsx
function ExecutionHistory() {
  const [executions, setExecutions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // Load execution history
    fetch('/api/agent/executions')
      .then(res => res.json())
      .then(setExecutions);
  }, []);

  const selectedExecution = executions.find(e => e.id === selectedId);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1">
        <h3>History</h3>
        <div className="space-y-2">
          {executions.map(exec => (
            <button
              key={exec.id}
              onClick={() => setSelectedId(exec.id)}
              className={selectedId === exec.id ? 'bg-blue-100' : ''}
            >
              {exec.task}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-2">
        {selectedExecution && (
          <ExecutionViewer
            execution={selectedExecution}
            showFilters={true}
          />
        )}
      </div>
    </div>
  );
}
```

### With Polling Fallback

If SSE is not available, you can poll for updates:

```tsx
useEffect(() => {
  if (!executionId || isConnected) return;

  const interval = setInterval(async () => {
    const response = await fetch(`/api/agent/execute/${executionId}`);
    const data = await response.json();
    setExecution(data.execution);
    setThinkingSteps(data.thinkingSteps);
  }, 2000);

  return () => clearInterval(interval);
}, [executionId, isConnected]);
```

## Troubleshooting

### SSE Connection Issues

```tsx
const { error, isConnected, connect } = useAgentSSE({
  autoConnect: true,
  sessionId: executionId,
});

useEffect(() => {
  if (error) {
    console.error('SSE Error:', error);
    // Implement reconnection logic
    setTimeout(() => {
      if (executionId) {
        connect(executionId);
      }
    }, 5000);
  }
}, [error]);
```

### Memory Leaks

Always clean up connections:

```tsx
useEffect(() => {
  return () => {
    disconnect();
  };
}, []);
```

## Best Practices

1. **Clear logs between executions**: Call `clearLogs()` before starting a new execution
2. **Handle errors gracefully**: Always catch and display errors to users
3. **Implement reconnection**: Retry SSE connections on failure
4. **Limit log retention**: Keep only recent logs to prevent memory issues
5. **Use loading states**: Show loading indicators during execution
6. **Provide feedback**: Show connection status and execution progress
7. **Accessibility**: Ensure keyboard navigation works properly
8. **Test thoroughly**: Test with different execution states and edge cases

## Next Steps

- Explore the [README](./ExecutionViewer.README.md) for detailed API documentation
- Check out [examples](./ExecutionViewer.example.tsx) for more use cases
- Review the [tests](./ExecutionViewer.test.tsx) for usage patterns
