/**
 * useAgentSSE Hook
 *
 * React hook for connecting to agent SSE (Server-Sent Events) stream.
 * Provides real-time updates for agent execution status.
 *
 * Server endpoints:
 * - /api/agent/stream/:executionId - Agent execution updates (requires auth)
 * - /api/ai/stream/:sessionId - AI browser session updates
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { getSSEClient, type ConnectionState } from '@/lib/sse-client';

interface SSEMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

interface UseAgentSSEOptions {
  /** Automatically connect when executionId is available */
  autoConnect?: boolean;
  /** Execution ID to subscribe to */
  executionId?: string | number;
  /** AI session ID to subscribe to (for browser sessions) */
  sessionId?: string;
}

export function useAgentSSE(options: UseAgentSSEOptions = {}) {
  const { autoConnect = true, executionId, sessionId } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setStatus, addLog, setConnectedAgents, handleSSEEvent, setActiveBrowserSession } = useAgentStore();

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback((id?: string | number) => {
    const targetExecutionId = id || executionId;
    const targetSessionId = sessionId;

    // Determine which endpoint to connect to
    let url: string;
    if (targetExecutionId) {
      url = `/api/agent/stream/${targetExecutionId}`;
      console.log('[SSE] Connecting to agent execution stream:', url);
    } else if (targetSessionId) {
      url = `/api/ai/stream/${targetSessionId}`;
      console.log('[SSE] Connecting to AI session stream:', url);
    } else {
      console.log('[SSE] No execution or session ID provided, skipping connection');
      return;
    }

    cleanup();
    setConnectionState('connecting');
    setError(null);

    try {
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        console.log('[SSE] Connected to:', url);
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
      };

      // Handle named events from server
      es.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage({ type: 'connected', data });
        } catch (e) {
          console.error('[SSE] Error parsing connected event:', e);
        }
      });

      es.addEventListener('thinking', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage({ type: 'thinking', data });
        } catch (e) {
          console.error('[SSE] Error parsing thinking event:', e);
        }
      });

      es.addEventListener('progress', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage({ type: 'progress', data });
        } catch (e) {
          console.error('[SSE] Error parsing progress event:', e);
        }
      });

      es.addEventListener('browser_session', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage({ type: 'browser:session', data });
        } catch (e) {
          console.error('[SSE] Error parsing browser_session event:', e);
        }
      });

      es.addEventListener('completed', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage({ type: 'execution:complete', data });
        } catch (e) {
          console.error('[SSE] Error parsing completed event:', e);
        }
      });

      es.addEventListener('error', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage({ type: 'execution:error', data });
        } catch (e) {
          console.error('[SSE] Error parsing error event:', e);
        }
      });

      // Handle generic message events
      es.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (e) {
          // Ignore non-JSON messages (like heartbeats)
          if (!event.data.startsWith(':')) {
            console.log('[SSE] Non-JSON message:', event.data);
          }
        }
      };

      es.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        setIsConnected(false);
        setConnectionState('error');
        setError('Connection lost');

        if (es.readyState === EventSource.CLOSED) {
          // Attempt reconnection with exponential backoff
          cleanup();
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[SSE] Attempting reconnection...');
            connect(targetExecutionId);
          }, 3000);
        }
      };

    } catch (err) {
      console.error('[SSE] Failed to create EventSource:', err);
      setConnectionState('error');
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [executionId, sessionId, cleanup]);

  const disconnect = useCallback(() => {
    console.log('[SSE] Disconnecting...');
    cleanup();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, [cleanup]);

  const handleMessage = (message: SSEMessage) => {
    const timestamp = message.timestamp || new Date().toLocaleTimeString();

    switch (message.type) {
      case 'connected':
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'system',
          message: 'Connected to agent stream',
        });
        break;

      case 'status':
        setStatus(message.data?.status || 'idle');
        break;

      case 'task_started':
        setStatus('executing');
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'info',
          message: 'Task started',
          detail: message.data?.task,
        });
        break;

      case 'task_completed':
        setStatus('completed');
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'success',
          message: 'Task completed',
          detail: message.message,
        });
        break;

      case 'task_failed':
        setStatus('failed');
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'error',
          message: 'Task failed',
          detail: message.message,
        });
        break;

      case 'step':
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'info',
          message: message.data?.action || 'Executing step',
          detail: message.data?.detail,
        });
        break;

      case 'tool_call':
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'info',
          message: `Tool: ${message.data?.tool}`,
          detail: message.data?.args ? JSON.stringify(message.data.args) : undefined,
        });
        break;

      case 'tool_result':
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'success',
          message: 'Tool completed',
          detail: message.data?.result?.substring(0, 100),
        });
        break;

      case 'thought':
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'system',
          message: 'Agent thinking',
          detail: message.data?.thought,
        });
        break;

      case 'swarm_update':
        setConnectedAgents(message.data?.agentCount || 0);
        break;

      case 'progress':
      case 'reasoning':
      case 'browser:session':
      case 'execution:started':
      case 'plan:created':
      case 'phase:start':
      case 'phase:complete':
      case 'execution:complete':
      case 'execution:error':
        // Handle all these events through the store's central handler
        handleSSEEvent({
          type: message.type,
          data: message.data || message,
        });
        break;

      case 'error':
        addLog({
          id: crypto.randomUUID(),
          timestamp,
          level: 'error',
          message: message.message || 'An error occurred',
        });
        break;

      default:
        // Log unknown message types for debugging
        console.log('[SSE] Unknown message type:', message.type);
    }
  };

  // Auto-connect when executionId or sessionId changes
  useEffect(() => {
    if (autoConnect && (executionId || sessionId)) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [autoConnect, executionId, sessionId, connect, cleanup]);

  return {
    isConnected,
    connectionState,
    error,
    connect,
    disconnect,
  };
}

// Re-export useAgentExecution for convenience
export { useAgentExecution } from './useAgentExecution';
