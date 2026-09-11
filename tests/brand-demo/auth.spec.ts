import { test, expect } from '../../fixtures';
import { DemoLoginPage, DemoInventoryPage } from '../../src/pages/demo';
import {
  DEMO_LOCKED_USERNAME,
  getDemoCredentials,
} from '../../src/config/demoCredentials';

test.use({ brand: 'brand-demo' });

test.describe('Demo — authentication @auth @smoke', () => {
  test('signs a valid user in and lands on products', async ({ page }) => {
    const { username, password } = getDemoCredentials();
    const login = new DemoLoginPage(page);

    await login.goto();
    await login.signInAs(username, password);

    await expect(new DemoInventoryPage(page).heading).toHaveText('Products');
  });

  test('rejects a wrong password without navigating away', async ({ page }) => {
    const login = new DemoLoginPage(page);
    await login.goto();
    await login.signIn(getDemoCredentials().username, 'not-the-password');

    await expect(login.error).toBeVisible();
    await expect(login.error).toContainText(/do not match/i);
    await expect(page).toHaveURL(/index\.html$/);
  });

  test('reports a locked-out user distinctly from a bad password', async ({ page }) => {
    const login = new DemoLoginPage(page);
    await login.goto();
    await login.signIn(DEMO_LOCKED_USERNAME, getDemoCredentials().password);

    // The distinction matters: one is a credential problem, the other is an
    // account state problem. A test that only asserted "an error appeared"
    // would pass even if the app confused the two.
    await expect(login.error).toContainText(/locked out/i);
  });

  test('requires both fields', async ({ page }) => {
    const login = new DemoLoginPage(page);
    await login.goto();
    await login.signIn('', '');

    await expect(login.error).toContainText(/required/i);
  });

  test('signs out back to the login page', async ({ page }) => {
    const { username, password } = getDemoCredentials();
    const login = new DemoLoginPage(page);
    await login.goto();
    await login.signInAs(username, password);

    await new DemoInventoryPage(page).signOut.click();

    await expect(page).toHaveURL(/index\.html$/);
    await expect(login.submit).toBeVisible();
  });
});
