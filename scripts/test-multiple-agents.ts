/**
 * Multiple Browser Agents Test
 * Tests deploying and running multiple browser agents in parallel
 *
 * Run with: npx tsx scripts/test-multiple-agents.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { Stagehand } from '@browserbasehq/stagehand';

const API_KEY = process.env.BROWSERBASE_API_KEY;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

interface AgentResult {
  agentId: number;
  url: string;
  title: string;
  extractedData: any;
  sessionId: string;
  sessionUrl: string;
  success: boolean;
  error?: string;
}

async function runAgent(agentId: number, url: string): Promise<AgentResult> {
  console.log(`[Agent ${agentId}] Starting...`);

  let stagehand: Stagehand | null = null;

  try {
    stagehand = new Stagehand({
      env: 'BROWSERBASE',
      verbose: 0, // Quiet mode for parallel execution
      apiKey: API_KEY,
      projectId: PROJECT_ID,
      model: {
        modelName: 'anthropic/claude-sonnet-4-20250514',
        apiKey: ANTHROPIC_KEY,
      },
    });

    await stagehand.init();
    const page = stagehand.context.pages()[0];

    console.log(`[Agent ${agentId}] Navigating to ${url}...`);
    await page.goto(url);
    const title = await page.title();

    console.log(`[Agent ${agentId}] Page: "${title}"`);

    // Extract page info using AI
    const observations = await stagehand.observe({
      instruction: 'Find main interactive elements on this page',
    });

    console.log(`[Agent ${agentId}] Found ${observations.length} elements`);

    // Get session info from Stagehand
    const sessionUrl = `https://www.browserbase.com/sessions/${(stagehand as any).browserbaseSessionID || 'unknown'}`;
    const sessionId = (stagehand as any).browserbaseSessionID || 'unknown';

    await stagehand.close();

    return {
      agentId,
      url,
      title,
      extractedData: {
        elementCount: observations.length,
        elements: observations.slice(0, 3).map((o: any) => o.description || 'Unknown'),
      },
      sessionId,
      sessionUrl,
      success: true,
    };
  } catch (error: any) {
    console.error(`[Agent ${agentId}] ERROR:`, error.message);

    if (stagehand) {
      try {
        await stagehand.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return {
      agentId,
      url,
      title: '',
      extractedData: null,
      sessionId: '',
      sessionUrl: '',
      success: false,
      error: error.message,
    };
  }
}

async function testMultipleAgents() {
  console.log('\n========================================');
  console.log('  MULTIPLE BROWSER AGENTS TEST');
  console.log('========================================\n');

  // Check credentials
  if (!API_KEY || !PROJECT_ID || !ANTHROPIC_KEY) {
    console.error('Missing credentials');
    process.exit(1);
  }

  console.log('Credentials verified');
  console.log('');

  // URLs to test with multiple agents
  const testUrls = [
    'https://example.com',
    'https://httpbin.org',
    'https://www.wikipedia.org',
  ];

  console.log(`Deploying ${testUrls.length} browser agents in parallel...\n`);
  const startTime = Date.now();

  // Run all agents in parallel
  const results = await Promise.all(
    testUrls.map((url, index) => runAgent(index + 1, url))
  );

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n========================================');
  console.log('  RESULTS');
  console.log('========================================\n');

  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.success) {
      successCount++;
      console.log(`Agent ${result.agentId}: SUCCESS`);
      console.log(`  URL: ${result.url}`);
      console.log(`  Title: ${result.title}`);
      console.log(`  Elements found: ${result.extractedData?.elementCount || 0}`);
      console.log(`  Session: ${result.sessionUrl}`);
    } else {
      failCount++;
      console.log(`Agent ${result.agentId}: FAILED`);
      console.log(`  URL: ${result.url}`);
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('========================================');
  console.log(`  SUMMARY: ${successCount}/${testUrls.length} agents succeeded`);
  console.log(`  Total time: ${duration}s`);
  console.log('========================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

testMultipleAgents();
