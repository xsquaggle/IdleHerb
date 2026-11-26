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

/** A target as a window of days: on target anywhere inside it. */
export interface Window {
  lo: number;
  hi: number;
  /** Where the chart draws the target ring. */
  at: number;
  label: string;
}

const dayLabel = (d: number): string => when(d * DAY);
/** A point target from the GDD 17.6 table: a third early to half late counts as on target. */
const around = (d: number): Window => ({ lo: d * 0.67, hi: d * 1.5, at: d, label: dayLabel(d) });
/** "By day d": up to d, and no more than a third earlier. */
const by = (d: number): Window => ({ lo: d * 0.67, hi: d, at: d, label: `by ${dayLabel(d)}` });

/**
 * The pacing targets in force: the GDD 17.6 table with the Game Designer's
 * rulings of 2026-11-26 (active first Replant 30 to 55 minutes, every first
 * Replant inside day 1, new idle targets, Festival counts as ranges).
 */
export const TARGETS: Record<string, { topFloor: Window; replant: Window; worlds: (Window | null)[]; festival: Window; festivalsBy30: [number, number] }> = {
  active: {
    topFloor: around(32 / 1440),
    replant: { lo: 30 / 1440, hi: 55 / 1440, at: 41 / 1440, label: '30 to 55 min' },
    worlds: [null, around(0.5), around(2.6), around(6.7), around(12.2), around(19.5)],
    festival: around(4.1),
    festivalsBy30: [9, 11],
  },
  mixed: {
    topFloor: around(30 / 1440),
    replant: { lo: (4.4 / 24) * 0.67, hi: 1, at: 4.4 / 24, label: 'inside day 1' },
    worlds: [null, around(1.4), around(4.1), around(10.1), around(18.1), around(30.5)],
    festival: around(5.4),
    festivalsBy30: [9, 11],
  },
  idle: {
    topFloor: around(11 / 24),
    replant: { lo: (16 / 24) * 0.67, hi: 1, at: 16 / 24, label: 'inside day 1' },
    worlds: [null, by(8), by(13), by(20), by(26), { lo: 30, hi: 60, at: 30, label: 'day 30 or later' }],
    festival: by(16),
    festivalsBy30: [6, 8],
  },
};

/** How a measured time (seconds) sits against a window of days. */
export function windowVerdict(measured: number | null, w: Window): { text: string; ok: boolean } {
  if (measured === null) return { text: 'not reached', ok: false };
  const d = measured / DAY;
  if (d < w.lo) return { text: `${(w.lo / d).toFixed(1)} times early`, ok: false };
  if (d > w.hi) return { text: `${(d / w.hi).toFixed(1)} times late`, ok: false };
  return { text: 'on target', ok: true };
}

/**
 * The Festival rhythm the Game Designer set on 2026-11-26: gaps of 1 to 3 days
 * up to day 10, 3 to 6 days up to day 30, 5 to 9 days after, never more than
 * 10, and no gap more than about twice the one before.
 */
export function rhythmBreaks(r: RunResult): string[] {
  const out: string[] = [];
  const gaps = festivalGaps(r);
  gaps.forEach((g, i) => {
    const [lo, hi] = g.from < 10 ? [1, 3] : g.from < 30 ? [3, 6] : [5, 9];
    const where = `day ${g.from.toFixed(1)}`;
    if (g.days > 10) out.push(`${g.days.toFixed(1)} days from ${where}${g.open ? ' (still open at the end)' : ''}, above the 10-day limit`);
    else if (!g.open && (g.days < lo * 0.8 || g.days > hi * 1.2)) out.push(`${g.days.toFixed(1)} days from ${where} (wanted ${lo} to ${hi})`);
    const prev = gaps[i - 1];
    if (prev && !g.open && g.days > 2.2 * prev.days && g.days > 2) out.push(`a jump from ${prev.days.toFixed(1)} to ${g.days.toFixed(1)} days at ${where}`);
  });
  return out;
}

/** Share of the Compost paid by Replants of one world between two days (Replant events carry log10 of their Compost). */
export function compostShare(r: RunResult, world: number, fromDay: number, toDay: number): number | null {
  const ev = r.timeline.filter((e) => e.kind === 'replant' && e.t >= fromDay * DAY && e.t < toDay * DAY && typeof e.amount === 'number');
  if (!ev.length) return null;
  const top = Math.max(...ev.map((e) => e.amount!));
  let all = 0;
  let mine = 0;
  for (const e of ev) {
    const v = 10 ** (e.amount! - top);
    all += v;
    if (e.world === world) mine += v;
  }
  return mine / all;
}

/** Days after a world's first arrival when its lowest floor first reached each level (best ever, from the samples). */
export function levelCrossings(r: RunResult, world: number, levels: number[]): (number | null)[] {
  const arrival = world === 0 ? 0 : first(r, (e) => e.kind === 'world' && e.world === world && e.n === 1);
  if (arrival === null) return levels.map(() => null);
  return levels.map((lv) => {
    const s = r.samples.find((x) => (x.worlds[world]?.best ?? 0) >= lv);
    return s ? Math.max(0, (s.t - arrival) / DAY) : null;
  });
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
