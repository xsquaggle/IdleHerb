/** World twists (GDD 14.4) and World Mastery (GDD 14.5). Pure functions. */
import type { Family, Tuning } from '../../content/schema';

export type Weather = 'sunshine' | 'rain' | 'breeze' | 'rainbow';
export const WEATHER_ORDER: Weather[] = ['sunshine', 'rain', 'breeze', 'rainbow'];

export function weatherLoopSeconds(t: Pick<Tuning, 'WEATHER_LOOP'>): number {
  return t.WEATHER_LOOP.sunshine + t.WEATHER_LOOP.rain + t.WEATHER_LOOP.breeze + t.WEATHER_LOOP.rainbow;
}

/** Which weather is showing `seconds` into the fixed loop. */
export function weatherAt(seconds: number, t: Pick<Tuning, 'WEATHER_LOOP'>): Weather {
  let s = seconds % weatherLoopSeconds(t);
  for (const w of WEATHER_ORDER) {
    if (s < t.WEATHER_LOOP[w]) return w;
    s -= t.WEATHER_LOOP[w];
  }
  return 'rainbow';
}

/** Which weather group a family belongs to. */
export function weatherGroupOf(family: Family, t: Pick<Tuning, 'WEATHER_FAMILIES'>): 'sunshine' | 'rain' | 'breeze' {
  if (t.WEATHER_FAMILIES.sunshine.includes(family)) return 'sunshine';
  if (t.WEATHER_FAMILIES.rain.includes(family)) return 'rain';
  return 'breeze';
}

/**
 * Average profit multiplier over one weather loop for a floor whose plants
 * cover the given weather groups. GDD: 1.75 with one group, 2.38 with two, 3 with three.
 */
export function weatherAverage(groups: ReadonlySet<string>, t: Pick<Tuning, 'WEATHER_LOOP' | 'WEATHER_PROFIT'>): number {
  if (groups.size === 0) return 1;
  let favoured = t.WEATHER_LOOP.rainbow;
  for (const g of ['sunshine', 'rain', 'breeze'] as const) if (groups.has(g)) favoured += t.WEATHER_LOOP[g];
  const loop = weatherLoopSeconds(t);
  return (favoured * t.WEATHER_PROFIT + (loop - favoured)) / loop;
}

/** Heat multiplier: 1 + HEAT_PROFIT x Heat. */
export function heatMult(heat: number, t: Pick<Tuning, 'HEAT_PROFIT'>): number {
  return 1 + t.HEAT_PROFIT * heat;
}

/**
 * Average multiplier of a sweep that pops `floors` bubbles in a row inside the
 * chain window: BUBBLE_BONUS + min(chain max, step x (pops before this one)).
 * With eight floors this is the GDD's "about x2.6".
 */
export function bubbleSweepAverage(floors: number, t: Pick<Tuning, 'BUBBLE_BONUS' | 'BUBBLE_CHAIN_STEP' | 'BUBBLE_CHAIN_MAX'>): number {
  if (floors <= 0) return 1;
  let sum = 0;
  for (let i = 0; i < floors; i++) sum += t.BUBBLE_BONUS + Math.min(t.BUBBLE_CHAIN_MAX, t.BUBBLE_CHAIN_STEP * i);
  return sum / floors;
}

/** Sunrise multiplier for a streak of `streak` catches in a row before this one. */
export function sunriseMult(streak: number, t: Pick<Tuning, 'SUNRISE_BONUS' | 'SUNRISE_STREAK_STEP' | 'SUNRISE_BONUS_MAX'>): number {
  return Math.min(t.SUNRISE_BONUS_MAX, t.SUNRISE_BONUS + t.SUNRISE_STREAK_STEP * streak);
}

/** Long-run average Sunrise multiplier when each sunrise is caught with probability p. */
export function sunriseAverage(p: number, t: Pick<Tuning, 'SUNRISE_BONUS' | 'SUNRISE_STREAK_STEP' | 'SUNRISE_BONUS_MAX'>): number {
  if (p <= 0) return 1;
  // Streak length before a catch is geometric: P(streak = k) = (1 - p) p^k.
  let expected = 0;
  let prob = 1 - p;
  let tail = 1;
  for (let k = 0; k < 200; k++) {
    expected += prob * sunriseMult(k, t);
    tail -= prob;
    prob *= p;
  }
  expected += Math.max(0, tail) * t.SUNRISE_BONUS_MAX;
  return p * expected + (1 - p) * 1;
}

/** Mastery stars earned for a best-ever "lowest floor level" in a world. */
export function masteryStars(bestMinLevel: number, t: Pick<Tuning, 'MASTERY_LEVELS'>): number {
  let stars = 0;
  for (const lv of t.MASTERY_LEVELS) if (bestMinLevel >= lv) stars++;
  return stars;
}
