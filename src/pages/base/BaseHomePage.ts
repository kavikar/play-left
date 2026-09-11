import type { Locator, Page } from '@playwright/test';

/**
 * Shared header and footer chrome.
 *
 * Everything here is brand-agnostic: these controls appear on every brand's
 * home page with the same accessible names. Brand differences belong in a
 * small subclass override, not in a forked copy of this file.
 */
export class BaseHomePage {
  readonly page: Page;

  // Header
  readonly skipToMainContent: Locator;
  readonly signInButton: Locator;
  readonly orderPickupButton: Locator;
  readonly orderDeliveryButton: Locator;
  readonly bagButton: Locator;
  readonly orderNowCta: Locator;

  // Footer
  readonly nutritionInfoLink: Locator;
  readonly privacyPolicyLink: Locator;
  readonly cookieSettingsLink: Locator;
  readonly termsOfUseLink: Locator;
  readonly accessibilityLink: Locator;
  readonly privacyChoicesLink: Locator;
  readonly consumerHealthDataLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.skipToMainContent = page.getByRole('link', { name: /skip to main content/i });
    this.signInButton = page.getByRole('button', { name: /sign in|enroll/i });
    this.orderPickupButton = page.getByRole('button', { name: /order pickup/i });
    this.orderDeliveryButton = page.getByRole('button', { name: /order delivery/i });
    this.bagButton = page.getByRole('button', { name: 'Bag' });

    // "Order Now" appears in both the hero and the sticky header on most brands.
    // .first() is deliberate, not a workaround for a bad locator.
    this.orderNowCta = page.getByRole('link', { name: /order now/i }).first();

    this.nutritionInfoLink = page.getByRole('link', { name: /nutrition|allergen/i });
    this.privacyPolicyLink = page.getByRole('link', { name: /privacy policy/i });
    this.cookieSettingsLink = page.getByRole('link', { name: /cookie settings/i });
    this.termsOfUseLink = page.getByRole('link', { name: /terms of use/i });
    this.accessibilityLink = page.getByRole('link', { name: /accessibility/i });
    this.privacyChoicesLink = page.getByRole('link', { name: /privacy choices/i });
    this.consumerHealthDataLink = page.getByRole('link', { name: /consumer health data/i });
  }

  /**
   * Navigate to the brand root and wait for the bag control.
   *
   * The bag is the readiness signal rather than a `networkidle` wait: these
   * apps poll in the background, so `networkidle` either never settles or
   * settles long after the page is usable.
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.bagButton.waitFor({ state: 'visible' });
  }

  /** Named chrome elements, for a smoke assertion loop that reports which one failed. */
  visibleChrome(): { name: string; locator: Locator }[] {
    return [
      { name: 'Sign in', locator: this.signInButton },
      { name: 'Bag', locator: this.bagButton },
      { name: 'Privacy policy', locator: this.privacyPolicyLink },
      { name: 'Terms of use', locator: this.termsOfUseLink },
      { name: 'Accessibility', locator: this.accessibilityLink },
    ];
  }
}
