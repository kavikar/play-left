/**
 * Credentials for the bundled demo storefront.
 *
 * These are not secrets: the demo app prints them on its own sign-in page, and
 * it authenticates nothing real. They are still read from the environment so
 * the shape matches every other brand — where credentials must come from .env
 * and must never be committed.
 */

export interface DemoCredentials {
  username: string;
  password: string;
}

export const DEMO_DEFAULT_USERNAME = 'standard_user';
export const DEMO_DEFAULT_PASSWORD = 'demo_password';
/** A user the demo app rejects, for negative-path coverage. */
export const DEMO_LOCKED_USERNAME = 'locked_out_user';

export function getDemoCredentials(): DemoCredentials {
  return {
    username: process.env.DEMO_USERNAME?.trim() || DEMO_DEFAULT_USERNAME,
    password: process.env.DEMO_PASSWORD?.trim() || DEMO_DEFAULT_PASSWORD,
  };
}
