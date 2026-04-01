// fixtures/testSetup.js
// Playwright test setup with hooks for beforeEach/afterEach, screenshot/video/trace on failure.

const { test } = require('@playwright/test');

// Custom test fixture with hooks
exports.customTest = test.extend({
  // Add hooks or custom fixtures here if needed
  // Example: beforeEach/afterEach hooks
  async beforeEach({ page }, use) {
    // Runs before each test
    await use(page);
  },
  async afterEach({ page }, use, testInfo) {
    // Runs after each test
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: `reports/screenshots/${testInfo.title}.png`, fullPage: true });
      await page.video().saveAs(`reports/videos/${testInfo.title}.webm`);
      await page.context().tracing.stop({ path: `reports/traces/${testInfo.title}.zip` });
    }
    await use(page);
  },
});
