/**
 * SSE Client Manager
 * Provides reliable Server-Sent Events connection for real-time updates
 * Replaces Socket.io for agent execution and browser session streaming
 */

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export type ExecutionStatus = 'queued' | 'running' | 'success' | 'failed' | 'timeout' | 'cancelled';

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface ThinkingStep {
  id: string;
  type: 'thought' | 'action' | 'observation' | 'plan' | 'result' | 'error';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ExecutionUpdate {
  executionId: number;
  status: ExecutionStatus;
  progress: number;
  currentStep?: string;
  stepsCompleted: number;
  stepsTotal: number;
  thinkingSteps?: ThinkingStep[];
  browserSession?: {
    sessionId: string;
    debugUrl: string;
  };
  error?: string;
  output?: any;
}

export type EventHandler<T = any> = (data: T) => void;
export type StateChangeHandler = (state: ConnectionState) => void;

/**
 * SSE Connection for a specific stream
 */
class SSEConnection {
  private eventSource: EventSource | null = null;
  private url: string;
  private state: ConnectionState = 'disconnected';
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private stateHandlers: Set<StateChangeHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to the SSE stream
   */
  connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      console.log('[SSE] Already connected to:', this.url);
      return;
    }

    this.cleanup();
    this.setState('connecting');
    console.log('[SSE] Connecting to:', this.url);

    try {
      this.eventSource = new EventSource(this.url, { withCredentials: true });

      this.eventSource.onopen = () => {
        console.log('[SSE] Connected to:', this.url);
        this.reconnectAttempts = 0;
        this.setState('connected');
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);

        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.setState('disconnected');
          this.attemptReconnect();
        } else {
          this.setState('error');
        }
      };

      // Handle named events
      this.eventSource.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyHandlers('connected', data);
        } catch (e) {
          console.error('[SSE] Error parsing connected event:', e);
        }
      });

      this.eventSource.addEventListener('thinking', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyHandlers('thinking', data);
        } catch (e) {
          console.error('[SSE] Error parsing thinking event:', e);
        }
      });

      this.eventSource.addEventListener('progress', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyHandlers('progress', data);
        } catch (e) {
          console.error('[SSE] Error parsing progress event:', e);
        }
      });

      this.eventSource.addEventListener('browser_session', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyHandlers('browser_session', data);
        } catch (e) {
          console.error('[SSE] Error parsing browser_session event:', e);
        }
      });

      this.eventSource.addEventListener('completed', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyHandlers('completed', data);
        } catch (e) {
          console.error('[SSE] Error parsing completed event:', e);
        }
      });

      this.eventSource.addEventListener('error', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyHandlers('error', data);
        } catch (e) {
          console.error('[SSE] Error parsing error event:', e);
        }
      });

      // Handle generic message events (fallback)
      this.eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyHandlers('message', data);

          // Also dispatch based on type if present
          if (data.type) {
            this.notifyHandlers(data.type, data);
          }
        } catch (e) {
          // Non-JSON message (like heartbeat)
          if (!event.data.startsWith(':')) {
            console.log('[SSE] Message:', event.data);
          }
        }
      };

    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      this.setState('error');
    }
  }

  /**
   * Disconnect from the SSE stream
   */
  disconnect(): void {
    console.log('[SSE] Disconnecting from:', this.url);
    this.cleanup();
    this.setState('disconnected');
  }

  /**
   * Add event handler
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Add state change handler
   */
  onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    handler(this.state);
    return () => this.stateHandlers.delete(handler);
  }

  /**
   * Get current state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[SSE] Max reconnect attempts reached');
      this.setState('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateHandlers.forEach((handler) => {
        try {
          handler(state);
        } catch (error) {
          console.error('[SSE] Error in state handler:', error);
        }
      });
    }
  }

  private notifyHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[SSE] Error in event handler:', error);
        }
      });
    }
  }
}

/**
 * SSE Client Manager - manages multiple SSE connections
 */
export class SSEClientManager {
  private connections: Map<string, SSEConnection> = new Map();
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Subscribe to agent execution updates
   */
  subscribeToExecution(executionId: string | number): SSEConnection {
    const key = `execution:${executionId}`;

    if (this.connections.has(key)) {
      return this.connections.get(key)!;
    }

    const url = `${this.baseUrl}/api/agent/stream/${executionId}`;
    const connection = new SSEConnection(url);
    this.connections.set(key, connection);
    connection.connect();

    return connection;
  }

  /**
   * Unsubscribe from agent execution updates
   */
  unsubscribeFromExecution(executionId: string | number): void {
    const key = `execution:${executionId}`;
    const connection = this.connections.get(key);

    if (connection) {
      connection.disconnect();
      this.connections.delete(key);
    }
  }

  /**
   * Subscribe to AI session updates
   */
  subscribeToSession(sessionId: string): SSEConnection {
    const key = `session:${sessionId}`;

    if (this.connections.has(key)) {
      return this.connections.get(key)!;
    }

    const url = `${this.baseUrl}/api/ai/stream/${sessionId}`;
    const connection = new SSEConnection(url);
    this.connections.set(key, connection);
    connection.connect();

    return connection;
  }

  /**
   * Unsubscribe from AI session updates
   */
  unsubscribeFromSession(sessionId: string): void {
    const key = `session:${sessionId}`;
    const connection = this.connections.get(key);

    if (connection) {
      connection.disconnect();
      this.connections.delete(key);
    }
  }

  /**
   * Get connection for execution
   */
  getExecutionConnection(executionId: string | number): SSEConnection | undefined {
    return this.connections.get(`execution:${executionId}`);
  }

  /**
   * Get connection for session
   */
  getSessionConnection(sessionId: string): SSEConnection | undefined {
    return this.connections.get(`session:${sessionId}`);
  }

  /**
   * Disconnect all connections
   */
  disconnectAll(): void {
    this.connections.forEach((connection) => {
      connection.disconnect();
    });
    this.connections.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalConnections: this.connections.size,
      connectedCount: 0,
      connections: [] as { key: string; state: ConnectionState }[],
    };

    this.connections.forEach((connection, key) => {
      if (connection.isConnected()) {
        stats.connectedCount++;
      }
      stats.connections.push({ key, state: connection.getState() });
    });

    return stats;
  }
}

// Singleton instance
let sseClientInstance: SSEClientManager | null = null;

export function getSSEClient(): SSEClientManager {
  if (!sseClientInstance) {
    sseClientInstance = new SSEClientManager();
  }
  return sseClientInstance;
}

export function destroySSEClient(): void {
  if (sseClientInstance) {
    sseClientInstance.disconnectAll();
    sseClientInstance = null;
  }
}
