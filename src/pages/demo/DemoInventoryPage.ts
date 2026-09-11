import type { Locator, Page } from '@playwright/test';

export type SortMode = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export class DemoInventoryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly sort: Locator;
  readonly list: Locator;
  readonly cartLink: Locator;
  readonly cartCount: Locator;
  readonly signOut: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByTestId('page-title');
    this.sort = page.getByTestId('product-sort');
    this.list = page.getByTestId('inventory-list');
    this.cartLink = page.getByTestId('cart-link');
    this.cartCount = page.getByTestId('cart-count');
    this.signOut = page.getByTestId('logout');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
    await this.heading.waitFor({ state: 'visible' });
  }

  /** Scoped to the list, so a stray card elsewhere on the page cannot match. */
  item(id: string): Locator {
    return this.list.getByTestId(`item-${id}`);
  }

  async addToCart(id: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${id}`).click();
  }

  async removeFromCart(id: string): Promise<void> {
    await this.page.getByTestId(`remove-${id}`).click();
  }

  async sortBy(mode: SortMode): Promise<void> {
    await this.sort.selectOption(mode);
  }

  /** Product names in the order the page is currently rendering them. */
  async visibleNames(): Promise<string[]> {
    return this.list.getByTestId('item-name').allTextContents();
  }

  /** Prices as numbers, in render order, for ordering assertions. */
  async visiblePrices(): Promise<number[]> {
    const raw = await this.list.getByTestId('item-price').allTextContents();
    return raw.map((t) => Number(t.replace(/[^0-9.]/g, '')));
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL(/cart\.html$/);
  }
}
