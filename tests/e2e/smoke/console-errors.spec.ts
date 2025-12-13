import { test, expect } from '@playwright/test';
import { getDeploymentUrl } from '../utils/deployment-test-utils';

const baseUrl = getDeploymentUrl();

test.describe('Console Errors Check', () => {
  test('Homepage has no critical console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('ad') &&
        !error.includes('analytics') &&
        !error.includes('tracking')
    );

    expect(criticalErrors).toEqual([]);
  });

  test('Login page has no critical console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });

    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('ad') &&
        !error.includes('analytics') &&
        !error.includes('tracking')
    );

    expect(criticalErrors).toEqual([]);
  });

  test('No failed network requests for critical resources', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        const resourceType = response.request().resourceType();
        if (['stylesheet', 'script'].includes(resourceType)) {
          failedRequests.push(`${response.status()} ${response.url()}`);
        }
      }
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    expect(failedRequests).toEqual([]);
  });

  test('No unhandled promise rejections', async ({ page }) => {
    const unhandledRejections: string[] = [];

    page.on('pageerror', (error) => {
      unhandledRejections.push(error.message);
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    expect(unhandledRejections).toEqual([]);
  });

  test('DOM is properly initialized', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const htmlElement = await page.locator('html').count();
    const bodyElement = await page.locator('body').count();

    expect(htmlElement).toBe(1);
    expect(bodyElement).toBe(1);
  });

  test('React/Framework properly hydrates', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const rootElement = await page.locator('#root, [data-react-root]').count();
    const bodyContent = await page.textContent('body');

    expect(rootElement > 0 || (bodyContent && bodyContent.length > 100)).toBe(true);
  });
});
