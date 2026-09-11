/**
 * Typed view over knowledge/registry/brand-config.json.
 *
 * The registry is the single source of truth for brand facts. Specs must never
 * hardcode a host, store id, ZIP, or address — they read them from BrandConfig.
 */

export type BrandId = 'brand-one' | 'brand-two' | 'brand-three' | 'brand-four';

/** Environments the registry knows about. Add 'qa' | 'uat' here and in the
 *  registry's `envs` array together — the two are validated against each other. */
export type Env = 'test';

export interface FeatureFlagRef {
  /** Identifier in the flag provider. Null when the flag is known but unmapped. */
  providerId?: string | null;
  experimentId?: string;
  type?: string;
  default?: boolean;
  note?: string;
}

export interface BrandTestData {
  /** Null when no test store has been provisioned for the brand yet. */
  storeId: string | null;
  zip?: string;
  address?: string;
  cityState?: string;
  deliveryAddress?: string;
}

export interface BrandLoyalty {
  program: string;
  tiers: string[];
  note?: string;
}

export interface BrandConfig {
  id: BrandId;
  label: string;
  channel: string;
  /** Brand identifier in the external test-management system. */
  testManagementBrandId: number;
  /** Keyed by env name; every entry in the registry's `envs` should be present. */
  hosts: Record<string, string>;
  testData: BrandTestData;
  loyalty: BrandLoyalty;
  fulfillment: string[];
  featureFlags: Record<string, FeatureFlagRef>;
  /** Areas where this brand needs a page-object override rather than the shared one. */
  pomOverrides: string[];
  notes?: string;
}

export interface BrandRegistry {
  version: number;
  updated: string;
  owner: string;
  envs: string[];
  brands: Record<BrandId, BrandConfig>;
}
