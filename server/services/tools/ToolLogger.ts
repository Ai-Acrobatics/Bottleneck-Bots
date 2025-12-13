/**
 * ToolLogger - Database logging for tool executions
 *
 * Persists tool execution logs to the database for analytics and debugging
 */

import { getDb } from '../../db';
import { toolExecutions } from '../../../drizzle/schema-agent';
import { ToolExecutionLog } from './types';

// Lazy db accessor
async function db() {
  const dbInstance = await getDb();
  if (!dbInstance) {
    throw new Error('Database not available');
  }
  return dbInstance;
}

export interface ToolLogEntry {
  executionId: number;
  toolName: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  success: boolean;
  durationMs: number;
  error?: string;
}

export class ToolLogger {
  /**
   * Log a tool execution to the database
   */
  async log(entry: ToolLogEntry): Promise<number | null> {
    try {
      const dbInstance = await db();
      const [inserted] = await dbInstance
        .insert(toolExecutions)
        .values({
          executionId: entry.executionId,
          toolName: entry.toolName,
          parameters: entry.parameters,
          result: entry.result,
          success: entry.success,
          durationMs: entry.durationMs,
          error: entry.error,
        })
        .returning({ id: toolExecutions.id });

      return inserted?.id || null;
    } catch (error) {
      console.error('[ToolLogger] Failed to log execution:', error);
      return null;
    }
  }

  /**
   * Log from ToolExecutionLog format
   */
  async logFromToolResult(log: ToolExecutionLog): Promise<number | null> {
    return this.log({
      executionId: log.executionId,
      toolName: log.toolName,
      parameters: log.parameters,
      result: log.result as Record<string, unknown>,
      success: log.result.success,
      durationMs: log.duration,
      error: log.result.error,
    });
  }

  /**
   * Get tool execution logs for an execution
   */
  async getLogsForExecution(executionId: number): Promise<typeof toolExecutions.$inferSelect[]> {
    const { eq } = await import('drizzle-orm');
    const dbInstance = await db();

    return dbInstance
      .select()
      .from(toolExecutions)
      .where(eq(toolExecutions.executionId, executionId))
      .orderBy(toolExecutions.executedAt);
  }

  /**
   * Get tool execution statistics
   */
  async getStats(options?: {
    toolName?: string;
    since?: Date;
    limit?: number;
  }): Promise<{
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    byTool: Record<string, { count: number; successRate: number; avgDuration: number }>;
  }> {
    const { sql, count, avg, eq, gte, and } = await import('drizzle-orm');

    // Build conditions
    const conditions = [];
    if (options?.toolName) {
      conditions.push(eq(toolExecutions.toolName, options.toolName));
    }
    if (options?.since) {
      conditions.push(gte(toolExecutions.executedAt, options.since));
    }

    // Get aggregates
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const dbInstance = await db();
    const results = await dbInstance
      .select({
        toolName: toolExecutions.toolName,
        total: count(),
        successCount: sql<number>`count(*) filter (where ${toolExecutions.success} = true)`,
        avgDuration: avg(toolExecutions.durationMs),
      })
      .from(toolExecutions)
      .where(whereClause)
      .groupBy(toolExecutions.toolName);

    // Calculate totals
    let totalExecutions = 0;
    let totalSuccesses = 0;
    let totalDuration = 0;
    const byTool: Record<string, { count: number; successRate: number; avgDuration: number }> = {};

    for (const row of results) {
      const count = Number(row.total);
      const successes = Number(row.successCount);
      const avgDur = Number(row.avgDuration) || 0;

      totalExecutions += count;
      totalSuccesses += successes;
      totalDuration += avgDur * count;

      byTool[row.toolName] = {
        count,
        successRate: count > 0 ? (successes / count) * 100 : 0,
        avgDuration: avgDur,
      };
    }

    return {
      totalExecutions,
      successRate: totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0,
      averageDuration: totalExecutions > 0 ? totalDuration / totalExecutions : 0,
      byTool,
    };
  }

  /**
   * Get recent tool executions
   */
  async getRecent(options?: {
    executionId?: number;
    toolName?: string;
    limit?: number;
  }): Promise<typeof toolExecutions.$inferSelect[]> {
    const { eq, and, desc } = await import('drizzle-orm');

    const conditions = [];
    if (options?.executionId) {
      conditions.push(eq(toolExecutions.executionId, options.executionId));
    }
    if (options?.toolName) {
      conditions.push(eq(toolExecutions.toolName, options.toolName));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const dbInstance = await db();

    return dbInstance
      .select()
      .from(toolExecutions)
      .where(whereClause)
      .orderBy(desc(toolExecutions.executedAt))
      .limit(options?.limit || 50);
  }

  /**
   * Get failed tool executions
   */
  async getFailures(options?: {
    executionId?: number;
    limit?: number;
  }): Promise<typeof toolExecutions.$inferSelect[]> {
    const { eq, and, desc } = await import('drizzle-orm');

    const conditions = [eq(toolExecutions.success, false)];
    if (options?.executionId) {
      conditions.push(eq(toolExecutions.executionId, options.executionId));
    }

    const dbInstance = await db();
    return dbInstance
      .select()
      .from(toolExecutions)
      .where(and(...conditions))
      .orderBy(desc(toolExecutions.executedAt))
      .limit(options?.limit || 50);
  }

  /**
   * Clean up old logs
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    const { lt } = await import('drizzle-orm');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const dbInstance = await db();
    const result = await dbInstance
      .delete(toolExecutions)
      .where(lt(toolExecutions.executedAt, cutoffDate))
      .returning({ id: toolExecutions.id });

    return result.length;
  }
}

// Singleton instance
let loggerInstance: ToolLogger | null = null;

export function getToolLogger(): ToolLogger {
  if (!loggerInstance) {
    loggerInstance = new ToolLogger();
  }
  return loggerInstance;
}

export default ToolLogger;
