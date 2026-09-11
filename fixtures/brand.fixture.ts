import { test as base } from '@playwright/test';

import { getBrandConfig } from '../brands';
import type { BrandConfig, BrandId } from '../brands';

/**
 * Brand is injected as a typed Playwright project option, never inferred by
 * parsing the project name. Name-parsing breaks the moment someone adds a
 * `brand-one-chromium-mobile` project, and it gives you `string` where you
 * want `BrandId`.
 */
export interface BrandOptions {
  brand: BrandId;
}

export interface BrandFixtures {
  brandConfig: BrandConfig;
}

export const test = base.extend<BrandOptions & BrandFixtures>({
  brand: ['brand-one', { option: true }],

  brandConfig: async ({ brand }, use) => {
    await use(getBrandConfig(brand));
  },

  /**
   * Consent banners render asynchronously, often after first paint and
   * sometimes mid-interaction. A locator handler dismisses it whenever it
   * appears instead of every spec racing it with an explicit wait.
   */
  page: async ({ page }, use) => {
    await page.addLocatorHandler(
      page.locator('#consent-banner-button-primary'),
      async (banner) => {
        // force: the banner animates in, and an overlay mid-transition makes
        // Playwright's actionability check fail on an element that is, in
        // practice, clickable.
        await banner.click({ force: true, timeout: 5_000 }).catch(() => {
          // The banner can vanish on its own between detection and click.
          // That is the outcome we wanted anyway.
        });
      },
    );

    await use(page);
  },
});

export { expect } from '@playwright/test';
