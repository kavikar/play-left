import type { Page, TestInfo } from '@playwright/test';

import type { BrandConfig } from '../../brands';
import {
  DemoCartPage,
  DemoCheckoutPage,
  DemoConfirmationPage,
  DemoInventoryPage,
  DemoLoginPage,
} from '../pages/demo';
import type { DemoContact, DemoOrderDetails } from '../pages/demo';
import { getDemoCredentials } from '../config/demoCredentials';

/**
 * Orchestration for the demo storefront's purchase journey.
 *
 * This is the pattern the real GuestCheckoutFlow follows: specs describe
 * intent, the flow owns the sequence, page objects own the selectors. A spec
 * that needs "signed in, two items, order placed" should not spell out nine
 * navigation steps to get there.
 */

export interface DemoCheckoutOptions {
  brandConfig: BrandConfig;
  productIds: string[];
  contact?: DemoContact;
  /** Stop before submitting — for tests that assert on the checkout page. */
  placeOrder?: boolean;
  /** When given, the confirmation is attached to the test as evidence. */
  testInfo?: TestInfo;
}

export interface DemoCheckoutResult {
  checkout: DemoCheckoutPage;
  confirmation?: DemoOrderDetails;
}

const DEFAULT_CONTACT: DemoContact = {
  firstName: 'Test',
  lastName: 'User',
  postalCode: '00000',
};

export async function runDemoCheckout(
  page: Page,
  options: DemoCheckoutOptions,
): Promise<DemoCheckoutResult> {
  const { productIds, contact = DEFAULT_CONTACT, placeOrder = true, testInfo } = options;

  if (productIds.length === 0) {
    throw new Error('runDemoCheckout needs at least one product id — an empty cart cannot check out.');
  }

  const credentials = getDemoCredentials();

  const login = new DemoLoginPage(page);
  await login.goto();
  await login.signInAs(credentials.username, credentials.password);

  const inventory = new DemoInventoryPage(page);
  for (const id of productIds) {
    await inventory.addToCart(id);
  }
  await inventory.openCart();

  const cart = new DemoCartPage(page);
  await cart.proceedToCheckout();

  const checkout = new DemoCheckoutPage(page);
  await checkout.fillContact(contact);

  if (!placeOrder) {
    return { checkout };
  }

  await checkout.placeOrder();

  const confirmation = await new DemoConfirmationPage(page).details();

  if (testInfo) {
    // Evidence, preserved on the test rather than only in a log line.
    await testInfo.attach('order-confirmation', {
      body: JSON.stringify(confirmation, null, 2),
      contentType: 'application/json',
    });
  }

  return { checkout, confirmation };
}
