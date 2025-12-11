/**
 * Stagehand AI-Powered Actions Test
 * Tests navigate, observe, act, and extract features
 *
 * Run with: npx tsx scripts/test-stagehand.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { Stagehand } from '@browserbasehq/stagehand';

const API_KEY = process.env.BROWSERBASE_API_KEY;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// Auto-select model based on available API key
let MODEL = process.env.STAGEHAND_MODEL;
if (!MODEL) {
  if (ANTHROPIC_KEY) MODEL = 'anthropic/claude-sonnet-4-20250514';
  else if (GEMINI_KEY) MODEL = 'google/gemini-2.0-flash';
  else if (OPENAI_KEY) MODEL = 'openai/gpt-4o';
  else MODEL = 'google/gemini-2.0-flash'; // fallback
}

async function testStagehand() {
  console.log('\n========================================');
  console.log('  STAGEHAND AI AUTOMATION TEST');
  console.log('========================================\n');

  // Check credentials
  if (!API_KEY || !PROJECT_ID) {
    console.error('Missing Browserbase credentials');
    process.exit(1);
  }

  // Check AI model key
  const hasAIKey = GEMINI_KEY || OPENAI_KEY || ANTHROPIC_KEY;
  if (!hasAIKey) {
    console.log('WARNING: No AI model API key found');
    console.log('Add one of these to .env for AI features:');
    console.log('  - GEMINI_API_KEY (for google/gemini-2.0-flash)');
    console.log('  - OPENAI_API_KEY (for openai/gpt-4o)');
    console.log('  - ANTHROPIC_API_KEY (for anthropic/claude-3-sonnet)');
    console.log('');
    console.log('Continuing with basic navigation test only...\n');
  }

  console.log('Configuration:');
  console.log('  Model:', MODEL);
  console.log('  Gemini Key:', GEMINI_KEY ? 'Set' : 'Not set');
  console.log('  OpenAI Key:', OPENAI_KEY ? 'Set' : 'Not set');
  console.log('  Anthropic Key:', ANTHROPIC_KEY ? 'Set' : 'Not set');
  console.log('');

  let stagehand: Stagehand | null = null;

  try {
    // Initialize Stagehand
    console.log('1. Initializing Stagehand...');

    // Determine which API key to use based on model
    let modelApiKey: string | undefined;
    if (MODEL?.startsWith('google/')) {
      modelApiKey = GEMINI_KEY;
    } else if (MODEL?.startsWith('openai/')) {
      modelApiKey = OPENAI_KEY;
    } else if (MODEL?.startsWith('anthropic/')) {
      modelApiKey = ANTHROPIC_KEY;
    }

    console.log('   Model API Key available:', modelApiKey ? 'Yes (' + modelApiKey.substring(0, 15) + '...)' : 'No');

    if (!modelApiKey) {
      console.error('ERROR: No API key found for model:', MODEL);
      console.error('   Available keys - Anthropic:', !!ANTHROPIC_KEY, 'Gemini:', !!GEMINI_KEY, 'OpenAI:', !!OPENAI_KEY);
      process.exit(1);
    }

    const stagehandConfig: any = {
      env: 'BROWSERBASE',
      verbose: 1,
      apiKey: API_KEY,
      projectId: PROJECT_ID,
      model: {
        modelName: MODEL,
        apiKey: modelApiKey,
      },
    };

    console.log('   Config - model:', MODEL);
    console.log('   Config - apiKey length:', modelApiKey?.length);

    stagehand = new Stagehand(stagehandConfig);
    await stagehand.init();
    console.log('   Stagehand initialized\n');

    const page = stagehand.context.pages()[0];

    // Test navigation
    console.log('2. Testing navigation...');
    await page.goto('https://example.com');
    const title = await page.title();
    console.log('   Page title:', title);
    console.log('   Navigation successful\n');

    // Test screenshot
    console.log('3. Taking screenshot...');
    const screenshot = await page.screenshot({ type: 'png' });
    console.log('   Screenshot captured:', screenshot.length, 'bytes\n');

    // Test AI features if key is available
    if (hasAIKey) {
      // Test observe
      console.log('4. Testing AI observe...');
      try {
        const observations = await stagehand.observe({
          instruction: 'What are the main elements on this page?',
        });
        console.log('   Observations:', observations.length, 'elements found');
        if (observations.length > 0) {
          console.log('   First element:', observations[0].description?.substring(0, 50) || 'No description');
        }
        console.log('');
      } catch (e: any) {
        console.log('   Observe error:', e.message?.substring(0, 80));
        console.log('');
      }

      // Test extract
      console.log('5. Testing AI extract...');
      try {
        const extracted = await stagehand.extract({
          instruction: 'Extract the main heading text from this page',
          schema: {
            type: 'object',
            properties: {
              heading: { type: 'string' },
            },
          },
        });
        console.log('   Extracted data:', JSON.stringify(extracted));
        console.log('');
      } catch (e: any) {
        console.log('   Extract error:', e.message?.substring(0, 80));
        console.log('');
      }

      // Test act
      console.log('6. Testing AI act (click link)...');
      try {
        // Stagehand v3 uses string argument for act()
        await stagehand.act('Click on the "More information" link');
        await page.waitForTimeout(2000);
        const newTitle = await page.title();
        console.log('   New page title:', newTitle);
        console.log('');
      } catch (e: any) {
        console.log('   Act error:', e.message?.substring(0, 80));
        console.log('');
      }
    } else {
      console.log('4-6. Skipping AI tests (no API key)\n');
    }

    // Cleanup
    console.log('7. Closing Stagehand...');
    await stagehand.close();
    stagehand = null;
    console.log('   Closed successfully\n');

    console.log('========================================');
    console.log('  TEST COMPLETE!');
    console.log('========================================\n');

    if (!hasAIKey) {
      console.log('To enable AI features, add an API key to .env');
      console.log('');
    }

  } catch (error: any) {
    console.error('\nERROR:', error.message);
    console.error('');

    if (stagehand) {
      try {
        await stagehand.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

testStagehand();
