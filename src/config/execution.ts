/**
 * Execution settings parsed from the environment.
 *
 * These are deliberately strict. A typo like `WORKERS=four` silently collapsing
 * to a default is the kind of thing that makes a suite mysteriously slow for a
 * week before anyone notices, so invalid input throws instead.
 */

export interface ExecutionEnvironment {
  WORKERS?: string;
  FULLY_PARALLEL?: string;
}

export interface ExecutionSettings {
  workers: number;
  fullyParallel: boolean;
}

export const DEFAULT_WORKERS = 4;
export const DEFAULT_FULLY_PARALLEL = true;

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === '';
}

function parseWorkers(raw: string | undefined): number {
  if (isBlank(raw)) {
    return DEFAULT_WORKERS;
  }

  const trimmed = (raw as string).trim();

  // Number() would accept "4.5", "0x4", " 4 " and "1e3". Match the digits first.
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(
      `WORKERS must be a positive integer, received "${raw}". ` +
        `Leave it unset to use the default of ${DEFAULT_WORKERS}.`,
    );
  }

  const parsed = Number(trimmed);
  if (parsed < 1) {
    throw new Error(`WORKERS must be at least 1, received "${raw}".`);
  }

  return parsed;
}

function parseFullyParallel(raw: string | undefined): boolean {
  if (isBlank(raw)) {
    return DEFAULT_FULLY_PARALLEL;
  }

  const normalized = (raw as string).trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;

  throw new Error(
    `FULLY_PARALLEL must be "true" or "false" (case-insensitive), received "${raw}". ` +
      `Leave it unset to use the default of ${DEFAULT_FULLY_PARALLEL}.`,
  );
}

export function getExecutionSettings(
  environment: ExecutionEnvironment = process.env,
): ExecutionSettings {
  return {
    workers: parseWorkers(environment.WORKERS),
    fullyParallel: parseFullyParallel(environment.FULLY_PARALLEL),
  };
}
