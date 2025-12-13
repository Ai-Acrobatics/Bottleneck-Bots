/**
 * SwarmView Component Tests
 *
 * Comprehensive test suite for the SwarmView component
 */

import * as React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SwarmView } from './SwarmView';
import { trpc } from '@/lib/trpc';

// Mock tRPC
vi.mock('@/lib/trpc', () => ({
  trpc: {
    swarm: {
      listActive: {
        useQuery: vi.fn(),
      },
      getStatus: {
        useQuery: vi.fn(),
      },
      getHealth: {
        useQuery: vi.fn(),
      },
      getMetrics: {
        useQuery: vi.fn(),
      },
      getQueueStatus: {
        useQuery: vi.fn(),
      },
      stop: {
        useMutation: vi.fn(),
      },
      start: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock data
const mockActiveSwarms = {
  success: true,
  swarms: [
    {
      id: 'swarm-1',
      name: 'Test Swarm 1',
      status: 'executing',
      strategy: 'development',
      progress: 45,
      agentCount: 5,
      taskCount: 10,
      startTime: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'swarm-2',
      name: 'Test Swarm 2',
      status: 'planning',
      strategy: 'research',
      progress: 0,
      agentCount: 3,
      taskCount: 5,
      startTime: new Date('2024-01-01T01:00:00Z'),
    },
  ],
};

const mockSwarmStatus = {
  success: true,
  swarm: {
    id: 'swarm-1',
    name: 'Test Swarm 1',
    status: 'executing',
    progress: {
      totalTasks: 10,
      completedTasks: 4,
      failedTasks: 1,
      runningTasks: 2,
      percentComplete: 45,
      estimatedCompletion: new Date('2024-01-01T02:00:00Z'),
      timeRemaining: 3600000,
      averageQuality: 0.85,
      activeAgents: 3,
      idleAgents: 2,
      resourceUtilization: {},
    },
    agents: [
      {
        id: { id: 'agent-1', swarmId: 'swarm-1', type: 'coordinator', instance: 1 },
        name: 'Coordinator Agent',
        type: 'coordinator',
        status: 'busy',
        capabilities: {
          codeGeneration: true,
          codeReview: true,
          testing: false,
          documentation: true,
          research: true,
          analysis: true,
          webSearch: false,
          apiIntegration: false,
          fileSystem: true,
          terminalAccess: false,
          languages: ['typescript', 'javascript'],
          frameworks: ['react', 'node'],
          domains: ['web'],
          tools: ['git'],
          maxConcurrentTasks: 5,
          maxMemoryUsage: 1024,
          maxExecutionTime: 300000,
          reliability: 0.95,
          speed: 0.8,
          quality: 0.9,
        },
        metrics: {
          tasksCompleted: 15,
          tasksFailed: 2,
          averageExecutionTime: 5000,
          successRate: 0.88,
          cpuUsage: 45,
          memoryUsage: 512,
          diskUsage: 100,
          codeQuality: 0.85,
          testCoverage: 0.75,
          lastActivity: new Date(),
          responseTime: 200,
        },
        currentTask: { id: 'task-1', swarmId: 'swarm-1', sequence: 1, priority: 1 },
        workload: 60,
        health: 85,
        lastHeartbeat: new Date(),
        errorHistory: [],
        taskHistory: [],
      },
      {
        id: { id: 'agent-2', swarmId: 'swarm-1', type: 'coder', instance: 1 },
        name: 'Coder Agent',
        type: 'coder',
        status: 'busy',
        capabilities: {
          codeGeneration: true,
          codeReview: true,
          testing: true,
          documentation: false,
          research: false,
          analysis: false,
          webSearch: false,
          apiIntegration: true,
          fileSystem: true,
          terminalAccess: true,
          languages: ['typescript', 'python'],
          frameworks: ['react', 'django'],
          domains: ['web', 'api'],
          tools: ['git', 'docker'],
          maxConcurrentTasks: 3,
          maxMemoryUsage: 2048,
          maxExecutionTime: 600000,
          reliability: 0.9,
          speed: 0.85,
          quality: 0.95,
        },
        metrics: {
          tasksCompleted: 20,
          tasksFailed: 1,
          averageExecutionTime: 8000,
          successRate: 0.95,
          cpuUsage: 65,
          memoryUsage: 1024,
          diskUsage: 200,
          codeQuality: 0.92,
          testCoverage: 0.88,
          lastActivity: new Date(),
          responseTime: 150,
        },
        currentTask: { id: 'task-2', swarmId: 'swarm-1', sequence: 2, priority: 2 },
        workload: 75,
        health: 90,
        lastHeartbeat: new Date(),
        errorHistory: [],
        taskHistory: [],
      },
      {
        id: { id: 'agent-3', swarmId: 'swarm-1', type: 'tester', instance: 1 },
        name: 'Tester Agent',
        type: 'tester',
        status: 'idle',
        capabilities: {
          codeGeneration: false,
          codeReview: true,
          testing: true,
          documentation: true,
          research: false,
          analysis: true,
          webSearch: false,
          apiIntegration: false,
          fileSystem: true,
          terminalAccess: true,
          languages: ['typescript', 'javascript'],
          frameworks: ['jest', 'vitest'],
          domains: ['testing'],
          tools: ['git'],
          maxConcurrentTasks: 4,
          maxMemoryUsage: 1024,
          maxExecutionTime: 300000,
          reliability: 0.92,
          speed: 0.75,
          quality: 0.88,
        },
        metrics: {
          tasksCompleted: 12,
          tasksFailed: 0,
          averageExecutionTime: 4000,
          successRate: 1.0,
          cpuUsage: 20,
          memoryUsage: 256,
          diskUsage: 50,
          codeQuality: 0.9,
          testCoverage: 0.95,
          lastActivity: new Date(),
          responseTime: 180,
        },
        workload: 20,
        health: 95,
        lastHeartbeat: new Date(),
        errorHistory: [],
        taskHistory: [],
      },
    ],
    tasks: [
      {
        id: { id: 'task-1', swarmId: 'swarm-1', sequence: 1, priority: 1 },
        type: 'coding',
        name: 'Implement feature X',
        description: 'Add new feature to the system',
        priority: 'high',
        status: 'running',
        requirements: {
          capabilities: ['codeGeneration'],
          tools: ['git'],
          permissions: ['filesystem'],
        },
        constraints: {
          dependencies: [],
          maxRetries: 3,
          timeoutAfter: 300000,
        },
        input: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        attempts: 1,
        maxRetries: 3,
      },
      {
        id: { id: 'task-2', swarmId: 'swarm-1', sequence: 2, priority: 2 },
        type: 'testing',
        name: 'Write tests for feature X',
        description: 'Create comprehensive test suite',
        priority: 'normal',
        status: 'running',
        requirements: {
          capabilities: ['testing'],
          tools: ['jest'],
          permissions: ['filesystem'],
        },
        constraints: {
          dependencies: [],
          maxRetries: 2,
          timeoutAfter: 180000,
        },
        input: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        attempts: 1,
        maxRetries: 2,
      },
      {
        id: { id: 'task-3', swarmId: 'swarm-1', sequence: 3, priority: 3 },
        type: 'documentation',
        name: 'Document feature X',
        description: 'Create user documentation',
        priority: 'low',
        status: 'queued',
        requirements: {
          capabilities: ['documentation'],
          tools: [],
          permissions: ['filesystem'],
        },
        constraints: {
          dependencies: [],
          maxRetries: 2,
          timeoutAfter: 120000,
        },
        input: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        attempts: 0,
        maxRetries: 2,
      },
      {
        id: { id: 'task-4', swarmId: 'swarm-1', sequence: 4, priority: 4 },
        type: 'review',
        name: 'Code review',
        description: 'Review recent changes',
        priority: 'critical',
        status: 'completed',
        requirements: {
          capabilities: ['codeReview'],
          tools: ['git'],
          permissions: [],
        },
        constraints: {
          dependencies: [],
          maxRetries: 1,
          timeoutAfter: 60000,
        },
        input: {},
        output: { approved: true },
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
        attempts: 1,
        maxRetries: 1,
      },
    ],
    startTime: new Date('2024-01-01T00:00:00Z'),
    metrics: {
      throughput: 2.5,
      latency: 150,
      efficiency: 0.82,
      reliability: 0.92,
      averageQuality: 0.88,
      resourceUtilization: {},
      agentUtilization: 0.75,
      taskCompletionRate: 0.85,
      errorRate: 0.08,
    },
  },
};

const mockHealth = {
  success: true,
  health: {
    overall: 85,
    agents: {
      healthy: 4,
      unhealthy: 1,
      offline: 0,
    },
    tasks: {
      pending: 5,
      running: 3,
      completed: 20,
      failed: 2,
    },
    resources: {
      cpu: 45,
      memory: 60,
      disk: 35,
    },
    lastCheck: new Date(),
    issues: [],
  },
};

const mockMetrics = {
  success: true,
  metrics: {
    throughput: 2.5,
    latency: 150,
    efficiency: 0.82,
    reliability: 0.92,
    averageQuality: 0.88,
    resourceUtilization: {},
    agentUtilization: 0.75,
    taskCompletionRate: 0.85,
    errorRate: 0.08,
  },
};

const mockQueueStatus = {
  success: true,
  queue: {
    totalTasks: 8,
    pendingTasks: 5,
    processingTasks: 3,
    completedTasks: 20,
    failedTasks: 2,
  },
};

describe('SwarmView', () => {
  const mockRefetch = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock returns
    (trpc.swarm.listActive.useQuery as any).mockReturnValue({
      data: mockActiveSwarms,
      refetch: mockRefetch,
    });

    (trpc.swarm.getStatus.useQuery as any).mockReturnValue({
      data: mockSwarmStatus,
      refetch: mockRefetch,
    });

    (trpc.swarm.getHealth.useQuery as any).mockReturnValue({
      data: mockHealth,
    });

    (trpc.swarm.getMetrics.useQuery as any).mockReturnValue({
      data: mockMetrics,
    });

    (trpc.swarm.getQueueStatus.useQuery as any).mockReturnValue({
      data: mockQueueStatus,
    });

    (trpc.swarm.stop.useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    (trpc.swarm.start.useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with swarm data', () => {
      render(<SwarmView />);

      expect(screen.getByText('Swarm Coordination')).toBeInTheDocument();
      expect(
        screen.getByText('Monitor and control your multi-agent swarms in real-time')
      ).toBeInTheDocument();
    });

    it('should display no swarms message when no active swarms', () => {
      (trpc.swarm.listActive.useQuery as any).mockReturnValue({
        data: { success: true, swarms: [] },
        refetch: mockRefetch,
      });

      render(<SwarmView />);

      expect(screen.getByText('No Active Swarms')).toBeInTheDocument();
      expect(screen.getByText('Create a swarm to start coordinating agents')).toBeInTheDocument();
    });

    it('should render swarm overview card', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Test Swarm 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
      expect(screen.getByText('45.0%')).toBeInTheDocument();
    });

    it('should display all metric cards', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Active Agents')).toBeInTheDocument();
        expect(screen.getByText('Running Tasks')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });
  });

  describe('Agent Visualization', () => {
    it('should display all agents with correct status', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Coordinator Agent')).toBeInTheDocument();
        expect(screen.getByText('Coder Agent')).toBeInTheDocument();
        expect(screen.getByText('Tester Agent')).toBeInTheDocument();
      });
    });

    it('should show agent health metrics', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        const agentCards = screen.getAllByText(/Health:/);
        expect(agentCards.length).toBeGreaterThan(0);
      });
    });

    it('should display agent workload', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText(/Workload: 60%/)).toBeInTheDocument();
        expect(screen.getByText(/Workload: 75%/)).toBeInTheDocument();
        expect(screen.getByText(/Workload: 20%/)).toBeInTheDocument();
      });
    });

    it('should show active badge for agents with current task', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        const activeBadges = screen.getAllByText('Active');
        expect(activeBadges.length).toBe(2); // Two agents have currentTask
      });
    });
  });

  describe('Task Queue', () => {
    it('should display all tasks', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Implement feature X')).toBeInTheDocument();
        expect(screen.getByText('Write tests for feature X')).toBeInTheDocument();
        expect(screen.getByText('Document feature X')).toBeInTheDocument();
        expect(screen.getByText('Code review')).toBeInTheDocument();
      });
    });

    it('should show priority badges for tasks', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('critical (1)')).toBeInTheDocument();
        expect(screen.getByText('high (1)')).toBeInTheDocument();
        expect(screen.getByText('normal (1)')).toBeInTheDocument();
        expect(screen.getByText('low (1)')).toBeInTheDocument();
      });
    });

    it('should display task status correctly', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/running|queued|completed/i);
        expect(statusBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Health Monitoring', () => {
    it('should display system health metrics', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('System Health')).toBeInTheDocument();
        expect(screen.getByText('Overall Health')).toBeInTheDocument();
      });
    });

    it('should show healthy, unhealthy, and offline agent counts', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Healthy Agents')).toBeInTheDocument();
        expect(screen.getByText('Unhealthy Agents')).toBeInTheDocument();
        expect(screen.getByText('Offline Agents')).toBeInTheDocument();
      });
    });

    it('should display resource usage metrics', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should display throughput metric', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Throughput')).toBeInTheDocument();
        expect(screen.getByText('2.50 tasks/min')).toBeInTheDocument();
      });
    });

    it('should display latency metric', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Avg Latency')).toBeInTheDocument();
        expect(screen.getByText('150ms')).toBeInTheDocument();
      });
    });

    it('should display success rate', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('92.0%')).toBeInTheDocument(); // 1 - 0.08 error rate
      });
    });

    it('should display efficiency and utilization', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Efficiency')).toBeInTheDocument();
        expect(screen.getByText('82.0%')).toBeInTheDocument();
        expect(screen.getByText('Agent Utilization')).toBeInTheDocument();
        expect(screen.getByText('75.0%')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should allow stopping a swarm', async () => {
      const user = userEvent.setup();
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Stop Swarm')).toBeInTheDocument();
      });

      const stopButton = screen.getByText('Stop Swarm');
      await user.click(stopButton);

      expect(mockMutate).toHaveBeenCalledWith({
        swarmId: 'swarm-1',
        reason: 'User requested stop',
      });
    });

    it('should allow starting a paused swarm', async () => {
      const user = userEvent.setup();

      // Mock a non-executing swarm
      (trpc.swarm.getStatus.useQuery as any).mockReturnValue({
        data: {
          ...mockSwarmStatus,
          swarm: {
            ...mockSwarmStatus.swarm,
            status: 'planning',
          },
        },
        refetch: mockRefetch,
      });

      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Start Swarm')).toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Swarm');
      await user.click(startButton);

      expect(mockMutate).toHaveBeenCalledWith({ swarmId: 'swarm-1' });
    });

    it('should allow pausing and resuming monitoring', async () => {
      const user = userEvent.setup();
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Pause Monitoring')).toBeInTheDocument();
      });

      const pauseButton = screen.getByText('Pause Monitoring');
      await user.click(pauseButton);

      expect(screen.getByText('Resume Monitoring')).toBeInTheDocument();

      const resumeButton = screen.getByText('Resume Monitoring');
      await user.click(resumeButton);

      expect(screen.getByText('Pause Monitoring')).toBeInTheDocument();
    });

    it('should allow refreshing data', async () => {
      const user = userEvent.setup();
      render(<SwarmView />);

      const refreshButton = screen.getByLabelText('Refresh data');
      await user.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should switch between swarms when multiple exist', async () => {
      const user = userEvent.setup();
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Test Swarm 1')).toBeInTheDocument();
        expect(screen.getByText('Test Swarm 2')).toBeInTheDocument();
      });

      const swarm2Button = screen.getByRole('button', { name: /Test Swarm 2/ });
      await user.click(swarm2Button);

      // Should trigger status query with new swarm ID
      expect(trpc.swarm.getStatus.useQuery).toHaveBeenCalledWith(
        { swarmId: 'swarm-2' },
        expect.any(Object)
      );
    });
  });

  describe('Auto-refresh', () => {
    it('should enable auto-refresh by default', () => {
      render(<SwarmView />);

      expect(trpc.swarm.listActive.useQuery).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ refetchInterval: 2000 })
      );
    });

    it('should disable auto-refresh when autoRefresh is false', () => {
      render(<SwarmView autoRefresh={false} />);

      expect(trpc.swarm.listActive.useQuery).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ refetchInterval: false })
      );
    });

    it('should use custom refresh interval', () => {
      render(<SwarmView refreshInterval={5000} />);

      expect(trpc.swarm.listActive.useQuery).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ refetchInterval: 5000 })
      );
    });

    it('should pause auto-refresh when monitoring is paused', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Pause Monitoring')).toBeInTheDocument();
      });

      const pauseButton = screen.getByText('Pause Monitoring');
      await user.click(pauseButton);

      // Force re-render to check updated query options
      rerender(<SwarmView />);

      // The last call should have refetchInterval: false due to pause
      const calls = (trpc.swarm.getStatus.useQuery as any).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1].refetchInterval).toBe(false);
    });
  });

  describe('Queue Status', () => {
    it('should display queue status when available', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Queue Status')).toBeInTheDocument();
        expect(screen.getByText('Total in Queue')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Processing')).toBeInTheDocument();
      });
    });
  });

  describe('Communication Flow', () => {
    it('should display communication flow visualization', async () => {
      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('Communication Flow')).toBeInTheDocument();
        expect(screen.getByText('Queen to Worker')).toBeInTheDocument();
        expect(screen.getByText('Worker to Queen')).toBeInTheDocument();
        expect(screen.getByText('Worker to Worker')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle no agents gracefully', async () => {
      (trpc.swarm.getStatus.useQuery as any).mockReturnValue({
        data: {
          ...mockSwarmStatus,
          swarm: {
            ...mockSwarmStatus.swarm,
            agents: [],
          },
        },
        refetch: mockRefetch,
      });

      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('No agents spawned yet')).toBeInTheDocument();
      });
    });

    it('should handle no tasks gracefully', async () => {
      (trpc.swarm.getStatus.useQuery as any).mockReturnValue({
        data: {
          ...mockSwarmStatus,
          swarm: {
            ...mockSwarmStatus.swarm,
            tasks: [],
          },
        },
        refetch: mockRefetch,
      });

      render(<SwarmView />);

      await waitFor(() => {
        expect(screen.getByText('No tasks in queue')).toBeInTheDocument();
      });
    });

    it('should handle loading state', () => {
      (trpc.swarm.stop.useMutation as any).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<SwarmView />);

      const stopButton = screen.getByText('Stopping...');
      expect(stopButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SwarmView />);

      expect(screen.getByLabelText('Refresh data')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<SwarmView />);

      const heading = screen.getByRole('heading', { name: 'Swarm Coordination' });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should use provided swarmId', () => {
      render(<SwarmView swarmId="custom-swarm-id" />);

      expect(trpc.swarm.getStatus.useQuery).toHaveBeenCalledWith(
        { swarmId: 'custom-swarm-id' },
        expect.any(Object)
      );
    });

    it('should apply custom className', () => {
      const { container } = render(<SwarmView className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
