import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCallback } from "react";

/**
 * Hook for managing multiple browser sessions
 * Provides CRUD operations and real-time updates
 */
export function useBrowserSessions() {
  // Query for listing sessions
  const sessionsQuery = trpc.ai.listSessions.useQuery(undefined, {
    retry: false,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Mutation for terminating a session
  const terminateSessionMutation = trpc.ai.terminateSession.useMutation({
    onSuccess: () => {
      toast.success("Session terminated successfully");
      sessionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to terminate session: ${error.message}`);
    },
  });

  // Mutation for deleting a session (placeholder - you may need to add this endpoint)
  const deleteSessionMutation = trpc.ai.deleteSession.useMutation({
    onSuccess: () => {
      toast.success("Session deleted successfully");
      sessionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    },
  });

  const terminateSession = useCallback(
    async (sessionId: string) => {
      await terminateSessionMutation.mutateAsync({ sessionId });
    },
    [terminateSessionMutation]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await deleteSessionMutation.mutateAsync({ sessionId });
    },
    [deleteSessionMutation]
  );

  const bulkTerminate = useCallback(
    async (sessionIds: string[]) => {
      const promises = sessionIds.map((id) => terminateSessionMutation.mutateAsync({ sessionId: id }));
      await Promise.all(promises);
      toast.success(`Terminated ${sessionIds.length} sessions`);
      sessionsQuery.refetch();
    },
    [terminateSessionMutation, sessionsQuery]
  );

  const bulkDelete = useCallback(
    async (sessionIds: string[]) => {
      const promises = sessionIds.map((id) => deleteSessionMutation.mutateAsync({ sessionId: id }));
      await Promise.all(promises);
      toast.success(`Deleted ${sessionIds.length} sessions`);
      sessionsQuery.refetch();
    },
    [deleteSessionMutation, sessionsQuery]
  );

  return {
    sessions: sessionsQuery.data?.sessions ?? [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,
    terminateSession,
    deleteSession,
    bulkTerminate,
    bulkDelete,
    isTerminating: terminateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
}
