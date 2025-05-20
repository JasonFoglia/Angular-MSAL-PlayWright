import { expect, Route } from '@playwright/test';
import { test } from './fixtures';

test.describe('user is not authenticated', () => {
  // this demonstrates how to start the tests with an unauthenticated user
  // if we don't pass a path for the sesion storage the auth tokens will not be set in sessionStorage
  //test.use({ sessionStorageFilePath: '' });

  test('has title', async ({ page }) => {
    await page.goto('/');

    expect(await page.locator('.title').innerText()).toContain('Angular MSAL PlayWright');
  });

  test('should be redirected to the login page', async ({ page }) => {
    await page.goto('/profile');

    await page.waitForEvent('framenavigated');

    // eslint-disable-next-line playwright/no-conditional-in-test
    const expectedUrl = process.env['MSAL_AUTHORITY'] || 'login.microsoftonline.com';
    const currentUrl = page.url();

    expect(currentUrl.toLowerCase().includes(expectedUrl.toLowerCase())).toBe(true);
  });
});

test.describe('user is authenticated', () => {

  test.use({ sessionStorageFilePath: process.env['SESSION_STORAGE_FILE_PATH'] });

  test('should add access token to protected resource', async ({ page }) => {
    const resourceUrl = '/resource'; // The resource URL you are testing

    // Mock the response for the protected resource as it might not actually exist
    // or to ensure the test is not dependent on its actual implementation.
    const routeHandler = async (route: Route) => {
      await route.fulfill({ status: 200, body: 'Mocked response for non-existent resource' });
    };
    // Use a glob pattern for page.route to match the URL regardless of the base URL.
    await page.route(`**${resourceUrl}`, routeHandler);

    await page.goto('/'); // Navigate to a page where MSAL is initialized.

    // IMPORTANT: Start waiting for the request *before* performing the action that triggers it.
    const [request] = await Promise.all([
      page.waitForRequest(
        (req) => req.url().includes(resourceUrl) && req.method() === 'GET',
        { timeout: 10000 } // Adjust timeout as necessary
      ),
      page.evaluate((url) => {
        // This code runs in the browser context.
        // Ensure fetch is available or use XMLHttpRequest if your app uses that.
        // @ts-ignore
        return window.fetch(url);
      }, resourceUrl) // Pass resourceUrl as an argument to page.evaluate
    ]);

    // Verify that the 'Cookie' header is present.
    // The exact value of the token is an MSAL implementation detail and typically not asserted directly.
    expect(await request.headerValue('Cookie')).not.toBeNull();
    expect((await request.headerValue('Cookie'))?.toLowerCase().startsWith('msal.cache.encryption')).toBe(true);


    // Clean up the route handler after the test.
    await page.unroute(`**${resourceUrl}`, routeHandler);
  });

  test('should access profile page when authenticated', async ({ page }) => {
    await page.goto('/profile');

    // Wait for the URL to ensure navigation has completed and we are on the profile page.
    await page.waitForURL('/profile', { timeout: 10000 });
    expect(page.url()).toContain('/profile');

    // Add a more specific assertion if you know what content to expect on the profile page.
    // For example, checking for a heading or a user-specific element:
    // await expect(page.locator('h1:has-text("User Profile")')).toBeVisible();
    // Or, if it displays the username from the session:
    // const username = process.env['TEST_USERNAME']; // Assuming username is available
    // if (username) {
    //   await expect(page.locator(`text=${username}`)).toBeVisible();
    // }
    // For now, just ensure it doesn't redirect to login
    const currentUrl = page.url();
    const expectedLoginUrlPart = process.env['MSAL_AUTHORITY'] || 'login.microsoftonline.com';
    expect(currentUrl.toLowerCase().includes(expectedLoginUrlPart.toLowerCase())).toBe(false);
  });

  test('should log out successfully and redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/'); // Start on a page where logout is possible

    // Attempt to find and click a logout button.
    // Adjust the selector based on your application's actual logout button.
    // Common patterns: button with text 'Logout', id='logout-button', data-testid='logout-button'
    const logoutButtonLocator = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), #logout-button, [data-testid="logout-button"], [aria-label*="Logout"], [aria-label*="Sign out"]');

    try {
      await expect(logoutButtonLocator.first()).toBeVisible({ timeout: 5000 });
      await logoutButtonLocator.first().click();
    } catch (error) {
      console.warn('Logout button not found or not clickable with common selectors. This test might require a specific selector for your app.');
      // Optionally, re-throw or handle if the button is essential for this test flow.
      // For now, we'll proceed assuming logout might also be triggered by other means or the test setup implies it.
      // If logout is purely client-side without immediate redirect, this test needs adjustment.
    }


    // After logout, MSAL typically redirects to a post-logout page or the main page.
    // Wait for a potential redirect or a state indicating logout.
    // A common pattern is that MSAL clears its tokens from sessionStorage/localStorage.
    // A robust check is to try accessing a protected route again.

    // Give MSAL some time to process logout and clear session, especially if it involves redirects.
    await page.waitForTimeout(2000); // Adjust as needed

    await page.goto('/profile'); // Try to access a protected route

    // Expect redirect to the MSAL login page.
    await page.waitForURL(/login.microsoftonline.com|oauth2\/v2.0\/authorize/, { timeout: 15000 });

    const expectedLoginUrlPart = process.env['MSAL_AUTHORITY'] || 'login.microsoftonline.com';
    const currentUrl = page.url();
    expect(currentUrl.toLowerCase().includes(expectedLoginUrlPart.toLowerCase())).toBe(true);

    // Optionally, verify that MSAL tokens are cleared from session storage.
    // This can be complex due to MSAL's specific storage keys.
    // const msalSessionItems = await page.evaluate(() => {
    //   return Object.keys(sessionStorage).filter(key => key.startsWith('msal.'));
    // });
    // expect(msalSessionItems.length).toBe(0);
  });

});
