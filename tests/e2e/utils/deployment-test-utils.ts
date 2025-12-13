import { Page } from '@playwright/test';

/**
 * Get the deployment URL from environment variables
 */
export function getDeploymentUrl(): string {
  const url = process.env.DEPLOYMENT_URL || process.env.BASE_URL || 'http://localhost:3000';
  return url.replace(/\/$/, '');
}

export interface ConsoleLog {
  type: 'log' | 'warning' | 'error';
  text: string;
  location?: string;
}

/**
 * Set up network request interceptor
 */
export async function setupNetworkInterceptor(page: Page): Promise<string[]> {
  const failedRequests: string[] = [];

  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  return failedRequests;
}

/**
 * Collect console errors during page navigation
 */
export async function collectConsoleErrors(page: Page): Promise<ConsoleLog[]> {
  const errors: ConsoleLog[] = [];

  page.on('console', (msg) => {
    errors.push({
      type: msg.type() as 'log' | 'warning' | 'error',
      text: msg.text(),
      location: msg.location().url,
    });
  });

  return errors;
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageReady(page: Page, timeout = 30000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    await page.waitForLoadState('domcontentloaded', { timeout });
  }
}

/**
 * Navigate to a path and return status
 */
export async function navigateToPath(page: Page, path: string): Promise<number> {
  const response = await page.goto(path, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  if (!response) {
    throw new Error(`Navigation to ${path} failed - no response received`);
  }

  return response.status();
}

/**
 * Check if element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.$(selector);
    if (!element) return false;
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Check if text exists on page
 */
export async function hasTextContent(page: Page, text: string): Promise<boolean> {
  try {
    return (await page.textContent('body'))?.includes(text) || false;
  } catch {
    return false;
  }
}

/**
 * Test API endpoint
 */
export async function testApiEndpoint(
  page: Page,
  endpoint: string,
  expectedFields: string[] = []
): Promise<{ status: number; data: unknown }> {
  const response = await page.goto(endpoint, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  if (!response) {
    throw new Error(`API endpoint ${endpoint} returned no response`);
  }

  if (response.status() >= 400) {
    throw new Error(`API endpoint ${endpoint} returned status ${response.status()}`);
  }

  const body = await page.textContent('body');
  let data: unknown = {};

  try {
    data = JSON.parse(body || '{}');
  } catch {
    data = body;
  }

  for (const field of expectedFields) {
    if (typeof data === 'object' && data !== null && !(field in data)) {
      throw new Error(`Expected field "${field}" not found in API response`);
    }
  }

  return { status: response.status(), data };
}

/**
 * Get all console errors
 */
export async function getAllConsoleErrors(page: Page): Promise<ConsoleLog[]> {
  const errors: ConsoleLog[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push({
        type: msg.type() as 'log' | 'warning' | 'error',
        text: msg.text(),
        location: msg.location().url,
      });
    }
  });

  return errors;
}
