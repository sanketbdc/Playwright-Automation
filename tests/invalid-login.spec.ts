import { test, expect } from '@playwright/test';
import loginUsers from '../test-data/loginUsers.json';
const { logger, logFile } = require('../utils/logger');

// Only invalid users (index 1 and above)
const invalidUsers = loginUsers.slice(1);

test.describe('Negative Login Scenarios', () => {
  invalidUsers.forEach((user, idx) => {
    const scenario =
      !user.email.includes('@') || user.email.startsWith('@')
        ? `#${idx + 1} Invalid email format: "${user.email}"`
        : user.password.length < 6
        ? `#${idx + 1} Invalid password for valid email: "${user.email}"`
        : `#${idx + 1} Unregistered or wrong credentials: "${user.email}"`;

    test(scenario, async ({ page }) => {
      logger.info(`Test start: ${scenario}`);
      await test.step('Open login page', async () => {
        logger.info('Navigating to https://www.kokuyocamlin.com/camel/login');
        await page.goto('https://www.kokuyocamlin.com/camel/login');
      });
      await test.step(`Enter email: ${user.email}`, async () => {
        logger.info(`Entering email: ${user.email}`);
        const emailInput = page.getByRole('textbox', { name: 'Email*' });
        await emailInput.fill(user.email);
        await expect(emailInput).toHaveValue(user.email);
      });
      await test.step(`Enter password: ${user.password}`, async () => {
        logger.info(`Entering password: ${user.password}`);
        const passwordInput = page.getByRole('textbox', { name: 'Password*' });
        await passwordInput.fill(user.password);
        await expect(passwordInput).toHaveValue(user.password);
      });
      await test.step('Click login', async () => {
        logger.info('Clicking on login CTA');
        await page.getByRole('button', { name: 'Log in' }).click();
      });
      await test.step('Verify validation message', async () => {
        if (!user.email.includes('@') || user.email.startsWith('@')) {
          await expect(page.getByText('Enter a valid email to continue.')).toBeVisible();
          logger.info('Assertion passed: Enter a valid email to continue. message is visible');
        } else {
          await expect(page.getByText('Incorrect email or password. Try again.')).toBeVisible();
          logger.info('Assertion passed: Incorrect email or password. Try again. message is visible');
        }
      });
      logger.info('Test end: User is not logged in with invalid details');
    });
  }); 

  test.afterAll(async () => {
    logger.info(`Log file for this run: ${logFile}`);
  });
});