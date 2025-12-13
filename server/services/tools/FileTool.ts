/**
 * FileTool - File system operations for agent automation
 * Provides read, write, edit, list, and search capabilities
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { ITool, ToolDefinition, ToolResult, ToolExecutionContext, FileOperationOptions } from './types';

interface FileReadParams {
  path: string;
  encoding?: BufferEncoding;
  lines?: number;
  offset?: number;
}

interface FileWriteParams {
  path: string;
  content: string;
  encoding?: BufferEncoding;
  createDirectories?: boolean;
  backup?: boolean;
}

interface FileEditParams {
  path: string;
  oldContent: string;
  newContent: string;
  replaceAll?: boolean;
  backup?: boolean;
}

interface FileListParams {
  path: string;
  recursive?: boolean;
  pattern?: string;
  includeHidden?: boolean;
}

interface FileSearchParams {
  path: string;
  pattern: string;
  caseSensitive?: boolean;
  maxResults?: number;
}

export class FileTool implements ITool {
  name = 'file';
  description = 'Read, write, edit, list, and search files in the filesystem';
  category: 'file' = 'file';
  enabled = true;

  private maxFileSize = 10 * 1024 * 1024; // 10MB max read
  private maxLines = 5000;

  // Blocked paths for security
  private blockedPaths = [
    '/etc/passwd',
    '/etc/shadow',
    '/etc/sudoers',
    '~/.ssh',
    '/root/.ssh',
  ];

  // Blocked extensions for writing
  private blockedExtensions = [
    '.exe', '.dll', '.so', '.dylib',
    '.sh', '.bash', '.zsh', '.fish',
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
            description: 'Action to perform: read, write, edit, delete, list, search, exists, stat',
            enum: ['read', 'write', 'edit', 'delete', 'list', 'search', 'exists', 'stat'],
          },
          path: {
            type: 'string',
            description: 'File or directory path',
          },
          content: {
            type: 'string',
            description: 'Content to write (for write action)',
          },
          oldContent: {
            type: 'string',
            description: 'Content to replace (for edit action)',
          },
          newContent: {
            type: 'string',
            description: 'Replacement content (for edit action)',
          },
          encoding: {
            type: 'string',
            description: 'File encoding',
            default: 'utf-8',
          },
          lines: {
            type: 'string',
            description: 'Number of lines to read',
          },
          offset: {
            type: 'string',
            description: 'Line offset for reading',
          },
          createDirectories: {
            type: 'string',
            description: 'Create parent directories if needed (true/false)',
            default: 'true',
          },
          backup: {
            type: 'string',
            description: 'Create backup before modifying (true/false)',
            default: 'false',
          },
          recursive: {
            type: 'string',
            description: 'List directories recursively (true/false)',
            default: 'false',
          },
          pattern: {
            type: 'string',
            description: 'Search pattern (regex for search, glob for list)',
          },
          replaceAll: {
            type: 'string',
            description: 'Replace all occurrences (true/false)',
            default: 'false',
          },
          caseSensitive: {
            type: 'string',
            description: 'Case sensitive search (true/false)',
            default: 'true',
          },
          maxResults: {
            type: 'string',
            description: 'Maximum search results',
            default: '100',
          },
        },
        required: ['action', 'path'],
      },
    };
  }

  validate(params: Record<string, unknown>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const action = params.action as string;
    const filePath = params.path as string;

    if (!action) {
      errors.push('Action is required');
    } else if (!['read', 'write', 'edit', 'delete', 'list', 'search', 'exists', 'stat'].includes(action)) {
      errors.push('Invalid action');
    }

    if (!filePath) {
      errors.push('Path is required');
    }

    // Security checks
    if (filePath) {
      const normalizedPath = path.resolve(filePath);

      // Check blocked paths
      for (const blocked of this.blockedPaths) {
        const expandedBlocked = blocked.replace('~', process.env.HOME || '');
        if (normalizedPath.startsWith(expandedBlocked)) {
          errors.push(`Access denied to restricted path: ${blocked}`);
        }
      }

      // Check blocked extensions for write operations
      if (['write', 'edit'].includes(action)) {
        const ext = path.extname(normalizedPath).toLowerCase();
        if (this.blockedExtensions.includes(ext)) {
          errors.push(`Cannot write to files with extension: ${ext}`);
        }
      }
    }

    // Action-specific validation
    if (action === 'write' && !params.content) {
      errors.push('Content is required for write action');
    }

    if (action === 'edit') {
      if (!params.oldContent) errors.push('oldContent is required for edit action');
      if (!params.newContent) errors.push('newContent is required for edit action');
    }

    if (action === 'search' && !params.pattern) {
      errors.push('Pattern is required for search action');
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  async execute(params: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();
    const action = params.action as string;

    try {
      const validation = this.validate(params);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.join(', '),
          duration: Date.now() - startTime,
        };
      }

      // Resolve path relative to working directory
      const workDir = context.workingDirectory || process.cwd();
      const resolvedPath = path.resolve(workDir, params.path as string);

      let result: ToolResult;

      switch (action) {
        case 'read':
          result = await this.readFile({ ...params, path: resolvedPath } as FileReadParams);
          break;
        case 'write':
          result = await this.writeFile({ ...params, path: resolvedPath } as unknown as FileWriteParams);
          break;
        case 'edit':
          result = await this.editFile({ ...params, path: resolvedPath } as unknown as FileEditParams);
          break;
        case 'delete':
          result = await this.deleteFile(resolvedPath);
          break;
        case 'list':
          result = await this.listFiles({ ...params, path: resolvedPath } as unknown as FileListParams);
          break;
        case 'search':
          result = await this.searchFile({ ...params, path: resolvedPath } as unknown as FileSearchParams);
          break;
        case 'exists':
          result = await this.checkExists(resolvedPath);
          break;
        case 'stat':
          result = await this.getStats(resolvedPath);
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
   * Read file content
   */
  private async readFile(params: FileReadParams): Promise<ToolResult> {
    const { path: filePath, encoding = 'utf-8', lines, offset = 0 } = params;

    // Check file exists
    try {
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        return { success: false, error: 'Path is a directory, not a file' };
      }

      if (stats.size > this.maxFileSize) {
        return {
          success: false,
          error: `File too large (${Math.round(stats.size / 1024 / 1024)}MB). Max: ${this.maxFileSize / 1024 / 1024}MB`,
        };
      }
    } catch {
      return { success: false, error: `File not found: ${filePath}` };
    }

    // Read with line limits
    if (lines) {
      const content = await this.readLines(filePath, offset, lines);
      return {
        success: true,
        data: {
          content,
          path: filePath,
          lines: content.split('\n').length,
          offset,
        },
      };
    }

    // Read entire file
    const content = await fs.readFile(filePath, { encoding });
    const lineCount = content.split('\n').length;

    // Truncate if too many lines
    if (lineCount > this.maxLines) {
      const truncated = content.split('\n').slice(0, this.maxLines).join('\n');
      return {
        success: true,
        data: {
          content: truncated,
          path: filePath,
          lines: this.maxLines,
          truncated: true,
          totalLines: lineCount,
        },
      };
    }

    return {
      success: true,
      data: {
        content,
        path: filePath,
        lines: lineCount,
      },
    };
  }

  /**
   * Read specific lines from file
   */
  private async readLines(filePath: string, offset: number, count: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const lines: string[] = [];
      let lineNumber = 0;

      const rl = createInterface({
        input: createReadStream(filePath),
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        if (lineNumber >= offset && lineNumber < offset + count) {
          lines.push(line);
        }
        lineNumber++;

        if (lineNumber >= offset + count) {
          rl.close();
        }
      });

      rl.on('close', () => resolve(lines.join('\n')));
      rl.on('error', reject);
    });
  }

  /**
   * Write file content
   */
  private async writeFile(params: FileWriteParams): Promise<ToolResult> {
    const { path: filePath, content, encoding = 'utf-8', createDirectories = true, backup = false } = params;

    // Create backup if requested
    if (backup) {
      try {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.copyFile(filePath, backupPath);
      } catch {
        // File doesn't exist, no backup needed
      }
    }

    // Create directories if needed
    if (createDirectories) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
    }

    await fs.writeFile(filePath, content, { encoding });

    return {
      success: true,
      data: {
        path: filePath,
        bytes: Buffer.byteLength(content, encoding),
        lines: content.split('\n').length,
      },
    };
  }

  /**
   * Edit file with find/replace
   */
  private async editFile(params: FileEditParams): Promise<ToolResult> {
    const { path: filePath, oldContent, newContent, replaceAll = false, backup = false } = params;

    // Read current content
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      return { success: false, error: `File not found: ${filePath}` };
    }

    // Check if old content exists
    if (!content.includes(oldContent)) {
      return {
        success: false,
        error: 'Old content not found in file',
        data: {
          searched: oldContent.substring(0, 100) + (oldContent.length > 100 ? '...' : ''),
        },
      };
    }

    // Count occurrences
    const occurrences = content.split(oldContent).length - 1;

    if (occurrences > 1 && !replaceAll) {
      return {
        success: false,
        error: `Multiple occurrences found (${occurrences}). Set replaceAll=true to replace all, or provide more specific content.`,
        data: { occurrences },
      };
    }

    // Create backup if requested
    if (backup) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, content);
    }

    // Perform replacement
    const newFileContent = replaceAll
      ? content.split(oldContent).join(newContent)
      : content.replace(oldContent, newContent);

    await fs.writeFile(filePath, newFileContent, 'utf-8');

    return {
      success: true,
      data: {
        path: filePath,
        replacements: replaceAll ? occurrences : 1,
        bytesChanged: Math.abs(Buffer.byteLength(newFileContent) - Buffer.byteLength(content)),
      },
    };
  }

  /**
   * Delete file or directory
   */
  private async deleteFile(filePath: string): Promise<ToolResult> {
    try {
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        await fs.rm(filePath, { recursive: true, force: true });
        return {
          success: true,
          data: { path: filePath, type: 'directory' },
        };
      }

      await fs.unlink(filePath);
      return {
        success: true,
        data: { path: filePath, type: 'file' },
      };
    } catch {
      return { success: false, error: `Path not found: ${filePath}` };
    }
  }

  /**
   * List files in directory
   */
  private async listFiles(params: FileListParams): Promise<ToolResult> {
    const { path: dirPath, recursive = false, pattern, includeHidden = false } = params;

    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        return { success: false, error: 'Path is not a directory' };
      }
    } catch {
      return { success: false, error: `Directory not found: ${dirPath}` };
    }

    const files: Array<{ name: string; path: string; type: 'file' | 'directory'; size?: number }> = [];

    const listDir = async (dir: string, depth = 0) => {
      if (depth > 10) return; // Max recursion depth

      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files unless requested
        if (!includeHidden && entry.name.startsWith('.')) continue;

        // Pattern matching
        if (pattern) {
          const regex = this.globToRegex(pattern);
          if (!regex.test(entry.name)) continue;
        }

        const entryPath = path.join(dir, entry.name);
        const relativePath = path.relative(dirPath, entryPath);

        if (entry.isDirectory()) {
          files.push({
            name: entry.name,
            path: relativePath,
            type: 'directory',
          });

          if (recursive) {
            await listDir(entryPath, depth + 1);
          }
        } else {
          const stats = await fs.stat(entryPath);
          files.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            size: stats.size,
          });
        }
      }
    };

    await listDir(dirPath);

    return {
      success: true,
      data: {
        path: dirPath,
        files,
        total: files.length,
        directories: files.filter(f => f.type === 'directory').length,
        regularFiles: files.filter(f => f.type === 'file').length,
      },
    };
  }

  /**
   * Search for pattern in file
   */
  private async searchFile(params: FileSearchParams): Promise<ToolResult> {
    const { path: filePath, pattern, caseSensitive = true, maxResults = 100 } = params;

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    const matches: Array<{ line: number; content: string; matches: string[] }> = [];

    for (let i = 0; i < lines.length && matches.length < maxResults; i++) {
      const lineContent = lines[i];
      const lineMatches = lineContent.match(regex);

      if (lineMatches) {
        matches.push({
          line: i + 1,
          content: lineContent.trim(),
          matches: lineMatches,
        });
      }
    }

    return {
      success: true,
      data: {
        path: filePath,
        pattern,
        matches,
        total: matches.length,
        truncated: matches.length >= maxResults,
      },
    };
  }

  /**
   * Check if path exists
   */
  private async checkExists(filePath: string): Promise<ToolResult> {
    try {
      const stats = await fs.stat(filePath);
      return {
        success: true,
        data: {
          exists: true,
          path: filePath,
          type: stats.isDirectory() ? 'directory' : 'file',
        },
      };
    } catch {
      return {
        success: true,
        data: {
          exists: false,
          path: filePath,
        },
      };
    }
  }

  /**
   * Get file/directory statistics
   */
  private async getStats(filePath: string): Promise<ToolResult> {
    try {
      const stats = await fs.stat(filePath);

      return {
        success: true,
        data: {
          path: filePath,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          accessed: stats.atime.toISOString(),
          permissions: stats.mode.toString(8),
        },
      };
    } catch {
      return { success: false, error: `Path not found: ${filePath}` };
    }
  }

  /**
   * Convert glob pattern to regex
   */
  private globToRegex(glob: string): RegExp {
    const escaped = glob
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`, 'i');
  }
}

export default FileTool;
