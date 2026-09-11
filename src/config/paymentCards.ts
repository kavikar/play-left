import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Payment cards are read from a git-ignored local file.
 *
 * Card data never enters the repository — not in fixtures, not in .env.example,
 * not in a committed JSON file. `test-data/payment-cards.local.example.json`
 * shows the shape and nothing more.
 */

export type PaymentCardType = 'visa' | 'master' | 'amex' | 'discover';

export interface PaymentCard {
  number: string;
  expiry: string;
  cvv: string;
  zip: string;
}

type PaymentCardFile = Partial<Record<PaymentCardType, PaymentCard[]>>;

const CARDS_PATH = resolve(__dirname, '..', '..', 'test-data', 'payment-cards.local.json');
const EXAMPLE_PATH = 'test-data/payment-cards.local.example.json';

const REQUIRED_FIELDS: (keyof PaymentCard)[] = ['number', 'expiry', 'cvv', 'zip'];

let cached: PaymentCardFile | undefined;

function loadCardFile(): PaymentCardFile {
  if (cached) {
    return cached;
  }

  if (!existsSync(CARDS_PATH)) {
    throw new Error(
      `No payment card data at ${CARDS_PATH}. ` +
        `Copy ${EXAMPLE_PATH} to test-data/payment-cards.local.json and fill in test card values. ` +
        `The file is git-ignored by design.`,
    );
  }

  const raw = readFileSync(CARDS_PATH, 'utf-8').replace(/^﻿/, '');
  let parsed: PaymentCardFile;
  try {
    parsed = JSON.parse(raw) as PaymentCardFile;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse ${CARDS_PATH}: ${detail}`);
  }

  cached = parsed;
  return parsed;
}

function resolveCardType(explicit?: PaymentCardType): PaymentCardType {
  const fromEnv = process.env.CHECKOUT_CARD_TYPE?.trim().toLowerCase();
  return explicit ?? ((fromEnv || 'visa') as PaymentCardType);
}

function resolveCardIndex(explicit?: number): number {
  if (explicit !== undefined) {
    return explicit;
  }

  const raw = process.env.CHECKOUT_CARD_INDEX?.trim();
  if (!raw) {
    return 0;
  }

  if (!/^\d+$/.test(raw)) {
    throw new Error(`CHECKOUT_CARD_INDEX must be a non-negative integer, received "${raw}".`);
  }

  return Number(raw);
}

/**
 * Fetch a test card by type and zero-based index.
 *
 * Defaults come from CHECKOUT_CARD_TYPE and CHECKOUT_CARD_INDEX so a spec can
 * stay environment-agnostic: `getPaymentCard()` in the spec, selection in .env.
 */
export function getPaymentCard(type?: PaymentCardType, index?: number): PaymentCard {
  const cardType = resolveCardType(type);
  const cardIndex = resolveCardIndex(index);
  const file = loadCardFile();

  const cards = file[cardType];
  if (!cards || cards.length === 0) {
    const available = Object.keys(file).filter((key) => (file[key as PaymentCardType] ?? []).length > 0);
    throw new Error(
      `No cards of type "${cardType}" in ${CARDS_PATH}. ` +
        `Available types: ${available.length > 0 ? available.join(', ') : '(none)'}.`,
    );
  }

  const card = cards[cardIndex];
  if (!card) {
    throw new Error(
      `No "${cardType}" card at index ${cardIndex} — the file has ${cards.length} ` +
        `(valid indexes 0..${cards.length - 1}).`,
    );
  }

  const missing = REQUIRED_FIELDS.filter((field) => !card[field]);
  if (missing.length > 0) {
    throw new Error(
      `Card "${cardType}"[${cardIndex}] is missing required field(s): ${missing.join(', ')}.`,
    );
  }

  return card;
}
