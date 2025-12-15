import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { nanoid } from 'nanoid';
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  WorkflowNodeType,
} from '@/types/workflow';

interface WorkflowHistory {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowStore {
  // Current workflow state
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  workflow: Workflow | null;

  // History for undo/redo
  history: WorkflowHistory[];
  historyIndex: number;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;

  // Node and edge operations
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;

  // Workflow operations
  createWorkflow: (name: string, description?: string) => void;
  loadWorkflow: (workflow: Workflow) => void;
  saveWorkflow: () => Promise<void>;
  clearWorkflow: () => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;

  // Utility
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

const createDefaultNodeData = (type: WorkflowNodeType): Partial<WorkflowNodeData> => {
  const base = {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    enabled: true,
    errorHandling: {
      continueOnError: false,
      retryCount: 0,
    },
  };

  switch (type) {
    case 'navigate':
      return { ...base, type, url: 'https://example.com', waitForLoad: true, timeout: 30000 };
    case 'click':
      return { ...base, type, selector: '', clickCount: 1, waitForNavigation: false };
    case 'extract':
      return { ...base, type, selector: '', extractType: 'text', variableName: 'extractedData', multiple: false };
    case 'wait':
      return { ...base, type, waitCondition: 'time', duration: 1000, timeout: 30000 };
    case 'condition':
      return { ...base, type, variable: '', operator: 'equals', value: '' };
    case 'loop':
      return { ...base, type, loopType: 'count', iterations: 1, maxIterations: 100 };
    case 'input':
      return { ...base, type, selector: '', inputType: 'text', value: '', clearFirst: true };
    case 'scroll':
      return { ...base, type, scrollType: 'bottom' };
    case 'screenshot':
      return { ...base, type, fullPage: false };
    case 'api_call':
      return { ...base, type, url: '', method: 'GET', variableName: 'apiResponse' };
    case 'variable':
      return { ...base, type, variableName: '', value: '', valueType: 'string' };
    case 'transform':
      return { ...base, type, inputVariable: '', outputVariable: '', transformType: 'map' };
    default:
      return base as any;
  }
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNode: null,
  workflow: null,
  history: [],
  historyIndex: -1,
  isLoading: false,
  isSaving: false,
  isDirty: false,

  // ReactFlow handlers
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
      isDirty: true,
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as WorkflowEdge[],
      isDirty: true,
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges) as WorkflowEdge[],
      isDirty: true,
    });
    get().addToHistory();
  },

  addNode: (type: WorkflowNodeType, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: nanoid(),
      type: 'default',
      position,
      data: createDefaultNodeData(type) as WorkflowNodeData,
    };

    set({
      nodes: [...get().nodes, newNode],
      isDirty: true,
    });
    get().addToHistory();
  },

  updateNode: (nodeId: string, data: Partial<WorkflowNodeData>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ) as WorkflowNode[],
      selectedNode: get().selectedNode?.id === nodeId
        ? { ...get().selectedNode!, data: { ...get().selectedNode!.data, ...data } } as WorkflowNode
        : get().selectedNode,
      isDirty: true,
    });
    get().addToHistory();
  },

  deleteNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true,
    });
    get().addToHistory();
  },

  duplicateNode: (nodeId: string) => {
    const nodeToDuplicate = get().nodes.find((node) => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode: WorkflowNode = {
      ...nodeToDuplicate,
      id: nanoid(),
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data.label} (Copy)`,
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      isDirty: true,
    });
    get().addToHistory();
  },

  selectNode: (nodeId: string | null) => {
    const node = nodeId ? get().nodes.find((n) => n.id === nodeId) || null : null;
    set({ selectedNode: node });
  },

  createWorkflow: (name: string, description?: string) => {
    const workflow: Workflow = {
      name,
      description,
      nodes: [],
      edges: [],
      version: 1,
      isTemplate: false,
      tags: [],
      variables: {},
    };

    set({
      workflow,
      nodes: [],
      edges: [],
      selectedNode: null,
      history: [],
      historyIndex: -1,
      isDirty: false,
    });
  },

  loadWorkflow: (workflow: Workflow) => {
    set({
      workflow,
      nodes: workflow.nodes,
      edges: workflow.edges,
      selectedNode: null,
      history: [],
      historyIndex: -1,
      isDirty: false,
    });
  },

  saveWorkflow: async () => {
    const state = get();
    if (!state.workflow) return;

    set({ isSaving: true });

    try {
      // Dynamically import to avoid circular dependencies
      const { saveWorkflow: saveWorkflowApi } = await import('@/lib/workflowApi');

      const updatedWorkflow: Workflow = {
        ...state.workflow,
        nodes: state.nodes,
        edges: state.edges,
        updatedAt: new Date(),
      };

      const savedWorkflow = await saveWorkflowApi(updatedWorkflow);

      set({
        workflow: savedWorkflow,
        isDirty: false,
      });

      console.log('Workflow saved:', savedWorkflow);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      workflow: null,
      history: [],
      historyIndex: -1,
      isDirty: false,
    });
  },

  exportWorkflow: () => {
    const state = get();
    const exportData: Workflow = {
      name: state.workflow?.name || 'Untitled Workflow',
      description: state.workflow?.description,
      nodes: state.nodes,
      edges: state.edges,
      version: state.workflow?.version || 1,
      tags: state.workflow?.tags,
      variables: state.workflow?.variables,
    };

    return JSON.stringify(exportData, null, 2);
  },

  importWorkflow: (json: string) => {
    try {
      const workflow: Workflow = JSON.parse(json);
      get().loadWorkflow(workflow);
    } catch (error) {
      console.error('Failed to import workflow:', error);
      throw new Error('Invalid workflow JSON');
    }
  },

  addToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();

    // Remove any history after current index
    const newHistory = history.slice(0, historyIndex + 1);

    // Add current state
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });

    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        nodes: JSON.parse(JSON.stringify(prevState.nodes)),
        edges: JSON.parse(JSON.stringify(prevState.edges)),
        historyIndex: historyIndex - 1,
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: JSON.parse(JSON.stringify(nextState.nodes)),
        edges: JSON.parse(JSON.stringify(nextState.edges)),
        historyIndex: historyIndex + 1,
        isDirty: true,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setSaving: (saving: boolean) => set({ isSaving: saving }),
}));
