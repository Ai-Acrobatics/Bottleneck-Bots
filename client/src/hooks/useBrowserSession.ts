import { trpc } from "@/lib/trpc";
import { useWebSocketStore } from "@/stores/websocketStore";
import { useEffect, useState } from "react";

/**
 * Hook for managing a single browser session
 * Provides real-time updates via WebSocket and backend data
 */
export function useBrowserSession(sessionId: string | undefined) {
  const { connectionState, subscribe } = useWebSocketStore();
  const [realtimeSession, setRealtimeSession] = useState<any>(null);

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

  // Subscribe to WebSocket updates for this session
  useEffect(() => {
    if (!sessionId) return;

    const handlers = {
      'browser:navigation': (data: any) => {
        if (data.sessionId === sessionId) {
          setRealtimeSession((prev: any) => ({ ...prev, url: data.url }));
        }
      },
      'browser:action': (data: any) => {
        if (data.sessionId === sessionId) {
          setRealtimeSession((prev: any) => ({
            ...prev,
            lastAction: data.action,
            lastActionTime: data.timestamp,
          }));
        }
      },
      'browser:data:extracted': (data: any) => {
        if (data.sessionId === sessionId) {
          setRealtimeSession((prev: any) => ({
            ...prev,
            lastExtraction: data,
          }));
        }
      },
      'browser:session:closed': (data: any) => {
        if (data.sessionId === sessionId) {
          setRealtimeSession((prev: any) => ({ ...prev, status: 'closed' }));
        }
      },
    };

    const unsubscribe = subscribe(handlers);
    return () => unsubscribe();
  }, [sessionId, subscribe]);

  // Convert Stagehand history to log format
  const logs = historyQuery.data?.history?.map((entry: any, index: number) => ({
    timestamp: entry.timestamp || new Date().toISOString(),
    level: entry.result?.error ? 'error' : 'info',
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
