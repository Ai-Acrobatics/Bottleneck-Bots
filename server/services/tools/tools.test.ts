/**
 * Tool Tests - Verify ShellTool and FileTool functionality
 */

import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { ShellTool } from './ShellTool';
import { FileTool } from './FileTool';
import { getToolRegistry } from './ToolRegistry';
import { ToolExecutionContext } from './types';
import * as fs from 'fs/promises';

const TEST_DIR = '/tmp/tool-tests-vitest';

const testContext: ToolExecutionContext = {
  userId: 1,
  sessionId: 'test-session-001',
  workingDirectory: TEST_DIR,
};

describe('Tool System', () => {
  beforeAll(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  // ========================================
  // ShellTool Tests
  // ========================================

  describe('ShellTool', () => {
    let shell: ShellTool;

    beforeEach(() => {
      shell = new ShellTool();
    });

    describe('exec action', () => {
      it('should execute ls command', async () => {
        const result = await shell.execute(
          { action: 'exec', command: 'ls -la' },
          testContext
        );
        expect(result.success).toBe(true);
      });

      it('should execute pwd command', async () => {
        const result = await shell.execute(
          { action: 'exec', command: 'pwd' },
          testContext
        );
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should execute echo command', async () => {
        const result = await shell.execute(
          { action: 'exec', command: 'echo "Hello from ShellTool"' },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.stdout).toContain('Hello from ShellTool');
      });

      it('should execute date command', async () => {
        const result = await shell.execute(
          { action: 'exec', command: 'date' },
          testContext
        );
        expect(result.success).toBe(true);
      });
    });

    describe('validation', () => {
      it('should reject dangerous commands', async () => {
        const result = await shell.execute(
          { action: 'exec', command: 'rm -rf /' },
          testContext
        );
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      });

      it('should reject commands without action', async () => {
        const result = await shell.execute(
          { command: 'ls' },
          testContext
        );
        expect(result.success).toBe(false);
      });
    });

    describe('background execution', () => {
      it('should start background process', async () => {
        const result = await shell.execute(
          { action: 'exec', command: 'sleep 0.1 && echo "Done"', background: 'true' },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.sessionId).toBeDefined();
      });

      it('should list sessions', async () => {
        const result = await shell.execute(
          { action: 'list' },
          testContext
        );
        expect(result.success).toBe(true);
      });
    });
  });

  // ========================================
  // FileTool Tests
  // ========================================

  describe('FileTool', () => {
    let file: FileTool;

    beforeEach(() => {
      file = new FileTool();
    });

    describe('write action', () => {
      it('should write file', async () => {
        const result = await file.execute(
          {
            action: 'write',
            path: 'test.txt',
            content: 'Hello, World!\nThis is a test file.\nLine 3.',
          },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.bytes).toBeGreaterThan(0);
      });
    });

    describe('read action', () => {
      it('should read file', async () => {
        // First write a file
        await file.execute(
          { action: 'write', path: 'read-test.txt', content: 'Test content' },
          testContext
        );

        const result = await file.execute(
          { action: 'read', path: 'read-test.txt' },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.content).toContain('Test content');
      });
    });

    describe('edit action', () => {
      it('should edit file', async () => {
        // Write initial file
        await file.execute(
          { action: 'write', path: 'edit-test.txt', content: 'Hello, World!' },
          testContext
        );

        const result = await file.execute(
          {
            action: 'edit',
            path: 'edit-test.txt',
            oldContent: 'Hello, World!',
            newContent: 'Hello, Tool System!',
          },
          testContext
        );
        expect(result.success).toBe(true);

        // Verify edit
        const readResult = await file.execute(
          { action: 'read', path: 'edit-test.txt' },
          testContext
        );
        expect((readResult.data as any)?.content).toContain('Hello, Tool System!');
      });
    });

    describe('list action', () => {
      it('should list directory', async () => {
        // Create test files
        await file.execute(
          { action: 'write', path: 'list1.txt', content: 'File 1' },
          testContext
        );
        await file.execute(
          { action: 'write', path: 'list2.txt', content: 'File 2' },
          testContext
        );

        const result = await file.execute(
          { action: 'list', path: '.', recursive: 'true' },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.total).toBeGreaterThan(0);
      });
    });

    describe('search action', () => {
      it('should search file', async () => {
        // Write file with searchable content
        await file.execute(
          { action: 'write', path: 'search-test.txt', content: 'Tool System test' },
          testContext
        );

        const result = await file.execute(
          { action: 'search', path: 'search-test.txt', pattern: 'Tool' },
          testContext
        );
        expect(result.success).toBe(true);
      });
    });

    describe('exists action', () => {
      it('should check file exists', async () => {
        await file.execute(
          { action: 'write', path: 'exists-test.txt', content: 'Test' },
          testContext
        );

        const result = await file.execute(
          { action: 'exists', path: 'exists-test.txt' },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.exists).toBe(true);
      });

      it('should return false for non-existent file', async () => {
        const result = await file.execute(
          { action: 'exists', path: 'non-existent-file.txt' },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.exists).toBe(false);
      });
    });

    describe('stat action', () => {
      it('should get file stats', async () => {
        await file.execute(
          { action: 'write', path: 'stat-test.txt', content: 'Test content' },
          testContext
        );

        const result = await file.execute(
          { action: 'stat', path: 'stat-test.txt' },
          testContext
        );
        expect(result.success).toBe(true);
        expect((result.data as any)?.size).toBeGreaterThan(0);
      });
    });

    describe('delete action', () => {
      it('should delete file', async () => {
        await file.execute(
          { action: 'write', path: 'delete-test.txt', content: 'To be deleted' },
          testContext
        );

        const deleteResult = await file.execute(
          { action: 'delete', path: 'delete-test.txt' },
          testContext
        );
        expect(deleteResult.success).toBe(true);

        // Verify deletion
        const existsResult = await file.execute(
          { action: 'exists', path: 'delete-test.txt' },
          testContext
        );
        expect((existsResult.data as any)?.exists).toBe(false);
      });
    });
  });

  // ========================================
  // ToolRegistry Tests
  // ========================================

  describe('ToolRegistry', () => {
    it('should have registered tools', () => {
      const registry = getToolRegistry();
      const tools = registry.getAll();
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should get tool definitions', () => {
      const registry = getToolRegistry();
      const definitions = registry.getDefinitions();
      expect(definitions.length).toBeGreaterThan(0);
    });

    it('should execute tool via registry', async () => {
      const registry = getToolRegistry();
      const result = await registry.execute(
        'shell',
        { action: 'exec', command: 'echo "Registry test"' },
        testContext
      );
      expect(result.success).toBe(true);
    });

    it('should track execution stats', () => {
      const registry = getToolRegistry();
      const stats = registry.getStats();
      expect(stats).toHaveProperty('totalExecutions');
      expect(stats).toHaveProperty('successfulExecutions');
    });
  });
});
