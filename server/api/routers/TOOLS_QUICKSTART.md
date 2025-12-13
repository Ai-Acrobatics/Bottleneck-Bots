# Tools Router - Quick Start Guide

Get started with the Tools Execution Engine in 5 minutes.

## Installation

The Tools Router is already installed and registered in the GHL Agency AI project. No additional dependencies required.

## Basic Usage

### 1. List Available Tools

```typescript
import { trpc } from '@/utils/trpc';

// List all tools
const { data } = await trpc.tools.listTools.useQuery();

console.log(`Found ${data.totalCount} tools`);
console.log(`Categories: ${data.categories.join(', ')}`);

// List tools in a specific category
const fileTools = await trpc.tools.listTools.useQuery({
  category: 'file'
});

console.log(`File tools: ${fileTools.tools.map(t => t.name).join(', ')}`);
```

### 2. Execute a Tool

```typescript
// Execute file read tool
const result = await trpc.tools.executeTool.useMutation({
  name: 'file/read',
  arguments: {
    path: '/path/to/file.txt',
    encoding: 'utf-8'
  },
  timeout: 10000 // 10 seconds
});

console.log('File contents:', result.result.content);
console.log('Execution time:', result.executionTime, 'ms');
```

### 3. Monitor Execution Status

```typescript
// Start long-running operation
const execution = await trpc.tools.executeTool.useMutation({
  name: 'shell/execute',
  arguments: {
    command: 'npm install'
  },
  timeout: 120000 // 2 minutes
});

// Check status
const status = await trpc.tools.getToolStatus.useQuery({
  executionId: execution.executionId
});

console.log('Status:', status.execution.status);
```

### 4. View Execution History

```typescript
// Get recent executions
const history = await trpc.tools.getToolHistory.useQuery({
  limit: 10,
  status: 'success'
});

console.log(`Recent executions: ${history.executions.length}`);
console.log(`Success rate: ${history.stats.success / history.stats.total * 100}%`);
```

### 5. Get Tool Metrics

```typescript
// Get overall metrics
const metrics = await trpc.tools.getToolMetrics.useQuery();

console.log('Total executions:', metrics.userStats.totalExecutions);
console.log('Success rate:',
  (metrics.userStats.successfulExecutions /
   metrics.userStats.totalExecutions * 100).toFixed(2) + '%'
);

// Most used tools
metrics.mostUsedTools.forEach((tool, i) => {
  console.log(`${i + 1}. ${tool.tool}: ${tool.count} times`);
});
```

## Common Patterns

### Pattern 1: Read → Process → Write

```typescript
// Read file
const readResult = await trpc.tools.executeTool.useMutation({
  name: 'file/read',
  arguments: { path: '/input.txt' }
});

// Process (example: uppercase)
const processed = readResult.result.content.toUpperCase();

// Write result
await trpc.tools.executeTool.useMutation({
  name: 'file/write',
  arguments: {
    path: '/output.txt',
    content: processed
  }
});
```

### Pattern 2: Fetch → Extract → Store

```typescript
// Fetch webpage
const webpage = await trpc.tools.executeTool.useMutation({
  name: 'web/fetch',
  arguments: {
    url: 'https://example.com',
    extractText: true
  }
});

// Store in database (via other tools or direct DB access)
console.log('Fetched content:', webpage.result);
```

### Pattern 3: Query → Export

```typescript
// Query database
const queryResult = await trpc.tools.executeTool.useMutation({
  name: 'database/query',
  arguments: {
    query: 'SELECT * FROM users LIMIT 100'
  }
});

// Export to CSV
const csv = convertToCSV(queryResult.result.rows);
await trpc.tools.executeTool.useMutation({
  name: 'file/write',
  arguments: {
    path: '/export.csv',
    content: csv
  }
});
```

### Pattern 4: Retry on Failure

```typescript
async function executeWithRetry(toolName, args, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await trpc.tools.executeTool.useMutation({
        name: toolName,
        arguments: args,
        timeout: 30000
      });
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}

// Use it
const result = await executeWithRetry('web/fetch', {
  url: 'https://unreliable-api.com'
});
```

### Pattern 5: Parallel Execution

```typescript
// Execute multiple tools in parallel
const [files, webpage, dbResult] = await Promise.all([
  trpc.tools.executeTool.useMutation({
    name: 'file/list',
    arguments: { path: '/data' }
  }),
  trpc.tools.executeTool.useMutation({
    name: 'web/fetch',
    arguments: { url: 'https://api.example.com' }
  }),
  trpc.tools.executeTool.useMutation({
    name: 'database/query',
    arguments: { query: 'SELECT COUNT(*) FROM users' }
  })
]);

console.log('All tasks completed!');
```

## Available Tool Categories

### File Tools (`file/*`)
- `file/read` - Read file contents
- `file/write` - Write to file
- `file/list` - List directory contents
- `file/delete` - Delete file or directory

### Web Tools (`web/*`)
- `web/request` - Make HTTP request
- `web/fetch` - Fetch and extract webpage content

### Database Tools (`database/*`)
- `database/query` - Execute SELECT queries
- `database/tables` - List tables
- `database/schema` - Get table schema

### Shell Tools (`shell/*`)
- `shell/execute` - Execute sandboxed commands

### Browser Tools (`browser/*`)
Available via Browser Router integration

## Error Handling

```typescript
try {
  const result = await trpc.tools.executeTool.useMutation({
    name: 'file/read',
    arguments: { path: '/nonexistent.txt' }
  });
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('File does not exist');
  } else if (error.message.includes('timeout')) {
    console.error('Operation timed out');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Timeouts

Always set appropriate timeouts:

```typescript
// Quick operations: 5-10 seconds
await trpc.tools.executeTool.useMutation({
  name: 'file/list',
  arguments: { path: '/data' },
  timeout: 5000
});

// Moderate operations: 30-60 seconds
await trpc.tools.executeTool.useMutation({
  name: 'web/fetch',
  arguments: { url: 'https://example.com' },
  timeout: 30000
});

// Long operations: 1-5 minutes
await trpc.tools.executeTool.useMutation({
  name: 'shell/execute',
  arguments: { command: 'npm install' },
  timeout: 120000
});
```

## Cancellation

Cancel long-running operations:

```typescript
// Start execution
const execution = await trpc.tools.executeTool.useMutation({
  name: 'shell/execute',
  arguments: { command: 'npm install' },
  timeout: 300000
});

// Later... cancel it
await trpc.tools.cancelToolExecution.useMutation({
  executionId: execution.executionId
});
```

## Context and Metadata

Add context to executions:

```typescript
await trpc.tools.executeTool.useMutation({
  name: 'database/query',
  arguments: { query: 'SELECT * FROM logs' },
  context: {
    sessionId: 'session-123',
    metadata: {
      source: 'admin-dashboard',
      requestedBy: userId,
      purpose: 'audit-log-export'
    }
  }
});
```

## React Hooks

Use with React hooks:

```typescript
import { trpc } from '@/utils/trpc';

function ToolExecutor() {
  // Query hook
  const { data: tools } = trpc.tools.listTools.useQuery();

  // Mutation hook
  const executeTool = trpc.tools.executeTool.useMutation({
    onSuccess: (data) => {
      console.log('Tool executed:', data.executionId);
    },
    onError: (error) => {
      console.error('Execution failed:', error.message);
    }
  });

  const handleExecute = () => {
    executeTool.mutate({
      name: 'file/read',
      arguments: { path: '/test.txt' },
      timeout: 10000
    });
  };

  return (
    <div>
      <button onClick={handleExecute}>
        Execute Tool
      </button>
      {executeTool.isLoading && <p>Executing...</p>}
      {executeTool.isSuccess && <p>Success!</p>}
    </div>
  );
}
```

## Next Steps

1. **Explore Tools**: Use `listTools` to discover available tools
2. **Read Documentation**: Check `TOOLS_README.md` for detailed docs
3. **View Examples**: See `tools.examples.ts` for real-world patterns
4. **Check Types**: Reference `tools.types.ts` for TypeScript types
5. **Run Tests**: Execute `tools.test.ts` to see tests

## Tips & Best Practices

1. **Always set timeouts** - Prevent hanging operations
2. **Use context metadata** - Track execution sources
3. **Handle errors gracefully** - Check for specific error types
4. **Monitor metrics** - Track usage and performance
5. **Filter history** - Use pagination and filters
6. **Cancel when needed** - Don't let unnecessary operations run
7. **Retry on failure** - Implement exponential backoff
8. **Test in dev first** - Validate tools before production use

## Support

- **Documentation**: `TOOLS_README.md`
- **Examples**: `tools.examples.ts`
- **Tests**: `tools.test.ts`
- **Types**: `tools.types.ts`

## Quick Reference

| Endpoint | Type | Purpose |
|----------|------|---------|
| `listTools` | Query | List available tools |
| `executeTool` | Mutation | Execute a tool |
| `getToolStatus` | Query | Check execution status |
| `cancelToolExecution` | Mutation | Cancel running execution |
| `getToolHistory` | Query | View execution history |
| `getToolMetrics` | Query | Get usage metrics |
| `getActiveExecutions` | Query | View running executions |
| `getToolDetails` | Query | Get tool information |

---

**Ready to use!** Start with `listTools` to see what's available.
