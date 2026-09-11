import { existsSync } from 'fs';
import { resolve } from 'path';
import * as os from 'os';

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

import { BRAND_IDS, isBrandId, resolveBrandUrl } from './brands';
import type { BrandId } from './brands';
import type { BrandOptions } from './fixtures';
import { getExecutionSettings } from './src/config/execution';

dotenv.config();

const isCI = !!process.env.CI;
const isHeaded = process.env.HEADED?.trim().toLowerCase() === 'true';
const { workers, fullyParallel } = getExecutionSettings();

/**
 * BRAND filters which projects are defined at all, rather than relying on
 * `--project`. That keeps `npx playwright test --list` honest about what a
 * given invocation will run.
 */
function selectedBrands(): readonly BrandId[] {
  const requested = process.env.BRAND?.trim();
  if (!requested) {
    return BRAND_IDS;
  }

  if (!isBrandId(requested)) {
    throw new Error(
      `BRAND="${requested}" is not a known brand. Known brands: ${BRAND_IDS.join(', ')}`,
    );
  }

  return [requested];
}

/**
 * Reuse a saved session only when one exists. Guest specs must work without it,
 * so a missing file is not an error — it just means no storage state.
 */
function storageStateFor(brand: BrandId): string | undefined {
  const path = resolve(__dirname, '.auth', `${brand}.json`);
  return existsSync(path) ? path : undefined;
}

export default defineConfig<BrandOptions>({
  testDir: './tests',
  fullyParallel,
  workers,
  retries: isCI ? 2 : 0,
  forbidOnly: isCI,
  timeout: 90_000,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    [
      'allure-playwright',
      {
        detail: true,
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          node_version: process.version,
        },
      },
    ],
  ],

  /**
   * Start the bundled demo storefront for the runnable brand.
   *
   * A demo target inside the repo, rather than a public practice site, keeps
   * CI green when a third party changes their markup — and removes the
   * network from the critical path entirely.
   */
  webServer: {
    command: 'node demo-app/server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !isCI,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 30_000,
  },

  use: {
    // The demo storefront (and most practice targets) use data-test rather
    // than data-testid, so getByTestId is pointed at it.
    testIdAttribute: 'data-test',

    // Local runs stay lean: traces and video are the slowest part of a suite and
    // a failure screenshot is usually enough when the app is on your own machine.
    // CI gets the full evidence set, because there is no second chance to look.
    trace: isCI ? 'on-first-retry' : 'off',
    video: isCI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
    headless: !isHeaded,
    launchOptions: {
      args: isHeaded ? ['--start-maximized'] : [],
    },
  },

  projects: [
    // Pure configuration and registry checks. No browser, no baseURL — these
    // guard the contracts the brand projects below depend on.
    {
      name: 'config',
      testDir: './tests/config',
    },
    ...selectedBrands().map((brand) => ({
      name: `${brand}-chromium`,
      testDir: `./tests/${brand}`,
      use: {
        ...devices['Desktop Chrome'],
        brand,
        baseURL: resolveBrandUrl(brand, 'test'),
        storageState: storageStateFor(brand),
        viewport: { width: 1440, height: 900 },
      },
    })),
  ],
});
