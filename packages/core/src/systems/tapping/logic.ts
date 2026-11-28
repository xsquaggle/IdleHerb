/** Tapping: Combo, Bumpers and tap value (GDD 6). Pure functions. */
import type { Tuning } from '../../content/schema';
import { chance, type RngState } from '../../kernel/rng/rng';

/**
 * Where a tap comes from (design 0.5, EXPANSION 1.3 rule 7). Only counted sources are counted taps
 * (GDD 6.1): they feed the Combo, the Spurt meter, Hearth Heat and the tap counters and achievements.
 * Taps in a field activity are not counted; the activity handles them itself.
 */
export const TAP_SOURCES = {
  /** A tap or click on the tower. */
  tower: { counted: true },
  /** The tap key (Space) on a PC. */
  key: { counted: true },
  /** A tap in a field activity (fishing, digging, mining; Phase 2). */
  field: { counted: false },
} as const satisfies Record<string, { counted: boolean }>;
export type TapSource = keyof typeof TAP_SOURCES;

export function isCountedTap(source: TapSource | undefined): boolean {
  return TAP_SOURCES[source ?? 'tower'].counted;
}

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
