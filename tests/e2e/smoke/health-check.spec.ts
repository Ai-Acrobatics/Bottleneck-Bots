import { test, expect } from '@playwright/test';
import { getDeploymentUrl, navigateToPath, testApiEndpoint } from '../utils/deployment-test-utils';

const baseUrl = getDeploymentUrl();

test.describe('Health Check', () => {
  test('API health endpoint responds', async ({ page }) => {
    const status = await navigateToPath(page, `${baseUrl}/api/health`);
    expect(status).toBe(200);
  });

  test('Server returns valid health status', async ({ page }) => {
    const { data } = await testApiEndpoint(page, `${baseUrl}/api/health`);
    expect(data).toBeDefined();
  });

  test('Authentication debug endpoint is accessible', async ({ page }) => {
    const { status, data } = await testApiEndpoint(page, `${baseUrl}/api/auth/debug`, [
      'cookieConfig',
    ]);
    expect(status).toBe(200);
    expect((data as { cookieConfig: unknown }).cookieConfig).toBeDefined();
  });

  test('Cookie configuration is properly set', async ({ page }) => {
    const { data } = await testApiEndpoint(page, `${baseUrl}/api/auth/debug`);
    const config = data as { cookieConfig: { sameSite: string; secure: boolean } };
    expect(config.cookieConfig.sameSite).toBe('lax');
    expect(config.cookieConfig.secure).toBe(true);
  });

  test('Google OAuth config endpoint is accessible', async ({ page }) => {
    const { status, data } = await testApiEndpoint(page, `${baseUrl}/api/oauth/google/config`);
    expect(status).toBe(200);
    expect((data as { clientId: string }).clientId).toBeDefined();
  });
});
