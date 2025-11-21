import type { Workflow } from '@/types/workflow';

/**
 * Sample workflow templates for demonstration and testing
 */
export const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    name: 'LinkedIn Profile Scraper',
    description: 'Extract profile information from LinkedIn',
    category: 'data-extraction',
    version: 1,
    isTemplate: true,
    tags: ['linkedin', 'scraping', 'social-media'],
    nodes: [
      {
        id: '1',
        type: 'default',
        position: { x: 250, y: 50 },
        data: {
          type: 'navigate',
          label: 'Go to LinkedIn',
          url: 'https://www.linkedin.com/in/example-profile',
          waitForLoad: true,
          timeout: 30000,
          enabled: true,
        },
      },
      {
        id: '2',
        type: 'default',
        position: { x: 250, y: 180 },
        data: {
          type: 'wait',
          label: 'Wait for Page Load',
          waitCondition: 'element',
          selector: '.pv-top-card',
          timeout: 10000,
          enabled: true,
        },
      },
      {
        id: '3',
        type: 'default',
        position: { x: 250, y: 310 },
        data: {
          type: 'extract',
          label: 'Extract Profile Name',
          selector: 'h1.text-heading-xlarge',
          extractType: 'text',
          variableName: 'profileName',
          multiple: false,
          enabled: true,
        },
      },
      {
        id: '4',
        type: 'default',
        position: { x: 250, y: 440 },
        data: {
          type: 'extract',
          label: 'Extract Headline',
          selector: '.text-body-medium',
          extractType: 'text',
          variableName: 'headline',
          multiple: false,
          enabled: true,
        },
      },
      {
        id: '5',
        type: 'default',
        position: { x: 250, y: 570 },
        data: {
          type: 'screenshot',
          label: 'Take Screenshot',
          fullPage: false,
          filename: 'linkedin-profile.png',
          enabled: true,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
    variables: {},
  },

  {
    name: 'Product Price Monitor',
    description: 'Monitor product prices on e-commerce sites',
    category: 'monitoring',
    version: 1,
    isTemplate: true,
    tags: ['e-commerce', 'price-tracking', 'monitoring'],
    nodes: [
      {
        id: '1',
        type: 'default',
        position: { x: 250, y: 50 },
        data: {
          type: 'navigate',
          label: 'Go to Product Page',
          url: 'https://example.com/product',
          waitForLoad: true,
          timeout: 30000,
          enabled: true,
        },
      },
      {
        id: '2',
        type: 'default',
        position: { x: 250, y: 180 },
        data: {
          type: 'extract',
          label: 'Extract Price',
          selector: '.product-price',
          extractType: 'text',
          variableName: 'currentPrice',
          multiple: false,
          enabled: true,
        },
      },
      {
        id: '3',
        type: 'default',
        position: { x: 250, y: 310 },
        data: {
          type: 'condition',
          label: 'Check if Price Changed',
          variable: 'currentPrice',
          operator: 'not_equals',
          value: 'lastPrice',
          enabled: true,
        },
      },
      {
        id: '4',
        type: 'default',
        position: { x: 100, y: 440 },
        data: {
          type: 'api_call',
          label: 'Send Alert',
          url: 'https://api.example.com/alerts',
          method: 'POST',
          variableName: 'alertResponse',
          enabled: true,
        },
      },
      {
        id: '5',
        type: 'default',
        position: { x: 400, y: 440 },
        data: {
          type: 'variable',
          label: 'No Change',
          variableName: 'status',
          value: 'unchanged',
          valueType: 'string',
          enabled: true,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', animated: true },
      { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', animated: true },
    ],
    variables: {
      lastPrice: '$99.99',
    },
  },

  {
    name: 'Form Auto-Fill',
    description: 'Automatically fill and submit web forms',
    category: 'automation',
    version: 1,
    isTemplate: true,
    tags: ['forms', 'automation', 'data-entry'],
    nodes: [
      {
        id: '1',
        type: 'default',
        position: { x: 250, y: 50 },
        data: {
          type: 'navigate',
          label: 'Go to Form Page',
          url: 'https://example.com/contact-form',
          waitForLoad: true,
          timeout: 30000,
          enabled: true,
        },
      },
      {
        id: '2',
        type: 'default',
        position: { x: 250, y: 180 },
        data: {
          type: 'input',
          label: 'Fill Name',
          selector: '#name',
          inputType: 'text',
          value: 'John Doe',
          clearFirst: true,
          enabled: true,
        },
      },
      {
        id: '3',
        type: 'default',
        position: { x: 250, y: 310 },
        data: {
          type: 'input',
          label: 'Fill Email',
          selector: '#email',
          inputType: 'text',
          value: 'john@example.com',
          clearFirst: true,
          enabled: true,
        },
      },
      {
        id: '4',
        type: 'default',
        position: { x: 250, y: 440 },
        data: {
          type: 'input',
          label: 'Fill Message',
          selector: '#message',
          inputType: 'text',
          value: 'This is a test message',
          clearFirst: true,
          enabled: true,
        },
      },
      {
        id: '5',
        type: 'default',
        position: { x: 250, y: 570 },
        data: {
          type: 'click',
          label: 'Submit Form',
          selector: 'button[type="submit"]',
          clickCount: 1,
          waitForNavigation: true,
          enabled: true,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
    variables: {},
  },

  {
    name: 'Google Search Results',
    description: 'Search Google and extract top results',
    category: 'research',
    version: 1,
    isTemplate: true,
    tags: ['google', 'search', 'research'],
    nodes: [
      {
        id: '1',
        type: 'default',
        position: { x: 250, y: 50 },
        data: {
          type: 'navigate',
          label: 'Go to Google',
          url: 'https://www.google.com',
          waitForLoad: true,
          timeout: 30000,
          enabled: true,
        },
      },
      {
        id: '2',
        type: 'default',
        position: { x: 250, y: 180 },
        data: {
          type: 'input',
          label: 'Enter Search Query',
          selector: 'textarea[name="q"]',
          inputType: 'text',
          value: 'AI automation tools',
          clearFirst: false,
          pressEnter: true,
          enabled: true,
        },
      },
      {
        id: '3',
        type: 'default',
        position: { x: 250, y: 310 },
        data: {
          type: 'wait',
          label: 'Wait for Results',
          waitCondition: 'element',
          selector: '#search',
          timeout: 10000,
          enabled: true,
        },
      },
      {
        id: '4',
        type: 'default',
        position: { x: 250, y: 440 },
        data: {
          type: 'extract',
          label: 'Extract Result Titles',
          selector: 'h3',
          extractType: 'text',
          variableName: 'searchResults',
          multiple: true,
          enabled: true,
        },
      },
      {
        id: '5',
        type: 'default',
        position: { x: 250, y: 570 },
        data: {
          type: 'extract',
          label: 'Extract Result URLs',
          selector: 'a h3',
          extractType: 'attribute',
          attribute: 'href',
          variableName: 'resultUrls',
          multiple: true,
          enabled: true,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
    variables: {},
  },

  {
    name: 'Data Collection Loop',
    description: 'Loop through pages and collect data',
    category: 'data-extraction',
    version: 1,
    isTemplate: true,
    tags: ['scraping', 'loop', 'pagination'],
    nodes: [
      {
        id: '1',
        type: 'default',
        position: { x: 250, y: 50 },
        data: {
          type: 'navigate',
          label: 'Go to First Page',
          url: 'https://example.com/list?page=1',
          waitForLoad: true,
          timeout: 30000,
          enabled: true,
        },
      },
      {
        id: '2',
        type: 'default',
        position: { x: 250, y: 180 },
        data: {
          type: 'loop',
          label: 'Loop 5 Pages',
          loopType: 'count',
          iterations: 5,
          maxIterations: 100,
          enabled: true,
        },
      },
      {
        id: '3',
        type: 'default',
        position: { x: 250, y: 310 },
        data: {
          type: 'extract',
          label: 'Extract Items',
          selector: '.item-title',
          extractType: 'text',
          variableName: 'pageItems',
          multiple: true,
          enabled: true,
        },
      },
      {
        id: '4',
        type: 'default',
        position: { x: 250, y: 440 },
        data: {
          type: 'click',
          label: 'Next Page',
          selector: '.pagination-next',
          clickCount: 1,
          waitForNavigation: true,
          enabled: true,
        },
      },
      {
        id: '5',
        type: 'default',
        position: { x: 250, y: 570 },
        data: {
          type: 'wait',
          label: 'Wait Between Pages',
          waitCondition: 'time',
          duration: 2000,
          enabled: true,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e5-2', source: '5', target: '2', animated: true }, // Loop back
    ],
    variables: {},
  },
];

/**
 * Load a sample workflow by name
 */
export function getSampleWorkflow(name: string): Workflow | undefined {
  return SAMPLE_WORKFLOWS.find((w) => w.name === name);
}

/**
 * Get sample workflows by category
 */
export function getSampleWorkflowsByCategory(category: string): Workflow[] {
  return SAMPLE_WORKFLOWS.filter((w) => w.category === category);
}
