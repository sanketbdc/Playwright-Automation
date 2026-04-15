// tests/enquiry-form-negative.spec.ts

import { test, expect } from '@playwright/test';
import { EnquiryFormPage } from '../../pages/EnquiryFormPage';
import { logger } from '../../utils/logger';
import negativeData from '../../test-data/GEGenquiryFormNegativeData.json';

const FORM_URL = 'https://www.godrejenterprises.com/inquiry';

// ══════════════════════════════════════════════════════════════════════════════
// Name Field Validation
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Name Field Validation', () => {

  test('TC07 - Should show error when name is empty', async ({ page }) => {
    logger.info('=== TC07: Name empty validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.nameInput.click();
    await enquiryPage.nameInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.nameError, negativeData.invalidName.expectedErrorRequired);
  });

  test('TC08 - Should show error when name is too short', async ({ page }) => {
    logger.info('=== TC08: Name too short validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.fillName(negativeData.invalidName.tooShort);
    await enquiryPage.nameInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.nameError, negativeData.invalidName.expectedErrorMin);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Email Field Validation
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Email Field Validation', () => {

  test('TC09 - Should show error when email is empty', async ({ page }) => {
    logger.info('=== TC09: Email empty validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.emailInput.click();
    await enquiryPage.emailInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.emailError, negativeData.invalidEmail.expectedErrorRequired);
  });

  test('TC10 - Should show error when email is too short (less than 5 characters)', async ({ page }) => {
    logger.info('=== TC10: Email too short validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.fillEmail(negativeData.invalidEmail.tooShort);
    await enquiryPage.emailInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.emailError, negativeData.invalidEmail.expectedErrorMin);
  });

  test('TC11 - Should show error when email format is invalid (missing domain)', async ({ page }) => {
    logger.info('=== TC11: Email invalid format - missing domain ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.fillEmail(negativeData.invalidEmail.invalidFormat1);
    await enquiryPage.emailInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.emailError, negativeData.invalidEmail.expectedErrorInvalid);
  });

  test('TC12 - Should show error when email format is invalid (missing @)', async ({ page }) => {
    logger.info('=== TC12: Email invalid format - missing @ ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.fillEmail(negativeData.invalidEmail.invalidFormat2);
    await enquiryPage.emailInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.emailError, negativeData.invalidEmail.expectedErrorInvalid);
  });

  test('TC13 - Should show error when email format is invalid (missing username)', async ({ page }) => {
    logger.info('=== TC13: Email invalid format - missing username ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.fillEmail(negativeData.invalidEmail.invalidFormat3);
    await enquiryPage.emailInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.emailError, negativeData.invalidEmail.expectedErrorInvalid);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Mobile Field Validation
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Mobile Field Validation', () => {

  test('TC14 - Should show error when mobile number is empty', async ({ page }) => {
    logger.info('=== TC14: Mobile number empty ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.selectCountryCode(negativeData.validData.countryCode);
    await enquiryPage.mobileInput.click();
    await enquiryPage.mobileInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.mobileError, negativeData.invalidMobile.expectedErrorRequired);
  });

  test('TC15 - Should show error when mobile number is too short', async ({ page }) => {
    logger.info('=== TC15: Mobile number too short ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.selectCountryCode(negativeData.validData.countryCode);
    await enquiryPage.fillMobile(negativeData.invalidMobile.tooShort);
    await enquiryPage.mobileInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.mobileError, negativeData.invalidMobile.expectedErrorMin);
  });

  test('TC16 - Should show error when mobile number is too long', async ({ page }) => {
    logger.info('=== TC16: Mobile number too long ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.selectCountryCode(negativeData.validData.countryCode);
    await enquiryPage.fillMobile(negativeData.invalidMobile.tooLong);
    await enquiryPage.mobileInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.mobileError, negativeData.invalidMobile.expectedErrorMax);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// City Field Validation
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - City Field Validation', () => {

  test('TC17 - Should show error when city is empty', async ({ page }) => {
    logger.info('=== TC17: City empty validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.cityInput.click();
    await enquiryPage.cityInput.press('Tab');

    await enquiryPage.assertErrorMessageContains(enquiryPage.cityError, negativeData.invalidCity.expectedErrorRequired);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Message Field Validation (Optional Field)
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Message Field Validation', () => {

  test('TC18 - Should show error when message contains invalid characters', async ({ page }) => {
    logger.info('=== TC18: Message with invalid characters validation ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    await enquiryPage.fillMessage(negativeData.invalidMessage.withInvalidChars);
    await enquiryPage.messageInput.press('Tab');

    await enquiryPage.assertErrorMessage(enquiryPage.messageError, negativeData.invalidMessage.expectedError);
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Optional Fields Validation
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Enquiry Form - Optional Fields', () => {

  test('TC19 - Should submit form successfully without message and file (optional fields)', async ({ page }) => {
    logger.info('=== TC19: Submit form without optional fields ===');

    const enquiryPage = new EnquiryFormPage(page);
    await enquiryPage.goto(FORM_URL);

    // Fill only mandatory fields
    await enquiryPage.fillName(negativeData.validData.name);
    await enquiryPage.fillEmail(negativeData.validData.email);
    await enquiryPage.selectCountryCode(negativeData.validData.countryCode);
    await enquiryPage.fillMobile(negativeData.validData.mobile);
    await enquiryPage.fillCityWithAutoSuggest(negativeData.validData.city, negativeData.validData.cityExpected);
    await enquiryPage.selectBusinessUnit(negativeData.validData.businessUnit);
    await enquiryPage.selectBusinessCategory(negativeData.validData.businessCategory);

    // Skip message and file (optional fields)
    await enquiryPage.submitForm();
    await enquiryPage.assertFormSubmittedSuccessfully();
  });

});
