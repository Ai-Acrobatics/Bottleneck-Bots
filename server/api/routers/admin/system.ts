import { z } from "zod";
import { router, adminProcedure } from "../../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../../db";
import {
  users,
  sessions,
  browserSessions,
  workflowExecutions,
  apiRequestLogs,
  jobs,
} from "../../../../drizzle/schema";
import { eq, and, desc, sql, count, gte } from "drizzle-orm";
import os from "os";

/**
 * Admin System Router
 *
 * Provides system health monitoring and statistics for administrators:
 * - System health status (database, memory, CPU)
 * - User counts and active sessions
 * - Recent activity overview
 * - Service status checks
 *
 * All procedures are protected with adminProcedure middleware
 */

// ========================================
// VALIDATION SCHEMAS
// ========================================

const getRecentActivitySchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  hours: z.number().int().min(1).max(168).default(24), // Last N hours, max 1 week
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get system memory information
 */
function getMemoryInfo() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const usagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

  return {
    total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
    used: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
    free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
    usagePercentage: parseFloat(usagePercentage),
  };
}

/**
 * Get system CPU information
 */
function getCpuInfo() {
  const cpus = os.cpus();
  const cpuCount = cpus.length;

  // Calculate average CPU usage
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += (cpu.times as any)[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpuCount;
  const total = totalTick / cpuCount;
  const usagePercentage = (100 - (100 * idle) / total).toFixed(2);

  return {
    count: cpuCount,
    model: cpus[0]?.model || "Unknown",
    speed: `${cpus[0]?.speed || 0} MHz`,
    usagePercentage: parseFloat(usagePercentage),
  };
}

/**
 * Get system uptime
 */
function getUptime() {
  const uptimeSeconds = os.uptime();
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  return {
    seconds: uptimeSeconds,
    formatted: `${days}d ${hours}h ${minutes}m`,
  };
}

/**
 * Get Node.js process information
 */
function getProcessInfo() {
  const memUsage = process.memoryUsage();

  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    uptime: {
      seconds: process.uptime(),
      formatted: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
    },
    memory: {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
    },
  };
}

// ========================================
// ADMIN SYSTEM ROUTER
// ========================================

export const systemRouter = router({
  /**
   * Get comprehensive system health status
   */
  getHealth: adminProcedure
    .query(async () => {
      try {
        const db = await getDb();

        // Database health check
        let databaseHealth = {
          status: "unhealthy" as "healthy" | "unhealthy",
          message: "Database connection failed",
          responseTime: 0,
        };

        if (db) {
          try {
            const startTime = Date.now();
            await db.select({ count: count() }).from(users).limit(1);
            const responseTime = Date.now() - startTime;

            databaseHealth = {
              status: "healthy",
              message: "Database connection successful",
              responseTime,
            };
          } catch (dbError) {
            console.error("[Admin] Database health check failed:", dbError);
            databaseHealth = {
              status: "unhealthy",
              message: dbError instanceof Error ? dbError.message : "Unknown database error",
              responseTime: 0,
            };
          }
        }

        // System resources
        const memory = getMemoryInfo();
        const cpu = getCpuInfo();
        const uptime = getUptime();
        const processInfo = getProcessInfo();

        // Determine overall health status
        const isHealthy = databaseHealth.status === "healthy" &&
                         memory.usagePercentage < 90 &&
                         cpu.usagePercentage < 90;

        return {
          status: isHealthy ? "healthy" : "degraded",
          timestamp: new Date(),
          database: databaseHealth,
          system: {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            uptime,
            memory,
            cpu,
          },
          process: processInfo,
          environment: {
            nodeEnv: process.env.NODE_ENV || "development",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };
      } catch (error) {
        console.error("[Admin] Failed to get system health:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get system health",
          cause: error,
        });
      }
    }),

  /**
   * Get system statistics (users, sessions, activity)
   */
  getStats: adminProcedure
    .query(async () => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Total users
        const [totalUsersResult] = await db
          .select({ count: count() })
          .from(users);

        // Active sessions (not expired)
        const [activeSessionsResult] = await db
          .select({ count: count() })
          .from(sessions)
          .where(sql`${sessions.expiresAt} > NOW()`);

        // Active browser sessions
        const [activeBrowserSessionsResult] = await db
          .select({ count: count() })
          .from(browserSessions)
          .where(eq(browserSessions.status, "active"));

        // Running workflow executions
        const [runningWorkflowsResult] = await db
          .select({ count: count() })
          .from(workflowExecutions)
          .where(eq(workflowExecutions.status, "running"));

        // Pending jobs
        const [pendingJobsResult] = await db
          .select({ count: count() })
          .from(jobs)
          .where(eq(jobs.status, "pending"));

        // Users created in last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [newUsersResult] = await db
          .select({ count: count() })
          .from(users)
          .where(gte(users.createdAt, last24Hours));

        // API requests in last hour (if table exists)
        let apiRequestsLastHour = 0;
        try {
          const lastHour = new Date(Date.now() - 60 * 60 * 1000);
          const [apiRequestsResult] = await db
            .select({ count: count() })
            .from(apiRequestLogs)
            .where(gte(apiRequestLogs.createdAt, lastHour));
          apiRequestsLastHour = apiRequestsResult?.count || 0;
        } catch (e) {
          // Table might not exist, ignore
        }

        // Users signed in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [signedInTodayResult] = await db
          .select({ count: count() })
          .from(users)
          .where(gte(users.lastSignedIn, today));

        return {
          users: {
            total: totalUsersResult?.count || 0,
            newLast24Hours: newUsersResult?.count || 0,
            signedInToday: signedInTodayResult?.count || 0,
          },
          sessions: {
            active: activeSessionsResult?.count || 0,
            activeBrowserSessions: activeBrowserSessionsResult?.count || 0,
          },
          workflows: {
            running: runningWorkflowsResult?.count || 0,
          },
          jobs: {
            pending: pendingJobsResult?.count || 0,
          },
          api: {
            requestsLastHour: apiRequestsLastHour,
          },
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Admin] Failed to get system stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get system statistics",
          cause: error,
        });
      }
    }),

  /**
   * Get recent activity (user signins, workflow executions, etc.)
   */
  getRecentActivity: adminProcedure
    .input(getRecentActivitySchema)
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const sinceTime = new Date(Date.now() - input.hours * 60 * 60 * 1000);

        // Recent user signins
        const recentSignins = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            lastSignedIn: users.lastSignedIn,
          })
          .from(users)
          .where(gte(users.lastSignedIn, sinceTime))
          .orderBy(desc(users.lastSignedIn))
          .limit(input.limit);

        // Recent new users
        const recentUsers = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            loginMethod: users.loginMethod,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(gte(users.createdAt, sinceTime))
          .orderBy(desc(users.createdAt))
          .limit(input.limit);

        // Recent browser sessions
        const recentBrowserSessions = await db
          .select({
            id: browserSessions.id,
            sessionId: browserSessions.sessionId,
            userId: browserSessions.userId,
            status: browserSessions.status,
            url: browserSessions.url,
            createdAt: browserSessions.createdAt,
          })
          .from(browserSessions)
          .where(gte(browserSessions.createdAt, sinceTime))
          .orderBy(desc(browserSessions.createdAt))
          .limit(input.limit);

        // Recent workflow executions
        const recentWorkflows = await db
          .select({
            id: workflowExecutions.id,
            workflowId: workflowExecutions.workflowId,
            userId: workflowExecutions.userId,
            status: workflowExecutions.status,
            startedAt: workflowExecutions.startedAt,
            completedAt: workflowExecutions.completedAt,
            duration: workflowExecutions.duration,
          })
          .from(workflowExecutions)
          .where(gte(workflowExecutions.createdAt, sinceTime))
          .orderBy(desc(workflowExecutions.createdAt))
          .limit(input.limit);

        // Recent jobs
        const recentJobs = await db
          .select({
            id: jobs.id,
            type: jobs.type,
            status: jobs.status,
            createdAt: jobs.createdAt,
            updatedAt: jobs.updatedAt,
          })
          .from(jobs)
          .where(gte(jobs.createdAt, sinceTime))
          .orderBy(desc(jobs.createdAt))
          .limit(input.limit);

        return {
          signins: recentSignins.map(signin => ({
            type: "signin" as const,
            userId: signin.id,
            userName: signin.name,
            userEmail: signin.email,
            timestamp: signin.lastSignedIn,
          })),
          newUsers: recentUsers.map(user => ({
            type: "user_created" as const,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            role: user.role,
            loginMethod: user.loginMethod,
            timestamp: user.createdAt,
          })),
          browserSessions: recentBrowserSessions.map(session => ({
            type: "browser_session" as const,
            sessionId: session.sessionId,
            userId: session.userId,
            status: session.status,
            url: session.url,
            timestamp: session.createdAt,
          })),
          workflows: recentWorkflows.map(workflow => ({
            type: "workflow" as const,
            workflowId: workflow.workflowId,
            userId: workflow.userId,
            status: workflow.status,
            startedAt: workflow.startedAt,
            completedAt: workflow.completedAt,
            duration: workflow.duration,
          })),
          jobs: recentJobs.map(job => ({
            type: "job" as const,
            jobId: job.id,
            jobType: job.type,
            status: job.status,
            timestamp: job.createdAt,
          })),
          filters: {
            hours: input.hours,
            limit: input.limit,
            since: sinceTime,
          },
        };
      } catch (error) {
        console.error("[Admin] Failed to get recent activity:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get recent activity",
          cause: error,
        });
      }
    }),

  /**
   * Get service status overview
   */
  getServiceStatus: adminProcedure
    .query(async () => {
      try {
        const db = await getDb();

        // Check database connection
        let databaseOnline = false;
        try {
          if (db) {
            await db.select({ count: count() }).from(users).limit(1);
            databaseOnline = true;
          }
        } catch (e) {
          console.error("[Admin] Database check failed:", e);
        }

        // Check environment variables for key services
        const services = {
          database: {
            status: databaseOnline ? "online" : "offline",
            message: databaseOnline ? "Connected" : "Connection failed",
          },
          browserbase: {
            status: process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID ? "configured" : "not_configured",
            message: process.env.BROWSERBASE_API_KEY ? "API key configured" : "API key missing",
          },
          openai: {
            status: process.env.OPENAI_API_KEY ? "configured" : "not_configured",
            message: process.env.OPENAI_API_KEY ? "API key configured" : "API key missing",
          },
          anthropic: {
            status: process.env.ANTHROPIC_API_KEY ? "configured" : "not_configured",
            message: process.env.ANTHROPIC_API_KEY ? "API key configured" : "API key missing",
          },
          stripe: {
            status: process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
            message: process.env.STRIPE_SECRET_KEY ? "API key configured" : "API key missing",
          },
          email: {
            status: process.env.RESEND_API_KEY ? "configured" : "not_configured",
            message: process.env.RESEND_API_KEY ? "Resend API key configured" : "Email service not configured",
          },
        };

        // Calculate overall status
        const criticalServicesOnline = databaseOnline;
        const overallStatus = criticalServicesOnline ? "operational" : "degraded";

        return {
          status: overallStatus,
          services,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Admin] Failed to get service status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get service status",
          cause: error,
        });
      }
    }),

  /**
   * Get database statistics
   */
  getDatabaseStats: adminProcedure
    .query(async () => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Get counts from various tables
        const [usersCount] = await db.select({ count: count() }).from(users);
        const [sessionsCount] = await db.select({ count: count() }).from(sessions);
        const [browserSessionsCount] = await db.select({ count: count() }).from(browserSessions);
        const [workflowsCount] = await db.select({ count: count() }).from(workflowExecutions);
        const [jobsCount] = await db.select({ count: count() }).from(jobs);

        // Calculate database size estimate (rough estimate)
        const estimatedRecords =
          (usersCount?.count || 0) +
          (sessionsCount?.count || 0) +
          (browserSessionsCount?.count || 0) +
          (workflowsCount?.count || 0) +
          (jobsCount?.count || 0);

        return {
          tables: {
            users: usersCount?.count || 0,
            sessions: sessionsCount?.count || 0,
            browserSessions: browserSessionsCount?.count || 0,
            workflows: workflowsCount?.count || 0,
            jobs: jobsCount?.count || 0,
          },
          totalRecords: estimatedRecords,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Admin] Failed to get database stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get database statistics",
          cause: error,
        });
      }
    }),
});
