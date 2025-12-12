import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
    ai_call_campaigns,
    ai_calls,
    enrichedLeads as leads,
    lead_lists,
    InsertAiCallCampaign,
    InsertAiCall
} from "../../../drizzle/schema";
import { vapiService } from "../../services/vapi.service";
import { addVoiceCallJob } from "../../_core/queue";

/**
 * Voice Agent Router
 * Handles telephony integration, lead management, and call orchestration via Vapi.ai
 */
export const voiceRouter = router({
    /**
     * Get current voice campaign status
     */
    getStatus: publicProcedure.query(async () => {
        const db = await getDb();
        if (!db) {
            return {
                isConnected: false,
                phoneNumber: null,
                stats: {
                    totalCalls: 0,
                    activeCalls: 0,
                    completedToday: 0,
                    successRate: 0,
                },
            };
        }

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [totalCallsResult, activeCallsResult, completedTodayResult, successfulCallsResult] = await Promise.all([
                db.select({ count: sql<number>`count(*)::int` }).from(ai_calls),
                db.select({ count: sql<number>`count(*)::int` }).from(ai_calls).where(eq(ai_calls.status, "calling")),
                db.select({ count: sql<number>`count(*)::int` }).from(ai_calls).where(sql`${ai_calls.calledAt} >= ${today}`),
                db.select({ count: sql<number>`count(*)::int` }).from(ai_calls).where(eq(ai_calls.status, "completed")),
            ]);

            const totalCalls = totalCallsResult[0]?.count || 0;
            const successfulCalls = successfulCallsResult[0]?.count || 0;
            const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

            return {
                isConnected: !!process.env.VAPI_API_KEY,
                phoneNumber: process.env.VAPI_PHONE_NUMBER || null,
                stats: {
                    totalCalls,
                    activeCalls: activeCallsResult[0]?.count || 0,
                    completedToday: completedTodayResult[0]?.count || 0,
                    successRate: Math.round(successRate),
                },
            };
        } catch (error) {
            console.error("Error getting voice status:", error);
            throw new Error("Failed to get voice status");
        }
    }),

    /**
     * Get list of leads for calling
     */
    getLeads: publicProcedure
        .input(
            z.object({
                listId: z.number().optional(),
                enrichmentStatus: z.enum(["pending", "enriched", "failed", "skipped"]).optional(),
                limit: z.number().default(50),
                offset: z.number().default(0),
            })
        )
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                return { leads: [], total: 0 };
            }

            try {
                let query = db.select().from(leads);

                if (input.listId) {
                    query = query.where(eq(leads.listId, input.listId)) as any;
                }

                if (input.enrichmentStatus) {
                    query = query.where(eq(leads.enrichmentStatus, input.enrichmentStatus)) as any;
                }

                const results = await query
                    .limit(input.limit)
                    .offset(input.offset)
                    .orderBy(desc(leads.createdAt));

                const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(leads);
                const total = totalResult[0]?.count || 0;

                return {
                    leads: results,
                    total,
                };
            } catch (error) {
                console.error("Error getting leads:", error);
                throw new Error("Failed to get leads");
            }
        }),

    /**
     * Create a new campaign
     */
    createCampaign: publicProcedure
        .input(
            z.object({
                userId: z.number(),
                name: z.string().min(1),
                description: z.string().optional(),
                script: z.string().min(1),
                listId: z.number().optional(),
                settings: z.object({
                    voice: z.enum(["male", "female", "neutral"]).optional(),
                    speed: z.number().optional(),
                    language: z.string().optional(),
                    model: z.string().optional(),
                    temperature: z.number().optional(),
                    maxDuration: z.number().optional(),
                    recordCall: z.boolean().optional(),
                    transcribeCall: z.boolean().optional(),
                    detectVoicemail: z.boolean().optional(),
                }).optional(),
            })
        )
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                const campaignData: InsertAiCallCampaign = {
                    userId: input.userId,
                    name: input.name,
                    description: input.description,
                    script: input.script,
                    listId: input.listId,
                    settings: input.settings as any,
                    status: "draft",
                };

                const result = await db.insert(ai_call_campaigns).values(campaignData).returning();

                return {
                    success: true,
                    campaign: result[0],
                };
            } catch (error) {
                console.error("Error creating campaign:", error);
                throw new Error("Failed to create campaign");
            }
        }),

    /**
     * Get all campaigns
     */
    getCampaigns: publicProcedure
        .input(
            z.object({
                userId: z.number(),
                status: z.enum(["draft", "running", "paused", "completed", "cancelled"]).optional(),
                limit: z.number().default(50),
                offset: z.number().default(0),
            })
        )
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                return { campaigns: [], total: 0 };
            }

            try {
                let query = db.select().from(ai_call_campaigns).where(eq(ai_call_campaigns.userId, input.userId));

                if (input.status) {
                    query = query.where(and(
                        eq(ai_call_campaigns.userId, input.userId),
                        eq(ai_call_campaigns.status, input.status)
                    )) as any;
                }

                const results = await query
                    .limit(input.limit)
                    .offset(input.offset)
                    .orderBy(desc(ai_call_campaigns.createdAt));

                const totalResult = await db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(ai_call_campaigns)
                    .where(eq(ai_call_campaigns.userId, input.userId));
                const total = totalResult[0]?.count || 0;

                return {
                    campaigns: results,
                    total,
                };
            } catch (error) {
                console.error("Error getting campaigns:", error);
                throw new Error("Failed to get campaigns");
            }
        }),

    /**
     * Get a specific campaign with details
     */
    getCampaign: publicProcedure
        .input(z.object({
            campaignId: z.number(),
        }))
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                const campaign = await db
                    .select()
                    .from(ai_call_campaigns)
                    .where(eq(ai_call_campaigns.id, input.campaignId))
                    .limit(1);

                if (!campaign[0]) {
                    throw new Error("Campaign not found");
                }

                return campaign[0];
            } catch (error) {
                console.error("Error getting campaign:", error);
                throw new Error("Failed to get campaign");
            }
        }),

    /**
     * Start outbound calling campaign
     */
    startCampaign: publicProcedure
        .input(
            z.object({
                campaignId: z.number(),
                leadIds: z.array(z.number()).optional(),
            })
        )
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                // Get campaign details
                const campaign = await db
                    .select()
                    .from(ai_call_campaigns)
                    .where(eq(ai_call_campaigns.id, input.campaignId))
                    .limit(1);

                if (!campaign[0]) {
                    throw new Error("Campaign not found");
                }

                // Get leads to call
                let leadsToCall;
                if (input.leadIds && input.leadIds.length > 0) {
                    leadsToCall = await db
                        .select()
                        .from(leads)
                        .where(sql`${leads.id} = ANY(${input.leadIds})`);
                } else if (campaign[0].listId) {
                    leadsToCall = await db
                        .select()
                        .from(leads)
                        .where(eq(leads.listId, campaign[0].listId));
                } else {
                    throw new Error("No leads specified for campaign");
                }

                if (leadsToCall.length === 0) {
                    throw new Error("No leads found for campaign");
                }

                // Update campaign status
                await db
                    .update(ai_call_campaigns)
                    .set({
                        status: "running",
                        startedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(ai_call_campaigns.id, input.campaignId));

                // Queue calls
                const jobIds: string[] = [];
                for (const lead of leadsToCall) {
                    const phoneNumber = (lead.rawData as any)?.phone || (lead.enrichedData as any)?.phone;
                    if (!phoneNumber) {
                        console.warn(`Lead ${lead.id} has no phone number, skipping`);
                        continue;
                    }

                    // Create call record
                    const callResult = await db.insert(ai_calls).values({
                        campaignId: input.campaignId,
                        userId: campaign[0].userId,
                        leadId: lead.id,
                        phoneNumber,
                        status: "pending",
                    } as InsertAiCall).returning();

                    const call = callResult[0];

                    // Add to queue
                    const job = await addVoiceCallJob({
                        userId: campaign[0].userId.toString(),
                        callId: call.id.toString(),
                        phoneNumber,
                        metadata: {
                            campaignId: input.campaignId,
                            leadId: lead.id,
                            script: campaign[0].script,
                            settings: campaign[0].settings,
                        },
                    });

                    jobIds.push(job.id || "");
                }

                return {
                    success: true,
                    message: `Queued ${jobIds.length} calls`,
                    jobIds,
                };
            } catch (error) {
                console.error("Error starting campaign:", error);
                throw new Error("Failed to start campaign");
            }
        }),

    /**
     * Pause a campaign
     */
    pauseCampaign: publicProcedure
        .input(z.object({
            campaignId: z.number(),
        }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                await db
                    .update(ai_call_campaigns)
                    .set({
                        status: "paused",
                        updatedAt: new Date(),
                    })
                    .where(eq(ai_call_campaigns.id, input.campaignId));

                return {
                    success: true,
                    message: "Campaign paused",
                };
            } catch (error) {
                console.error("Error pausing campaign:", error);
                throw new Error("Failed to pause campaign");
            }
        }),

    /**
     * Get campaign statistics
     */
    getCampaignStats: publicProcedure
        .input(z.object({
            campaignId: z.number(),
        }))
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                const campaign = await db
                    .select()
                    .from(ai_call_campaigns)
                    .where(eq(ai_call_campaigns.id, input.campaignId))
                    .limit(1);

                if (!campaign[0]) {
                    throw new Error("Campaign not found");
                }

                return {
                    callsMade: campaign[0].callsMade,
                    callsSuccessful: campaign[0].callsSuccessful,
                    callsFailed: campaign[0].callsFailed,
                    callsAnswered: campaign[0].callsAnswered,
                    totalDuration: campaign[0].totalDuration,
                    costInCredits: campaign[0].costInCredits,
                };
            } catch (error) {
                console.error("Error getting campaign stats:", error);
                throw new Error("Failed to get campaign stats");
            }
        }),

    /**
     * Make a single call
     */
    makeCall: publicProcedure
        .input(
            z.object({
                userId: z.number(),
                phoneNumber: z.string(),
                script: z.string(),
                settings: z.object({
                    voice: z.enum(["male", "female", "neutral"]).optional(),
                    speed: z.number().optional(),
                    language: z.string().optional(),
                    model: z.string().optional(),
                    temperature: z.number().optional(),
                    maxDuration: z.number().optional(),
                    recordCall: z.boolean().optional(),
                    transcribeCall: z.boolean().optional(),
                    detectVoicemail: z.boolean().optional(),
                }).optional(),
            })
        )
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                // Create a temporary campaign for single call
                const campaignResult = await db.insert(ai_call_campaigns).values({
                    userId: input.userId,
                    name: `Single Call - ${input.phoneNumber}`,
                    script: input.script,
                    settings: input.settings as any,
                    status: "running",
                    startedAt: new Date(),
                } as InsertAiCallCampaign).returning();

                const campaign = campaignResult[0];

                // Create call record
                const callResult = await db.insert(ai_calls).values({
                    campaignId: campaign.id,
                    userId: input.userId,
                    phoneNumber: input.phoneNumber,
                    status: "pending",
                } as InsertAiCall).returning();

                const call = callResult[0];

                // Add to queue
                const job = await addVoiceCallJob({
                    userId: input.userId.toString(),
                    callId: call.id.toString(),
                    phoneNumber: input.phoneNumber,
                    metadata: {
                        campaignId: campaign.id,
                        script: input.script,
                        settings: input.settings,
                    },
                });

                return {
                    success: true,
                    callId: call.id,
                    jobId: job.id,
                };
            } catch (error) {
                console.error("Error making call:", error);
                throw new Error("Failed to make call");
            }
        }),

    /**
     * Get call status
     */
    getCallStatus: publicProcedure
        .input(z.object({
            callId: z.number(),
        }))
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                const call = await db
                    .select()
                    .from(ai_calls)
                    .where(eq(ai_calls.id, input.callId))
                    .limit(1);

                if (!call[0]) {
                    throw new Error("Call not found");
                }

                // If call has a Vapi ID and is not completed, fetch latest status
                if (call[0].vapiCallId && call[0].status !== "completed" && call[0].status !== "failed") {
                    try {
                        const vapiStatus = await vapiService.getCallStatus(call[0].vapiCallId);

                        // Update database with latest status
                        await db
                            .update(ai_calls)
                            .set({
                                status: vapiStatus.status,
                                duration: vapiStatus.duration,
                                outcome: vapiStatus.outcome,
                                transcript: vapiStatus.transcript,
                                recordingUrl: vapiStatus.recordingUrl,
                                error: vapiStatus.error,
                                completedAt: vapiStatus.status === "completed" ? new Date() : null,
                            })
                            .where(eq(ai_calls.id, input.callId));

                        return { ...call[0], ...vapiStatus };
                    } catch (error) {
                        console.error("Error fetching Vapi status:", error);
                    }
                }

                return call[0];
            } catch (error) {
                console.error("Error getting call status:", error);
                throw new Error("Failed to get call status");
            }
        }),

    /**
     * Get call transcript
     */
    getCallTranscript: publicProcedure
        .input(z.object({
            callId: z.number(),
        }))
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            try {
                const call = await db
                    .select()
                    .from(ai_calls)
                    .where(eq(ai_calls.id, input.callId))
                    .limit(1);

                if (!call[0]) {
                    throw new Error("Call not found");
                }

                // If no transcript in DB but has Vapi ID, fetch from Vapi
                if (!call[0].transcript && call[0].vapiCallId) {
                    try {
                        const transcript = await vapiService.getTranscript(call[0].vapiCallId);

                        // Update database
                        await db
                            .update(ai_calls)
                            .set({ transcript })
                            .where(eq(ai_calls.id, input.callId));

                        return { transcript };
                    } catch (error) {
                        console.error("Error fetching transcript:", error);
                    }
                }

                return { transcript: call[0].transcript || "" };
            } catch (error) {
                console.error("Error getting call transcript:", error);
                throw new Error("Failed to get call transcript");
            }
        }),

    /**
     * List calls with filters
     */
    listCalls: publicProcedure
        .input(
            z.object({
                userId: z.number(),
                campaignId: z.number().optional(),
                status: z.enum(["pending", "calling", "answered", "no_answer", "failed", "completed"]).optional(),
                limit: z.number().default(50),
                offset: z.number().default(0),
            })
        )
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) {
                return { calls: [], total: 0 };
            }

            try {
                let query = db.select().from(ai_calls).where(eq(ai_calls.userId, input.userId));

                const conditions = [eq(ai_calls.userId, input.userId)];

                if (input.campaignId) {
                    conditions.push(eq(ai_calls.campaignId, input.campaignId));
                }

                if (input.status) {
                    conditions.push(eq(ai_calls.status, input.status));
                }

                if (conditions.length > 1) {
                    query = query.where(and(...conditions)) as any;
                }

                const results = await query
                    .limit(input.limit)
                    .offset(input.offset)
                    .orderBy(desc(ai_calls.calledAt));

                const totalResult = await db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(ai_calls)
                    .where(eq(ai_calls.userId, input.userId));
                const total = totalResult[0]?.count || 0;

                return {
                    calls: results,
                    total,
                };
            } catch (error) {
                console.error("Error listing calls:", error);
                throw new Error("Failed to list calls");
            }
        }),
});
