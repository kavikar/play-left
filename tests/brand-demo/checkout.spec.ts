import { test, expect } from '../../fixtures';
import {
  DemoCartPage,
  DemoCheckoutPage,
  DemoConfirmationPage,
  DemoInventoryPage,
  DemoLoginPage,
} from '../../src/pages/demo';
import { runDemoCheckout } from '../../src/flows/DemoCheckoutFlow';
import { getDemoCredentials } from '../../src/config/demoCredentials';

test.use({ brand: 'brand-demo' });

test.describe('Demo — checkout @checkout @orders', () => {
  test('completes a purchase and returns a confirmation reference', async ({
    page,
    brandConfig,
  }, testInfo) => {
    const { confirmation } = await runDemoCheckout(page, {
      brandConfig,
      productIds: ['anvil', 'compass'],
      testInfo,
    });

    await expect(new DemoConfirmationPage(page).header).toContainText(/thank you/i);
    expect(confirmation?.reference).toMatch(/^DM-\d{8}$/);
    expect(confirmation?.total).toMatch(/^\$\d+\.\d{2}$/);
  });

  test('charges tax on top of the subtotal', async ({ page, brandConfig }) => {
    const { checkout } = await runDemoCheckout(page, {
      brandConfig,
      productIds: ['anvil', 'rope'],
      placeOrder: false,
    });

    const { subtotal, tax, total } = await checkout.amounts();

    // Asserting the arithmetic, not just that three numbers rendered.
    expect(tax).toBeCloseTo(Math.round(subtotal * 0.08 * 100) / 100, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('blocks checkout on missing contact details', async ({ page, brandConfig }) => {
    const { checkout } = await runDemoCheckout(page, {
      brandConfig,
      productIds: ['kettle'],
      contact: { firstName: '', lastName: '', postalCode: '' },
      placeOrder: false,
    });

    await checkout.submitExpectingValidationError();

    await expect(checkout.error).toBeVisible();
    await expect(page).toHaveURL(/checkout\.html$/);
  });

  test('empties the cart after a completed order', async ({ page, brandConfig }) => {
    await runDemoCheckout(page, { brandConfig, productIds: ['satchel'] });

    await new DemoInventoryPage(page).goto();
    await expect(new DemoInventoryPage(page).cartCount).toBeHidden();
  });

  test('cannot check out with an empty cart', async ({ page }) => {
    const { username, password } = getDemoCredentials();
    const login = new DemoLoginPage(page);
    await login.goto();
    await login.signInAs(username, password);

    const cart = new DemoCartPage(page);
    await cart.goto();

    await expect(cart.empty).toBeVisible();
    await expect(cart.checkout).toBeDisabled();
  });

  test('removes a line item from the cart', async ({ page }) => {
    const { username, password } = getDemoCredentials();
    const login = new DemoLoginPage(page);
    await login.goto();
    await login.signInAs(username, password);

    const inventory = new DemoInventoryPage(page);
    await inventory.addToCart('anvil');
    await inventory.addToCart('rope');
    await inventory.openCart();

    const cart = new DemoCartPage(page);
    expect(await cart.itemNames()).toHaveLength(2);

    await cart.remove('anvil');
    expect(await cart.itemNames()).toHaveLength(1);
    await expect(cart.lineItem('anvil')).toHaveCount(0);
  });
});
