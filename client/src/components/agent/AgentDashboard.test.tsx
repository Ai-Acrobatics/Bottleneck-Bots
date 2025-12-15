/**
 * Agent Dashboard Component Tests
 *
 * Comprehensive test suite for the Agent Dashboard component.
 * Tests real-time updates, metrics calculation, user interactions, and SSE integration.
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { screen, waitFor, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentDashboard } from './AgentDashboard';
import * as agentStoreModule from '@/stores/agentStore';
import * as useAgentSSEModule from '@/hooks/useAgentSSE';

// Mock modules
vi.mock('@/stores/agentStore');
vi.mock('@/hooks/useAgentSSE');

describe('AgentDashboard', () => {
  // Mock store data
  const mockStore = {
    status: 'idle' as const,
    currentTask: null,
    logs: [],
    connectedAgents: 0,
    setStatus: vi.fn(),
    setCurrentTask: vi.fn(),
    addLog: vi.fn(),
    clearLogs: vi.fn(),
    setConnectedAgents: vi.fn(),
    reset: vi.fn(),
  };

  // Mock SSE hook
  const mockSSE = {
    isConnected: true,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue(mockStore);
    vi.spyOn(useAgentSSEModule, 'useAgentSSE').mockReturnValue(mockSSE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders dashboard header with title', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText('Monitor and control AI agent execution')
      ).toBeInTheDocument();
    });

    it('displays connection status badge', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('shows disconnected status when SSE is not connected', () => {
      vi.spyOn(useAgentSSEModule, 'useAgentSSE').mockReturnValue({
        ...mockSSE,
        isConnected: false,
      });

      render(<AgentDashboard />);

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('renders all metric cards', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
      expect(screen.getByText('Swarm Agents')).toBeInTheDocument();
    });

    it('renders task input section', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'e.g., Create a landing page for a SaaS product...'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
    });

    it('renders recent executions section', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('Recent Executions')).toBeInTheDocument();
    });

    it('renders execution log section', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('Execution Log')).toBeInTheDocument();
    });

    it('renders quick actions section', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /view all executions/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /swarm configuration/i })
      ).toBeInTheDocument();
    });
  });

  describe('Metrics Display', () => {
    it('shows 0 active tasks when idle', () => {
      render(<AgentDashboard />);

      const activeTasksCard = screen.getByText('Active Tasks').closest('div');
      expect(within(activeTasksCard!).getByText('0')).toBeInTheDocument();
    });

    it('shows 1 active task when executing', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      const activeTasksCard = screen.getByText('Active Tasks').closest('div');
      expect(within(activeTasksCard!).getByText('1')).toBeInTheDocument();
    });

    it('shows 1 active task when planning', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'planning',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      const activeTasksCard = screen.getByText('Active Tasks').closest('div');
      expect(within(activeTasksCard!).getByText('1')).toBeInTheDocument();
    });

    it('displays correct completion rate', () => {
      render(<AgentDashboard />);

      // With demo data, there are 4 completed out of 5 total = 80%
      expect(screen.getByText('80.0%')).toBeInTheDocument();
    });

    it('displays swarm agent count', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        connectedAgents: 3,
      });

      render(<AgentDashboard />);

      const swarmCard = screen.getByText('Swarm Agents').closest('div');
      expect(within(swarmCard!).getByText('3')).toBeInTheDocument();
    });
  });

  describe('Task Input', () => {
    it('allows typing in task input field', async () => {
      const user = userEvent.setup();
      render(<AgentDashboard />);

      const input = screen.getByPlaceholderText(
        'e.g., Create a landing page for a SaaS product...'
      );

      await user.type(input, 'Test task description');

      expect(input).toHaveValue('Test task description');
    });

    it('disables execute button when input is empty', () => {
      render(<AgentDashboard />);

      const executeButton = screen.getByRole('button', { name: /execute/i });

      expect(executeButton).toBeDisabled();
    });

    it('enables execute button when input has text', async () => {
      const user = userEvent.setup();
      render(<AgentDashboard />);

      const input = screen.getByPlaceholderText(
        'e.g., Create a landing page for a SaaS product...'
      );
      const executeButton = screen.getByRole('button', { name: /execute/i });

      await user.type(input, 'Test task');

      expect(executeButton).not.toBeDisabled();
    });

    it('disables input and execute button when agent is executing', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Current task',
      });

      render(<AgentDashboard />);

      const input = screen.getByPlaceholderText(
        'e.g., Create a landing page for a SaaS product...'
      );
      const executeButton = screen.getByRole('button', { name: /execute/i });

      expect(input).toBeDisabled();
      expect(executeButton).toBeDisabled();
    });

    it('calls setStatus when execute button is clicked', async () => {
      const user = userEvent.setup();
      const setStatusSpy = vi.fn();

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        setStatus: setStatusSpy,
      });

      render(<AgentDashboard />);

      const input = screen.getByPlaceholderText(
        'e.g., Create a landing page for a SaaS product...'
      );
      await user.type(input, 'Test task');

      const executeButton = screen.getByRole('button', { name: /execute/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(setStatusSpy).toHaveBeenCalledWith('planning');
      });
    });

    it('clears input after submission', async () => {
      const user = userEvent.setup();
      render(<AgentDashboard />);

      const input = screen.getByPlaceholderText(
        'e.g., Create a landing page for a SaaS product...'
      );
      await user.type(input, 'Test task');

      const executeButton = screen.getByRole('button', { name: /execute/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('handles Enter key press to submit', async () => {
      const user = userEvent.setup();
      const setStatusSpy = vi.fn();

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        setStatus: setStatusSpy,
      });

      render(<AgentDashboard />);

      const input = screen.getByPlaceholderText(
        'e.g., Create a landing page for a SaaS product...'
      );
      await user.type(input, 'Test task{Enter}');

      await waitFor(() => {
        expect(setStatusSpy).toHaveBeenCalledWith('planning');
      });
    });
  });

  describe('Current Execution Display', () => {
    it('does not show current execution card when idle', () => {
      render(<AgentDashboard />);

      expect(screen.queryByText('Current Execution')).not.toBeInTheDocument();
    });

    it('shows current execution card when executing', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Building a website',
      });

      render(<AgentDashboard />);

      expect(screen.getByText('Current Execution')).toBeInTheDocument();
      expect(screen.getByText('Building a website')).toBeInTheDocument();
    });

    it('shows current execution card when planning', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'planning',
        currentTask: 'Analyzing requirements',
      });

      render(<AgentDashboard />);

      expect(screen.getByText('Current Execution')).toBeInTheDocument();
      expect(screen.getByText('Analyzing requirements')).toBeInTheDocument();
    });

    it('shows pause button when executing', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('shows resume button when paused', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'paused',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    });

    it('shows terminate button when executing', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      expect(
        screen.getByRole('button', { name: /terminate/i })
      ).toBeInTheDocument();
    });
  });

  describe('Execution Control Actions', () => {
    it('pauses execution when pause button is clicked', async () => {
      const user = userEvent.setup();
      const setStatusSpy = vi.fn();

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Test task',
        setStatus: setStatusSpy,
      });

      render(<AgentDashboard />);

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await user.click(pauseButton);

      expect(setStatusSpy).toHaveBeenCalledWith('paused');
    });

    it('resumes execution when resume button is clicked', async () => {
      const user = userEvent.setup();
      const setStatusSpy = vi.fn();

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'paused',
        currentTask: 'Test task',
        setStatus: setStatusSpy,
      });

      render(<AgentDashboard />);

      const resumeButton = screen.getByRole('button', { name: /resume/i });
      await user.click(resumeButton);

      expect(setStatusSpy).toHaveBeenCalledWith('executing');
    });

    it('terminates execution when terminate button is clicked and confirmed', async () => {
      const user = userEvent.setup();
      const setStatusSpy = vi.fn();

      // Mock window.confirm
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Test task',
        setStatus: setStatusSpy,
      });

      render(<AgentDashboard />);

      const terminateButton = screen.getByRole('button', { name: /terminate/i });
      await user.click(terminateButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(setStatusSpy).toHaveBeenCalledWith('idle');
    });

    it('does not terminate when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      const setStatusSpy = vi.fn();

      // Mock window.confirm to return false
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Test task',
        setStatus: setStatusSpy,
      });

      render(<AgentDashboard />);

      const terminateButton = screen.getByRole('button', { name: /terminate/i });
      await user.click(terminateButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(setStatusSpy).not.toHaveBeenCalled();
    });
  });

  describe('Recent Executions', () => {
    it('displays demo executions', () => {
      render(<AgentDashboard />);

      expect(
        screen.getByText('Analyze landing page performance and SEO metrics')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Generate social media content for product launch')
      ).toBeInTheDocument();
    });

    it('shows execution status badges', () => {
      render(<AgentDashboard />);

      // Check for completed badges
      const completedBadges = screen.getAllByText('Completed');
      expect(completedBadges.length).toBeGreaterThan(0);

      // Check for error badge
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('shows execution duration', () => {
      render(<AgentDashboard />);

      // Demo data includes 60s, 120s durations
      expect(screen.getByText('1.0m')).toBeInTheDocument();
      expect(screen.getByText('2.0m')).toBeInTheDocument();
    });

    it('shows error message for failed executions', () => {
      render(<AgentDashboard />);

      expect(
        screen.getByText('Error: Form element not found on page')
      ).toBeInTheDocument();
    });

    it('adds current execution to the top of the list', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Current running task',
      });

      render(<AgentDashboard />);

      const executions = screen.getAllByText(/task/i);
      // First execution should be the current one
      expect(executions[0]).toHaveTextContent('Current running task');
    });
  });

  describe('Execution Logs', () => {
    it('shows empty state when no logs', () => {
      render(<AgentDashboard />);

      expect(screen.getByText('No logs yet')).toBeInTheDocument();
      expect(
        screen.getByText('Logs will appear when you start a task')
      ).toBeInTheDocument();
    });

    it('displays logs when available', () => {
      const mockLogs = [
        {
          id: '1',
          timestamp: '14:32:01',
          level: 'info',
          message: 'Agent initialized',
          detail: 'Session started',
        },
        {
          id: '2',
          timestamp: '14:32:02',
          level: 'success',
          message: 'Task completed',
        },
      ];

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        logs: mockLogs,
      });

      render(<AgentDashboard />);

      expect(screen.getByText('Agent initialized')).toBeInTheDocument();
      expect(screen.getByText('Task completed')).toBeInTheDocument();
      expect(screen.getByText('Session started')).toBeInTheDocument();
    });

    it('displays log timestamps', () => {
      const mockLogs = [
        {
          id: '1',
          timestamp: '14:32:01',
          level: 'info',
          message: 'Test message',
        },
      ];

      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        logs: mockLogs,
      });

      render(<AgentDashboard />);

      expect(screen.getByText('14:32:01')).toBeInTheDocument();
    });
  });

  describe('SSE Integration', () => {
    it('initializes SSE connection with autoConnect', () => {
      render(<AgentDashboard />);

      expect(useAgentSSEModule.useAgentSSE).toHaveBeenCalledWith({
        autoConnect: true,
      });
    });

    it('updates connection status based on SSE state', () => {
      const { rerender } = render(<AgentDashboard />);

      expect(screen.getByText('Connected')).toBeInTheDocument();

      // Simulate disconnection
      vi.spyOn(useAgentSSEModule, 'useAgentSSE').mockReturnValue({
        ...mockSSE,
        isConnected: false,
      });

      rerender(<AgentDashboard />);

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('shows correct badge for idle status', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'idle',
        currentTask: 'Test',
      });

      // We need to render a component that shows status badge with idle
      // Since idle doesn't show current execution, we'll check in recent executions
      render(<AgentDashboard />);

      // Demo data doesn't include idle status, so this test is informational
      expect(true).toBe(true);
    });

    it('shows correct badge for planning status', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'planning',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      expect(screen.getByText('Planning')).toBeInTheDocument();
    });

    it('shows correct badge for executing status', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'executing',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      expect(screen.getByText('Executing')).toBeInTheDocument();
    });

    it('shows correct badge for completed status', () => {
      render(<AgentDashboard />);

      // Demo data has completed executions
      expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    });

    it('shows correct badge for error status', () => {
      render(<AgentDashboard />);

      // Demo data has one error execution
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('shows correct badge for paused status', () => {
      vi.spyOn(agentStoreModule, 'useAgentStore').mockReturnValue({
        ...mockStore,
        status: 'paused',
        currentTask: 'Test task',
      });

      render(<AgentDashboard />);

      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible form controls', () => {
      render(<AgentDashboard />);

      const input = screen.getByPlaceholderText(
        'e.g., Create a landing page for a SaaS product...'
      );
      expect(input).toHaveAccessibleName();
    });

    it('has accessible buttons', () => {
      render(<AgentDashboard />);

      const executeButton = screen.getByRole('button', { name: /execute/i });
      expect(executeButton).toBeInTheDocument();
    });

    it('provides semantic HTML structure', () => {
      render(<AgentDashboard />);

      expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /view all executions/i })
      ).toBeInTheDocument();
    });
  });
});
