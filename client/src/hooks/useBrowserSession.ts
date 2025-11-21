import { trpc } from "@/lib/trpc";
import { useWebSocketStore } from "@/stores/websocketStore";

/**
 * Hook for managing a single browser session
 * Provides real-time updates via WebSocket
 */
export function useBrowserSession(sessionId: string | undefined) {
  const { connectionState } = useWebSocketStore();

  // Fetch session replay data
  const replayQuery = trpc.ai.getSessionReplay.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch session logs
  const logsQuery = trpc.ai.getSessionLogs.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch live view URL
  const liveViewQuery = trpc.ai.getSessionLiveView.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  return {
    session: replayQuery.data,
    logs: logsQuery.data?.logs ?? [],
    liveView: liveViewQuery.data,
    connectionState,
    isLoading: replayQuery.isLoading || logsQuery.isLoading || liveViewQuery.isLoading,
    error: replayQuery.error || logsQuery.error || liveViewQuery.error,
    refetch: () => {
      replayQuery.refetch();
      logsQuery.refetch();
      liveViewQuery.refetch();
    },
  };
}
