import { readFileSync } from 'fs';
import { resolve } from 'path';

import type { BrandConfig, BrandId, BrandRegistry } from './types';

export * from './types';

export const BRAND_IDS: readonly BrandId[] = [
  'brand-one',
  'brand-two',
  'brand-three',
  'brand-four',
] as const;

const REGISTRY_PATH = resolve(__dirname, '..', 'knowledge', 'registry', 'brand-config.json');

let cachedRegistry: BrandRegistry | undefined;

/**
 * Strip a UTF-8 BOM before parsing.
 *
 * Files edited on Windows are routinely saved with a BOM, and `JSON.parse`
 * rejects it with an opaque "Unexpected token" at position 0. Handling it here
 * keeps every caller from having to rediscover that.
 */
function parseJsonFile<T>(path: string): T {
  const raw = readFileSync(path, 'utf-8').replace(/^﻿/, '');
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse JSON at ${path}: ${detail}`);
  }
}

export function isBrandId(value: string): value is BrandId {
  return (BRAND_IDS as readonly string[]).includes(value);
}

/**
 * Load the brand registry, cached for the life of the process.
 *
 * Pass `force` to re-read from disk — useful in tests that write a temporary
 * registry, and nowhere else.
 */
export function loadRegistry(force = false): BrandRegistry {
  if (!force && cachedRegistry) {
    return cachedRegistry;
  }

  const registry = parseJsonFile<BrandRegistry>(REGISTRY_PATH);

  if (!registry.brands || typeof registry.brands !== 'object') {
    throw new Error(`Brand registry at ${REGISTRY_PATH} has no "brands" map.`);
  }

  const missing = BRAND_IDS.filter((id) => !registry.brands[id]);
  if (missing.length > 0) {
    throw new Error(
      `Brand registry is missing entries for: ${missing.join(', ')}. ` +
        `Either add them to the registry or remove them from BRAND_IDS.`,
    );
  }

  cachedRegistry = registry;
  return registry;
}

export function getBrandConfig(id: BrandId): BrandConfig {
  const config = loadRegistry().brands[id];
  if (!config) {
    throw new Error(`Unknown brand "${id}". Known brands: ${BRAND_IDS.join(', ')}`);
  }
  return config;
}

/**
 * Resolve a brand's base URL for an environment.
 *
 * Throws rather than falling back to another environment's host: silently
 * running a `uat` suite against `test` is worse than a failed run.
 */
export function resolveBrandUrl(id: BrandId, env = 'test'): string {
  const registry = loadRegistry();

  if (!registry.envs.includes(env)) {
    throw new Error(
      `Environment "${env}" is not declared in the registry. Declared: ${registry.envs.join(', ')}`,
    );
  }

  const host = getBrandConfig(id).hosts[env];
  if (!host) {
    throw new Error(`Brand "${id}" has no host configured for environment "${env}".`);
  }

  return host;
}
