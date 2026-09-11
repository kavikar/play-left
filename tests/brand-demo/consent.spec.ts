import { test, expect } from '../../fixtures';
import { DemoLoginPage } from '../../src/pages/demo';
import { getDemoCredentials } from '../../src/config/demoCredentials';

test.use({ brand: 'brand-demo' });

/**
 * The consent banner appears ~600ms after load, which is exactly the race a
 * real one creates. These tests exist to prove the locator handler in
 * fixtures/brand.fixture.ts actually handles it, rather than the suite
 * passing because the banner happened not to overlap anything.
 */
test.describe('Demo — consent banner @consent', () => {
  test('does not block signing in', async ({ page }) => {
    const { username, password } = getDemoCredentials();
    const login = new DemoLoginPage(page);

    await login.goto();
    // The banner is still pending here. No explicit wait for it: the handler
    // registered on the page fixture is what makes this reliable.
    await login.signInAs(username, password);

    await expect(page).toHaveURL(/inventory\.html$/);
  });

  test('is dismissed rather than merely ignored', async ({ page }) => {
    const login = new DemoLoginPage(page);
    await login.goto();

    const banner = page.locator('#consent-banner');
    await expect(banner).toBeHidden({ timeout: 10_000 });
  });
});
