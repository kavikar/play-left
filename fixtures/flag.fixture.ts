import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import type { BrandId } from '../brands';

/**
 * Feature flag state captured from the flag provider into a local snapshot.
 *
 * The rule that matters here: stale state throws. A suite that silently runs
 * against week-old flag values produces failures nobody can reproduce and
 * passes nobody should trust.
 */

export type FlagValue = boolean | string | number | Record<string, unknown>;
export type FlagState = Record<string, FlagValue>;

export interface FlagSnapshot {
  brand: BrandId;
  timestamp: string;
  ttlMinutes?: number;
  flags: FlagState;
}

type FlagStateFile = Record<string, FlagSnapshot>;

export const DEFAULT_TTL_MINUTES = 60;

const STATE_PATH = resolve(__dirname, '..', 'knowledge', 'state', 'feature-flags.json');

function readSnapshotFile(): FlagStateFile | undefined {
  if (!existsSync(STATE_PATH)) {
    console.warn(
      `[flags] No snapshot at ${STATE_PATH} — continuing with empty flag state. ` +
        `Specs that branch on a flag should guard for this.`,
    );
    return undefined;
  }

  const raw = readFileSync(STATE_PATH, 'utf-8').replace(/^﻿/, '');
  try {
    return JSON.parse(raw) as FlagStateFile;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse flag state at ${STATE_PATH}: ${detail}`);
  }
}

function assertFresh(snapshot: FlagSnapshot, brand: BrandId): void {
  const captured = Date.parse(snapshot.timestamp);
  if (Number.isNaN(captured)) {
    throw new Error(
      `[flags] Snapshot for "${brand}" has an unparseable timestamp: "${snapshot.timestamp}".`,
    );
  }

  const ttlMinutes = snapshot.ttlMinutes ?? DEFAULT_TTL_MINUTES;
  const ageMinutes = (Date.now() - captured) / 60_000;

  if (ageMinutes > ttlMinutes) {
    throw new Error(
      `[flags] Snapshot for "${brand}" is ${Math.round(ageMinutes)} minutes old ` +
        `(TTL ${ttlMinutes}). Refresh knowledge/state/feature-flags.json before running. ` +
        `Stale flag state is never used silently.`,
    );
  }
}

export function loadFlagState(brand: BrandId): FlagState {
  const file = readSnapshotFile();
  if (!file) {
    return {};
  }

  const snapshot = file[brand];
  if (!snapshot) {
    console.warn(`[flags] No entry for "${brand}" in ${STATE_PATH} — using empty flag state.`);
    return {};
  }

  assertFresh(snapshot, brand);
  return snapshot.flags ?? {};
}

export interface FlagFixtures {
  flags: FlagState;
}
