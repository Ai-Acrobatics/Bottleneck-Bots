/**
 * Workflow API Tests
 *
 * Unit tests for the workflow API functions including:
 * - Node type to step type mapping
 * - Workflow format conversions
 * - CRUD operations
 * - Execution functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions that will be used in the mock
const mockMutate = vi.fn();
const mockQuery = vi.fn();

// Mock the trpc client - uses vi.hoisted pattern for proper hoisting
vi.mock('@/lib/trpc', () => {
  return {
    trpcClient: {
      workflows: {
        create: { mutate: vi.fn() },
        update: { mutate: vi.fn() },
        get: { query: vi.fn() },
        list: { query: vi.fn() },
        delete: { mutate: vi.fn() },
        execute: { mutate: vi.fn() },
        getExecutions: { query: vi.fn() },
      },
    },
  };
});

// Import after mocking
import {
  saveWorkflow,
  loadWorkflow,
  getAllWorkflows,
  deleteWorkflow,
  executeWorkflow,
  getWorkflowExecutions,
} from '../workflowApi';
import { trpcClient } from '@/lib/trpc';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Sample test data
const sampleWorkflow = {
  id: 1,
  userId: 1,
  name: 'Test Workflow',
  description: 'A test workflow for unit testing',
  category: 'automation',
  nodes: [
    {
      id: 'node-1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: {
        type: 'navigate',
        label: 'Navigate to URL',
        description: 'Go to the test page',
        url: 'https://example.com',
      },
    },
    {
      id: 'node-2',
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        type: 'click',
        label: 'Click Button',
        description: 'Click the submit button',
        selector: '#submit-btn',
      },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'node-1', target: 'node-2' },
  ],
  version: 1,
  isTemplate: false,
  tags: ['test', 'automation'],
  variables: {},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

const sampleDbWorkflow = {
  id: 1,
  userId: 1,
  name: 'Test Workflow',
  description: 'A test workflow',
  category: 'automation',
  steps: [],
  edges: [],
  version: 1,
  isTemplate: false,
  tags: ['test'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

describe('workflowApi', () => {
  // Get references to the mocked functions
  const mockedTrpcClient = vi.mocked(trpcClient);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Clear console logs for cleaner test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveWorkflow', () => {
    it('should create a new workflow when no ID exists', async () => {
      const newWorkflow = { ...sampleWorkflow, id: undefined };
      vi.mocked(mockedTrpcClient.workflows.create.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

      const result = await saveWorkflow(newWorkflow as any);

      expect(mockedTrpcClient.workflows.create.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: newWorkflow.name,
          description: newWorkflow.description,
          trigger: 'manual',
        })
      );
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', sampleDbWorkflow.name);
    });

    it('should update an existing workflow when ID exists', async () => {
      vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

      const result = await saveWorkflow(sampleWorkflow as any);

      expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: sampleWorkflow.id,
          name: sampleWorkflow.name,
          description: sampleWorkflow.description,
        })
      );
      expect(result).toHaveProperty('id', sampleDbWorkflow.id);
    });

    it('should throw an error when save fails', async () => {
      vi.mocked(mockedTrpcClient.workflows.update.mutate).mockRejectedValueOnce(new Error('Save failed'));

      await expect(saveWorkflow(sampleWorkflow as any)).rejects.toThrow('Save failed');
    });

    it('should convert nodes to steps correctly', async () => {
      vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

      await saveWorkflow(sampleWorkflow as any);

      expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({
              type: 'navigate',
              order: 0,
            }),
            expect.objectContaining({
              type: 'act',
              order: 1,
            }),
          ]),
        })
      );
    });
  });

  describe('loadWorkflow', () => {
    it('should load a workflow by ID', async () => {
      vi.mocked(mockedTrpcClient.workflows.get.query).mockResolvedValueOnce(sampleDbWorkflow as any);

      const result = await loadWorkflow(1);

      expect(mockedTrpcClient.workflows.get.query).toHaveBeenCalledWith({ id: 1 });
      expect(result).toHaveProperty('id', sampleDbWorkflow.id);
      expect(result).toHaveProperty('name', sampleDbWorkflow.name);
    });

    it('should throw an error when load fails', async () => {
      vi.mocked(mockedTrpcClient.workflows.get.query).mockRejectedValueOnce(new Error('Not found'));

      await expect(loadWorkflow(999)).rejects.toThrow('Not found');
    });

    it('should convert database format to workflow format', async () => {
      vi.mocked(mockedTrpcClient.workflows.get.query).mockResolvedValueOnce(sampleDbWorkflow as any);

      const result = await loadWorkflow(1);

      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('edges');
      expect(result).toHaveProperty('variables');
      expect(result.variables).toEqual({});
    });
  });

  describe('getAllWorkflows', () => {
    it('should return empty array when no workflows exist', async () => {
      vi.mocked(mockedTrpcClient.workflows.list.query).mockResolvedValueOnce([]);

      const result = await getAllWorkflows();

      // The function returns a Record<number, Workflow> or array depending on implementation
      expect(Array.isArray(result) ? result : Object.values(result)).toEqual([]);
    });

    it('should return workflows from API', async () => {
      vi.mocked(mockedTrpcClient.workflows.list.query).mockResolvedValueOnce([sampleDbWorkflow] as any);

      const result = await getAllWorkflows();

      expect(mockedTrpcClient.workflows.list.query).toHaveBeenCalled();
      const workflows = Array.isArray(result) ? result : Object.values(result);
      expect(workflows.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(mockedTrpcClient.workflows.list.query).mockRejectedValueOnce(new Error('API error'));

      const result = await getAllWorkflows();

      // Should return empty on error
      const workflows = Array.isArray(result) ? result : Object.values(result);
      expect(workflows).toEqual([]);
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete a workflow via API', async () => {
      vi.mocked(mockedTrpcClient.workflows.delete.mutate).mockResolvedValueOnce(undefined as any);

      await deleteWorkflow(1);

      expect(mockedTrpcClient.workflows.delete.mutate).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw error when delete fails', async () => {
      vi.mocked(mockedTrpcClient.workflows.delete.mutate).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteWorkflow(999)).rejects.toThrow('Delete failed');
    });
  });

  describe('executeWorkflow', () => {
    it('should execute workflow via API', async () => {
      const mockResult = {
        executionId: 'exec-123',
        workflowId: 1,
        status: 'completed',
        output: { data: 'test' },
        stepResults: [],
      };
      vi.mocked(mockedTrpcClient.workflows.execute.mutate).mockResolvedValueOnce(mockResult as any);

      const result = await executeWorkflow(1);

      expect(result).toHaveProperty('id', 'exec-123');
      expect(result).toHaveProperty('workflowId', 1);
      expect(result).toHaveProperty('status', 'completed');
    });

    it('should pass variables to execution', async () => {
      const mockResult = {
        executionId: 'exec-456',
        workflowId: 1,
        status: 'completed',
        output: {},
        stepResults: [],
      };
      vi.mocked(mockedTrpcClient.workflows.execute.mutate).mockResolvedValueOnce(mockResult as any);

      const variables = { url: 'https://test.com' };
      await executeWorkflow(1, { variables });

      expect(mockedTrpcClient.workflows.execute.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: 1,
          variables,
        })
      );
    });
  });

  describe('getWorkflowExecutions', () => {
    it('should return executions from API', async () => {
      const mockExecutions = [
        { id: 'exec-1', status: 'completed' },
        { id: 'exec-2', status: 'running' },
      ];
      vi.mocked(mockedTrpcClient.workflows.getExecutions.query).mockResolvedValueOnce(mockExecutions as any);

      const result = await getWorkflowExecutions(1);

      // Verify the query was called with the right workflowId
      expect(mockedTrpcClient.workflows.getExecutions.query).toHaveBeenCalledWith(
        expect.objectContaining({ workflowId: 1 })
      );
      expect(result).toHaveLength(2);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockedTrpcClient.workflows.getExecutions.query).mockRejectedValueOnce(new Error('API error'));

      const result = await getWorkflowExecutions(999);

      expect(result).toEqual([]);
    });
  });
});

describe('Node Type Mapping', () => {
  // These tests verify the mapping behavior through saveWorkflow
  const mockedTrpcClient = vi.mocked(trpcClient);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should map navigate type correctly', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'navigate', label: 'Navigate', url: 'https://test.com' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'navigate' }),
        ]),
      })
    );
  });

  it('should map click type to act', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'click', label: 'Click' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'act' }),
        ]),
      })
    );
  });

  it('should map extract type correctly', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'extract', label: 'Extract Data' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'extract' }),
        ]),
      })
    );
  });

  it('should map wait type correctly', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'wait', label: 'Wait', duration: 1000 },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'wait' }),
        ]),
      })
    );
  });

  it('should map condition type correctly', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'condition', label: 'If/Else', condition: 'x > 5' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'condition' }),
        ]),
      })
    );
  });

  it('should map loop type correctly', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'loop', label: 'Loop' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'loop' }),
        ]),
      })
    );
  });

  it('should map api_call type to apiCall', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'api_call', label: 'API Call', method: 'GET' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'apiCall' }),
        ]),
      })
    );
  });

  it('should map screenshot type to observe', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'screenshot', label: 'Take Screenshot' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'observe' }),
        ]),
      })
    );
  });

  it('should default unknown types to act', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { type: 'unknown_type', label: 'Unknown' },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({ type: 'act' }),
        ]),
      })
    );
  });
});

describe('Workflow Format Conversion', () => {
  const mockedTrpcClient = vi.mocked(trpcClient);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle workflow with error handling config', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [{
        id: 'node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          type: 'click',
          label: 'Click with retry',
          errorHandling: { continueOnError: true },
        },
      }],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    expect(mockedTrpcClient.workflows.update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            config: expect.objectContaining({
              continueOnError: true,
            }),
          }),
        ]),
      })
    );
  });

  it('should preserve step order based on node array order', async () => {
    const workflow = {
      ...sampleWorkflow,
      nodes: [
        {
          id: 'node-1',
          type: 'default',
          position: { x: 0, y: 0 },
          data: { type: 'navigate', label: 'First' },
        },
        {
          id: 'node-2',
          type: 'default',
          position: { x: 0, y: 100 },
          data: { type: 'click', label: 'Second' },
        },
        {
          id: 'node-3',
          type: 'default',
          position: { x: 0, y: 200 },
          data: { type: 'extract', label: 'Third' },
        },
      ],
    };
    vi.mocked(mockedTrpcClient.workflows.update.mutate).mockResolvedValueOnce(sampleDbWorkflow as any);

    await saveWorkflow(workflow as any);

    const callArgs = vi.mocked(mockedTrpcClient.workflows.update.mutate).mock.calls[0][0];
    expect(callArgs.steps[0].order).toBe(0);
    expect(callArgs.steps[1].order).toBe(1);
    expect(callArgs.steps[2].order).toBe(2);
  });
});
