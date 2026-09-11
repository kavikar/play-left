import { mkdirSync } from 'fs';
import { resolve } from 'path';

import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';

import { resolveBrandUrl } from '../../brands';

dotenv.config();

/**
 * One-time interactive sign-in that saves storage state for reuse.
 *
 * Headed on purpose. These sites sit behind anti-bot challenges and consent
 * gates that a headless run cannot reliably clear, and OTP/MFA needs a human.
 * This is a developer tool you run once, not a CI step.
 *
 *   npm run auth:setup
 */

const BRAND = 'brand-one' as const;
const AUTH_DIR = resolve(__dirname, '..', '..', '.auth');
const STATE_PATH = resolve(AUTH_DIR, `${BRAND}.json`);

const HYDRATION_PAUSE_MS = 3_000;
const NAVIGATION_TIMEOUT_MS = 45_000;

function requireCredentials(): { email: string; password: string } {
  const email = process.env.BRAND_ONE_EMAIL || process.env.TEST_USERNAME;
  const password = process.env.BRAND_ONE_PASSWORD || process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Set BRAND_ONE_EMAIL/BRAND_ONE_PASSWORD (or TEST_USERNAME/TEST_PASSWORD) in .env. ' +
        'See .env.example.',
    );
  }

  return { email, password };
}

async function main(): Promise<void> {
  const { email, password } = requireCredentials();
  const loginUrl = process.env.LOGIN_URL || `${resolveBrandUrl(BRAND, 'test')}/`;

  console.log(`[auth] Signing in to ${loginUrl}`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  try {
    // A navigation timeout is survivable here: third-party trackers routinely
    // keep 'load' pending long after the login form is interactive.
    await page.goto(loginUrl, { timeout: NAVIGATION_TIMEOUT_MS }).catch(() => {
      console.warn('[auth] Navigation did not settle; inspecting the page anyway.');
    });

    await page.waitForTimeout(HYDRATION_PAUSE_MS);

    const challengeButton = page.getByRole('button', { name: /click to verify/i });
    if (await challengeButton.isVisible().catch(() => false)) {
      console.log('[auth] Clearing anti-bot challenge.');
      await challengeButton.click();
      await page.waitForTimeout(HYDRATION_PAUSE_MS);
    }

    const consentButton = page.getByRole('button', { name: /accept all/i });
    if (await consentButton.isVisible().catch(() => false)) {
      console.log('[auth] Accepting consent banner.');
      await consentButton.click();
    }

    const signInEntry = page.getByRole('button', { name: /log ?in|enroll|continue|sign ?in/i }).first();
    await signInEntry.click();

    await page.getByRole('textbox', { name: 'identifier-input' }).fill(email);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForTimeout(HYDRATION_PAUSE_MS);

    const otpPrompt = page.getByText(/one[- ]time|verification code|authentication code|mfa/i);
    if (await otpPrompt.isVisible().catch(() => false)) {
      throw new Error(
        '[auth] The account requires OTP/MFA. No OTP provider is built into this framework — ' +
          'complete the challenge manually in the open browser, or use an account without MFA.',
      );
    }

    const passwordField = page.getByRole('textbox', { name: /password/i });
    await passwordField.waitFor({ state: 'visible', timeout: 15_000 });
    await passwordField.fill(password);

    await page.getByRole('button', { name: /log ?in|sign ?in|continue/i }).first().click();

    await page
      .waitForURL(/account|dashboard|rewards|home|\/$/i, { timeout: NAVIGATION_TIMEOUT_MS })
      .catch(() => {
        console.warn('[auth] No expected post-login URL matched; saving state as-is.');
      });

    mkdirSync(AUTH_DIR, { recursive: true });
    await context.storageState({ path: STATE_PATH });

    // Never log the credentials themselves, only where the session landed.
    console.log(`[auth] Storage state written to ${STATE_PATH}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
