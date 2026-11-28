/** Plants (GDD 8.5). Pure functions. */
import type { Rarity, Tuning } from '../../content/schema';

/**
 * traitValue = traitBase x RARITY_FACTOR[rarity] x (1 + TRAIT_PER_LEVEL x (level - 1))
 *            x (affinity if at home) x (DUAL_TRAIT_FACTOR if the card has two traits) x plantPowerMult
 */
export function traitValue(
  base: number, rarity: Rarity, level: number, atHome: boolean, traitCount: number, plantPowerMult: number, affinity: number,
  t: Pick<Tuning, 'RARITY_FACTOR' | 'TRAIT_PER_LEVEL' | 'DUAL_TRAIT_FACTOR'>,
): number {
  return base * t.RARITY_FACTOR[rarity] * (1 + t.TRAIT_PER_LEVEL * (level - 1)) * (atHome ? affinity : 1) * (traitCount > 1 ? t.DUAL_TRAIT_FACTOR : 1) * plantPowerMult;
}
