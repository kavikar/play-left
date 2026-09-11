import { test, expect } from '../../fixtures';
import { BrandOneHomePage } from '../../src/pages/BrandOneHomePage';

test.describe('Brand One — home @smoke @web', () => {
  test('renders shared header and footer chrome', async ({ page }) => {
    const home = new BrandOneHomePage(page);
    await home.goto();

    for (const { name, locator } of home.visibleChrome()) {
      await test.step(`${name} is visible`, async () => {
        await expect(locator, `Expected "${name}" in the page chrome`).toBeVisible();
      });
    }
  });

  test('exposes the brand-configured store context', async ({ page, brandConfig }) => {
    // The assertion reads its expectation from the registry — no store id,
    // ZIP, or address is written into this spec.
    expect(brandConfig.testData.storeId, 'Brand One needs a test store in the registry').toBeTruthy();

    const home = new BrandOneHomePage(page);
    await home.goto();

    await expect(home.storeSelectorButton).toBeVisible();
  });
});
