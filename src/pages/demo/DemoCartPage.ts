import type { Locator, Page } from '@playwright/test';

export class DemoCartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly list: Locator;
  readonly empty: Locator;
  readonly checkout: Locator;
  readonly continueShopping: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByTestId('page-title');
    this.list = page.getByTestId('cart-list');
    this.empty = page.getByTestId('cart-empty');
    this.checkout = page.getByTestId('checkout');
    this.continueShopping = page.getByTestId('continue-shopping');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
    await this.heading.waitFor({ state: 'visible' });
  }

  lineItem(id: string): Locator {
    return this.list.getByTestId(`cart-item-${id}`);
  }

  async remove(id: string): Promise<void> {
    await this.page.getByTestId(`cart-remove-${id}`).click();
  }

  async itemNames(): Promise<string[]> {
    return this.list.getByTestId('cart-item-name').allTextContents();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkout.click();
    await this.page.waitForURL(/checkout\.html$/);
  }
}
