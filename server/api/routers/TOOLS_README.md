# Tools Router Documentation

The Tools Router provides comprehensive tool execution capabilities for the GHL Agency AI project. It enables listing, executing, monitoring, and managing tool executions across multiple categories.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Tool Categories](#tool-categories)
- [Usage Examples](#usage-examples)
- [Security & Rate Limiting](#security--rate-limiting)
- [Integration with MCP](#integration-with-mcp)

## Overview

The Tools Router (`/api/tools`) provides a unified interface for:

- **Discovery**: List and search available tools by category
- **Execution**: Run tools with parameters and timeout support
- **Monitoring**: Track tool execution status in real-time
- **Management**: Cancel running executions and view history
- **Analytics**: Get metrics and statistics on tool usage

## Features

### 1. Tool Discovery & Listing

- List all available tools
- Filter by category (browser, file, shell, web, database, etc.)
- Search tools by name or description
- Get categorized tool listings
- View tool details including input schemas

### 2. Tool Execution

- Execute any registered MCP tool
- Pass custom arguments/parameters
- Set execution timeouts (1s - 5min)
- Provide execution context (sessionId, metadata)
- Real-time execution tracking
- Unique execution IDs for tracking

### 3. Execution Monitoring

- Get real-time status of running tools
- View execution history with filtering
- Track execution metrics (success/failure rates, avg execution time)
- Monitor active executions
- User-specific execution isolation

### 4. Execution Management

- Cancel running tool executions
- Timeout support for long-running operations
- Abort controller integration
- Execution cleanup and history management

### 5. Analytics & Metrics

- Tool usage statistics
- Category-level metrics
- User-specific analytics
- Most-used tools tracking
- Execution time analysis
- Success/failure rate tracking

## API Endpoints

### 1. List Tools

**Endpoint**: `tools.listTools`

**Type**: Query

**Input**:
```typescript
{
  category?: 'browser' | 'file' | 'shell' | 'web' | 'database' | 'ai' | 'system' | 'workflow' | 'memory' | 'agent';
  tags?: string[];
  includeDeprecated?: boolean;
  search?: string; // Search by name or description
}
```

**Output**:
```typescript
{
  success: boolean;
  tools: Array<{
    name: string;
    description: string;
    inputSchema: object;
  }>;
  categorizedTools: Record<string, Tool[]>;
  totalCount: number;
  categories: string[];
}
```

### 2. Execute Tool

**Endpoint**: `tools.executeTool`

**Type**: Mutation

**Input**:
```typescript
{
  name: string; // Tool name in format: category/name (e.g., "file/read")
  arguments?: Record<string, unknown>;
  timeout?: number; // 1000ms - 300000ms (1s - 5min)
  context?: {
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };
}
```

**Output**:
```typescript
{
  success: boolean;
  executionId: string; // Unique execution ID
  result: unknown; // Tool execution result
  toolName: string;
  executionTime: number; // Milliseconds
  timestamp: Date;
}
```

### 3. Get Tool Status

**Endpoint**: `tools.getToolStatus`

**Type**: Query

**Input**:
```typescript
{
  executionId: string; // Execution ID from executeTool
}
```

**Output**:
```typescript
{
  success: boolean;
  execution: {
    id: string;
    toolName: string;
    category: string;
    status: 'running' | 'success' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    executionTime?: number;
    result?: unknown;
    error?: string;
  };
}
```

### 4. Cancel Tool Execution

**Endpoint**: `tools.cancelToolExecution`

**Type**: Mutation

**Input**:
```typescript
{
  executionId: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  executionId: string;
  message: string;
  timestamp: Date;
}
```

### 5. Get Tool History

**Endpoint**: `tools.getToolHistory`

**Type**: Query

**Input**:
```typescript
{
  toolName?: string; // Filter by specific tool
  category?: ToolCategory;
  limit?: number; // 1-100, default: 50
  offset?: number; // Default: 0
  status?: 'success' | 'failed' | 'running' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
{
  success: boolean;
  executions: ToolExecution[];
  totalCount: number;
  limit: number;
  offset: number;
  stats: {
    total: number;
    success: number;
    failed: number;
    cancelled: number;
    averageExecutionTime: number;
  };
}
```

### 6. Get Tool Metrics

**Endpoint**: `tools.getToolMetrics`

**Type**: Query

**Input**:
```typescript
{
  toolName?: string; // Get metrics for specific tool, or all if omitted
}
```

**Output**:
```typescript
{
  success: boolean;
  registryMetrics: object; // MCP registry metrics
  activeExecutions: number;
  userStats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    cancelledExecutions: number;
    averageExecutionTime: number;
  };
  categoryStats: Record<string, number>;
  toolUsageStats: Record<string, number>;
  mostUsedTools: Array<{ tool: string; count: number }>;
  timestamp: Date;
}
```

### 7. Get Active Executions

**Endpoint**: `tools.getActiveExecutions`

**Type**: Query

**Output**:
```typescript
{
  success: boolean;
  executions: Array<{
    id: string;
    toolName: string;
    category: string;
    status: string;
    startTime: Date;
    runningTime: number; // Milliseconds
  }>;
  count: number;
}
```

### 8. Get Tool Details

**Endpoint**: `tools.getToolDetails`

**Type**: Query

**Input**:
```typescript
{
  name: string; // Tool name
}
```

**Output**:
```typescript
{
  success: boolean;
  tool: {
    name: string;
    description: string;
    inputSchema: object;
    category: string;
  };
  metrics: object; // Registry metrics for this tool
  userStats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    lastExecuted?: Date;
    averageExecutionTime: number;
  };
}
```

## Tool Categories

The Tools Router organizes tools into the following categories:

### 1. **Browser** (`browser`)
Browser automation tools (via Browserbase/Stagehand integration)
- Session management
- Navigation
- Element interaction
- Data extraction

### 2. **File** (`file`)
File system operations
- Read/write files
- List directories
- File manipulation
- Directory management

### 3. **Shell** (`shell`)
Sandboxed shell command execution
- Execute allowed commands
- Environment variable management
- Working directory control
- Security-filtered execution

### 4. **Web** (`web`)
HTTP requests and web scraping
- HTTP requests (GET, POST, PUT, DELETE, PATCH)
- Webpage fetching
- Content extraction

### 5. **Database** (`database`)
Database query operations
- Read-only queries
- Table listing
- Schema inspection

### 6. **AI** (`ai`)
AI model interactions
- LLM invocations
- Embeddings
- AI-powered operations

### 7. **System** (`system`)
System-level operations
- Server management
- Health checks
- Configuration

### 8. **Workflow** (`workflow`)
Workflow automation
- Task scheduling
- Pipeline execution

### 9. **Memory** (`memory`)
Memory and state management
- Session storage
- Cache operations

### 10. **Agent** (`agent`)
Agent-specific operations
- Agent coordination
- Swarm management

## Usage Examples

### Example 1: List All Tools

```typescript
import { trpc } from '@/utils/trpc';

const { data } = await trpc.tools.listTools.useQuery();

console.log(`Total tools: ${data.totalCount}`);
console.log(`Categories: ${data.categories.join(', ')}`);
data.categorizedTools.file.forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
});
```

### Example 2: Execute a File Read Tool

```typescript
import { trpc } from '@/utils/trpc';

const result = await trpc.tools.executeTool.useMutation({
  name: 'file/read',
  arguments: {
    path: '/path/to/file.txt',
    encoding: 'utf-8'
  },
  timeout: 10000, // 10 seconds
  context: {
    sessionId: 'my-session-123',
    metadata: { source: 'user-request' }
  }
});

console.log(`Execution ID: ${result.executionId}`);
console.log(`Result: ${JSON.stringify(result.result)}`);
console.log(`Execution time: ${result.executionTime}ms`);
```

### Example 3: Execute with Timeout and Status Monitoring

```typescript
import { trpc } from '@/utils/trpc';

// Start execution
const execution = await trpc.tools.executeTool.useMutation({
  name: 'web/fetch',
  arguments: {
    url: 'https://example.com',
    extractText: true
  },
  timeout: 30000 // 30 seconds
});

// Monitor status
const status = await trpc.tools.getToolStatus.useQuery({
  executionId: execution.executionId
});

console.log(`Status: ${status.execution.status}`);
```

### Example 4: Cancel a Running Execution

```typescript
import { trpc } from '@/utils/trpc';

// Cancel execution
const result = await trpc.tools.cancelToolExecution.useMutation({
  executionId: 'exec_1234567890_abc123'
});

console.log(result.message); // "Tool execution cancelled"
```

### Example 5: View Execution History

```typescript
import { trpc } from '@/utils/trpc';

const history = await trpc.tools.getToolHistory.useQuery({
  category: 'file',
  limit: 10,
  status: 'success'
});

console.log(`Total executions: ${history.totalCount}`);
console.log(`Success rate: ${history.stats.success / history.stats.total * 100}%`);
console.log(`Average execution time: ${history.stats.averageExecutionTime}ms`);
```

### Example 6: Get Tool Metrics

```typescript
import { trpc } from '@/utils/trpc';

const metrics = await trpc.tools.getToolMetrics.useQuery({
  toolName: 'file/read'
});

console.log(`Total executions: ${metrics.userStats.totalExecutions}`);
console.log(`Success rate: ${metrics.userStats.successfulExecutions / metrics.userStats.totalExecutions * 100}%`);
console.log(`Average execution time: ${metrics.userStats.averageExecutionTime}ms`);
```

### Example 7: Search for Specific Tools

```typescript
import { trpc } from '@/utils/trpc';

const { data } = await trpc.tools.listTools.useQuery({
  search: 'database',
  category: 'database'
});

console.log(`Found ${data.totalCount} database tools`);
data.tools.forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
});
```

### Example 8: Get Active Executions

```typescript
import { trpc } from '@/utils/trpc';

const active = await trpc.tools.getActiveExecutions.useQuery();

console.log(`Active executions: ${active.count}`);
active.executions.forEach(exec => {
  console.log(`- ${exec.toolName}: running for ${exec.runningTime}ms`);
});
```

## Security & Rate Limiting

### Authentication

All endpoints require authentication via `protectedProcedure`. Users can only:
- View their own execution history
- Cancel their own executions
- Access their own metrics

### Execution Isolation

- Each user's executions are isolated
- Execution IDs are unique and user-specific
- No cross-user execution access

### Timeout Management

- Default timeout: None (tool-specific)
- Maximum timeout: 5 minutes (300,000ms)
- Minimum timeout: 1 second (1,000ms)
- Configurable per-execution

### Rate Limiting Considerations

While not implemented in the current version, consider adding:

```typescript
// Example rate limiting middleware
import rateLimit from 'express-rate-limit';

const toolExecutionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many tool executions, please try again later'
});
```

### Tool-Level Security

Tools inherit security from MCP tool definitions:
- **File tools**: Path sanitization, restricted directories
- **Shell tools**: Command whitelisting, pattern blocking
- **Database tools**: Read-only queries, query validation
- **Web tools**: URL validation, timeout enforcement

## Integration with MCP

The Tools Router integrates seamlessly with the MCP (Model Context Protocol) layer:

### Tool Registry

Tools are registered via the MCP Tool Registry:

```typescript
// server/mcp/registry.ts
import { ToolRegistry } from './registry';

const registry = new ToolRegistry();

// Register tools
registry.register(readFileTool, {
  name: 'file/read',
  category: 'file',
  description: 'Read file contents',
  version: '1.0.0',
  tags: ['filesystem', 'io']
});
```

### Execution Flow

1. **Client Request** → Tools Router endpoint
2. **Authentication** → User validation via protectedProcedure
3. **Tool Lookup** → MCP Tool Registry
4. **Execution** → Tool handler invocation
5. **Tracking** → Execution state management
6. **Response** → Result or error

### MCP Server Integration

```typescript
import { getMCPServer } from '../../mcp';

const server = await getMCPServer();
const registry = server.toolRegistry;

// List tools
const tools = await registry.listTools();

// Execute tool
const result = await registry.executeTool(
  'file/read',
  { path: '/path/to/file.txt' },
  { sessionId: 'session-123', userId: user.id }
);
```

## Error Handling

The Tools Router provides comprehensive error handling:

### Error Types

1. **Tool Not Found** (404)
```typescript
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Tool not found: file/nonexistent'
});
```

2. **Execution Timeout** (500)
```typescript
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Tool execution timed out after 30000ms'
});
```

3. **Permission Denied** (403)
```typescript
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'You do not have permission to cancel this execution'
});
```

4. **Invalid Parameters** (500)
```typescript
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Invalid tool parameters: missing required field "path"'
});
```

## Best Practices

### 1. Always Set Timeouts

```typescript
// Good
await trpc.tools.executeTool.useMutation({
  name: 'web/fetch',
  arguments: { url: 'https://example.com' },
  timeout: 30000 // 30 seconds
});

// Bad (no timeout)
await trpc.tools.executeTool.useMutation({
  name: 'web/fetch',
  arguments: { url: 'https://example.com' }
});
```

### 2. Monitor Long-Running Operations

```typescript
const execution = await trpc.tools.executeTool.useMutation({
  name: 'shell/execute',
  arguments: { command: 'npm install' },
  timeout: 120000 // 2 minutes
});

// Poll for status
const interval = setInterval(async () => {
  const status = await trpc.tools.getToolStatus.useQuery({
    executionId: execution.executionId
  });

  if (status.execution.status !== 'running') {
    clearInterval(interval);
    console.log('Execution completed:', status.execution.status);
  }
}, 2000);
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await trpc.tools.executeTool.useMutation({
    name: 'file/read',
    arguments: { path: '/path/to/file.txt' }
  });
  console.log('Success:', result.result);
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('File not found');
  } else if (error.message.includes('timeout')) {
    console.error('Operation timed out');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### 4. Use Execution Context

```typescript
await trpc.tools.executeTool.useMutation({
  name: 'database/query',
  arguments: { query: 'SELECT * FROM users LIMIT 10' },
  context: {
    sessionId: browserSessionId,
    metadata: {
      source: 'user-dashboard',
      requestedBy: userId,
      timestamp: new Date()
    }
  }
});
```

### 5. Review Metrics Regularly

```typescript
// Get overview of tool usage
const metrics = await trpc.tools.getToolMetrics.useQuery();

// Identify frequently failing tools
const problematicTools = Object.entries(metrics.toolUsageStats)
  .filter(([tool, _]) => {
    const history = await trpc.tools.getToolHistory.useQuery({
      toolName: tool,
      status: 'failed'
    });
    return history.stats.failed > 10;
  });
```

## Production Considerations

### 1. Replace In-Memory Storage

The current implementation uses in-memory storage for executions. For production:

```typescript
// Consider using Redis for distributed storage
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379')
});

// Store execution
await redis.set(
  `execution:${executionId}`,
  JSON.stringify(execution),
  'EX',
  3600 // 1 hour TTL
);
```

### 2. Add Rate Limiting

```typescript
// Use Redis-based rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000,
  max: 100
});
```

### 3. Implement Execution Queuing

For high-volume scenarios:

```typescript
// Use Bull for job queuing
import Queue from 'bull';

const toolExecutionQueue = new Queue('tool-execution', {
  redis: { host: 'localhost', port: 6379 }
});

toolExecutionQueue.process(async (job) => {
  const { toolName, arguments } = job.data;
  return await registry.executeTool(toolName, arguments);
});
```

### 4. Add Observability

```typescript
// Integrate with monitoring tools
import * as Sentry from '@sentry/node';

try {
  const result = await registry.executeTool(name, args);
  Sentry.addBreadcrumb({
    category: 'tool-execution',
    message: `Tool ${name} executed successfully`,
    level: 'info'
  });
} catch (error) {
  Sentry.captureException(error, {
    tags: { tool: name },
    contexts: { arguments: args }
  });
}
```

## Troubleshooting

### Tool Not Found

**Problem**: `Tool not found: file/read`

**Solution**: Check that the tool is registered in the MCP registry:
```typescript
const server = await getMCPServer();
const tools = await server.toolRegistry.listTools();
console.log(tools.map(t => t.name));
```

### Execution Timeout

**Problem**: `Tool execution timed out after 30000ms`

**Solution**: Increase timeout or optimize tool implementation:
```typescript
await trpc.tools.executeTool.useMutation({
  name: 'web/fetch',
  arguments: { url: 'https://slow-site.com' },
  timeout: 60000 // Increase to 60 seconds
});
```

### Permission Denied

**Problem**: `You do not have permission to cancel this execution`

**Solution**: Ensure you're canceling your own execution:
```typescript
// Get your active executions first
const active = await trpc.tools.getActiveExecutions.useQuery();
const myExecution = active.executions[0];

// Cancel it
await trpc.tools.cancelToolExecution.useMutation({
  executionId: myExecution.id
});
```

## Related Documentation

- [MCP Router Documentation](./mcp.ts)
- [Browser Router Documentation](./browser.ts)
- [MCP Tool Registry](../../mcp/registry.ts)
- [Tool Definitions](../../mcp/tools/)

## Contributing

When adding new tool categories or functionality:

1. Update `ToolCategory` type in `server/mcp/types.ts`
2. Register tools with the MCP Tool Registry
3. Update this documentation
4. Add usage examples
5. Consider security implications
