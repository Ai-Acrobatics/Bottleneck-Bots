import { z } from "zod";
import { router, adminProcedure } from "../../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../../db";
import {
  users,
  apiRequestLogs,
  workflowExecutions,
  browserSessions,
  jobs,
} from "../../../../drizzle/schema";
import { eq, and, desc, sql, count, gte, lte } from "drizzle-orm";

/**
 * Admin Audit Router
 *
 * Provides audit logging and activity tracking for administrators:
 * - View paginated audit logs with filters
 * - Track user-specific activity trails
 * - Monitor API requests and system events
 * - Search and filter audit entries
 *
 * Note: This router uses existing tables for audit data. For a production system,
 * consider creating a dedicated audit_logs table to track all admin actions,
 * user logins, permission changes, etc.
 *
 * All procedures are protected with adminProcedure middleware
 */

// ========================================
// VALIDATION SCHEMAS
// ========================================

const listAuditLogsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  userId: z.number().int().positive().optional(), // Filter by specific user
  eventType: z.enum([
    "all",
    "api_request",
    "workflow",
    "browser_session",
    "job",
    "user_signin",
  ]).default("all"),
  startDate: z.string().datetime().optional(), // ISO 8601 datetime
  endDate: z.string().datetime().optional(), // ISO 8601 datetime
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const getByUserSchema = z.object({
  userId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  eventType: z.enum([
    "all",
    "api_request",
    "workflow",
    "browser_session",
    "signin",
  ]).default("all"),
});

const getApiRequestLogsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  userId: z.number().int().positive().optional(),
  statusCode: z.number().int().optional(), // Filter by HTTP status code
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ========================================
// HELPER TYPES
// ========================================

interface AuditEntry {
  id: string | number;
  type: string;
  timestamp: Date;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  details: any;
  metadata?: any;
}

// ========================================
// ADMIN AUDIT ROUTER
// ========================================

export const auditRouter = router({
  /**
   * List audit logs with filtering
   * Aggregates data from multiple tables to create a unified audit trail
   */
  list: adminProcedure
    .input(listAuditLogsSchema)
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const auditEntries: AuditEntry[] = [];

        // Parse and validate date filters
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (input.startDate) {
          startDate = new Date(input.startDate);
          // Validate date is not invalid
          if (isNaN(startDate.getTime())) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid startDate format",
            });
          }
        }

        if (input.endDate) {
          endDate = new Date(input.endDate);
          // Validate date is not invalid
          if (isNaN(endDate.getTime())) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid endDate format",
            });
          }
        }

        // Validate date range logic
        if (startDate && endDate && startDate > endDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "startDate cannot be after endDate",
          });
        }

        // Fetch different event types based on filter
        const shouldFetch = (type: string) =>
          input.eventType === "all" || input.eventType === type;

        // PERFORMANCE NOTE: This approach fetches from multiple tables and merges results.
        // For production scale (10k+ entries per table), consider:
        // 1. Creating a dedicated audit_logs table with triggers/event sourcing
        // 2. Using database views or materialized views
        // 3. Implementing cursor-based pagination instead of offset
        // Current approach works well for <50k total audit entries across all tables

        // Calculate per-source limit when fetching all event types
        // If filtering by specific type, use full limit
        const eventTypesToFetch = input.eventType === "all"
          ? ["api_request", "workflow", "browser_session", "job", "user_signin"]
          : [input.eventType];
        const perSourceLimit = Math.ceil(input.limit * 1.5 / eventTypesToFetch.length); // Fetch 50% extra to ensure we have enough after merge

        // 1. API Request Logs
        if (shouldFetch("api_request")) {
          try {
            const conditions = [];
            if (input.userId) conditions.push(eq(apiRequestLogs.userId, input.userId));
            if (startDate) conditions.push(gte(apiRequestLogs.createdAt, startDate));
            if (endDate) conditions.push(lte(apiRequestLogs.createdAt, endDate));

            const apiLogs = await db
              .select({
                id: apiRequestLogs.id,
                userId: apiRequestLogs.userId,
                method: apiRequestLogs.method,
                endpoint: apiRequestLogs.endpoint,
                statusCode: apiRequestLogs.statusCode,
                responseTime: apiRequestLogs.responseTime,
                ipAddress: apiRequestLogs.ipAddress,
                createdAt: apiRequestLogs.createdAt,
                userName: users.name,
                userEmail: users.email,
              })
              .from(apiRequestLogs)
              .leftJoin(users, eq(apiRequestLogs.userId, users.id))
              .where(conditions.length > 0 ? and(...conditions) : undefined)
              .orderBy(input.sortOrder === "asc" ? apiRequestLogs.createdAt : desc(apiRequestLogs.createdAt))
              .limit(perSourceLimit);

            apiLogs.forEach(log => {
              auditEntries.push({
                id: `api-${log.id}`,
                type: "api_request",
                timestamp: log.createdAt,
                userId: log.userId,
                userName: log.userName,
                userEmail: log.userEmail,
                details: {
                  method: log.method,
                  endpoint: log.endpoint,
                  statusCode: log.statusCode,
                  responseTime: log.responseTime,
                  ipAddress: log.ipAddress,
                },
              });
            });
          } catch (e) {
            // API logs table might not exist yet
            console.log("[Audit] API request logs not available");
          }
        }

        // 2. Workflow Executions
        if (shouldFetch("workflow")) {
          const conditions = [];
          if (input.userId) conditions.push(eq(workflowExecutions.userId, input.userId));
          if (startDate) conditions.push(gte(workflowExecutions.createdAt, startDate));
          if (endDate) conditions.push(lte(workflowExecutions.createdAt, endDate));

          const workflows = await db
            .select({
              id: workflowExecutions.id,
              userId: workflowExecutions.userId,
              workflowId: workflowExecutions.workflowId,
              status: workflowExecutions.status,
              startedAt: workflowExecutions.startedAt,
              completedAt: workflowExecutions.completedAt,
              duration: workflowExecutions.duration,
              error: workflowExecutions.error,
              createdAt: workflowExecutions.createdAt,
              userName: users.name,
              userEmail: users.email,
            })
            .from(workflowExecutions)
            .leftJoin(users, eq(workflowExecutions.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(input.sortOrder === "asc" ? workflowExecutions.createdAt : desc(workflowExecutions.createdAt))
            .limit(perSourceLimit);

          workflows.forEach(workflow => {
            auditEntries.push({
              id: `workflow-${workflow.id}`,
              type: "workflow",
              timestamp: workflow.createdAt,
              userId: workflow.userId,
              userName: workflow.userName,
              userEmail: workflow.userEmail,
              details: {
                workflowId: workflow.workflowId,
                status: workflow.status,
                startedAt: workflow.startedAt,
                completedAt: workflow.completedAt,
                duration: workflow.duration,
                error: workflow.error,
              },
            });
          });
        }

        // 3. Browser Sessions
        if (shouldFetch("browser_session")) {
          const conditions = [];
          if (input.userId) conditions.push(eq(browserSessions.userId, input.userId));
          if (startDate) conditions.push(gte(browserSessions.createdAt, startDate));
          if (endDate) conditions.push(lte(browserSessions.createdAt, endDate));

          const sessions = await db
            .select({
              id: browserSessions.id,
              userId: browserSessions.userId,
              sessionId: browserSessions.sessionId,
              status: browserSessions.status,
              url: browserSessions.url,
              createdAt: browserSessions.createdAt,
              completedAt: browserSessions.completedAt,
              userName: users.name,
              userEmail: users.email,
            })
            .from(browserSessions)
            .leftJoin(users, eq(browserSessions.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(input.sortOrder === "asc" ? browserSessions.createdAt : desc(browserSessions.createdAt))
            .limit(perSourceLimit);

          sessions.forEach(session => {
            auditEntries.push({
              id: `session-${session.id}`,
              type: "browser_session",
              timestamp: session.createdAt,
              userId: session.userId,
              userName: session.userName,
              userEmail: session.userEmail,
              details: {
                sessionId: session.sessionId,
                status: session.status,
                url: session.url,
                completedAt: session.completedAt,
              },
            });
          });
        }

        // 4. Jobs
        if (shouldFetch("job")) {
          const conditions = [];
          if (startDate) conditions.push(gte(jobs.createdAt, startDate));
          if (endDate) conditions.push(lte(jobs.createdAt, endDate));

          const jobsList = await db
            .select({
              id: jobs.id,
              type: jobs.type,
              status: jobs.status,
              createdAt: jobs.createdAt,
              updatedAt: jobs.updatedAt,
            })
            .from(jobs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(input.sortOrder === "asc" ? jobs.createdAt : desc(jobs.createdAt))
            .limit(perSourceLimit);

          jobsList.forEach(job => {
            auditEntries.push({
              id: `job-${job.id}`,
              type: "job",
              timestamp: job.createdAt,
              userId: null,
              userName: null,
              userEmail: null,
              details: {
                jobType: job.type,
                status: job.status,
                updatedAt: job.updatedAt,
              },
            });
          });
        }

        // 5. User Sign-ins
        if (shouldFetch("user_signin")) {
          const conditions = [];
          if (input.userId) conditions.push(eq(users.id, input.userId));
          if (startDate) conditions.push(gte(users.lastSignedIn, startDate));
          if (endDate) conditions.push(lte(users.lastSignedIn, endDate));

          const signins = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              lastSignedIn: users.lastSignedIn,
              loginMethod: users.loginMethod,
            })
            .from(users)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(input.sortOrder === "asc" ? users.lastSignedIn : desc(users.lastSignedIn))
            .limit(perSourceLimit);

          signins.forEach(signin => {
            auditEntries.push({
              id: `signin-${signin.id}`,
              type: "user_signin",
              timestamp: signin.lastSignedIn,
              userId: signin.id,
              userName: signin.name,
              userEmail: signin.email,
              details: {
                loginMethod: signin.loginMethod,
              },
            });
          });
        }

        // Sort all entries by timestamp
        auditEntries.sort((a, b) => {
          const timeA = a.timestamp.getTime();
          const timeB = b.timestamp.getTime();
          return input.sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        });

        // CRITICAL FIX: Get total count BEFORE pagination
        const totalEntries = auditEntries.length;

        // Apply pagination
        const paginatedEntries = auditEntries.slice(input.offset, input.offset + input.limit);

        return {
          entries: paginatedEntries,
          pagination: {
            total: totalEntries,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < totalEntries,
          },
          filters: {
            eventType: input.eventType,
            userId: input.userId,
            startDate: input.startDate,
            endDate: input.endDate,
          },
        };
      } catch (error) {
        console.error("[Admin] Failed to list audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list audit logs",
          cause: error,
        });
      }
    }),

  /**
   * Get audit trail for a specific user
   */
  getByUser: adminProcedure
    .input(getByUserSchema)
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Check if user exists
        const [user] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            lastSignedIn: users.lastSignedIn,
          })
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const activities: AuditEntry[] = [];

        const shouldFetch = (type: string) =>
          input.eventType === "all" || input.eventType === type;

        // API Requests
        if (shouldFetch("api_request")) {
          try {
            const apiLogs = await db
              .select({
                id: apiRequestLogs.id,
                method: apiRequestLogs.method,
                endpoint: apiRequestLogs.endpoint,
                statusCode: apiRequestLogs.statusCode,
                responseTime: apiRequestLogs.responseTime,
                ipAddress: apiRequestLogs.ipAddress,
                createdAt: apiRequestLogs.createdAt,
              })
              .from(apiRequestLogs)
              .where(eq(apiRequestLogs.userId, input.userId))
              .orderBy(desc(apiRequestLogs.createdAt))
              .limit(Math.floor(input.limit / 3));

            apiLogs.forEach(log => {
              activities.push({
                id: `api-${log.id}`,
                type: "api_request",
                timestamp: log.createdAt,
                userId: input.userId,
                userName: user.name,
                userEmail: user.email,
                details: {
                  method: log.method,
                  endpoint: log.endpoint,
                  statusCode: log.statusCode,
                  responseTime: log.responseTime,
                  ipAddress: log.ipAddress,
                },
              });
            });
          } catch (e) {
            console.log("[Audit] API request logs not available for user");
          }
        }

        // Workflow Executions
        if (shouldFetch("workflow")) {
          const workflows = await db
            .select({
              id: workflowExecutions.id,
              workflowId: workflowExecutions.workflowId,
              status: workflowExecutions.status,
              startedAt: workflowExecutions.startedAt,
              completedAt: workflowExecutions.completedAt,
              duration: workflowExecutions.duration,
              error: workflowExecutions.error,
              createdAt: workflowExecutions.createdAt,
            })
            .from(workflowExecutions)
            .where(eq(workflowExecutions.userId, input.userId))
            .orderBy(desc(workflowExecutions.createdAt))
            .limit(Math.floor(input.limit / 3));

          workflows.forEach(workflow => {
            activities.push({
              id: `workflow-${workflow.id}`,
              type: "workflow",
              timestamp: workflow.createdAt,
              userId: input.userId,
              userName: user.name,
              userEmail: user.email,
              details: {
                workflowId: workflow.workflowId,
                status: workflow.status,
                startedAt: workflow.startedAt,
                completedAt: workflow.completedAt,
                duration: workflow.duration,
                error: workflow.error,
              },
            });
          });
        }

        // Browser Sessions
        if (shouldFetch("browser_session")) {
          const sessions = await db
            .select({
              id: browserSessions.id,
              sessionId: browserSessions.sessionId,
              status: browserSessions.status,
              url: browserSessions.url,
              createdAt: browserSessions.createdAt,
              completedAt: browserSessions.completedAt,
            })
            .from(browserSessions)
            .where(eq(browserSessions.userId, input.userId))
            .orderBy(desc(browserSessions.createdAt))
            .limit(Math.floor(input.limit / 3));

          sessions.forEach(session => {
            activities.push({
              id: `session-${session.id}`,
              type: "browser_session",
              timestamp: session.createdAt,
              userId: input.userId,
              userName: user.name,
              userEmail: user.email,
              details: {
                sessionId: session.sessionId,
                status: session.status,
                url: session.url,
                completedAt: session.completedAt,
              },
            });
          });
        }

        // Sort by timestamp
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply pagination
        const paginatedActivities = activities.slice(input.offset, input.offset + input.limit);

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastSignedIn: user.lastSignedIn,
          },
          activities: paginatedActivities,
          pagination: {
            total: activities.length,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < activities.length,
          },
          stats: {
            totalActivities: activities.length,
            byType: {
              api_requests: activities.filter(a => a.type === "api_request").length,
              workflows: activities.filter(a => a.type === "workflow").length,
              browser_sessions: activities.filter(a => a.type === "browser_session").length,
            },
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("[Admin] Failed to get user audit trail:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user audit trail",
          cause: error,
        });
      }
    }),

  /**
   * Get API request logs with advanced filtering
   */
  getApiRequests: adminProcedure
    .input(getApiRequestLogsSchema)
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Build WHERE conditions
        const conditions = [];

        if (input.userId) {
          conditions.push(eq(apiRequestLogs.userId, input.userId));
        }

        if (input.statusCode) {
          conditions.push(eq(apiRequestLogs.statusCode, input.statusCode));
        }

        if (input.method) {
          conditions.push(eq(apiRequestLogs.method, input.method));
        }

        if (input.startDate) {
          conditions.push(gte(apiRequestLogs.createdAt, new Date(input.startDate)));
        }

        if (input.endDate) {
          conditions.push(lte(apiRequestLogs.createdAt, new Date(input.endDate)));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const [totalResult] = await db
          .select({ count: count() })
          .from(apiRequestLogs)
          .where(whereClause);

        const total = totalResult?.count || 0;

        // Get paginated logs
        const logs = await db
          .select({
            id: apiRequestLogs.id,
            userId: apiRequestLogs.userId,
            method: apiRequestLogs.method,
            endpoint: apiRequestLogs.endpoint,
            statusCode: apiRequestLogs.statusCode,
            responseTime: apiRequestLogs.responseTime,
            ipAddress: apiRequestLogs.ipAddress,
            userAgent: apiRequestLogs.userAgent,
            referer: apiRequestLogs.referer,
            createdAt: apiRequestLogs.createdAt,
            userName: users.name,
            userEmail: users.email,
          })
          .from(apiRequestLogs)
          .leftJoin(users, eq(apiRequestLogs.userId, users.id))
          .where(whereClause)
          .orderBy(desc(apiRequestLogs.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          logs,
          pagination: {
            total,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < total,
          },
          filters: {
            userId: input.userId,
            statusCode: input.statusCode,
            method: input.method,
            startDate: input.startDate,
            endDate: input.endDate,
          },
        };
      } catch (error) {
        console.error("[Admin] Failed to get API request logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get API request logs",
          cause: error,
        });
      }
    }),

  /**
   * Get audit statistics
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

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // API requests stats
        let apiRequestsStats = {
          total: 0,
          last24Hours: 0,
          last7Days: 0,
        };

        try {
          const [totalApi] = await db.select({ count: count() }).from(apiRequestLogs);
          const [last24Api] = await db
            .select({ count: count() })
            .from(apiRequestLogs)
            .where(gte(apiRequestLogs.createdAt, last24Hours));
          const [last7Api] = await db
            .select({ count: count() })
            .from(apiRequestLogs)
            .where(gte(apiRequestLogs.createdAt, last7Days));

          apiRequestsStats = {
            total: totalApi?.count || 0,
            last24Hours: last24Api?.count || 0,
            last7Days: last7Api?.count || 0,
          };
        } catch (e) {
          console.log("[Audit] API request stats not available");
        }

        // Workflow executions stats
        const [totalWorkflows] = await db.select({ count: count() }).from(workflowExecutions);
        const [last24Workflows] = await db
          .select({ count: count() })
          .from(workflowExecutions)
          .where(gte(workflowExecutions.createdAt, last24Hours));
        const [last7Workflows] = await db
          .select({ count: count() })
          .from(workflowExecutions)
          .where(gte(workflowExecutions.createdAt, last7Days));

        // Browser sessions stats
        const [totalSessions] = await db.select({ count: count() }).from(browserSessions);
        const [last24Sessions] = await db
          .select({ count: count() })
          .from(browserSessions)
          .where(gte(browserSessions.createdAt, last24Hours));
        const [last7Sessions] = await db
          .select({ count: count() })
          .from(browserSessions)
          .where(gte(browserSessions.createdAt, last7Days));

        // User activity stats
        const [last24Signins] = await db
          .select({ count: count() })
          .from(users)
          .where(gte(users.lastSignedIn, last24Hours));
        const [last7Signins] = await db
          .select({ count: count() })
          .from(users)
          .where(gte(users.lastSignedIn, last7Days));

        return {
          apiRequests: apiRequestsStats,
          workflows: {
            total: totalWorkflows?.count || 0,
            last24Hours: last24Workflows?.count || 0,
            last7Days: last7Workflows?.count || 0,
          },
          browserSessions: {
            total: totalSessions?.count || 0,
            last24Hours: last24Sessions?.count || 0,
            last7Days: last7Sessions?.count || 0,
          },
          userSignins: {
            last24Hours: last24Signins?.count || 0,
            last7Days: last7Signins?.count || 0,
          },
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Admin] Failed to get audit stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get audit statistics",
          cause: error,
        });
      }
    }),
});
