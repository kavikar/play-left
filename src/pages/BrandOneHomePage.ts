import type { Locator, Page } from '@playwright/test';

import { BaseHomePage } from './base/BaseHomePage';

/**
 * Brand One's home page.
 *
 * Illustrates the intended override shape: inherit the shared chrome, add only
 * what is genuinely brand-specific. When this class grows past a handful of
 * members, the addition probably belongs in BaseHomePage instead.
 */
export class BrandOneHomePage extends BaseHomePage {
  readonly rewardsNavLink: Locator;
  readonly storeSelectorButton: Locator;

  constructor(page: Page) {
    super(page);

    this.rewardsNavLink = page.getByRole('link', { name: /rewards/i });

    // Brand One surfaces the selected store in the header; the accessible name
    // includes the store address once one is chosen, hence the prefix match.
    this.storeSelectorButton = page.getByRole('button', { name: /^store:/i });
  }

  async openRewards(): Promise<void> {
    await this.rewardsNavLink.click();
    await this.page.waitForURL(/rewards/i);
  }
}
