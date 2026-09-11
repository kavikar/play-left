import { test, expect } from '../../fixtures';
import { BaseHomePage } from '../../src/pages/base/BaseHomePage';

test.use({ brand: 'brand-two' });

test.describe('Brand Two — home @smoke @web', () => {
  test('renders shared header and footer chrome', async ({ page }) => {
    const home = new BaseHomePage(page);
    await home.goto();

    await expect(home.bagButton).toBeVisible();
    await expect(home.signInButton).toBeVisible();
  });

  // Brand Two's registry entry flags incomplete test-id coverage and store
  // selection that needs extra configuration. Gating the spec is honest;
  // letting it fail nightly and calling it "known flaky" is not.
  test.skip('selects a store from the header', async ({ brandConfig }) => {
    expect(brandConfig.testData.storeId).toBeTruthy();
  });
});
