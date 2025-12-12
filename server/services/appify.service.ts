/**
 * Apify Service
 * Handles lead enrichment via Apify API
 *
 * Environment Variables Required:
 * - APIFY_API_KEY: Your Apify API token
 * - APIFY_TASK_ID: The Apify actor task ID for enrichment
 *
 * Includes:
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern for service protection
 * - Comprehensive error handling
 */

import { withRetry, DEFAULT_RETRY_OPTIONS } from '../lib/retry';
import { circuitBreakers } from '../lib/circuitBreaker';
import { serviceLoggers } from '../lib/logger';

const logger = serviceLoggers.apify;

export interface LeadData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  linkedIn?: string;
  linkedinUrl?: string;
  jobTitle?: string;
  [key: string]: any; // Allow additional fields
}

export interface EnrichedLeadData extends LeadData {
  // Additional enriched fields from Apify
  fullName?: string;
  title?: string;
  location?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  companyInfo?: {
    name?: string;
    domain?: string;
    industry?: string;
    size?: string;
    location?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    mobilePhone?: string;
  };
  enrichmentSource?: string;
  enrichmentDate?: Date;
  confidence?: number;
}

export interface EnrichmentResult {
  success: boolean;
  data?: EnrichedLeadData;
  error?: string;
}

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId?: string;
  };
}

interface ApifyDatasetItem {
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  jobTitle?: string;
  company?: string;
  companyName?: string;
  linkedinUrl?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  confidence?: number;
  [key: string]: any;
}

/**
 * Helper to chunk array into batches
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Helper to sleep for a delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class AppifyService {
  private apiKey?: string;
  private taskId?: string;
  private baseUrl: string = "https://api.apify.com/v2";

  constructor() {
    this.apiKey = process.env.APIFY_API_KEY;
    this.taskId = process.env.APIFY_TASK_ID;
  }

  /**
   * Enrich a single lead using Apify
   */
  async enrichLead(leadData: LeadData): Promise<EnrichedLeadData> {
    if (!this.apiKey) {
      throw new Error("Apify API key not configured. Set APIFY_API_KEY environment variable.");
    }

    if (!this.taskId) {
      throw new Error("Apify task ID not configured. Set APIFY_TASK_ID environment variable.");
    }

    return await circuitBreakers.apify.execute(async () => {
      return await withRetry(async () => {
        // Start Apify actor task run
        const runResponse = await fetch(
          `${this.baseUrl}/actor-tasks/${this.taskId}/runs`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: leadData.email,
              phone: leadData.phone,
              company: leadData.company,
              linkedinUrl: leadData.linkedIn || leadData.linkedinUrl,
              firstName: leadData.firstName,
              lastName: leadData.lastName,
            }),
          }
        );

        if (!runResponse.ok) {
          const errorText = await runResponse.text();
          throw new Error(`Apify API error: ${runResponse.status} - ${errorText}`);
        }

        const runData: ApifyRunResponse = await runResponse.json();
        const runId = runData.data.id;

        // Wait for run to complete (poll status)
        let status = runData.data.status;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max (5 second intervals)

        while (status !== "SUCCEEDED" && status !== "FAILED" && attempts < maxAttempts) {
          await sleep(5000); // Wait 5 seconds between polls

          const statusResponse = await fetch(
            `${this.baseUrl}/actor-runs/${runId}`,
            {
              headers: {
                "Authorization": `Bearer ${this.apiKey}`,
              },
            }
          );

          if (!statusResponse.ok) {
            throw new Error(`Failed to check run status: ${statusResponse.status}`);
          }

          const statusData: ApifyRunResponse = await statusResponse.json();
          status = statusData.data.status;
          attempts++;
        }

        if (status === "FAILED") {
          throw new Error("Apify actor run failed");
        }

        if (status !== "SUCCEEDED") {
          throw new Error("Apify actor run timed out");
        }

        // Get dataset results
        const datasetId = runData.data.defaultDatasetId;
        if (!datasetId) {
          throw new Error("No dataset ID returned from Apify");
        }

        const datasetResponse = await fetch(
          `${this.baseUrl}/datasets/${datasetId}/items`,
          {
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
            },
          }
        );

        if (!datasetResponse.ok) {
          throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`);
        }

        const datasetItems: ApifyDatasetItem[] = await datasetResponse.json();

        if (!datasetItems || datasetItems.length === 0) {
          // Return original data with low confidence if no enrichment found
          return {
            ...leadData,
            enrichmentSource: "apify",
            enrichmentDate: new Date(),
            confidence: 0,
          };
        }

        // Parse and map Apify data to our format
        const enrichedItem = datasetItems[0];

        const enrichedData: EnrichedLeadData = {
          ...leadData,
          fullName: enrichedItem.fullName || enrichedItem.name ||
                    (leadData.firstName && leadData.lastName
                      ? `${leadData.firstName} ${leadData.lastName}`
                      : undefined),
          firstName: enrichedItem.firstName || leadData.firstName,
          lastName: enrichedItem.lastName || leadData.lastName,
          title: enrichedItem.title || enrichedItem.jobTitle || leadData.jobTitle,
          company: enrichedItem.company || enrichedItem.companyName || leadData.company,
          location: enrichedItem.location,
          socialProfiles: {
            linkedin: enrichedItem.linkedinUrl || enrichedItem.linkedin || leadData.linkedIn,
            twitter: enrichedItem.twitter,
            facebook: enrichedItem.facebook,
          },
          companyInfo: {
            name: enrichedItem.company || enrichedItem.companyName || leadData.company,
            domain: enrichedItem.website || leadData.website,
            industry: enrichedItem.industry,
            size: enrichedItem.companySize,
            location: enrichedItem.location,
          },
          contactInfo: {
            email: enrichedItem.email || leadData.email,
            phone: enrichedItem.phone || leadData.phone,
            mobilePhone: enrichedItem.phone,
          },
          enrichmentSource: "apify",
          enrichmentDate: new Date(),
          confidence: enrichedItem.confidence || this.calculateConfidence(enrichedItem),
        };

        return enrichedData;
      }, {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: 2,
        initialDelayMs: 2000,
        maxDelayMs: 15000,
      });
    });
  }

  /**
   * Batch enrich multiple leads with rate limiting and concurrency control
   */
  async batchEnrichLeads(
    leads: LeadData[],
    options: { concurrency?: number; delay?: number } = {}
  ): Promise<EnrichmentResult[]> {
    const concurrency = options.concurrency || 5;
    const delay = options.delay || 2000; // 2 second delay between batches

    const batches = chunk(leads, concurrency);
    const results: EnrichmentResult[] = [];

    for (const batch of batches) {
      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(lead => this.enrichLead(lead))
      );

      // Map results
      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push({
            success: true,
            data: result.value,
          });
        } else {
          results.push({
            success: false,
            error: result.reason?.message || "Unknown error",
          });
        }
      }

      // Rate limiting delay between batches (except for last batch)
      if (batches.indexOf(batch) < batches.length - 1) {
        await sleep(delay);
      }
    }

    return results;
  }

  /**
   * Validate Apify API key
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    return await circuitBreakers.apify.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`${this.baseUrl}/users/me`, {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        });

        return response.ok;
      }, DEFAULT_RETRY_OPTIONS);
    }).catch(error => {
      logger.error({ error }, 'Apify API key validation error');
      return false;
    });
  }

  /**
   * Get enrichment credits balance from Apify
   */
  async getCreditsBalance(): Promise<number> {
    if (!this.apiKey) {
      throw new Error("Apify API key not configured");
    }

    return await circuitBreakers.apify.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`${this.baseUrl}/users/me`, {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch Apify account info: ${response.status}`);
        }

        const userData = await response.json();

        // Apify uses a usage-based system, return approximate remaining credits
        // This is a simplified calculation - adjust based on actual Apify pricing
        return userData.data?.usageCycle?.creditsRemaining || 0;
      }, DEFAULT_RETRY_OPTIONS);
    }).catch(error => {
      logger.error({ error }, 'Error fetching Apify credits');
      return 0;
    });
  }

  /**
   * Get enrichment cost estimate
   */
  async estimateEnrichmentCost(leadCount: number): Promise<number> {
    // Apify pricing varies by actor
    // Default estimate: 1 credit per lead enrichment
    // Adjust based on your actual Apify actor costs
    const costPerLead = 1;
    return leadCount * costPerLead;
  }

  /**
   * Calculate confidence score based on enriched data completeness
   */
  private calculateConfidence(data: ApifyDatasetItem): number {
    let score = 0;
    let maxScore = 0;

    // Check key fields and assign weights
    const fields = [
      { key: 'email', weight: 20 },
      { key: 'phone', weight: 15 },
      { key: 'fullName', weight: 15 },
      { key: 'name', weight: 15 },
      { key: 'title', weight: 10 },
      { key: 'jobTitle', weight: 10 },
      { key: 'company', weight: 15 },
      { key: 'companyName', weight: 15 },
      { key: 'location', weight: 5 },
      { key: 'linkedinUrl', weight: 10 },
      { key: 'linkedin', weight: 10 },
    ];

    for (const field of fields) {
      maxScore += field.weight;
      if (data[field.key] && String(data[field.key]).trim().length > 0) {
        score += field.weight;
      }
    }

    return Math.round((score / maxScore) * 100);
  }
}
