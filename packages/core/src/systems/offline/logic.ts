/** Offline earnings (GDD 15.1, 13.4). Pure functions. */
import type { Tuning } from '../../content/schema';

/** offlineEfficiency = (base + points added) x (1 + sum of "offline earnings" bonuses), capped. */
export function offlineEfficiency(pointsAdded: number, earningsBonus: number, t: Pick<Tuning, 'OFFLINE_EFF_BASE' | 'OFFLINE_EFF_CAP'>): number {
  return Math.min(t.OFFLINE_EFF_CAP, (t.OFFLINE_EFF_BASE + pointsAdded) * (1 + earningsBonus));
}

/** Compound Interest: +x% for every hour away, up to a maximum, applied after the efficiency cap. */
export function compoundInterest(awaySec: number, t: Pick<Tuning, 'COMPOUND_INTEREST_PER_HOUR' | 'COMPOUND_INTEREST_MAX'>): number {
  return 1 + Math.min(t.COMPOUND_INTEREST_MAX, t.COMPOUND_INTEREST_PER_HOUR * (awaySec / 3600));
}

/**
 * Average Heat over `seconds` of decay from `heat` toward `floor` at `decay` per second.
 * Used for Mount Mitten's offline earnings ("offline earnings use the falling value").
 */
export function averageHeat(heat: number, floor: number, decay: number, seconds: number): { average: number; end: number } {
  if (seconds <= 0) return { average: heat, end: heat };
  const start = Math.max(heat, floor);
  const fallTime = decay > 0 ? (start - floor) / decay : Infinity;
  if (seconds <= fallTime) {
    const end = start - decay * seconds;
    return { average: (start + end) / 2, end };
  }
  const area = ((start + floor) / 2) * fallTime + floor * (seconds - fallTime);
  return { average: area / seconds, end: floor };
}
