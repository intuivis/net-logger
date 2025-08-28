import { test, expect } from '@playwright/test';

// Define a variable to hold the name of the net created in each test.
// This allows the afterEach hook to know which specific net to clean up.
let netNameToCleanUp: string;

test.describe('Net Management', () => {
  
  // Runs before each test in this suite.
  // Handles login and navigation to the Manage NETs screen to ensure a clean start.
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Login
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
    await page.fill('#email-address', 'briancloward@gmail.com');
    await page.fill('#password', 'Password2@');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: /net directory/i })).toBeVisible({ timeout: 10000 });

    // Navigate to Manage NETs
    await page.locator('header button:has-text("expand_more")').click();
    await page.getByRole('button', { name: 'Manage NETs' }).click();
    await expect(page.getByRole('heading', { name: 'Manage NETs' })).toBeVisible();
  });

  // Runs after each test in this suite.
  // This hook now cleans up by deleting the net directly from the detail page where the test ends.
  // This is more robust than navigating back to the list first.
  test.afterEach(async ({ page }) => {
    if (netNameToCleanUp) {
      // The test ends on the Net Detail page, so the delete button should be visible there.
      await expect(page.getByRole('heading', { name: netNameToCleanUp, level: 1 })).toBeVisible();

      // Click the delete button on the detail page.
      await page.getByRole('button', { name: 'Delete NET' }).click();

      // The confirmation modal appears. Click the final delete button.
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      
      // After deletion, the app automatically navigates back to the "Manage NETs" list.
      // We wait for this navigation to complete. A longer timeout is used for stability.
      await expect(page.getByRole('heading', { name: 'Manage NETs' })).toBeVisible({ timeout: 10000 });
      
      // Final check: Assert that the card for the deleted net is gone.
      await expect(page.getByRole('heading', { name: netNameToCleanUp })).not.toBeVisible();
      
      // Reset for the next test
      netNameToCleanUp = ''; 
    }
  });

  test('should create a weekly net with a Single Repeater', async ({ page }) => {
    netNameToCleanUp = `XYZ Test Net - Weekly Single - ${Date.now()}`;
    const randomDayWeekly = 'Wednesday';

    await page.getByRole('button', { name: 'New NET' }).click();
    await expect(page.getByRole('heading', { name: 'Create New NET' })).toBeVisible();
    
    await page.fill('#name', netNameToCleanUp);
    await page.selectOption('#schedule_type', { label: 'Weekly' });
    await page.selectOption('#schedule_day', { label: randomDayWeekly });
    await page.fill('#time', '20:30');
    await page.selectOption('#net_config_type', { label: 'Single Repeater' });
    await page.fill('#r-name-0', 'Test Mtn Repeater');
    await page.fill('#r-freq-0', '147.123');
    
    await page.getByRole('button', { name: 'Create NET' }).click();
    
    // Assert creation was successful by checking the detail page
    await expect(page.getByRole('heading', { name: netNameToCleanUp, level: 1 })).toBeVisible();
    await expect(page.getByText(`Weekly on ${randomDayWeekly}s`)).toBeVisible();
    await expect(page.getByText('Test Mtn Repeater')).toBeVisible();
  });

  test('should create a daily net with a Linked Repeater System', async ({ page }) => {
    netNameToCleanUp = `XYZ Test Net - Daily Linked - ${Date.now()}`;

    await page.getByRole('button', { name: 'New NET' }).click();
    await expect(page.getByRole('heading', { name: 'Create New NET' })).toBeVisible();

    await page.fill('#name', netNameToCleanUp);
    await page.selectOption('#schedule_type', { label: 'Daily' });
    await page.getByRole('button', { name: 'Tue' }).click();
    await page.getByRole('button', { name: 'Thu' }).click();
    await page.fill('#time', '08:00');
    await page.selectOption('#net_config_type', { label: 'Linked Repeater System' });
    await page.fill('#r-name-0', 'North Site');
    await page.fill('#r-freq-0', '442.100');
    await page.getByRole('button', { name: 'Add Repeater' }).click();
    await page.fill('#r-name-1', 'South Site');
    await page.fill('#r-freq-1', '442.200');

    await page.getByRole('button', { name: 'Create NET' }).click();

    // Assert creation
    await expect(page.getByRole('heading', { name: netNameToCleanUp, level: 1 })).toBeVisible();
    await expect(page.getByText('Daily on Tue, Thu')).toBeVisible();
    await page.getByRole('button', { name: /Linked Repeaters/ }).click();
    await expect(page.getByText(/North Site/)).toBeVisible();
    await expect(page.getByText(/South Site/)).toBeVisible();
  });

  test('should create a monthly net with an HF/Simplex configuration', async ({ page }) => {
    netNameToCleanUp = `XYZ Test Net - Monthly HF - ${Date.now()}`;
    const randomOccurrence = 'Third';
    const randomDayMonthly = 'Saturday';

    await page.getByRole('button', { name: 'New NET' }).click();
    await expect(page.getByRole('heading', { name: 'Create New NET' })).toBeVisible();

    await page.fill('#name', netNameToCleanUp);
    await page.selectOption('#schedule_type', { label: 'Monthly' });
    await page.getByRole('radio').nth(1).check(); // Select "On the..." radio for day-based monthly schedule
    await page.selectOption('#schedule_occurrence', { label: randomOccurrence });
    await page.selectOption('#schedule_monthly_day', { label: randomDayMonthly });
    await page.fill('#time', '10:00');
    await page.selectOption('#net_config_type', { label: 'HF/Simplex' });
    await page.fill('#frequency', '3.885');
    await page.fill('#band', '80m');
    await page.fill('#mode', 'LSB');

    await page.getByRole('button', { name: 'Create NET' }).click();
    
    // Assert creation
    await expect(page.getByRole('heading', { name: netNameToCleanUp, level: 1 })).toBeVisible();
    await expect(page.getByText(`Monthly on the ${randomOccurrence} ${randomDayMonthly}`)).toBeVisible();
    await expect(page.getByText('3.885 MHz')).toBeVisible();
  });
});