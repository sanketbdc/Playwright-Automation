// utils/common.js
// Common reusable methods for Playwright tests.

module.exports = {
  /**
   * Waits for a selector to be visible.
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   */
  async waitForVisible(page, selector) {
    await page.waitForSelector(selector, { state: 'visible' });
  },

  /**
   * Clicks an element by selector.
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   */
  async click(page, selector) {
    await page.click(selector);
  },
};
