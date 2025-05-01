import { test } from '@playwright/test';
import { writeFileSync } from 'fs';

test('Generate MSAL sessionStorage state', async ({ page }) => {
    await page.goto('https://your-app-url.com/login');

    // Perform login
    await page.fill('#username', 'your-username');
    await page.fill('#password', 'your-password');
    await page.click('#login-button');
    await page.waitForNavigation();

    // Save sessionStorage state
    const sessionStorageState = await page.evaluate(() => {
        const entries: Record<string, string> = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
                entries[key] = sessionStorage.getItem(key) || '';
            }
        }
        return JSON.stringify(entries);
    });

    writeFileSync('../../.state/session-storage.json', sessionStorageState);
    console.log('MSAL sessionStorage state saved.');
});