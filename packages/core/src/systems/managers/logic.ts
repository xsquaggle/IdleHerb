/** Managers (GDD 7.2). Pure functions. */
import type { Rarity, Tuning } from '../../content/schema';

/** managerProfit = MGR_BASE[rarity] x MGR_LEVEL_MULT^(level - 1) x managerPowerMult. */
export function managerProfit(rarity: Rarity, level: number, managerPowerMult: number, t: Pick<Tuning, 'MGR_BASE' | 'MGR_LEVEL_MULT'>): number {
  return t.MGR_BASE[rarity] * t.MGR_LEVEL_MULT ** (level - 1) * managerPowerMult;
}

/** perkValue = perkBase x (1 + PERK_PER_LEVEL x (level - 1)). */
export function perkValue(base: number, level: number, t: Pick<Tuning, 'PERK_PER_LEVEL'>): number {
  return base * (1 + t.PERK_PER_LEVEL * (level - 1));
}
