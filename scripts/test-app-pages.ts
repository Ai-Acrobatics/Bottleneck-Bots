/**
 * Test App Pages with BrowserBase
 * Navigates through all pages to verify they work and captures any errors
 *
 * Run with: npx tsx scripts/test-app-pages.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { Stagehand } from '@browserbasehq/stagehand';

const API_KEY = process.env.BROWSERBASE_API_KEY;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// Production URL to test
const APP_URL = 'https://ghl-agency-ai-ai-acrobatics.vercel.app';

interface PageTestResult {
  page: string;
  path: string;
  success: boolean;
  title: string;
  errors: string[];
  consoleErrors: string[];
  screenshot?: string;
}

async function testAppPages() {
  console.log('\n========================================');
  console.log('  GHL Agency AI - Page Testing');
  console.log('========================================\n');

  if (!API_KEY || !PROJECT_ID || !ANTHROPIC_KEY) {
    console.error('Missing credentials');
    process.exit(1);
  }

  let stagehand: Stagehand | null = null;
  const results: PageTestResult[] = [];
  const consoleErrors: string[] = [];

  try {
    console.log('Initializing BrowserBase session...\n');

    stagehand = new Stagehand({
      env: 'BROWSERBASE',
      verbose: 1,
      apiKey: API_KEY,
      projectId: PROJECT_ID,
      model: {
        modelName: 'anthropic/claude-sonnet-4-20250514',
        apiKey: ANTHROPIC_KEY,
      },
    });

    await stagehand.init();
    const page = stagehand.context.pages()[0];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Console Error] ${msg.text()}`);
        console.log(`  ⚠️  Console Error: ${msg.text()}`);
      }
    });

    // Pages to test
    const pagesToTest = [
      { name: 'Landing Page', path: '/' },
      { name: 'Dashboard', path: '/' }, // After login redirect
      { name: 'Browser Sessions', path: '/browser-sessions' },
      { name: 'Scheduled Tasks', path: '/scheduled-tasks' },
      { name: 'Workflow Builder', path: '/workflow-builder' },
      { name: 'Lead Lists', path: '/lead-lists' },
      { name: 'AI Campaigns', path: '/ai-campaigns' },
      { name: 'Credits', path: '/credits' },
      { name: 'Settings', path: '/settings' },
    ];

    // Helper function for delays
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Test Landing Page first
    console.log('Testing Landing Page...');
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await wait(2000);

    const landingTitle = await page.title();
    console.log(`  Title: ${landingTitle}`);

    // Take screenshot of landing page
    const landingScreenshot = await page.screenshot({ encoding: 'base64' });
    console.log(`  Screenshot captured (${landingScreenshot.length} bytes)`);

    results.push({
      page: 'Landing Page',
      path: '/',
      success: true,
      title: landingTitle,
      errors: [],
      consoleErrors: [...consoleErrors],
    });

    // Look for login button and click it
    console.log('\nLooking for login button...');

    const observations = await stagehand.observe({
      instruction: 'Find the login or sign in button on this page',
    });

    console.log(`  Found ${observations.length} potential login elements`);

    if (observations.length > 0) {
      console.log('  Clicking login button...');
      await stagehand.act('Click on the main login or sign in button');
      await wait(3000);

      const afterLoginUrl = page.url();
      console.log(`  Current URL: ${afterLoginUrl}`);
    }

    // Now test each dashboard page (these require authentication)
    // We'll navigate directly to check if they load
    for (const pageInfo of pagesToTest.slice(2)) {
      console.log(`\nTesting ${pageInfo.name}...`);

      const testUrl = `${APP_URL}${pageInfo.path}`;
      consoleErrors.length = 0; // Reset errors for each page

      try {
        await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await wait(2000);

        const pageTitle = await page.title();
        const currentUrl = page.url();

        console.log(`  URL: ${currentUrl}`);
        console.log(`  Title: ${pageTitle}`);

        // Check for visible error messages on the page
        const errorElements = await page.$$('text=/error|Error|failed|Failed/i');
        const visibleErrors: string[] = [];

        for (const el of errorElements) {
          const text = await el.textContent();
          if (text && text.length < 200) {
            visibleErrors.push(text);
          }
        }

        if (visibleErrors.length > 0) {
          console.log(`  ⚠️  Found ${visibleErrors.length} error messages on page`);
          visibleErrors.forEach(err => console.log(`    - ${err}`));
        }

        // Take screenshot
        const screenshot = await page.screenshot({ encoding: 'base64' });
        console.log(`  Screenshot: ${screenshot.length} bytes`);

        results.push({
          page: pageInfo.name,
          path: pageInfo.path,
          success: consoleErrors.length === 0 && visibleErrors.length === 0,
          title: pageTitle,
          errors: visibleErrors,
          consoleErrors: [...consoleErrors],
        });

      } catch (err: any) {
        console.log(`  ❌ Failed to load: ${err.message}`);
        results.push({
          page: pageInfo.name,
          path: pageInfo.path,
          success: false,
          title: '',
          errors: [err.message],
          consoleErrors: [...consoleErrors],
        });
      }
    }

    // Get session URL for debugging
    const sessionId = (stagehand as any).browserbaseSessionID;
    console.log(`\n📺 Live Session: https://www.browserbase.com/sessions/${sessionId}`);

    await stagehand.close();

    // Print summary
    console.log('\n========================================');
    console.log('  TEST RESULTS SUMMARY');
    console.log('========================================\n');

    let passCount = 0;
    let failCount = 0;

    for (const result of results) {
      const status = result.success ? '✅' : '❌';
      if (result.success) passCount++;
      else failCount++;

      console.log(`${status} ${result.page} (${result.path})`);

      if (result.errors.length > 0) {
        result.errors.forEach(err => console.log(`   Error: ${err}`));
      }
      if (result.consoleErrors.length > 0) {
        result.consoleErrors.forEach(err => console.log(`   Console: ${err}`));
      }
    }

    console.log(`\nTotal: ${passCount} passed, ${failCount} failed`);
    console.log('========================================\n');

  } catch (error: any) {
    console.error('Test failed:', error.message);
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (e) {
        // Ignore
      }
    }
    process.exit(1);
  }
}

testAppPages();
