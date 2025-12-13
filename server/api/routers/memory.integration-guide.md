# Memory Router Integration Guide

Quick start guide for integrating the Memory Management API into your GHL Agency AI workflows.

## Quick Start (5 minutes)

### 1. Basic Memory Storage

```typescript
import { trpc } from '@/utils/trpc';

// Store agent context
const storeMemory = trpc.memory.create.useMutation();

storeMemory.mutate({
  sessionId: 'user-session-123',
  key: 'last_action',
  value: {
    action: 'created_campaign',
    timestamp: new Date(),
    details: { campaignId: 'camp-456' }
  },
  metadata: {
    type: 'context',
    domain: 'campaign_management'
  },
  ttl: 3600  // Expire in 1 hour
});
```

### 2. Retrieve Memory

```typescript
// Get specific memory
const { data: memory } = trpc.memory.getByKey.useQuery({
  sessionId: 'user-session-123',
  key: 'last_action'
});

// Get all session memories
const { data: allMemories } = trpc.memory.getBySession.useQuery({
  sessionId: 'user-session-123',
  limit: 10
});
```

### 3. Search with Filters

```typescript
// Search by domain and type
const { data: results } = trpc.memory.search.useQuery({
  agentId: 'agent-001',
  domain: 'campaign_management',
  type: 'context',
  limit: 20
});
```

## Common Use Cases

### Use Case 1: Agent Session Persistence

Store and retrieve agent state across sessions:

```typescript
// Store agent state when session ends
const saveState = async (sessionId: string, agentState: any) => {
  await trpc.memory.storeContext.mutate({
    sessionId,
    context: agentState,
    metadata: {
      savedAt: new Date().toISOString()
    }
  });
};

// Restore agent state when session resumes
const restoreState = async (sessionId: string) => {
  const { context } = await trpc.memory.getContext.query({ sessionId });
  return context;
};
```

### Use Case 2: Learning from Past Actions (RAG Pattern)

Store successful patterns and retrieve similar ones:

```typescript
// After successful action, store the pattern
const savePattern = async (description: string, solution: any) => {
  await trpc.memory.storeReasoning.mutate({
    pattern: description,
    result: solution,
    confidence: 0.9,
    domain: 'api_integration',
    tags: ['successful', 'production']
  });
};

// When facing similar problem, find relevant solutions
const findSolution = async (problem: string) => {
  const { patterns } = await trpc.memory.searchReasoning.query({
    pattern: problem,
    domain: 'api_integration',
    minConfidence: 0.7,
    limit: 3
  });

  return patterns.map(p => ({
    solution: p.data.result,
    similarity: p.similarity,
    successRate: p.data.successRate
  }));
};
```

### Use Case 3: Multi-Agent Coordination

Share context between agents:

```typescript
// Agent A stores discovery
await trpc.memory.create.mutate({
  sessionId: 'swarm-task-789',
  key: 'discovered_api_endpoint',
  value: { url: '/api/v2/leads', method: 'POST' },
  agentId: 'agent-a',
  metadata: {
    type: 'knowledge',
    sharedWith: ['agent-b', 'agent-c']
  }
});

// Agent B retrieves shared knowledge
const { entries } = await trpc.memory.search.query({
  sessionId: 'swarm-task-789',
  type: 'knowledge'
});
```

### Use Case 4: User Preference Management

Track user preferences and behavior:

```typescript
// Store user preferences
await trpc.memory.create.mutate({
  sessionId: `user-${userId}`,
  key: 'preferences',
  value: {
    theme: 'dark',
    notifications: true,
    autoSave: true
  },
  userId,
  metadata: {
    type: 'state',
    category: 'preferences'
  }
});

// Update preferences
await trpc.memory.update.mutate({
  sessionId: `user-${userId}`,
  key: 'preferences',
  value: {
    theme: 'light',
    notifications: true,
    autoSave: true
  }
});
```

### Use Case 5: Conversation History

Maintain conversation context:

```typescript
// Store conversation turn
await trpc.memory.create.mutate({
  sessionId: `conversation-${conversationId}`,
  key: `turn-${turnNumber}`,
  value: {
    user: userMessage,
    assistant: assistantResponse,
    timestamp: new Date()
  },
  metadata: {
    type: 'context',
    domain: 'conversation',
    turnNumber
  },
  ttl: 86400  // Keep for 24 hours
});

// Retrieve conversation history
const { entries } = await trpc.memory.getBySession.query({
  sessionId: `conversation-${conversationId}`,
  limit: 10  // Last 10 turns
});
```

## Integration Patterns

### Pattern 1: Auto-Cleanup Hook

Set up automatic memory cleanup:

```typescript
// In your app initialization or cron job
import { trpc } from '@/utils/trpc';

const setupMemoryCleanup = () => {
  // Run cleanup every hour
  setInterval(async () => {
    const result = await trpc.memory.cleanup.mutate({
      cleanupExpired: true,
      cleanupLowPerformance: true,
      minSuccessRate: 0.5,
      minUsageCount: 10
    });

    console.log(`Cleaned up ${result.expiredCleaned} expired entries`);
  }, 3600000);  // 1 hour
};
```

### Pattern 2: Memory Analytics Dashboard

Display memory statistics:

```typescript
const MemoryDashboard = () => {
  const { data: stats } = trpc.memory.getStats.useQuery();
  const { data: breakdown } = trpc.memory.getUsageBreakdown.useQuery();
  const { data: health } = trpc.memory.health.useQuery();

  return (
    <div>
      <h2>Memory System Health</h2>
      <p>Status: {health?.healthy ? '✅ Healthy' : '❌ Unhealthy'}</p>
      <p>Total Entries: {stats?.stats.totalEntries}</p>
      <p>Cache Hit Rate: {((stats?.stats.hitRate || 0) * 100).toFixed(1)}%</p>

      <h3>Memory by Type</h3>
      <ul>
        {Object.entries(breakdown?.breakdown || {}).map(([type, count]) => (
          <li key={type}>{type}: {count}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Pattern 3: Reasoning Pattern Recommender

Suggest solutions based on past successes:

```typescript
const ReasoningAssistant = ({ problem }: { problem: string }) => {
  const { data: patterns } = trpc.memory.searchReasoning.useQuery({
    pattern: problem,
    limit: 5
  });

  const updateUsage = trpc.memory.updateReasoningUsage.useMutation();

  const applySolution = async (patternId: string, wasSuccessful: boolean) => {
    await updateUsage.mutateAsync({
      patternId,
      success: wasSuccessful
    });
  };

  return (
    <div>
      <h3>Similar Solutions Found</h3>
      {patterns?.patterns.map((p) => (
        <div key={p.id}>
          <p>Pattern: {p.data.pattern}</p>
          <p>Success Rate: {(p.data.successRate * 100).toFixed(0)}%</p>
          <p>Similarity: {(p.similarity * 100).toFixed(0)}%</p>
          <pre>{JSON.stringify(p.data.result, null, 2)}</pre>
          <button onClick={() => applySolution(p.id, true)}>
            This helped ✅
          </button>
          <button onClick={() => applySolution(p.id, false)}>
            Didn't help ❌
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Server-side Integration

### In Agent Services

```typescript
import { getMemorySystem } from '@/server/services/memory';

class MyAgentService {
  private memory = getMemorySystem();

  async executeTask(sessionId: string, task: any) {
    // Retrieve relevant context
    const context = await this.memory.retrieveContext(sessionId);

    // Find similar past solutions
    const similar = await this.memory.findSimilarReasoning(
      task.description,
      { domain: 'task_execution', limit: 3 }
    );

    // Execute task with context
    const result = await this.doWork(task, context, similar);

    // Store result as reasoning pattern
    if (result.success) {
      await this.memory.storeReasoning(
        task.description,
        result.solution,
        { confidence: result.confidence, domain: 'task_execution' }
      );
    }

    return result;
  }
}
```

### In API Routes

```typescript
import { getMemorySystem } from '@/server/services/memory';

export async function POST(req: Request) {
  const memory = getMemorySystem();
  const { sessionId, action } = await req.json();

  // Store action in memory
  await memory.storeContext(sessionId, {
    lastAction: action,
    timestamp: new Date()
  }, {
    metadata: { type: 'context', domain: 'api_actions' }
  });

  return Response.json({ success: true });
}
```

## Performance Tips

1. **Use TTL for temporary data**: Always set expiration for session-specific data
2. **Batch retrievals**: Use `getBySession` instead of multiple `getByKey` calls
3. **Filter early**: Use search filters to reduce result set size
4. **Monitor cache hit rate**: Check `memory.getStats()` regularly
5. **Run cleanup regularly**: Schedule `memory.cleanup()` during low-traffic periods
6. **Use consolidation**: Run `memory.consolidate()` weekly to merge duplicates

## Error Handling

```typescript
const saveMemory = async (data: any) => {
  try {
    await trpc.memory.create.mutate({
      sessionId: 'session-123',
      key: 'data',
      value: data
    });
  } catch (error) {
    if (error.data?.code === 'INTERNAL_SERVER_ERROR') {
      console.error('Failed to save memory:', error.message);
      // Implement retry logic or fallback
    }
  }
};
```

## Migration from Other Systems

### From localStorage

```typescript
// Migrate localStorage to memory system
const migrateLocalStorage = async (userId: number) => {
  const sessionId = `user-${userId}`;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);

      await trpc.memory.create.mutate({
        sessionId,
        key,
        value: JSON.parse(value || '{}'),
        userId,
        metadata: { type: 'state', migratedFrom: 'localStorage' }
      });
    }
  }
};
```

### From Redis/Cache

```typescript
// Migrate Redis keys to memory system
const migrateRedisKeys = async (agentId: string) => {
  const redisKeys = await redis.keys(`agent:${agentId}:*`);

  for (const key of redisKeys) {
    const value = await redis.get(key);
    const ttl = await redis.ttl(key);

    await trpc.memory.create.mutate({
      sessionId: `agent-${agentId}`,
      key: key.replace(`agent:${agentId}:`, ''),
      value: JSON.parse(value),
      agentId,
      ttl: ttl > 0 ? ttl : undefined,
      metadata: { type: 'context', migratedFrom: 'redis' }
    });
  }
};
```

## Troubleshooting

### Memory not persisting
- Check database connection in `server/db.ts`
- Verify tables exist (run migrations)
- Check TTL settings

### Slow searches
- Add indexes on frequently queried fields
- Use specific filters (sessionId, agentId)
- Limit result size

### High memory usage
- Run `memory.cleanup()` more frequently
- Lower TTL values
- Reduce cache size in service configuration

## Next Steps

1. Review [MEMORY_API.md](./MEMORY_API.md) for complete API reference
2. Check [MEMORY_ROUTER_IMPLEMENTATION.md](/root/github-repos/active/ghl-agency-ai/MEMORY_ROUTER_IMPLEMENTATION.md) for technical details
3. Explore existing memory service tests in `server/services/memory/memory.test.ts`
4. Start with simple use cases and expand as needed
