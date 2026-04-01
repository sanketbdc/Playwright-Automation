// playwright.config.js
// Global Playwright configuration file for environment, retries, reporting, and parallelism.
// Supports QA/UAT/Prod URLs, screenshot/video/trace on failure, HTML & Allure reporting.

const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const envUrls = {
  qa: 'https://qa.kokuyocamlin.com/camel/login',
  uat: 'https://uat.kokuyocamlin.com/camel/login',
  prod: 'https://www.kokuyocamlin.com/camel/login',
};

const baseURL = envUrls[process.env.TEST_ENV] || envUrls.prod;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: 2,
  reporter: [
    ['html'],
    ['allure-playwright']
  ],
  use: {
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 0,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
  ],
  outputDir: 'reports/test-results',
});
