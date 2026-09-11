import type { Locator, Page } from '@playwright/test';

/**
 * Sign-in for the demo storefront.
 *
 * Credentials are the ones the app prints on its own login page — this target
 * exists to be signed into. They still come from the environment so the shape
 * matches every other brand, where they must.
 */
export class DemoLoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
    this.heading = page.getByTestId('page-title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/index.html');
    await this.submit.waitFor({ state: 'visible' });
  }

  async signIn(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }

  /** Sign in and wait for the inventory page to actually be reached. */
  async signInAs(user: string, pass: string): Promise<void> {
    await this.signIn(user, pass);
    await this.page.waitForURL(/inventory\.html$/);
  }
}
