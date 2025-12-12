/**
 * Voice Worker
 * Processes voice call background jobs using Vapi
 */

import { Worker, Job } from "bullmq";
import { JobType, VoiceCallJobData } from "../_core/queue";
import { getRedisConnection } from "./utils";
import { vapiService } from "../services/vapi.service";
import { getDb } from "../db";
import { eq, sql } from "drizzle-orm";
import { ai_calls, ai_call_campaigns } from "../../drizzle/schema";
import type { Database } from "../db";

/**
 * Process VOICE_CALL jobs
 * Initiates and manages voice calls via Vapi
 */
async function processVoiceCall(job: Job<VoiceCallJobData>) {
    const { userId, callId, phoneNumber, metadata } = job.data;

    console.log(`[Voice Worker] Processing call ${callId} for user ${userId}`);
    console.log(`[Voice Worker] Phone number: ${phoneNumber}`);

    const db = await getDb();
    if (!db) {
        throw new Error("Database not available");
    }

    await job.updateProgress(10);

    try {
        // Get call record
        const callRecord = await db
            .select()
            .from(ai_calls)
            .where(eq(ai_calls.id, parseInt(callId)))
            .limit(1);

        if (!callRecord[0]) {
            throw new Error(`Call record ${callId} not found`);
        }

        // Update call status to calling
        await db
            .update(ai_calls)
            .set({ status: "calling" })
            .where(eq(ai_calls.id, parseInt(callId)));

        await job.updateProgress(20);

        // Extract script and settings from metadata
        const script = metadata?.script || "Hello, this is an automated call.";
        const settings = metadata?.settings || {};

        console.log(`[Voice Worker] Initiating Vapi call with script length: ${script.length}`);

        // Initiate call with Vapi
        const vapiResponse = await vapiService.createCall(phoneNumber, script, settings);

        console.log(`[Voice Worker] Vapi call created: ${vapiResponse.callId}`);

        await job.updateProgress(40);

        // Update call record with Vapi call ID
        await db
            .update(ai_calls)
            .set({
                vapiCallId: vapiResponse.callId,
                status: "calling",
            })
            .where(eq(ai_calls.id, parseInt(callId)));

        await job.updateProgress(50);

        // Poll for call completion (with timeout)
        const maxPollingTime = 600000; // 10 minutes
        const pollingInterval = 5000; // 5 seconds
        const startTime = Date.now();
        let callCompleted = false;
        let finalStatus = null;

        while (!callCompleted && (Date.now() - startTime) < maxPollingTime) {
            await new Promise((resolve) => setTimeout(resolve, pollingInterval));

            try {
                const status = await vapiService.getCallStatus(vapiResponse.callId);

                console.log(`[Voice Worker] Call ${callId} status: ${status.status}`);

                if (status.status === "completed" || status.status === "failed" || status.status === "no_answer") {
                    callCompleted = true;
                    finalStatus = status;

                    // Update call record with final status
                    await db
                        .update(ai_calls)
                        .set({
                            status: status.status,
                            duration: status.duration || 0,
                            outcome: status.outcome,
                            transcript: status.transcript,
                            recordingUrl: status.recordingUrl,
                            error: status.error,
                            answeredAt: status.status === "answered" ? new Date() : null,
                            completedAt: new Date(),
                        })
                        .where(eq(ai_calls.id, parseInt(callId)));

                    // Update campaign stats
                    if (metadata?.campaignId) {
                        await updateCampaignStats(db, metadata.campaignId, status);
                    }

                    break;
                }

                await job.updateProgress(50 + Math.min(40, (Date.now() - startTime) / maxPollingTime * 40));
            } catch (error) {
                console.error(`[Voice Worker] Error polling call status:`, error);
                // Continue polling despite errors
            }
        }

        if (!callCompleted) {
            console.warn(`[Voice Worker] Call ${callId} polling timed out`);
            await db
                .update(ai_calls)
                .set({
                    status: "failed",
                    error: "Call monitoring timed out",
                    completedAt: new Date(),
                })
                .where(eq(ai_calls.id, parseInt(callId)));
        }

        await job.updateProgress(100);

        console.log(`[Voice Worker] Call ${callId} processing completed`);

        return {
            success: true,
            callId,
            status: finalStatus?.status || "completed",
            duration: finalStatus?.duration || 0,
            vapiCallId: vapiResponse.callId,
        };
    } catch (error: any) {
        console.error(`[Voice Worker] Error processing call ${callId}:`, error);

        // Update call record with error
        await db
            .update(ai_calls)
            .set({
                status: "failed",
                error: error.message,
                completedAt: new Date(),
            })
            .where(eq(ai_calls.id, parseInt(callId)));

        // Update campaign stats
        if (metadata?.campaignId) {
            await db
                .update(ai_call_campaigns)
                .set({
                    callsFailed: sql`${ai_call_campaigns.callsFailed} + 1`,
                    updatedAt: new Date(),
                })
                .where(eq(ai_call_campaigns.id, metadata.campaignId));
        }

        throw error;
    }
}

/**
 * Update campaign statistics after a call completes
 */
async function updateCampaignStats(db: any, campaignId: number, callStatus: any) {
    const updates: any = {
        callsMade: sql`${ai_call_campaigns.callsMade} + 1`,
        updatedAt: new Date(),
    };

    if (callStatus.status === "completed") {
        updates.callsSuccessful = sql`${ai_call_campaigns.callsSuccessful} + 1`;
        updates.callsAnswered = sql`${ai_call_campaigns.callsAnswered} + 1`;
        updates.totalDuration = sql`${ai_call_campaigns.totalDuration} + ${callStatus.duration || 0}`;
        updates.costInCredits = sql`${ai_call_campaigns.costInCredits} + 1`; // 1 credit per call
    } else if (callStatus.status === "failed") {
        updates.callsFailed = sql`${ai_call_campaigns.callsFailed} + 1`;
    } else if (callStatus.status === "no_answer") {
        updates.callsFailed = sql`${ai_call_campaigns.callsFailed} + 1`;
    }

    await db
        .update(ai_call_campaigns)
        .set(updates)
        .where(eq(ai_call_campaigns.id, campaignId));
}

/**
 * Create and configure the voice worker
 */
export function createVoiceWorker() {
    const worker = new Worker(
        "voice",
        async (job) => {
            console.log(`[Voice Worker] Processing ${job.name} job (ID: ${job.id})`);

            try {
                switch (job.name) {
                    case JobType.VOICE_CALL:
                        return await processVoiceCall(job as Job<VoiceCallJobData>);

                    default:
                        throw new Error(`Unknown voice job type: ${job.name}`);
                }
            } catch (error: any) {
                console.error(`[Voice Worker] Job ${job.id} failed:`, error.message);
                throw error;
            }
        },
        {
            connection: getRedisConnection(),
            concurrency: 3, // Process up to 3 calls concurrently
            limiter: {
                max: 5, // Max 5 calls
                duration: 1000, // Per second
            },
        }
    );

    console.log("Voice worker initialized");
    return worker;
}
