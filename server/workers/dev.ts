/**
 * Development Workers Helper
 * Allows workers to run alongside the main server in development mode
 *
 * In production, workers should be run separately using: tsx server/workers/index.ts
 */

import { createEmailWorker } from "./emailWorker";
import { createVoiceWorker } from "./voiceWorker";
import { createEnrichmentWorker } from "./enrichmentWorker";
import { createWorkflowWorker } from "./workflowWorker";
import { Worker } from "bullmq";

let workers: Worker[] = [];

export async function startDevelopmentWorkers() {
    console.log("Initializing development workers...");

    try {
        // Create all workers
        const emailWorker = createEmailWorker();
        const voiceWorker = createVoiceWorker();
        const enrichmentWorker = createEnrichmentWorker();
        const workflowWorker = createWorkflowWorker();

        workers = [emailWorker, voiceWorker, enrichmentWorker, workflowWorker];

        // Add minimal logging for development
        workers.forEach((worker, index) => {
            const workerNames = ["email", "voice", "enrichment", "workflow"];
            const workerName = workerNames[index];

            worker.on("completed", (job) => {
                console.log(`[${workerName}] Job ${job.id} completed`);
            });

            worker.on("failed", (job, err) => {
                console.error(`[${workerName}] Job ${job?.id} failed:`, err.message);
            });
        });

        console.log("Development workers started successfully");
        console.log("  - Email Worker");
        console.log("  - Voice Worker");
        console.log("  - Enrichment Worker");
        console.log("  - Workflow Worker");
    } catch (error) {
        console.error("Error starting development workers:", error);
        throw error;
    }
}

export async function stopDevelopmentWorkers() {
    console.log("Stopping development workers...");

    if (workers.length === 0) {
        return;
    }

    try {
        await Promise.all(workers.map((worker) => worker.close()));
        workers = [];
        console.log("Development workers stopped");
    } catch (error) {
        console.error("Error stopping development workers:", error);
    }
}
