/**
 * Enrichment Worker
 * Processes lead enrichment background jobs using Appify
 */

import { Worker, Job } from "bullmq";
import { JobType, LeadEnrichmentJobData } from "../_core/queue";
import { AppifyService } from "../services/appify.service";
import { getRedisConnection } from "./utils";

/**
 * Process LEAD_ENRICHMENT jobs
 * Enriches lead data using Appify API with batch processing
 */
async function processLeadEnrichment(job: Job<LeadEnrichmentJobData>) {
    const { userId, leads, batchSize = 5 } = job.data;

    console.log(`Processing lead enrichment for user ${userId}`);
    console.log(`Total leads: ${leads.length}, batch size: ${batchSize}`);

    await job.updateProgress(5);

    const appifyService = new AppifyService();

    // Validate API key is configured
    const isValid = await appifyService.validateApiKey();
    if (!isValid) {
        throw new Error("Appify API key not configured or invalid");
    }

    await job.updateProgress(10);

    const results = {
        total: leads.length,
        successful: 0,
        failed: 0,
        errors: [] as Array<{ leadId: string; error: string }>,
    };

    // Process leads in batches
    for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(leads.length / batchSize);

        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} leads)`);

        // Process each lead in the batch
        for (const lead of batch) {
            try {
                // Enrich the lead
                const enrichedData = await appifyService.enrichLead({
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    email: lead.email,
                    phone: lead.phone,
                    company: lead.company,
                });

                // TODO: Store enriched data in database
                // await db.leads.update({
                //   where: { id: lead.id },
                //   data: {
                //     enrichedData,
                //     enrichmentStatus: 'completed',
                //     enrichmentDate: new Date(),
                //   },
                // });

                results.successful++;
            } catch (error: any) {
                console.error(`Failed to enrich lead ${lead.id}:`, error.message);
                results.failed++;
                results.errors.push({
                    leadId: lead.id,
                    error: error.message,
                });
            }
        }

        // Update progress
        const progress = Math.min(95, 10 + ((i + batch.length) / leads.length) * 85);
        await job.updateProgress(progress);

        // Add delay between batches to respect rate limits
        if (i + batchSize < leads.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    await job.updateProgress(100);

    console.log(`Lead enrichment completed for user ${userId}`);
    console.log(`Results: ${results.successful} successful, ${results.failed} failed`);

    return {
        success: true,
        ...results,
    };
}

/**
 * Create and configure the enrichment worker
 */
export function createEnrichmentWorker() {
    const worker = new Worker(
        "enrichment",
        async (job) => {
            console.log(`[Enrichment Worker] Processing ${job.name} job (ID: ${job.id})`);

            try {
                switch (job.name) {
                    case JobType.LEAD_ENRICHMENT:
                        return await processLeadEnrichment(job as Job<LeadEnrichmentJobData>);

                    default:
                        throw new Error(`Unknown enrichment job type: ${job.name}`);
                }
            } catch (error: any) {
                console.error(`[Enrichment Worker] Job ${job.id} failed:`, error.message);
                throw error;
            }
        },
        {
            connection: getRedisConnection(),
            concurrency: 2, // Process up to 2 enrichment jobs concurrently
            limiter: {
                max: 10, // Max 10 API calls
                duration: 1000, // Per second
            },
        }
    );

    console.log("Enrichment worker initialized");
    return worker;
}
