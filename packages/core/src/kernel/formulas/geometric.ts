/**
 * Geometric cost curves (GDD 5.2, docs/tech/05-big-numbers.md rule 3).
 * Written once here; the game, the simulator and the tests all call these.
 */
import { Num, type NumLike } from '../num/num';

/** Cost to go from `level` to `level + 1`: base x growth^(level - 1) x costMult. */
export function levelCost(base: NumLike, growth: number, level: number, costMult = 1): Num {
  return Num.pow(growth, level - 1).mul(base).mul(costMult);
}

/**
 * Cost of the next `count` levels starting from `level`:
 * base x growth^(level - 1) x (growth^count - 1) / (growth - 1) x costMult.
 */
export function bulkCost(base: NumLike, growth: number, level: number, count: number, costMult = 1): Num {
  if (count <= 0) return Num.ZERO;
  if (count === 1) return levelCost(base, growth, level, costMult);
  const first = levelCost(base, growth, level, costMult);
  if (growth === 1) return first.mul(count);
  return first.mul(Num.pow(growth, count).sub(1)).div(growth - 1);
}

/**
 * The most levels `cash` can buy starting from `level`.
 * Closed form first, then confirmed against the cost formula and stepped by
 * one if the logarithm rounded the wrong way (tech plan 05, rule 3).
 */
export function maxAffordable(base: NumLike, growth: number, level: number, cash: Num, costMult = 1): number {
  const first = levelCost(base, growth, level, costMult);
  if (cash.lt(first)) return 0;
  let count: number;
  if (growth === 1) {
    count = Math.floor(cash.div(first).toNumber());
  } else {
    // count = floor(log_growth(1 + cash x (growth - 1) / first))
    const ratio = cash.mul(growth - 1).div(first).add(1);
    count = Math.floor(ratio.log10() / Math.log10(growth));
  }
  if (!Number.isFinite(count) || count < 1) count = 1;
  while (count > 0 && bulkCost(base, growth, level, count, costMult).gt(cash)) count--;
  while (bulkCost(base, growth, level, count + 1, costMult).lte(cash)) count++;
  return count;
}
