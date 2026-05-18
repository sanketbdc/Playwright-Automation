// tests/rustomjee/rustomjee-enquiry-form.spec.ts

import { test, expect } from '@playwright/test';
import { RustomjeeEnquiryFormPage } from '../../pages/RustomjeeEnquiryFormPage';
import { logger } from '../../utils/logger';
import formData from '../../test-data/rustomjeeEnquiryFormData.json';

// ══════════════════════════════════════════════════════════════════════════════
// Happy Path — Full enquiry form submission
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Rustomjee Cliff Tower - Enquiry Form', () => {

  test('TC01 - Should open enquiry form modal when ENQUIRE CTA is clicked', async ({ page }) => {
    logger.info('=== TC01: Verify ENQUIRE CTA opens the modal ===');

    const enquiryPage = new RustomjeeEnquiryFormPage(page);
    await enquiryPage.goto(formData.pdpUrl);

    await enquiryPage.clickEnquireCta();
    await enquiryPage.assertModalOpen();

    logger.info('TC01 passed: Enquiry form modal opened successfully');
  });

  test('TC02 - Should fill and submit the enquiry form successfully', async ({ page }) => {
    logger.info('=== TC02: Full enquiry form submission ===');

    const enquiryPage = new RustomjeeEnquiryFormPage(page);
    await enquiryPage.goto(formData.pdpUrl);

    // Step 1: Open the form
    await enquiryPage.clickEnquireCta();
    await enquiryPage.assertModalOpen();

    // Step 2: Fill Name
    await enquiryPage.fillName(formData.name);

    // Step 3: Fill Phone — OTP is sent automatically after phone entry
    await enquiryPage.fillPhone(formData.phone);

    // Step 4: Fill OTP once it appears
    await enquiryPage.fillOtp(formData.otp);

    // Step 5: Fill Email
    await enquiryPage.fillEmail(formData.email);

    // Step 6: Toggle WhatsApp checkbox
    await enquiryPage.toggleWhatsapp(formData.whatsapp);

    // Step 7: Submit
    await enquiryPage.submitForm();

    // Step 8: Verify success
    await enquiryPage.assertFormSubmittedSuccessfully();

    logger.info('TC02 passed: Enquiry form submitted successfully');
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// Form Field Verification
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Rustomjee Cliff Tower - Form Field Verification', () => {

  test('TC03 - Should display correct form title and subtitle', async ({ page }) => {
    logger.info('=== TC03: Verify form title and subtitle ===');

    const enquiryPage = new RustomjeeEnquiryFormPage(page);
    await enquiryPage.goto(formData.pdpUrl);
    await enquiryPage.clickEnquireCta();

    await expect(enquiryPage.formTitle).toContainText(formData.expectedFormTitle);
    await expect(enquiryPage.formSubtitle).toContainText(formData.expectedFormSubtitle);

    logger.info('TC03 passed: Form title and subtitle verified');
  });

  test('TC04 - Should have all required form fields visible', async ({ page }) => {
    logger.info('=== TC04: Verify all form fields are visible ===');

    const enquiryPage = new RustomjeeEnquiryFormPage(page);
    await enquiryPage.goto(formData.pdpUrl);
    await enquiryPage.clickEnquireCta();
    await enquiryPage.assertModalOpen();

    await expect(enquiryPage.nameInput).toBeVisible();
    await expect(enquiryPage.phoneInput).toBeVisible();
    await expect(enquiryPage.emailInput).toBeVisible();
    await expect(enquiryPage.whatsappCheckbox).toBeVisible();
    await expect(enquiryPage.submitButton).toBeVisible();

    logger.info('TC04 passed: All form fields are visible');
  });

  test('TC05 - Should have WhatsApp checkbox toggleable', async ({ page }) => {
    logger.info('=== TC05: Verify WhatsApp checkbox toggle ===');

    const enquiryPage = new RustomjeeEnquiryFormPage(page);
    await enquiryPage.goto(formData.pdpUrl);
    await enquiryPage.clickEnquireCta();
    await enquiryPage.assertModalOpen();

    await enquiryPage.toggleWhatsapp(true);
    await expect(enquiryPage.whatsappCheckbox).toBeChecked();
    logger.info('WhatsApp checkbox is checked');

    await enquiryPage.toggleWhatsapp(false);
    await expect(enquiryPage.whatsappCheckbox).not.toBeChecked();
    logger.info('WhatsApp checkbox is unchecked');

    logger.info('TC05 passed: WhatsApp checkbox toggle works correctly');
  });

});
