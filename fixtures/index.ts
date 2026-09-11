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
export const test = brandTest.extend<FlagFixtures>({
  flags: async ({ brand }, use) => {
    await use(loadFlagState(brand));
  },
});

export { expect } from '@playwright/test';
