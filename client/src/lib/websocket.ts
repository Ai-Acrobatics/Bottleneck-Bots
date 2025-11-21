/**
 * WebSocket Client Manager
 * Provides reliable WebSocket connection with auto-reconnection using Socket.io
 */

import { io, Socket } from 'socket.io-client';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export type ExecutionStatus = 'queued' | 'running' | 'success' | 'failed' | 'timeout';

export interface ExecutionLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
}

export interface ExecutionUpdate {
  executionId: number;
  taskId: number;
  taskName: string;
  status: ExecutionStatus;
  progress: number;
  currentStep?: string;
  stepsCompleted: number;
  stepsTotal: number;
  startedAt: string;
  duration?: number;
  logs: ExecutionLogEntry[];
  error?: string;
}

// Socket.io event types
export interface TaskStartedEvent {
  taskId: number;
  executionId: number;
  taskName: string;
  userId: number;
  startedAt: Date;
  automationType: string;
  attemptNumber: number;
}

export interface TaskProgressEvent {
  taskId: number;
  executionId: number;
  progress: number;
  currentStep?: string;
  stepsCompleted: number;
  stepsTotal: number;
  message?: string;
}

export interface TaskCompletedEvent {
  taskId: number;
  executionId: number;
  taskName: string;
  userId: number;
  success: boolean;
  duration: number;
  completedAt: Date;
  output?: any;
  stepsCompleted: number;
  stepsTotal: number;
  recordingUrl?: string;
}

export interface TaskFailedEvent {
  taskId: number;
  executionId: number;
  taskName: string;
  userId: number;
  error: string;
  errorStack?: string;
  failedAt: Date;
  duration: number;
  stepsCompleted: number;
  stepsTotal: number;
  attemptNumber: number;
  willRetry: boolean;
}

export interface TaskLogEvent {
  taskId: number;
  executionId: number;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
}

export type TaskEventHandler = (event: any) => void;
export type StateChangeHandler = (state: ConnectionState) => void;

export class WebSocketManager {
  private socket: Socket | null = null;
  private state: ConnectionState = 'disconnected';
  private eventHandlers: Map<string, Set<TaskEventHandler>> = new Map();
  private stateChangeHandlers: Set<StateChangeHandler> = new Set();
  private executionStates: Map<number, ExecutionUpdate> = new Map();

  /**
   * Connect to Socket.io server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.setState('connecting');
    console.log('[WebSocket] Connecting to Socket.io server...');

    this.socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      withCredentials: true,
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...');

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.setState('disconnected');
    this.executionStates.clear();
  }

  /**
   * Subscribe to task updates
   */
  subscribeToTask(taskId: number): void {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot subscribe, not connected');
      return;
    }

    console.log(`[WebSocket] Subscribing to task ${taskId}`);
    this.socket.emit('subscribe:task', taskId);
  }

  /**
   * Unsubscribe from task updates
   */
  unsubscribeFromTask(taskId: number): void {
    if (!this.socket) return;

    console.log(`[WebSocket] Unsubscribing from task ${taskId}`);
    this.socket.emit('unsubscribe:task', taskId);
  }

  /**
   * Subscribe to execution updates
   */
  subscribeToExecution(executionId: number): void {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot subscribe, not connected');
      return;
    }

    console.log(`[WebSocket] Subscribing to execution ${executionId}`);
    this.socket.emit('subscribe:execution', executionId);
  }

  /**
   * Unsubscribe from execution updates
   */
  unsubscribeFromExecution(executionId: number): void {
    if (!this.socket) return;

    console.log(`[WebSocket] Unsubscribing from execution ${executionId}`);
    this.socket.emit('unsubscribe:execution', executionId);
  }

  /**
   * Subscribe to all execution updates (for dashboard widget)
   */
  subscribeToAll(): void {
    // In Socket.io implementation, users are automatically subscribed to their own events
    // via the user:{userId} room. No additional action needed.
    console.log('[WebSocket] Subscribed to all user executions');
  }

  /**
   * Add event handler for specific event type
   */
  on(event: string, handler: TaskEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Add state change handler
   */
  onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler);
    // Immediately call with current state
    handler(this.state);
    return () => this.stateChangeHandlers.delete(handler);
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Get execution state by ID
   */
  getExecution(executionId: number): ExecutionUpdate | undefined {
    return this.executionStates.get(executionId);
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): ExecutionUpdate[] {
    return Array.from(this.executionStates.values()).filter(
      (exec) => exec.status === 'running' || exec.status === 'queued'
    );
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      state: this.state,
      connected: this.socket?.connected || false,
      executionCount: this.executionStates.size,
      activeExecutionCount: this.getActiveExecutions().length,
    };
  }

  /**
   * Setup Socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected to Socket.io server');
      this.setState('connected');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.setState('disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error);
      this.setState('error');
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`[WebSocket] Reconnected after ${attemptNumber} attempts`);
      this.setState('connected');
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`[WebSocket] Reconnection attempt ${attemptNumber}`);
      this.setState('connecting');
    });

    // Welcome message
    this.socket.on('connected', (data: any) => {
      console.log('[WebSocket] Welcome message:', data);
    });

    // Task lifecycle events
    this.socket.on('task:started', (event: TaskStartedEvent) => {
      console.log('[WebSocket] Task started:', event.taskId, event.executionId);
      this.updateExecutionState(event, 'running');
      this.notifyHandlers('task:started', event);
    });

    this.socket.on('task:progress', (event: TaskProgressEvent) => {
      this.updateExecutionProgress(event);
      this.notifyHandlers('task:progress', event);
    });

    this.socket.on('task:completed', (event: TaskCompletedEvent) => {
      console.log('[WebSocket] Task completed:', event.taskId, event.executionId);
      this.updateExecutionState(event, 'success');
      this.notifyHandlers('task:completed', event);
    });

    this.socket.on('task:failed', (event: TaskFailedEvent) => {
      console.log('[WebSocket] Task failed:', event.taskId, event.executionId);
      this.updateExecutionState(event, 'failed');
      this.notifyHandlers('task:failed', event);
    });

    this.socket.on('task:log', (event: TaskLogEvent) => {
      this.addExecutionLog(event);
      this.notifyHandlers('task:log', event);
    });
  }

  /**
   * Update execution state from task started/completed/failed events
   */
  private updateExecutionState(event: any, status: ExecutionStatus): void {
    const existing = this.executionStates.get(event.executionId);

    const update: ExecutionUpdate = {
      executionId: event.executionId,
      taskId: event.taskId,
      taskName: event.taskName,
      status,
      progress: status === 'success' ? 100 : existing?.progress || 0,
      currentStep: existing?.currentStep,
      stepsCompleted: event.stepsCompleted || existing?.stepsCompleted || 0,
      stepsTotal: event.stepsTotal || existing?.stepsTotal || 0,
      startedAt: event.startedAt?.toString() || event.completedAt?.toString() || new Date().toISOString(),
      duration: event.duration,
      logs: existing?.logs || [],
      error: event.error,
    };

    this.executionStates.set(event.executionId, update);
  }

  /**
   * Update execution progress
   */
  private updateExecutionProgress(event: TaskProgressEvent): void {
    const existing = this.executionStates.get(event.executionId);

    if (existing) {
      existing.progress = event.progress;
      existing.currentStep = event.currentStep;
      existing.stepsCompleted = event.stepsCompleted;
      existing.stepsTotal = event.stepsTotal;
    } else {
      // Create new execution state if it doesn't exist
      this.executionStates.set(event.executionId, {
        executionId: event.executionId,
        taskId: event.taskId,
        taskName: 'Unknown Task',
        status: 'running',
        progress: event.progress,
        currentStep: event.currentStep,
        stepsCompleted: event.stepsCompleted,
        stepsTotal: event.stepsTotal,
        startedAt: new Date().toISOString(),
        logs: [],
      });
    }
  }

  /**
   * Add log entry to execution
   */
  private addExecutionLog(event: TaskLogEvent): void {
    const existing = this.executionStates.get(event.executionId);

    if (existing) {
      existing.logs.push({
        timestamp: event.timestamp.toString(),
        level: event.level,
        message: event.message,
        metadata: event.metadata,
      });
    }
  }

  /**
   * Notify all registered handlers for an event
   */
  private notifyHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[WebSocket] Error in event handler:', error);
        }
      });
    }
  }

  /**
   * Update connection state and notify handlers
   */
  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      console.log('[WebSocket] State changed to:', state);

      this.stateChangeHandlers.forEach((handler) => {
        try {
          handler(state);
        } catch (error) {
          console.error('[WebSocket] Error in state change handler:', error);
        }
      });
    }
  }
}

// Singleton instance for global use
let wsManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManagerInstance) {
    wsManagerInstance = new WebSocketManager();
  }
  return wsManagerInstance;
}

export function destroyWebSocketManager(): void {
  if (wsManagerInstance) {
    wsManagerInstance.disconnect();
    wsManagerInstance = null;
  }
}
