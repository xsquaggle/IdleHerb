/** Tapping: Combo, Bumpers and tap value (GDD 6). Pure functions. */
import type { Tuning } from '../../content/schema';
import { chance, type RngState } from '../../kernel/rng/rng';

export function comboMult(stacks: number, t: Pick<Tuning, 'COMBO_PER_STACK'>): number {
  return 1 + t.COMBO_PER_STACK * stacks;
}

/** Average Bumper factor of one tap: 1 + chance x (mult - 1). */
export function expectedCrit(critChance: number, critMult: number): number {
  return 1 + critChance * (critMult - 1);
}

/** One real tap, rolled. Used by the game; the simulator uses the averages below. */
export function rollTap(rng: RngState, critChance: number, critMult: number): { crit: boolean; factor: number } {
  const crit = chance(rng, critChance);
  return { crit, factor: crit ? critMult : 1 };
}

/**
 * A run of `taps` taps (may be fractional) starting from `stacks`, each adding
 * `perTap` stacks up to `cap` (perTap is 1 / COMBO_TAPS_PER_STACK). Returns the new stack count and the sum of the
 * Combo multiplier over the run, which is what tap income scales with.
 */
export function comboRun(stacks: number, taps: number, cap: number, perTap: number, perStack: number): { stacks: number; multSum: number } {
  if (taps <= 0) return { stacks, multSum: 0 };
  const start = Math.min(stacks, cap);
  const toCap = Math.max(0, cap - start) / perTap;
  if (taps <= toCap) {
    const end = start + taps * perTap;
    // Each tap counts at the stacks after it: integral of (1 + perStack x s) from start to end.
    return { stacks: end, multSum: taps * (1 + perStack * (start + end) / 2) };
  }
  const climb = toCap * (1 + perStack * (start + cap) / 2);
  return { stacks: cap, multSum: climb + (taps - toCap) * (1 + perStack * cap) };
}

/** Income multiple of worldIPS from holding to tap at `rate` with a full Combo, before Spurts (GDD 6.7). */
export function tapIncomeFactor(rate: number, tapPower: number, comboCap: number, critChance: number, critMult: number, t: Tuning): number {
  return rate * t.TAP_SECONDS * tapPower * comboMult(comboCap, t) * expectedCrit(critChance, critMult);
}
