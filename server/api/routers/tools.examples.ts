/**
 * Tools Router Usage Examples
 * Practical examples demonstrating the Tools Execution Engine
 */

import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import type { AppRouter } from '../../routers';

// ========================================
// TYPE HELPERS
// ========================================

type ExecuteToolInput = inferProcedureInput<AppRouter['tools']['executeTool']>;
type ExecuteToolOutput = inferProcedureOutput<AppRouter['tools']['executeTool']>;
type ToolHistoryOutput = inferProcedureOutput<AppRouter['tools']['getToolHistory']>;

// ========================================
// EXAMPLE 1: FILE OPERATIONS WORKFLOW
// ========================================

/**
 * Example: Read, process, and write files
 * Demonstrates file tool usage with error handling
 */
export async function fileOperationsWorkflow(trpc: any) {
  try {
    // Step 1: List files in directory
    console.log('Step 1: Listing files...');
    const listResult = await trpc.tools.executeTool.mutate({
      name: 'file/list',
      arguments: {
        path: '/path/to/directory',
        recursive: false,
        includeHidden: false,
      },
      timeout: 5000,
    });

    console.log(`Found ${listResult.result.count} files`);

    // Step 2: Read a specific file
    console.log('Step 2: Reading file...');
    const readResult = await trpc.tools.executeTool.mutate({
      name: 'file/read',
      arguments: {
        path: '/path/to/file.txt',
        encoding: 'utf-8',
      },
      timeout: 10000,
    });

    console.log(`Read ${readResult.result.size} bytes`);

    // Step 3: Process the content (example: convert to uppercase)
    const processedContent = (readResult.result.content as string).toUpperCase();

    // Step 4: Write processed content
    console.log('Step 3: Writing processed file...');
    const writeResult = await trpc.tools.executeTool.mutate({
      name: 'file/write',
      arguments: {
        path: '/path/to/output.txt',
        content: processedContent,
        encoding: 'utf-8',
        createDirectories: true,
      },
      timeout: 10000,
    });

    console.log(`Wrote ${writeResult.result.size} bytes to ${writeResult.result.path}`);

    return {
      success: true,
      filesProcessed: 1,
      outputPath: writeResult.result.path,
    };
  } catch (error) {
    console.error('File operations workflow failed:', error);
    throw error;
  }
}

// ========================================
// EXAMPLE 2: WEB SCRAPING WORKFLOW
// ========================================

/**
 * Example: Fetch multiple URLs and extract data
 * Demonstrates web tools with concurrent execution
 */
export async function webScrapingWorkflow(trpc: any, urls: string[]) {
  const results = [];

  for (const url of urls) {
    try {
      console.log(`Fetching: ${url}`);

      // Execute web fetch with timeout
      const result = await trpc.tools.executeTool.mutate({
        name: 'web/fetch',
        arguments: {
          url,
          extractText: true,
          timeout: 30000,
        },
        timeout: 35000, // Slightly longer than tool timeout
        context: {
          metadata: {
            source: 'web-scraping-workflow',
            url,
          },
        },
      });

      results.push({
        url,
        success: true,
        data: result.result,
        executionTime: result.executionTime,
      });

      console.log(`✓ Fetched ${url} in ${result.executionTime}ms`);
    } catch (error) {
      console.error(`✗ Failed to fetch ${url}:`, error);
      results.push({
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get summary statistics
  const successCount = results.filter((r) => r.success).length;
  const avgExecutionTime =
    results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.executionTime || 0), 0) / (successCount || 1);

  return {
    totalUrls: urls.length,
    successCount,
    failureCount: urls.length - successCount,
    averageExecutionTime: avgExecutionTime,
    results,
  };
}

// ========================================
// EXAMPLE 3: DATABASE QUERY WORKFLOW
// ========================================

/**
 * Example: Query database and export results
 * Demonstrates database tools with file export
 */
export async function databaseQueryWorkflow(trpc: any, query: string) {
  try {
    console.log('Step 1: Executing query...');

    // Execute database query
    const queryResult = await trpc.tools.executeTool.mutate({
      name: 'database/query',
      arguments: {
        query,
        limit: 100,
      },
      timeout: 60000, // 1 minute for complex queries
    });

    console.log(`Query returned ${queryResult.result.rowCount} rows`);

    // Step 2: Format results as CSV
    const rows = queryResult.result.rows as Record<string, any>[];
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => row[h]).join(',')),
    ].join('\n');

    // Step 3: Save to file
    console.log('Step 2: Saving results to file...');
    const writeResult = await trpc.tools.executeTool.mutate({
      name: 'file/write',
      arguments: {
        path: `/tmp/query-results-${Date.now()}.csv`,
        content: csvContent,
        encoding: 'utf-8',
      },
      timeout: 10000,
    });

    console.log(`Results saved to ${writeResult.result.path}`);

    return {
      success: true,
      rowCount: rows.length,
      outputPath: writeResult.result.path,
      executionTime: queryResult.executionTime,
    };
  } catch (error) {
    console.error('Database query workflow failed:', error);
    throw error;
  }
}

// ========================================
// EXAMPLE 4: LONG-RUNNING TASK WITH MONITORING
// ========================================

/**
 * Example: Execute long-running task with status monitoring
 * Demonstrates execution tracking and cancellation
 */
export async function longRunningTaskWithMonitoring(trpc: any) {
  try {
    console.log('Starting long-running task...');

    // Start execution
    const execution = await trpc.tools.executeTool.mutate({
      name: 'shell/execute',
      arguments: {
        command: 'npm install',
        cwd: '/path/to/project',
        timeout: 120000, // 2 minutes
      },
      timeout: 125000,
    });

    // Monitor execution
    const monitorInterval = setInterval(async () => {
      try {
        const status = await trpc.tools.getToolStatus.query({
          executionId: execution.executionId,
        });

        console.log(`Status: ${status.execution.status}`);

        if (status.execution.status !== 'running') {
          clearInterval(monitorInterval);

          if (status.execution.status === 'success') {
            console.log('✓ Task completed successfully');
          } else if (status.execution.status === 'failed') {
            console.error('✗ Task failed:', status.execution.error);
          } else if (status.execution.status === 'cancelled') {
            console.warn('⚠ Task was cancelled');
          }
        }
      } catch (error) {
        console.error('Status check failed:', error);
        clearInterval(monitorInterval);
      }
    }, 2000); // Check every 2 seconds

    // Optional: Cancel after 30 seconds if needed
    setTimeout(async () => {
      try {
        await trpc.tools.cancelToolExecution.mutate({
          executionId: execution.executionId,
        });
        console.log('Task cancelled after timeout');
      } catch (error) {
        // Task may have already completed
      }
    }, 30000);

    return execution;
  } catch (error) {
    console.error('Long-running task failed:', error);
    throw error;
  }
}

// ========================================
// EXAMPLE 5: BATCH TOOL EXECUTION
// ========================================

/**
 * Example: Execute multiple tools in parallel
 * Demonstrates concurrent tool execution
 */
export async function batchToolExecution(trpc: any) {
  console.log('Executing batch tools...');

  const tasks = [
    // Task 1: List files
    trpc.tools.executeTool.mutate({
      name: 'file/list',
      arguments: { path: '/path/to/dir1' },
      timeout: 5000,
    }),

    // Task 2: Fetch URL
    trpc.tools.executeTool.mutate({
      name: 'web/fetch',
      arguments: { url: 'https://example.com' },
      timeout: 10000,
    }),

    // Task 3: Database query
    trpc.tools.executeTool.mutate({
      name: 'database/query',
      arguments: { query: 'SELECT COUNT(*) FROM users' },
      timeout: 5000,
    }),
  ];

  // Execute all in parallel
  const results = await Promise.allSettled(tasks);

  // Process results
  const summary = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return {
        taskIndex: index,
        success: true,
        toolName: result.value.toolName,
        executionTime: result.value.executionTime,
      };
    } else {
      return {
        taskIndex: index,
        success: false,
        error: result.reason.message,
      };
    }
  });

  const successCount = summary.filter((s) => s.success).length;

  console.log(`Batch execution completed: ${successCount}/${tasks.length} succeeded`);

  return {
    totalTasks: tasks.length,
    successCount,
    failureCount: tasks.length - successCount,
    results: summary,
  };
}

// ========================================
// EXAMPLE 6: TOOL METRICS ANALYSIS
// ========================================

/**
 * Example: Analyze tool usage and performance
 * Demonstrates metrics and analytics endpoints
 */
export async function analyzeToolMetrics(trpc: any) {
  console.log('Analyzing tool metrics...');

  // Get overall metrics
  const metrics = await trpc.tools.getToolMetrics.query();

  console.log('\n=== Tool Usage Summary ===');
  console.log(`Active executions: ${metrics.activeExecutions}`);
  console.log(`Total executions: ${metrics.userStats.totalExecutions}`);
  console.log(`Success rate: ${(metrics.userStats.successfulExecutions / metrics.userStats.totalExecutions * 100).toFixed(2)}%`);
  console.log(`Average execution time: ${metrics.userStats.averageExecutionTime.toFixed(2)}ms`);

  console.log('\n=== Most Used Tools ===');
  metrics.mostUsedTools.forEach((tool: any, index: number) => {
    console.log(`${index + 1}. ${tool.tool}: ${tool.count} executions`);
  });

  console.log('\n=== Category Breakdown ===');
  Object.entries(metrics.categoryStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .forEach(([category, count]) => {
      console.log(`${category}: ${count} executions`);
    });

  // Get execution history
  const history = await trpc.tools.getToolHistory.query({
    limit: 50,
  });

  console.log('\n=== Recent Executions ===');
  console.log(`Total in history: ${history.totalCount}`);
  console.log(`Success: ${history.stats.success}`);
  console.log(`Failed: ${history.stats.failed}`);
  console.log(`Cancelled: ${history.stats.cancelled}`);
  console.log(`Average execution time: ${history.stats.averageExecutionTime.toFixed(2)}ms`);

  // Find slowest executions
  const slowestExecutions = history.executions
    .filter((e: any) => e.executionTime)
    .sort((a: any, b: any) => (b.executionTime || 0) - (a.executionTime || 0))
    .slice(0, 5);

  console.log('\n=== Slowest Executions ===');
  slowestExecutions.forEach((exec: any, index: number) => {
    console.log(`${index + 1}. ${exec.toolName}: ${exec.executionTime}ms (${exec.status})`);
  });

  return {
    metrics,
    history,
    analysis: {
      successRate: (metrics.userStats.successfulExecutions / metrics.userStats.totalExecutions * 100),
      averageExecutionTime: metrics.userStats.averageExecutionTime,
      mostUsedCategory: Object.entries(metrics.categoryStats)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0],
      slowestExecutions,
    },
  };
}

// ========================================
// EXAMPLE 7: ERROR HANDLING AND RETRY LOGIC
// ========================================

/**
 * Example: Execute tool with retry logic
 * Demonstrates robust error handling
 */
export async function executeWithRetry(
  trpc: any,
  toolName: string,
  args: Record<string, unknown>,
  maxRetries = 3
) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: Executing ${toolName}...`);

      const result = await trpc.tools.executeTool.mutate({
        name: toolName,
        arguments: args,
        timeout: 30000,
        context: {
          metadata: {
            attempt,
            maxRetries,
          },
        },
      });

      console.log(`✓ Success on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`✗ Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Exponential backoff
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`
  );
}

// ========================================
// EXAMPLE 8: TOOL DISCOVERY AND EXPLORATION
// ========================================

/**
 * Example: Discover and explore available tools
 * Demonstrates tool listing and filtering
 */
export async function discoverTools(trpc: any) {
  console.log('Discovering available tools...');

  // Get all tools
  const allTools = await trpc.tools.listTools.query();

  console.log(`\n=== Total Tools: ${allTools.totalCount} ===`);
  console.log(`Categories: ${allTools.categories.join(', ')}`);

  // Explore each category
  for (const category of allTools.categories) {
    const categoryTools = await trpc.tools.listTools.query({ category });

    console.log(`\n=== ${category.toUpperCase()} Tools (${categoryTools.totalCount}) ===`);

    categoryTools.tools.forEach((tool: any) => {
      console.log(`\n${tool.name}`);
      console.log(`  Description: ${tool.description}`);
      console.log(`  Schema:`, JSON.stringify(tool.inputSchema, null, 2));

      // Get tool details
      trpc.tools.getToolDetails
        .query({ name: tool.name })
        .then((details: any) => {
          console.log(`  Total executions: ${details.userStats.totalExecutions}`);
          console.log(`  Average execution time: ${details.userStats.averageExecutionTime.toFixed(2)}ms`);
        })
        .catch(() => {
          // Tool may not have been executed yet
        });
    });
  }

  // Search for specific tools
  console.log('\n=== Searching for "file" tools ===');
  const searchResults = await trpc.tools.listTools.query({ search: 'file' });
  console.log(`Found ${searchResults.totalCount} tools matching "file"`);
  searchResults.tools.forEach((tool: any) => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });

  return {
    totalTools: allTools.totalCount,
    categories: allTools.categories,
    categorizedTools: allTools.categorizedTools,
  };
}

// ========================================
// EXAMPLE 9: CLEAN UP OLD EXECUTIONS
// ========================================

/**
 * Example: Monitor and clean up execution history
 * Demonstrates history management
 */
export async function cleanupExecutionHistory(trpc: any) {
  console.log('Checking execution history...');

  // Get all executions
  const history = await trpc.tools.getToolHistory.query({
    limit: 100,
  });

  console.log(`Total executions in history: ${history.totalCount}`);

  // Find old failed executions
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldFailedExecutions = history.executions.filter(
    (e: any) =>
      e.status === 'failed' &&
      e.startTime &&
      new Date(e.startTime) < thirtyDaysAgo
  );

  console.log(`Found ${oldFailedExecutions.length} old failed executions`);

  // Note: In production, you'd want to implement a cleanup endpoint
  // For now, this just reports what would be cleaned up

  return {
    totalExecutions: history.totalCount,
    oldFailedCount: oldFailedExecutions.length,
    shouldCleanup: oldFailedExecutions.length > 0,
  };
}

// ========================================
// EXAMPLE 10: HEALTH CHECK USING TOOLS
// ========================================

/**
 * Example: Use tools to perform system health checks
 * Demonstrates practical tool composition
 */
export async function systemHealthCheck(trpc: any) {
  console.log('Performing system health check...');

  const healthStatus: Record<string, any> = {
    timestamp: new Date(),
    checks: [],
  };

  // Check 1: Database connectivity
  try {
    const dbCheck = await trpc.tools.executeTool.mutate({
      name: 'database/query',
      arguments: { query: 'SELECT 1 as health_check' },
      timeout: 5000,
    });

    healthStatus.checks.push({
      name: 'database',
      status: 'healthy',
      responseTime: dbCheck.executionTime,
    });

    console.log('✓ Database: healthy');
  } catch (error) {
    healthStatus.checks.push({
      name: 'database',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    console.error('✗ Database: unhealthy');
  }

  // Check 2: File system access
  try {
    const fsCheck = await trpc.tools.executeTool.mutate({
      name: 'file/list',
      arguments: { path: '/tmp' },
      timeout: 5000,
    });

    healthStatus.checks.push({
      name: 'filesystem',
      status: 'healthy',
      responseTime: fsCheck.executionTime,
    });

    console.log('✓ File system: healthy');
  } catch (error) {
    healthStatus.checks.push({
      name: 'filesystem',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    console.error('✗ File system: unhealthy');
  }

  // Check 3: External connectivity
  try {
    const webCheck = await trpc.tools.executeTool.mutate({
      name: 'web/request',
      arguments: {
        url: 'https://www.google.com',
        method: 'GET',
        timeout: 5000,
      },
      timeout: 6000,
    });

    healthStatus.checks.push({
      name: 'external_connectivity',
      status: 'healthy',
      responseTime: webCheck.executionTime,
    });

    console.log('✓ External connectivity: healthy');
  } catch (error) {
    healthStatus.checks.push({
      name: 'external_connectivity',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    console.error('✗ External connectivity: unhealthy');
  }

  // Overall health
  const unhealthyChecks = healthStatus.checks.filter((c: any) => c.status === 'unhealthy');
  healthStatus.overallStatus = unhealthyChecks.length === 0 ? 'healthy' : 'degraded';

  console.log(`\nOverall status: ${healthStatus.overallStatus}`);
  console.log(`Healthy checks: ${healthStatus.checks.length - unhealthyChecks.length}/${healthStatus.checks.length}`);

  return healthStatus;
}

// ========================================
// EXPORT ALL EXAMPLES
// ========================================

export const toolExamples = {
  fileOperationsWorkflow,
  webScrapingWorkflow,
  databaseQueryWorkflow,
  longRunningTaskWithMonitoring,
  batchToolExecution,
  analyzeToolMetrics,
  executeWithRetry,
  discoverTools,
  cleanupExecutionHistory,
  systemHealthCheck,
};
