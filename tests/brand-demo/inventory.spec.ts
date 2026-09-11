import { test, expect } from '../../fixtures';
import { DemoInventoryPage, DemoLoginPage } from '../../src/pages/demo';
import { getDemoCredentials } from '../../src/config/demoCredentials';

test.use({ brand: 'brand-demo' });

test.beforeEach(async ({ page }) => {
  const { username, password } = getDemoCredentials();
  const login = new DemoLoginPage(page);
  await login.goto();
  await login.signInAs(username, password);
});

test.describe('Demo — product listing @inventory @smoke', () => {
  test('lists products with a name and a price each', async ({ page }) => {
    const inventory = new DemoInventoryPage(page);

    const names = await inventory.visibleNames();
    const prices = await inventory.visiblePrices();

    expect(names.length).toBeGreaterThan(0);
    expect(prices).toHaveLength(names.length);
    expect(prices.every((p) => p > 0)).toBe(true);
  });

  test('sorts by price ascending and descending', async ({ page }) => {
    const inventory = new DemoInventoryPage(page);

    await inventory.sortBy('price-asc');
    const ascending = await inventory.visiblePrices();
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));

    await inventory.sortBy('price-desc');
    const descending = await inventory.visiblePrices();
    expect(descending).toEqual([...descending].sort((a, b) => b - a));
  });

  test('sorts by name', async ({ page }) => {
    const inventory = new DemoInventoryPage(page);

    await inventory.sortBy('name-asc');
    const names = await inventory.visibleNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('reflects cart additions in the header count', async ({ page }) => {
    const inventory = new DemoInventoryPage(page);

    await expect(inventory.cartCount).toBeHidden();

    await inventory.addToCart('anvil');
    await expect(inventory.cartCount).toHaveText('1');

    await inventory.addToCart('rope');
    await expect(inventory.cartCount).toHaveText('2');

    await inventory.removeFromCart('anvil');
    await expect(inventory.cartCount).toHaveText('1');
  });

  test('toggles a product between added and removed', async ({ page }) => {
    const inventory = new DemoInventoryPage(page);
    const item = inventory.item('lantern');

    await expect(item.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await inventory.addToCart('lantern');
    await expect(item.getByRole('button', { name: 'Remove' })).toBeVisible();
  });
});
