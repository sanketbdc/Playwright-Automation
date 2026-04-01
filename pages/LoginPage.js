// pages/LoginPage.js

const { expect } = require('@playwright/test');
const { logger } = require('../utils/logger');

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email*' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password*' });
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }


  async goto() {
    logger.info('Navigating to login page');
    await this.page.goto('/');
  }


  async login(email, password) {
    logger.info(`Filling email: ${email}`);
    await this.emailInput.fill(email);
    logger.info('Filling password');
    await this.passwordInput.fill(password);
    logger.info('Clicking login button');
    await this.loginButton.click();
  }


  async assertLoginSuccess(email) {
    logger.info(`Asserting login success for: ${email}`);
    try {
      await expect(this.page.locator('p', { hasText: email })).toBeVisible();
      logger.info('Assertion passed: User is logged in');
    } catch (err) {
      logger.error(`Assertion failed: ${err.message}`);
      throw err;
    }
  }
}

module.exports = LoginPage;
