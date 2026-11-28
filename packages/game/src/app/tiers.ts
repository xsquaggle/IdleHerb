/**
 * The rarity ladder on screen (design 0.5; style bible v1.7, sections 8 and 19). Everything here
 * reads tables/tiers.yaml through the content bundle, so a new tier, or a tier's new art, is a row
 * of data and a file in art/, never new code. No code names a tier (tiers.test.ts checks).
 */
import type { TierRow } from '@sprout/core';
import { cardTier } from '@sprout/core';
import { C } from '../engine/palette';
import { hasTex } from '../engine/assets';
import { content } from './content';
import { session } from './session';
import chestsFile from '../../../../art/chests/chests.json';

/** A tier's colours as numbers, plus its row. */
export interface TierLook {
  row: TierRow;
  id: string;
  /** 0-based place on the ladder. */
  index: number;
  main: number;
  light: number;
  dark: number;
  flood: number[];
  pips: number;
}

const color = (token: string): number => C[token] ?? C.white;

export const TIER_LOOKS: TierLook[] = content.tiers.list.map((row, index) => ({
  row,
  id: row.id,
  index,
  main: color(row.look.main),
  light: color(row.look.light),
  dark: color(row.look.dark),
  flood: row.look.flood.map(color),
  pips: row.pips,
}));

/** The look of a tier by its 0-based place, clamped to the ladder. */
export function tierAt(index: number): TierLook {
  return TIER_LOOKS[Math.max(0, Math.min(TIER_LOOKS.length - 1, Math.floor(index)))]!;
}

export function tierLook(id: string): TierLook {
  return content.tiers.has(id) ? TIER_LOOKS[content.tiers.index(id)]! : TIER_LOOKS[0]!;
}

export function tierIndex(id: string): number {
  return content.tiers.has(id) ? content.tiers.index(id) : 0;
}

/** The first non-null value of `pick` at this tier or the nearest tier below it. */
export function nearestBelow<T>(index: number, pick: (row: TierRow) => T | null | undefined): T | null {
  for (let i = Math.min(index, TIER_LOOKS.length - 1); i >= 0; i--) {
    const v = pick(TIER_LOOKS[i]!.row);
    if (v !== null && v !== undefined) return v;
  }
  return null;
}

/** A card's tier now (its native tier raised by Tier Ups), 0-based. */
export function cardTierIndex(cardId: string): number {
  const def = content.cards.get(cardId);
  if (!def) return 0;
  return cardTier(def, session.game?.state.cards[cardId]) - 1;
}

/** The best tier among some cards, 0-based. */
export function bestTierIndex(cards: string[]): number {
  return Math.max(0, ...cards.map(cardTierIndex));
}

/** A chest's tier, 0-based: the chest table, then the special chests. */
export function chestTierIndex(chestId: string): number {
  const t = content.chests.get(chestId)?.tier ?? content.specialChests.get(chestId) ?? 1;
  return t - 1;
}

const ART_IDS = (chestsFile as unknown as { design_ids?: Record<string, string> }).design_ids ?? {};

/** The chest art material (art/chests/frames) for a chest: the art's own map, else its tier's chest, else the nearest below. */
export function chestMaterial(chestId: string): string {
  const named = ART_IDS[chestId];
  if (named && hasTex(`chests/frames/${named}_closed_96x80.png`)) return named;
  return nearestBelow(chestTierIndex(chestId), (r) => (r.chest && hasTex(`chests/frames/${r.chest}_closed_96x80.png`) ? r.chest : null)) ?? TIER_LOOKS[0]!.row.chest ?? '';
}

/** The chest material for a tier with no chest of its own (the reveal theatre). */
export function tierChestMaterial(index: number): string {
  return nearestBelow(index, (r) => (r.chest && hasTex(`chests/frames/${r.chest}_closed_96x80.png`) ? r.chest : null)) ?? '';
}
