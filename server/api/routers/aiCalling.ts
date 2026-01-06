import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import { ai_call_campaigns, ai_calls, leads, lead_lists } from "../../../drizzle/schema-lead-enrichment";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { VapiService } from "../../services/vapi.service";
import { CreditService } from "../../services/credit.service";

/**
 * AI Calling Router
 * Manages AI-powered phone call campaigns via Vapi.ai
 *
 * Features:
 * - Create and manage call campaigns
 * - Configure call scripts and settings
 * - Execute calls to leads
 * - Track call status, outcomes, and recordings
 * - Call analytics and reporting
 *
 * All procedures require authentication via protectedProcedure
 */

// ========================================
// VALIDATION SCHEMAS
// ========================================

const campaignStatusEnum = z.enum(["draft", "running", "paused", "completed", "cancelled"]);
const callStatusEnum = z.enum(["pending", "calling", "answered", "no_answer", "failed", "completed"]);
const callOutcomeEnum = z.enum([
  "interested",
  "not_interested",
  "callback",
  "voicemail",
  "no_answer",
  "hung_up",
]);

const createCampaignSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().optional(),
  listId: z.number().int().optional(),
  script: z.string().min(1),
  settings: z
    .object({
      voice: z.enum(["male", "female", "neutral"]).default("female"),
      speed: z.number().min(0.5).max(2.0).default(1.0),
      language: z.string().default("en-US"),
      model: z.string().default("gpt-4"),
      temperature: z.number().min(0).max(1).default(0.7),
      maxDuration: z.number().int().positive().default(300), // 5 minutes
      recordCall: z.boolean().default(true),
      transcribeCall: z.boolean().default(true),
      detectVoicemail: z.boolean().default(true),
    })
    .optional(),
});

const updateCampaignSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  script: z.string().min(1).optional(),
  settings: z
    .object({
      voice: z.enum(["male", "female", "neutral"]).optional(),
      speed: z.number().min(0.5).max(2.0).optional(),
      language: z.string().optional(),
      model: z.string().optional(),
      temperature: z.number().min(0).max(1).optional(),
      maxDuration: z.number().int().positive().optional(),
      recordCall: z.boolean().optional(),
      transcribeCall: z.boolean().optional(),
      detectVoicemail: z.boolean().optional(),
    })
    .optional(),
});

const makeCallSchema = z.object({
  campaignId: z.number().int(),
  leadId: z.number().int(),
});

const updateCallSchema = z.object({
  callId: z.number().int(),
  outcome: callOutcomeEnum.optional(),
  notes: z.string().optional(),
});

// ========================================
// AI CALLING ROUTER
// ========================================

export const aiCallingRouter = router({
  /**
   * Create a new AI call campaign
   */
  createCampaign: protectedProcedure
    .input(createCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // If listId provided, verify it exists
      if (input.listId) {
        const listResult = await db
          .select()
          .from(lead_lists)
          .where(and(eq(lead_lists.id, input.listId), eq(lead_lists.userId, userId)))
          .limit(1);

        if (listResult.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead list not found",
          });
        }
      }

      // Create campaign
      const result = await db
        .insert(ai_call_campaigns)
        .values({
          userId,
          listId: input.listId,
          name: input.name,
          description: input.description,
          script: input.script,
          status: "draft",
          callsMade: 0,
          callsSuccessful: 0,
          callsFailed: 0,
          callsAnswered: 0,
          totalDuration: 0,
          costInCredits: 0,
          settings: input.settings || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return result[0];
    }),

  /**
   * Get all campaigns for user
   */
  getCampaigns: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(50),
        offset: z.number().int().nonnegative().default(0),
        status: campaignStatusEnum.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      let query = db
        .select()
        .from(ai_call_campaigns)
        .where(eq(ai_call_campaigns.userId, userId))
        .orderBy(desc(ai_call_campaigns.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      if (input.status) {
        query = db
          .select()
          .from(ai_call_campaigns)
          .where(and(eq(ai_call_campaigns.userId, userId), eq(ai_call_campaigns.status, input.status)))
          .orderBy(desc(ai_call_campaigns.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      }

      const campaigns = await query;

      // Get total count
      const [{ total }] = await db
        .select({ total: count() })
        .from(ai_call_campaigns)
        .where(eq(ai_call_campaigns.userId, userId));

      return {
        campaigns,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Get a single campaign by ID
   */
  getCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const result = await db
        .select()
        .from(ai_call_campaigns)
        .where(and(eq(ai_call_campaigns.id, input.campaignId), eq(ai_call_campaigns.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      return result[0];
    }),

  /**
   * Update a campaign
   */
  updateCampaign: protectedProcedure
    .input(updateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify ownership
      const campaignResult = await db
        .select()
        .from(ai_call_campaigns)
        .where(and(eq(ai_call_campaigns.id, input.id), eq(ai_call_campaigns.userId, userId)))
        .limit(1);

      if (campaignResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.script !== undefined) updateData.script = input.script;
      if (input.settings !== undefined) {
        // Merge settings
        updateData.settings = {
          ...(campaignResult[0].settings as any),
          ...input.settings,
        };
      }

      const result = await db
        .update(ai_call_campaigns)
        .set(updateData)
        .where(eq(ai_call_campaigns.id, input.id))
        .returning();

      return result[0];
    }),

  /**
   * Start a campaign
   */
  startCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify campaign exists
      const campaignResult = await db
        .select()
        .from(ai_call_campaigns)
        .where(and(eq(ai_call_campaigns.id, input.campaignId), eq(ai_call_campaigns.userId, userId)))
        .limit(1);

      if (campaignResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      const campaign = campaignResult[0];

      if (campaign.status === "running") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Campaign is already running",
        });
      }

      // Update status
      await db
        .update(ai_call_campaigns)
        .set({
          status: "running",
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ai_call_campaigns.id, input.campaignId));

      return { success: true };
    }),

  /**
   * Pause a campaign
   */
  pauseCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify ownership
      const campaignResult = await db
        .select()
        .from(ai_call_campaigns)
        .where(and(eq(ai_call_campaigns.id, input.campaignId), eq(ai_call_campaigns.userId, userId)))
        .limit(1);

      if (campaignResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      await db
        .update(ai_call_campaigns)
        .set({
          status: "paused",
          updatedAt: new Date(),
        })
        .where(eq(ai_call_campaigns.id, input.campaignId));

      return { success: true };
    }),

  /**
   * Make a call to a lead
   */
  makeCall: protectedProcedure
    .input(makeCallSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get campaign
      const campaignResult = await db
        .select()
        .from(ai_call_campaigns)
        .where(and(eq(ai_call_campaigns.id, input.campaignId), eq(ai_call_campaigns.userId, userId)))
        .limit(1);

      if (campaignResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      const campaign = campaignResult[0];

      // Get lead
      const leadResult = await db
        .select()
        .from(leads)
        .where(and(eq(leads.id, input.leadId), eq(leads.userId, userId)))
        .limit(1);

      if (leadResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        });
      }

      const lead = leadResult[0];

      // Get phone number from enriched data or raw data
      const phoneNumber =
        (lead.enrichedData as any)?.phone ||
        (lead.rawData as any)?.phone ||
        (lead.rawData as any)?.phoneNumber;

      if (!phoneNumber) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Lead has no phone number",
        });
      }

      // Check credits
      const creditService = new CreditService();
      const hasCredits = await creditService.checkBalance(userId, "calling", 1);

      if (!hasCredits) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Insufficient calling credits",
        });
      }

      // Initiate call via Vapi
      const vapiService = new VapiService();

      try {
        const callResponse = await vapiService.createCall(
          phoneNumber,
          campaign.script || "",
          campaign.settings as any
        );

        // Create call record
        const callRecord = await db
          .insert(ai_calls)
          .values({
            campaignId: input.campaignId,
            leadId: input.leadId,
            userId,
            phoneNumber,
            status: "calling",
            vapiCallId: callResponse.callId,
            creditsUsed: 1,
            calledAt: new Date(),
          })
          .returning();

        // Deduct credits
        await creditService.deductCredits(
          userId,
          1,
          "calling",
          `AI call to ${phoneNumber}`,
          callRecord[0].id.toString(),
          "ai_call"
        );

        // Update campaign stats
        await db
          .update(ai_call_campaigns)
          .set({
            callsMade: sql`${ai_call_campaigns.callsMade} + 1`,
            costInCredits: sql`${ai_call_campaigns.costInCredits} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(ai_call_campaigns.id, input.campaignId));

        return {
          success: true,
          call: callRecord[0],
        };
      } catch (error: any) {
        // Record failed call
        const callRecord = await db
          .insert(ai_calls)
          .values({
            campaignId: input.campaignId,
            leadId: input.leadId,
            userId,
            phoneNumber,
            status: "failed",
            error: error.message,
            calledAt: new Date(),
          })
          .returning();

        // Update campaign stats
        await db
          .update(ai_call_campaigns)
          .set({
            callsFailed: sql`${ai_call_campaigns.callsFailed} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(ai_call_campaigns.id, input.campaignId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Call failed: ${error.message}`,
        });
      }
    }),

  /**
   * Get calls for a campaign
   */
  getCalls: protectedProcedure
    .input(
      z.object({
        campaignId: z.number().int(),
        limit: z.number().int().positive().default(50),
        offset: z.number().int().nonnegative().default(0),
        status: callStatusEnum.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify campaign ownership
      const campaignResult = await db
        .select()
        .from(ai_call_campaigns)
        .where(and(eq(ai_call_campaigns.id, input.campaignId), eq(ai_call_campaigns.userId, userId)))
        .limit(1);

      if (campaignResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      let query = db
        .select()
        .from(ai_calls)
        .where(eq(ai_calls.campaignId, input.campaignId))
        .orderBy(desc(ai_calls.calledAt))
        .limit(input.limit)
        .offset(input.offset);

      if (input.status) {
        query = db
          .select()
          .from(ai_calls)
          .where(and(eq(ai_calls.campaignId, input.campaignId), eq(ai_calls.status, input.status)))
          .orderBy(desc(ai_calls.calledAt))
          .limit(input.limit)
          .offset(input.offset);
      }

      const calls = await query;

      // Get total count
      const [{ total }] = await db
        .select({ total: count() })
        .from(ai_calls)
        .where(eq(ai_calls.campaignId, input.campaignId));

      return {
        calls,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Get a single call by ID
   */
  getCall: protectedProcedure
    .input(z.object({ callId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const result = await db
        .select()
        .from(ai_calls)
        .where(and(eq(ai_calls.id, input.callId), eq(ai_calls.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Call not found",
        });
      }

      return result[0];
    }),

  /**
   * Update call details (outcome, notes)
   */
  updateCall: protectedProcedure
    .input(updateCallSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify ownership
      const callResult = await db
        .select()
        .from(ai_calls)
        .where(and(eq(ai_calls.id, input.callId), eq(ai_calls.userId, userId)))
        .limit(1);

      if (callResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Call not found",
        });
      }

      const updateData: any = {};

      if (input.outcome !== undefined) updateData.outcome = input.outcome;
      if (input.notes !== undefined) updateData.notes = input.notes;

      const result = await db
        .update(ai_calls)
        .set(updateData)
        .where(eq(ai_calls.id, input.callId))
        .returning();

      return result[0];
    }),

  /**
   * Sync call status from Vapi
   */
  syncCallStatus: protectedProcedure
    .input(z.object({ callId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get call
      const callResult = await db
        .select()
        .from(ai_calls)
        .where(and(eq(ai_calls.id, input.callId), eq(ai_calls.userId, userId)))
        .limit(1);

      if (callResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Call not found",
        });
      }

      const call = callResult[0];

      if (!call.vapiCallId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Call has no Vapi call ID",
        });
      }

      // Get status from Vapi
      const vapiService = new VapiService();

      try {
        const status = await vapiService.getCallStatus(call.vapiCallId);

        // Update call record
        await db
          .update(ai_calls)
          .set({
            status: status.status as any,
            duration: status.duration,
            outcome: status.outcome as any,
            transcript: status.transcript,
            recordingUrl: status.recordingUrl,
          })
          .where(eq(ai_calls.id, input.callId));

        // Update campaign stats if call completed
        if (status.status === "completed") {
          await db
            .update(ai_call_campaigns)
            .set({
              callsSuccessful: sql`${ai_call_campaigns.callsSuccessful} + 1`,
              totalDuration: sql`${ai_call_campaigns.totalDuration} + ${status.duration || 0}`,
            })
            .where(eq(ai_call_campaigns.id, call.campaignId));
        }

        if (status.status === "answered") {
          await db
            .update(ai_call_campaigns)
            .set({
              callsAnswered: sql`${ai_call_campaigns.callsAnswered} + 1`,
            })
            .where(eq(ai_call_campaigns.id, call.campaignId));
        }

        return {
          success: true,
          status,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync call status: ${error.message}`,
        });
      }
    }),

  /**
   * Delete a campaign
   */
  deleteCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify ownership
      const campaignResult = await db
        .select()
        .from(ai_call_campaigns)
        .where(and(eq(ai_call_campaigns.id, input.campaignId), eq(ai_call_campaigns.userId, userId)))
        .limit(1);

      if (campaignResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      // Delete campaign (cascade will delete calls)
      await db.delete(ai_call_campaigns).where(eq(ai_call_campaigns.id, input.campaignId));

      return { success: true };
    }),
});
