/**
 * Tool Tests - Verify ShellTool and FileTool functionality
 */

import { ShellTool } from './ShellTool';
import { FileTool } from './FileTool';
import { ToolRegistry, getToolRegistry } from './ToolRegistry';
import { ToolExecutionContext } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEST_DIR = '/tmp/tool-tests';

const testContext: ToolExecutionContext = {
  userId: 1,
  sessionId: 'test-session-001',
  workingDirectory: TEST_DIR,
};

async function setupTestDir() {
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(TEST_DIR, { recursive: true });
}

async function cleanupTestDir() {
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  } catch {}
}

// ========================================
// ShellTool Tests
// ========================================

async function testShellExec() {
  console.log('\n🔧 Testing ShellTool.exec...');
  const shell = new ShellTool();

  // Test: ls command
  const lsResult = await shell.execute(
    { action: 'exec', command: 'ls -la' },
    testContext
  );
  console.log('  ✓ ls -la:', lsResult.success ? 'PASS' : 'FAIL');
  if (!lsResult.success) console.log('    Error:', lsResult.error);

  // Test: pwd command
  const pwdResult = await shell.execute(
    { action: 'exec', command: 'pwd' },
    testContext
  );
  console.log('  ✓ pwd:', pwdResult.success ? 'PASS' : 'FAIL');
  if (pwdResult.data) console.log('    Output:', (pwdResult.data as any).stdout);

  // Test: echo command
  const echoResult = await shell.execute(
    { action: 'exec', command: 'echo "Hello from ShellTool"' },
    testContext
  );
  console.log('  ✓ echo:', echoResult.success ? 'PASS' : 'FAIL');
  if (echoResult.data) console.log('    Output:', (echoResult.data as any).stdout);

  // Test: date command
  const dateResult = await shell.execute(
    { action: 'exec', command: 'date' },
    testContext
  );
  console.log('  ✓ date:', dateResult.success ? 'PASS' : 'FAIL');
  if (dateResult.data) console.log('    Output:', (dateResult.data as any).stdout);

  return lsResult.success && pwdResult.success && echoResult.success && dateResult.success;
}

async function testShellBackground() {
  console.log('\n🔧 Testing ShellTool background execution...');
  const shell = new ShellTool();

  // Start background process
  const startResult = await shell.execute(
    { action: 'exec', command: 'sleep 1 && echo "Done"', background: 'true' },
    testContext
  );
  console.log('  ✓ Background start:', startResult.success ? 'PASS' : 'FAIL');

  if (startResult.success && startResult.data) {
    const sessionId = (startResult.data as any).sessionId;
    console.log('    Session ID:', sessionId);

    // List sessions
    const listResult = await shell.execute(
      { action: 'list' },
      testContext
    );
    console.log('  ✓ List sessions:', listResult.success ? 'PASS' : 'FAIL');
    console.log('    Running:', (listResult.data as any)?.running);

    // Wait for completion
    const waitResult = await shell.execute(
      { action: 'wait', sessionId, timeout: 3000 },
      testContext
    );
    console.log('  ✓ Wait for completion:', waitResult.success ? 'PASS' : 'FAIL');
    console.log('    Completed:', (waitResult.data as any)?.completed);

    return startResult.success && listResult.success && waitResult.success;
  }

  return false;
}

async function testShellValidation() {
  console.log('\n🔧 Testing ShellTool validation...');
  const shell = new ShellTool();

  // Test: blocked command
  const blockedResult = await shell.execute(
    { action: 'exec', command: 'rm -rf /' },
    testContext
  );
  console.log('  ✓ Blocked command rejected:', !blockedResult.success ? 'PASS' : 'FAIL');
  if (!blockedResult.success) console.log('    Error:', blockedResult.error);

  // Test: missing action
  const missingResult = await shell.execute(
    { command: 'ls' },
    testContext
  );
  console.log('  ✓ Missing action rejected:', !missingResult.success ? 'PASS' : 'FAIL');

  return !blockedResult.success && !missingResult.success;
}

// ========================================
// FileTool Tests
// ========================================

async function testFileWrite() {
  console.log('\n📁 Testing FileTool.write...');
  const file = new FileTool();

  // Test: write file
  const writeResult = await file.execute(
    {
      action: 'write',
      path: 'test.txt',
      content: 'Hello, World!\nThis is a test file.\nLine 3.',
    },
    testContext
  );
  console.log('  ✓ Write file:', writeResult.success ? 'PASS' : 'FAIL');
  if (writeResult.data) console.log('    Bytes:', (writeResult.data as any).bytes);

  return writeResult.success;
}

async function testFileRead() {
  console.log('\n📁 Testing FileTool.read...');
  const file = new FileTool();

  // Test: read file
  const readResult = await file.execute(
    { action: 'read', path: 'test.txt' },
    testContext
  );
  console.log('  ✓ Read file:', readResult.success ? 'PASS' : 'FAIL');
  if (readResult.data) {
    console.log('    Content:', (readResult.data as any).content);
    console.log('    Lines:', (readResult.data as any).lines);
  }

  return readResult.success;
}

async function testFileEdit() {
  console.log('\n📁 Testing FileTool.edit...');
  const file = new FileTool();

  // Test: edit file
  const editResult = await file.execute(
    {
      action: 'edit',
      path: 'test.txt',
      oldContent: 'Hello, World!',
      newContent: 'Hello, Tool System!',
    },
    testContext
  );
  console.log('  ✓ Edit file:', editResult.success ? 'PASS' : 'FAIL');
  if (editResult.data) console.log('    Replacements:', (editResult.data as any).replacements);

  // Verify edit
  const readResult = await file.execute(
    { action: 'read', path: 'test.txt' },
    testContext
  );
  const content = (readResult.data as any)?.content || '';
  const editApplied = content.includes('Hello, Tool System!');
  console.log('  ✓ Edit verified:', editApplied ? 'PASS' : 'FAIL');

  return editResult.success && editApplied;
}

async function testFileList() {
  console.log('\n📁 Testing FileTool.list...');
  const file = new FileTool();

  // Create additional test files
  await file.execute(
    { action: 'write', path: 'file1.txt', content: 'File 1' },
    testContext
  );
  await file.execute(
    { action: 'write', path: 'file2.txt', content: 'File 2' },
    testContext
  );
  await file.execute(
    { action: 'write', path: 'subdir/nested.txt', content: 'Nested' },
    testContext
  );

  // Test: list directory
  const listResult = await file.execute(
    { action: 'list', path: '.', recursive: 'true' },
    testContext
  );
  console.log('  ✓ List directory:', listResult.success ? 'PASS' : 'FAIL');
  if (listResult.data) {
    console.log('    Total files:', (listResult.data as any).total);
    console.log('    Files:', (listResult.data as any).files?.map((f: any) => f.path).join(', '));
  }

  return listResult.success;
}

async function testFileSearch() {
  console.log('\n📁 Testing FileTool.search...');
  const file = new FileTool();

  // Test: search file
  const searchResult = await file.execute(
    { action: 'search', path: 'test.txt', pattern: 'Tool' },
    testContext
  );
  console.log('  ✓ Search file:', searchResult.success ? 'PASS' : 'FAIL');
  if (searchResult.data) {
    console.log('    Matches found:', (searchResult.data as any).total);
  }

  return searchResult.success;
}

async function testFileStats() {
  console.log('\n📁 Testing FileTool.stat and exists...');
  const file = new FileTool();

  // Test: exists
  const existsResult = await file.execute(
    { action: 'exists', path: 'test.txt' },
    testContext
  );
  console.log('  ✓ File exists:', existsResult.success ? 'PASS' : 'FAIL');
  console.log('    Exists:', (existsResult.data as any)?.exists);

  // Test: stat
  const statResult = await file.execute(
    { action: 'stat', path: 'test.txt' },
    testContext
  );
  console.log('  ✓ File stat:', statResult.success ? 'PASS' : 'FAIL');
  if (statResult.data) {
    console.log('    Size:', (statResult.data as any).size, 'bytes');
    console.log('    Type:', (statResult.data as any).type);
  }

  return existsResult.success && statResult.success;
}

async function testFileDelete() {
  console.log('\n📁 Testing FileTool.delete...');
  const file = new FileTool();

  // Test: delete file
  const deleteResult = await file.execute(
    { action: 'delete', path: 'file1.txt' },
    testContext
  );
  console.log('  ✓ Delete file:', deleteResult.success ? 'PASS' : 'FAIL');

  // Verify deletion
  const existsResult = await file.execute(
    { action: 'exists', path: 'file1.txt' },
    testContext
  );
  const deleted = !(existsResult.data as any)?.exists;
  console.log('  ✓ Delete verified:', deleted ? 'PASS' : 'FAIL');

  return deleteResult.success && deleted;
}

// ========================================
// ToolRegistry Tests
// ========================================

async function testRegistry() {
  console.log('\n🗂️  Testing ToolRegistry...');
  const registry = getToolRegistry();

  // Test: get all tools
  const tools = registry.getAll();
  console.log('  ✓ Registered tools:', tools.length);
  console.log('    Tools:', tools.map(t => t.name).join(', '));

  // Test: get definitions
  const definitions = registry.getDefinitions();
  console.log('  ✓ Tool definitions:', definitions.length);

  // Test: execute via registry
  const result = await registry.execute(
    'shell',
    { action: 'exec', command: 'echo "Registry test"' },
    testContext
  );
  console.log('  ✓ Registry execute:', result.success ? 'PASS' : 'FAIL');
  if (result.data) console.log('    Output:', (result.data as any).stdout);

  // Test: get stats
  const stats = registry.getStats();
  console.log('  ✓ Registry stats:');
  console.log('    Total executions:', stats.totalExecutions);
  console.log('    Success rate:', ((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1) + '%');

  return tools.length >= 2 && definitions.length >= 2 && result.success;
}

// ========================================
// Main Test Runner
// ========================================

async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  Tool System Test Suite');
  console.log('═══════════════════════════════════════════');

  await setupTestDir();

  const results: Record<string, boolean> = {};

  // Shell tests
  results['shell-exec'] = await testShellExec();
  results['shell-background'] = await testShellBackground();
  results['shell-validation'] = await testShellValidation();

  // File tests
  results['file-write'] = await testFileWrite();
  results['file-read'] = await testFileRead();
  results['file-edit'] = await testFileEdit();
  results['file-list'] = await testFileList();
  results['file-search'] = await testFileSearch();
  results['file-stats'] = await testFileStats();
  results['file-delete'] = await testFileDelete();

  // Registry tests
  results['registry'] = await testRegistry();

  await cleanupTestDir();

  // Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('  Test Results Summary');
  console.log('═══════════════════════════════════════════\n');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  for (const [name, result] of Object.entries(results)) {
    console.log(`  ${result ? '✅' : '❌'} ${name}`);
  }

  console.log(`\n  Total: ${passed}/${total} passed`);
  console.log('═══════════════════════════════════════════\n');

  return passed === total;
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
