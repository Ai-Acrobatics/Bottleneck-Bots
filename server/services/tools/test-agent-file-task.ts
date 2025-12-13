/**
 * Test Agent with File Task
 * Tests the integrated shell and file tools through a simple task
 */

import { getToolRegistry } from './index';

const TEST_DIR = '/tmp/agent-file-test';

async function testAgentFileTask() {
  console.log('═══════════════════════════════════════════');
  console.log('  Agent File Task Test');
  console.log('═══════════════════════════════════════════\n');

  const registry = getToolRegistry();
  const context = { userId: 1, sessionId: 'test-agent-001', workingDirectory: TEST_DIR };

  // Step 1: Create test directory using shell
  console.log('📁 Step 1: Create test directory');
  const mkdirResult = await registry.execute('shell', {
    action: 'exec',
    command: `mkdir -p ${TEST_DIR}`,
  }, context);
  console.log('   Result:', mkdirResult.success ? '✅ Directory created' : `❌ ${mkdirResult.error}`);

  // Step 2: Write a file
  console.log('\n📝 Step 2: Write a TypeScript file');
  const writeResult = await registry.execute('file', {
    action: 'write',
    path: `${TEST_DIR}/hello.ts`,
    content: `// Hello World in TypeScript
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

export function main() {
  console.log(greet("Agent"));
}

main();
`,
  }, context);
  console.log('   Result:', writeResult.success ? `✅ File written (${(writeResult.data as any)?.bytes} bytes)` : `❌ ${writeResult.error}`);

  // Step 3: Read the file back
  console.log('\n📖 Step 3: Read the file back');
  const readResult = await registry.execute('file', {
    action: 'read',
    path: `${TEST_DIR}/hello.ts`,
  }, context);
  console.log('   Result:', readResult.success ? `✅ Read ${(readResult.data as any)?.lines} lines` : `❌ ${readResult.error}`);
  if (readResult.success) {
    console.log('   Content preview:');
    const content = (readResult.data as any)?.content || '';
    content.split('\n').slice(0, 5).forEach((line: string, i: number) => {
      console.log(`     ${i + 1}: ${line}`);
    });
    console.log('     ...');
  }

  // Step 4: Edit the file
  console.log('\n✏️  Step 4: Edit the file (change greeting)');
  const editResult = await registry.execute('file', {
    action: 'edit',
    path: `${TEST_DIR}/hello.ts`,
    oldContent: 'Hello,',
    newContent: 'Welcome,',
  }, context);
  console.log('   Result:', editResult.success ? `✅ ${(editResult.data as any)?.replacements} replacement(s)` : `❌ ${editResult.error}`);

  // Step 5: Verify edit
  console.log('\n🔍 Step 5: Search for the change');
  const searchResult = await registry.execute('file', {
    action: 'search',
    path: `${TEST_DIR}/hello.ts`,
    pattern: 'Welcome',
  }, context);
  console.log('   Result:', searchResult.success ? `✅ Found ${(searchResult.data as any)?.total} match(es)` : `❌ ${searchResult.error}`);

  // Step 6: Run the TypeScript file
  console.log('\n🚀 Step 6: Execute the TypeScript file');
  const execResult = await registry.execute('shell', {
    action: 'exec',
    command: `npx tsx ${TEST_DIR}/hello.ts`,
  }, context);
  console.log('   Result:', execResult.success ? '✅ Executed' : `❌ ${execResult.error}`);
  if (execResult.success) {
    console.log('   Output:', (execResult.data as any)?.stdout);
  }

  // Step 7: Create a second file
  console.log('\n📝 Step 7: Create a second file');
  const write2Result = await registry.execute('file', {
    action: 'write',
    path: `${TEST_DIR}/config.json`,
    content: JSON.stringify({
      name: 'Agent Test',
      version: '1.0.0',
      features: ['shell', 'file', 'edit'],
    }, null, 2),
  }, context);
  console.log('   Result:', write2Result.success ? '✅ Config created' : `❌ ${write2Result.error}`);

  // Step 8: List directory
  console.log('\n📂 Step 8: List directory contents');
  const listResult = await registry.execute('file', {
    action: 'list',
    path: TEST_DIR,
  }, context);
  console.log('   Result:', listResult.success ? '✅ Listed' : `❌ ${listResult.error}`);
  if (listResult.success) {
    const files = (listResult.data as any)?.files || [];
    console.log('   Files:');
    files.forEach((f: any) => {
      console.log(`     - ${f.name} (${f.type}${f.size ? `, ${f.size} bytes` : ''})`);
    });
  }

  // Step 9: Get file stats
  console.log('\n📊 Step 9: Get file statistics');
  const statResult = await registry.execute('file', {
    action: 'stat',
    path: `${TEST_DIR}/hello.ts`,
  }, context);
  console.log('   Result:', statResult.success ? '✅ Stats retrieved' : `❌ ${statResult.error}`);
  if (statResult.success) {
    const data = statResult.data as any;
    console.log(`   Size: ${data.size} bytes`);
    console.log(`   Modified: ${data.modified}`);
  }

  // Step 10: Cleanup
  console.log('\n🧹 Step 10: Cleanup test directory');
  const cleanupResult = await registry.execute('shell', {
    action: 'exec',
    command: `rm -rf ${TEST_DIR}`,
  }, context);
  console.log('   Result:', cleanupResult.success ? '✅ Cleaned up' : `❌ ${cleanupResult.error}`);

  // Get execution stats
  console.log('\n═══════════════════════════════════════════');
  console.log('  Execution Statistics');
  console.log('═══════════════════════════════════════════');
  const stats = registry.getStats();
  console.log(`  Total executions: ${stats.totalExecutions}`);
  console.log(`  Successful: ${stats.successfulExecutions}`);
  console.log(`  Failed: ${stats.failedExecutions}`);
  console.log(`  Average duration: ${stats.averageDuration.toFixed(2)}ms`);
  console.log('\n  By tool:');
  for (const [tool, toolStats] of Object.entries(stats.byTool)) {
    console.log(`    ${tool}: ${toolStats.executions} calls, ${toolStats.avgDuration.toFixed(2)}ms avg`);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ All tests completed!');
  console.log('═══════════════════════════════════════════\n');
}

// Run the test
testAgentFileTask().catch(console.error);
