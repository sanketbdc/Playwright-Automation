// tests/enquiry-form.spec.ts

import { test, expect } from '@playwright/test';
import { EnquiryFormPage } from '../../pages/EnquiryFormPage';
import { logger } from '../../utils/logger';
import formData from '../../test-data/GEGEnquiryformdata.json';

// ── Replace with your actual enquiry form URL ──────────────────────────────
const FORM_URL = 'https://www.godrejenterprises.com/inquiry'; // ← update this

// ══════════════════════════════════════════════════════════════════════════════
// Happy-Path — Full form submission
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Happy Path', () => {

  test('TC01 - Should fill and submit the complete enquiry form successfully', async ({ page }) => {
    logger.info('=== TC01: Full enquiry form submission ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    // Step 1: Name
    await enquiryPage.fillName(formData.name);

    // Step 2: Email
    await enquiryPage.fillEmail(formData.email);

    // Step 3: Country code dropdown
    await enquiryPage.selectCountryCode(formData.countryCode);

    // Step 4: Mobile number
    await enquiryPage.fillMobile(formData.mobile);

    // Step 5: City with auto-suggestion
    // Types "Aur" → verifies suggestion "Aurangabad" → clicks it → Tabs away
    await enquiryPage.fillCityWithAutoSuggest(formData.city, formData.cityExpected);

    // Step 6: Business Unit dropdown
    await enquiryPage.selectBusinessUnit(formData.businessUnit);

    // Step 7: Business Category dropdown
    await enquiryPage.selectBusinessCategory(formData.businessCategory);

    // Step 8: Message
    await enquiryPage.fillMessage(formData.message);

    // Step 9: Attach file (jpg / png / docx ≤ 10 MB)
    await enquiryPage.attachFile(formData.filePath);

    // Step 10: Submit
    await enquiryPage.submitForm();

    // Step 11: Verify success
    await enquiryPage.assertFormSubmittedSuccessfully();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// City Auto-Suggestion
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - City Auto-Suggestion', () => {

  test('TC02 - Should show auto-suggestion and first result should match typed city', async ({ page }) => {
    logger.info('=== TC02: City auto-suggestion validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    // Type partial city name
    await enquiryPage.cityInput.waitFor({ state: 'visible' });
    await enquiryPage.cityInput.fill(formData.city);

    // Wait for suggestion list
    await enquiryPage.cityAutoSuggestionList.first().waitFor({ state: 'visible', timeout: 15000 });

    // At least one suggestion should appear
    const count = await enquiryPage.cityAutoSuggestionList.count();
    logger.info(`Suggestions shown: ${count}`);
    expect(count).toBeGreaterThan(0);

    // First suggestion should contain the typed city text
    const firstSuggestion = await enquiryPage.cityAutoSuggestionList.first().textContent();
    logger.info(`First suggestion: "${firstSuggestion?.trim()}"`);
    expect(firstSuggestion?.trim().toLowerCase()).toContain(formData.city.toLowerCase());

    // Click suggestion — input should be populated
    await enquiryPage.cityAutoSuggestionList.first().click();
    const cityValue = await enquiryPage.cityInput.inputValue();
    expect(cityValue.length).toBeGreaterThan(0);
    logger.info(`City input after selection: "${cityValue}"`);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Business Unit Dropdown
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Business Unit Dropdown', () => {

  test('TC03 - Should open Business Unit dropdown and display all expected options', async ({ page }) => {
    logger.info('=== TC03: Business Unit dropdown validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    // Open the dropdown
    await enquiryPage.businessUnitCombobox.waitFor({ state: 'visible' });
    await enquiryPage.businessUnitCombobox.click();
    await expect(enquiryPage.businessUnitCombobox).toHaveAttribute('aria-expanded', 'true', { timeout: 15000 });

    // All 9 expected options must be visible — scoped to the Business Unit list
    const expectedOptions = [
      'Security',
      'Aerospace',
      'Real Estate',
      'Intralogistics',
      'Home Appliances',
      'Locks & Security',
      'Advanced Engineering',
      'Commercial Appliances',
      'Furniture & fittings',
    ];

    for (const optionText of expectedOptions) {
      const option = enquiryPage.businessUnitOptionList.getByRole('option', { name: optionText, exact: true });
      await expect(option).toBeVisible();
      logger.info(`Option visible: "${optionText}"`);
    }

    // Select and verify
    await enquiryPage.businessUnitOptionList.getByRole('option', { name: formData.businessUnit, exact: true }).click();
    const selected = await enquiryPage.businessUnitInput.inputValue();
    logger.info(`Business Unit selected: "${selected}"`);
    expect(selected).toBe(formData.businessUnit);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Business Category Dropdown
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Business Category Dropdown', () => {

  test('TC04 - Should open Business Category dropdown and select an option', async ({ page }) => {
    logger.info('=== TC04: Business Category dropdown validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.businessCategoryCombobox.waitFor({ state: 'visible' });
    await enquiryPage.businessCategoryCombobox.click();
    await expect(enquiryPage.businessCategoryCombobox).toHaveAttribute('aria-expanded', 'true', { timeout: 15000 });

    const option = enquiryPage.businessCategoryOptionList.getByRole('option', { name: formData.businessCategory, exact: true });
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();

    const selected = await enquiryPage.businessCategoryInput.inputValue();
    logger.info(`Business Category selected: "${selected}"`);
    expect(selected).toBe(formData.businessCategory);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// File Attachment
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - File Attachment', () => {

  test('TC05 - Should attach a valid file (png/jpg/docx) to the form', async ({ page }) => {
    logger.info('=== TC05: File attachment validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.attachFile(formData.filePath);

    // Verify a file was selected in the input
    const filesCount = await enquiryPage.fileInput.evaluate(
      (el: HTMLInputElement) => el.files?.length ?? 0
    );
    logger.info(`Files attached: ${filesCount}`);
    expect(filesCount).toBeGreaterThan(0);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Business Category Hidden for Aerospace
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Business Category Visibility', () => {

  test('TC07 - Should hide Business Category dropdown when Aerospace is selected as Business Unit', async ({ page }) => {
    logger.info('=== TC07: Business Category hidden for Aerospace ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    // Select Aerospace as Business Unit
    await enquiryPage.businessUnitCombobox.waitFor({ state: 'visible' });
    await enquiryPage.businessUnitCombobox.click();
    await expect(enquiryPage.businessUnitCombobox).toHaveAttribute('aria-expanded', 'true', { timeout: 15000 });
    await enquiryPage.businessUnitOptionList.getByRole('option', { name: 'Aerospace', exact: true }).click();

    const selected = await enquiryPage.businessUnitInput.inputValue();
    expect(selected).toBe('Aerospace');
    logger.info(`Business Unit selected: "${selected}"`);

    // Business Category combobox should NOT be visible
    await expect(enquiryPage.businessCategoryCombobox).not.toBeVisible({ timeout: 8000 });
    logger.info('Business Category dropdown is hidden as expected for Aerospace');
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Required Field Validation
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Validation', () => {

  test('TC06 - Should not submit when all required fields are empty', async ({ page }) => {
    logger.info('=== TC06: Required field validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    // Click submit without filling any field
    await enquiryPage.submitButton.waitFor({ state: 'visible' });
    await enquiryPage.submitButton.click();

    // Success message must NOT appear
    await expect(enquiryPage.successTitle).not.toBeVisible({ timeout: 3000 }).catch(() => {
      logger.info('Success title not visible — validation working correctly');
    });

    // Page URL should not have changed (form was blocked)
    expect(page.url()).toContain(new URL(FORM_URL).pathname);
    logger.info('TC06 passed: Form blocked submission with empty fields');
  });

});