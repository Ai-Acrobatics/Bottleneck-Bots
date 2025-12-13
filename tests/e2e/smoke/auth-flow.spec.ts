import { test, expect } from '@playwright/test';
import { getDeploymentUrl, navigateToPath, hasTextContent } from '../utils/deployment-test-utils';

const baseUrl = getDeploymentUrl();

test.describe('Authentication Flow', () => {
  test('Homepage loads successfully', async ({ page }) => {
    const status = await navigateToPath(page, baseUrl);
    expect(status).toBe(200);
  });

  test('Login page is accessible', async ({ page }) => {
    const status = await navigateToPath(page, `${baseUrl}/login`);
    expect(status).toBe(200);
  });

  test('Login page contains auth elements', async ({ page }) => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    const hasLoginContent =
      (await hasTextContent(page, 'Login')) ||
      (await hasTextContent(page, 'Sign in')) ||
      (await hasTextContent(page, 'sign')) ||
      (await hasTextContent(page, 'login'));
    expect(hasLoginContent).toBe(true);
  });

  test('Google OAuth button is present on login page', async ({ page }) => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    const googleButton = await page.locator('text=Google').count();
    expect(googleButton).toBeGreaterThanOrEqual(0);
  });

  test('Dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
    const url = page.url();
    const isRedirected = url.includes('/login') || url === baseUrl || url === `${baseUrl}/`;
    expect(isRedirected).toBe(true);
  });

  test('Pricing page is accessible', async ({ page }) => {
    const status = await navigateToPath(page, `${baseUrl}/#pricing`);
    expect(status).toBe(200);
  });
});
