/**
 * ExecutionViewer Usage Examples
 *
 * This file demonstrates various ways to use the ExecutionViewer component
 * in different scenarios and configurations.
 */

import React, { useState } from 'react';
import { ExecutionViewer } from './ExecutionViewer';
import { useAgentSSE } from '@/hooks/useAgentSSE';
import { AgentExecution, ThinkingStep } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Example 1: Basic Usage with SSE Integration
 *
 * The most common use case - connecting to a live agent execution
 * and displaying real-time updates via Server-Sent Events.
 */
export function BasicExecutionViewerExample() {
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);

  // Connect to SSE stream
  const { isConnected, connect, disconnect } = useAgentSSE({
    autoConnect: false,
    sessionId: executionId || undefined,
  });

  const startExecution = async () => {
    // Start a new execution via API
    const response = await fetch('/api/agent/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'Create a responsive navigation component',
      }),
    });

    const data = await response.json();
    setExecutionId(data.executionId);
    setExecution(data.execution);

    // Connect to SSE stream for this execution
    connect(data.executionId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={startExecution} disabled={isConnected}>
          Start Execution
        </Button>
        <Button onClick={disconnect} disabled={!isConnected} variant="outline">
          Disconnect
        </Button>
        <div className="text-sm text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <ExecutionViewer
        execution={execution || undefined}
        thinkingSteps={thinkingSteps}
        showFilters={true}
        autoScroll={true}
      />
    </div>
  );
}

/**
 * Example 2: Minimal Configuration
 *
 * Simplest possible setup - just pass the execution data
 * and let the component handle everything else.
 */
export function MinimalExecutionViewerExample() {
  const mockExecution: AgentExecution = {
    id: 'exec-123',
    task: 'Analyze user feedback and generate report',
    status: 'executing',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return <ExecutionViewer execution={mockExecution} />;
}

/**
 * Example 3: Custom Styling and Height
 *
 * Demonstrates how to customize the appearance and
 * dimensions of the execution viewer.
 */
export function CustomStyledExecutionViewerExample() {
  const mockExecution: AgentExecution = {
    id: 'exec-456',
    task: 'Optimize database queries',
    status: 'completed',
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(),
    completedAt: new Date(),
    metadata: {
      duration: 45000,
      tokensUsed: 2500,
    },
  };

  return (
    <ExecutionViewer
      execution={mockExecution}
      className="border-2 border-blue-500 shadow-lg"
      maxHeight="800px"
      showFilters={true}
      autoScroll={false}
    />
  );
}

/**
 * Example 4: With Complete Plan and Phases
 *
 * Shows an execution with a full plan including multiple phases,
 * steps, and progress tracking.
 */
export function ExecutionWithPlanExample() {
  const executionWithPlan: AgentExecution = {
    id: 'exec-789',
    task: 'Build complete e-commerce checkout flow',
    status: 'executing',
    createdAt: new Date(Date.now() - 600000),
    updatedAt: new Date(),
    metadata: {
      model: 'claude-opus-4.5',
      tokensUsed: 5000,
      duration: 120000,
    },
    plan: {
      id: 'plan-123',
      phases: [
        {
          id: 'phase-1',
          name: 'Analysis',
          description: 'Analyze requirements and design system architecture',
          status: 'completed',
          steps: [
            'Review user stories',
            'Define data models',
            'Design API endpoints',
            'Create component hierarchy',
          ],
          progress: 100,
        },
        {
          id: 'phase-2',
          name: 'Implementation',
          description: 'Build components and integrate payment processing',
          status: 'in_progress',
          steps: [
            'Create cart component',
            'Implement checkout form',
            'Integrate Stripe API',
            'Add order confirmation',
          ],
          progress: 60,
        },
        {
          id: 'phase-3',
          name: 'Testing',
          description: 'Test all flows and edge cases',
          status: 'pending',
          steps: [
            'Write unit tests',
            'Add integration tests',
            'Perform manual testing',
            'Fix bugs',
          ],
          progress: 0,
        },
        {
          id: 'phase-4',
          name: 'Deployment',
          description: 'Deploy to production and monitor',
          status: 'pending',
          steps: ['Build production bundle', 'Deploy to Vercel', 'Monitor errors', 'Update documentation'],
          progress: 0,
        },
      ],
      currentPhase: 1,
      estimatedDuration: '15-20 minutes',
    },
  };

  return (
    <ExecutionViewer execution={executionWithPlan} showFilters={true} maxHeight="700px" />
  );
}

/**
 * Example 5: With Thinking Steps and Tool Usage
 *
 * Demonstrates the viewer displaying thinking steps with
 * tool calls, parameters, and results.
 */
export function ExecutionWithThinkingStepsExample() {
  const thinkingSteps: ThinkingStep[] = [
    {
      id: 'step-1',
      type: 'thinking',
      content: 'I need to create a React component for the navigation menu. First, I will analyze the requirements.',
      timestamp: new Date(Date.now() - 60000),
      metadata: {
        duration: 1500,
      },
    },
    {
      id: 'step-2',
      type: 'plan',
      content: 'Plan: 1. Create component file, 2. Add TypeScript types, 3. Implement responsive design, 4. Add accessibility features',
      timestamp: new Date(Date.now() - 55000),
    },
    {
      id: 'step-3',
      type: 'tool_use',
      content: 'Creating the navigation component file',
      timestamp: new Date(Date.now() - 50000),
      toolName: 'write_file',
      toolParams: {
        path: 'src/components/Navigation.tsx',
        content: 'import React from "react";\n\nexport function Navigation() {...}',
      },
      metadata: {
        duration: 2000,
      },
    },
    {
      id: 'step-4',
      type: 'tool_result',
      content: 'File created successfully',
      timestamp: new Date(Date.now() - 48000),
      toolName: 'write_file',
      toolResult: {
        success: true,
        path: '/project/src/components/Navigation.tsx',
        bytesWritten: 1024,
      },
    },
    {
      id: 'step-5',
      type: 'thinking',
      content: 'Now I need to add the styling with Tailwind CSS classes',
      timestamp: new Date(Date.now() - 45000),
    },
    {
      id: 'step-6',
      type: 'tool_use',
      content: 'Reading the current Tailwind configuration',
      timestamp: new Date(Date.now() - 40000),
      toolName: 'read_file',
      toolParams: {
        path: 'tailwind.config.js',
      },
    },
    {
      id: 'step-7',
      type: 'error',
      content: 'Failed to read Tailwind config - file not found',
      timestamp: new Date(Date.now() - 38000),
      metadata: {
        error: 'ENOENT: no such file or directory, open "tailwind.config.js"',
      },
    },
    {
      id: 'step-8',
      type: 'thinking',
      content: 'The Tailwind config does not exist yet. I will use default Tailwind classes.',
      timestamp: new Date(Date.now() - 35000),
    },
    {
      id: 'step-9',
      type: 'message',
      content: 'Navigation component created successfully with responsive design and ARIA labels',
      timestamp: new Date(Date.now() - 30000),
    },
  ];

  const execution: AgentExecution = {
    id: 'exec-999',
    task: 'Create a responsive navigation component',
    status: 'completed',
    createdAt: new Date(Date.now() - 60000),
    updatedAt: new Date(),
    completedAt: new Date(),
    result: {
      filesCreated: ['src/components/Navigation.tsx'],
      linesOfCode: 85,
      features: ['Responsive design', 'Mobile menu', 'Keyboard navigation', 'ARIA labels'],
    },
    metadata: {
      duration: 60000,
      tokensUsed: 3500,
      model: 'claude-sonnet-4.5',
    },
  };

  return (
    <ExecutionViewer
      execution={execution}
      thinkingSteps={thinkingSteps}
      showFilters={true}
      autoScroll={true}
      maxHeight="600px"
    />
  );
}

/**
 * Example 6: Failed Execution with Error
 *
 * Shows how the viewer displays failed executions
 * with error messages.
 */
export function FailedExecutionExample() {
  const failedExecution: AgentExecution = {
    id: 'exec-error',
    task: 'Deploy application to production',
    status: 'failed',
    createdAt: new Date(Date.now() - 120000),
    updatedAt: new Date(),
    error: 'Deployment failed: Authentication credentials are invalid. Please check your API key and try again.',
    metadata: {
      duration: 15000,
      tokensUsed: 500,
    },
  };

  return <ExecutionViewer execution={failedExecution} />;
}

/**
 * Example 7: Multiple Viewers in Tabs
 *
 * Demonstrates using multiple execution viewers
 * in a tabbed interface for comparing executions.
 */
export function MultipleExecutionsExample() {
  const execution1: AgentExecution = {
    id: 'exec-a',
    task: 'Optimize React components',
    status: 'completed',
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(Date.now() - 240000),
    completedAt: new Date(Date.now() - 240000),
    metadata: { duration: 60000 },
  };

  const execution2: AgentExecution = {
    id: 'exec-b',
    task: 'Add authentication flow',
    status: 'executing',
    createdAt: new Date(Date.now() - 120000),
    updatedAt: new Date(),
    metadata: { duration: 120000 },
  };

  const execution3: AgentExecution = {
    id: 'exec-c',
    task: 'Setup CI/CD pipeline',
    status: 'failed',
    createdAt: new Date(Date.now() - 180000),
    updatedAt: new Date(Date.now() - 150000),
    error: 'GitHub Actions workflow syntax error',
    metadata: { duration: 30000 },
  };

  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList>
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="failed">Failed</TabsTrigger>
      </TabsList>

      <TabsContent value="current" className="mt-4">
        <ExecutionViewer execution={execution2} showFilters={true} />
      </TabsContent>

      <TabsContent value="completed" className="mt-4">
        <ExecutionViewer execution={execution1} showFilters={false} />
      </TabsContent>

      <TabsContent value="failed" className="mt-4">
        <ExecutionViewer execution={execution3} showFilters={false} />
      </TabsContent>
    </Tabs>
  );
}

/**
 * Example 8: Comprehensive Demo with All Features
 *
 * A complete example showing all features of the ExecutionViewer
 * in a single, production-ready component.
 */
export function ComprehensiveExecutionViewerDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">ExecutionViewer Component Demo</h1>
        <p className="text-gray-600">
          Explore different configurations and use cases for the ExecutionViewer component
        </p>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <MinimalExecutionViewerExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">With Execution Plan</h2>
          <ExecutionWithPlanExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">With Thinking Steps</h2>
          <ExecutionWithThinkingStepsExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Failed Execution</h2>
          <FailedExecutionExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Multiple Executions</h2>
          <MultipleExecutionsExample />
        </section>
      </div>
    </div>
  );
}
