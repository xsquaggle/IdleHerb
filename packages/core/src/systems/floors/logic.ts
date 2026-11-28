/** Floors: milestones, cycle, payout and income (GDD 5.2). Pure functions. */
import { Num } from '../../kernel/num/num';
import type { Tuning } from '../../content/schema';
import type { FloorDef } from '../../content/content';

/** How many milestone thresholds are at or below `level`: 25, 50, 100, then every 100. */
export function milestoneCount(level: number, t: Pick<Tuning, 'MILESTONES_FIRST' | 'MILESTONES_STEP'>): number {
  const first = t.MILESTONES_FIRST;
  const last = first[first.length - 1]!;
  if (level >= last) return first.length + Math.floor((level - last) / t.MILESTONES_STEP);
  let n = 0;
  for (const m of first) if (level >= m) n++;
  return n;
}

/** The next milestone threshold above `level`. */
export function nextMilestone(level: number, t: Pick<Tuning, 'MILESTONES_FIRST' | 'MILESTONES_STEP'>): number {
  for (const m of t.MILESTONES_FIRST) if (level < m) return m;
  const last = t.MILESTONES_FIRST[t.MILESTONES_FIRST.length - 1]!;
  return last + (Math.floor((level - last) / t.MILESTONES_STEP) + 1) * t.MILESTONES_STEP;
}

/** The level of milestone number `tier` (1-based): tier 1 is 25, tier 3 is 100, tier 4 is 200. */
export function milestoneLevel(tier: number, t: Pick<Tuning, 'MILESTONES_FIRST' | 'MILESTONES_STEP'>): number {
  const first = t.MILESTONES_FIRST;
  if (tier <= first.length) return first[tier - 1]!;
  return first[first.length - 1]! + (tier - first.length) * t.MILESTONES_STEP;
}

export interface FloorOutput {
  /** Seconds per cycle as shown, never below MIN_CYCLE. */
  cycleSec: number;
  /** Paid per completed cycle, including the overflow factor when the cycle is capped. */
  payout: Num;
  /** payout / cycleSec. Identical whether or not the cycle is capped. */
  ips: Num;
}

/**
 * speedMult = MILESTONE_MULT^milestones x towerMult^towerMilestones x (other speed bonuses)
 * rawCycle  = baseCycle / speedMult;  cycle = max(MIN_CYCLE, rawCycle);  overflow = cycle / rawCycle
 * payout    = basePayout x level x overflow x profitMult
 */
export function floorOutput(
  def: FloorDef, level: number, towerMilestones: number, towerMult: number, speedBonus: number, profitMult: Num, t: Tuning,
): FloorOutput {
  if (level <= 0) return { cycleSec: def.baseCycleSec, payout: Num.ZERO, ips: Num.ZERO };
  const speed = Num.pow(t.MILESTONE_MULT, milestoneCount(level, t)).mul(Num.pow(towerMult, towerMilestones)).mul(speedBonus);
  const ips = def.basePayout.mul(level).mul(speed).mul(profitMult).div(def.baseCycleSec);
  // rawCycle as a plain number: 0 when the speed is beyond double range, which simply means "capped".
  const speedPlain = speed.toNumber();
  const rawCycle = Number.isFinite(speedPlain) && speedPlain > 0 ? def.baseCycleSec / speedPlain : 0;
  const cycleSec = Math.max(t.MIN_CYCLE, rawCycle);
  return { cycleSec, payout: ips.mul(cycleSec), ips };
}

/**
 * Advances a managed floor by `dt` seconds. Exact for any step: cycles are
 * found by division, so advancing by a + b equals advancing by a then by b.
 */
export function advanceCycles(progress: number, dt: number, cycleSec: number): { cycles: number; progress: number } {
  const total = progress + dt / cycleSec;
  const cycles = Math.floor(total + 1e-12);
  return { cycles, progress: Math.max(0, total - cycles) };
}
