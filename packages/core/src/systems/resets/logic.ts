/** Replant and Harvest Festival formulas (GDD 12). Pure functions. */
import { Num } from '../../kernel/num/num';

/** compostTotal(w) = floor(K x (lifetime / E0)^exp x gainMult). */
export function compostTotal(lifetime: Num, k: number, e0: Num, exp: number, gainMult: number): Num {
  if (lifetime.lte(0)) return Num.ZERO;
  return lifetime.div(e0).pow(exp).mul(k * gainMult).floor();
}

/** The lifetime earnings needed for a given Compost total (inverse of compostTotal, without the floor). */
export function lifetimeForCompost(compost: Num, k: number, e0: Num, exp: number, gainMult: number): Num {
  return compost.div(k * gainMult).pow(1 / exp).mul(e0);
}

/** ribbonsTotal = floor((compostAllTime / C0)^exp). */
export function ribbonsTotal(compostAllTime: Num, c0: Num, exp: number): Num {
  if (compostAllTime.lte(0)) return Num.ZERO;
  return compostAllTime.div(c0).pow(exp).floor();
}

/** Price of level n (from 1) of a shop item with a geometric price: base x growth^(n-1), rounded up. */
export function shopCost(base: number, growth: number, n: number): Num {
  return Num.pow(growth, n - 1).mul(base).sub(1e-9).ceil().max(1);
}

/**
 * New Compost record (GDD 9.1): `step x n` XP the first time all-time Compost
 * passes 2^n. `passed` is the highest n already paid. A Replant that crosses
 * several powers of two pays each of them.
 */
export function compostRecordXp(passed: number, compostAllTime: Num, step: number): { xp: number; passed: number } {
  if (compostAllTime.lt(2)) return { xp: 0, passed };
  const reached = Math.floor(compostAllTime.log10() / Math.log10(2) + 1e-9);
  if (reached <= passed) return { xp: 0, passed };
  // step x (passed + 1 + ... + reached)
  const xp = (step * (reached * (reached + 1) - passed * (passed + 1))) / 2;
  return { xp, passed: reached };
}
