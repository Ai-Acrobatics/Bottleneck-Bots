import { trpc } from "@/lib/trpc";
import { useEffect, useState, useRef, useCallback } from "react";
import type { ConnectionState } from "@/lib/sse-client";

interface SessionUpdate {
  type: string;
  data?: any;
  sessionId?: string;
  timestamp?: string;
}

/**
 * Hook for managing a single browser session
 * Provides real-time updates via SSE (Server-Sent Events) and backend data
 */
export function useBrowserSession(sessionId: string | undefined) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [realtimeSession, setRealtimeSession] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch session history/logs from Stagehand
  const historyQuery = trpc.browser.getHistory.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch session metrics and cost
  const metricsQuery = trpc.browser.getSessionMetrics.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
      refetchInterval: 10000, // Refresh every 10 seconds for active sessions
    }
  );

  // Fetch debug URL
  const debugUrlQuery = trpc.browser.getDebugUrl.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
    }
  );

  // Fetch recording URL
  const recordingQuery = trpc.browser.getRecording.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
    }
  );

  // Handle SSE message
  const handleSSEMessage = useCallback((message: SessionUpdate) => {
    switch (message.type) {
      case 'connected':
        console.log('[BrowserSession SSE] Connected to session stream');
        break;

      case 'session_update':
      case 'progress':
        setRealtimeSession((prev: any) => ({
          ...prev,
          ...message.data,
        }));
        break;

      case 'page_navigated':
        setRealtimeSession((prev: any) => ({
          ...prev,
          currentUrl: message.data?.url,
          currentTitle: message.data?.title,
        }));
        // Refetch metrics when navigation occurs
        metricsQuery.refetch();
        break;

      case 'action_completed':
        setRealtimeSession((prev: any) => ({
          ...prev,
          lastAction: message.data,
        }));
        // Refetch history when action completes
        historyQuery.refetch();
        break;

      case 'session_ended':
        setRealtimeSession((prev: any) => ({
          ...prev,
          status: 'completed',
          endedAt: message.data?.endedAt,
        }));
        break;

      case 'error':
        setRealtimeSession((prev: any) => ({
          ...prev,
          error: message.data?.error,
        }));
        break;

      default:
        console.log('[BrowserSession SSE] Unknown message type:', message.type);
    }
  }, [historyQuery, metricsQuery]);

  // SSE subscription for real-time session updates
  useEffect(() => {
    if (!sessionId) return;

    const url = `/api/ai/stream/${sessionId}`;
    console.log('[BrowserSession SSE] Connecting to:', url);
    setConnectionState('connecting');

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('[BrowserSession SSE] Connected');
      setConnectionState('connected');
    };

    // Handle named events
    es.addEventListener('connected', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        handleSSEMessage({ type: 'connected', data, sessionId });
      } catch (e) {
        console.error('[BrowserSession SSE] Error parsing event:', e);
      }
    });

    // Handle generic messages
    es.onmessage = (event: MessageEvent) => {
      try {
        const message: SessionUpdate = JSON.parse(event.data);
        handleSSEMessage(message);
      } catch (e) {
        // Ignore non-JSON messages (heartbeats, comments)
        if (!event.data.startsWith(':')) {
          console.log('[BrowserSession SSE] Non-JSON message:', event.data);
        }
      }
    };

    es.onerror = (error) => {
      console.error('[BrowserSession SSE] Connection error:', error);
      setConnectionState('error');

      if (es.readyState === EventSource.CLOSED) {
        setConnectionState('disconnected');
      }
    };

    return () => {
      console.log('[BrowserSession SSE] Disconnecting');
      es.close();
      eventSourceRef.current = null;
      setConnectionState('disconnected');
    };
  }, [sessionId, handleSSEMessage]);

  // Convert Stagehand history to log format
  const logs = historyQuery.data?.history?.map((entry: any, index: number) => ({
    timestamp: entry.timestamp || new Date().toISOString(),
    level: (entry.result?.error ? 'error' : 'info') as 'error' | 'info' | 'warn' | 'debug',
    message: `${entry.method}: ${entry.result?.error || 'Success'}`,
    data: entry.args || entry.result,
  })) || [];

  return {
    session: realtimeSession,
    logs,
    history: historyQuery.data,
    metrics: metricsQuery.data,
    debugUrl: debugUrlQuery.data?.debugUrl,
    recordingUrl: recordingQuery.data?.recordingUrl,
    recordingStatus: recordingQuery.data?.status,
    connectionState,
    isLoading: historyQuery.isLoading || metricsQuery.isLoading,
    error: historyQuery.error || metricsQuery.error || debugUrlQuery.error || recordingQuery.error,
    refetch: () => {
      historyQuery.refetch();
      metricsQuery.refetch();
      debugUrlQuery.refetch();
      recordingQuery.refetch();
    },
  };
}
