
import { AgentStep, LogEntry } from "../types";

// Helper to delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulation of execution
export const executeStep = async (step: AgentStep): Promise<{ success: boolean; logs: LogEntry[]; screenshot?: string; duration: number }> => {
  
  // Simulate execution time based on complexity
  const complexityMultiplier = ['ANALYZE_UX', 'BUILD_ELEMENT', 'CLONE_SECTION'].includes(step.action) ? 2 : 1;
  const baseDelay = 2000;
  const duration = (baseDelay * complexityMultiplier) + Math.floor(Math.random() * 1000);

  await wait(duration); // Variable delay to simulate network/browser

  const logs: LogEntry[] = [];
  const timestamp = new Date().toLocaleTimeString();

  // Simulate screenshot generation for visual steps
  let screenshot = undefined;
  const action = step.action.toUpperCase();

  if (['NAVIGATE', 'SCREENSHOT', 'INSPECT', 'CLICK', 'ANALYZE_UX', 'BUILD_ELEMENT', 'PLACE_ASSET', 'CLONE_SECTION'].includes(action)) {
    // Random tech/abstract image to simulate interface
    const seed = Math.floor(Math.random() * 1000);
    screenshot = `https://picsum.photos/seed/${seed}/800/600`;
  }

  // Simulate occasional failure
  const isSuccess = Math.random() > 0.05; // 95% success rate

  if (isSuccess) {
    logs.push({
      id: crypto.randomUUID(),
      timestamp,
      level: 'info',
      message: `Executed ${step.action} on ${step.target}`,
    });

    // Specific Action Logic
    if (action === 'NAVIGATE') {
       logs.push({ id: crypto.randomUUID(), timestamp, level: 'system', message: `DOM Load Complete: ${step.target}` });
    }
    
    else if (action === 'ANALYZE_UX') {
      logs.push({ id: crypto.randomUUID(), timestamp, level: 'system', message: 'Design Tokens Extracted', detail: 'Palette: #4F46E5, #1E293B | Font: Inter | Spacing: 8px Grid' });
      logs.push({ id: crypto.randomUUID(), timestamp, level: 'system', message: 'Layout Analysis', detail: 'Detected 12-column fluid container (Elementor-style)' });
    }

    else if (action === 'BUILD_ELEMENT') {
      logs.push({ id: crypto.randomUUID(), timestamp, level: 'system', message: 'GHL Builder Action', detail: 'Element dragged to Canvas (Row > 2 Columns)' });
    }

    else if (action === 'CLONE_SECTION') {
      logs.push({ id: crypto.randomUUID(), timestamp, level: 'system', message: 'DOM Mapping', detail: 'Converting HTML/CSS to GHL JSON Schema' });
    }

    else if (action === 'RESEARCH_FEATURE') {
      logs.push({ id: crypto.randomUUID(), timestamp, level: 'system', message: 'Knowledge Retrieval', detail: `Loaded best practices for ${step.target}` });
    }

    else if (action === 'CONFIGURE_SETTINGS') {
      logs.push({ id: crypto.randomUUID(), timestamp, level: 'success', message: 'Settings Applied', detail: 'Configuration validated against GHL API' });
    }

    else if (action === 'PLACE_ASSET') {
      logs.push({ id: crypto.randomUUID(), timestamp, level: 'success', message: 'Asset Inserted', detail: 'Image optimized for webP format & Lazy Loaded' });
    }

    else if (action === 'SEND_REPORT') {
       logs.push({ id: crypto.randomUUID(), timestamp, level: 'success', message: 'Email Dispatched', detail: `Detailed PDF Report & Screen Recording sent to ${step.target}` });
    }

  } else {
    logs.push({
      id: crypto.randomUUID(),
      timestamp,
      level: 'error',
      message: `Failed operation: ${step.action}`,
      detail: 'Timeout or DOM Element Obstructed'
    });
  }

  return { success: isSuccess, logs, screenshot, duration };
};
