import { test, expect } from '@playwright/test';

test.describe('Session Management', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');

        // Log in (similar to your existing login test)
        const loginButton = page.getByRole('button', { name: 'Login' });
        await expect(loginButton).toBeVisible();
        await loginButton.click();

        await expect(
        page.getByRole('heading', { name: /sign in to your account/i })
        ).toBeVisible();

        // Fill credentials and log in
        await page.fill('#email-address', 'briancloward@gmail.com');
        await page.fill('#password', 'Password2@');
        await page.click('button[type="submit"]');

        // Wait for the session screen after login
        await expect(page.getByRole('heading', { name: /net directory/i })).toBeVisible();
    });

    test('should start a NET session', async ({ page }) => {
    // Assuming you are already logged in, navigate to the session screen
    await page.goto('http://localhost:5173/session');

    // Click on the "Start Session" button
    const startSessionButton = page.getByRole('button', { name: 'Start Session' });
    await expect(startSessionButton).toBeVisible();
    await startSessionButton.click();

    // Wait for some indication that the session has started, e.g., a change in the UI
    await expect(page.getByText(/session started/i)).toBeVisible();

    // Optionally, you can check if other elements are updated or displayed as expected
    const activeSessions = page.getByRole('listitem', { name: /active sessions/i });
    await expect(activeSessions).toHaveCount(1);
    });


    test('should end a NET session', async ({ page }) => {
    // Navigate to the session screen
    await page.goto('http://localhost:5173/session');

    // Click on the "End Session" button (assuming it's only available when a session is active)
    const endSessionButton = page.getByRole('button', { name: 'End Session' });
    await expect(endSessionButton).toBeVisible();
    await endSessionButton.click();

    // Wait for some indication that the session has ended, e.g., a change in the UI
    await expect(page.getByText(/session ended/i)).toBeVisible();

    // Optionally, you can check if other elements are updated or displayed as expected
    const activeSessions = page.getByRole('listitem', { name: /active sessions/i });
    await expect(activeSessions).toHaveCount(0);
    });

});
