/**
 * Tools Module - Agent Tool System
 *
 * Provides a registry of tools for AI agent automation:
 * - ShellTool: Execute shell commands, manage background processes
 * - FileTool: Read, write, edit, search files
 *
 * Usage:
 * ```typescript
 * import { getToolRegistry, ShellTool, FileTool } from './tools';
 *
 * const registry = getToolRegistry();
 *
 * // Execute a tool
 * const result = await registry.execute('shell', {
 *   action: 'exec',
 *   command: 'ls -la'
 * }, { userId: 1, sessionId: 'abc123' });
 *
 * // Get tool definitions for AI model
 * const definitions = registry.getDefinitions();
 * ```
 */

// Types
export * from './types';

// Tools
export { ShellTool } from './ShellTool';
export { FileTool } from './FileTool';

// Registry
export { ToolRegistry, getToolRegistry, resetToolRegistry } from './ToolRegistry';

// Logger
export { ToolLogger, getToolLogger } from './ToolLogger';

// Default export
export { getToolRegistry as default } from './ToolRegistry';
