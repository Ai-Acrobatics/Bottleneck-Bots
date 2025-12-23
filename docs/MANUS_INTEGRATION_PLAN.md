# Manus Replica Integration Plan
**Architecture Design Document**

## Executive Summary

This document provides the architectural blueprint for integrating the Manus Replica system prompt and agent loop into Bottleneck-Bots, creating a unified platform that combines:

1. **Manus Replica** - Autonomous agent loop with phase-based planning
2. **Claude-Flow** - Enterprise orchestration with 100+ MCP tools and swarm intelligence
3. **Bottleneck-Bots** - Production SaaS with GHL automation and browser control

**Status**: Architecture Design Phase
**Impact**: HIGH - Core system integration
**Complexity**: HIGH - Multi-system merge requiring careful design
**Author**: Archie-Architect
**Date**: 2025-12-23

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Integration Architecture](#integration-architecture)
3. [System Prompt Placement](#system-prompt-placement)
4. [Agent Loop Integration](#agent-loop-integration)
5. [Tool Framework Unification](#tool-framework-unification)
6. [Implementation Phases](#implementation-phases)
7. [Migration Strategy](#migration-strategy)
8. [Risk Assessment](#risk-assessment)

---

## Current State Analysis

### Existing System Capabilities

#### Bottleneck-Bots (Current Production)
**Location**: `/root/Bottleneck-Bots/server/services/agentOrchestrator.service.ts`

**Strengths**:
- Production-ready agent orchestration
- Browserbase + Stagehand integration for GHL automation
- SSE-based real-time updates (`AgentSSEEmitter`)
- RAG context injection for knowledge retrieval
- Permission system with execution controls
- Cost tracking and analytics
- Self-correction and error recovery
- Multi-tab browser coordination

**Architecture Pattern**:
```typescript
// Current: Simple iteration loop
while (iteration < maxIterations) {
  const response = await anthropic.messages.create({
    system: buildSystemPrompt(ragContext),
    messages: conversationHistory,
    tools: toolDefinitions
  });

  // Handle tool calls
  // Continue iteration
}
```

**Limitations**:
- No explicit phase-based planning
- Single-agent execution (no swarm coordination)
- Limited strategic thinking structure
- No formal plan creation/advancement protocol

#### Manus Replica System Prompt
**Location**: `/root/Bottleneck-Bots/server/prompts/manus-system.ts`

**Strengths**:
- 8-step agent loop with explicit phases
- Structured planning with phase advancement
- Clear execution protocols (ANALYZE → PLAN → THINK → SELECT TOOL → EXECUTE → OBSERVE → ITERATE → DELIVER)
- Phase capability flags for tool selection
- Built-in error recovery patterns
- Communication type taxonomy (info, ask, result)

**Core Loop Structure**:
```
1. ANALYZE CONTEXT
2. UPDATE/ADVANCE PLAN
3. THINK & REASON
4. SELECT TOOL (function calling)
5. EXECUTE ACTION
6. OBSERVE RESULT
7. ITERATE
8. DELIVER OUTCOME
```

**Key Innovations**:
- Phase-based planning with success criteria
- Capability-driven tool selection
- Explicit thinking steps before tool execution
- Message type categorization

#### Claude-Flow Integration
**Location**: `/root/.claude-flow/` (MCP server)

**Strengths**:
- 100+ enterprise MCP tools
- Swarm orchestration (hierarchical, mesh, star, ring topologies)
- Persistent memory with namespaces and TTL
- Neural pattern learning with WASM acceleration
- Cross-terminal agent coordination
- Task orchestration with dependency management

**Coordination Pattern**:
```typescript
// Multi-agent swarm coordination
swarm_init({ topology: "hierarchical" })
agent_spawn({ type: "coordinator", capabilities: [...] })
task_orchestrate({ task: "...", strategy: "parallel" })
```

---

## Integration Architecture

### Unified Agent System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UNIFIED AGENT LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │             MANUS AGENT LOOP (Enhanced)                    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │ ANALYZE  │→ │  PLAN    │→ │  THINK   │→ │  SELECT  │  │    │
│  │  │ CONTEXT  │  │ UPDATE   │  │ REASON   │  │   TOOL   │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │    │
│  │       ↑              │               │            │        │    │
│  │       │      ┌──────────┐     ┌──────────┐      │        │    │
│  │       │      │ OBSERVE  │←────│ EXECUTE  │←─────┘        │    │
│  │       │      │  RESULT  │     │  ACTION  │                │    │
│  │       │      └──────────┘     └──────────┘                │    │
│  │       │              │                                     │    │
│  │       └──────────────┴─────────────────────────────────────┘    │
│  │                             │                                    │
│  └─────────────────────────────┼────────────────────────────────────┘
│                                │                                     │
│  ┌─────────────────────────────┼────────────────────────────────────┐
│  │          CLAUDE-FLOW ORCHESTRATION                               │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  │ Swarm        │  │ Memory       │  │ Task         │          │
│  │  │ Coordination │  │ Management   │  │ Orchestration│          │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │
│  └───────────────────────────┼───────────────────────────────────────┘
│                               │                                      │
│  ┌─────────────────────────────┼────────────────────────────────────┐
│  │          TOOL REGISTRY (Unified)                                 │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  │ Bottleneck  │ │ Manus       │ │ Claude-Flow │               │
│  │  │ Bot Tools   │ │ Tools       │ │ MCP Tools   │               │
│  │  │ - Browser   │ │ - Shell     │ │ - Memory    │               │
│  │  │ - GHL API   │ │ - File      │ │ - Neural    │               │
│  │  │ - Stagehand │ │ - Search    │ │ - Swarm     │               │
│  │  │ - RAG       │ │ - Database  │ │ - GitHub    │               │
│  │  └─────────────┘ └─────────────┘ └─────────────┘               │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Backward Compatibility**: Existing Bottleneck-Bots agent functionality must continue working
2. **Progressive Enhancement**: Manus loop is opt-in via execution mode flag
3. **Shared Infrastructure**: Reuse existing SSE, RAG, permissions, cost tracking
4. **Tool Unification**: Single tool registry accessible from all execution modes
5. **Memory Integration**: Claude-Flow memory namespaces available to Manus agents

---

## System Prompt Placement

### Prompt Architecture

**Primary Location**: `/root/Bottleneck-Bots/server/prompts/`

```
server/prompts/
├── manus-system.ts          # Existing Manus system prompt (KEEP)
├── agentPrompts.ts          # Existing Bottleneck-Bots prompts (KEEP)
├── unified-system.ts        # NEW: Unified prompt builder
└── index.ts                 # NEW: Prompt exports
```

### Unified Prompt Builder

**File**: `/root/Bottleneck-Bots/server/prompts/unified-system.ts`

```typescript
/**
 * Unified System Prompt Builder
 * Combines Manus agent loop with Bottleneck-Bots capabilities
 */

import { MANUS_SYSTEM_PROMPT, GHL_CONTEXT_PROMPT, TOOL_CONTEXT_PROMPT } from './manus-system';
import { buildSystemPrompt as buildBBSystemPrompt, type RAGContext } from './agentPrompts';

export type ExecutionMode =
  | 'manus'           // Full Manus agent loop with phase planning
  | 'standard'        // Current Bottleneck-Bots behavior
  | 'hybrid'          // Manus loop + BB tools
  | 'swarm';          // Multi-agent Claude-Flow coordination

export interface UnifiedPromptConfig {
  mode: ExecutionMode;
  ragContext?: RAGContext;
  includeGHLContext?: boolean;
  includeToolContext?: boolean;
  claudeFlowEnabled?: boolean;
  userId?: number;
  subAccountId?: string;
  availableIntegrations?: string[];
}

export function buildUnifiedSystemPrompt(config: UnifiedPromptConfig): string {
  const {
    mode,
    ragContext,
    includeGHLContext = true,
    includeToolContext = true,
    claudeFlowEnabled = false,
    userId,
    subAccountId,
    availableIntegrations = []
  } = config;

  let systemPrompt = '';

  // Base prompt selection by mode
  switch (mode) {
    case 'manus':
      systemPrompt = MANUS_SYSTEM_PROMPT;
      if (includeGHLContext) systemPrompt += '\n\n' + GHL_CONTEXT_PROMPT;
      if (includeToolContext) systemPrompt += '\n\n' + TOOL_CONTEXT_PROMPT;
      break;

    case 'standard':
      systemPrompt = buildBBSystemPrompt(ragContext);
      break;

    case 'hybrid':
      // Manus loop structure + BB tool capabilities
      systemPrompt = MANUS_SYSTEM_PROMPT;
      systemPrompt += '\n\n' + buildBBSystemPrompt(ragContext);
      if (includeGHLContext) systemPrompt += '\n\n' + GHL_CONTEXT_PROMPT;
      break;

    case 'swarm':
      // Manus loop + Claude-Flow coordination
      systemPrompt = MANUS_SYSTEM_PROMPT;
      systemPrompt += '\n\n' + buildClaudeFlowContext();
      if (includeGHLContext) systemPrompt += '\n\n' + GHL_CONTEXT_PROMPT;
      break;
  }

  // Add runtime context
  systemPrompt += buildRuntimeContext({
    userId,
    subAccountId,
    availableIntegrations,
    claudeFlowEnabled
  });

  // Add RAG context if available
  if (ragContext && mode !== 'standard') {
    systemPrompt += '\n\n' + buildRAGContextSection(ragContext);
  }

  return systemPrompt;
}

function buildClaudeFlowContext(): string {
  return `
<claude_flow_integration>
You have access to Claude-Flow enterprise orchestration capabilities:

**Multi-Agent Coordination**:
- Spawn specialized agents for complex tasks
- Coordinate agent swarms (hierarchical, mesh, star, ring)
- Delegate subtasks to specialist agents
- Aggregate results from multiple agents

**Persistent Memory**:
- Store findings to memory namespaces with TTL
- Retrieve context from previous sessions
- Share state across agent terminals
- Checkpoint progress for recovery

**MCP Tools** (100+ available):
- GitHub operations (repos, PRs, issues)
- Notion integration (databases, pages)
- File sync across environments
- Neural pattern learning
- Workflow automation

**Usage Pattern**:
1. For complex tasks: Initialize swarm with appropriate topology
2. Spawn specialist agents (coordinator, analyst, coder, etc.)
3. Orchestrate task distribution with dependencies
4. Monitor progress and aggregate results
5. Store learnings to memory for future use

**Tool Examples**:
- mcp__claude-flow__swarm_init({ topology: "hierarchical" })
- mcp__claude-flow__agent_spawn({ type: "coordinator", name: "Task Manager" })
- mcp__claude-flow__task_orchestrate({ task: "...", strategy: "parallel" })
- mcp__claude-flow__memory_usage({ action: "store", namespace: "session", key: "...", value: "..." })
</claude_flow_integration>`;
}

function buildRuntimeContext(options: {
  userId?: number;
  subAccountId?: string;
  availableIntegrations?: string[];
  claudeFlowEnabled?: boolean;
}): string {
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let context = `\n\n<runtime_context>
Current Date & Time: ${dateString}, ${new Date().toLocaleTimeString('en-US')}`;

  if (options.userId) {
    context += `\nUser ID: ${options.userId}`;
  }

  if (options.subAccountId) {
    context += `\nGHL Sub-Account ID: ${options.subAccountId}`;
  }

  if (options.availableIntegrations && options.availableIntegrations.length > 0) {
    context += `\nAvailable Integrations: ${options.availableIntegrations.join(', ')}`;
  }

  if (options.claudeFlowEnabled) {
    context += `\nClaude-Flow: ENABLED (multi-agent orchestration available)`;
  }

  context += '\n</runtime_context>';
  return context;
}

function buildRAGContextSection(ragContext: RAGContext): string {
  return `
<rag_knowledge>
Retrieved knowledge relevant to this task:

${ragContext.relevantDocs.map((doc, i) => `
**Document ${i + 1}**: ${doc.title}
${doc.content}
`).join('\n')}
</rag_knowledge>`;
}
```

### Prompt Selection Strategy

**Decision Matrix**:

| Use Case | Mode | Rationale |
|----------|------|-----------|
| Simple GHL automation | `standard` | Existing proven behavior |
| Complex multi-step task | `manus` | Phase planning + structured thinking |
| GHL task needing RAG | `hybrid` | Manus loop + BB tools + knowledge |
| Cross-project coordination | `swarm` | Multi-agent orchestration |
| Website building | `manus` | Webdev tools + phase planning |
| Browser automation | `hybrid` | Manus loop + Stagehand tools |

**Configuration Examples**:

```typescript
// Simple GHL contact import
const config: UnifiedPromptConfig = {
  mode: 'standard',
  ragContext: await ragService.getContext(task)
};

// Complex funnel building
const config: UnifiedPromptConfig = {
  mode: 'manus',
  includeGHLContext: true,
  includeToolContext: true,
  ragContext: await ragService.getContext(task)
};

// Multi-project deployment coordination
const config: UnifiedPromptConfig = {
  mode: 'swarm',
  claudeFlowEnabled: true,
  includeGHLContext: true
};
```

---

## Agent Loop Integration

### Enhanced Agent Orchestrator Service

**File**: `/root/Bottleneck-Bots/server/services/agentOrchestrator.service.ts`

**Changes Required**:

1. Add execution mode support
2. Implement phase-based planning
3. Integrate plan advancement logic
4. Add thinking step tracking
5. Enable Claude-Flow coordination

### Implementation Structure

```typescript
/**
 * Enhanced Agent Orchestrator with Manus Loop Support
 */

export interface ExecutionConfig {
  mode: ExecutionMode;
  taskId: string;
  userId: number;
  subAccountId?: string;
  maxIterations?: number;
  enableClaudeFlow?: boolean;
  ragEnabled?: boolean;
}

export class AgentOrchestratorService {
  private anthropic: Anthropic;
  private emitter: AgentSSEEmitter;
  private ragService: RAGService;
  private permissionsService: AgentPermissionsService;
  private claudeFlowClient?: ClaudeFlowClient;

  /**
   * Main execution entry point
   * Routes to appropriate execution strategy based on mode
   */
  async executeTask(config: ExecutionConfig): Promise<ExecutionResult> {
    const { mode } = config;

    switch (mode) {
      case 'manus':
        return this.executeManusLoop(config);

      case 'standard':
        return this.executeStandardLoop(config);

      case 'hybrid':
        return this.executeHybridLoop(config);

      case 'swarm':
        return this.executeSwarmCoordination(config);

      default:
        throw new Error(`Unknown execution mode: ${mode}`);
    }
  }

  /**
   * Manus Agent Loop Implementation
   * 8-step structured execution with phase planning
   */
  private async executeManusLoop(config: ExecutionConfig): Promise<ExecutionResult> {
    const { taskId, userId, maxIterations = 50 } = config;

    let iteration = 0;
    let plan: AgentPlan | null = null;
    let currentPhase: AgentPhase | null = null;
    const conversationHistory: Anthropic.MessageParam[] = [];
    const thinkingSteps: ThinkingStep[] = [];

    // Build Manus system prompt
    const systemPrompt = buildUnifiedSystemPrompt({
      mode: 'manus',
      ragContext: await this.ragService.getContext(taskId),
      userId,
      subAccountId: config.subAccountId
    });

    // Initialize execution
    this.emitter.emitExecutionStarted(taskId);

    while (iteration < maxIterations) {
      iteration++;

      // Step 1: ANALYZE CONTEXT
      this.emitter.emitThinking(taskId, 'Analyzing current context and progress...');

      // Step 2: UPDATE/ADVANCE PLAN
      if (!plan) {
        // Create initial plan
        this.emitter.emitPhaseChange(taskId, 'planning');
        plan = await this.createPlan(taskId, conversationHistory, systemPrompt);
        currentPhase = plan.phases[0];
        this.emitter.emitPlanCreated(taskId, plan);
      } else if (await this.isPhaseComplete(currentPhase, conversationHistory)) {
        // Advance to next phase
        const nextPhaseId = plan.currentPhaseId + 1;
        if (nextPhaseId < plan.phases.length) {
          plan.currentPhaseId = nextPhaseId;
          currentPhase = plan.phases[nextPhaseId];
          this.emitter.emitPhaseAdvance(taskId, currentPhase);
        } else {
          // All phases complete - deliver outcome
          break;
        }
      }

      // Step 3: THINK & REASON
      const thinking = await this.generateThinkingStep(
        currentPhase,
        conversationHistory,
        systemPrompt
      );
      thinkingSteps.push(thinking);
      this.emitter.emitThinking(taskId, thinking.reasoning);

      // Step 4: SELECT TOOL (via Claude function calling)
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        system: systemPrompt,
        messages: conversationHistory,
        tools: this.getToolsForPhase(currentPhase),
        temperature: 0.7
      });

      conversationHistory.push({
        role: 'assistant',
        content: response.content
      });

      // Step 5: EXECUTE ACTION
      const toolResults = await this.executeTools(response.content, taskId);

      // Step 6: OBSERVE RESULT
      conversationHistory.push({
        role: 'user',
        content: toolResults.map(r => ({
          type: 'tool_result' as const,
          tool_use_id: r.tool_use_id,
          content: r.content
        }))
      });

      // Step 7: ITERATE (check for completion)
      if (response.stop_reason === 'end_turn') {
        // Agent believes task is complete
        break;
      }
    }

    // Step 8: DELIVER OUTCOME
    const result = await this.generateFinalResult(
      taskId,
      plan,
      thinkingSteps,
      conversationHistory
    );

    this.emitter.emitExecutionComplete(taskId, result);
    return result;
  }

  /**
   * Create initial task plan using Manus planning format
   */
  private async createPlan(
    taskId: string,
    conversationHistory: Anthropic.MessageParam[],
    systemPrompt: string
  ): Promise<AgentPlan> {
    const planningPrompt = `
You are about to start a new task. Create a detailed execution plan with the following structure:

{
  "goal": "One-sentence description of the objective",
  "current_phase_id": 0,
  "phases": [
    {
      "id": 0,
      "title": "Phase name",
      "description": "What this phase accomplishes",
      "success_criteria": ["Criterion 1", "Criterion 2"],
      "capabilities": {
        "browser_automation": true,
        "data_extraction": false,
        "content_generation": true,
        "ghl_workflow": false
      }
    }
  ]
}

Phase count should scale with complexity:
- Simple tasks: 2-3 phases
- Typical tasks: 4-6 phases
- Complex tasks: 10+ phases

Always include a final delivery phase.
`;

    conversationHistory.push({
      role: 'user',
      content: planningPrompt
    });

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      system: systemPrompt,
      messages: conversationHistory,
      temperature: 0.5
    });

    // Extract plan from response
    const planText = response.content.find(c => c.type === 'text')?.text || '';
    const plan = this.parsePlanFromText(planText);

    // Store plan in database
    await this.storePlan(taskId, plan);

    return plan;
  }

  /**
   * Check if current phase is complete based on success criteria
   */
  private async isPhaseComplete(
    phase: AgentPhase,
    conversationHistory: Anthropic.MessageParam[]
  ): Promise<boolean> {
    // Analyze recent tool results and conversation
    // Determine if success criteria are met
    // Return true if phase objectives achieved

    // Implementation depends on phase success criteria
    // Can use Claude to evaluate completion
    return false; // Placeholder
  }

  /**
   * Generate thinking step for current phase
   */
  private async generateThinkingStep(
    phase: AgentPhase,
    conversationHistory: Anthropic.MessageParam[],
    systemPrompt: string
  ): Promise<ThinkingStep> {
    // Prompt agent to think about next action
    // Extract reasoning and proposed action

    return {
      phaseId: phase.id,
      reasoning: '...',
      proposedAction: '...',
      timestamp: new Date()
    };
  }

  /**
   * Get tool definitions filtered by phase capabilities
   */
  private getToolsForPhase(phase: AgentPhase): Anthropic.Tool[] {
    const allTools = this.toolRegistry.getAllTools();

    // Filter tools based on phase capabilities
    return allTools.filter(tool => {
      if (phase.capabilities.browser_automation && tool.category === 'browser') {
        return true;
      }
      if (phase.capabilities.data_extraction && tool.category === 'data') {
        return true;
      }
      if (phase.capabilities.ghl_workflow && tool.category === 'ghl') {
        return true;
      }
      // Always include planning and communication tools
      if (tool.category === 'planning' || tool.category === 'communication') {
        return true;
      }
      return false;
    });
  }

  /**
   * Swarm coordination mode using Claude-Flow
   */
  private async executeSwarmCoordination(config: ExecutionConfig): Promise<ExecutionResult> {
    if (!this.claudeFlowClient) {
      throw new Error('Claude-Flow not enabled for this execution');
    }

    const { taskId, userId } = config;

    // Initialize swarm
    const swarmId = await this.claudeFlowClient.swarm_init({
      topology: 'hierarchical',
      maxAgents: 8,
      strategy: 'adaptive'
    });

    // Spawn coordinator agent
    const coordinator = await this.claudeFlowClient.agent_spawn({
      type: 'coordinator',
      name: 'TaskCoordinator',
      swarmId,
      capabilities: ['planning', 'delegation', 'monitoring']
    });

    // Orchestrate task execution
    const orchestration = await this.claudeFlowClient.task_orchestrate({
      task: config.taskId,
      strategy: 'adaptive',
      priority: 'high'
    });

    // Monitor progress and coordinate agents
    // ... implementation

    return {
      success: true,
      swarmId,
      coordinatorId: coordinator.id,
      taskId
    };
  }
}

interface ThinkingStep {
  phaseId: number;
  reasoning: string;
  proposedAction: string;
  timestamp: Date;
}

interface ExecutionResult {
  success: boolean;
  taskId: string;
  plan?: AgentPlan;
  thinkingSteps?: ThinkingStep[];
  swarmId?: string;
  coordinatorId?: string;
}
```

---

## Tool Framework Unification

### Unified Tool Registry

**File**: `/root/Bottleneck-Bots/server/services/tools/unified-registry.ts`

```typescript
/**
 * Unified Tool Registry
 * Combines Bottleneck-Bots, Manus, and Claude-Flow tools
 */

export type ToolCategory =
  | 'browser'        // Browserbase + Stagehand
  | 'ghl'            // GHL API functions
  | 'shell'          // Shell command execution
  | 'file'           // File operations
  | 'search'         // Web search
  | 'database'       // Database operations
  | 'planning'       // Plan/advance phase
  | 'communication'  // Message user
  | 'memory'         // Claude-Flow memory
  | 'swarm'          // Claude-Flow swarm
  | 'github'         // Claude-Flow GitHub
  | 'notion';        // Claude-Flow Notion

export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  description: string;
  input_schema: Anthropic.Tool.InputSchema;
  handler: ToolHandler;
  requiredCapabilities?: string[];
  claudeFlowOnly?: boolean;
}

export class UnifiedToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(
    private browserTools: BrowserToolRegistry,
    private ghlTools: GHLToolRegistry,
    private manusTools: ManusToolRegistry,
    private claudeFlowClient?: ClaudeFlowClient
  ) {
    this.registerAllTools();
  }

  private registerAllTools(): void {
    // Register Bottleneck-Bots browser tools
    this.registerBrowserTools();

    // Register GHL API tools
    this.registerGHLTools();

    // Register Manus tools (shell, file, search, etc.)
    this.registerManusTools();

    // Register Claude-Flow MCP tools (if enabled)
    if (this.claudeFlowClient) {
      this.registerClaudeFlowTools();
    }

    // Register planning tools
    this.registerPlanningTools();

    // Register communication tools
    this.registerCommunicationTools();
  }

  private registerPlanningTools(): void {
    this.tools.set('plan_create', {
      name: 'plan_create',
      category: 'planning',
      description: 'Create a new task execution plan with phases',
      input_schema: {
        type: 'object',
        properties: {
          goal: { type: 'string', description: 'One-sentence objective' },
          phases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                success_criteria: { type: 'array', items: { type: 'string' } },
                capabilities: { type: 'object' }
              }
            }
          }
        },
        required: ['goal', 'phases']
      },
      handler: async (input) => {
        // Store plan in database
        // Return plan ID
      }
    });

    this.tools.set('phase_advance', {
      name: 'phase_advance',
      category: 'planning',
      description: 'Advance to the next phase in the current plan',
      input_schema: {
        type: 'object',
        properties: {
          plan_id: { type: 'string' },
          completion_summary: { type: 'string' }
        },
        required: ['plan_id']
      },
      handler: async (input) => {
        // Update plan.current_phase_id
        // Return next phase details
      }
    });
  }

  private registerCommunicationTools(): void {
    this.tools.set('message', {
      name: 'message',
      category: 'communication',
      description: 'Send a message to the user (info/ask/result)',
      input_schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['info', 'ask', 'result'],
            description: 'info=progress update, ask=request input, result=final delivery'
          },
          content: { type: 'string', description: 'Message content in Markdown' },
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'File paths to attach'
          }
        },
        required: ['type', 'content']
      },
      handler: async (input, context) => {
        // Send message via SSE
        this.emitter.emitMessage(context.taskId, input);
      }
    });
  }

  private registerClaudeFlowTools(): void {
    // Swarm coordination
    this.tools.set('swarm_init', {
      name: 'swarm_init',
      category: 'swarm',
      description: 'Initialize a multi-agent swarm for complex tasks',
      input_schema: {
        type: 'object',
        properties: {
          topology: {
            type: 'string',
            enum: ['hierarchical', 'mesh', 'star', 'ring']
          },
          max_agents: { type: 'number', default: 8 }
        },
        required: ['topology']
      },
      handler: async (input) => {
        return this.claudeFlowClient!.swarm_init(input);
      },
      claudeFlowOnly: true
    });

    // Agent spawning
    this.tools.set('agent_spawn', {
      name: 'agent_spawn',
      category: 'swarm',
      description: 'Spawn a specialized agent with specific capabilities',
      input_schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['coordinator', 'analyst', 'coder', 'tester', 'reviewer']
          },
          name: { type: 'string' },
          capabilities: { type: 'array', items: { type: 'string' } }
        },
        required: ['type', 'name']
      },
      handler: async (input) => {
        return this.claudeFlowClient!.agent_spawn(input);
      },
      claudeFlowOnly: true
    });

    // Memory operations
    this.tools.set('memory_store', {
      name: 'memory_store',
      category: 'memory',
      description: 'Store data to persistent memory namespace',
      input_schema: {
        type: 'object',
        properties: {
          namespace: { type: 'string', default: 'session' },
          key: { type: 'string' },
          value: { type: 'string' },
          ttl: { type: 'number', description: 'Time to live in seconds' }
        },
        required: ['key', 'value']
      },
      handler: async (input) => {
        return this.claudeFlowClient!.memory_usage({
          action: 'store',
          ...input
        });
      },
      claudeFlowOnly: true
    });
  }

  /**
   * Get tools filtered by phase capabilities
   */
  getToolsForCapabilities(capabilities: PhaseCapabilities): Anthropic.Tool[] {
    const tools: Anthropic.Tool[] = [];

    for (const [name, def] of this.tools.entries()) {
      // Always include planning and communication
      if (def.category === 'planning' || def.category === 'communication') {
        tools.push(this.toAnthropicTool(def));
        continue;
      }

      // Check if tool matches phase capabilities
      if (this.matchesCapabilities(def, capabilities)) {
        // Skip Claude-Flow tools if not enabled
        if (def.claudeFlowOnly && !this.claudeFlowClient) {
          continue;
        }
        tools.push(this.toAnthropicTool(def));
      }
    }

    return tools;
  }

  private matchesCapabilities(
    tool: ToolDefinition,
    capabilities: PhaseCapabilities
  ): boolean {
    switch (tool.category) {
      case 'browser':
        return capabilities.browser_automation;
      case 'ghl':
        return capabilities.ghl_workflow || capabilities.ghl_contacts ||
               capabilities.ghl_campaigns || capabilities.ghl_funnels;
      case 'file':
        return capabilities.file_operations;
      case 'database':
        return capabilities.data_extraction;
      case 'search':
        return capabilities.data_extraction;
      case 'memory':
      case 'swarm':
        return true; // Always available if Claude-Flow enabled
      default:
        return true;
    }
  }

  private toAnthropicTool(def: ToolDefinition): Anthropic.Tool {
    return {
      name: def.name,
      description: def.description,
      input_schema: def.input_schema
    };
  }
}

export interface PhaseCapabilities {
  browser_automation: boolean;
  data_extraction: boolean;
  content_generation: boolean;
  api_integration: boolean;
  file_operations: boolean;
  user_communication: boolean;
  ghl_workflow: boolean;
  ghl_contacts: boolean;
  ghl_campaigns: boolean;
  ghl_funnels: boolean;
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up unified prompt system and execution mode framework

**Tasks**:
1. Create `/server/prompts/unified-system.ts` with mode-based prompt builder
2. Add `ExecutionMode` type to core types
3. Update `agentOrchestrator.service.ts` to support mode parameter
4. Create database schema for agent plans and phases
5. Implement basic plan storage/retrieval

**Deliverables**:
- Unified prompt builder functional
- Mode selection working (standard vs manus)
- Plan table schema created
- Unit tests for prompt builder

### Phase 2: Manus Loop Implementation (Week 2)
**Goal**: Implement 8-step Manus agent loop

**Tasks**:
1. Implement `executeManusLoop()` method
2. Create `createPlan()` function with phase generation
3. Implement `isPhaseComplete()` phase completion detection
4. Add thinking step generation and tracking
5. Integrate SSE events for phase changes
6. Add plan advancement logic

**Deliverables**:
- Full Manus loop execution working
- Phase-based planning functional
- Thinking steps tracked and emitted
- Integration tests passing

### Phase 3: Tool Unification (Week 3)
**Goal**: Merge all tool registries into unified system

**Tasks**:
1. Create `UnifiedToolRegistry` class
2. Register Bottleneck-Bots browser tools
3. Register GHL API tools
4. Register Manus shell/file/search tools
5. Add capability-based tool filtering
6. Create planning and communication tools

**Deliverables**:
- All tools accessible from single registry
- Capability filtering working correctly
- Tool execution tested end-to-end

### Phase 4: Claude-Flow Integration (Week 4)
**Goal**: Enable multi-agent coordination via Claude-Flow

**Tasks**:
1. Add Claude-Flow client to orchestrator
2. Register MCP tools in unified registry
3. Implement `executeSwarmCoordination()` mode
4. Add memory persistence to Manus loop
5. Enable cross-agent communication
6. Create swarm monitoring dashboard

**Deliverables**:
- Swarm mode functional
- MCP tools accessible
- Agent coordination working
- Memory persistence enabled

### Phase 5: Hybrid Mode (Week 5)
**Goal**: Create best-of-both-worlds hybrid execution

**Tasks**:
1. Implement `executeHybridLoop()` method
2. Combine Manus planning with BB tools
3. Add RAG context to Manus loop
4. Integrate permissions and cost tracking
5. Add error recovery from both systems
6. Performance optimization

**Deliverables**:
- Hybrid mode production-ready
- All existing features working in hybrid
- Performance benchmarks met
- Documentation complete

### Phase 6: Testing & Refinement (Week 6)
**Goal**: Comprehensive testing and production hardening

**Tasks**:
1. End-to-end testing of all modes
2. Load testing and performance optimization
3. Error recovery testing
4. Security audit
5. Documentation updates
6. User guide creation

**Deliverables**:
- All modes tested and stable
- Performance targets met
- Security reviewed
- Full documentation

---

## Migration Strategy

### Backward Compatibility Approach

**Principle**: Zero breaking changes to existing functionality

**Strategy**:
1. **Default Mode**: `standard` - existing behavior unchanged
2. **Opt-In Enhancement**: Users explicitly enable `manus`, `hybrid`, or `swarm` modes
3. **Feature Flags**: Gradual rollout with feature flags
4. **A/B Testing**: Compare execution modes on same tasks

### Migration Path

**Stage 1: Parallel Execution (Month 1)**
- Both systems run side-by-side
- New mode opt-in via UI toggle
- Collect performance metrics
- Gather user feedback

**Stage 2: Gradual Adoption (Month 2)**
- Promote hybrid mode for complex tasks
- Auto-suggest mode based on task analysis
- Migrate high-value use cases
- Monitor success rates

**Stage 3: Full Integration (Month 3)**
- Make hybrid mode default for new users
- Migrate existing users with consent
- Deprecate standard mode for complex tasks
- Full Claude-Flow rollout

### Rollback Strategy

**Safety Measures**:
1. Feature flags allow instant disable
2. Standard mode always available as fallback
3. Database schema supports both systems
4. Monitoring alerts on failure rates

**Rollback Triggers**:
- Success rate drops below 90%
- Average execution time increases >50%
- Critical bugs in production
- Negative user feedback threshold

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Manus loop increases latency | Medium | Medium | Optimize prompt size, cache plans |
| Tool conflicts between systems | Low | High | Unified registry with namespacing |
| Claude-Flow MCP stability | Medium | Medium | Fallback to standard mode on MCP failures |
| Database schema conflicts | Low | High | Careful migration planning, versioning |
| SSE performance degradation | Low | Medium | Event batching, client-side buffering |

### Architectural Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Increased system complexity | High | Medium | Clear abstraction layers, documentation |
| Maintenance burden | Medium | Medium | Modular design, automated testing |
| Learning curve for developers | High | Low | Comprehensive docs, examples |
| Third-party dependency (Claude-Flow) | Medium | High | Abstract MCP interface, fallbacks |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| User confusion with modes | Medium | Low | Smart defaults, clear UI |
| Increased infrastructure costs | Medium | Medium | Cost monitoring, usage quotas |
| Migration resistance | Low | Low | Gradual rollout, clear benefits |
| Competitive disadvantage if delayed | High | High | Phased delivery, MVP first |

---

## Success Criteria

### Technical Metrics

- **Execution Success Rate**: >95% for all modes
- **Manus Loop Overhead**: <20% latency increase vs standard
- **Plan Quality**: >90% of generated plans are actionable
- **Tool Selection Accuracy**: >95% correct tool usage
- **Phase Completion Detection**: >90% accuracy
- **Claude-Flow Coordination**: <2s agent spawn time

### User Experience Metrics

- **Task Completion Rate**: >90% in hybrid mode
- **User Satisfaction**: >4.5/5 rating for new modes
- **Feature Adoption**: >60% users try Manus/hybrid within 30 days
- **Support Tickets**: <10% increase due to new modes
- **Documentation Clarity**: >4/5 rating

### Business Metrics

- **Competitive Advantage**: Unique multi-agent GHL automation
- **Platform Stickiness**: >15% reduction in churn
- **Feature Differentiation**: Clear market positioning
- **Developer Velocity**: 20% faster complex task implementation

---

## Next Steps

### Immediate Actions (This Week)

1. **Review & Approve**: Architecture review with development team
2. **Database Schema**: Design agent_plans and agent_phases tables
3. **Prototype**: Build minimal viable Manus loop (standard → manus mode)
4. **Testing**: Create test cases for phase planning
5. **Documentation**: Set up developer onboarding guide

### Week 1 Deliverables

- Architecture approved and refined based on feedback
- Database migrations written and tested
- Unified prompt system implemented
- Mode selection integrated into orchestrator
- Basic Manus loop execution working

### Monitoring & Iteration

- Weekly architecture review meetings
- Daily standup on integration progress
- Continuous performance monitoring
- User feedback collection from beta testers
- Bi-weekly demos to stakeholders

---

## Appendix

### File Structure After Integration

```
server/
├── prompts/
│   ├── manus-system.ts              # Manus system prompt (existing)
│   ├── agentPrompts.ts              # BB prompts (existing)
│   ├── unified-system.ts            # NEW: Unified builder
│   └── index.ts                     # NEW: Exports
│
├── services/
│   ├── agentOrchestrator.service.ts # Enhanced with modes
│   ├── tools/
│   │   ├── unified-registry.ts      # NEW: Tool registry
│   │   ├── browser/                 # BB browser tools
│   │   ├── ghl/                     # GHL API tools
│   │   ├── manus/                   # NEW: Manus tools
│   │   └── claude-flow/             # NEW: MCP tools
│   │
│   ├── planning/
│   │   ├── planGenerator.ts         # NEW: Plan creation
│   │   ├── phaseManager.ts          # NEW: Phase advancement
│   │   └── completionDetector.ts   # NEW: Success criteria
│   │
│   └── coordination/
│       ├── swarmOrchestrator.ts     # NEW: Multi-agent
│       └── memoryBridge.ts          # NEW: Claude-Flow memory
│
└── _core/
    └── types/
        ├── execution.ts             # NEW: Mode types
        ├── planning.ts              # NEW: Plan types
        └── coordination.ts          # NEW: Swarm types
```

### Database Schema

```sql
-- Agent execution plans
CREATE TABLE agent_plans (
  id SERIAL PRIMARY KEY,
  execution_id INTEGER REFERENCES task_executions(id),
  goal TEXT NOT NULL,
  current_phase_id INTEGER DEFAULT 0,
  estimated_steps INTEGER,
  estimated_duration INTEGER, -- milliseconds
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plan phases
CREATE TABLE agent_phases (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES agent_plans(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  success_criteria JSONB, -- Array of criteria strings
  capabilities JSONB, -- Capability flags
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, complete
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(plan_id, phase_number)
);

-- Thinking steps
CREATE TABLE agent_thinking_steps (
  id SERIAL PRIMARY KEY,
  execution_id INTEGER REFERENCES task_executions(id),
  phase_id INTEGER REFERENCES agent_phases(id),
  reasoning TEXT NOT NULL,
  proposed_action TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_plans_execution ON agent_plans(execution_id);
CREATE INDEX idx_agent_phases_plan ON agent_phases(plan_id);
CREATE INDEX idx_thinking_steps_execution ON agent_thinking_steps(execution_id);
```

### Configuration Example

```typescript
// config/agent-modes.ts
export const AGENT_MODE_CONFIG = {
  default: 'standard' as ExecutionMode,

  taskTypeMapping: {
    'contact_import': 'standard',
    'workflow_creation': 'hybrid',
    'funnel_building': 'manus',
    'multi_account_setup': 'swarm',
    'website_generation': 'manus',
    'complex_automation': 'hybrid'
  },

  complexityThresholds: {
    standard: { max_steps: 5 },
    manus: { max_steps: 20 },
    hybrid: { max_steps: 30 },
    swarm: { max_steps: 100 }
  },

  claudeFlowEnabled: process.env.CLAUDE_FLOW_ENABLED === 'true',

  featureFlags: {
    enable_manus_mode: true,
    enable_hybrid_mode: true,
    enable_swarm_mode: false, // Beta
    enable_phase_planning: true,
    enable_thinking_steps: true
  }
};
```

---

## Conclusion

This integration plan provides a comprehensive architecture for merging Manus Replica, Claude-Flow, and Bottleneck-Bots into a unified, powerful AI agent platform. The phased approach ensures backward compatibility while progressively enhancing capabilities with structured planning, multi-agent coordination, and intelligent tool selection.

**Key Success Factors**:
1. Maintain existing functionality while adding new modes
2. Clear abstraction layers for maintainability
3. Gradual rollout with feature flags and monitoring
4. Comprehensive testing at each phase
5. Strong documentation and developer onboarding

**Timeline**: 6 weeks to production-ready integration
**Risk Level**: Medium (mitigated by phased approach)
**Expected Impact**: High (competitive differentiation, improved success rates)

---

**Document Status**: DRAFT - Awaiting Review
**Next Review**: 2025-12-24
**Approvers**: Development Team, Technical Lead, Product Owner
