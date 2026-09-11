import { test, expect } from '@playwright/test';

import { BRAND_IDS, getBrandConfig, isBrandId, loadRegistry, resolveBrandUrl } from '../../brands';

test.describe('brand registry @config', () => {
  test('declares every brand in BRAND_IDS', () => {
    const registry = loadRegistry();
    for (const id of BRAND_IDS) {
      expect(registry.brands[id], `registry entry for ${id}`).toBeTruthy();
      expect(registry.brands[id].id).toBe(id);
    }
  });

  test('gives every brand a host for every declared environment', () => {
    const registry = loadRegistry();
    for (const id of BRAND_IDS) {
      for (const env of registry.envs) {
        expect(registry.brands[id].hosts[env], `${id} host for ${env}`).toBeTruthy();
      }
    }
  });

  test('resolves brand URLs and rejects undeclared environments', () => {
    expect(resolveBrandUrl('brand-one')).toBe(getBrandConfig('brand-one').hosts.test);
    // Guards against a suite quietly running against the wrong environment.
    expect(() => resolveBrandUrl('brand-one', 'production')).toThrow(/not declared/);
  });

  test('narrows arbitrary strings to BrandId', () => {
    expect(isBrandId('brand-one')).toBe(true);
    expect(isBrandId('brand-five')).toBe(false);
  });
});
