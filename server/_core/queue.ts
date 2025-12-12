/**
 * Queue Configuration for Background Jobs
 * Uses BullMQ for reliable job processing
 *
 * IMPORTANT: This file requires Redis to be running
 * Set REDIS_URL environment variable (e.g., redis://localhost:6379)
 * For Upstash: rediss://default:password@host:port
 *
 * Deploy worker processes separately from main app using:
 * NODE_ENV=production tsx server/workers/index.ts
 */

import { Queue, QueueEvents, ConnectionOptions } from "bullmq";

// Parse Redis connection from URL or individual env vars
function getRedisConnection(): ConnectionOptions {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
        // Parse Redis URL (supports redis:// and rediss:// protocols)
        const url = new URL(redisUrl);
        const isTls = url.protocol === "rediss:";

        return {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            username: url.username || undefined,
            tls: isTls ? {} : undefined,
        };
    }

    // Fallback to individual env vars
    return {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
        tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    };
}

const connection = getRedisConnection();

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
    LEAD_ENRICHMENT = "lead_enrichment",
    WORKFLOW_EXECUTION = "workflow_execution",
}

/**
 * Job Data Types
 */
export interface EmailSyncJobData {
    userId: string;
    accountId: string;
    emailProvider: "gmail" | "outlook";
    syncSince?: Date;
}

export interface EmailDraftJobData {
    userId: string;
    threadId: string;
    context: string;
    tone?: "professional" | "casual" | "friendly";
}

export interface VoiceCallJobData {
    userId: string;
    callId: string;
    phoneNumber: string;
    assistantId?: string;
    metadata?: Record<string, any>;
}

export interface SeoAuditJobData {
    userId: string;
    websiteUrl: string;
    depth?: number;
    includeCompetitors?: boolean;
}

export interface AdAnalysisJobData {
    userId: string;
    platform: "google" | "facebook" | "linkedin";
    accountId: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
}

export interface LeadEnrichmentJobData {
    userId: string;
    leads: Array<{
        id: string;
        email?: string;
        phone?: string;
        company?: string;
        [key: string]: any;
    }>;
    batchSize?: number;
}

export interface WorkflowExecutionJobData {
    userId: string;
    workflowId: string;
    triggerId?: string;
    context?: Record<string, any>;
}

export type JobData =
    | EmailSyncJobData
    | EmailDraftJobData
    | VoiceCallJobData
    | SeoAuditJobData
    | AdAnalysisJobData
    | LeadEnrichmentJobData
    | WorkflowExecutionJobData;

/**
 * Queue Definitions
 */
export const emailQueue = new Queue("email", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
    },
});

export const voiceQueue = new Queue("voice", {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    },
});

export const seoQueue = new Queue("seo", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 10000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 500,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    },
});

export const adsQueue = new Queue("ads", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    },
});

export const enrichmentQueue = new Queue("enrichment", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    },
});

export const workflowQueue = new Queue("workflow", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    },
});

/**
 * Queue Events for monitoring
 */
export const emailQueueEvents = new QueueEvents("email", { connection });
export const voiceQueueEvents = new QueueEvents("voice", { connection });
export const seoQueueEvents = new QueueEvents("seo", { connection });
export const adsQueueEvents = new QueueEvents("ads", { connection });
export const enrichmentQueueEvents = new QueueEvents("enrichment", { connection });
export const workflowQueueEvents = new QueueEvents("workflow", { connection });

/**
 * Add job to queue with retry logic
 */
export async function addJob<T extends JobData>(
    queueName: "email" | "voice" | "seo" | "ads" | "enrichment" | "workflow",
    jobType: JobType,
    data: T,
    options?: {
        delay?: number;
        priority?: number;
        attempts?: number;
        jobId?: string;
    }
) {
    const queueMap = {
        email: emailQueue,
        voice: voiceQueue,
        seo: seoQueue,
        ads: adsQueue,
        enrichment: enrichmentQueue,
        workflow: workflowQueue,
    };

    const queue = queueMap[queueName];

    return await queue.add(jobType, data, {
        attempts: options?.attempts,
        delay: options?.delay,
        priority: options?.priority,
        jobId: options?.jobId,
    });
}

/**
 * Helper functions to add specific job types with proper typing
 */
export async function addEmailSyncJob(data: EmailSyncJobData, options?: { delay?: number; priority?: number }) {
    return addJob("email", JobType.EMAIL_SYNC, data, options);
}

export async function addEmailDraftJob(data: EmailDraftJobData, options?: { delay?: number; priority?: number }) {
    return addJob("email", JobType.EMAIL_DRAFT, data, options);
}

export async function addVoiceCallJob(data: VoiceCallJobData, options?: { delay?: number; priority?: number }) {
    return addJob("voice", JobType.VOICE_CALL, data, options);
}

export async function addSeoAuditJob(data: SeoAuditJobData, options?: { delay?: number; priority?: number }) {
    return addJob("seo", JobType.SEO_AUDIT, data, options);
}

export async function addAdAnalysisJob(data: AdAnalysisJobData, options?: { delay?: number; priority?: number }) {
    return addJob("ads", JobType.AD_ANALYSIS, data, options);
}

export async function addLeadEnrichmentJob(data: LeadEnrichmentJobData, options?: { delay?: number; priority?: number }) {
    return addJob("enrichment", JobType.LEAD_ENRICHMENT, data, options);
}

export async function addWorkflowExecutionJob(data: WorkflowExecutionJobData, options?: { delay?: number; priority?: number; jobId?: string }) {
    return addJob("workflow", JobType.WORKFLOW_EXECUTION, data, options);
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName: "email" | "voice" | "seo" | "ads" | "enrichment" | "workflow") {
    const queueMap = {
        email: emailQueue,
        voice: voiceQueue,
        seo: seoQueue,
        ads: adsQueue,
        enrichment: enrichmentQueue,
        workflow: workflowQueue,
    };

    const queue = queueMap[queueName];

    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
        queue.isPaused(),
    ]);

    return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused,
    };
}

/**
 * Get all queue statistics
 */
export async function getAllQueueStats() {
    const [email, voice, seo, ads, enrichment, workflow] = await Promise.all([
        getQueueStats("email"),
        getQueueStats("voice"),
        getQueueStats("seo"),
        getQueueStats("ads"),
        getQueueStats("enrichment"),
        getQueueStats("workflow"),
    ]);

    return {
        email,
        voice,
        seo,
        ads,
        enrichment,
        workflow,
    };
}

/**
 * Graceful shutdown
 */
export async function shutdownQueues() {
    console.log("Closing all queues...");
    await Promise.all([
        emailQueue.close(),
        voiceQueue.close(),
        seoQueue.close(),
        adsQueue.close(),
        enrichmentQueue.close(),
        workflowQueue.close(),
    ]);
    console.log("All queues closed");
}

/**
 * Graceful shutdown for queue events
 */
export async function shutdownQueueEvents() {
    console.log("Closing all queue events...");
    await Promise.all([
        emailQueueEvents.close(),
        voiceQueueEvents.close(),
        seoQueueEvents.close(),
        adsQueueEvents.close(),
        enrichmentQueueEvents.close(),
        workflowQueueEvents.close(),
    ]);
    console.log("All queue events closed");
}
