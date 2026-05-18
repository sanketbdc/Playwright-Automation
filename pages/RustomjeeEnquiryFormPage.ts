// pages/RustomjeeEnquiryFormPage.ts

import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger';

export class RustomjeeEnquiryFormPage {
  readonly page: Page;

  // ── PDP Sub-navigation ────────────────────────────────────────────────
  readonly enquireCta: Locator;

  // ── Modal ─────────────────────────────────────────────────────────────
  readonly modal: Locator;
  readonly formTitle: Locator;
  readonly formSubtitle: Locator;
  readonly closeModalButton: Locator;

  // ── Form fields ───────────────────────────────────────────────────────
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly otpInput: Locator;
  readonly emailInput: Locator;
  readonly whatsappCheckbox: Locator;
  readonly submitButton: Locator;

  // ── OTP confirmation ──────────────────────────────────────────────────
  readonly otpSentConfirmation: Locator;

  // ── Post-submit ───────────────────────────────────────────────────────
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // PDP sub-nav ENQUIRE button — exact class from DOM
    this.enquireCta = page.locator('button.ui-enquire-modal__trigger');

    // Modal — role="dialog" confirmed in snapshot
    this.modal            = page.locator('dialog');
    this.formTitle        = this.modal.locator('h3');
    this.formSubtitle     = this.modal.locator('p').filter({ hasText: 'Fill out the form' });
    this.closeModalButton = this.modal.locator('button[aria-label="Close modal"]');

    // Form fields — exact id/name from DOM
    this.nameInput        = this.modal.locator('input#name');
    this.phoneInput       = this.modal.locator('input#mobile');
    this.otpInput         = this.modal.locator('input#otp');
    this.emailInput       = this.modal.locator('input#email');
    this.whatsappCheckbox = this.modal.locator('input[name="consent"]');
    this.submitButton     = this.modal.locator('button[type="submit"]');

    // OTP is sent automatically after phone is filled — "OTP sent successfully" appears
    this.otpSentConfirmation = this.modal.locator('p').filter({ hasText: /otp sent successfully/i });

    // Success — submit button hides after successful submission
    this.successMessage = this.modal.locator('p, div').filter({ hasText: /get in touch with you soon/i }).first();
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async goto(url: string): Promise<void> {
    logger.info(`Navigating to Rustomjee PDP: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    logger.info('Page loaded');
  }

  // ── PDP Sub-nav ─────────────────────────────────────────────────────────

  async clickEnquireCta(): Promise<void> {
    logger.info('Clicking ENQUIRE CTA in PDP sub-navigation');
    await this.enquireCta.waitFor({ state: 'visible', timeout: 10000 });
    await this.enquireCta.scrollIntoViewIfNeeded();
    await this.enquireCta.click();
    await this.modal.waitFor({ state: 'visible', timeout: 10000 });
    logger.info('ENQUIRE CTA clicked — modal opened');
  }

  // ── Modal verification ──────────────────────────────────────────────────

  async assertModalOpen(): Promise<void> {
    logger.info('Asserting enquiry form modal is open');
    await expect(this.modal).toBeVisible();
    await expect(this.formTitle).toBeVisible();
    await expect(this.formSubtitle).toBeVisible();
    logger.info(`Modal open — title: "${await this.formTitle.textContent()}"`);
  }

  // ── Form field helpers ──────────────────────────────────────────────────

  async fillName(name: string): Promise<void> {
    logger.info(`Filling Name: ${name}`);
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nameInput.fill(name);
  }

  async fillPhone(phone: string): Promise<void> {
    logger.info(`Filling Phone: ${phone}`);
    await this.phoneInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.phoneInput.fill(phone);
    // OTP is sent automatically after phone is filled — wait for confirmation
    await this.otpSentConfirmation.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('OTP sent automatically after phone entry');
  }

  async fillOtp(otp: string): Promise<void> {
    logger.info(`Filling OTP: ${otp}`);
    await this.otpInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.otpInput.fill(otp);
  }

  async fillEmail(email: string): Promise<void> {
    logger.info(`Filling Email: ${email}`);
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);
  }

  async toggleWhatsapp(enable: boolean): Promise<void> {
    logger.info(`WhatsApp checkbox — setting to: ${enable}`);
    const isChecked = await this.whatsappCheckbox.isChecked();
    if (enable && !isChecked) {
      await this.whatsappCheckbox.check();
      logger.info('WhatsApp checkbox checked');
    } else if (!enable && isChecked) {
      await this.whatsappCheckbox.uncheck();
      logger.info('WhatsApp checkbox unchecked');
    } else {
      logger.info(`WhatsApp checkbox already in desired state: ${enable}`);
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async submitForm(): Promise<void> {
    logger.info('Waiting for Submit button to be enabled');
    await expect(this.submitButton).toBeEnabled({ timeout: 15000 });
    logger.info('Clicking SUBMIT button');
    await Promise.all([
      this.page.waitForResponse(
        res => res.request().method() === 'POST' && res.status() < 500,
        { timeout: 30000 }
      ),
      this.submitButton.click(),
    ]);
    logger.info('Form submitted — response received');
  }

  // ── Success assertion ───────────────────────────────────────────────────

  async assertFormSubmittedSuccessfully(): Promise<void> {
    logger.info('Asserting form submission success');
    try {
      await this.submitButton.waitFor({ state: 'hidden', timeout: 30000 });
      logger.info('Submit button hidden — form submitted successfully');
    } catch {
      const bodyText = await this.page.locator('body').textContent();
      const isSuccess = bodyText?.toLowerCase().includes('thank') ||
                        bodyText?.toLowerCase().includes('get in touch');
      expect(isSuccess).toBe(true);
      logger.info('Success state confirmed via body text');
    }
  }
}
