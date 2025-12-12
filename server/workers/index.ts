/**
 * Worker Entry Point
 * Initializes all BullMQ workers for background job processing
 *
 * Run with: NODE_ENV=production tsx server/workers/index.ts
 */

import "../_core/config"; // Load environment variables
import { createEmailWorker } from "./emailWorker";
import { createVoiceWorker } from "./voiceWorker";
import { createEnrichmentWorker } from "./enrichmentWorker";
import { createWorkflowWorker } from "./workflowWorker";
import { shutdownQueues, shutdownQueueEvents } from "../_core/queue";
import { Worker } from "bullmq";

// Store all workers for graceful shutdown
const workers: Worker[] = [];

async function startWorkers() {
    console.log("Starting BullMQ workers...");
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Redis URL: ${process.env.REDIS_URL ? "configured" : "not configured"}`);

    try {
        // Initialize all workers
        const emailWorker = createEmailWorker();
        const voiceWorker = createVoiceWorker();
        const enrichmentWorker = createEnrichmentWorker();
        const workflowWorker = createWorkflowWorker();

        workers.push(emailWorker, voiceWorker, enrichmentWorker, workflowWorker);

        // Add global error handlers
        workers.forEach((worker, index) => {
            const workerNames = ["email", "voice", "enrichment", "workflow"];
            const workerName = workerNames[index];

            worker.on("completed", (job) => {
                console.log(`[${workerName}] Job ${job.id} completed successfully`);
            });

            worker.on("failed", (job, err) => {
                console.error(`[${workerName}] Job ${job?.id} failed:`, err.message);
            });

            worker.on("error", (err) => {
                console.error(`[${workerName}] Worker error:`, err);
            });

            worker.on("active", (job) => {
                console.log(`[${workerName}] Processing job ${job.id}...`);
            });
        });

        console.log("All workers started successfully!");
        console.log("Workers running:");
        console.log("  - Email Worker (email_sync, email_draft)");
        console.log("  - Voice Worker (voice_call)");
        console.log("  - Enrichment Worker (lead_enrichment)");
        console.log("  - Workflow Worker (workflow_execution)");
        console.log("\nPress Ctrl+C to stop workers");
    } catch (error) {
        console.error("Failed to start workers:", error);
        process.exit(1);
    }
}

/**
 * Graceful shutdown handler
 */
async function shutdown() {
    console.log("\nShutting down workers...");

    try {
        // Close all workers
        await Promise.all(workers.map((worker) => worker.close()));
        console.log("All workers closed");

        // Close queue connections
        await shutdownQueues();
        await shutdownQueueEvents();

        console.log("Graceful shutdown complete");
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
}

// Handle process signals for graceful shutdown
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    shutdown();
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
    shutdown();
});

// Start the workers
startWorkers().catch((error) => {
    console.error("Failed to start workers:", error);
    process.exit(1);
});
