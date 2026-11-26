/**
 * Fits the gate prices to the pacing table of GDD 17.6.
 *
 *   pnpm sim calibrate [--base id[,id]] [--out id] [--profile active] [--only step[,step]]
 *
 * Each step owns one number (a ticket price, the first Replant minimum, the
 * Ribbon scale, a deed) and one target (when a simulated player should pass
 * that gate). The steps run in order, because every gate moves the ones after
 * it. A step searches its number in log space until the gate lands on the
 * target, then rounds the number to two digits. The result is written as an
 * overlay in apps/sim/proposals/, on top of the overlays named by --base.
 *
 * Rerun it after any design change: the fitted prices are only right for the
 * content they were fitted to.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { cpus } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRaw, readOverlay, writeOverlay, type Overlay } from '@sprout/content';
import type { RunResult, TimelineEvent } from './run';

const here = dirname(fileURLToPath(import.meta.url));
const SIM_DIR = join(here, '..');
const REPO_DIR = join(SIM_DIR, '../..');
const PROPOSALS_DIR = join(SIM_DIR, 'proposals');
const TMP_DIR = join(SIM_DIR, 'out', 'calibrate');

const DAY = 86400;

interface Step {
  id: string;
  label: string;
  /** Where the number lives. */
  knob: { tuning: string } | { ticketOf: string } | { deed: string };
  /** Target time of the gate in seconds, per profile. */
  target: Record<string, number>;
  event: (e: TimelineEvent) => boolean;
  /** Search step in orders of magnitude for the first bracket. */
  stride: number;
}

const firstWorld = (w: number) => (e: TimelineEvent) => e.kind === 'world' && e.world === w && e.n === 1;

/**
 * GDD 17.6 pacing table (days) with the Game Designer's rulings of 2026-11-26:
 * active first Replant 30 to 55 minutes, every first Replant inside day 1,
 * and the new idle targets (a new world about every six days).
 */
export const STEPS: Step[] = [
  { id: 'replant', label: 'First Replant', knob: { tuning: 'FIRST_REPLANT_MIN' }, target: { active: 41 * 60, mixed: 4.4 * 3600, idle: 16 * 3600 }, event: (e) => e.kind === 'replant', stride: 0.5 },
  { id: 'w2', label: 'World 2', knob: { ticketOf: 'world.w1' }, target: { active: 0.5 * DAY, mixed: 1.4 * DAY, idle: 8 * DAY }, event: firstWorld(1), stride: 2 },
  { id: 'w3', label: 'World 3', knob: { ticketOf: 'world.w2' }, target: { active: 2.6 * DAY, mixed: 4.1 * DAY, idle: 13 * DAY }, event: firstWorld(2), stride: 2 },
  { id: 'festival', label: 'First Harvest Festival', knob: { tuning: 'RIBBON_C0' }, target: { active: 4.1 * DAY, mixed: 5.4 * DAY, idle: 16 * DAY }, event: (e) => e.kind === 'festival', stride: 2 },
  { id: 'w4', label: 'World 4', knob: { ticketOf: 'world.w3' }, target: { active: 6.7 * DAY, mixed: 10.1 * DAY, idle: 20 * DAY }, event: firstWorld(3), stride: 3 },
  { id: 'w5', label: 'World 5', knob: { ticketOf: 'world.w4' }, target: { active: 12.2 * DAY, mixed: 18.1 * DAY, idle: 26 * DAY }, event: firstWorld(4), stride: 3 },
  { id: 'w6', label: 'World 6', knob: { ticketOf: 'world.w5' }, target: { active: 19.5 * DAY, mixed: 30.5 * DAY, idle: 30 * DAY }, event: firstWorld(5), stride: 3 },
];

function flags(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (!a.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[a.slice(2)] = 'true';
    else out[a.slice(2)] = argv[++i]!;
  }
  return out;
}

/** The knob's value in the tables once the base overlays are applied. */
function currentValue(step: Step, raw: ReturnType<typeof loadRaw>): number {
  const k = step.knob;
  if ('tuning' in k) return Number((raw.tuning as Record<string, unknown>)[k.tuning]);
  if ('ticketOf' in k) return Number(raw.worlds.find((w) => w.id === k.ticketOf)!.ticket);
  return Number(raw.ribbonShop.find((r) => r.id === k.deed)!.costs![0]);
}

function patch(overlay: Overlay, step: Step, value: number): void {
  const k = step.knob;
  if ('tuning' in k) {
    (overlay.tuning ??= {})[k.tuning] = value;
  } else if ('ticketOf' in k) {
    ((overlay.rows ??= {}).worlds ??= {})[k.ticketOf] = { ticket: value.toExponential().replace('+', '') };
  } else {
    ((overlay.rows ??= {}).ribbonShop ??= {})[k.deed] = { costs: [value] };
  }
}

/** Two significant digits, so the fitted prices read like designed numbers. */
function tidy(value: number, integer: boolean): number {
  const v = Number(value.toPrecision(2));
  return integer ? Math.max(1, Math.round(v)) : v;
}

let serial = 0;

/** Runs one player and returns when the step's gate was passed (Infinity if it never was). */
function evaluate(base: string[], fitted: Overlay, step: Step, value: number, profile: string, days: number): Promise<number> {
  const id = `tmp-calibrate-${process.pid}-${serial++}`;
  const overlay: Overlay = JSON.parse(JSON.stringify(fitted));
  overlay.id = id;
  patch(overlay, step, value);
  const file = join(PROPOSALS_DIR, `${id}.yaml`);
  const out = join(TMP_DIR, `${id}.json`);
  writeOverlay(file, overlay);
  return new Promise((resolve, reject) => {
    const args = [join(here, 'cli.ts'), 'run', '--quiet', '--name', id, '--profile', profile, '--days', String(days), '--proposal', [...base, id].join(','), '--out', out];
    const child = spawn(join(REPO_DIR, 'node_modules/.bin/tsx'), args, { stdio: ['ignore', 'inherit', 'inherit'] });
    child.on('error', reject);
    child.on('exit', (code) => {
      try {
        if (code !== 0) throw new Error(`calibration run failed with code ${code}`);
        const result = (JSON.parse(readFileSync(out, 'utf8')) as { result: RunResult }).result;
        resolve(result.timeline.find(step.event)?.t ?? Infinity);
      } catch (err) {
        reject(err as Error);
      } finally {
        rmSync(file, { force: true });
        rmSync(out, { force: true });
      }
    });
  });
}

const show = (t: number): string => (t === Infinity ? 'never' : t < 2 * 3600 ? `${(t / 60).toFixed(0)} min` : t < DAY ? `${(t / 3600).toFixed(1)} h` : `day ${(t / DAY).toFixed(2)}`);

export async function calibrate(argv: string[]): Promise<void> {
  const f = flags(argv);
  const base = f.base ? f.base.split(',') : [];
  const outId = f.out ?? 'fitted-gates';
  const profile = f.profile ?? 'active';
  const only = f.only ? new Set(f.only.split(',')) : null;
  const jobs = Math.max(1, Math.min(4, Number(f.jobs ?? cpus().length)));
  mkdirSync(TMP_DIR, { recursive: true });

  const baseOverlays = base.map((id) => readOverlay(join(PROPOSALS_DIR, `${id}.yaml`)));
  // Start from an earlier fit when one exists, so a rerun only refines it.
  let fitted: Overlay = { id: outId };
  if (f.resume === 'true') {
    try {
      fitted = readOverlay(join(PROPOSALS_DIR, `${outId}.yaml`));
    } catch {
      // No earlier fit.
    }
  }
  // Keep the notes of the gates that are not fitted again.
  const notes: string[] = (fitted.why ?? '')
    .split('\n')
    .slice(1)
    .filter((l) => l.trim() !== '' && !STEPS.some((st) => (!only || only.has(st.id)) && l.startsWith(`${st.label}:`)));

  for (const step of STEPS) {
    if (only && !only.has(step.id)) continue;
    const target = step.target[profile]!;
    const days = Math.max(0.25, (target / DAY) * 1.7 + 0.2);
    const raw = loadRaw({ overlays: [...baseOverlays, fitted] });
    const start = currentValue(step, raw);
    const integer = !('ticketOf' in step.knob);
    const run = (x: number): Promise<number> => evaluate(base, fitted, step, 10 ** x, profile, days);
    const seen = new Map<number, number>();
    const measure = async (xs: number[]): Promise<void> => {
      const todo = xs.filter((x) => !seen.has(x));
      for (let i = 0; i < todo.length; i += jobs) {
        const batch = todo.slice(i, i + jobs);
        const ts = await Promise.all(batch.map(run));
        batch.forEach((x, k) => seen.set(x, ts[k]!));
      }
    };

    // Bracket the target: the gate is passed later the higher the number.
    const x0 = Math.log10(start);
    let lo = x0;
    let hi = x0;
    await measure([x0]);
    if (seen.get(x0)! > target) {
      for (let k = 0; k < 8 && seen.get(lo)! > target; k++) {
        const next = [1, 2, 3, 4].map((n) => lo - n * step.stride);
        await measure(next);
        hi = lo;
        for (const x of next) {
          if (seen.get(x)! <= target) {
            lo = x;
            break;
          }
          hi = x;
        }
        if (seen.get(lo)! > target) lo = next[next.length - 1]!;
      }
    } else {
      for (let k = 0; k < 8 && seen.get(hi)! <= target; k++) {
        const next = [1, 2, 3, 4].map((n) => hi + n * step.stride);
        await measure(next);
        lo = hi;
        for (const x of next) {
          if (seen.get(x)! > target) {
            hi = x;
            break;
          }
          lo = x;
        }
        if (seen.get(hi)! <= target) hi = next[next.length - 1]!;
      }
    }
    // Nothing in reach lands the gate in time: some other number binds it. Leave this one alone.
    if (seen.get(lo)! > target) {
      const line = `${step.label}: not fitted. Even ${(10 ** lo).toPrecision(2)} lands ${show(seen.get(lo)!)} against ${show(target)}, so another gate binds it.`;
      notes.push(line);
      console.log(line);
      continue;
    }
    // Narrow the bracket: four points inside it per round.
    for (let round = 0; round < 4 && hi - lo > 0.04; round++) {
      const inner = [1, 2, 3, 4].map((n) => lo + ((hi - lo) * n) / 5);
      await measure(inner);
      for (const x of inner) {
        if (seen.get(x)! <= target) lo = x;
        else {
          hi = x;
          break;
        }
      }
    }
    // The tidy number closest to the target among the two ends of the bracket.
    const candidates = [...new Set([tidy(10 ** lo, integer), tidy(10 ** hi, integer)])];
    const times = await Promise.all(candidates.map((v) => evaluate(base, fitted, step, v, profile, days)));
    let best = 0;
    for (let i = 1; i < candidates.length; i++) {
      if (Math.abs(Math.log(times[i]! / target)) < Math.abs(Math.log(times[best]! / target))) best = i;
    }
    const value = candidates[best]!;
    patch(fitted, step, value);
    const line = `${step.label}: ${start.toPrecision(3)} -> ${value.toPrecision(2)} (target ${show(target)}, lands ${show(times[best]!)}; was ${show(seen.get(x0)!)})`;
    notes.push(line);
    console.log(line);
    fitted.id = outId;
    fitted.title = `Gate prices fitted to the pacing targets (${profile} profile)`;
    fitted.why = `Fitted by "pnpm sim calibrate" on top of ${base.length ? base.join(', ') : 'the GDD tables'}.\n${notes.join('\n')}`;
    writeOverlay(join(PROPOSALS_DIR, `${outId}.yaml`), fitted);
  }
  console.log(`wrote apps/sim/proposals/${outId}.yaml`);
}
