/**
 * Analytics Router - Real-Time Analytics and Performance Metrics
 *
 * Provides comprehensive analytics endpoints for scheduled task monitoring,
 * performance tracking, and cost analysis.
 *
 * Features:
 * - Execution statistics (success/failure rates, durations)
 * - Task performance metrics
 * - Usage statistics (executions per time period)
 * - Cost analysis for browser sessions
 * - Performance trends and time-series data
 * - Caching for frequently accessed stats (5 min TTL)
 */

import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import {
  scheduledBrowserTasks,
  scheduledTaskExecutions,
  cronJobRegistry,
} from "../../../drizzle/schema-scheduled-tasks";
import { eq, and, gte, lte, desc, sql, count, avg, sum } from "drizzle-orm";
import { cacheService, CACHE_TTL, CACHE_PREFIX } from "../../services/cache.service";
import { websocketService } from "../../services/websocket.service";

// Time period enum for stats
const TimePeriod = z.enum(["day", "week", "month", "quarter", "year", "all"]);
type TimePeriodType = z.infer<typeof TimePeriod>;

/**
 * Helper: Get date range for time period
 */
function getDateRangeForPeriod(period: TimePeriodType): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "day":
      start.setDate(start.getDate() - 1);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(start.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "all":
      start.setFullYear(2020, 0, 1); // Start from 2020
      break;
  }

  return { start, end };
}

/**
 * Helper: Calculate percentage
 */
function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10; // Round to 1 decimal
}

export const analyticsRouter = router({
  /**
   * Get execution statistics
   * Returns overall success/failure rates and average duration
   */
  getExecutionStats: protectedProcedure
    .input(
      z.object({
        period: TimePeriod.default("week"),
        taskId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const cacheKey = `exec_stats_${input.period}_${input.taskId || "all"}_${ctx.user.id}`;

      // Check cache first
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      const database = await getDb();
      if (!database) {
        throw new Error("Database not available");
      }

      const { start, end } = getDateRangeForPeriod(input.period);

      // Build base query conditions
      const conditions = [
        eq(scheduledBrowserTasks.userId, ctx.user.id),
        gte(scheduledTaskExecutions.startedAt, start),
        lte(scheduledTaskExecutions.startedAt, end),
      ];

      if (input.taskId) {
        conditions.push(eq(scheduledTaskExecutions.taskId, input.taskId));
      }

      // Get execution counts by status
      const executions = await database
        .select({
          status: scheduledTaskExecutions.status,
          count: count(),
          avgDuration: avg(scheduledTaskExecutions.duration),
        })
        .from(scheduledTaskExecutions)
        .innerJoin(
          scheduledBrowserTasks,
          eq(scheduledTaskExecutions.taskId, scheduledBrowserTasks.id)
        )
        .where(and(...conditions))
        .groupBy(scheduledTaskExecutions.status);

      // Calculate statistics
      const totalExecutions = executions.reduce((sum, e) => sum + Number(e.count), 0);
      const successCount = executions.find((e) => e.status === "success")?.count || 0;
      const failedCount = executions.find((e) => e.status === "failed")?.count || 0;
      const timeoutCount = executions.find((e) => e.status === "timeout")?.count || 0;
      const runningCount = executions.find((e) => e.status === "running")?.count || 0;

      const avgDuration = executions.reduce((sum, e) => {
        const duration = Number(e.avgDuration) || 0;
        const weight = Number(e.count) / totalExecutions;
        return sum + duration * weight;
      }, 0);

      const stats = {
        period: input.period,
        dateRange: { start, end },
        totalExecutions,
        successCount: Number(successCount),
        failedCount: Number(failedCount),
        timeoutCount: Number(timeoutCount),
        runningCount: Number(runningCount),
        successRate: calculatePercentage(Number(successCount), totalExecutions),
        failureRate: calculatePercentage(Number(failedCount), totalExecutions),
        averageDuration: Math.round(avgDuration),
        averageDurationFormatted: `${Math.round(avgDuration / 1000)}s`,
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, stats, CACHE_TTL.MEDIUM);

      return { ...stats, fromCache: false };
    }),

  /**
   * Get task-specific performance metrics
   */
  getTaskMetrics: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        period: TimePeriod.default("week"),
      })
    )
    .query(async ({ input, ctx }) => {
      const cacheKey = `task_metrics_${input.taskId}_${input.period}`;

      // Check cache first
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      const database = await getDb();
      if (!database) {
        throw new Error("Database not available");
      }

      // Verify task belongs to user
      const task = await database.query.scheduledBrowserTasks.findFirst({
        where: and(
          eq(scheduledBrowserTasks.id, input.taskId),
          eq(scheduledBrowserTasks.userId, ctx.user.id)
        ),
      });

      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      const { start, end } = getDateRangeForPeriod(input.period);

      // Get recent executions with full details
      const recentExecutions = await database
        .select({
          id: scheduledTaskExecutions.id,
          status: scheduledTaskExecutions.status,
          triggerType: scheduledTaskExecutions.triggerType,
          attemptNumber: scheduledTaskExecutions.attemptNumber,
          startedAt: scheduledTaskExecutions.startedAt,
          completedAt: scheduledTaskExecutions.completedAt,
          duration: scheduledTaskExecutions.duration,
          error: scheduledTaskExecutions.error,
          stepsCompleted: sql<number>`${scheduledTaskExecutions.metadata}->>'stepsCompleted'`,
          stepsTotal: sql<number>`${scheduledTaskExecutions.metadata}->>'stepsTotal'`,
        })
        .from(scheduledTaskExecutions)
        .where(
          and(
            eq(scheduledTaskExecutions.taskId, input.taskId),
            gte(scheduledTaskExecutions.startedAt, start),
            lte(scheduledTaskExecutions.startedAt, end)
          )
        )
        .orderBy(desc(scheduledTaskExecutions.startedAt))
        .limit(100);

      // Calculate metrics
      const totalExecutions = recentExecutions.length;
      const successCount = recentExecutions.filter((e) => e.status === "success").length;
      const failedCount = recentExecutions.filter((e) => e.status === "failed").length;

      const durations = recentExecutions
        .filter((e) => e.duration)
        .map((e) => e.duration as number);

      const avgDuration = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

      const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
      const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

      // Calculate median duration
      const sortedDurations = [...durations].sort((a, b) => a - b);
      const medianDuration = sortedDurations.length > 0
        ? sortedDurations[Math.floor(sortedDurations.length / 2)]
        : 0;

      // Get current registry info
      const registry = await database.query.cronJobRegistry.findFirst({
        where: eq(cronJobRegistry.taskId, input.taskId),
      });

      const metrics = {
        taskId: input.taskId,
        taskName: task.name,
        period: input.period,
        dateRange: { start, end },
        execution: {
          total: totalExecutions,
          success: successCount,
          failed: failedCount,
          successRate: calculatePercentage(successCount, totalExecutions),
        },
        duration: {
          average: Math.round(avgDuration),
          median: Math.round(medianDuration),
          min: minDuration,
          max: maxDuration,
          unit: "ms",
        },
        currentStatus: {
          isActive: task.isActive,
          status: task.status,
          lastRun: task.lastRun,
          lastRunStatus: task.lastRunStatus,
          nextRun: task.nextRun,
          isRunning: registry?.isRunning || false,
          consecutiveFailures: (registry?.metadata as any)?.consecutiveFailures || 0,
        },
        recentExecutions: recentExecutions.slice(0, 10).map((e) => ({
          id: e.id,
          status: e.status,
          triggerType: e.triggerType,
          startedAt: e.startedAt,
          duration: e.duration,
          error: e.error,
          progress: e.stepsTotal
            ? `${e.stepsCompleted}/${e.stepsTotal}`
            : null,
        })),
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, metrics, CACHE_TTL.MEDIUM);

      return { ...metrics, fromCache: false };
    }),

  /**
   * Get usage statistics - executions per time period
   */
  getUsageStats: protectedProcedure
    .input(
      z.object({
        period: TimePeriod.default("month"),
        groupBy: z.enum(["hour", "day", "week", "month"]).default("day"),
      })
    )
    .query(async ({ input, ctx }) => {
      const cacheKey = `usage_stats_${input.period}_${input.groupBy}_${ctx.user.id}`;

      // Check cache first
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      const database = await getDb();
      if (!database) {
        throw new Error("Database not available");
      }

      const { start, end } = getDateRangeForPeriod(input.period);

      // Determine date truncation based on groupBy
      let dateTrunc: string;
      switch (input.groupBy) {
        case "hour":
          dateTrunc = "hour";
          break;
        case "day":
          dateTrunc = "day";
          break;
        case "week":
          dateTrunc = "week";
          break;
        case "month":
          dateTrunc = "month";
          break;
      }

      // Get executions grouped by time period
      const usageData = await database
        .select({
          period: sql`DATE_TRUNC('${sql.raw(dateTrunc)}', ${scheduledTaskExecutions.startedAt})`.as("period"),
          totalExecutions: count(),
          successCount: count(sql`CASE WHEN ${scheduledTaskExecutions.status} = 'success' THEN 1 END`),
          failedCount: count(sql`CASE WHEN ${scheduledTaskExecutions.status} = 'failed' THEN 1 END`),
          avgDuration: avg(scheduledTaskExecutions.duration),
        })
        .from(scheduledTaskExecutions)
        .innerJoin(
          scheduledBrowserTasks,
          eq(scheduledTaskExecutions.taskId, scheduledBrowserTasks.id)
        )
        .where(
          and(
            eq(scheduledBrowserTasks.userId, ctx.user.id),
            gte(scheduledTaskExecutions.startedAt, start),
            lte(scheduledTaskExecutions.startedAt, end)
          )
        )
        .groupBy(sql`DATE_TRUNC('${sql.raw(dateTrunc)}', ${scheduledTaskExecutions.startedAt})`)
        .orderBy(sql`DATE_TRUNC('${sql.raw(dateTrunc)}', ${scheduledTaskExecutions.startedAt})`);

      const stats = {
        period: input.period,
        groupBy: input.groupBy,
        dateRange: { start, end },
        data: usageData.map((row) => ({
          period: row.period,
          totalExecutions: Number(row.totalExecutions),
          successCount: Number(row.successCount),
          failedCount: Number(row.failedCount),
          avgDuration: Math.round(Number(row.avgDuration) || 0),
        })),
        summary: {
          totalExecutions: usageData.reduce((sum, row) => sum + Number(row.totalExecutions), 0),
          totalSuccess: usageData.reduce((sum, row) => sum + Number(row.successCount), 0),
          totalFailed: usageData.reduce((sum, row) => sum + Number(row.failedCount), 0),
        },
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, stats, CACHE_TTL.MEDIUM);

      return { ...stats, fromCache: false };
    }),

  /**
   * Get cost analysis for browser sessions
   * PLACEHOLDER: Integrate with Browserbase billing API
   */
  getCostAnalysis: protectedProcedure
    .input(
      z.object({
        period: TimePeriod.default("month"),
      })
    )
    .query(async ({ input, ctx }) => {
      const cacheKey = `cost_analysis_${input.period}_${ctx.user.id}`;

      // Check cache first
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      const database = await getDb();
      if (!database) {
        throw new Error("Database not available");
      }

      const { start, end } = getDateRangeForPeriod(input.period);

      // Get execution statistics
      const executions = await database
        .select({
          totalExecutions: count(),
          totalDuration: sum(scheduledTaskExecutions.duration),
          avgDuration: avg(scheduledTaskExecutions.duration),
        })
        .from(scheduledTaskExecutions)
        .innerJoin(
          scheduledBrowserTasks,
          eq(scheduledTaskExecutions.taskId, scheduledBrowserTasks.id)
        )
        .where(
          and(
            eq(scheduledBrowserTasks.userId, ctx.user.id),
            gte(scheduledTaskExecutions.startedAt, start),
            lte(scheduledTaskExecutions.startedAt, end),
            eq(scheduledTaskExecutions.status, "success") // Only count successful executions
          )
        );

      const totalDurationMs = Number(executions[0]?.totalDuration) || 0;
      const totalDurationMinutes = totalDurationMs / 1000 / 60;
      const totalExecutions = Number(executions[0]?.totalExecutions) || 0;

      // PLACEHOLDER: Calculate costs based on Browserbase pricing
      // Current Browserbase pricing (example):
      // - $0.005 per minute of session time
      // - Minimum charge: $0.01 per session
      const COST_PER_MINUTE = 0.005; // PLACEHOLDER: Update with actual pricing
      const MIN_COST_PER_SESSION = 0.01;

      const estimatedCost = Math.max(
        totalDurationMinutes * COST_PER_MINUTE,
        totalExecutions * MIN_COST_PER_SESSION
      );

      const analysis = {
        period: input.period,
        dateRange: { start, end },
        executions: {
          total: totalExecutions,
          totalDurationMs,
          totalDurationMinutes: Math.round(totalDurationMinutes * 10) / 10,
          avgDurationMs: Math.round(Number(executions[0]?.avgDuration) || 0),
        },
        cost: {
          estimatedTotal: Math.round(estimatedCost * 100) / 100,
          currency: "USD",
          costPerExecution: totalExecutions > 0
            ? Math.round((estimatedCost / totalExecutions) * 100) / 100
            : 0,
          costPerMinute: COST_PER_MINUTE,
          notes: [
            "PLACEHOLDER: Costs are estimated based on session duration",
            "Actual costs may vary based on Browserbase pricing tiers",
            "Does not include additional charges for screenshots or recordings",
          ],
        },
        breakdown: {
          sessionCosts: Math.round(totalExecutions * MIN_COST_PER_SESSION * 100) / 100,
          durationCosts: Math.round(totalDurationMinutes * COST_PER_MINUTE * 100) / 100,
        },
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, analysis, CACHE_TTL.MEDIUM);

      return { ...analysis, fromCache: false };
    }),

  /**
   * Get performance trends (time-series data)
   */
  getPerformanceTrends: protectedProcedure
    .input(
      z.object({
        taskId: z.number().optional(),
        period: TimePeriod.default("month"),
        metrics: z
          .array(z.enum(["duration", "success_rate", "execution_count"]))
          .default(["duration", "success_rate", "execution_count"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const cacheKey = `perf_trends_${input.taskId || "all"}_${input.period}_${ctx.user.id}`;

      // Check cache first
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      const database = await getDb();
      if (!database) {
        throw new Error("Database not available");
      }

      const { start, end } = getDateRangeForPeriod(input.period);

      // Build query conditions
      const conditions = [
        eq(scheduledBrowserTasks.userId, ctx.user.id),
        gte(scheduledTaskExecutions.startedAt, start),
        lte(scheduledTaskExecutions.startedAt, end),
      ];

      if (input.taskId) {
        conditions.push(eq(scheduledTaskExecutions.taskId, input.taskId));
      }

      // Get daily performance data
      const performanceData = await database
        .select({
          date: sql`DATE_TRUNC('day', ${scheduledTaskExecutions.startedAt})`.as("date"),
          executionCount: count(),
          successCount: count(sql`CASE WHEN ${scheduledTaskExecutions.status} = 'success' THEN 1 END`),
          avgDuration: avg(scheduledTaskExecutions.duration),
          minDuration: sql`MIN(${scheduledTaskExecutions.duration})`,
          maxDuration: sql`MAX(${scheduledTaskExecutions.duration})`,
        })
        .from(scheduledTaskExecutions)
        .innerJoin(
          scheduledBrowserTasks,
          eq(scheduledTaskExecutions.taskId, scheduledBrowserTasks.id)
        )
        .where(and(...conditions))
        .groupBy(sql`DATE_TRUNC('day', ${scheduledTaskExecutions.startedAt})`)
        .orderBy(sql`DATE_TRUNC('day', ${scheduledTaskExecutions.startedAt})`);

      const trends = {
        period: input.period,
        dateRange: { start, end },
        metrics: input.metrics,
        data: performanceData.map((row) => {
          const total = Number(row.executionCount);
          const success = Number(row.successCount);

          return {
            date: row.date,
            executionCount: total,
            successCount: success,
            successRate: calculatePercentage(success, total),
            avgDuration: Math.round(Number(row.avgDuration) || 0),
            minDuration: Number(row.minDuration) || 0,
            maxDuration: Number(row.maxDuration) || 0,
          };
        }),
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, trends, CACHE_TTL.MEDIUM);

      return { ...trends, fromCache: false };
    }),

  /**
   * Get WebSocket connection statistics
   */
  getWebSocketStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      isEnabled: true,
      connections: {
        total: 0,
        active: 0,
      },
      userConnections: 0,
      rooms: {},
    };
  }),

  /**
   * Get cache statistics
   */
  getCacheStats: protectedProcedure.query(async () => {
    const stats = cacheService.getStats();
    const health = await cacheService.healthCheck();

    return {
      performance: {
        available: stats.available,
        reconnectAttempts: stats.reconnectAttempts,
      },
      health: {
        healthy: health.healthy,
        latency: health.latency,
        error: health.error,
      },
    };
  }),
});
