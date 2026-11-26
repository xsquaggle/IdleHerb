/**
 * Numbers read out of finished runs: when each gate was passed, how the pace
 * compares with the GDD's targets, where the game goes quiet.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RunResult, Sample, TimelineEvent } from './run';
import type { RunSpec } from './suite';

export const DAY = 86400;
export const HOUR = 3600;
export const MIN = 60;

export interface Loaded {
  spec: RunSpec;
  result: RunResult;
}

export function load(dir: string, name: string): Loaded | null {
  const file = join(dir, `${name}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8')) as Loaded;
}

/** 12 min, 3.4 h, day 2.4: one way to write a time everywhere in the report. */
export function when(t: number | null | undefined): string {
  if (t === null || t === undefined || !Number.isFinite(t)) return 'not reached';
  if (t < 2 * HOUR) return `${(t / MIN).toFixed(t < 10 * MIN ? 1 : 0)} min`;
  if (t < DAY) return `${(t / HOUR).toFixed(1)} h`;
  return `day ${(t / DAY).toFixed(1)}`;
}

export function first(r: RunResult, pred: (e: TimelineEvent) => boolean): number | null {
  return r.timeline.find(pred)?.t ?? null;
}

export interface Gates {
  topFloor: number | null;
  replant: number | null;
  festival: number | null;
  /** worlds[1] is World 2. */
  worlds: (number | null)[];
}

export function gates(r: RunResult): Gates {
  return {
    topFloor: first(r, (e) => e.kind === 'floor' && e.world === 0 && e.n === 10),
    replant: first(r, (e) => e.kind === 'replant'),
    festival: first(r, (e) => e.kind === 'festival'),
    worlds: [0, 1, 2, 3, 4, 5].map((w) => (w === 0 ? 0 : first(r, (e) => e.kind === 'world' && e.world === w && e.n === 1))),
  };
}

/** The last sample taken at or before `t`. */
export function sampleAt(r: RunResult, t: number): Sample {
  let out = r.samples[0]!;
  for (const s of r.samples) {
    if (s.t <= t + 1) out = s;
    else break;
  }
  return out;
}

export function countBy(r: RunResult, kind: TimelineEvent['kind'], from: number, to: number): number {
  let n = 0;
  for (const e of r.timeline) if (e.kind === kind && e.t >= from && e.t < to) n++;
  return n;
}

export function levelAt(r: RunResult, t: number): number {
  let level = 1;
  for (const e of r.timeline) if (e.kind === 'level' && e.t <= t && (e.n ?? 0) > level) level = e.n!;
  return level;
}

export function levelTime(r: RunResult, level: number): number | null {
  return first(r, (e) => e.kind === 'level' && (e.n ?? 0) >= level);
}

export function floorTime(r: RunResult, floor: number): number | null {
  return first(r, (e) => e.kind === 'floor' && e.world === 0 && e.n === floor);
}

export function unlockTime(r: RunResult, id: string): number | null {
  return r.unlocks.find((u) => u.id === id)?.t ?? null;
}

/** How a measured time compares with its target. Within a third early or a half late counts as on target. */
export function verdictOf(measured: number | null, target: number): { ratio: number | null; text: string; ok: boolean } {
  if (measured === null) return { ratio: null, text: 'not reached', ok: false };
  const ratio = measured / target;
  if (ratio < 0.67) return { ratio, text: `${(1 / ratio).toFixed(1)} times early`, ok: false };
  if (ratio > 1.5) return { ratio, text: `${ratio.toFixed(1)} times late`, ok: false };
  return { ratio, text: 'on target', ok: true };
}

/** Days between Harvest Festivals, with the open stretch at the end of the run as the last entry. */
export function festivalGaps(r: RunResult): { from: number; days: number; open: boolean }[] {
  const ts = r.timeline.filter((e) => e.kind === 'festival').map((e) => e.t);
  const out: { from: number; days: number; open: boolean }[] = [];
  for (let i = 1; i < ts.length; i++) out.push({ from: ts[i - 1]! / DAY, days: (ts[i]! - ts[i - 1]!) / DAY, open: false });
  if (ts.length > 0) out.push({ from: ts[ts.length - 1]! / DAY, days: r.meta.days - ts[ts.length - 1]! / DAY, open: true });
  return out;
}

/** Progress events that a player would call "something happened": per day of the run. */
const PROGRESS: TimelineEvent['kind'][] = ['unlock', 'world', 'replant', 'festival', 'star', 'research', 'heirloom', 'bench', 'floor'];

export function progressPerDay(r: RunResult): number[] {
  const out = Array.from({ length: Math.ceil(r.meta.days) }, () => 0);
  for (const e of r.timeline) {
    if (!PROGRESS.includes(e.kind)) continue;
    if (e.kind === 'world' && e.n !== 1) continue;
    const d = Math.floor(e.t / DAY);
    if (d < out.length) out[d]!++;
  }
  return out;
}

/** The longest stretch of open-game time between two reward beats, in seconds of play. */
export function longestBeatGap(r: RunResult, fromDay = 0, toDay = Infinity): { seconds: number; atDay: number } {
  let best = 0;
  let at = 0;
  let prev: [number, number] | null = null;
  for (const b of r.beats) {
    if (b[0] < fromDay * DAY || b[0] >= toDay * DAY) continue;
    if (prev && b[1] - prev[1] > best) {
      best = b[1] - prev[1];
      at = b[0] / DAY;
    }
    prev = b;
  }
  return { seconds: best, atDay: at };
}

/** Orders of magnitude of all-time Compost gained between two days. */
export function compostGrowth(r: RunResult, fromDay: number, toDay: number): number | null {
  const a = sampleAt(r, fromDay * DAY).compostAll;
  const b = sampleAt(r, toDay * DAY).compostAll;
  if (b === null) return null;
  return b - (a ?? 0);
}

/** Time-weighted session averages between two days. */
export function sessionAverage(r: RunResult, fromDay: number, toDay: number, pick: (s: RunResult['sessions'][number]) => number, world?: number): number | null {
  let sum = 0;
  let sec = 0;
  for (const s of r.sessions) {
    if (s.t <= fromDay * DAY || s.t > toDay * DAY) continue;
    if (world !== undefined && s.world !== world) continue;
    sum += pick(s) * s.seconds;
    sec += s.seconds;
  }
  return sec > 0 ? sum / sec : null;
}

export function totalXp(s: Sample): number {
  return Object.values(s.xp).reduce((a, b) => a + b, 0);
}

/** Linear-in-log interpolation of a budget row of GDD 17.6. */
export function budgetAt(points: [number, number][], day: number): number {
  if (day <= points[0]![0]) return points[0]![1];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]!;
    const [x1, y1] = points[i]!;
    if (day <= x1) {
      const f = (day - x0) / (x1 - x0);
      return Math.exp(Math.log(y0) * (1 - f) + Math.log(y1) * f);
    }
  }
  return points[points.length - 1]![1];
}

/** The multiplier budget behind the GDD 17.6 pacing table (the designer's rough script). */
export const BUDGET = {
  manager: [[0, 2], [1, 2.5], [7, 5], [30, 9], [60, 13]] as [number, number][],
  everythingElse: [[0, 1], [0.04, 1.1], [1, 4], [3, 16], [7, 120], [14, 700], [30, 7000], [60, 20000]] as [number, number][],
  tapMultiple: [[0, 1.9], [1, 2.5], [7, 5], [30, 10], [60, 14]] as [number, number][],
  /** Share of an active session inside a Growth Spurt that the script assumes (x3 for 20 s per 300 taps). */
  spurtShare: 0.29,
};

/** GDD 17.6 pacing table, in days. */
export const PACING: Record<string, { topFloor: number; replant: number; worlds: number[]; festival: number; festivalsBy30: number }> = {
  active: { topFloor: 32 / 1440, replant: 55 / 1440, worlds: [0, 0.5, 2.6, 6.7, 12.2, 19.5], festival: 4.1, festivalsBy30: 13 },
  mixed: { topFloor: 30 / 1440, replant: 4.4 / 24, worlds: [0, 1.4, 4.1, 10.1, 18.1, 30.5], festival: 5.4, festivalsBy30: 11 },
  idle: { topFloor: 11 / 24, replant: 16 / 24, worlds: [0, 3.2, 5.2, 16.2, 27.2, 52.2], festival: 8.2, festivalsBy30: 7 },
};
