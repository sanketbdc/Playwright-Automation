// README.md
# Playwright Enterprise Automation Framework

This is a production-level Playwright automation framework using JavaScript (Node.js) with enterprise best practices.

## Structure
- `tests/` - Test specs
- `pages/` - Page Object Models
- `utils/` - Utilities (common methods, test data, browser manager)
- `fixtures/` - Custom fixtures and hooks
- `test-data/` - Test data in JSON
- `reports/` - Test, screenshot, video, trace, and HTML/Allure reports

## Features
- Playwright Test Runner
- Page Object Model (POM)
- Environment support (QA/UAT/Prod)
- Screenshot, video, trace on failure
- HTML & Allure reporting
- Retry mechanism
- Parallel & cross-browser execution
- Headless/headed mode
- Reusable locators & methods
- Hooks (beforeEach, afterEach)
- Utilities for test data

## Scripts
- Run single test: `npx playwright test tests/login.test.js`
- Run full suite: `npx playwright test`
- Headed mode: `HEADLESS=false npx playwright test`
- Debug mode: `npx playwright test --debug`
- Generate HTML report: `npx playwright show-report reports/html`
- Generate Allure report: `npx allure generate reports/allure-results --clean && npx allure open`

## Notes
- Set `TEST_ENV` in `.env` to `qa`, `uat`, or `prod` for environment URLs.
- All files are commented for clarity.
