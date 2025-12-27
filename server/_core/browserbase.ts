/**
 * Browserbase Service Export
 * Re-exports the browserbase SDK service for convenience
 */

import { browserbaseSDK } from "./browserbaseSDK";

/**
 * Get the Browserbase service instance
 * @returns The browserbase SDK service
 */
export function getBrowserbaseService() {
  return browserbaseSDK;
}

// Re-export types from SDK
export type {
  SessionCreateOptions,
  SessionCreateResponse,
} from "./browserbaseSDK";
