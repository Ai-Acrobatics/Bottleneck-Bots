import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../db";
import { eq, desc } from "drizzle-orm";
import { clientProfiles } from "../../../drizzle/schema";
import { ghlAutomation } from "../../services/stagehand.service";
import {
  subAccountMetricsService,
  type SubAccountOperationMetrics,
  type SubAccountMetricsSummary,
} from "../../services/subAccountMetrics.service";

/**
 * Sub-Account Management API Router
 * Task 3.1 - Sub-Account Creation and Setup
 *
 * Provides comprehensive sub-account automation for GoHighLevel:
 * - Create new sub-accounts with full configuration
 * - Switch between sub-accounts
 * - List available sub-accounts
 * - Track operation metrics and costs
 *
 * Features:
 * - AI-powered browser automation via Stagehand
 * - Real-time progress tracking
 * - Cost estimation and monitoring
 * - Anomaly detection
 */

// ========================================
// VALIDATION SCHEMAS
// ========================================

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const brandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  companyName: z.string().optional(),
});

const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "user"]).default("user"),
});

const createSubAccountSchema = z.object({
  businessName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  address: addressSchema.optional(),
  branding: brandingSchema.optional(),
  users: z.array(userSchema).optional(),
  templateSnapshot: z.string().optional(),
  // Link to client profile
  clientProfileId: z.number().int().positive().optional(),
});

const switchSubAccountSchema = z.object({
  subAccountId: z.string().min(1),
});

const listSubAccountsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const getOperationSchema = z.object({
  operationId: z.string().min(1),
});

const getMetricsSchema = z.object({
  userId: z.number().int().positive().optional(),
});

// ========================================
// ROUTER DEFINITION
// ========================================

export const subAccountsRouter = router({
  /**
   * Create a new sub-account in GoHighLevel
   *
   * This is a complex, multi-step automation that:
   * 1. Creates a browser session
   * 2. Navigates to GoHighLevel
   * 3. Logs in (if needed)
   * 4. Creates the sub-account
   * 5. Configures branding
   * 6. Sets up users
   * 7. Imports templates
   *
   * Complexity: Level 4 (Advanced)
   * Estimated time: 15-30 minutes
   * Estimated cost: $0.30-$0.50
   */
  create: protectedProcedure
    .input(createSubAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not initialized",
        });
      }

      // Start metrics tracking
      const operationId = subAccountMetricsService.startOperation(
        "create",
        userId,
        `session_${Date.now()}`,
        {
          businessName: input.businessName,
          email: input.email,
          hasUsers: !!input.users?.length,
          hasTemplate: !!input.templateSnapshot,
        }
      );

      try {
        console.log(`[SubAccounts] Creating sub-account: ${input.businessName}`);

        // Execute the automation
        const result = await ghlAutomation.createSubAccount(
          `session_${Date.now()}`,
          {
            businessName: input.businessName,
            email: input.email,
            phone: input.phone,
            timezone: input.timezone,
            address: input.address,
            branding: input.branding,
            users: input.users,
            templateSnapshot: input.templateSnapshot,
          }
        );

        // Record steps from result
        if (result.steps) {
          for (const step of result.steps) {
            subAccountMetricsService.recordStep(
              operationId,
              step.step,
              step.success,
              step.duration
            );
          }
        }

        if (result.success && result.subAccountId) {
          // Complete the operation successfully
          subAccountMetricsService.completeOperation(operationId, true, {
            subAccountId: result.subAccountId,
            subAccountName: result.subAccountName,
          });

          // Update client profile if provided
          if (input.clientProfileId) {
            await db
              .update(clientProfiles)
              .set({
                subaccountId: result.subAccountId,
                subaccountName: result.subAccountName,
                updatedAt: new Date(),
              })
              .where(eq(clientProfiles.id, input.clientProfileId));
          }

          console.log(`[SubAccounts] Sub-account created successfully: ${result.subAccountId}`);

          return {
            success: true,
            operationId,
            subAccountId: result.subAccountId,
            subAccountName: result.subAccountName,
            steps: result.steps,
            message: `Sub-account "${input.businessName}" created successfully`,
          };
        } else {
          // Complete the operation with failure
          subAccountMetricsService.completeOperation(operationId, false, {
            errorMessage: result.error || "Unknown error occurred",
          });

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Failed to create sub-account",
          });
        }
      } catch (error) {
        // Ensure operation is marked as failed
        subAccountMetricsService.completeOperation(operationId, false, {
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });

        console.error("[SubAccounts] Failed to create sub-account:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create sub-account: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Switch to a different sub-account
   */
  switch: protectedProcedure
    .input(switchSubAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Start metrics tracking
      const operationId = subAccountMetricsService.startOperation(
        "switch",
        userId,
        `session_${Date.now()}`,
        { targetSubAccountId: input.subAccountId }
      );

      try {
        console.log(`[SubAccounts] Switching to sub-account: ${input.subAccountId}`);

        const result = await ghlAutomation.switchToSubAccount(
          `session_${Date.now()}`,
          input.subAccountId
        );

        subAccountMetricsService.completeOperation(operationId, result.success, {
          subAccountId: input.subAccountId,
          errorMessage: result.error,
        });

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Failed to switch sub-account",
          });
        }

        return {
          success: true,
          operationId,
          subAccountId: input.subAccountId,
          message: "Switched to sub-account successfully",
        };
      } catch (error) {
        subAccountMetricsService.completeOperation(operationId, false, {
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });

        console.error("[SubAccounts] Failed to switch sub-account:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to switch sub-account: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * List available sub-accounts
   */
  list: protectedProcedure
    .input(listSubAccountsSchema.optional())
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const params = input || { limit: 20, offset: 0 };

      // Start metrics tracking
      const operationId = subAccountMetricsService.startOperation(
        "list",
        userId,
        `session_${Date.now()}`,
        { limit: params.limit, offset: params.offset }
      );

      try {
        console.log(`[SubAccounts] Listing sub-accounts (limit: ${params.limit}, offset: ${params.offset})`);

        const result = await ghlAutomation.listSubAccounts(`session_${Date.now()}`);

        subAccountMetricsService.completeOperation(operationId, result.success);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Failed to list sub-accounts",
          });
        }

        // Apply pagination
        const paginatedAccounts = result.subAccounts?.slice(
          params.offset,
          params.offset + params.limit
        ) || [];

        return {
          success: true,
          operationId,
          subAccounts: paginatedAccounts,
          total: result.subAccounts?.length || 0,
          limit: params.limit,
          offset: params.offset,
        };
      } catch (error) {
        subAccountMetricsService.completeOperation(operationId, false, {
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });

        console.error("[SubAccounts] Failed to list sub-accounts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list sub-accounts: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get operation details by ID
   */
  getOperation: protectedProcedure
    .input(getOperationSchema)
    .query(async ({ input }) => {
      const operation = subAccountMetricsService.getOperation(input.operationId);

      if (!operation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Operation not found: ${input.operationId}`,
        });
      }

      return operation;
    }),

  /**
   * Get active operations
   */
  getActiveOperations: protectedProcedure.query(async () => {
    return subAccountMetricsService.getActiveOperations();
  }),

  /**
   * Get metrics summary
   */
  getMetrics: protectedProcedure
    .input(getMetricsSchema.optional())
    .query(async ({ input, ctx }) => {
      const userId = input?.userId || ctx.user.id;
      return subAccountMetricsService.getSummary(userId);
    }),

  /**
   * Detect anomalies in operations
   */
  detectAnomalies: protectedProcedure.query(async () => {
    return subAccountMetricsService.detectAnomalies();
  }),

  /**
   * Export Prometheus metrics
   */
  exportPrometheus: protectedProcedure.query(async () => {
    return {
      contentType: "text/plain; charset=utf-8",
      metrics: subAccountMetricsService.exportPrometheusMetrics(),
    };
  }),

  /**
   * Get sub-accounts linked to client profiles from database
   */
  getLinkedSubAccounts: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const params = input || { limit: 20, offset: 0 };

      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not initialized",
        });
      }

      try {
        const profiles = await db
          .select({
            id: clientProfiles.id,
            name: clientProfiles.name,
            subaccountId: clientProfiles.subaccountId,
            subaccountName: clientProfiles.subaccountName,
            createdAt: clientProfiles.createdAt,
            updatedAt: clientProfiles.updatedAt,
          })
          .from(clientProfiles)
          .orderBy(desc(clientProfiles.updatedAt))
          .limit(params.limit)
          .offset(params.offset);

        // Filter to only those with sub-accounts
        const linkedProfiles = profiles.filter(p => p.subaccountId);

        return {
          success: true,
          linkedSubAccounts: linkedProfiles,
          total: linkedProfiles.length,
          limit: params.limit,
          offset: params.offset,
        };
      } catch (error) {
        console.error("[SubAccounts] Failed to get linked sub-accounts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get linked sub-accounts: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Estimate cost for creating a sub-account
   */
  estimateCost: protectedProcedure
    .input(
      z.object({
        hasUsers: z.boolean().default(false),
        userCount: z.number().int().min(0).default(0),
        hasTemplate: z.boolean().default(false),
        hasBranding: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      // Base cost for sub-account creation
      let estimatedMinutes = 15;
      let estimatedCost = 0.30;

      // Add time for users (2 min per user)
      if (input.hasUsers && input.userCount > 0) {
        estimatedMinutes += input.userCount * 2;
        estimatedCost += input.userCount * 0.02;
      }

      // Add time for template import (5 min)
      if (input.hasTemplate) {
        estimatedMinutes += 5;
        estimatedCost += 0.05;
      }

      // Add time for branding (3 min)
      if (input.hasBranding) {
        estimatedMinutes += 3;
        estimatedCost += 0.03;
      }

      return {
        estimatedMinutes,
        estimatedCost: parseFloat(estimatedCost.toFixed(2)),
        breakdown: {
          base: { minutes: 15, cost: 0.30 },
          users: input.hasUsers
            ? { minutes: input.userCount * 2, cost: input.userCount * 0.02 }
            : null,
          template: input.hasTemplate ? { minutes: 5, cost: 0.05 } : null,
          branding: input.hasBranding ? { minutes: 3, cost: 0.03 } : null,
        },
      };
    }),
});
