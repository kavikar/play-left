import type { Locator, Page } from '@playwright/test';

export interface DemoContact {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class DemoCheckoutPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finish: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByTestId('page-title');
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.postalCode = page.getByTestId('postal-code');
    this.subtotal = page.getByTestId('subtotal');
    this.tax = page.getByTestId('tax');
    this.total = page.getByTestId('total');
    this.finish = page.getByTestId('finish');
    this.error = page.getByTestId('error');
  }

  async fillContact(contact: DemoContact): Promise<void> {
    await this.firstName.fill(contact.firstName);
    await this.lastName.fill(contact.lastName);
    await this.postalCode.fill(contact.postalCode);
  }

  /** Money text parsed to a number, for arithmetic assertions. */
  async amounts(): Promise<{ subtotal: number; tax: number; total: number }> {
    const read = async (l: Locator) =>
      Number((await l.textContent())?.replace(/[^0-9.]/g, '') ?? NaN);
    return {
      subtotal: await read(this.subtotal),
      tax: await read(this.tax),
      total: await read(this.total),
    };
  }

  async placeOrder(): Promise<void> {
    await this.finish.click();
    await this.page.waitForURL(/complete\.html$/);
  }

  /** Submit without navigating — for validation cases that must stay put. */
  async submitExpectingValidationError(): Promise<void> {
    await this.finish.click();
  }
}
