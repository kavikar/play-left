import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/** Gift cards, like payment cards, live only in a git-ignored local file. */

export interface GiftCard {
  number: string;
  pin: string;
}

interface GiftCardFile {
  cards?: GiftCard[];
}

const GIFT_CARDS_PATH = resolve(__dirname, '..', '..', 'test-data', 'gift-cards.local.json');
const EXAMPLE_PATH = 'test-data/gift-cards.local.example.json';

export function getPrimaryGiftCard(): GiftCard {
  if (!existsSync(GIFT_CARDS_PATH)) {
    throw new Error(
      `No gift card data at ${GIFT_CARDS_PATH}. ` +
        `Copy ${EXAMPLE_PATH} to test-data/gift-cards.local.json and fill in test values. ` +
        `The file is git-ignored by design.`,
    );
  }

  const raw = readFileSync(GIFT_CARDS_PATH, 'utf-8').replace(/^﻿/, '');
  let parsed: GiftCardFile;
  try {
    parsed = JSON.parse(raw) as GiftCardFile;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse ${GIFT_CARDS_PATH}: ${detail}`);
  }

  const card = parsed.cards?.[0];
  if (!card) {
    throw new Error(`${GIFT_CARDS_PATH} has no entries under "cards".`);
  }

  if (!card.number || !card.pin) {
    throw new Error(`The first gift card in ${GIFT_CARDS_PATH} is missing "number" or "pin".`);
  }

  return card;
}
