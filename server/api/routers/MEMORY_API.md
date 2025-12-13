# Memory Management tRPC API

This document describes the Memory Management API endpoints available through the tRPC router.

## Overview

The Memory Router provides comprehensive CRUD operations for agent memory management, including:
- Memory entry creation, retrieval, update, and deletion
- Session context management
- Reasoning pattern storage and retrieval (RAG-like patterns)
- Memory consolidation and cleanup
- Statistics and analytics

## Endpoints

### Memory Entry CRUD Operations

#### `memory.create`
Create a new memory entry for an agent or session.

**Input:**
```typescript
{
  sessionId: string;           // Required: Session identifier
  key: string;                 // Required: Memory key
  value: any;                  // Required: Memory value
  agentId?: string;           // Optional: Agent identifier
  userId?: number;            // Optional: User identifier
  metadata?: {                // Optional: Additional metadata
    type?: 'context' | 'reasoning' | 'knowledge' | 'state';
    domain?: string;
    namespace?: string;
    confidence?: number;      // 0-1
    tags?: string[];
    createdBy?: string;
  };
  ttl?: number;               // Optional: Time to live in seconds
  embedding?: number[];       // Optional: Vector embedding
}
```

**Response:**
```typescript
{
  success: boolean;
  entryId: string;
  message: string;
}
```

#### `memory.getBySession`
Retrieve all memory entries for a session.

**Input:**
```typescript
{
  sessionId: string;
  limit?: number;
  offset?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  entries: MemoryEntry[];
  total: number;
}
```

#### `memory.getByKey`
Retrieve a specific memory entry by key.

**Input:**
```typescript
{
  sessionId: string;
  key: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  value: any;
}
```

#### `memory.search`
Search memory entries with filters.

**Input:**
```typescript
{
  sessionId?: string;
  agentId?: string;
  userId?: number;
  namespace?: string;
  domain?: string;
  tags?: string[];
  type?: string;
  limit?: number;
  offset?: number;
  minConfidence?: number;     // 0-1
  includeExpired?: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  entries: MemoryEntry[];
  total: number;
}
```

#### `memory.update`
Update an existing memory entry.

**Input:**
```typescript
{
  sessionId: string;
  key: string;
  value: any;
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### `memory.delete`
Delete memory entry or all entries for a session.

**Input:**
```typescript
{
  sessionId: string;
  key?: string;  // If omitted, deletes all entries for session
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### Session Context Management

#### `memory.storeContext`
Store complete session context.

**Input:**
```typescript
{
  sessionId: string;
  context: Record<string, any>;
  agentId?: string;
  userId?: number;
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### `memory.getContext`
Retrieve session context.

**Input:**
```typescript
{
  sessionId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  context: SessionContext | null;
}
```

#### `memory.updateContext`
Update session context (merges with existing).

**Input:**
```typescript
{
  sessionId: string;
  context: Record<string, any>;
  agentId?: string;
  userId?: number;
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### Reasoning Patterns (RAG-like)

#### `memory.storeReasoning`
Store a reasoning pattern for future retrieval.

**Input:**
```typescript
{
  pattern: string;             // The reasoning pattern or approach
  result: any;                 // The result or outcome
  context?: Record<string, any>;
  confidence?: number;         // 0-1
  domain?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  patternId: string;
  message: string;
}
```

#### `memory.searchReasoning`
Search for similar reasoning patterns (RAG-like retrieval).

**Input:**
```typescript
{
  pattern: string;             // Query pattern
  domain?: string;
  minConfidence?: number;      // 0-1
  limit?: number;
  tags?: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  patterns: SearchResult<ReasoningPattern>[];
  total: number;
}
```

**SearchResult structure:**
```typescript
{
  id: string;
  data: ReasoningPattern;
  similarity: number;          // Similarity score
  metadata?: Record<string, any>;
}
```

#### `memory.updateReasoningUsage`
Update reasoning pattern usage statistics.

**Input:**
```typescript
{
  patternId: string;
  success: boolean;            // Whether the pattern was successful
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### `memory.getTopReasoning`
Get top performing reasoning patterns.

**Input:**
```typescript
{
  limit?: number;              // Default: 10
}
```

**Response:**
```typescript
{
  success: boolean;
  patterns: ReasoningPattern[];
}
```

### Memory Consolidation & Maintenance

#### `memory.consolidate`
Consolidate similar memory entries (merge duplicates).

**Input:**
```typescript
{
  sessionId?: string;
  agentId?: string;
  threshold?: number;          // Similarity threshold (0-1)
}
```

**Response:**
```typescript
{
  success: boolean;
  consolidatedCount: number;
  message: string;
}
```

#### `memory.cleanup`
Clean up expired and low-performing memory.

**Input:**
```typescript
{
  cleanupExpired?: boolean;           // Default: true
  cleanupLowPerformance?: boolean;    // Default: true
  minSuccessRate?: number;            // Default: 0.3
  minUsageCount?: number;             // Default: 5
}
```

**Response:**
```typescript
{
  success: boolean;
  expiredCleaned: number;
  lowPerformanceCleaned: number;
  message: string;
}
```

#### `memory.clearCaches`
Clear all in-memory caches.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### Statistics & Analytics

#### `memory.getStats`
Get memory system statistics.

**Input:**
```typescript
{
  sessionId?: string;
  domain?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  stats: {
    totalEntries: number;
    totalReasoningPatterns: number;
    avgConfidence: number;
    hitRate?: number;                // Cache hit rate
    storageSize?: number;
    domains?: string[];
  };
}
```

#### `memory.getUsageBreakdown`
Get memory usage breakdown by type.

**Input:**
```typescript
{
  sessionId?: string;
  agentId?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  breakdown: Record<string, number>;  // Type -> count mapping
  total: number;
}
```

#### `memory.health`
Health check for memory system.

**Response:**
```typescript
{
  success: boolean;
  healthy: boolean;
  stats: {
    totalEntries: number;
    totalReasoningPatterns: number;
    avgConfidence: number;
    hitRate?: number;
  };
  error?: string;
}
```

## Usage Examples

### TypeScript/React (tRPC Client)

```typescript
import { trpc } from '@/utils/trpc';

// Create a memory entry
const { mutate: createMemory } = trpc.memory.create.useMutation();
createMemory({
  sessionId: 'session-123',
  key: 'user_preference',
  value: { theme: 'dark', language: 'en' },
  metadata: {
    type: 'context',
    domain: 'ui',
  },
});

// Search for reasoning patterns
const { data: patterns } = trpc.memory.searchReasoning.useQuery({
  pattern: 'How to handle rate limiting in API calls',
  domain: 'api_integration',
  limit: 5,
});

// Get memory stats
const { data: stats } = trpc.memory.getStats.useQuery({
  sessionId: 'session-123',
});

// Clean up old memories
const { mutate: cleanup } = trpc.memory.cleanup.useMutation();
cleanup({
  cleanupExpired: true,
  cleanupLowPerformance: true,
  minSuccessRate: 0.5,
});
```

### Server-side (Direct Service Access)

```typescript
import { getMemorySystem } from '@/server/services/memory';

const memorySystem = getMemorySystem();

// Store context
await memorySystem.storeContext('session-123', {
  currentPage: '/dashboard',
  userPreferences: { theme: 'dark' },
}, {
  agentId: 'agent-001',
  userId: 42,
});

// Find similar reasoning
const similar = await memorySystem.findSimilarReasoning(
  'How to implement authentication',
  { domain: 'security', limit: 3 }
);

// Get statistics
const stats = await memorySystem.getStats('session-123');
```

## Data Models

### MemoryEntry
```typescript
interface MemoryEntry {
  id: string;
  sessionId: string;
  agentId?: string;
  userId?: number;
  key: string;
  value: any;
  embedding?: number[];
  metadata: {
    type?: 'context' | 'reasoning' | 'knowledge' | 'state';
    domain?: string;
    namespace?: string;
    confidence?: number;
    tags?: string[];
    createdBy?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
```

### ReasoningPattern
```typescript
interface ReasoningPattern {
  id: string;
  pattern: string;
  result: any;
  context?: Record<string, any>;
  confidence: number;
  usageCount: number;
  successRate: number;
  domain?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}
```

### SessionContext
```typescript
interface SessionContext {
  sessionId: string;
  userId?: number;
  agentId?: string;
  context: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Best Practices

1. **Use TTL for Temporary Data**: Set `ttl` on memory entries that don't need to persist long-term.
2. **Tag Your Entries**: Use tags for easier filtering and retrieval.
3. **Clean Up Regularly**: Run `memory.cleanup` periodically to maintain performance.
4. **Use Domains**: Group related memories by domain for better organization.
5. **Monitor Performance**: Check `memory.getStats` to understand memory usage patterns.
6. **Consolidate Duplicates**: Run `memory.consolidate` to merge similar entries.
7. **Track Reasoning Success**: Always call `updateReasoningUsage` after using a pattern.

## Error Handling

All endpoints return proper tRPC errors with appropriate error codes:
- `NOT_FOUND`: When a requested memory entry doesn't exist
- `INTERNAL_SERVER_ERROR`: For database or system errors

Example error handling:
```typescript
try {
  const value = await trpc.memory.getByKey.query({
    sessionId: 'session-123',
    key: 'nonexistent',
  });
} catch (error) {
  if (error.data?.code === 'NOT_FOUND') {
    console.log('Memory entry not found');
  }
}
```
