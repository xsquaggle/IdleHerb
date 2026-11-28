/**
 * Chest rolls (GDD 8.3). Pure apart from the random stream and the pity
 * counters it is handed, so the odds the screen shows and the odds that are
 * rolled come from the same code.
 */
import type { Content, CardDef } from '../../content/content';
import type { ChestRow, TierId } from '../../content/schema';
import { chance, nextFloat, pickOne, pickWeighted, type RngState } from '../../kernel/rng/rng';

/** The tiers a chest's card slot can roll: the lowest up to CHEST_CARD_TOP (EXPANSION 1.3 rule 1). */
export function chestTiers(content: Content): TierId[] {
  return content.tiers.upTo(content.tuning.CHEST_CARD_TOP).map((t) => t.id);
}

/** Tiers above this many places from the bottom are boosted by chest luck (Rare and better, GDD 8.3 rule 6). */
const LUCKY_FROM = 2;

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
  /** Highest world ever reached, 1-based. A plant is in the pool when its poolWorld is at or below this. */
  worldReached: number;
  /**
   * Ids of cards the player owns. The roller adds to it as slots resolve.
   * A manager is owned from the moment it is met (its floor was opened once), and
   * only met managers are in the pool (GDD 8.3 rule 3).
   */
  owned: Set<string>;
  /** Heads whose world has at least 5 Mastery stars: the Starlight Chest's Exotic copy (rule 9). */
  heads: string[];
  /** Ids of heirlooms the player owns. */
  ownedHeirlooms: ReadonlySet<string>;
  /** True during the player's first NEW_CARD_CHESTS chests. */
  newCardHelp: boolean;
  pity: Pity;
}

export interface ChestRollResult {
  cards: string[];
  /** The first heirloom, or null. */
  heirloom: string | null;
  /** Every heirloom (design 0.5 chests can hold several). */
  heirlooms: string[];
  pollen: number;
  /** The first Head copy, or null. */
  exoticManager: string | null;
  /** Every Head copy. */
  heads: string[];
  /** Fixed extras, never rolled (EXPANSION 4.3). */
  extras: { item: string; count: number; tier?: TierId }[];
}

/**
 * The slot weights, one per tier from chestTiers, with luck applied (rule 6):
 * Rare and better are multiplied by 1 + luck (and doubled again by Abracadabra).
 * The weights are then used as proportions, so Common and Uncommon shrink
 * together and nothing can go below zero.
 */
export function slotWeights(content: Content, chest: ChestRow, luck: number, doubleLuck: boolean): number[] {
  const factor = (1 + luck) * (doubleLuck ? 2 : 1);
  return chestTiers(content).map((id, i) => (chest.odds[id] ?? 0) * (i >= LUCKY_FROM ? factor : 1));
}

/** The odds the chest screen shows, as fractions that sum to 1, keyed by tier id. */
export function shownOdds(content: Content, chest: ChestRow, luck: number): Record<string, number> {
  const w = slotWeights(content, chest, luck, false);
  const total = w.reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  chestTiers(content).forEach((r, i) => (out[r] = w[i]! / total));
  return out;
}

function poolFor(input: ChestRollInput, rarity: TierId, kind: 'manager' | 'plant'): CardDef[] {
  const list: CardDef[] = kind === 'manager' ? input.content.managers : input.content.plants;
  return list.filter((c) => {
    if (c.rarity !== rarity) return false;
    // Managers: met, and never a Head. Head copies come from Mastery stars and the Starlight Chest.
    if (c.kind === 'manager') return !c.head && input.owned.has(c.id);
    if (c.source !== 'chest') return false;
    if (c.poolWorld === undefined) return false;
    return c.poolWorld <= input.worldReached;
  });
}

function rollCard(input: ChestRollInput, rarity: TierId): string | null {
  const t = input.content.tuning;
  let kind: 'manager' | 'plant' = !input.plantsUnlocked || chance(input.rng, t.CHEST_MANAGER_SHARE) ? 'manager' : 'plant';
  let pool = poolFor(input, rarity, kind);
  if (pool.length === 0 || (kind === 'plant' && !input.plantsUnlocked)) {
    kind = kind === 'manager' ? 'plant' : 'manager';
    pool = kind === 'plant' && !input.plantsUnlocked ? [] : poolFor(input, rarity, kind);
  }
  if (pool.length === 0) return null;
  // New-card help is for plants: a met manager is already owned (rule 4).
  if (input.newCardHelp && kind === 'plant') {
    const fresh = pool.filter((c) => !input.owned.has(c.id));
    if (fresh.length > 0) pool = fresh;
  }
  return pickOne(input.rng, pool).id;
}

function rollSlot(input: ChestRollInput, atLeast: TierId | null): string | null {
  const { content } = input;
  const t = content.tuning;
  const tiers = content.tiers;
  const ladder = chestTiers(content);
  const top = t.CHEST_CARD_TOP;
  let weights = slotWeights(content, input.chest, input.luck, input.doubleLuck);
  if (atLeast) {
    const min = Math.min(tiers.index(atLeast), ladder.length - 1);
    weights = weights.map((w, i) => (i >= min ? w : 0));
    if (!weights.some((w) => w > 0)) weights[min] = 1;
  }
  let rarity = ladder[pickWeighted(input.rng, weights)]!;
  // Pity (rule 5): the counters are shown on the chest screen.
  if (input.pity.sinceEpic >= t.PITY_EPIC && !tiers.atLeast(rarity, t.PITY_EPIC_TIER)) rarity = t.PITY_EPIC_TIER;
  let card: string | null = null;
  // Legendary pity draws a card of the top tier. With none in the pool yet, the slot
  // rolls as usual (Epic pity included) and the counter keeps counting, so the
  // pity never turns every later card into the best tier on offer.
  if (input.pity.sinceLegendary >= t.PITY_LEGENDARY) card = rollCard(input, top);

  // If nothing of this tier is in the pool yet, step down until something is.
  let r = tiers.index(rarity);
  for (; r >= 0 && card === null; r--) card = rollCard(input, ladder[r]!);
  if (card === null) return null;
  const got = content.cards.get(card)!.rarity;
  input.pity.sinceEpic = tiers.atLeast(got, t.PITY_EPIC_TIER) ? 0 : input.pity.sinceEpic + 1;
  input.pity.sinceLegendary = tiers.atLeast(got, top) ? 0 : input.pity.sinceLegendary + 1;
  input.owned.add(card);
  return card;
}

/** One heirloom piece, at least tier `min` when given (rules 7 and 8). */
function rollHeirloom(input: ChestRollInput, min: TierId | null): string | null {
  const { chest, content, rng } = input;
  const t = content.tuning;
  const tiers = content.tiers;
  const table = chest.heirloomOdds === 'starlight' ? t.HEIRLOOM_ODDS_STARLIGHT : t.HEIRLOOM_ODDS;
  const kinds = Object.keys(table).sort((a, b) => tiers.order(a) - tiers.order(b));
  const best = kinds[kinds.length - 1]!;
  let weights = kinds.map((k) => table[k]!);
  if (min) {
    weights = weights.map((w, i) => (tiers.atLeast(kinds[i]!, min) ? w : 0));
    if (!weights.some((w) => w > 0)) weights[weights.length - 1] = 1;
  }
  let rarity = kinds[pickWeighted(rng, weights)]!;
  // Rule 7: at PITY_HEIRLOOM pieces without one of the best tier, the next piece is of the best tier.
  if (t.PITY_HEIRLOOM > 0 && input.pity.heirloomsSinceLegendary >= t.PITY_HEIRLOOM) rarity = best;
  input.pity.heirloomsSinceLegendary = rarity === best ? 0 : input.pity.heirloomsSinceLegendary + 1;
  let pool = content.artifacts.filter((a) => a.rarity === rarity);
  // Rule 7: while a piece of this rarity is missing, the piece is one the player does not own.
  if (t.HEIRLOOM_NO_REPEATS) {
    const missing = pool.filter((a) => !input.ownedHeirlooms.has(a.id));
    if (missing.length > 0) pool = missing;
  }
  return pool.length > 0 ? pickOne(rng, pool).id : null;
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

  const heirlooms: string[] = [];
  if (input.heirloomsUnlocked && chest.heirloomChance > 0) {
    if (chest.heirloomSlots) {
      // Design 0.5 chests: every slot is a sure piece, at least the tier it names.
      for (const min of chest.heirloomSlots) {
        const h = rollHeirloom(input, min === 'any' ? null : min);
        if (h) heirlooms.push(h);
      }
    } else if (nextFloat(rng) < chest.heirloomChance) {
      const h = rollHeirloom(input, null);
      if (h) heirlooms.push(h);
    }
  }

  const heads: string[] = [];
  for (let i = 0; i < (chest.headCopies ?? 0); i++) {
    if (input.heads.length > 0) heads.push(pickOne(rng, input.heads));
    else {
      // Rule 9: while no world has 5 Mastery stars, each copy is another guaranteed card of the top chest tier.
      const c = rollSlot(input, t.CHEST_CARD_TOP);
      if (c) cards.push(c);
    }
  }
  return { cards, heirloom: heirlooms[0] ?? null, heirlooms, pollen: chest.pollen, exoticManager: heads[0] ?? null, heads, extras: chest.extras ?? [] };
}
