/**
 * Queue Configuration for Background Jobs
 * Uses BullMQ for reliable job processing
 * 
 * IMPORTANT: This file requires Redis to be running
 * TODO (Hitesh): Provision Redis instance (Upstash recommended for serverless)
 * TODO (Hitesh): Set REDIS_URL environment variable
 * TODO (Hitesh): Deploy worker processes separately from main app
 */

import { Queue, Worker, QueueEvents } from "bullmq";

// Redis connection configuration
const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    // For Upstash or other TLS-required services
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
};

/**
 * Job Types
 */
export enum JobType {
    EMAIL_SYNC = "email_sync",
    EMAIL_DRAFT = "email_draft",
    VOICE_CALL = "voice_call",
    SEO_AUDIT = "seo_audit",
    KEYWORD_ANALYSIS = "keyword_analysis",
    AD_ANALYSIS = "ad_analysis",
    AD_AUTOMATION = "ad_automation",
}

/**
 * Queue Definitions
 */
export const emailQueue = new Queue("email", { connection });
export const voiceQueue = new Queue("voice", { connection });
export const seoQueue = new Queue("seo", { connection });
export const adsQueue = new Queue("ads", { connection });

/**
 * Queue Events for monitoring
 */
export const emailQueueEvents = new QueueEvents("email", { connection });
export const voiceQueueEvents = new QueueEvents("voice", { connection });
export const seoQueueEvents = new QueueEvents("seo", { connection });
export const adsQueueEvents = new QueueEvents("ads", { connection });

/**
 * Add job to queue with retry logic
 */
export async function addJob(
    queueName: "email" | "voice" | "seo" | "ads",
    jobType: JobType,
    data: any,
    options?: {
        delay?: number;
        priority?: number;
        attempts?: number;
    }
) {
    const queueMap = {
        email: emailQueue,
        voice: voiceQueue,
        seo: seoQueue,
        ads: adsQueue,
    };

    const queue = queueMap[queueName];

    return await queue.add(jobType, data, {
        attempts: options?.attempts || 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        delay: options?.delay,
        priority: options?.priority,
    });
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName: "email" | "voice" | "seo" | "ads") {
    const queueMap = {
        email: emailQueue,
        voice: voiceQueue,
        seo: seoQueue,
        ads: adsQueue,
    };

    const queue = queueMap[queueName];

    const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
    ]);

    return {
        waiting,
        active,
        completed,
        failed,
    };
}

/**
 * Example: Email Worker (to be deployed separately)
 * TODO (Hitesh): Create separate worker processes in server/workers/
 */
export function createEmailWorker() {
    return new Worker(
        "email",
        async (job) => {
            console.log(`Processing ${job.name} job:`, job.id);

            switch (job.name) {
                case JobType.EMAIL_SYNC:
                    // TODO: Fetch emails from Gmail/Outlook API
                    // TODO: Analyze with LLM
                    // TODO: Store in database
                    break;
                case JobType.EMAIL_DRAFT:
                    // TODO: Generate draft response
                    // TODO: Store in database
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.name}`);
            }

            return { success: true };
        },
        { connection }
    );
}

/**
 * Graceful shutdown
 */
export async function shutdownQueues() {
    await Promise.all([
        emailQueue.close(),
        voiceQueue.close(),
        seoQueue.close(),
        adsQueue.close(),
    ]);
}
