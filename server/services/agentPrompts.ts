/**
 * Agent Prompts - Manus 1.5 System Prompt
 * Contains the core system prompt and context building for the autonomous agent
 *
 * This file imports from the comprehensive prompts module and provides
 * backwards-compatible exports for existing code.
 */

import {
  MANUS_SYSTEM_PROMPT as FULL_MANUS_PROMPT,
  GHL_CONTEXT_PROMPT,
  TOOL_CONTEXT_PROMPT,
  buildManusSystemPrompt,
  TASK_PROMPTS,
  ERROR_PROMPTS,
  OBSERVATION_PROMPTS
} from '../prompts';

/**
 * The complete Manus 1.5 System Prompt with GHL-specific context
 * This is the comprehensive prompt including:
 * - Full agent loop architecture
 * - Planning system with phase capabilities
 * - GHL browser automation context
 * - Tool definitions and usage guidelines
 * - Error handling and recovery strategies
 */
export const MANUS_SYSTEM_PROMPT = FULL_MANUS_PROMPT + '\n\n' + GHL_CONTEXT_PROMPT + '\n\n' + TOOL_CONTEXT_PROMPT;

/**
 * Export individual prompt components for flexibility
 */
export {
  FULL_MANUS_PROMPT,
  GHL_CONTEXT_PROMPT,
  TOOL_CONTEXT_PROMPT,
  buildManusSystemPrompt,
  TASK_PROMPTS,
  ERROR_PROMPTS,
  OBSERVATION_PROMPTS
};

/**
 * RAG context interface for knowledge retrieval
 */
export interface RAGContext {
  taskKnowledge?: {
    taskId: string;
    taskName: string;
    tier: number;
    successCriteria: string[];
  };
  relevantSelectors?: {
    elementName: string;
    selector: string;
    reliability: number;
    fallbacks?: string[];
  }[];
  actionSequences?: {
    sequenceId: string;
    name: string;
    successRate: number;
    steps: string[];
  }[];
  errorPatterns?: {
    pattern: string;
    recoveryStrategy: string;
  }[];
}

/**
 * Build the complete system prompt with dynamic context
 * Backwards-compatible wrapper around buildManusSystemPrompt
 */
export function buildSystemPrompt(context?: {
  userId?: number;
  taskDescription?: string;
  userPreferences?: Record<string, unknown>;
  availableIntegrations?: string[];
  subAccountId?: string;
  ragContext?: RAGContext;
}): string {
  // Use the new comprehensive prompt builder
  let prompt = buildManusSystemPrompt({
    includeGHLContext: true,
    includeToolContext: true,
    currentDate: new Date(),
    userId: context?.userId,
    subAccountId: context?.subAccountId,
    availableIntegrations: context?.availableIntegrations || []
  });

  // Add task description if provided
  if (context?.taskDescription) {
    prompt += `\n\n<task_context>\nTask Description:\n${context.taskDescription}\n</task_context>`;
  }

  // Add user preferences if provided
  if (context?.userPreferences && Object.keys(context.userPreferences).length > 0) {
    prompt += `\n\n<user_preferences>\n${JSON.stringify(context.userPreferences, null, 2)}\n</user_preferences>`;
  }

  // Add RAG context if provided (knowledge from training system)
  if (context?.ragContext) {
    prompt += buildRAGContextPrompt(context.ragContext);
  }

  return prompt;
}

/**
 * Build RAG context prompt from retrieved knowledge
 */
function buildRAGContextPrompt(ragContext: RAGContext): string {
  let prompt = '\n\n<knowledge_context>\n';

  if (ragContext.taskKnowledge) {
    prompt += `**Task Knowledge**:
- Task: ${ragContext.taskKnowledge.taskName} (Tier ${ragContext.taskKnowledge.tier})
- Success Criteria: ${ragContext.taskKnowledge.successCriteria.join('; ')}\n\n`;
  }

  if (ragContext.relevantSelectors && ragContext.relevantSelectors.length > 0) {
    prompt += '**Cached Selectors** (use these for reliability):\n';
    for (const sel of ragContext.relevantSelectors) {
      prompt += `- ${sel.elementName}: \`${sel.selector}\` (${Math.round(sel.reliability * 100)}% reliable)\n`;
    }
    prompt += '\n';
  }

  if (ragContext.actionSequences && ragContext.actionSequences.length > 0) {
    prompt += '**Proven Action Sequences**:\n';
    for (const seq of ragContext.actionSequences) {
      prompt += `- ${seq.name} (${Math.round(seq.successRate * 100)}% success): ${seq.steps.length} steps\n`;
    }
    prompt += '\n';
  }

  if (ragContext.errorPatterns && ragContext.errorPatterns.length > 0) {
    prompt += '**Known Error Patterns**:\n';
    for (const err of ragContext.errorPatterns) {
      prompt += `- "${err.pattern}" → ${err.recoveryStrategy}\n`;
    }
  }

  prompt += '</knowledge_context>';
  return prompt;
}

/**
 * Build a user prompt for task execution
 */
export function buildTaskPrompt(taskDescription: string, additionalContext?: string): string {
  let prompt = `Please complete the following task:\n\n${taskDescription}`;

  if (additionalContext) {
    prompt += `\n\nAdditional Context:\n${additionalContext}`;
  }

  prompt += `\n\nBegin by analyzing the task and creating a clear plan with concrete phases.`;

  return prompt;
}

/**
 * Build a prompt for plan update based on tool result
 */
export function buildObservationPrompt(toolResult: unknown, toolName: string): string {
  return OBSERVATION_PROMPTS.success(toolName, toolResult);
}

/**
 * Build a prompt for error recovery
 */
export function buildErrorRecoveryPrompt(error: string, attemptCount: number): string {
  return OBSERVATION_PROMPTS.failure('previous_action', error, attemptCount);
}

/**
 * Build a GHL-specific task prompt
 */
export function buildGHLTaskPrompt(
  taskType: keyof typeof TASK_PROMPTS,
  params: Record<string, unknown>
): string {
  const promptBuilder = TASK_PROMPTS[taskType];
  if (typeof promptBuilder === 'function') {
    return promptBuilder(params as never);
  }
  return TASK_PROMPTS.genericGHLTask(JSON.stringify(params));
}

/**
 * Get error recovery prompt for specific error types
 */
export function getErrorRecoveryPrompt(
  errorType: 'auth' | 'element' | 'timeout' | 'rate_limit',
  context?: { selector?: string; operation?: string }
): string {
  switch (errorType) {
    case 'auth':
      return ERROR_PROMPTS.authFailure;
    case 'element':
      return ERROR_PROMPTS.elementNotFound(
        context?.selector || 'unknown',
        context?.operation || 'unknown context'
      );
    case 'timeout':
      return ERROR_PROMPTS.timeout(context?.operation || 'unknown operation');
    case 'rate_limit':
      return ERROR_PROMPTS.rateLimit;
    default:
      return ERROR_PROMPTS.authFailure;
  }
}
