import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Click the Register button in the header
    const registerButton = page.getByRole('button', { name: 'Register' });
    await expect(registerButton).toBeVisible();
    await registerButton.click();

    // Wait for the register screen's heading
    await expect(
      page.getByRole('heading', { name: /create a new account/i })
    ).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    // Generate a unique email for each test run to avoid conflicts
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const callSign = `N${Math.floor(Math.random() * 10)}T${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    // Fill in the registration form
    await page.fill('#register-email', uniqueEmail);
    await page.fill('#register-password', 'ValidPassword123');
    await page.fill('#register-full-name', 'Test User');
    await page.fill('#register-call-sign', callSign);

    // Check the user agreement box
    await page.check('#terms-agreement');

    // Click the register button
    await page.click('button[type="submit"]');

    // Check for the success message
    const successMessage = page.locator('.p-3.bg-green-500\\/20');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText(/Registration successful! Please check your email to verify your account./);

    // Assert that the submit button is now disabled
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('should show an error if the email is already in use', async ({ page }) => {
    // Use a known existing email. Note: this test requires this user to exist in the test database.
    const existingEmail = 'briancloward@gmail.com';

    // Fill in the registration form
    await page.fill('#register-email', existingEmail);
    await page.fill('#register-password', 'anypassword');
    await page.fill('#register-full-name', 'Another User');
    await page.fill('#register-call-sign', 'N0DUP');

    // Check the user agreement box
    await page.check('#terms-agreement');

    // Click the register button
    await page.click('button[type="submit"]');

    // Check for the error message from Supabase
    const errorMessage = page.locator('.p-3.bg-red-500\\/20');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/User already registered/);
  });

  test('should not allow registration if terms are not agreed to', async ({ page }) => {
     // Generate unique user data
    const uniqueEmail = `testuser_terms_${Date.now()}@example.com`;
    const callSign = `N${Math.floor(Math.random() * 10)}T${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    // Fill in the registration form without checking the terms box
    await page.fill('#register-email', uniqueEmail);
    await page.fill('#register-password', 'ValidPassword123');
    await page.fill('#register-full-name', 'Test User Terms');
    await page.fill('#register-call-sign', callSign);

    // Assert that the submit button is disabled
    const registerButton = page.getByRole('button', { name: 'Register' });
    await expect(registerButton).toBeDisabled();

    // Now check the box and assert it becomes enabled
    await page.check('#terms-agreement');
    await expect(registerButton).toBeEnabled();
  });
});
