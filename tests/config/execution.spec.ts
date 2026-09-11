import { test, expect } from '@playwright/test';

import {
  DEFAULT_FULLY_PARALLEL,
  DEFAULT_WORKERS,
  getExecutionSettings,
} from '../../src/config/execution';

// Config parsing is pure and has no browser dependency, so it runs as a plain
// Playwright test rather than dragging in a second test runner.
test.describe('getExecutionSettings @config', () => {
  test('falls back to defaults when unset or blank', () => {
    expect(getExecutionSettings({})).toEqual({
      workers: DEFAULT_WORKERS,
      fullyParallel: DEFAULT_FULLY_PARALLEL,
    });

    expect(getExecutionSettings({ WORKERS: '   ', FULLY_PARALLEL: '' })).toEqual({
      workers: DEFAULT_WORKERS,
      fullyParallel: DEFAULT_FULLY_PARALLEL,
    });
  });

  test('accepts positive integers for WORKERS', () => {
    expect(getExecutionSettings({ WORKERS: '1' }).workers).toBe(1);
    expect(getExecutionSettings({ WORKERS: ' 8 ' }).workers).toBe(8);
  });

  test('rejects non-integer WORKERS rather than silently defaulting', () => {
    for (const value of ['0', '-1', '4.5', 'four', '1e3', '0x4']) {
      expect(() => getExecutionSettings({ WORKERS: value }), `WORKERS=${value}`).toThrow(/WORKERS/);
    }
  });

  test('parses FULLY_PARALLEL case-insensitively', () => {
    expect(getExecutionSettings({ FULLY_PARALLEL: 'TRUE' }).fullyParallel).toBe(true);
    expect(getExecutionSettings({ FULLY_PARALLEL: 'False' }).fullyParallel).toBe(false);
  });

  test('rejects non-boolean FULLY_PARALLEL', () => {
    for (const value of ['yes', '1', 'on', 'truthy']) {
      expect(
        () => getExecutionSettings({ FULLY_PARALLEL: value }),
        `FULLY_PARALLEL=${value}`,
      ).toThrow(/FULLY_PARALLEL/);
    }
  });
});
