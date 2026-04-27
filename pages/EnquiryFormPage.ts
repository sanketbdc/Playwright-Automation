// pages/EnquiryFormPage.ts

import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import { logger } from '../utils/logger';

export class EnquiryFormPage {
  readonly page: Page;

  // ── Simple text fields ────────────────────────────────────────────────
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly mobileInput: Locator;
  readonly messageInput: Locator;
  readonly fileInput: Locator;
  readonly submitButton: Locator;

  // ── City field + auto-suggestion list ─────────────────────────────────
  readonly cityInput: Locator;
  readonly cityAutoSuggestionList: Locator;

  // ── Country code dropdown ─────────────────────────────────────────────
  readonly countryCodeCombobox: Locator;

  // ── Business Unit dropdown ────────────────────────────────────────────
  readonly businessUnitCombobox: Locator;   // the outer div[role="combobox"]
  readonly businessUnitInput: Locator;      // the <input> inside the combobox
  readonly businessUnitOptionList: Locator; // the <ul> options list

  // ── Business Category dropdown ────────────────────────────────────────
  readonly businessCategoryCombobox: Locator;   // the outer div[role="combobox"]
  readonly businessCategoryInput: Locator;      // the <input> inside the combobox
  readonly businessCategoryOptionList: Locator; // the <ul> options list

  // ── Success message ───────────────────────────────────────────────────
  readonly successTitle: Locator;

  // ── Error messages ────────────────────────────────────────────────────
  readonly nameError: Locator;
  readonly emailError: Locator;
  readonly mobileError: Locator;
  readonly cityError: Locator;
  readonly messageError: Locator;

  constructor(page: Page) {
    this.page = page;

    this.nameInput    = page.locator('input#name');
    this.emailInput   = page.locator('input#email');
    this.mobileInput  = page.locator('input[name="mobile"], input#mobile, input[type="tel"]');
    this.messageInput = page.locator('textarea[name="message"], textarea#message');
    this.fileInput    = page.locator('input[type="file"]');
    this.submitButton = page.locator('button[type="submit"], input[type="submit"]');

    // City input and its auto-suggestion dropdown
    this.cityInput              = page.locator('input#city');
    this.cityAutoSuggestionList = page.locator('ul.m-combobox__option-list.is-visible li.m-combobox__option');

    // Country code — adjust selector to match your actual country-code combobox
    this.countryCodeCombobox = page.locator('.m-combobox__button').first();

    // Business Unit — combobox wrapper, inner textbox, and the sibling listbox
    this.businessUnitCombobox   = page.getByRole('combobox').filter({ has: page.getByText('Preferable Business Unit*') });
    this.businessUnitInput      = this.businessUnitCombobox.getByRole('textbox');
    this.businessUnitOptionList = this.businessUnitCombobox.locator('..').getByRole('listbox');

    // Business Category — combobox wrapper, inner textbox, and the sibling listbox
    this.businessCategoryCombobox   = page.getByRole('combobox').filter({ has: page.getByText('Preferable Business Category*') });
    this.businessCategoryInput      = this.businessCategoryCombobox.getByRole('textbox');
    this.businessCategoryOptionList = this.businessCategoryCombobox.locator('..').getByRole('listbox');

    // Shown after successful form submission
    this.successTitle = page.locator('h3.ui-enquiry__form-submit-title');

    // Error messages for validation
    this.nameError    = page.locator('p.m-input-text__error[data-required="Enter your full name."]');
    this.emailError   = page.locator('p.m-input-text__error[data-required="Enter your email address."]');
    this.mobileError  = page.locator('p.m-global-mobile-input__error');
    this.cityError    = page.locator('p.m-input-text__error[data-required="Enter the name of your city."]');
    this.messageError = page.locator('p.m-input-text__error[data-required="Enter your message."]');
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async goto(url: string): Promise<void> {
    logger.info(`Navigating to enquiry form: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    // Dismiss cookies banner using the button inside the banner, not the link
    const cookiesBanner = this.page.locator('div.ui-cookies-alert');
    if (await cookiesBanner.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.page.locator('div.ui-cookies-alert button').click();
      await cookiesBanner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      logger.info('Cookies banner dismissed');
    }
  }

  // ── Field helpers ────────────────────────────────────────────────────────

  async fillName(name: string): Promise<void> {
    logger.info(`Filling Name: ${name}`);
    await this.nameInput.waitFor({ state: 'visible' });
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    logger.info(`Filling Email: ${email}`);
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
  }

  async selectCountryCode(countryCode: string): Promise<void> {
    logger.info(`Selecting Country Code: ${countryCode}`);
    await this.countryCodeCombobox.click();
    const listbox = this.countryCodeCombobox.locator('..').getByRole('listbox');
    const option  = listbox.getByRole('option', { name: countryCode, exact: true });
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
  }

  async fillMobile(mobile: string): Promise<void> {
    logger.info(`Filling Mobile: ${mobile}`);
    await this.mobileInput.waitFor({ state: 'visible' });
    await this.mobileInput.fill(mobile);
  }

  /**
   * Types a partial city name, waits for the auto-suggestion list,
   * verifies the first suggestion contains the expected city text,
   * clicks it, then presses Tab to move focus forward.
   */
  async fillCityWithAutoSuggest(partialCity: string, expectedCity: string): Promise<void> {
    logger.info(`Typing city: "${partialCity}" — expecting suggestion: "${expectedCity}"`);
    await this.cityInput.waitFor({ state: 'visible' });
    await this.cityInput.fill(partialCity);

    // Wait for the suggestion list to appear
    await this.cityAutoSuggestionList.first().waitFor({ state: 'visible', timeout: 15000 });

    // Verify first suggestion contains the expected city name
    const firstSuggestionText = await this.cityAutoSuggestionList.first().textContent();
    logger.info(`First suggestion: "${firstSuggestionText?.trim()}"`);
    expect(firstSuggestionText?.trim().toLowerCase()).toContain(expectedCity.toLowerCase());

    // Click the first suggestion
    await this.cityAutoSuggestionList.first().click();

    // Tab to the next field
    await this.cityInput.press('Tab');
  }

  /**
   * Opens the Business Unit combobox and selects an option.
   *
   * Strategy:
   * 1. Click the inner <input> inside the combobox to open the dropdown
   * 2. Wait for aria-expanded="true" on the wrapper to confirm it opened
   * 3. Click the matching <li> option by data-value
   * 4. Verify the input value updated correctly
   * 5. Tab to the next field
   */
  async selectBusinessUnit(unit: string): Promise<void> {
    logger.info(`Selecting Business Unit: ${unit}`);

    await this.businessUnitCombobox.scrollIntoViewIfNeeded();
    await this.businessUnitCombobox.click();

    // Wait for the combobox to expand
    await expect(this.businessUnitCombobox).toHaveAttribute('aria-expanded', 'true', { timeout: 15000 });
    logger.info('Business Unit dropdown is open');

    // Scope option to the sibling listbox
    const option = this.businessUnitOptionList.getByRole('option', { name: unit, exact: true });
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
    logger.info(`Clicked Business Unit option: "${unit}"`);

    await expect(this.businessUnitInput).toHaveValue(unit, { timeout: 10000 });
    await this.businessUnitInput.press('Tab');
  }

  /**
   * Opens the Business Category combobox and selects an option.
   *
   * Strategy:
   * 1. Click the inner <input> to open the dropdown
   * 2. Wait for the dropdown to expand
   * 3. Click the matching <li> option by data-value
   * 4. Verify the input value updated
   * 5. Tab to the next field (Message)
   */
  async selectBusinessCategory(category: string): Promise<void> {
    logger.info(`Selecting Business Category: ${category}`);

    await this.businessCategoryCombobox.scrollIntoViewIfNeeded();
    await this.businessCategoryCombobox.click();

    // Wait for the combobox to expand
    await expect(this.businessCategoryCombobox).toHaveAttribute('aria-expanded', 'true', { timeout: 15000 });
    logger.info('Business Category dropdown is open');

    // Scope option to the sibling listbox
    const option = this.businessCategoryOptionList.getByRole('option', { name: category, exact: true });
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
    logger.info(`Clicked Business Category option: "${category}"`);

    await expect(this.businessCategoryInput).toHaveValue(category, { timeout: 10000 });
    await this.businessCategoryInput.press('Tab');
  }

  async fillMessage(message: string): Promise<void> {
    logger.info(`Filling Message`);
    await this.messageInput.waitFor({ state: 'visible' });
    await this.messageInput.fill(message);
  }

  /**
   * Attaches a file (jpg / png / docx, max 10 MB) to the file input.
   * @param filePath - absolute or project-relative path
   */
  async attachFile(filePath: string): Promise<void> {
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    logger.info(`Attaching file: ${resolvedPath}`);
    await this.fileInput.waitFor({ state: 'attached' });
    await this.fileInput.setInputFiles(resolvedPath);
    logger.info('File attached successfully');
  }

  async submitForm(): Promise<void> {
    logger.info('Clicking Submit button');
    await this.submitButton.waitFor({ state: 'visible' });
    await Promise.all([
      this.page.waitForResponse(
        res => res.request().method() === 'POST' && res.status() < 500,
        { timeout: 30000 }
      ),
      this.submitButton.click(),
    ]);
    logger.info('Submit clicked and response received');
  }

  async assertFormSubmittedSuccessfully(): Promise<void> {
    logger.info('Asserting form submission success');
    try {
      await this.successTitle.waitFor({ state: 'visible', timeout: 30000 });
      const successText = await this.successTitle.textContent();
      logger.info(`Form submitted successfully. Message: "${successText?.trim()}"`);
    } catch (err: any) {
      logger.error(`Assertion failed: ${err.message}`);
      throw err;
    }
  }

  // ── Validation helpers ──────────────────────────────────────────────────

  async getErrorMessage(errorLocator: Locator): Promise<string | null> {
    try {
      await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
      return await errorLocator.textContent();
    } catch {
      return null;
    }
  }

  async assertErrorMessage(errorLocator: Locator, expectedError: string): Promise<void> {
    await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
    const actualError = await errorLocator.textContent();
    logger.info(`Expected error: "${expectedError}"`);
    logger.info(`Actual error: "${actualError?.trim()}"`);
    expect(actualError?.trim()).toBe(expectedError);
  }

  async assertErrorMessageContains(errorLocator: Locator, expectedText: string): Promise<void> {
    await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
    const actualError = await errorLocator.textContent();
    logger.info(`Expected error to contain: "${expectedText}"`);
    logger.info(`Actual error: "${actualError?.trim()}"`);
    expect(actualError?.trim()).toContain(expectedText);
  }
}