import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../db";
import { eq, and, desc } from "drizzle-orm";
import { Stagehand } from "@browserbasehq/stagehand";
import { getBrowserbaseService } from "../../_core/browserbase";

import { automationWorkflows, workflowExecutions, browserSessions } from "../../../drizzle/schema";
import {
  executeWorkflow,
  getExecutionStatus,
  cancelExecution,
} from "../../services/workflowExecution.service";

// Define Zod schemas for validation
const workflowStepSchema = z.object({
    type: z.enum([
        "navigate",
        "act",
        "observe",
        "extract",
        "wait",
        "condition",
        "loop",
        "apiCall",
        "notification"
    ]),
    order: z.number().int().min(0),
    config: z.object({
        // Navigation step
        url: z.string().optional(),

        // Action step (act)
        instruction: z.string().optional(),

        // Observation step (observe)
        observeInstruction: z.string().optional(),

        // Extraction step (extract)
        extractInstruction: z.string().optional(),
        schemaType: z.enum(["contactInfo", "productInfo", "custom"]).optional(),

        // Wait step
        waitMs: z.number().int().min(0).max(60000).optional(), // Max 60 seconds
        selector: z.string().optional(), // CSS selector to wait for

        // Condition step
        condition: z.string().optional(),

        // Loop step
        items: z.array(z.any()).optional(), // Array to iterate over

        // API Call step
        method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).optional(),
        headers: z.record(z.string(), z.string()).optional(),
        body: z.any().optional(),
        saveAs: z.string().optional(), // Variable name to save result

        // Notification step
        message: z.string().optional(),
        type: z.enum(["info", "success", "warning", "error"]).optional(),

        // Common config
        modelName: z.string().optional(),
        continueOnError: z.boolean().default(false),
    }),
});

const createWorkflowSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    trigger: z.enum(["manual", "scheduled", "webhook", "event"]).default("manual"),
    steps: z.array(workflowStepSchema).min(1).max(50), // Limit to 50 steps
    geolocation: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
});

const updateWorkflowSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    trigger: z.enum(["manual", "scheduled", "webhook", "event"]).optional(),
    status: z.enum(["active", "paused", "archived"]).optional(),
    steps: z.array(workflowStepSchema).min(1).max(50).optional(),
});

export const workflowsRouter = router({
    /**
     * Create a new workflow
     * Creates workflow and associated steps in a transaction
     */
    create: protectedProcedure
        .input(createWorkflowSchema)
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            const db = await getDb();
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database not initialized",
                });
            }

            try {
                const [workflow] = await db
                    .insert(automationWorkflows)
                    .values({
                        userId,
                        name: input.name,
                        description: input.description,
                        steps: input.steps,
                        isActive: true,
                    })
                    .returning();

                return workflow;
            } catch (error) {
                console.error("Failed to create workflow:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * List all workflows for the authenticated user
     * Returns workflows with step count
     */
    list: protectedProcedure
        .input(
            z.object({
                status: z.enum(["active", "paused", "archived"]).optional(),
                limit: z.number().int().min(1).max(100).default(50),
                offset: z.number().int().min(0).default(0),
            }).optional()
        )
        .query(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            const db = await getDb();
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database not initialized",
                });
            }

            const params = input || { limit: 50, offset: 0 };

            try {
                const conditions = [eq(automationWorkflows.userId, userId)];
                if (params.status === "active") {
                    conditions.push(eq(automationWorkflows.isActive, true));
                } else if (params.status === "archived") {
                    conditions.push(eq(automationWorkflows.isActive, false));
                }

                const workflowList = await db
                    .select()
                    .from(automationWorkflows)
                    .where(and(...conditions))
                    .orderBy(desc(automationWorkflows.createdAt))
                    .limit(params.limit)
                    .offset(params.offset);

                return workflowList.map(wf => ({
                    ...wf,
                    stepCount: Array.isArray(wf.steps) ? wf.steps.length : 0,
                }));
            } catch (error) {
                console.error("Failed to list workflows:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to list workflows: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Get a single workflow by ID with all steps
     * Includes full workflow configuration
     */
    get: protectedProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            const db = await getDb();
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database not initialized",
                });
            }

            try {
                const [workflow] = await db
                    .select()
                    .from(automationWorkflows)
                    .where(and(
                        eq(automationWorkflows.id, input.id),
                        eq(automationWorkflows.userId, userId)
                    ))
                    .limit(1);

                if (!workflow) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workflow not found",
                    });
                }

                return workflow;
            } catch (error) {
                console.error("Failed to get workflow:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to get workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Update an existing workflow
     * Can update metadata and steps
     */
    update: protectedProcedure
        .input(updateWorkflowSchema)
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            const db = await getDb();
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database not initialized",
                });
            }

            try {
                const [existing] = await db
                    .select()
                    .from(automationWorkflows)
                    .where(and(
                        eq(automationWorkflows.id, input.id),
                        eq(automationWorkflows.userId, userId)
                    ))
                    .limit(1);

                if (!existing) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workflow not found",
                    });
                }

                const updateData: Partial<typeof automationWorkflows.$inferInsert> = {
                    updatedAt: new Date(),
                };
                if (input.name !== undefined) updateData.name = input.name;
                if (input.description !== undefined) updateData.description = input.description;
                if (input.status !== undefined) updateData.isActive = input.status === "active";
                if (input.steps !== undefined) updateData.steps = input.steps;

                const [updated] = await db
                    .update(automationWorkflows)
                    .set(updateData)
                    .where(eq(automationWorkflows.id, input.id))
                    .returning();

                return updated;
            } catch (error) {
                console.error("Failed to update workflow:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to update workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Delete a workflow and all associated steps and executions
     * Soft delete by setting status to 'archived'
     */
    delete: protectedProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            const db = await getDb();
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database not initialized",
                });
            }

            try {
                const [existing] = await db
                    .select()
                    .from(automationWorkflows)
                    .where(and(
                        eq(automationWorkflows.id, input.id),
                        eq(automationWorkflows.userId, userId)
                    ))
                    .limit(1);

                if (!existing) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workflow not found",
                    });
                }

                // Soft delete by setting isActive to false
                await db
                    .update(automationWorkflows)
                    .set({
                        isActive: false,
                        updatedAt: new Date(),
                    })
                    .where(eq(automationWorkflows.id, input.id));

                return { success: true, id: input.id };
            } catch (error) {
                console.error("Failed to delete workflow:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to delete workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Execute a workflow
     * Creates a browser session, runs all steps sequentially, stores execution results
     */
    execute: protectedProcedure
        .input(
            z.object({
                workflowId: z.number().int().positive(),
                geolocation: z.object({
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                }).optional(),
                variables: z.record(z.string(), z.any()).optional(), // Dynamic variables for workflow
            })
        )
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            try {
                const result = await executeWorkflow({
                    workflowId: input.workflowId,
                    userId,
                    variables: input.variables,
                    geolocation: input.geolocation,
                });

                return {
                    success: true,
                    executionId: result.executionId,
                    workflowId: result.workflowId,
                    status: result.status,
                    stepResults: result.stepResults,
                    output: result.output,
                };
            } catch (error) {
                console.error("Workflow execution failed:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Workflow execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Get execution history for a workflow
     * Returns paginated list of executions with results
     */
    getExecutions: protectedProcedure
        .input(
            z.object({
                workflowId: z.number().int().positive(),
                status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
                limit: z.number().int().min(1).max(100).default(20),
                offset: z.number().int().min(0).default(0),
            })
        )
        .query(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            const db = await getDb();
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database not initialized",
                });
            }

            try {
                // Verify workflow ownership
                const [workflow] = await db
                    .select()
                    .from(automationWorkflows)
                    .where(and(
                        eq(automationWorkflows.id, input.workflowId),
                        eq(automationWorkflows.userId, userId)
                    ))
                    .limit(1);

                if (!workflow) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workflow not found",
                    });
                }

                // Fetch executions
                const conditions = [eq(workflowExecutions.workflowId, input.workflowId)];
                if (input.status) {
                    conditions.push(eq(workflowExecutions.status, input.status));
                }

                const executions = await db
                    .select()
                    .from(workflowExecutions)
                    .where(and(...conditions))
                    .orderBy(desc(workflowExecutions.startedAt))
                    .limit(input.limit)
                    .offset(input.offset);

                return executions;
            } catch (error) {
                console.error("Failed to get executions:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to get executions: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Get a single execution by ID
     * Returns detailed execution information including step results
     */
    getExecution: protectedProcedure
        .input(z.object({ executionId: z.number().int().positive() }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            try {
                const status = await getExecutionStatus(input.executionId);

                // Verify ownership
                const db = await getDb();
                if (!db) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Database not initialized",
                    });
                }

                const [execution] = await db
                    .select()
                    .from(workflowExecutions)
                    .where(and(
                        eq(workflowExecutions.id, input.executionId),
                        eq(workflowExecutions.userId, userId)
                    ))
                    .limit(1);

                if (!execution) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Execution not found",
                    });
                }

                return status;
            } catch (error) {
                console.error("Failed to get execution:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to get execution: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),

    /**
     * Cancel a running workflow execution
     */
    cancelExecution: protectedProcedure
        .input(z.object({ executionId: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.user.id;

            const db = await getDb();
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database not initialized",
                });
            }

            try {
                // Verify ownership
                const [execution] = await db
                    .select()
                    .from(workflowExecutions)
                    .where(and(
                        eq(workflowExecutions.id, input.executionId),
                        eq(workflowExecutions.userId, userId)
                    ))
                    .limit(1);

                if (!execution) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Execution not found",
                    });
                }

                await cancelExecution(input.executionId);

                return { success: true, executionId: input.executionId };
            } catch (error) {
                console.error("Failed to cancel execution:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to cancel execution: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        }),
});
