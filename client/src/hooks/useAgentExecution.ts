/**
 * useAgentExecution Hook
 *
 * Higher-level hook for managing agent execution lifecycle.
 * Wraps useAgentSSE and provides convenient methods for starting,
 * stopping, and monitoring agent executions.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAgentSSE } from './useAgentSSE';
import { useAgentStore } from '@/stores/agentStore';
import type { AgentExecution, ThinkingStep } from '@/types/agent';

interface UseAgentExecutionOptions {
  autoStart?: boolean;
  onComplete?: (execution: AgentExecution) => void;
  onError?: (error: string) => void;
}

interface ExecutionState {
  currentExecution: AgentExecution | null;
  thinkingSteps: ThinkingStep[];
  isExecuting: boolean;
  error: string | null;
}

export function useAgentExecution(options: UseAgentExecutionOptions = {}) {
  const { autoStart = false, onComplete, onError } = options;

  const [executionState, setExecutionState] = useState<ExecutionState>({
    currentExecution: null,
    thinkingSteps: [],
    isExecuting: false,
    error: null,
  });

  const { status, currentTask, logs, setStatus, setCurrentTask, addLog } =
    useAgentStore();

  // SSE connection - only connect when we have an active execution
  const { isConnected, connect, disconnect } = useAgentSSE({
    autoConnect: false,
  });

  // Track thinking steps from logs
  useEffect(() => {
    const steps: ThinkingStep[] = logs.map((log) => ({
      id: log.id,
      type: log.level === 'error' ? 'error' : 'thinking',
      content: log.message,
      timestamp: new Date(log.timestamp),
      metadata: log.detail ? { detail: log.detail } : undefined,
    }));

    setExecutionState((prev) => ({
      ...prev,
      thinkingSteps: steps,
    }));
  }, [logs]);

  // Update execution state based on store
  useEffect(() => {
    setExecutionState((prev) => ({
      ...prev,
      isExecuting: status === 'executing' || status === 'planning',
    }));
  }, [status]);

  // Start a new execution
  const startExecution = useCallback(
    async (task: string, metadata?: Record<string, any>) => {
      if (!task.trim()) {
        const error = 'Task description cannot be empty';
        setExecutionState((prev) => ({ ...prev, error }));
        onError?.(error);
        return null;
      }

      try {
        // Create execution object
        const execution: AgentExecution = {
          id: crypto.randomUUID(),
          task,
          status: 'planning',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata,
        };

        // Update state
        setExecutionState({
          currentExecution: execution,
          thinkingSteps: [],
          isExecuting: true,
          error: null,
        });

        // Update store
        setStatus('planning');
        setCurrentTask(task);

        // Connect to SSE stream
        connect();

        // Add initial log
        addLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          level: 'system',
          message: 'Execution started',
          detail: task,
        });

        // In production, this would call the API to start execution
        // For now, simulate the transition to executing
        setTimeout(() => {
          setStatus('executing');
          setExecutionState((prev) => ({
            ...prev,
            currentExecution: prev.currentExecution
              ? {
                  ...prev.currentExecution,
                  status: 'executing',
                  updatedAt: new Date(),
                }
              : null,
          }));
        }, 1000);

        return execution.id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to start execution';
        setExecutionState((prev) => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
        return null;
      }
    },
    [setStatus, setCurrentTask, addLog, connect, onError]
  );

  // Cancel current execution
  const cancelExecution = useCallback(async () => {
    if (!executionState.currentExecution) {
      return;
    }

    try {
      // Update execution state
      setExecutionState((prev) => ({
        ...prev,
        currentExecution: prev.currentExecution
          ? {
              ...prev.currentExecution,
              status: 'cancelled',
              completedAt: new Date(),
              updatedAt: new Date(),
            }
          : null,
        isExecuting: false,
      }));

      // Update store
      setStatus('idle');
      setCurrentTask(null);

      // Disconnect SSE
      disconnect();

      // Add log
      addLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        level: 'warning',
        message: 'Execution cancelled',
      });

      // In production, this would call the API to cancel execution
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to cancel execution';
      setExecutionState((prev) => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [
    executionState.currentExecution,
    setStatus,
    setCurrentTask,
    disconnect,
    addLog,
    onError,
  ]);

  // Pause execution
  const pauseExecution = useCallback(() => {
    if (status === 'executing') {
      setStatus('paused');

      addLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        level: 'system',
        message: 'Execution paused',
      });
    }
  }, [status, setStatus, addLog]);

  // Resume execution
  const resumeExecution = useCallback(() => {
    if (status === 'paused') {
      setStatus('executing');

      addLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        level: 'system',
        message: 'Execution resumed',
      });
    }
  }, [status, setStatus, addLog]);

  // Mark execution as complete
  const completeExecution = useCallback(
    (result?: any) => {
      if (!executionState.currentExecution) {
        return;
      }

      const completedExecution: AgentExecution = {
        ...executionState.currentExecution,
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
        result,
      };

      setExecutionState((prev) => ({
        ...prev,
        currentExecution: completedExecution,
        isExecuting: false,
      }));

      setStatus('completed');

      addLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        level: 'success',
        message: 'Execution completed',
      });

      disconnect();

      onComplete?.(completedExecution);
    },
    [executionState.currentExecution, setStatus, addLog, disconnect, onComplete]
  );

  // Mark execution as failed
  const failExecution = useCallback(
    (error: string) => {
      if (!executionState.currentExecution) {
        return;
      }

      const failedExecution: AgentExecution = {
        ...executionState.currentExecution,
        status: 'failed',
        completedAt: new Date(),
        updatedAt: new Date(),
        error,
      };

      setExecutionState((prev) => ({
        ...prev,
        currentExecution: failedExecution,
        isExecuting: false,
        error,
      }));

      setStatus('error');

      addLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
        message: 'Execution failed',
        detail: error,
      });

      disconnect();

      onError?.(error);
    },
    [executionState.currentExecution, setStatus, addLog, disconnect, onError]
  );

  // Add thinking step
  const addThinkingStep = useCallback(
    (
      type: ThinkingStep['type'],
      content: string,
      metadata?: ThinkingStep['metadata']
    ) => {
      const step: ThinkingStep = {
        id: crypto.randomUUID(),
        type,
        content,
        timestamp: new Date(),
        metadata,
      };

      setExecutionState((prev) => ({
        ...prev,
        thinkingSteps: [...prev.thinkingSteps, step],
      }));

      // Also add to logs
      addLog({
        id: step.id,
        timestamp: step.timestamp.toLocaleTimeString(),
        level: type === 'error' ? 'error' : 'info',
        message: content,
        detail: metadata ? JSON.stringify(metadata) : undefined,
      });
    },
    [addLog]
  );

  return {
    // State
    currentExecution: executionState.currentExecution,
    thinkingSteps: executionState.thinkingSteps,
    isExecuting: executionState.isExecuting,
    error: executionState.error,
    isConnected,

    // Actions
    startExecution,
    cancelExecution,
    pauseExecution,
    resumeExecution,
    completeExecution,
    failExecution,
    addThinkingStep,
  };
}
