/**
 * Chest rolls (GDD 8.3). Pure apart from the random stream and the pity
 * counters it is handed, so the odds the screen shows and the odds that are
 * rolled come from the same code.
 */
import type { Content, CardDef } from '../../content/content';
import { RARITY_ORDER } from '../../content/content';
import type { ChestRow, Rarity } from '../../content/schema';
import { chance, nextFloat, pickOne, pickWeighted, type RngState } from '../../kernel/rng/rng';

export const CHEST_RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export interface Pity {
  /** Cards drawn since the last Epic or better. */
  sinceEpic: number;
  /** Cards drawn since the last Legendary. */
  sinceLegendary: number;
  /** Heirloom pieces since the last Legendary piece (PITY_HEIRLOOM). */
  heirloomsSinceLegendary: number;
}

export interface ChestRollInput {
  content: Content;
  rng: RngState;
  chest: ChestRow;
  /** chestLuck: multiplies the Rare, Epic and Legendary weights by 1 + luck. */
  luck: number;
  /** Abracadabra: this chest rolls with double the Rare, Epic and Legendary weights. */
  doubleLuck: boolean;
  plantsUnlocked: boolean;
  heirloomsUnlocked: boolean;
  /** Highest world ever reached, 1-based. A card is in the pool when its poolWorld is at or below this. */
  worldReached: number;
  /** Ids of cards the player owns. The roller adds to it as slots resolve. */
  owned: Set<string>;
  /** Ids of heirlooms the player owns. */
  ownedHeirlooms: ReadonlySet<string>;
  /** True during the player's first NEW_CARD_CHESTS chests. */
  newCardHelp: boolean;
  pity: Pity;
}

export interface ChestRollResult {
  cards: string[];
  heirloom: string | null;
  pollen: number;
  exoticManager: string | null;
}

/**
 * The five slot weights with luck applied (rule 6): Rare, Epic and Legendary
 * are multiplied by 1 + luck (and doubled again by Abracadabra). The weights
 * are then used as proportions, so Common and Uncommon shrink together and
 * nothing can go below zero.
 */
export function slotWeights(chest: ChestRow, luck: number, doubleLuck: boolean): number[] {
  const factor = (1 + luck) * (doubleLuck ? 2 : 1);
  return [chest.odds.common, chest.odds.uncommon, chest.odds.rare * factor, chest.odds.epic * factor, chest.odds.legendary * factor];
}

/** The odds the chest screen shows, as fractions that sum to 1. */
export function shownOdds(chest: ChestRow, luck: number): Record<string, number> {
  const w = slotWeights(chest, luck, false);
  const total = w.reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  CHEST_RARITIES.forEach((r, i) => (out[r] = w[i]! / total));
  return out;
}

function poolFor(input: ChestRollInput, rarity: Rarity, kind: 'manager' | 'plant'): CardDef[] {
  const list: CardDef[] = kind === 'manager' ? input.content.managers : input.content.plants;
  return list.filter((c) => {
    if (c.rarity !== rarity) return false;
    if (c.kind === 'plant' && c.source !== 'chest') return false;
    if (c.poolWorld === undefined) return false;
    return c.poolWorld <= input.worldReached;
  });
}

function rollCard(input: ChestRollInput, rarity: Rarity): string | null {
  const t = input.content.tuning;
  let kind: 'manager' | 'plant' = !input.plantsUnlocked || chance(input.rng, t.CHEST_MANAGER_SHARE) ? 'manager' : 'plant';
  let pool = poolFor(input, rarity, kind);
  if (pool.length === 0 || (kind === 'plant' && !input.plantsUnlocked)) {
    kind = kind === 'manager' ? 'plant' : 'manager';
    pool = kind === 'plant' && !input.plantsUnlocked ? [] : poolFor(input, rarity, kind);
  }
  if (pool.length === 0) return null;
  if (input.newCardHelp) {
    const fresh = pool.filter((c) => !input.owned.has(c.id));
    if (fresh.length > 0) pool = fresh;
  }
  return pickOne(input.rng, pool).id;
}

function rollSlot(input: ChestRollInput, atLeast: Rarity | null): string | null {
  const t = input.content.tuning;
  let weights = slotWeights(input.chest, input.luck, input.doubleLuck);
  if (atLeast) {
    const min = RARITY_ORDER[atLeast];
    weights = weights.map((w, i) => (i >= min ? w : 0));
    if (!weights.some((w) => w > 0)) weights[min] = 1;
  }
  let rarity = CHEST_RARITIES[pickWeighted(input.rng, weights)]!;
  // Pity (rule 5): the counters are shown on the chest screen.
  if (input.pity.sinceLegendary >= t.PITY_LEGENDARY) rarity = 'legendary';
  else if (input.pity.sinceEpic >= t.PITY_EPIC && RARITY_ORDER[rarity] < RARITY_ORDER.epic) rarity = 'epic';

  // If nothing of this rarity is in the pool yet, step down until something is.
  let card: string | null = null;
  let r = RARITY_ORDER[rarity];
  for (; r >= 0 && card === null; r--) card = rollCard(input, CHEST_RARITIES[r]!);
  if (card === null) return null;
  const got = input.content.cards.get(card)!.rarity;
  input.pity.sinceEpic = RARITY_ORDER[got] >= RARITY_ORDER.epic ? 0 : input.pity.sinceEpic + 1;
  input.pity.sinceLegendary = got === 'legendary' ? 0 : input.pity.sinceLegendary + 1;
  input.owned.add(card);
  return card;
}

export function rollChest(input: ChestRollInput): ChestRollResult {
  const { chest, content, rng } = input;
  const t = content.tuning;
  const cards: string[] = [];
  // Guarantee slots are rolled first (rule 1).
  for (const g of chest.guarantee) {
    const c = rollSlot(input, g);
    if (c) cards.push(c);
  }
  for (let i = chest.guarantee.length; i < chest.cards; i++) {
    const c = rollSlot(input, null);
    if (c) cards.push(c);
  }

  let heirloom: string | null = null;
  if (input.heirloomsUnlocked && chest.heirloomChance > 0 && nextFloat(rng) < chest.heirloomChance) {
    const odds = chest.heirloomOdds === 'starlight' ? t.HEIRLOOM_ODDS_STARLIGHT : t.HEIRLOOM_ODDS;
    const kinds = ['rare', 'epic', 'legendary'] as const;
    let rarity = kinds[pickWeighted(rng, [odds.rare, odds.epic, odds.legendary])]!;
    // Rule 7: at PITY_HEIRLOOM pieces without a Legendary, the next piece is Legendary.
    if (t.PITY_HEIRLOOM > 0 && input.pity.heirloomsSinceLegendary >= t.PITY_HEIRLOOM) rarity = 'legendary';
    input.pity.heirloomsSinceLegendary = rarity === 'legendary' ? 0 : input.pity.heirloomsSinceLegendary + 1;
    let pool = content.artifacts.filter((a) => a.rarity === rarity);
    // Rule 7: while a piece of this rarity is missing, the piece is one the player does not own.
    if (t.HEIRLOOM_NO_REPEATS) {
      const missing = pool.filter((a) => !input.ownedHeirlooms.has(a.id));
      if (missing.length > 0) pool = missing;
    }
    heirloom = pickOne(rng, pool).id;
  }

  let exoticManager: string | null = null;
  if (chest.exoticManagerCopy) {
    const earned = content.managers.filter((m) => m.rarity === 'exotic' && input.owned.has(m.id));
    if (earned.length > 0) exoticManager = pickOne(rng, earned).id;
    else {
      // Rule 9: with no Exotic manager earned, the copy is a third guaranteed Legendary.
      const c = rollSlot(input, 'legendary');
      if (c) cards.push(c);
    }
  }
  return { cards, heirloom, pollen: chest.pollen, exoticManager };
}
