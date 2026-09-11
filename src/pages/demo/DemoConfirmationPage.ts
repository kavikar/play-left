import type { Locator, Page } from '@playwright/test';

export interface DemoOrderDetails {
  reference: string;
  total: string;
}

export class DemoConfirmationPage {
  readonly page: Page;
  readonly header: Locator;
  readonly orderRef: Locator;
  readonly orderTotal: Locator;
  readonly backToProducts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByTestId('complete-header');
    this.orderRef = page.getByTestId('order-ref');
    this.orderTotal = page.getByTestId('order-total');
    this.backToProducts = page.getByTestId('back-to-products');
  }

  /** Read the confirmation so a test can attach it as evidence. */
  async details(): Promise<DemoOrderDetails> {
    return {
      reference: (await this.orderRef.textContent())?.trim() ?? '',
      total: (await this.orderTotal.textContent())?.trim() ?? '',
    };
  }
}
