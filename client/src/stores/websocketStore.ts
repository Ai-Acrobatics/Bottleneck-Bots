/**
 * WebSocket State Store
 * Manages WebSocket connection state and execution updates using Zustand
 */

import { create } from 'zustand';
import {
  getWebSocketManager,
  type ConnectionState,
  type ExecutionUpdate,
} from '@/lib/websocket';

export interface ExecutionState extends ExecutionUpdate {
  updatedAt: string;
}

interface WebSocketStore {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;

  // Active executions
  executions: Map<number, ExecutionState>;

  // Actions
  connect: () => void;
  disconnect: () => void;
  subscribeToTask: (taskId: number) => void;
  unsubscribeFromTask: (taskId: number) => void;
  subscribeToExecution: (executionId: number) => void;
  unsubscribeFromExecution: (executionId: number) => void;
  subscribeToAll: () => void;
  getExecution: (executionId: number) => ExecutionState | undefined;
  getActiveExecutions: () => ExecutionState[];
  clearExecution: (executionId: number) => void;
  clearAllExecutions: () => void;
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => {
  const wsManager = getWebSocketManager();

  // Setup task event handlers
  wsManager.on('task:started', (event) => {
    const execution = wsManager.getExecution(event.executionId);
    if (execution) {
      const state = get();
      const executionState: ExecutionState = {
        ...execution,
        updatedAt: new Date().toISOString(),
      };
      set({
        executions: new Map(state.executions).set(event.executionId, executionState),
      });
    }
  });

  wsManager.on('task:progress', (event) => {
    const execution = wsManager.getExecution(event.executionId);
    if (execution) {
      const state = get();
      const executionState: ExecutionState = {
        ...execution,
        updatedAt: new Date().toISOString(),
      };
      set({
        executions: new Map(state.executions).set(event.executionId, executionState),
      });
    }
  });

  wsManager.on('task:completed', (event) => {
    const execution = wsManager.getExecution(event.executionId);
    if (execution) {
      const state = get();
      const executionState: ExecutionState = {
        ...execution,
        updatedAt: new Date().toISOString(),
      };
      set({
        executions: new Map(state.executions).set(event.executionId, executionState),
      });
    }
  });

  wsManager.on('task:failed', (event) => {
    const execution = wsManager.getExecution(event.executionId);
    if (execution) {
      const state = get();
      const executionState: ExecutionState = {
        ...execution,
        updatedAt: new Date().toISOString(),
      };
      set({
        executions: new Map(state.executions).set(event.executionId, executionState),
      });
    }
  });

  wsManager.on('task:log', (event) => {
    const execution = wsManager.getExecution(event.executionId);
    if (execution) {
      const state = get();
      const executionState: ExecutionState = {
        ...execution,
        updatedAt: new Date().toISOString(),
      };
      set({
        executions: new Map(state.executions).set(event.executionId, executionState),
      });
    }
  });

  // Setup state change handler
  wsManager.onStateChange((connectionState: ConnectionState) => {
    set({
      connectionState,
      isConnected: connectionState === 'connected',
    });
  });

  return {
    connectionState: 'disconnected',
    isConnected: false,
    executions: new Map(),

    connect: () => {
      wsManager.connect();
    },

    disconnect: () => {
      wsManager.disconnect();
      set({ executions: new Map() });
    },

    subscribeToTask: (taskId: number) => {
      wsManager.subscribeToTask(taskId);
    },

    unsubscribeFromTask: (taskId: number) => {
      wsManager.unsubscribeFromTask(taskId);
    },

    subscribeToExecution: (executionId: number) => {
      wsManager.subscribeToExecution(executionId);
    },

    unsubscribeFromExecution: (executionId: number) => {
      wsManager.unsubscribeFromExecution(executionId);
    },

    subscribeToAll: () => {
      wsManager.subscribeToAll();
    },

    getExecution: (executionId: number) => {
      const execution = wsManager.getExecution(executionId);
      if (execution) {
        return {
          ...execution,
          updatedAt: new Date().toISOString(),
        };
      }
      return get().executions.get(executionId);
    },

    getActiveExecutions: () => {
      const executions = Array.from(get().executions.values());
      return executions.filter(
        (exec) => exec.status === 'running' || exec.status === 'queued'
      );
    },

    clearExecution: (executionId: number) => {
      const newExecutions = new Map(get().executions);
      newExecutions.delete(executionId);
      set({ executions: newExecutions });
    },

    clearAllExecutions: () => {
      set({ executions: new Map() });
    },
  };
});
