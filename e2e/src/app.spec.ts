import { expect, Route } from '@playwright/test';
import { test } from './fixtures';

test.describe('user is not authenticated', () => {
  // this demonstrates how to start the tests with an unauthenticated user
  // if we don't pass a path for the sesion storage the auth tokens will not be set in sessionStorage
  //test.use({ sessionStorageFilePath: '' });

  test('should be redirected to the login page', async ({ page }) => {
    await page.goto('/profile');

    await page.waitForEvent('framenavigated');

    // eslint-disable-next-line playwright/no-conditional-in-test
    const expectedUrl = process.env['MSAL_AUTHORITY'] || '';
    const currentUrl = page.url();

    expect(currentUrl.includes(expectedUrl)).toBeTruthy();
  });
});

test.describe('user is authenticated', () => {

  test.use({ sessionStorageFilePath: process.env['SESSION_STORAGE_FILE_PATH'] });

  test('has title', async ({ page }) => {
    await page.goto('/');

    expect(await page.locator('.title').innerText()).toContain('Angular MSAL PlayWright');
  });

  test('should add access token to protected resource', async ({ page }) => {
    // we will just intercept this because the resource endpoint doesn't exist
    const routeHandler = async (route: Route) => {
      await route.fulfill({ status: 200, body: 'Mocked response for non-existent resource' });
    };

    await page.route('/resource', routeHandler);

    await page.goto('/');

    // Trigger a request to /resource
    await page.evaluate(() => {
      return fetch('/resource');
    });

    const request = await page.waitForRequest('/resource', {
      timeout: 5000 // Increased timeout to 5000ms
    });

    // we only need to know that the header exists
    // the value of it is an implementation detail of the msal library so we don't assert on that
    expect(await request.headerValue('authorization')).not.toBeNull();

    // Clean up the route handler after the test
    await page.unroute('/resource', routeHandler);
  });
});
