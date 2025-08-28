import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Click the Login button in the header
  const loginButton = page.getByRole('button', { name: 'Login' });
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  // Wait for the login screen's heading
  await expect(
    page.getByRole('heading', { name: /sign in to your account/i })
  ).toBeVisible();
});

test('should log in with valid credentials', async ({ page }) => {
  // Fill in the email and password fields
  await page.fill('#email-address', 'briancloward@gmail.com');
  await page.fill('#password', 'Password2@');

  // Click the login button
  await page.click('button[type="submit"]');

  // Instead of waiting for navigation (SPA doesn't reload),
  // wait for something unique on the Directory screen
  await expect(
    page.getByRole('heading', { name: /net directory/i })
  ).toBeVisible();

  // Optional: assert that other elements that only appear for logged-in users are visible
  // e.g., a logout button, profile menu, etc.
});

test('should display an error message for invalid credentials', async ({ page }) => {
  // Fill in the email and password fields with invalid credentials
  await page.fill('#email-address', 'invalid-email@example.com');
  await page.fill('#password', 'invalid-password');

  // Click the login button
  await page.click('button[type="submit"]');

  // Check if the error message is displayed
  const errorMessage = page.locator('.p-3.bg-red-500\\/20.text-red-400.rounded-md.text-sm');
  await expect(errorMessage).toHaveText(/invalid login credentials/i);
});
