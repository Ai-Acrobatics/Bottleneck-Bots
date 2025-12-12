/**
 * Vapi Service
 * Manages AI-powered phone calls via Vapi.ai API
 *
 * Vapi.ai is a voice AI platform for making automated phone calls
 * with natural language conversations powered by GPT models.
 *
 * Documentation: https://docs.vapi.ai
 *
 * Includes:
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern for service protection
 * - Comprehensive error handling
 */

import { withRetry, DEFAULT_RETRY_OPTIONS } from '../lib/retry';
import { circuitBreakers } from '../lib/circuitBreaker';
import { serviceLoggers } from '../lib/logger';

const logger = serviceLoggers.vapi;

export interface VapiCallSettings {
  voice?: "male" | "female" | "neutral";
  speed?: number; // 0.5 to 2.0
  language?: string; // e.g., "en-US"
  model?: string; // e.g., "gpt-4"
  temperature?: number; // 0 to 1
  maxDuration?: number; // in seconds
  recordCall?: boolean;
  transcribeCall?: boolean;
  detectVoicemail?: boolean;
}

export interface VapiCreateCallResponse {
  callId: string;
  status: string;
  message?: string;
}

export interface VapiCallStatus {
  callId: string;
  status: "pending" | "calling" | "answered" | "no_answer" | "failed" | "completed";
  duration?: number; // in seconds
  outcome?: string;
  transcript?: string;
  recordingUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export class VapiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // TODO: Load from environment variables
    this.apiKey = process.env.VAPI_API_KEY || "";
    this.baseUrl = process.env.VAPI_API_URL || "https://api.vapi.ai";

    if (!this.apiKey) {
      logger.warn("VAPI_API_KEY not configured - Vapi service will return mock data");
    }
  }

  /**
   * Create and initiate a phone call
   * @param phoneNumber - The phone number to call (E.164 format recommended)
   * @param script - The script/prompt for the AI to follow during the call
   * @param settings - Optional call configuration settings
   * @returns Call creation response with callId
   *
   * API Endpoint: POST /call
   * Documentation: https://docs.vapi.ai/api-reference/calls/create-phone-call
   */
  async createCall(
    phoneNumber: string,
    script: string,
    settings?: VapiCallSettings
  ): Promise<VapiCreateCallResponse> {
    if (!this.apiKey) {
      throw new Error("VAPI_API_KEY not configured. Please set the environment variable.");
    }

    // Validate and format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!this.validatePhoneNumber(formattedPhone)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}. Expected E.164 format (e.g., +1234567890)`);
    }

    return await circuitBreakers.vapi.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`${this.baseUrl}/call`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: formattedPhone,
            assistant: {
              firstMessage: script,
              model: {
                provider: "openai",
                model: settings?.model || "gpt-4",
                temperature: settings?.temperature || 0.7,
              },
              voice: {
                provider: "11labs",
                voiceId: settings?.voice === "female" ? "rachel" : settings?.voice === "neutral" ? "adam" : "josh",
              },
            },
            maxDurationSeconds: settings?.maxDuration || 600,
            recordingEnabled: settings?.recordCall !== false,
            transcribeEnabled: settings?.transcribeCall !== false,
            voicemailDetectionEnabled: settings?.detectVoicemail !== false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        return {
          callId: data.id,
          status: data.status,
          message: "Call initiated successfully",
        };
      }, {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
      });
    });
  }

  /**
   * Get the current status of a call
   * @param vapiCallId - The Vapi call ID returned from createCall
   * @returns Current call status with details
   *
   * API Endpoint: GET /call/{id}
   * Documentation: https://docs.vapi.ai/api-reference/calls/get-call
   */
  async getCallStatus(vapiCallId: string): Promise<VapiCallStatus> {
    if (!this.apiKey) {
      throw new Error("VAPI_API_KEY not configured. Please set the environment variable.");
    }

    return await circuitBreakers.vapi.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`${this.baseUrl}/call/${vapiCallId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        return {
          callId: data.id,
          status: this.mapVapiStatus(data.status),
          duration: data.durationSeconds,
          outcome: data.endedReason,
          transcript: data.transcript,
          recordingUrl: data.recordingUrl,
          error: data.error,
          metadata: data.metadata,
        };
      }, {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: 2,
      });
    });
  }

  /**
   * Map Vapi status to our internal status format
   */
  private mapVapiStatus(vapiStatus: string): VapiCallStatus["status"] {
    const statusMap: Record<string, VapiCallStatus["status"]> = {
      "queued": "pending",
      "ringing": "calling",
      "in-progress": "answered",
      "forwarding": "answered",
      "ended": "completed",
      "busy": "no_answer",
      "no-answer": "no_answer",
      "failed": "failed",
      "canceled": "failed",
    };

    return statusMap[vapiStatus] || "failed";
  }

  /**
   * List all calls
   * @param limit - Maximum number of calls to return
   * @param offset - Number of calls to skip
   *
   * API Endpoint: GET /call
   */
  async listCalls(limit: number = 50, offset: number = 0): Promise<VapiCallStatus[]> {
    if (!this.apiKey) {
      return [];
    }

    return await circuitBreakers.vapi.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`${this.baseUrl}/call?limit=${limit}&offset=${offset}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const calls = Array.isArray(data) ? data : data.calls || [];

        return calls.map((call: any) => ({
          callId: call.id,
          status: this.mapVapiStatus(call.status),
          duration: call.durationSeconds,
          outcome: call.endedReason,
          transcript: call.transcript,
          recordingUrl: call.recordingUrl,
          error: call.error,
          metadata: call.metadata,
        }));
      }, DEFAULT_RETRY_OPTIONS);
    });
  }

  /**
   * End an ongoing call
   * @param vapiCallId - The Vapi call ID to end
   *
   * API Endpoint: DELETE /call/{id}
   */
  async endCall(vapiCallId: string): Promise<{ success: boolean; message?: string }> {
    if (!this.apiKey) {
      throw new Error("VAPI_API_KEY not configured. Please set the environment variable.");
    }

    return await circuitBreakers.vapi.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`${this.baseUrl}/call/${vapiCallId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        return {
          success: true,
          message: "Call ended successfully",
        };
      }, DEFAULT_RETRY_OPTIONS);
    });
  }

  /**
   * Get call transcript
   * @param vapiCallId - The Vapi call ID
   * @returns Call transcript
   */
  async getTranscript(vapiCallId: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("VAPI_API_KEY not configured. Please set the environment variable.");
    }

    try {
      const callStatus = await this.getCallStatus(vapiCallId);
      return callStatus.transcript || "";
    } catch (error: any) {
      logger.error({ error: error.message, vapiCallId }, 'Error getting Vapi call transcript');
      throw new Error(`Failed to get transcript: ${error.message}`);
    }
  }

  /**
   * Update call metadata or settings mid-call
   * @param vapiCallId - The Vapi call ID to update
   * @param updates - Fields to update
   *
   * API Endpoint: PATCH /call/{id}
   */
  async updateCall(
    vapiCallId: string,
    updates: Partial<VapiCallSettings>
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.apiKey) {
      throw new Error("VAPI_API_KEY not configured. Please set the environment variable.");
    }

    return await circuitBreakers.vapi.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`${this.baseUrl}/call/${vapiCallId}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        return {
          success: true,
          message: "Call updated successfully",
        };
      }, DEFAULT_RETRY_OPTIONS);
    });
  }

  /**
   * Validate phone number format
   * Ensures phone number is in a format acceptable by Vapi
   * @param phoneNumber - Phone number to validate
   */
  private validatePhoneNumber(phoneNumber: string): boolean {
    // TODO: Implement proper phone number validation
    // Should validate E.164 format: +[country code][number]
    // Example: +1234567890
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 standard
   * @param phoneNumber - Phone number to format
   * @param defaultCountryCode - Country code to use if not present (e.g., "1" for US)
   */
  private formatPhoneNumber(phoneNumber: string, defaultCountryCode: string = "1"): string {
    // TODO: Implement proper phone number formatting
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");

    // Add + and country code if not present
    if (digits.startsWith(defaultCountryCode)) {
      return `+${digits}`;
    }
    return `+${defaultCountryCode}${digits}`;
  }
}

// Export singleton instance
export const vapiService = new VapiService();
