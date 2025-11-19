import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

/**
 * Hook for AI chat/execute actions with browser automation
 * Supports geo-location and session tracking
 */
export function useAIChat() {
  const mutation = trpc.ai.chat.useMutation();

  const execute = useCallback(
    async (params: {
      instruction: string;
      startUrl?: string;
      geolocation?: {
        city?: string;
        state?: string;
        country?: string;
      };
      modelName?: string;
    }) => {
      return await mutation.mutateAsync({
        messages: [{ role: "user", content: params.instruction }],
        startUrl: params.startUrl,
        geolocation: params.geolocation,
        modelName: params.modelName,
      });
    },
    [mutation]
  );

  return {
    execute,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook for observing pages and getting actionable steps
 * Returns an array of actions that can be executed
 */
export function useObservePage() {
  const mutation = trpc.ai.observePage.useMutation();

  const observe = useCallback(
    async (params: {
      url: string;
      instruction: string;
      geolocation?: {
        city?: string;
        state?: string;
        country?: string;
      };
      modelName?: string;
    }) => {
      return await mutation.mutateAsync(params);
    },
    [mutation]
  );

  return {
    observe,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook for executing multiple observed actions sequentially
 * Useful for form filling and multi-step workflows
 */
export function useExecuteActions() {
  const mutation = trpc.ai.executeActions.useMutation();

  const execute = useCallback(
    async (params: {
      url: string;
      instruction: string;
      geolocation?: {
        city?: string;
        state?: string;
        country?: string;
      };
      modelName?: string;
    }) => {
      return await mutation.mutateAsync(params);
    },
    [mutation]
  );

  return {
    execute,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook for extracting structured data from pages using AI
 * Supports custom Zod schemas for type-safe extraction
 */
export function useExtractData() {
  const mutation = trpc.ai.extractData.useMutation();

  const extract = useCallback(
    async (params: {
      url: string;
      instruction: string;
      schemaType: "contactInfo" | "productInfo" | "custom";
      geolocation?: {
        city?: string;
        state?: string;
        country?: string;
      };
      modelName?: string;
    }) => {
      return await mutation.mutateAsync(params);
    },
    [mutation]
  );

  return {
    extract,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook for retrieving session replay data
 * Returns rrweb events that can be used with rrweb-player
 */
export function useSessionReplay(sessionId?: string) {
  const query = trpc.ai.getSessionReplay.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  return {
    replay: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for retrieving session logs for debugging
 */
export function useSessionLogs(sessionId?: string) {
  const query = trpc.ai.getSessionLogs.useQuery(
    { sessionId: sessionId! },
    {
      enabled: Boolean(sessionId),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  return {
    logs: query.data?.logs ?? [],
    message: query.data?.message,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for listing all active browser sessions
 */
export function useListSessions() {
  const query = trpc.ai.listSessions.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    sessions: query.data?.sessions ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for executing multi-tab workflows
 * Note: Multi-tab replays may be unreliable. Use Live View for monitoring.
 */
export function useMultiTabWorkflow() {
  const mutation = trpc.ai.multiTabWorkflow.useMutation();

  const execute = useCallback(
    async (params: {
      tabs: Array<{
        url: string;
        instruction?: string;
      }>;
      geolocation?: {
        city?: string;
        state?: string;
        country?: string;
      };
      modelName?: string;
    }) => {
      return await mutation.mutateAsync(params);
    },
    [mutation]
  );

  return {
    execute,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Comprehensive hook that provides all AI browser automation features
 * Use this for components that need multiple AI capabilities
 */
export function useAI() {
  const chat = useAIChat();
  const observe = useObservePage();
  const executeActions = useExecuteActions();
  const extract = useExtractData();
  const listSessions = useListSessions();
  const multiTab = useMultiTabWorkflow();

  return {
    chat,
    observe,
    executeActions,
    extract,
    listSessions,
    multiTab,
  };
}
