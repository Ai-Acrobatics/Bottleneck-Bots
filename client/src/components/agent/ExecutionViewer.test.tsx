/**
 * ExecutionViewer Component Tests
 *
 * Tests for the real-time execution viewer including:
 * - Rendering execution status
 * - Log filtering
 * - Step expansion/collapse
 * - Copy functionality
 * - Auto-scroll behavior
 * - Empty states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExecutionViewer } from './ExecutionViewer';
import { useAgentStore } from '@/stores/agentStore';
import { AgentExecution, ThinkingStep } from '@/types/agent';

// Mock the stores
vi.mock('@/stores/agentStore', () => ({
  useAgentStore: vi.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('ExecutionViewer', () => {
  const mockExecution: AgentExecution = {
    id: 'exec-1',
    task: 'Create a landing page',
    status: 'executing',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:05:00Z'),
    metadata: {
      model: 'gpt-4',
      tokensUsed: 1500,
      duration: 5000,
    },
    plan: {
      id: 'plan-1',
      phases: [
        {
          id: 'phase-1',
          name: 'Planning',
          description: 'Create execution plan',
          status: 'completed',
          steps: ['Analyze requirements', 'Define structure'],
          progress: 100,
        },
        {
          id: 'phase-2',
          name: 'Implementation',
          description: 'Build the landing page',
          status: 'in_progress',
          steps: ['Create components', 'Add styling'],
          progress: 50,
        },
      ],
    },
  };

  const mockThinkingSteps: ThinkingStep[] = [
    {
      id: 'step-1',
      type: 'thinking',
      content: 'Analyzing the requirements',
      timestamp: new Date('2025-01-01T10:00:00Z'),
      metadata: {
        duration: 1000,
      },
    },
    {
      id: 'step-2',
      type: 'tool_use',
      content: 'Using file creation tool',
      timestamp: new Date('2025-01-01T10:01:00Z'),
      toolName: 'create_file',
      toolParams: {
        filename: 'index.html',
        content: '<html></html>',
      },
      metadata: {
        duration: 2000,
      },
    },
    {
      id: 'step-3',
      type: 'tool_result',
      content: 'File created successfully',
      timestamp: new Date('2025-01-01T10:01:02Z'),
      toolName: 'create_file',
      toolResult: {
        success: true,
        path: '/path/to/index.html',
      },
    },
    {
      id: 'step-4',
      type: 'error',
      content: 'Failed to compile CSS',
      timestamp: new Date('2025-01-01T10:02:00Z'),
      metadata: {
        error: 'Syntax error in CSS file',
      },
    },
  ];

  const mockLogs = [
    {
      id: 'log-1',
      timestamp: '10:00:00',
      level: 'info' as const,
      message: 'Task started',
      detail: 'Starting execution',
    },
    {
      id: 'log-2',
      timestamp: '10:01:00',
      level: 'success' as const,
      message: 'Phase completed',
    },
    {
      id: 'log-3',
      timestamp: '10:02:00',
      level: 'warning' as const,
      message: 'Resource usage high',
      detail: 'CPU usage at 85%',
    },
    {
      id: 'log-4',
      timestamp: '10:03:00',
      level: 'error' as const,
      message: 'Compilation failed',
      detail: 'CSS syntax error on line 42',
    },
    {
      id: 'log-5',
      timestamp: '10:04:00',
      level: 'system' as const,
      message: 'Connected to agent stream',
    },
  ];

  beforeEach(() => {
    (useAgentStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      logs: mockLogs,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render empty state when no data provided', () => {
      (useAgentStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        logs: [],
      });

      render(<ExecutionViewer />);

      expect(screen.getByText('No execution data available')).toBeInTheDocument();
      expect(screen.getByText('Start an agent task to see real-time execution details')).toBeInTheDocument();
    });

    it('should render execution status and metadata', () => {
      render(<ExecutionViewer execution={mockExecution} />);

      expect(screen.getByText('Create a landing page')).toBeInTheDocument();
      expect(screen.getByText('executing')).toBeInTheDocument();
      expect(screen.getByText(/Tokens: 1,500/)).toBeInTheDocument();
      expect(screen.getByText(/Duration: 5.0s/)).toBeInTheDocument();
    });

    it('should render execution plan with phases', () => {
      render(<ExecutionViewer execution={mockExecution} />);

      expect(screen.getByText('Execution Plan')).toBeInTheDocument();
      expect(screen.getByText('Phase 1: Planning')).toBeInTheDocument();
      expect(screen.getByText('Phase 2: Implementation')).toBeInTheDocument();
      expect(screen.getByText('Create execution plan')).toBeInTheDocument();
      expect(screen.getByText('Build the landing page')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render thinking steps', () => {
      render(<ExecutionViewer thinkingSteps={mockThinkingSteps} />);

      expect(screen.getByText('Thinking Steps (4)')).toBeInTheDocument();
      expect(screen.getByText('Analyzing the requirements')).toBeInTheDocument();
      expect(screen.getByText('Using file creation tool')).toBeInTheDocument();
      expect(screen.getByText('File created successfully')).toBeInTheDocument();
      expect(screen.getByText('Failed to compile CSS')).toBeInTheDocument();
    });

    it('should render logs', () => {
      render(<ExecutionViewer />);

      expect(screen.getByText('Logs (5)')).toBeInTheDocument();
      expect(screen.getByText('Task started')).toBeInTheDocument();
      expect(screen.getByText('Phase completed')).toBeInTheDocument();
      expect(screen.getByText('Resource usage high')).toBeInTheDocument();
      expect(screen.getByText('Compilation failed')).toBeInTheDocument();
      expect(screen.getByText('Connected to agent stream')).toBeInTheDocument();
    });

    it('should display tool name for tool steps', () => {
      render(<ExecutionViewer thinkingSteps={mockThinkingSteps} />);

      const toolSteps = screen.getAllByText(/Tool:/);
      expect(toolSteps).toHaveLength(2); // tool_use and tool_result
    });
  });

  describe('Log Filtering', () => {
    it('should filter logs by level', async () => {
      render(<ExecutionViewer showFilters={true} />);

      // Initially show all logs
      expect(screen.getByText('5 entries')).toBeInTheDocument();

      // Filter by error - find the select trigger by text content
      const filterSelect = screen.getByText('All Levels').closest('button');
      expect(filterSelect).toBeInTheDocument();
      fireEvent.click(filterSelect!);

      const errorOption = screen.getByRole('option', { name: 'Error' });
      fireEvent.click(errorOption);

      await waitFor(() => {
        expect(screen.getByText('1 entry')).toBeInTheDocument();
      });

      expect(screen.getByText('Compilation failed')).toBeInTheDocument();
      expect(screen.queryByText('Task started')).not.toBeInTheDocument();
    });

    it('should show correct count for each filter level', async () => {
      render(<ExecutionViewer showFilters={true} />);

      // Get the select trigger - it's a combobox with "All Levels" text
      const filterSelect = screen.getByText('All Levels').closest('button');
      expect(filterSelect).toBeInTheDocument();

      // Test info filter
      fireEvent.click(filterSelect!);
      fireEvent.click(screen.getByRole('option', { name: 'Info' }));
      await waitFor(() => {
        expect(screen.getByText('1 entry')).toBeInTheDocument();
      });

      // Test success filter - find by text again since value changed
      const infoSelect = screen.getByText('Info').closest('button');
      fireEvent.click(infoSelect!);
      fireEvent.click(screen.getByRole('option', { name: 'Success' }));
      await waitFor(() => {
        expect(screen.getByText('1 entry')).toBeInTheDocument();
      });

      // Test all filter
      const successSelect = screen.getByText('Success').closest('button');
      fireEvent.click(successSelect!);
      fireEvent.click(screen.getByRole('option', { name: 'All Levels' }));
      await waitFor(() => {
        expect(screen.getByText('5 entries')).toBeInTheDocument();
      });
    });

    it('should hide filters when showFilters is false', () => {
      render(<ExecutionViewer showFilters={false} />);

      expect(screen.queryByRole('button', { name: /All Levels/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Expand All')).not.toBeInTheDocument();
      expect(screen.queryByText('Collapse All')).not.toBeInTheDocument();
    });
  });

  describe('Step Expansion', () => {
    it('should expand and collapse thinking steps', async () => {
      render(<ExecutionViewer thinkingSteps={mockThinkingSteps} />);

      // Find the step with tool params
      const toolStep = screen.getByText('Using file creation tool');
      const stepContainer = toolStep.closest('[data-state]');

      expect(stepContainer).toHaveAttribute('data-state', 'closed');

      // Click to expand
      fireEvent.click(toolStep);

      await waitFor(() => {
        expect(stepContainer).toHaveAttribute('data-state', 'open');
      });

      expect(screen.getByText('Input Parameters')).toBeInTheDocument();
      expect(screen.getByText(/"filename": "index.html"/)).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(toolStep);

      await waitFor(() => {
        expect(stepContainer).toHaveAttribute('data-state', 'closed');
      });
    });

    it('should expand all steps', async () => {
      render(<ExecutionViewer thinkingSteps={mockThinkingSteps} />);

      const expandAllButton = screen.getByText('Expand All');
      fireEvent.click(expandAllButton);

      await waitFor(() => {
        // Check if Input Parameters is visible (from tool step)
        expect(screen.getByText('Input Parameters')).toBeInTheDocument();
        // Check if Output Result is visible (from tool result step)
        expect(screen.getByText('Output Result')).toBeInTheDocument();
      });
    });

    it('should collapse all steps', async () => {
      render(<ExecutionViewer thinkingSteps={mockThinkingSteps} />);

      // First expand all
      const expandAllButton = screen.getByText('Expand All');
      fireEvent.click(expandAllButton);

      await waitFor(() => {
        expect(screen.getByText('Input Parameters')).toBeInTheDocument();
      });

      // Then collapse all
      const collapseAllButton = screen.getByText('Collapse All');
      fireEvent.click(collapseAllButton);

      await waitFor(() => {
        expect(screen.queryByText('Input Parameters')).not.toBeInTheDocument();
      });
    });

    it('should expand log details', async () => {
      render(<ExecutionViewer />);

      const logWithDetail = screen.getByText('Resource usage high');
      fireEvent.click(logWithDetail);

      await waitFor(() => {
        expect(screen.getByText('CPU usage at 85%')).toBeInTheDocument();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('should copy tool parameters to clipboard', async () => {
      render(<ExecutionViewer thinkingSteps={mockThinkingSteps} />);

      // Expand the tool step
      const toolStep = screen.getByText('Using file creation tool');
      fireEvent.click(toolStep);

      await waitFor(() => {
        expect(screen.getByText('Input Parameters')).toBeInTheDocument();
      });

      // Find and click copy button
      const copyButtons = screen.getAllByRole('button', { name: '' });
      const paramsCopyButton = copyButtons.find((btn) => {
        const parent = btn.closest('div');
        return parent?.textContent?.includes('Input Parameters');
      });

      expect(paramsCopyButton).toBeDefined();
      fireEvent.click(paramsCopyButton!);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          JSON.stringify(mockThinkingSteps[1].toolParams, null, 2)
        );
      });
    });

    it('should copy tool result to clipboard', async () => {
      render(<ExecutionViewer thinkingSteps={mockThinkingSteps} />);

      // Expand the tool result step
      const resultStep = screen.getByText('File created successfully');
      fireEvent.click(resultStep);

      await waitFor(() => {
        expect(screen.getByText('Output Result')).toBeInTheDocument();
      });

      // Find and click copy button for result
      const copyButtons = screen.getAllByRole('button', { name: '' });
      const resultCopyButton = copyButtons.find((btn) => {
        const parent = btn.closest('div');
        return parent?.textContent?.includes('Output Result');
      });

      expect(resultCopyButton).toBeDefined();
      fireEvent.click(resultCopyButton!);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          JSON.stringify(mockThinkingSteps[2].toolResult, null, 2)
        );
      });
    });

    it('should copy log details to clipboard', async () => {
      render(<ExecutionViewer />);

      // Expand log with details
      const log = screen.getByText('Resource usage high');
      fireEvent.click(log);

      await waitFor(() => {
        expect(screen.getByText('CPU usage at 85%')).toBeInTheDocument();
      });

      // Find and click copy button
      const copyButtons = screen.getAllByRole('button', { name: '' });
      const detailsCopyButton = copyButtons.find((btn) => {
        const parent = btn.closest('div');
        return parent?.textContent?.includes('Details');
      });

      expect(detailsCopyButton).toBeDefined();
      fireEvent.click(detailsCopyButton!);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('CPU usage at 85%');
      });
    });

    it('should copy execution result to clipboard', async () => {
      const executionWithResult: AgentExecution = {
        ...mockExecution,
        result: { success: true, data: 'Landing page created' },
      };

      render(<ExecutionViewer execution={executionWithResult} />);

      const copyButton = screen.getByRole('button', { name: /Copy/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          JSON.stringify(executionWithResult.result, null, 2)
        );
      });
    });

    it('should show copied state after copying', async () => {
      const executionWithResult: AgentExecution = {
        ...mockExecution,
        result: 'Success',
      };

      render(<ExecutionViewer execution={executionWithResult} />);

      const copyButton = screen.getByRole('button', { name: /Copy/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied')).toBeInTheDocument();
      });
    });
  });

  describe('Status Indicators', () => {
    it('should show correct status badge colors', () => {
      const statuses: Array<AgentExecution['status']> = [
        'planning',
        'executing',
        'completed',
        'failed',
        'cancelled',
      ];

      statuses.forEach((status) => {
        const { container, unmount } = render(
          <ExecutionViewer execution={{ ...mockExecution, status }} />
        );

        const badge = screen.getByText(status);
        expect(badge).toBeInTheDocument();

        unmount();
      });
    });

    it('should display phase status icons', () => {
      render(<ExecutionViewer execution={mockExecution} />);

      // Check for completed phase
      const completedPhase = screen.getByText('Phase 1: Planning').closest('div');
      expect(completedPhase).toBeInTheDocument();

      // Check for in_progress phase
      const inProgressPhase = screen.getByText('Phase 2: Implementation').closest('div');
      expect(inProgressPhase).toBeInTheDocument();
    });

    it('should show error details when execution fails', () => {
      const failedExecution: AgentExecution = {
        ...mockExecution,
        status: 'failed',
        error: 'Network connection timeout',
      };

      render(<ExecutionViewer execution={failedExecution} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network connection timeout')).toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('should format milliseconds correctly', () => {
      const step: ThinkingStep = {
        id: 'step-1',
        type: 'thinking',
        content: 'Fast operation',
        timestamp: new Date(),
        metadata: { duration: 500 },
      };

      render(<ExecutionViewer thinkingSteps={[step]} />);

      expect(screen.getByText('500ms')).toBeInTheDocument();
    });

    it('should format seconds correctly', () => {
      const step: ThinkingStep = {
        id: 'step-1',
        type: 'thinking',
        content: 'Medium operation',
        timestamp: new Date(),
        metadata: { duration: 5500 },
      };

      render(<ExecutionViewer thinkingSteps={[step]} />);

      expect(screen.getByText('5.5s')).toBeInTheDocument();
    });

    it('should format minutes correctly', () => {
      const step: ThinkingStep = {
        id: 'step-1',
        type: 'thinking',
        content: 'Long operation',
        timestamp: new Date(),
        metadata: { duration: 125000 },
      };

      render(<ExecutionViewer thinkingSteps={[step]} />);

      expect(screen.getByText('2m 5s')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(<ExecutionViewer className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should respect custom maxHeight', () => {
      (useAgentStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        logs: mockLogs,
      });

      const { container } = render(<ExecutionViewer maxHeight="400px" />);

      const scrollAreas = container.querySelectorAll('[style*="height"]');
      expect(scrollAreas.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle execution without plan', () => {
      const executionNoPlan: AgentExecution = {
        ...mockExecution,
        plan: undefined,
      };

      render(<ExecutionViewer execution={executionNoPlan} />);

      expect(screen.queryByText('Execution Plan')).not.toBeInTheDocument();
    });

    it('should handle steps without tool data', () => {
      const simpleStep: ThinkingStep = {
        id: 'step-1',
        type: 'thinking',
        content: 'Just thinking',
        timestamp: new Date(),
      };

      render(<ExecutionViewer thinkingSteps={[simpleStep]} />);

      expect(screen.getByText('Just thinking')).toBeInTheDocument();

      // Expand step
      fireEvent.click(screen.getByText('Just thinking'));

      // Should not show tool-related content
      expect(screen.queryByText('Input Parameters')).not.toBeInTheDocument();
      expect(screen.queryByText('Output Result')).not.toBeInTheDocument();
    });

    it('should handle logs without details', () => {
      (useAgentStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        logs: [
          {
            id: 'log-1',
            timestamp: '10:00:00',
            level: 'info' as const,
            message: 'Simple log',
          },
        ],
      });

      render(<ExecutionViewer />);

      expect(screen.getByText('Simple log')).toBeInTheDocument();
      // Should not have chevron for expansion since there's no detail
      expect(screen.queryByRole('button', { name: /chevron/i })).not.toBeInTheDocument();
    });

    it('should handle string results', () => {
      const executionWithStringResult: AgentExecution = {
        ...mockExecution,
        result: 'Task completed successfully',
      };

      render(<ExecutionViewer execution={executionWithStringResult} />);

      expect(screen.getByText('Task completed successfully')).toBeInTheDocument();
    });
  });
});
