import { test as brandTest } from './brand.fixture';
import { loadFlagState } from './flag.fixture';
import type { FlagFixtures } from './flag.fixture';

export type { BrandFixtures, BrandOptions } from './brand.fixture';
export type { FlagState, FlagSnapshot, FlagValue, FlagFixtures } from './flag.fixture';

/**
 * The single entry point for specs.
 *
 *   import { test, expect } from '../../fixtures';
 *
 * Importing from '@playwright/test' directly in a spec bypasses the brand
 * option and the consent handler, so don't — the base `test` has no `brand`.
 */
export const test = brandTest.extend<FlagFixtures & { runnableGuard: void }>({
  flags: async ({ brand }, use) => {
    await use(loadFlagState(brand));
  },

  /**
   * Skip, do not fail, when a brand's host is a placeholder.
   *
   * This is the framework's own "blocked is not failed" rule turned on itself.
   * `brand-one`..`brand-four` describe a real shape against hosts that serve
   * nothing, so a browser spec against them is unrunnable — which is a
   * configuration fact, not a product defect. Reporting it as a failure would
   * train everyone to ignore a red suite.
   */
  runnableGuard: [
    async ({ brandConfig }, use, testInfo) => {
      testInfo.skip(
        brandConfig.runnable !== true,
        `"${brandConfig.id}" has no runnable host (${brandConfig.hosts.test}). ` +
          `Set "runnable": true in the registry once it points at a real application.`,
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
