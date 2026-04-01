import { test, expect } from '@playwright/test';

test('Camel login success', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('https://www.kokuyocamlin.com/camel/login');

  // 2. Enter email
  await page.getByRole('textbox', { name: 'Email*' }).fill('sanketkumarghadmode@gmail.com');

  // 3. Enter password
  await page.getByRole('textbox', { name: 'Password*' }).fill('Test@123');

  // 4. Click on login button
  await page.getByRole('button', { name: 'Log in' }).click();

  // 5. Validate successful login by checking for account email in a paragraph after login
  await expect(page.locator('p', { hasText: 'sanketkumarghadmode@gmail.com' })).toBeVisible();
});
