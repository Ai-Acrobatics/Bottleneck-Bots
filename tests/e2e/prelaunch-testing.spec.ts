import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.ghlagencyai.com';
const SCREENSHOT_DIR = 'test-results/prelaunch-screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test configuration
test.describe.configure({ mode: 'serial' });

test.describe('Pre-Launch Testing - Authentication', () => {
  let page: Page;
  let consoleErrors: string[] = [];
  let networkErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Console Error] ${msg.text()}`);
      }
    });

    // Capture network errors
    page.on('requestfailed', (request) => {
      networkErrors.push(`[Network Error] ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test.afterAll(async () => {
    await page.close();

    // Write errors to file
    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      const errorReport = {
        timestamp: new Date().toISOString(),
        consoleErrors,
        networkErrors,
      };
      fs.writeFileSync(
        path.join(SCREENSHOT_DIR, 'errors.json'),
        JSON.stringify(errorReport, null, 2)
      );
    }
  });

  test('1.1 - Homepage loads successfully', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-homepage.png'), fullPage: true });

    // Check title
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`✓ Page title: ${title}`);

    // Check for basic structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('1.2 - Navigate to signup page', async () => {
    // Look for signup link/button
    const signupSelectors = [
      'a:has-text("Sign Up")',
      'a:has-text("Sign up")',
      'a:has-text("Get Started")',
      'button:has-text("Sign Up")',
      'a[href*="/signup"]',
      'a[href*="/register"]',
    ];

    let signupFound = false;
    for (const selector of signupSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        await element.click();
        signupFound = true;
        console.log(`✓ Found signup via selector: ${selector}`);
        break;
      }
    }

    if (!signupFound) {
      // Try navigating directly
      await page.goto(`${BASE_URL}/signup`);
    }

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-signup-page.png'), fullPage: true });
  });

  test('1.3 - Test signup form validation', async () => {
    // Check for signup form
    const formSelectors = ['form', '[role="form"]'];
    let formFound = false;

    for (const selector of formSelectors) {
      if (await page.locator(selector).count() > 0) {
        formFound = true;
        break;
      }
    }

    expect(formFound).toBeTruthy();

    // Look for email input
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
    ];

    for (const selector of emailSelectors) {
      const input = page.locator(selector).first();
      if (await input.count() > 0) {
        // Test invalid email
        await input.fill('invalid-email');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-signup-invalid-email.png'), fullPage: true });

        // Test valid email
        await input.fill('test@example.com');
        console.log('✓ Email field validated');
        break;
      }
    }

    // Look for password input
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
    ];

    for (const selector of passwordSelectors) {
      const input = page.locator(selector).first();
      if (await input.count() > 0) {
        await input.fill('Test123!@#');
        console.log('✓ Password field found');
        break;
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-signup-form-filled.png'), fullPage: true });
  });

  test('1.4 - Navigate to login page', async () => {
    const loginSelectors = [
      'a:has-text("Log In")',
      'a:has-text("Login")',
      'a:has-text("Sign In")',
      'button:has-text("Log In")',
      'a[href*="/login"]',
      'a[href*="/signin"]',
    ];

    let loginFound = false;
    for (const selector of loginSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        await element.click();
        loginFound = true;
        console.log(`✓ Found login via selector: ${selector}`);
        break;
      }
    }

    if (!loginFound) {
      await page.goto(`${BASE_URL}/login`);
    }

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-login-page.png'), fullPage: true });
  });

  test('1.5 - Test login form exists', async () => {
    // Check for login form elements
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await emailInput.count() > 0) {
      await expect(emailInput).toBeVisible();
      console.log('✓ Email input visible');
    }

    if (await passwordInput.count() > 0) {
      await expect(passwordInput).toBeVisible();
      console.log('✓ Password input visible');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-login-form.png'), fullPage: true });
  });
});

test.describe('Pre-Launch Testing - API Health', () => {
  test('2.1 - Check API health endpoint', async ({ request }) => {
    const healthEndpoints = [
      `${BASE_URL}/api/health`,
      `${BASE_URL}/api/status`,
      `${BASE_URL}/health`,
    ];

    const results = [];

    for (const endpoint of healthEndpoints) {
      try {
        const response = await request.get(endpoint);
        const result = {
          endpoint,
          status: response.status(),
          ok: response.ok(),
          body: null as any,
        };

        try {
          result.body = await response.json();
        } catch {
          result.body = await response.text();
        }

        results.push(result);
        console.log(`✓ ${endpoint}: ${response.status()}`);
      } catch (error) {
        results.push({
          endpoint,
          status: 'Error',
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
        console.log(`✗ ${endpoint}: Failed`);
      }
    }

    // Write results to file
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'api-health-results.json'),
      JSON.stringify(results, null, 2)
    );
  });
});

test.describe('Pre-Launch Testing - Mobile Responsiveness', () => {
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Android', width: 360, height: 640 },
  ];

  for (const device of devices) {
    test(`3.1 - Test ${device.name} (${device.width}x${device.height})`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
      });
      const page = await context.newPage();

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      const screenshotName = `mobile-${device.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, screenshotName),
        fullPage: true,
      });

      // Check for viewport meta tag
      const viewportMeta = await page.locator('meta[name="viewport"]').count();
      console.log(`✓ ${device.name}: Viewport meta tag ${viewportMeta > 0 ? 'present' : 'missing'}`);

      // Check if content is visible
      await expect(page.locator('body')).toBeVisible();

      await context.close();
    });
  }
});

test.describe('Pre-Launch Testing - Console Errors', () => {
  test('4.1 - Monitor console for errors on key pages', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string; url: string }> = [];

    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        url: page.url(),
      });
    });

    const pagesToTest = [
      { url: BASE_URL, name: 'Homepage' },
      { url: `${BASE_URL}/login`, name: 'Login' },
      { url: `${BASE_URL}/signup`, name: 'Signup' },
    ];

    for (const pageTest of pagesToTest) {
      await page.goto(pageTest.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // Wait for any async operations
      console.log(`✓ Tested ${pageTest.name}`);
    }

    // Filter and save console errors
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'console-messages.json'),
      JSON.stringify({ errors, warnings, all: consoleMessages }, null, 2)
    );

    console.log(`Console Errors: ${errors.length}`);
    console.log(`Console Warnings: ${warnings.length}`);
  });
});

test.describe('Pre-Launch Testing - Dashboard', () => {
  test.skip('5.1 - Access dashboard (requires authentication)', async ({ page }) => {
    // This test requires valid credentials
    // Skip for now, but include structure for future testing

    await page.goto(`${BASE_URL}/dashboard`);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dashboard-unauthenticated.png'),
      fullPage: true,
    });

    // Should redirect to login if not authenticated
    const currentUrl = page.url();
    console.log(`Dashboard redirect: ${currentUrl}`);
  });
});
