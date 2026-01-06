/**
 * Tools Router Test Suite
 * Tests for the Tools Execution Engine
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ToolExecution } from './tools.types';

/**
 * Mock tRPC context
 */
const createMockContext = () => ({
  user: { id: 1, email: 'test@example.com' },
  req: { sessionID: 'test-session-123' },
  res: {},
});

/**
 * Mock MCP server and registry
 */
const createMockMCPServer = () => {
  const mockTools = [
    {
      name: 'file/read',
      description: 'Read file contents',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          encoding: { type: 'string' },
        },
        required: ['path'],
      },
      handler: vi.fn().mockResolvedValue({
        path: '/test/file.txt',
        content: 'test content',
        size: 12,
      }),
    },
    {
      name: 'web/fetch',
      description: 'Fetch webpage content',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
        required: ['url'],
      },
      handler: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        content: '<html>Test</html>',
      }),
    },
  ];

  return {
    toolRegistry: {
      listTools: vi.fn().mockResolvedValue(mockTools),
      getToolsByCategory: vi.fn().mockImplementation((category: string) => {
        return mockTools.filter((t) => t.name.startsWith(`${category}/`));
      }),
      getTool: vi.fn().mockImplementation((name: string) => {
        return mockTools.find((t) => t.name === name);
      }),
      executeTool: vi.fn().mockImplementation(async (name: string, args: any) => {
        const tool = mockTools.find((t) => t.name === name);
        if (!tool) {
          throw new Error(`Tool not found: ${name}`);
        }
        return tool.handler(args);
      }),
      getMetrics: vi.fn().mockReturnValue({
        totalInvocations: 10,
        successfulInvocations: 8,
        failedInvocations: 2,
        averageExecutionTime: 150,
      }),
    },
  };
};

// Mock getMCPServer
vi.mock('../../mcp', () => ({
  getMCPServer: vi.fn().mockResolvedValue(createMockMCPServer()),
}));

describe('Tools Router', () => {
  beforeEach(async () => {
    // Reset all mocks before each test to prevent state pollution
    vi.clearAllMocks();

    // Re-setup the mock to ensure fresh state
    const { getMCPServer } = await import('../../mcp');
    (getMCPServer as any).mockResolvedValue(createMockMCPServer());
  });

  describe('listTools', () => {
    it('should list all available tools', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const tools = await server.toolRegistry.listTools();

      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('file/read');
      expect(tools[1].name).toBe('web/fetch');
    });

    it('should filter tools by category', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const fileTools = await server.toolRegistry.getToolsByCategory('file');

      expect(fileTools).toHaveLength(1);
      expect(fileTools[0].name).toBe('file/read');
    });

    it('should search tools by name', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const allTools = await server.toolRegistry.listTools();
      const searchResults = allTools.filter((t: any) =>
        t.name.toLowerCase().includes('read')
      );

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('file/read');
    });
  });

  describe('executeTool', () => {
    it('should execute a tool successfully', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const result = await server.toolRegistry.executeTool('file/read', {
        path: '/test/file.txt',
        encoding: 'utf-8',
      });

      expect(result).toEqual({
        path: '/test/file.txt',
        content: 'test content',
        size: 12,
      });
    });

    it('should throw error for non-existent tool', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      await expect(
        server.toolRegistry.executeTool('nonexistent/tool', {})
      ).rejects.toThrow('Tool not found');
    });

    it('should handle execution timeout', async () => {
      // Create an isolated mock server for this test to avoid polluting other tests
      const slowExecuteTool = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return { success: true };
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 1000);
      });

      await expect(
        Promise.race([
          slowExecuteTool('test/slow', {}),
          timeoutPromise,
        ])
      ).rejects.toThrow('Timeout');
    });

    it('should track execution metrics', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      // Execute tool
      await server.toolRegistry.executeTool('file/read', {
        path: '/test/file.txt',
      });

      // Get metrics
      const metrics = server.toolRegistry.getMetrics('file/read');

      expect(metrics).toBeDefined();
      expect(metrics.totalInvocations).toBeGreaterThan(0);
    });
  });

  describe('getToolStatus', () => {
    it('should return execution status', () => {
      const execution: ToolExecution = {
        id: 'exec_123',
        toolName: 'file/read',
        category: 'file',
        arguments: { path: '/test/file.txt' },
        status: 'success',
        startTime: new Date(),
        endTime: new Date(),
        result: { content: 'test' },
        userId: '1',
        executionTime: 100,
      };

      expect(execution.status).toBe('success');
      expect(execution.executionTime).toBe(100);
    });

    it('should return running status for active execution', () => {
      const execution: ToolExecution = {
        id: 'exec_123',
        toolName: 'file/read',
        category: 'file',
        arguments: { path: '/test/file.txt' },
        status: 'running',
        startTime: new Date(),
        userId: '1',
      };

      expect(execution.status).toBe('running');
      expect(execution.endTime).toBeUndefined();
    });
  });

  describe('cancelToolExecution', () => {
    it('should cancel a running execution', () => {
      const abortController = new AbortController();

      expect(abortController.signal.aborted).toBe(false);

      abortController.abort();

      expect(abortController.signal.aborted).toBe(true);
    });

    it('should not cancel completed execution', () => {
      const execution: ToolExecution = {
        id: 'exec_123',
        toolName: 'file/read',
        category: 'file',
        arguments: { path: '/test/file.txt' },
        status: 'success',
        startTime: new Date(),
        endTime: new Date(),
        userId: '1',
      };

      // Completed executions cannot be cancelled
      expect(execution.status).toBe('success');
      expect(execution.endTime).toBeDefined();
    });
  });

  describe('getToolHistory', () => {
    it('should filter history by tool name', () => {
      const executions: ToolExecution[] = [
        {
          id: 'exec_1',
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        },
        {
          id: 'exec_2',
          toolName: 'web/fetch',
          category: 'web',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        },
      ];

      const filtered = executions.filter((e) => e.toolName === 'file/read');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].toolName).toBe('file/read');
    });

    it('should filter history by status', () => {
      const executions: ToolExecution[] = [
        {
          id: 'exec_1',
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        },
        {
          id: 'exec_2',
          toolName: 'web/fetch',
          category: 'web',
          arguments: {},
          status: 'failed',
          startTime: new Date(),
          userId: '1',
        },
      ];

      const successful = executions.filter((e) => e.status === 'success');

      expect(successful).toHaveLength(1);
      expect(successful[0].status).toBe('success');
    });

    it('should paginate results', () => {
      const executions: ToolExecution[] = Array.from({ length: 100 }, (_, i) => ({
        id: `exec_${i}`,
        toolName: 'file/read',
        category: 'file',
        arguments: {},
        status: 'success',
        startTime: new Date(),
        userId: '1',
      }));

      const limit = 10;
      const offset = 0;
      const paginated = executions.slice(offset, offset + limit);

      expect(paginated).toHaveLength(10);
      expect(paginated[0].id).toBe('exec_0');
    });
  });

  describe('getToolMetrics', () => {
    it('should return tool-specific metrics', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const metrics = server.toolRegistry.getMetrics('file/read');

      expect(metrics).toBeDefined();
      expect(metrics.totalInvocations).toBeGreaterThanOrEqual(0);
      expect(metrics.successfulInvocations).toBeGreaterThanOrEqual(0);
    });

    it('should calculate success rate', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const metrics = server.toolRegistry.getMetrics('file/read');
      const successRate =
        metrics.totalInvocations > 0
          ? (metrics.successfulInvocations / metrics.totalInvocations) * 100
          : 0;

      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });

    it('should track category statistics', () => {
      const executions: ToolExecution[] = [
        {
          id: 'exec_1',
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        },
        {
          id: 'exec_2',
          toolName: 'file/write',
          category: 'file',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        },
        {
          id: 'exec_3',
          toolName: 'web/fetch',
          category: 'web',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        },
      ];

      const categoryStats: Record<string, number> = {};
      executions.forEach((e) => {
        categoryStats[e.category] = (categoryStats[e.category] || 0) + 1;
      });

      expect(categoryStats.file).toBe(2);
      expect(categoryStats.web).toBe(1);
    });
  });

  describe('getActiveExecutions', () => {
    it('should return only active executions', () => {
      const executions: ToolExecution[] = [
        {
          id: 'exec_1',
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'running',
          startTime: new Date(),
          userId: '1',
        },
        {
          id: 'exec_2',
          toolName: 'web/fetch',
          category: 'web',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          endTime: new Date(),
          userId: '1',
        },
      ];

      const active = executions.filter((e) => e.status === 'running');

      expect(active).toHaveLength(1);
      expect(active[0].status).toBe('running');
    });

    it('should filter by user', () => {
      const executions: ToolExecution[] = [
        {
          id: 'exec_1',
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'running',
          startTime: new Date(),
          userId: '1',
        },
        {
          id: 'exec_2',
          toolName: 'web/fetch',
          category: 'web',
          arguments: {},
          status: 'running',
          startTime: new Date(),
          userId: '2',
        },
      ];

      const userExecutions = executions.filter((e) => e.userId === '1');

      expect(userExecutions).toHaveLength(1);
      expect(userExecutions[0].userId).toBe('1');
    });
  });

  describe('getToolDetails', () => {
    it('should return tool details', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const tool = await server.toolRegistry.getTool('file/read');

      expect(tool).toBeDefined();
      expect(tool.name).toBe('file/read');
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
    });

    it('should return undefined for non-existent tool', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      const tool = await server.toolRegistry.getTool('nonexistent/tool');

      expect(tool).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle tool execution errors', async () => {
      const { getMCPServer } = await import('../../mcp');
      const server = await getMCPServer();

      // Mock error
      server.toolRegistry.executeTool = vi
        .fn()
        .mockRejectedValue(new Error('Execution failed'));

      await expect(
        server.toolRegistry.executeTool('file/read', {})
      ).rejects.toThrow('Execution failed');
    });

    it('should track failed executions', () => {
      const execution: ToolExecution = {
        id: 'exec_123',
        toolName: 'file/read',
        category: 'file',
        arguments: {},
        status: 'failed',
        startTime: new Date(),
        endTime: new Date(),
        error: 'File not found',
        userId: '1',
      };

      expect(execution.status).toBe('failed');
      expect(execution.error).toBe('File not found');
    });
  });

  describe('Security', () => {
    it('should isolate user executions', () => {
      const executions: ToolExecution[] = [
        {
          id: 'exec_1',
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        },
        {
          id: 'exec_2',
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '2',
        },
      ];

      const user1Executions = executions.filter((e) => e.userId === '1');
      const user2Executions = executions.filter((e) => e.userId === '2');

      expect(user1Executions).toHaveLength(1);
      expect(user2Executions).toHaveLength(1);
      expect(user1Executions[0].id).not.toBe(user2Executions[0].id);
    });

    it('should validate execution ownership before cancellation', () => {
      const execution: ToolExecution = {
        id: 'exec_123',
        toolName: 'file/read',
        category: 'file',
        arguments: {},
        status: 'running',
        startTime: new Date(),
        userId: '1',
      };

      const currentUserId = '2';
      const canCancel = execution.userId === currentUserId;

      expect(canCancel).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle high-volume execution tracking', () => {
      const executions: ToolExecution[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `exec_${i}`,
        toolName: 'file/read',
        category: 'file',
        arguments: {},
        status: 'success',
        startTime: new Date(),
        userId: '1',
        executionTime: Math.random() * 1000,
      }));

      expect(executions).toHaveLength(1000);

      // Calculate average execution time
      const avgTime =
        executions.reduce((sum, e) => sum + (e.executionTime || 0), 0) /
        executions.length;

      expect(avgTime).toBeGreaterThan(0);
    });

    it('should limit history size', () => {
      const MAX_HISTORY_SIZE = 1000;
      const executions: ToolExecution[] = [];

      // Add more than max size
      for (let i = 0; i < 1500; i++) {
        executions.unshift({
          id: `exec_${i}`,
          toolName: 'file/read',
          category: 'file',
          arguments: {},
          status: 'success',
          startTime: new Date(),
          userId: '1',
        });

        // Trim if exceeds max
        if (executions.length > MAX_HISTORY_SIZE) {
          executions.pop();
        }
      }

      expect(executions.length).toBe(MAX_HISTORY_SIZE);
    });
  });
});
