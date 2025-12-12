import Browserbase from "@browserbasehq/sdk";
import { withRetry, DEFAULT_RETRY_OPTIONS } from '../lib/retry';
import { circuitBreakers } from '../lib/circuitBreaker';

/**
 * Browserbase SDK Service
 * Handles all Browserbase session management operations
 *
 * Includes:
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern for service protection
 * - Comprehensive error handling
 */

// Types for Browserbase operations
export interface SessionCreateOptions {
  projectId?: string;
  extensionId?: string;
  browserSettings?: {
    viewport?: {
      width: number;
      height: number;
    };
    context?: {
      id: string;
    };
  };
  proxies?: boolean | Array<{
    type: string;
    server: string;
  }>;
  timeout?: number;
  keepAlive?: boolean;
  recordSession?: boolean;
}

export interface SessionCreateResponse {
  id: string;
  createdAt: string;
  projectId: string;
  status: 'RUNNING' | 'COMPLETED' | 'ERROR';
  proxyUrl?: string;
  wsUrl?: string;
  url?: string; // Added to fix lint error
}

// ... (skipping unchanged interfaces)



export interface SessionDebugResponse {
  debuggerUrl: string;
  debuggerFullscreenUrl: string;
  wsUrl: string;
}

export interface SessionRecordingResponse {
  recordingUrl?: string;
  status: 'PROCESSING' | 'COMPLETED' | 'ERROR';
}

export interface SessionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

export interface SessionLogsResponse {
  logs: SessionLog[];
}

/**
 * Browserbase SDK Error
 */
export class BrowserbaseSDKError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'BrowserbaseSDKError';
  }
}

/**
 * Browserbase SDK Service
 * Singleton service for managing Browserbase sessions
 */
class BrowserbaseSDKService {
  private static instance: BrowserbaseSDKService;
  private client: Browserbase | null = null;
  private projectId: string | null = null;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BrowserbaseSDKService {
    if (!BrowserbaseSDKService.instance) {
      BrowserbaseSDKService.instance = new BrowserbaseSDKService();
    }
    return BrowserbaseSDKService.instance;
  }

  /**
   * Initialize Browserbase client
   */
  private initialize(): void {
    const apiKey = process.env.BROWSERBASE_API_KEY;
    this.projectId = process.env.BROWSERBASE_PROJECT_ID || null;

    if (!apiKey) {
      console.warn(
        '[BrowserbaseSDK] BROWSERBASE_API_KEY not found in environment variables. SDK will not be initialized.'
      );
      return;
    }

    try {
      this.client = new Browserbase({
        apiKey,
      });
      console.log('[BrowserbaseSDK] Successfully initialized');
    } catch (error) {
      console.error('[BrowserbaseSDK] Failed to initialize:', error);
      throw new BrowserbaseSDKError(
        'Failed to initialize Browserbase SDK',
        'INIT_ERROR',
        error
      );
    }
  }

  /**
   * Ensure client is initialized
   */
  private ensureClient(): Browserbase {
    if (!this.client) {
      throw new BrowserbaseSDKError(
        'Browserbase SDK is not initialized. Check BROWSERBASE_API_KEY environment variable.',
        'NOT_INITIALIZED'
      );
    }
    return this.client;
  }

  /**
   * Get project ID (from options or environment)
   */
  private getProjectId(projectId?: string): string {
    const id = projectId || this.projectId;
    if (!id) {
      throw new BrowserbaseSDKError(
        'Project ID is required. Provide it in options or set BROWSERBASE_PROJECT_ID environment variable.',
        'MISSING_PROJECT_ID'
      );
    }
    return id;
  }

  /**
   * Create a new Browserbase session
   *
   * @param options - Session creation options
   * @returns Session creation response with session ID and connection details
   *
   * @example
   * ```ts
   * const session = await browserbaseSDK.createSession({
   *   projectId: 'project_123',
   *   browserSettings: {
   *     viewport: { width: 1920, height: 1080 }
   *   },
   *   recordSession: true
   * });
   * ```
   */
  public async createSession(
    options: SessionCreateOptions = {}
  ): Promise<SessionCreateResponse> {
    const client = this.ensureClient();

    return await circuitBreakers.browserbase.execute(async () => {
      return await withRetry(async () => {
        try {
          const projectId = this.getProjectId(options.projectId);

          console.log('[BrowserbaseSDK] Creating session with options:', {
            projectId,
            ...options,
          });

          // Fix type error for proxies
          const createOptions: any = {
            projectId,
            ...options,
          };

          const session = await client.sessions.create(createOptions);

          console.log('[BrowserbaseSDK] Session created successfully:', session.id);

          return session as unknown as SessionCreateResponse;
        } catch (error) {
          console.error('[BrowserbaseSDK] Failed to create session:', error);
          throw new BrowserbaseSDKError(
            `Failed to create Browserbase session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'CREATE_SESSION_ERROR',
            error
          );
        }
      }, {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: 3,
        initialDelayMs: 2000,
        maxDelayMs: 15000,
      });
    });
  }

  /**
   * Get debug/live view URLs for a session
   *
   * @param sessionId - The session ID to debug
   * @returns Debug URLs including live view and WebSocket connection
   *
   * @example
   * ```ts
   * const debug = await browserbaseSDK.getSessionDebug('session_123');
   * console.log('Live view:', debug.debuggerFullscreenUrl);
   * ```
   */
  public async getSessionDebug(sessionId: string): Promise<SessionDebugResponse> {
    const client = this.ensureClient();

    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    return await circuitBreakers.browserbase.execute(async () => {
      return await withRetry(async () => {
        try {
          console.log('[BrowserbaseSDK] Getting debug info for session:', sessionId);

          const debugInfo = await client.sessions.debug(sessionId);

          console.log('[BrowserbaseSDK] Debug info retrieved successfully');

          return debugInfo as SessionDebugResponse;
        } catch (error) {
          console.error('[BrowserbaseSDK] Failed to get session debug info:', error);
          throw new BrowserbaseSDKError(
            `Failed to get session debug info: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'GET_DEBUG_ERROR',
            error
          );
        }
      }, DEFAULT_RETRY_OPTIONS);
    });
  }

  /**
   * Get session recording URL
   *
   * @param sessionId - The session ID to retrieve recording for
   * @returns Session recording URL and status
   *
   * @example
   * ```ts
   * const recording = await browserbaseSDK.getSessionRecording('session_123');
   * if (recording.status === 'COMPLETED' && recording.recordingUrl) {
   *   console.log('Watch recording:', recording.recordingUrl);
   * }
   * ```
   */
  public async getSessionRecording(
    sessionId: string
  ): Promise<SessionRecordingResponse> {
    const client = this.ensureClient();

    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    return await circuitBreakers.browserbase.execute(async () => {
      return await withRetry(async () => {
        try {
          console.log('[BrowserbaseSDK] Getting recording for session:', sessionId);

          const recording = await client.sessions.recording.retrieve(sessionId);

          console.log('[BrowserbaseSDK] Recording retrieved successfully');

          return recording as unknown as SessionRecordingResponse;
        } catch (error) {
          console.error('[BrowserbaseSDK] Failed to get session recording:', error);
          throw new BrowserbaseSDKError(
            `Failed to get session recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'GET_RECORDING_ERROR',
            error
          );
        }
      }, DEFAULT_RETRY_OPTIONS);
    });
  }

  /**
   * Get session logs
   *
   * @param sessionId - The session ID to retrieve logs for
   * @returns Session logs with timestamps and metadata
   *
   * @example
   * ```ts
   * const { logs } = await browserbaseSDK.getSessionLogs('session_123');
   * logs.forEach(log => {
   *   console.log(`[${log.level}] ${log.timestamp}: ${log.message}`);
   * });
   * ```
   */
  public async getSessionLogs(sessionId: string): Promise<SessionLogsResponse> {
    const client = this.ensureClient();

    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    try {
      console.log('[BrowserbaseSDK] Getting logs for session:', sessionId);

      const logs = await client.sessions.logs.list(sessionId);

      console.log('[BrowserbaseSDK] Logs retrieved successfully');

      return { logs } as unknown as SessionLogsResponse;
    } catch (error) {
      console.error('[BrowserbaseSDK] Failed to get session logs:', error);
      throw new BrowserbaseSDKError(
        `Failed to get session logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_LOGS_ERROR',
        error
      );
    }
  }

  /**
   * Check if SDK is initialized
   */
  public isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Get current project ID
   */
  public getDefaultProjectId(): string | null {
    return this.projectId;
  }

  public async listSessions(): Promise<any[]> {
    const client = this.ensureClient();
    const sessions = await client.sessions.list();
    return sessions;
  }

  public async createSessionWithGeoLocation(geolocation: { city?: string; state?: string; country?: string }): Promise<SessionCreateResponse> {
    // Browserbase supports geolocation via proxies or context
    // This is a simplified implementation
    return this.createSession({
      proxies: true,
      // TODO: Map geolocation to proxy settings if supported by Browserbase SDK directly
    });
  }

  /**
   * Terminate/close a Browserbase session
   *
   * @param sessionId - The session ID to terminate
   * @param projectId - Optional project ID (uses default if not provided)
   * @returns Success status
   *
   * @example
   * ```ts
   * await browserbaseSDK.terminateSession('session_123');
   * ```
   */
  public async terminateSession(sessionId: string, projectId?: string): Promise<{ success: boolean; sessionId: string }> {
    const client = this.ensureClient();

    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    return await circuitBreakers.browserbase.execute(async () => {
      return await withRetry(async () => {
        try {
          console.log('[BrowserbaseSDK] Terminating session:', sessionId);

          // Update session status to REQUEST_RELEASE to gracefully close it
          const resolvedProjectId = this.getProjectId(projectId);
          await client.sessions.update(sessionId, {
            projectId: resolvedProjectId,
            status: 'REQUEST_RELEASE'
          });

          console.log('[BrowserbaseSDK] Session terminated successfully:', sessionId);

          return { success: true, sessionId };
        } catch (error) {
          console.error('[BrowserbaseSDK] Failed to terminate session:', error);
          throw new BrowserbaseSDKError(
            `Failed to terminate session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'TERMINATE_SESSION_ERROR',
            error
          );
        }
      }, DEFAULT_RETRY_OPTIONS);
    });
  }

  /**
   * Get session details
   *
   * @param sessionId - The session ID to retrieve
   * @returns Session details
   */
  public async getSession(sessionId: string): Promise<any> {
    const client = this.ensureClient();

    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    return await circuitBreakers.browserbase.execute(async () => {
      return await withRetry(async () => {
        try {
          console.log('[BrowserbaseSDK] Getting session:', sessionId);

          const session = await client.sessions.retrieve(sessionId);

          console.log('[BrowserbaseSDK] Session retrieved successfully');

          return session;
        } catch (error) {
          console.error('[BrowserbaseSDK] Failed to get session:', error);
          throw new BrowserbaseSDKError(
            `Failed to get session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'GET_SESSION_ERROR',
            error
          );
        }
      }, DEFAULT_RETRY_OPTIONS);
    });
  }

  /**
   * Update session status
   *
   * @param sessionId - The session ID to update
   * @param status - The new status
   * @param projectId - Optional project ID (uses default if not provided)
   * @returns Updated session
   */
  public async updateSessionStatus(
    sessionId: string,
    status: 'REQUEST_RELEASE',
    projectId?: string
  ): Promise<any> {
    const client = this.ensureClient();

    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    try {
      console.log('[BrowserbaseSDK] Updating session status:', sessionId, status);

      const resolvedProjectId = this.getProjectId(projectId);
      const session = await client.sessions.update(sessionId, {
        projectId: resolvedProjectId,
        status
      });

      console.log('[BrowserbaseSDK] Session status updated successfully');

      return session;
    } catch (error) {
      console.error('[BrowserbaseSDK] Failed to update session status:', error);
      throw new BrowserbaseSDKError(
        `Failed to update session status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_SESSION_ERROR',
        error
      );
    }
  }

  /**
   * Get session downloads
   *
   * @param sessionId - The session ID
   * @returns Download URLs
   */
  public async getSessionDownloads(sessionId: string): Promise<any> {
    const client = this.ensureClient();

    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    try {
      console.log('[BrowserbaseSDK] Getting downloads for session:', sessionId);

      const downloads = await client.sessions.downloads.list(sessionId);

      return downloads;
    } catch (error) {
      console.error('[BrowserbaseSDK] Failed to get session downloads:', error);
      throw new BrowserbaseSDKError(
        `Failed to get session downloads: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_DOWNLOADS_ERROR',
        error
      );
    }
  }

  /**
   * Get session uploads
   * Note: The Browserbase SDK currently only supports creating uploads, not listing them.
   * This method is a placeholder for future functionality.
   *
   * @param sessionId - The session ID
   * @returns Upload configuration (currently returns empty array)
   */
  public async getSessionUploads(sessionId: string): Promise<any> {
    if (!sessionId) {
      throw new BrowserbaseSDKError(
        'Session ID is required',
        'MISSING_SESSION_ID'
      );
    }

    try {
      console.log('[BrowserbaseSDK] Getting uploads for session:', sessionId);

      // Note: uploads.list() is not available in the current SDK
      // Returning empty array as placeholder
      return [];
    } catch (error) {
      console.error('[BrowserbaseSDK] Failed to get session uploads:', error);
      throw new BrowserbaseSDKError(
        `Failed to get session uploads: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_UPLOADS_ERROR',
        error
      );
    }
  }
}

// Export singleton instance
export const browserbaseSDK = BrowserbaseSDKService.getInstance();

// Export class for testing purposes
export { BrowserbaseSDKService };
