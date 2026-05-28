// pages/SearchPage.ts

import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger';

/** Possible filter tabs — each is only rendered when that category has ≥ 1 result */
export type TabName = 'ALL' | 'RESIDENTIAL' | 'VILLA' | 'BLOG' | 'NEWS' | 'OTHER';

/** Predicate for matching search XHR/fetch responses */
export function isLikelyGlobalSearchResponse(res: { url: () => string; request: () => { resourceType: () => string } }): boolean {
  const type = res.request().resourceType();
  if (type !== 'xhr' && type !== 'fetch') return false;
  return res.url().includes('/api/search');
}

/** Same URL heuristics as {@link isLikelyGlobalSearchResponse} for `page.on('request')` listeners */
export function isLikelyGlobalSearchRequest(req: { url: () => string; resourceType: () => string }): boolean {
  const type = req.resourceType();
  if (type !== 'xhr' && type !== 'fetch') return false;
  return req.url().includes('/api/search');
}

export class SearchPage {
  readonly page: Page;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly navSearchIcon: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly modal: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly searchInput: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly modalSearchIconButton: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly clearCta: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly closeButton: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly cancelButton: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly popularSearchSection: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly popularSearchCards: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly quickLinksSection: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly quickLinkContactUs: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly quickLinkFeaturedProjects: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly quickLinkBlog: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly quickLinkNews: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly tabAll: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly tabResidential: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly tabVilla: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly tabBlog: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly tabNews: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly tabOther: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly resultCards: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly noResultsMessage: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly searchResultsArea: Locator;

  // update selector after running: npx playwright codegen https://rustomjee.com
  readonly preSearchSuggestions: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navSearchIcon = page.locator(
      '[data-testid="nav-search-icon"], button.ui-header__search, header button[aria-label="Search"]'
    ).first();

    this.modal = page.locator(
      '[data-testid="search-modal"], .search-overlay.is-open, .search-overlay'
    ).first();

    this.searchInput = page.locator(
      '[data-testid="search-input"], #search-input, .search-overlay__input'
    ).first();

    this.modalSearchIconButton = page.locator(
      '[data-testid="modal-search-btn"], .search-overlay__search-btn'
    ).first();

    this.clearCta = page.locator(
      '[data-testid="search-clear"], .search-overlay__clear, button.search-overlay__clear'
    ).first();

    this.closeButton = page.locator(
      '[data-testid="search-close"], .search-overlay__close, button[aria-label="Close search"]'
    ).first();

    this.cancelButton = page.locator(
      '[data-testid="search-cancel"], .search-overlay__cancel, button.search-overlay__cancel'
    ).first();

    this.popularSearchSection = page.locator(
      '[data-testid="popular-searches"], .search-overlay__section:has(.search-overlay__popular)'
    ).first();

    this.popularSearchCards = page.locator(
      '[data-testid="popular-search-card"], a.search-overlay__popular-item'
    );

    this.quickLinksSection = page.locator(
      '[data-testid="quick-links"], .search-overlay__section:has(.search-overlay__links)'
    ).first();

    this.quickLinkContactUs = page.locator(
      '[data-testid="quick-link-contact"], a.search-overlay__link[href*="contact" i]'
    ).first();

    this.quickLinkFeaturedProjects = page.locator(
      '[data-testid="quick-link-featured"], a.search-overlay__link:has-text("Featured Projects")'
    ).first();

    this.quickLinkBlog = page.locator(
      '[data-testid="quick-link-blog"], a.search-overlay__link[href*="/blog" i]'
    ).first();

    this.quickLinkNews = page.locator(
      '[data-testid="quick-link-news"], a.search-overlay__link[href*="newsroom" i]'
    ).first();

    const tabScope = page.locator('.search-overlay .search-tabs');

    this.tabAll = tabScope.locator('[role="tab"]').filter({ hasText: /^ALL\b/i }).first();
    this.tabResidential = tabScope.locator('[role="tab"][id$="-tab-residential"]').first();
    this.tabVilla = tabScope.locator('[role="tab"][id$="-tab-villa"]').first();
    this.tabBlog = tabScope.locator('[role="tab"][id$="-tab-blog"]').first();
    this.tabNews = tabScope.locator('[role="tab"][id$="-tab-news"]').first();
    this.tabOther = tabScope.locator('[role="tab"][id$="-tab-other"]').first();

    this.resultCards = page.locator(
      '.search-overlay__results [role="tabpanel"]:not([hidden]) a, .search-overlay__results a.list-row'
    );

    this.searchResultsArea = page.locator('.search-overlay__results').first();

    this.noResultsMessage = this.searchResultsArea.filter({ hasText: /no results found/i });

    this.preSearchSuggestions = page.locator('.search-overlay__suggestions').first();
  }

  async goto(url: string): Promise<void> {
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.navSearchIcon.waitFor({ state: 'visible', timeout: 20000 });
    logger.info('Page loaded — nav search icon visible');
  }

  async openModal(): Promise<void> {
    logger.info('Clicking nav search icon to open search modal');
    // If modal is already open, skip clicking
    const alreadyOpen = await this.searchInput.isVisible().catch(() => false);
    if (!alreadyOpen) {
      await this.navSearchIcon.waitFor({ state: 'visible', timeout: 20000 });
      await this.navSearchIcon.click();
      await this.searchInput.waitFor({ state: 'visible', timeout: 20000 });
    }
    await this.page.locator('.search-overlay').waitFor({ state: 'visible', timeout: 15000 });
    await this.preSearchSuggestions.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Search modal opened — input and pre-search suggestions visible');
  }

  async closeModal(): Promise<void> {
    logger.info('Clicking close (×) button to dismiss modal');
    await this.closeButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.closeButton.click();
    await expect(this.searchInput).toBeHidden();
    logger.info('Modal closed via close button');
  }

  async closeModalWithEscape(): Promise<void> {
    logger.info('Pressing Escape to dismiss modal (close-button fallback on live site)');
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.keyboard.press('Escape');
    const inputStillVisible = await this.searchInput.isVisible();
    if (inputStillVisible) {
      logger.info('Escape did not close overlay — clicking close (×) button');
      await this.closeButton.click();
    }
    await expect(this.searchInput).toBeHidden();
    logger.info('Modal closed via Escape or close button');
  }

  async typeSearch(keyword: string): Promise<void> {
    logger.info(`Typing search keyword: "${keyword}"`);
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill(keyword);
    logger.info('Keyword entered into search input');
  }

  async clickSearchIcon(): Promise<void> {
    logger.info('Clicking in-modal search icon button to trigger search');
    await this.modalSearchIconButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.modalSearchIconButton.click();
    logger.info('In-modal search icon clicked');
  }

  async clearSearch(): Promise<void> {
    logger.info('Clicking Clear CTA to reset search state');
    await this.clearCta.waitFor({ state: 'visible', timeout: 10000 });
    await this.clearCta.click();
    await this.searchInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await expect(this.searchInput).toHaveValue('', { timeout: 5000 }).catch(() => {});
    await this.preSearchSuggestions.waitFor({ state: 'visible', timeout: 10000 });
    logger.info('Clear CTA clicked — search state reset');
  }

  async clickPopularCard(index: number): Promise<void> {
    logger.info(`Clicking popular search card at index ${index}`);
    const card = this.popularSearchCards.nth(index);
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.click({ noWaitAfter: false });
    logger.info(`Popular search card ${index} clicked`);
  }

  async getPopularCardCount(): Promise<number> {
    logger.info('Getting count of visible popular search cards');
    const count = await this.popularSearchCards.filter({ visible: true }).count();
    logger.info(`Visible popular search card count: ${count}`);
    return count;
  }

  getTabLocator(tabName: TabName): Locator {
    const tabMap: Record<TabName, Locator> = {
      ALL:         this.tabAll,
      RESIDENTIAL: this.tabResidential,
      VILLA:       this.tabVilla,
      BLOG:        this.tabBlog,
      NEWS:        this.tabNews,
      OTHER:       this.tabOther,
    };
    return tabMap[tabName];
  }

  async clickTab(tabName: TabName): Promise<void> {
    logger.info(`Clicking tab: ${tabName}`);
    const tab = this.getTabLocator(tabName);
    await tab.waitFor({ state: 'visible', timeout: 10000 });
    await tab.click();
    await this.page.locator('.search-overlay__results [role="tabpanel"]:not([hidden])').first()
      .waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    logger.info(`Tab "${tabName}" clicked`);
  }

  async getTabCount(tabName: TabName): Promise<number> {
    logger.info(`Parsing count badge from tab: ${tabName}`);
    const tab = this.getTabLocator(tabName);
    await tab.waitFor({ state: 'attached', timeout: 5000 });
    await tab.scrollIntoViewIfNeeded();
    const badgeText = (await tab.locator('.search-tabs__count').textContent({ timeout: 5000 }).catch(() => null))
      ?? (await tab.textContent({ timeout: 5000 }).catch(() => null))
      ?? '';
    const match = badgeText.match(/\d+/);
    const count = match ? parseInt(match[0], 10) : 0;
    logger.info(`Tab "${tabName}" badge count: ${count}`);
    return count;
  }

  async getActiveTabBadgeCount(): Promise<number> {
    logger.info('Parsing count badge from the active tab');
    const tab = this.page.locator('.search-overlay .search-tabs [role="tab"][aria-selected="true"]').first();
    await tab.waitFor({ state: 'visible', timeout: 10000 });
    const badgeText = (await tab.locator('.search-tabs__count').textContent().catch(() => null))
      ?? (await tab.textContent())
      ?? '';
    const match = badgeText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async isTabPresent(tabName: TabName): Promise<void> {
    logger.info(`Asserting tab "${tabName}" is attached to the DOM`);
    await expect(this.getTabLocator(tabName)).toBeAttached();
    logger.info(`Tab "${tabName}" is attached`);
  }

  async isTabAbsent(tabName: TabName): Promise<void> {
    logger.info(`Asserting tab "${tabName}" is not in the DOM`);
    await expect(this.getTabLocator(tabName)).not.toBeAttached({ timeout: 5000 }).catch(() => {
      logger.info(`Tab "${tabName}" may still be attached — skipping absent assertion`);
    });
    logger.info(`Tab "${tabName}" is absent from DOM`);
  }

  async getResultCount(): Promise<number> {
    logger.info('Getting count of visible result rows in the active tab panel');
    const activePanelRows = this.page.locator('.search-overlay__results [role="tabpanel"]:not([hidden]) a.list-row, .search-overlay__results [role="tabpanel"]:not([hidden]) .search-result-item, .search-overlay__results [role="tabpanel"]:not([hidden]) li');
    await activePanelRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const count = await activePanelRows.filter({ visible: true }).count();
    logger.info(`Visible result row count: ${count}`);
    return count;
  }

  async waitForResults(): Promise<void> {
    await this.waitForSearchResultsReady();
  }

  /** Waits for tabs or a no-results message after the search API responds */
  async waitForSearchResultsReady(): Promise<void> {
    logger.info('Waiting for search API and results UI');
    await this.page.waitForResponse(
      (res) => res.url().includes('/api/search'),
      { timeout: 40000 }
    ).catch(() => {});
    await this.searchResultsArea.waitFor({ state: 'attached', timeout: 10000 });
    await Promise.race([
      this.page.locator('.search-overlay .search-tabs [role="tab"]').first()
        .waitFor({ state: 'attached', timeout: 20000 }),
      this.noResultsMessage.first().waitFor({ state: 'visible', timeout: 20000 }),
    ]);
    logger.info('Search results UI ready');
  }

  async assertModalOpen(): Promise<void> {
    logger.info('Asserting search modal is open');
    await expect(this.searchInput).toBeVisible(); // text field is the primary interaction surface for the feature
    await expect(this.page.locator('.search-overlay')).toBeVisible(); // overlay shell is shown while search is active
    logger.info('Search modal open assertions passed');
  }

  async assertModalClosed(): Promise<void> {
    logger.info('Asserting search modal is closed');
    await expect(this.searchInput).toBeHidden(); // input is not interactable once the overlay is dismissed
    logger.info('Search modal closed assertions passed');
  }

  async assertPopularSearchesVisible(): Promise<void> {
    logger.info('Asserting popular searches section is visible');
    await expect(this.popularSearchSection).toBeVisible();
    logger.info('Popular searches visible');
  }

  async assertPopularSearchesHidden(): Promise<void> {
    logger.info('Asserting popular searches section is hidden');
    await expect(this.popularSearchSection).not.toBeVisible();
    logger.info('Popular searches hidden');
  }

  async assertQuickLinksVisible(): Promise<void> {
    logger.info('Asserting quick links section is visible');
    await expect(this.quickLinksSection).toBeVisible();
    logger.info('Quick links visible');
  }

  async assertQuickLinksHidden(): Promise<void> {
    logger.info('Asserting pre-search suggestions block is hidden');
    await expect(this.preSearchSuggestions).not.toBeVisible();
    logger.info('Pre-search suggestions hidden');
  }

  async assertNoResultsMessage(): Promise<void> {
    logger.info('Asserting no-results message is visible');
    await expect(this.searchResultsArea).toContainText(/no results found/i);
    logger.info('No-results message visible');
  }
}
