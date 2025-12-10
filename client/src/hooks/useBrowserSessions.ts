import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCallback } from "react";

/**
 * Hook for managing multiple browser sessions
 * Provides CRUD operations and real-time updates
 */
export function useBrowserSessions() {
  // Query for listing sessions - use browser router
  const sessionsQuery = trpc.browser.listSessions.useQuery(undefined, {
    retry: false,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Mutation for closing/terminating a session
  const closeSessionMutation = trpc.browser.closeSession.useMutation({
    onSuccess: () => {
      toast.success("Session terminated successfully");
      sessionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to terminate session: ${error.message}`);
    },
  });

  // Mutation for deleting a session
  const deleteSessionMutation = trpc.browser.deleteSession.useMutation({
    onSuccess: () => {
      toast.success("Session deleted successfully");
      sessionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    },
  });

  // Bulk operations mutations
  const bulkTerminateMutation = trpc.browser.bulkTerminate.useMutation({
    onSuccess: (data: { success: string[]; failed: Array<{ sessionId: string; error: string }> }) => {
      toast.success(`Terminated ${data.success.length} sessions`);
      if (data.failed.length > 0) {
        toast.warning(`Failed to terminate ${data.failed.length} sessions`);
      }
      sessionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Bulk terminate failed: ${error.message}`);
    },
  });

  const bulkDeleteMutation = trpc.browser.bulkDelete.useMutation({
    onSuccess: (data: { success: string[]; failed: Array<{ sessionId: string; error: string }> }) => {
      toast.success(`Deleted ${data.success.length} sessions`);
      if (data.failed.length > 0) {
        toast.warning(`Failed to delete ${data.failed.length} sessions`);
      }
      sessionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Bulk delete failed: ${error.message}`);
    },
  });

  const terminateSession = useCallback(
    async (sessionId: string) => {
      await closeSessionMutation.mutateAsync({ sessionId });
    },
    [closeSessionMutation]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await deleteSessionMutation.mutateAsync({ sessionId });
    },
    [deleteSessionMutation]
  );

  const bulkTerminate = useCallback(
    async (sessionIds: string[]) => {
      await bulkTerminateMutation.mutateAsync({ sessionIds });
    },
    [bulkTerminateMutation]
  );

  const bulkDelete = useCallback(
    async (sessionIds: string[]) => {
      await bulkDeleteMutation.mutateAsync({ sessionIds });
    },
    [bulkDeleteMutation]
  );

  return {
    sessions: sessionsQuery.data ?? [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,
    terminateSession,
    deleteSession,
    bulkTerminate,
    bulkDelete,
    isTerminating: closeSessionMutation.isPending || bulkTerminateMutation.isPending,
    isDeleting: deleteSessionMutation.isPending || bulkDeleteMutation.isPending,
  };
}
