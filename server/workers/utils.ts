/**
 * Worker Utilities
 * Shared utilities for all workers
 */

import { ConnectionOptions } from "bullmq";

/**
 * Parse Redis connection from URL or individual env vars
 * Reused from queue.ts for worker connections
 */
export function getRedisConnection(): ConnectionOptions {
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

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
        maxAttempts?: number;
        initialDelay?: number;
        maxDelay?: number;
        factor?: number;
    } = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        initialDelay = 1000,
        maxDelay = 30000,
        factor = 2,
    } = options;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (attempt < maxAttempts) {
                const delayMs = Math.min(
                    initialDelay * Math.pow(factor, attempt - 1),
                    maxDelay
                );
                console.log(
                    `Attempt ${attempt} failed, retrying in ${formatDuration(delayMs)}...`
                );
                await delay(delayMs);
            }
        }
    }

    throw lastError;
}

/**
 * Process items in batches
 */
export async function processBatch<T, R>(
    items: T[],
    batchSize: number,
    processFn: (item: T) => Promise<R>,
    onProgress?: (completed: number, total: number) => void
): Promise<Array<{ success: boolean; result?: R; error?: string; item: T }>> {
    const results: Array<{ success: boolean; result?: R; error?: string; item: T }> = [];
    let completed = 0;

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        // Process batch in parallel
        const batchResults = await Promise.allSettled(
            batch.map((item) => processFn(item))
        );

        // Collect results
        batchResults.forEach((result, index) => {
            const item = batch[index];
            if (result.status === "fulfilled") {
                results.push({ success: true, result: result.value, item });
            } else {
                results.push({
                    success: false,
                    error: result.reason?.message || "Unknown error",
                    item,
                });
            }
        });

        completed += batch.length;
        if (onProgress) {
            onProgress(completed, items.length);
        }
    }

    return results;
}
