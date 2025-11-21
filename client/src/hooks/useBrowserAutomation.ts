/**
 * Real Browser Automation Hook
 * Uses tRPC workflows.execute for actual Browserbase/Stagehand automation
 * Replaces mock automation with real browser control
 */

import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export interface BrowserStep {
  id: string;
  action: string;
  target: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'running' | 'done';
}

export interface ExecuteStepResult {
  success: boolean;
  logs: Array<{
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success' | 'system';
    message: string;
    detail?: string;
  }>;
  screenshot?: string;
  duration: number;
}

/**
 * Hook for real browser automation using Browserbase/Stagehand
 */
export function useBrowserAutomation() {
  const [sessionId, setSessionId] = useState<string | undefined>();

  // Use the real workflows.execute mutation
  const executeWorkflow = trpc.workflows.execute.useMutation();

  /**
   * Execute a browser step using real Browserbase automation
   * Converts Dashboard steps to workflow format and executes via tRPC
   */
  const executeStep = async (step: BrowserStep): Promise<ExecuteStepResult> => {
    const startTime = Date.now();

    try {
      // Convert Dashboard step format to workflow step format
      const workflowStep = convertToWorkflowStep(step);

      // Execute using real Browserbase/Stagehand via tRPC
      const result = await executeWorkflow.mutateAsync({
        workflowId: 1, // PLACEHOLDER: Use actual workflow ID
        variables: {
          steps: [workflowStep],
        },
      });

      const duration = Date.now() - startTime;

      // Store session ID for reuse
      if (result.sessionId) {
        setSessionId(result.sessionId);
      }

      // Convert result to Dashboard format
      return {
        success: result.success,
        logs: [
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
            level: result.success ? 'success' : 'error',
            message: result.success
              ? `Executed ${step.action} on ${step.target}`
              : `Failed: ${step.action}`,
            detail: result.error || result.message,
          },
        ],
        screenshot: result.screenshot,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        logs: [
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
            level: 'error',
            message: `Browser automation failed: ${step.action}`,
            detail: error.message || 'Unknown error occurred',
          },
        ],
        duration,
      };
    }
  };

  /**
   * Execute a complete plan using real browser automation
   */
  const executePlan = async (
    description: string,
    steps: BrowserStep[]
  ): Promise<{
    success: boolean;
    sessionId?: string;
    sessionUrl?: string;
    message: string;
  }> => {
    try {
      // Convert all steps to workflow format
      const workflowSteps = steps.map(convertToWorkflowStep);

      // Execute entire workflow using real Browserbase/Stagehand
      const result = await executeWorkflow.mutateAsync({
        workflowId: 1, // PLACEHOLDER: Create dynamic workflow ID
        variables: {
          description,
          steps: workflowSteps,
        },
      });

      if (result.sessionId) {
        setSessionId(result.sessionId);
      }

      return {
        success: result.success,
        sessionId: result.sessionId,
        sessionUrl: result.sessionUrl,
        message: result.message || 'Workflow executed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Workflow execution failed',
      };
    }
  };

  return {
    executeStep,
    executePlan,
    sessionId,
    isExecuting: executeWorkflow.isPending,
  };
}

/**
 * Convert Dashboard step format to workflow step format
 */
function convertToWorkflowStep(step: BrowserStep): {
  type: 'navigate' | 'act' | 'observe' | 'extract' | 'wait';
  order: number;
  config: Record<string, any>;
} {
  // Parse action to determine step type
  const action = step.action.toLowerCase();

  if (action.includes('navigate') || action.includes('goto') || action.includes('open')) {
    return {
      type: 'navigate',
      order: parseInt(step.id) || 0,
      config: {
        url: step.target,
      },
    };
  }

  if (action.includes('click') || action.includes('fill') || action.includes('type') || action.includes('submit')) {
    return {
      type: 'act',
      order: parseInt(step.id) || 0,
      config: {
        instruction: `${step.action} on element matching: ${step.target}`,
      },
    };
  }

  if (action.includes('extract') || action.includes('scrape') || action.includes('get')) {
    return {
      type: 'extract',
      order: parseInt(step.id) || 0,
      config: {
        extractInstruction: step.action,
        schemaType: 'custom',
      },
    };
  }

  if (action.includes('wait')) {
    return {
      type: 'wait',
      order: parseInt(step.id) || 0,
      config: {
        waitMs: 2000,
      },
    };
  }

  // Default to act for unknown actions
  return {
    type: 'act',
    order: parseInt(step.id) || 0,
    config: {
      instruction: `${step.action}: ${step.target}`,
    },
  };
}
