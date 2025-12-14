/**
 * GHL Agency AI - Prompt System
 * Exports all prompts and prompt builders for the Manus agent
 */

export {
  MANUS_SYSTEM_PROMPT,
  GHL_CONTEXT_PROMPT,
  TOOL_CONTEXT_PROMPT,
  buildManusSystemPrompt,
  DEFAULT_CAPABILITIES,
  type PhaseCapabilities
} from './manus-system';

/**
 * Task-specific prompt templates
 */
export const TASK_PROMPTS = {
  /**
   * Prompt for GHL workflow creation tasks
   */
  workflowCreation: (params: {
    workflowName: string;
    triggerType: string;
    actions: string[];
  }) => `Create a GHL workflow with the following specifications:

**Workflow Name**: ${params.workflowName}
**Trigger Type**: ${params.triggerType}
**Actions**: ${params.actions.join(', ')}

Steps to follow:
1. Navigate to GHL Workflows section
2. Create a new workflow with the specified name
3. Configure the trigger (${params.triggerType})
4. Add each action in sequence
5. Test the workflow configuration
6. Activate the workflow
7. Confirm success and report back`,

  /**
   * Prompt for contact management tasks
   */
  contactManagement: (params: {
    operation: 'create' | 'update' | 'tag' | 'delete';
    contactData?: Record<string, string>;
    tags?: string[];
  }) => `Perform contact ${params.operation} operation in GHL:

**Operation**: ${params.operation}
${params.contactData ? `**Contact Data**: ${JSON.stringify(params.contactData, null, 2)}` : ''}
${params.tags ? `**Tags**: ${params.tags.join(', ')}` : ''}

Follow GHL best practices for contact management.`,

  /**
   * Prompt for email campaign creation
   */
  emailCampaign: (params: {
    campaignName: string;
    subject: string;
    targetList?: string;
  }) => `Create an email campaign in GHL:

**Campaign Name**: ${params.campaignName}
**Email Subject**: ${params.subject}
${params.targetList ? `**Target List**: ${params.targetList}` : ''}

Ensure proper email configuration and test before sending.`,

  /**
   * Prompt for funnel building
   */
  funnelBuilder: (params: {
    funnelName: string;
    pages: string[];
    template?: string;
  }) => `Build a funnel in GHL:

**Funnel Name**: ${params.funnelName}
**Pages**: ${params.pages.join(' → ')}
${params.template ? `**Template**: ${params.template}` : ''}

Create each page with proper navigation and CTAs.`,

  /**
   * Generic GHL task prompt
   */
  genericGHLTask: (taskDescription: string) => `Execute the following GHL task:

${taskDescription}

Use browser automation to interact with GHL's interface. Take screenshots at key steps for verification. Report progress and any issues encountered.`
};

/**
 * Error recovery prompts
 */
export const ERROR_PROMPTS = {
  /**
   * Authentication failure recovery
   */
  authFailure: `The GHL session appears to have expired or authentication failed.

Recovery steps:
1. Check if we're on a login page
2. If credentials are available, attempt re-authentication
3. If not, ask the user to provide credentials or manually log in
4. Verify successful authentication before continuing`,

  /**
   * Element not found recovery
   */
  elementNotFound: (selector: string, context: string) => `Could not find element: ${selector}
Context: ${context}

Recovery steps:
1. Wait for page to fully load
2. Try alternative selectors from the cache
3. Take a screenshot to verify page state
4. If element doesn't exist, the UI may have changed - adapt approach`,

  /**
   * Timeout recovery
   */
  timeout: (operation: string) => `Operation timed out: ${operation}

Recovery steps:
1. Check if the page is still responsive
2. Verify network connectivity
3. Retry with longer timeout
4. If persistent, break operation into smaller steps`,

  /**
   * Rate limit recovery
   */
  rateLimit: `Rate limit encountered.

Recovery steps:
1. Wait for the specified cooldown period
2. Reduce request frequency
3. If critical, inform user of delay`
};

/**
 * Observation prompts for tool results
 */
export const OBSERVATION_PROMPTS = {
  /**
   * Success observation
   */
  success: (toolName: string, result: unknown) =>
    `Tool "${toolName}" executed successfully.\n\nResult:\n${JSON.stringify(result, null, 2)}\n\nAnalyze this result and determine your next action.`,

  /**
   * Failure observation
   */
  failure: (toolName: string, error: string, attemptCount: number) => {
    let prompt = `Tool "${toolName}" failed (attempt ${attemptCount}).\n\nError:\n${error}\n\n`;

    if (attemptCount < 3) {
      prompt += `Please analyze the error and try a different approach. Consider:
- Whether the error is due to incorrect parameters
- If there's an alternative way to accomplish the same goal
- Whether you need additional information first`;
    } else {
      prompt += `You've attempted this action ${attemptCount} times. Please either:
1. Try a fundamentally different approach
2. Ask the user for guidance or clarification
3. Update your plan to work around this limitation`;
    }

    return prompt;
  },

  /**
   * Partial success observation
   */
  partialSuccess: (toolName: string, result: unknown, warnings: string[]) =>
    `Tool "${toolName}" completed with warnings.\n\nResult:\n${JSON.stringify(result, null, 2)}\n\nWarnings:\n${warnings.map(w => `- ${w}`).join('\n')}\n\nProceed with caution and address warnings if needed.`
};
