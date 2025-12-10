/**
 * Live Browserbase Integration Test
 * Tests actual Browserbase API connectivity and session management
 *
 * Run with: npx tsx scripts/test-browserbase.ts
 */

import dotenv from 'dotenv';
dotenv.config({ override: true });

const API_KEY = process.env.BROWSERBASE_API_KEY;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;

async function testBrowserbase() {
  console.log('\n========================================');
  console.log('  BROWSERBASE INTEGRATION TEST');
  console.log('========================================\n');

  // Check credentials
  if (!API_KEY || !PROJECT_ID) {
    console.error('Missing credentials:');
    console.error('   BROWSERBASE_API_KEY:', API_KEY ? 'Set' : 'MISSING');
    console.error('   BROWSERBASE_PROJECT_ID:', PROJECT_ID ? 'Set' : 'MISSING');
    process.exit(1);
  }

  console.log('Credentials found');
  console.log('  API Key:', API_KEY.substring(0, 15) + '...');
  console.log('  Project ID:', PROJECT_ID);
  console.log('');

  // Dynamic import to ensure env vars are loaded first
  const { browserbaseSDK } = await import('../server/_core/browserbaseSDK');

  console.log('1. SDK Initialized:', browserbaseSDK.isInitialized() ? 'Yes' : 'No');
  console.log('');

  let sessionId: string | null = null;

  try {
    // Create session
    console.log('2. Creating browser session...');
    const session = await browserbaseSDK.createSession({
      browserSettings: {
        viewport: { width: 1280, height: 720 },
      },
    });

    sessionId = session.id;
    console.log('   Session ID:', sessionId);
    console.log('   Status:', session.status);
    console.log('');

    // Get debug URL
    console.log('3. Getting debug/live view URL...');
    const debugInfo = await browserbaseSDK.getSessionDebug(sessionId);
    console.log('   Live View URL:', debugInfo.debuggerFullscreenUrl);
    console.log('');
    console.log('   >>> Open this URL in your browser to watch the session <<<');
    console.log('');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Close session
    console.log('4. Closing session...');
    await browserbaseSDK.terminateSession(sessionId);
    console.log('   Session closed successfully');
    console.log('');

    console.log('========================================');
    console.log('  ALL TESTS PASSED!');
    console.log('========================================');
    console.log('');
    console.log('Your Browserbase integration is working correctly.');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('ERROR:', error.message);
    console.error('');

    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.error('   -> Check your BROWSERBASE_API_KEY is correct');
    } else if (error.message?.includes('404') || error.message?.includes('project')) {
      console.error('   -> Check your BROWSERBASE_PROJECT_ID is correct');
    }

    console.error('');
    console.error('Full error:', error);

    // Try to cleanup session if created
    if (sessionId) {
      try {
        await browserbaseSDK.terminateSession(sessionId);
        console.log('   (Session cleaned up)');
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

testBrowserbase();
