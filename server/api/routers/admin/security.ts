import { z } from "zod";
import { router, adminProcedure } from "../../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../../db";
import { securityEvents, systemConfig, users } from "../../../../drizzle/schema";
import { eq, and, desc, sql, count, gte, lte, or } from "drizzle-orm";

/**
 * Admin Security Router
 *
 * Provides security event monitoring and IP blocking capabilities:
 * - List security events with filtering and pagination
 * - Get security statistics and trends
 * - Resolve security events
 * - Get events by IP address
 * - Block/unblock IP addresses
 * - Manage IP blocklist
 *
 * All procedures are protected with adminProcedure middleware
 */

// ========================================
// VALIDATION SCHEMAS
// ========================================

const listSecurityEventsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  severity: z.enum(["all", "critical", "high", "medium", "low"]).default("all"),
  eventType: z.string().optional(), // Filter by event type
  resolved: z.enum(["all", "resolved", "unresolved"]).default("all"),
  startDate: z.string().datetime().optional(), // ISO 8601 datetime
  endDate: z.string().datetime().optional(), // ISO 8601 datetime
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const resolveEventSchema = z.object({
  eventId: z.number().int().positive(),
  notes: z.string().optional(),
});

const getByIpSchema = z.object({
  ipAddress: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

const blockIpSchema = z.object({
  ipAddress: z.string().min(1),
  reason: z.string().min(1).max(500),
});

const unblockIpSchema = z.object({
  ipAddress: z.string().min(1),
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get or create the IP blocklist from system config
 */
async function getIpBlocklist(db: any): Promise<string[]> {
  const [config] = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.key, "ip_blocklist"))
    .limit(1);

  if (!config) {
    return [];
  }

  const value = config.value as { blockedIps: Array<{ ip: string; reason: string; blockedAt: string; blockedBy: number }> };
  return value.blockedIps?.map(item => item.ip) || [];
}

/**
 * Update the IP blocklist in system config
 */
async function updateIpBlocklist(
  db: any,
  blockedIps: Array<{ ip: string; reason: string; blockedAt: string; blockedBy: number }>
): Promise<void> {
  const [existing] = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.key, "ip_blocklist"))
    .limit(1);

  const configValue = {
    blockedIps,
    lastUpdated: new Date().toISOString(),
  };

  if (existing) {
    await db
      .update(systemConfig)
      .set({
        value: configValue,
        updatedAt: new Date(),
      })
      .where(eq(systemConfig.key, "ip_blocklist"));
  } else {
    await db.insert(systemConfig).values({
      key: "ip_blocklist",
      value: configValue,
      description: "List of blocked IP addresses for security",
      updatedAt: new Date(),
    });
  }
}

// ========================================
// ADMIN SECURITY ROUTER
// ========================================

export const securityRouter = router({
  /**
   * List security events with filtering
   */
  list: adminProcedure
    .input(listSecurityEventsSchema)
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

        // Filter by severity
        if (input.severity !== "all") {
          conditions.push(eq(securityEvents.severity, input.severity));
        }

        // Filter by event type
        if (input.eventType) {
          conditions.push(eq(securityEvents.eventType, input.eventType));
        }

        // Filter by resolved status
        if (input.resolved === "resolved") {
          conditions.push(eq(securityEvents.resolved, true));
        } else if (input.resolved === "unresolved") {
          conditions.push(eq(securityEvents.resolved, false));
        }

        // Date range filters
        if (input.startDate) {
          const startDate = new Date(input.startDate);
          if (isNaN(startDate.getTime())) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid startDate format",
            });
          }
          conditions.push(gte(securityEvents.createdAt, startDate));
        }

        if (input.endDate) {
          const endDate = new Date(input.endDate);
          if (isNaN(endDate.getTime())) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid endDate format",
            });
          }
          conditions.push(lte(securityEvents.createdAt, endDate));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const [totalResult] = await db
          .select({ count: count() })
          .from(securityEvents)
          .where(whereClause);

        const total = totalResult?.count || 0;

        // Get paginated events with user info
        const events = await db
          .select({
            id: securityEvents.id,
            userId: securityEvents.userId,
            eventType: securityEvents.eventType,
            severity: securityEvents.severity,
            description: securityEvents.description,
            metadata: securityEvents.metadata,
            ipAddress: securityEvents.ipAddress,
            userAgent: securityEvents.userAgent,
            geoLocation: securityEvents.geoLocation,
            resolved: securityEvents.resolved,
            resolvedBy: securityEvents.resolvedBy,
            resolvedAt: securityEvents.resolvedAt,
            notes: securityEvents.notes,
            createdAt: securityEvents.createdAt,
            userName: users.name,
            userEmail: users.email,
          })
          .from(securityEvents)
          .leftJoin(users, eq(securityEvents.userId, users.id))
          .where(whereClause)
          .orderBy(input.sortOrder === "asc" ? securityEvents.createdAt : desc(securityEvents.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          events,
          pagination: {
            total,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < total,
          },
          filters: {
            severity: input.severity,
            eventType: input.eventType,
            resolved: input.resolved,
            startDate: input.startDate,
            endDate: input.endDate,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("[Admin] Failed to list security events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list security events",
          cause: error,
        });
      }
    }),

  /**
   * Get security event statistics
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

        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Total events in last 24 hours
        const [total24h] = await db
          .select({ count: count() })
          .from(securityEvents)
          .where(gte(securityEvents.createdAt, last24Hours));

        // Critical alerts (unresolved critical events)
        const [criticalAlerts] = await db
          .select({ count: count() })
          .from(securityEvents)
          .where(
            and(
              eq(securityEvents.severity, "critical"),
              eq(securityEvents.resolved, false)
            )
          );

        // Resolved rate (total resolved / total events)
        const [totalEvents] = await db
          .select({ count: count() })
          .from(securityEvents);

        const [resolvedEvents] = await db
          .select({ count: count() })
          .from(securityEvents)
          .where(eq(securityEvents.resolved, true));

        const resolvedRate = totalEvents?.count
          ? ((resolvedEvents?.count || 0) / totalEvents.count) * 100
          : 0;

        // Counts by severity
        const bySeverity = await db
          .select({
            severity: securityEvents.severity,
            count: count(),
          })
          .from(securityEvents)
          .groupBy(securityEvents.severity);

        // Counts by event type
        const byType = await db
          .select({
            eventType: securityEvents.eventType,
            count: count(),
          })
          .from(securityEvents)
          .groupBy(securityEvents.eventType);

        // 24h trend (hourly counts)
        const trend24h = await db
          .select({
            hour: sql<string>`to_char(${securityEvents.createdAt}, 'YYYY-MM-DD HH24:00:00')`,
            count: count(),
          })
          .from(securityEvents)
          .where(gte(securityEvents.createdAt, last24Hours))
          .groupBy(sql`to_char(${securityEvents.createdAt}, 'YYYY-MM-DD HH24:00:00')`)
          .orderBy(sql`to_char(${securityEvents.createdAt}, 'YYYY-MM-DD HH24:00:00')`);

        // 7 day trend (daily counts)
        const trend7d = await db
          .select({
            day: sql<string>`to_char(${securityEvents.createdAt}, 'YYYY-MM-DD')`,
            count: count(),
          })
          .from(securityEvents)
          .where(gte(securityEvents.createdAt, last7Days))
          .groupBy(sql`to_char(${securityEvents.createdAt}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${securityEvents.createdAt}, 'YYYY-MM-DD')`);

        // Get blocked IPs count
        const blocklist = await getIpBlocklist(db);

        return {
          total24h: total24h?.count || 0,
          criticalAlerts: criticalAlerts?.count || 0,
          blockedIpsCount: blocklist.length,
          resolvedRate: Math.round(resolvedRate * 10) / 10, // Round to 1 decimal
          bySeverity: bySeverity.map(item => ({
            severity: item.severity || "unknown",
            count: item.count,
          })),
          byType: byType.map(item => ({
            eventType: item.eventType || "unknown",
            count: item.count,
          })),
          trend24h: trend24h.map(item => ({
            timestamp: item.hour,
            count: item.count,
          })),
          trend7d: trend7d.map(item => ({
            date: item.day,
            count: item.count,
          })),
        };
      } catch (error) {
        console.error("[Admin] Failed to get security stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get security statistics",
          cause: error,
        });
      }
    }),

  /**
   * Resolve a security event
   */
  resolve: adminProcedure
    .input(resolveEventSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Check if event exists
        const [event] = await db
          .select()
          .from(securityEvents)
          .where(eq(securityEvents.id, input.eventId))
          .limit(1);

        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Security event not found",
          });
        }

        // Check if already resolved
        if (event.resolved) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Event is already resolved",
          });
        }

        // Update event to mark as resolved
        const [updatedEvent] = await db
          .update(securityEvents)
          .set({
            resolved: true,
            resolvedBy: ctx.user.id,
            resolvedAt: new Date(),
            notes: input.notes || null,
          })
          .where(eq(securityEvents.id, input.eventId))
          .returning();

        console.log(`[Security] Event ${input.eventId} resolved by admin ${ctx.user.id}`);

        return {
          success: true,
          event: updatedEvent,
          message: "Security event resolved successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("[Admin] Failed to resolve security event:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resolve security event",
          cause: error,
        });
      }
    }),

  /**
   * Get all security events from a specific IP address
   */
  getByIp: adminProcedure
    .input(getByIpSchema)
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Get total count for this IP
        const [totalResult] = await db
          .select({ count: count() })
          .from(securityEvents)
          .where(eq(securityEvents.ipAddress, input.ipAddress));

        const total = totalResult?.count || 0;

        // Get paginated events
        const events = await db
          .select({
            id: securityEvents.id,
            userId: securityEvents.userId,
            eventType: securityEvents.eventType,
            severity: securityEvents.severity,
            description: securityEvents.description,
            metadata: securityEvents.metadata,
            ipAddress: securityEvents.ipAddress,
            userAgent: securityEvents.userAgent,
            geoLocation: securityEvents.geoLocation,
            resolved: securityEvents.resolved,
            resolvedBy: securityEvents.resolvedBy,
            resolvedAt: securityEvents.resolvedAt,
            notes: securityEvents.notes,
            createdAt: securityEvents.createdAt,
            userName: users.name,
            userEmail: users.email,
          })
          .from(securityEvents)
          .leftJoin(users, eq(securityEvents.userId, users.id))
          .where(eq(securityEvents.ipAddress, input.ipAddress))
          .orderBy(desc(securityEvents.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        // Check if IP is blocked
        const blocklist = await getIpBlocklist(db);
        const isBlocked = blocklist.includes(input.ipAddress);

        // Get severity breakdown
        const severityCounts = await db
          .select({
            severity: securityEvents.severity,
            count: count(),
          })
          .from(securityEvents)
          .where(eq(securityEvents.ipAddress, input.ipAddress))
          .groupBy(securityEvents.severity);

        return {
          ipAddress: input.ipAddress,
          isBlocked,
          events,
          pagination: {
            total,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < total,
          },
          stats: {
            totalEvents: total,
            bySeverity: severityCounts.map(item => ({
              severity: item.severity || "unknown",
              count: item.count,
            })),
          },
        };
      } catch (error) {
        console.error("[Admin] Failed to get events by IP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get events by IP address",
          cause: error,
        });
      }
    }),

  /**
   * Block an IP address
   */
  blockIp: adminProcedure
    .input(blockIpSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Get current blocklist
        const [config] = await db
          .select()
          .from(systemConfig)
          .where(eq(systemConfig.key, "ip_blocklist"))
          .limit(1);

        const currentValue = config?.value as { blockedIps: Array<{ ip: string; reason: string; blockedAt: string; blockedBy: number }> } | undefined;
        const currentBlocklist = currentValue?.blockedIps || [];

        // Check if IP is already blocked
        if (currentBlocklist.some(item => item.ip === input.ipAddress)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "IP address is already blocked",
          });
        }

        // Add IP to blocklist
        const updatedBlocklist = [
          ...currentBlocklist,
          {
            ip: input.ipAddress,
            reason: input.reason,
            blockedAt: new Date().toISOString(),
            blockedBy: ctx.user.id,
          },
        ];

        await updateIpBlocklist(db, updatedBlocklist);

        console.log(`[Security] IP ${input.ipAddress} blocked by admin ${ctx.user.id}. Reason: ${input.reason}`);

        return {
          success: true,
          message: "IP address blocked successfully",
          ipAddress: input.ipAddress,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("[Admin] Failed to block IP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to block IP address",
          cause: error,
        });
      }
    }),

  /**
   * Unblock an IP address
   */
  unblockIp: adminProcedure
    .input(unblockIpSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Get current blocklist
        const [config] = await db
          .select()
          .from(systemConfig)
          .where(eq(systemConfig.key, "ip_blocklist"))
          .limit(1);

        const currentValue = config?.value as { blockedIps: Array<{ ip: string; reason: string; blockedAt: string; blockedBy: number }> } | undefined;
        const currentBlocklist = currentValue?.blockedIps || [];

        // Check if IP is actually blocked
        if (!currentBlocklist.some(item => item.ip === input.ipAddress)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "IP address is not blocked",
          });
        }

        // Remove IP from blocklist
        const updatedBlocklist = currentBlocklist.filter(item => item.ip !== input.ipAddress);

        await updateIpBlocklist(db, updatedBlocklist);

        console.log(`[Security] IP ${input.ipAddress} unblocked by admin ${ctx.user.id}`);

        return {
          success: true,
          message: "IP address unblocked successfully",
          ipAddress: input.ipAddress,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("[Admin] Failed to unblock IP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unblock IP address",
          cause: error,
        });
      }
    }),

  /**
   * Get list of all blocked IP addresses
   */
  getBlockedIps: adminProcedure
    .query(async () => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Get blocklist from system config
        const [config] = await db
          .select()
          .from(systemConfig)
          .where(eq(systemConfig.key, "ip_blocklist"))
          .limit(1);

        if (!config) {
          return {
            blockedIps: [],
            total: 0,
          };
        }

        const value = config.value as { blockedIps: Array<{ ip: string; reason: string; blockedAt: string; blockedBy: number }> };
        const blockedIps = value.blockedIps || [];

        // Get admin names for each blocked IP
        const blockedIpsWithNames = await Promise.all(
          blockedIps.map(async (item) => {
            const [admin] = await db
              .select({
                name: users.name,
                email: users.email,
              })
              .from(users)
              .where(eq(users.id, item.blockedBy))
              .limit(1);

            return {
              ...item,
              blockedByName: admin?.name || "Unknown",
              blockedByEmail: admin?.email || "unknown@example.com",
            };
          })
        );

        return {
          blockedIps: blockedIpsWithNames,
          total: blockedIps.length,
        };
      } catch (error) {
        console.error("[Admin] Failed to get blocked IPs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get blocked IP addresses",
          cause: error,
        });
      }
    }),
});
