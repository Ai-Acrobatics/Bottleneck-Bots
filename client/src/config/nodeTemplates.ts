import type { NodeTemplate, WorkflowNodeType } from '@/types/workflow';

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Navigation nodes
  {
    type: 'navigate',
    label: 'Navigate',
    description: 'Navigate to a URL',
    icon: 'Compass',
    category: 'navigation',
    defaultData: {
      type: 'navigate',
      label: 'Navigate',
      url: '',
      waitForLoad: true,
      timeout: 30000,
      enabled: true,
    },
  },
  {
    type: 'scroll',
    label: 'Scroll',
    description: 'Scroll the page or to an element',
    icon: 'ArrowDown',
    category: 'navigation',
    defaultData: {
      type: 'scroll',
      label: 'Scroll',
      scrollType: 'bottom',
      enabled: true,
    },
  },

  // Interaction nodes
  {
    type: 'click',
    label: 'Click',
    description: 'Click on an element',
    icon: 'MousePointer2',
    category: 'interaction',
    defaultData: {
      type: 'click',
      label: 'Click',
      selector: '',
      clickCount: 1,
      waitForNavigation: false,
      enabled: true,
    },
  },
  {
    type: 'input',
    label: 'Input',
    description: 'Fill in form fields',
    icon: 'Keyboard',
    category: 'interaction',
    defaultData: {
      type: 'input',
      label: 'Input',
      selector: '',
      inputType: 'text',
      value: '',
      clearFirst: true,
      enabled: true,
    },
  },

  // Data nodes
  {
    type: 'extract',
    label: 'Extract',
    description: 'Extract data from the page',
    icon: 'Database',
    category: 'data',
    defaultData: {
      type: 'extract',
      label: 'Extract',
      selector: '',
      extractType: 'text',
      variableName: 'extractedData',
      multiple: false,
      enabled: true,
    },
  },
  {
    type: 'screenshot',
    label: 'Screenshot',
    description: 'Capture screenshot',
    icon: 'Camera',
    category: 'data',
    defaultData: {
      type: 'screenshot',
      label: 'Screenshot',
      fullPage: false,
      enabled: true,
    },
  },
  {
    type: 'api_call',
    label: 'API Call',
    description: 'Make HTTP request',
    icon: 'Webhook',
    category: 'data',
    defaultData: {
      type: 'api_call',
      label: 'API Call',
      url: '',
      method: 'GET',
      variableName: 'apiResponse',
      enabled: true,
    },
  },

  // Control flow nodes
  {
    type: 'wait',
    label: 'Wait',
    description: 'Wait for element or time',
    icon: 'Clock',
    category: 'control',
    defaultData: {
      type: 'wait',
      label: 'Wait',
      waitCondition: 'time',
      duration: 1000,
      timeout: 30000,
      enabled: true,
    },
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'If/then/else logic',
    icon: 'GitBranch',
    category: 'control',
    defaultData: {
      type: 'condition',
      label: 'Condition',
      variable: '',
      operator: 'equals',
      value: '',
      enabled: true,
    },
  },
  {
    type: 'loop',
    label: 'Loop',
    description: 'Repeat actions',
    icon: 'Repeat',
    category: 'control',
    defaultData: {
      type: 'loop',
      label: 'Loop',
      loopType: 'count',
      iterations: 1,
      maxIterations: 100,
      enabled: true,
    },
  },

  // Utility nodes
  {
    type: 'variable',
    label: 'Variable',
    description: 'Set a variable value',
    icon: 'Variable',
    category: 'utility',
    defaultData: {
      type: 'variable',
      label: 'Variable',
      variableName: '',
      value: '',
      valueType: 'string',
      enabled: true,
    },
  },
  {
    type: 'transform',
    label: 'Transform',
    description: 'Transform data',
    icon: 'Wand2',
    category: 'utility',
    defaultData: {
      type: 'transform',
      label: 'Transform',
      inputVariable: '',
      outputVariable: '',
      transformType: 'map',
      enabled: true,
    },
  },
];

export const getNodeTemplate = (type: WorkflowNodeType): NodeTemplate | undefined => {
  return NODE_TEMPLATES.find((template) => template.type === type);
};

export const getNodesByCategory = (category: NodeTemplate['category']): NodeTemplate[] => {
  return NODE_TEMPLATES.filter((template) => template.category === category);
};

export const NODE_CATEGORIES = [
  { id: 'navigation', label: 'Navigation', icon: 'Compass' },
  { id: 'interaction', label: 'Interaction', icon: 'Hand' },
  { id: 'data', label: 'Data', icon: 'Database' },
  { id: 'control', label: 'Control Flow', icon: 'GitBranch' },
  { id: 'utility', label: 'Utility', icon: 'Wrench' },
] as const;
