/**
 * ShellTool - Execute shell commands in a controlled environment
 * Provides exec, wait, and view capabilities for agent automation
 */

import { spawn, exec as execCallback, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { ITool, ToolDefinition, ToolResult, ToolExecutionContext, ShellCommandOptions } from './types';

const execPromise = promisify(execCallback);

interface ShellSession {
  process: ChildProcess;
  output: string[];
  errors: string[];
  isRunning: boolean;
  startedAt: Date;
  command: string;
}

interface ShellExecParams {
  command: string;
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
  background?: boolean;
}

interface ShellWaitParams {
  sessionId: string;
  timeout?: number;
}

interface ShellViewParams {
  sessionId: string;
  lines?: number;
}

export class ShellTool implements ITool {
  name = 'shell';
  description = 'Execute shell commands, manage background processes, and view output';
  category: 'shell' = 'shell';
  enabled = true;

  private sessions: Map<string, ShellSession> = new Map();
  private defaultTimeout = 30000; // 30 seconds
  private maxOutputLines = 1000;

  // Dangerous commands that should be blocked (exact matches or substrings)
  private blockedCommands = [
    'rm -rf ~',
    'mkfs.',
    'dd if=/dev/zero',
    ':(){:|:&};:',
    'chmod -R 777 /',
    '> /dev/sda',
  ];

  // Restricted patterns
  private restrictedPatterns = [
    /rm\s+(-rf?|-fr?)\s+\/\s*$/i,     // rm -rf / (only root with nothing after)
    /rm\s+(-rf?|-fr?)\s+\/\s+/i,      // rm -rf / something (root with space)
    />\s*\/dev\/sd[a-z]/i,            // write to disk devices
    /mkfs\./i,                         // format filesystems
  ];

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Action to perform: exec, wait, view, kill, list',
            enum: ['exec', 'wait', 'view', 'kill', 'list'],
          },
          command: {
            type: 'string',
            description: 'Shell command to execute (for exec action)',
          },
          sessionId: {
            type: 'string',
            description: 'Session ID for background process (for wait/view/kill actions)',
          },
          cwd: {
            type: 'string',
            description: 'Working directory for command execution',
          },
          timeout: {
            type: 'string',
            description: 'Timeout in milliseconds',
            default: '30000',
          },
          background: {
            type: 'string',
            description: 'Run command in background (true/false)',
            default: 'false',
          },
          lines: {
            type: 'string',
            description: 'Number of output lines to return (for view action)',
            default: '50',
          },
        },
        required: ['action'],
      },
    };
  }

  validate(params: Record<string, unknown>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const action = params.action as string;

    if (!action) {
      errors.push('Action is required');
    } else if (!['exec', 'wait', 'view', 'kill', 'list'].includes(action)) {
      errors.push('Invalid action. Must be: exec, wait, view, kill, or list');
    }

    if (action === 'exec' && !params.command) {
      errors.push('Command is required for exec action');
    }

    if (['wait', 'view', 'kill'].includes(action) && !params.sessionId) {
      errors.push(`Session ID is required for ${action} action`);
    }

    // Security validation for exec
    if (action === 'exec' && params.command) {
      const command = params.command as string;

      // Check blocked commands
      for (const blocked of this.blockedCommands) {
        if (command.includes(blocked)) {
          errors.push(`Blocked dangerous command: ${blocked}`);
        }
      }

      // Check restricted patterns
      for (const pattern of this.restrictedPatterns) {
        if (pattern.test(command)) {
          errors.push(`Command matches restricted pattern: ${pattern.source}`);
        }
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  async execute(params: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();
    const action = params.action as string;

    try {
      // Validate parameters
      const validation = this.validate(params);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.join(', '),
          duration: Date.now() - startTime,
        };
      }

      let result: ToolResult;

      switch (action) {
        case 'exec':
          result = await this.execCommand(params as unknown as ShellExecParams, context);
          break;
        case 'wait':
          result = await this.waitForSession(params as unknown as ShellWaitParams);
          break;
        case 'view':
          result = this.viewSession(params as unknown as ShellViewParams);
          break;
        case 'kill':
          result = this.killSession(params.sessionId as string);
          break;
        case 'list':
          result = this.listSessions();
          break;
        default:
          result = { success: false, error: `Unknown action: ${action}` };
      }

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute a shell command
   */
  private async execCommand(params: ShellExecParams, context: ToolExecutionContext): Promise<ToolResult> {
    const { command, background = false, timeout = this.defaultTimeout } = params;
    const cwd = params.cwd || context.workingDirectory || process.cwd();
    const env = { ...process.env, ...params.env };

    // Run in background
    if (background) {
      return this.execBackground(command, { cwd, timeout, env });
    }

    // Run synchronously
    try {
      const { stdout, stderr } = await execPromise(command, {
        cwd,
        timeout,
        env,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      return {
        success: true,
        data: {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: 0,
        },
        metadata: {
          command,
          cwd,
          background: false,
        },
      };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; code?: number; killed?: boolean; signal?: string };

      // Command failed but we still have output
      if (execError.stdout !== undefined || execError.stderr !== undefined) {
        return {
          success: false,
          data: {
            stdout: execError.stdout?.trim() || '',
            stderr: execError.stderr?.trim() || '',
            exitCode: execError.code || 1,
          },
          error: execError.killed ? `Command timed out after ${timeout}ms` : `Exit code: ${execError.code}`,
          metadata: {
            command,
            cwd,
            signal: execError.signal,
          },
        };
      }

      throw error;
    }
  }

  /**
   * Execute command in background
   */
  private execBackground(command: string, options: ShellCommandOptions): ToolResult {
    const sessionId = `shell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const childProcess = spawn('sh', ['-c', command], {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const session: ShellSession = {
      process: childProcess,
      output: [],
      errors: [],
      isRunning: true,
      startedAt: new Date(),
      command,
    };

    // Collect stdout
    childProcess.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      session.output.push(...lines.filter(l => l));

      // Limit output storage
      if (session.output.length > this.maxOutputLines) {
        session.output = session.output.slice(-this.maxOutputLines);
      }
    });

    // Collect stderr
    childProcess.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      session.errors.push(...lines.filter(l => l));

      if (session.errors.length > this.maxOutputLines) {
        session.errors = session.errors.slice(-this.maxOutputLines);
      }
    });

    // Handle completion
    childProcess.on('close', (code) => {
      session.isRunning = false;
      session.output.push(`[Process exited with code ${code}]`);
    });

    childProcess.on('error', (error) => {
      session.isRunning = false;
      session.errors.push(`[Process error: ${error.message}]`);
    });

    this.sessions.set(sessionId, session);

    // Set timeout if specified
    if (options.timeout) {
      setTimeout(() => {
        if (session.isRunning) {
          childProcess.kill('SIGTERM');
          session.errors.push(`[Process killed: timeout after ${options.timeout}ms]`);
        }
      }, options.timeout);
    }

    return {
      success: true,
      data: {
        sessionId,
        pid: childProcess.pid,
        command,
      },
      metadata: {
        background: true,
        startedAt: session.startedAt.toISOString(),
      },
    };
  }

  /**
   * Wait for a background session to complete
   */
  private async waitForSession(params: ShellWaitParams): Promise<ToolResult> {
    const { sessionId, timeout = this.defaultTimeout } = params;
    const session = this.sessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`,
      };
    }

    if (!session.isRunning) {
      return {
        success: true,
        data: {
          stdout: session.output.join('\n'),
          stderr: session.errors.join('\n'),
          completed: true,
        },
      };
    }

    // Wait for completion
    return new Promise((resolve) => {
      const startWait = Date.now();

      const checkInterval = setInterval(() => {
        if (!session.isRunning) {
          clearInterval(checkInterval);
          resolve({
            success: true,
            data: {
              stdout: session.output.join('\n'),
              stderr: session.errors.join('\n'),
              completed: true,
            },
          });
        } else if (Date.now() - startWait > timeout) {
          clearInterval(checkInterval);
          resolve({
            success: true,
            data: {
              stdout: session.output.join('\n'),
              stderr: session.errors.join('\n'),
              completed: false,
              stillRunning: true,
            },
            metadata: {
              waitedMs: Date.now() - startWait,
            },
          });
        }
      }, 100);
    });
  }

  /**
   * View output from a session
   */
  private viewSession(params: ShellViewParams): ToolResult {
    const { sessionId, lines = 50 } = params;
    const session = this.sessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`,
      };
    }

    const outputLines = session.output.slice(-lines);
    const errorLines = session.errors.slice(-lines);

    return {
      success: true,
      data: {
        stdout: outputLines.join('\n'),
        stderr: errorLines.join('\n'),
        isRunning: session.isRunning,
        command: session.command,
        startedAt: session.startedAt.toISOString(),
        totalOutputLines: session.output.length,
        totalErrorLines: session.errors.length,
      },
    };
  }

  /**
   * Kill a running session
   */
  private killSession(sessionId: string): ToolResult {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`,
      };
    }

    if (!session.isRunning) {
      return {
        success: true,
        data: {
          message: 'Session already completed',
          sessionId,
        },
      };
    }

    try {
      session.process.kill('SIGTERM');

      // Force kill after 5 seconds
      setTimeout(() => {
        if (session.isRunning) {
          session.process.kill('SIGKILL');
        }
      }, 5000);

      return {
        success: true,
        data: {
          message: 'Kill signal sent',
          sessionId,
          pid: session.process.pid,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to kill session: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all sessions
   */
  private listSessions(): ToolResult {
    const sessions = Array.from(this.sessions.entries()).map(([id, session]) => ({
      sessionId: id,
      command: session.command,
      isRunning: session.isRunning,
      startedAt: session.startedAt.toISOString(),
      outputLines: session.output.length,
      errorLines: session.errors.length,
      pid: session.process.pid,
    }));

    return {
      success: true,
      data: {
        sessions,
        total: sessions.length,
        running: sessions.filter(s => s.isRunning).length,
      },
    };
  }

  /**
   * Cleanup completed sessions older than maxAge
   */
  cleanup(maxAgeMs: number = 3600000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, session] of this.sessions.entries()) {
      if (!session.isRunning && (now - session.startedAt.getTime()) > maxAgeMs) {
        this.sessions.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

export default ShellTool;
