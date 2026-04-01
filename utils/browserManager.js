// utils/browserManager.js
// Provides reusable browser setup and teardown for Playwright tests.

const { chromium, firefox, webkit } = require('playwright');

class BrowserManager {
  static async launch(browserType = 'chromium', options = {}) {
    switch (browserType) {
      case 'firefox':
        return await firefox.launch(options);
      case 'webkit':
        return await webkit.launch(options);
      default:
        return await chromium.launch(options);
    }
  }
}

module.exports = BrowserManager;
