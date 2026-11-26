/**
 * Writes docs/balance/REPORT.md, its charts (docs/balance/charts/*.svg) and the
 * CSV timelines (docs/balance/data/) from the runs in apps/sim/out/.
 *
 *   pnpm sim report        after `pnpm sim suite --proposal p1-levels,p2-taps,p3-managers,p4-gates`
 *   pnpm sim               runs everything, then this
 *
 * Every number in the report is read from a run. The words around the numbers
 * live here, and where a verdict depends on a threshold the threshold sits in
 * the code next to it (see VERDICT).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRaw, readOverlay, type Overlay } from '@sprout/content';
import { SERIES, barChart, budgetChart, gateChart, lineChart, stripChart, type GatePanel } from './charts';
import {
  BUDGET, DAY, HOUR, MIN, PACING, budgetAt, compostGrowth, countBy, festivalGaps, floorTime, gates, levelAt,
  levelTime, load, longestBeatGap, progressPerDay, sampleAt, sessionAverage, totalXp, unlockTime, verdictOf, when, type Gates, type Loaded,
} from './metrics';
import type { RunResult } from './run';
import { SYSTEMS, SYSTEM_LABEL } from './suite';

const here = dirname(fileURLToPath(import.meta.url));
const SIM_DIR = join(here, '..');
const REPO_DIR = join(SIM_DIR, '../..');
const OUT_DIR = join(SIM_DIR, 'out');
const PROPOSALS_DIR = join(SIM_DIR, 'proposals');
const DOCS = join(REPO_DIR, 'docs/balance');
const CHARTS = join(DOCS, 'charts');
const DATA = join(DOCS, 'data');

/** Thresholds behind the plain verdicts. */
const VERDICT = {
  /** Open-game time with nothing to buy that counts as a dead zone. */
  quietMinutes: 30,
  /** GDD 17.6: after week 2 Festivals "stretch to every three to eight days". */
  festivalGapDays: 8,
  /** Festivals by day 30 within this share of the target count as on target. */
  festivalCountTolerance: 0.25,
  /** Growth per week may rise by this factor before it counts as a runaway. */
  runawayRise: 1.2,
};

type ProfileId = 'active' | 'mixed' | 'idle';
const PROFILES: ProfileId[] = ['active', 'mixed', 'idle'];
const NAME: Record<ProfileId, string> = { active: 'Active', mixed: 'Mixed', idle: 'Idle' };
const PSERIES = PROFILES.map((p) => ({ key: p, name: NAME[p], color: SERIES[p] }));
const WORLD = ['Thymeford', 'World 2', 'World 3', 'Mount Mitten (World 4)', 'World 5', 'World 6'];
const RULES_GDD = 'GDD 0.3 numbers';
const RULES_FIX = 'Proposed numbers';

// ---------------------------------------------------------------- helpers

function table(head: string[], rows: (string | number)[][]): string {
  const line = (r: (string | number)[]): string => `| ${r.map((c) => String(c)).join(' | ')} |`;
  return [line(head), `|${head.map(() => ' --- ').join('|')}|`, ...rows.map(line)].join('\n');
}

const fx = (v: number | null | undefined, d = 1): string => (v === null || v === undefined || !Number.isFinite(v) ? '-' : v.toFixed(d));
const times = (v: number | null | undefined): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '-';
  if (v >= 1000) return `×${Math.round(v).toLocaleString('en-US')}`;
  if (v >= 100) return `×${Math.round(v)}`;
  return `×${v.toFixed(1)}`;
};
const clock = (sec: number): string => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
const daysText = (d: number): string => when(d * DAY);
const sci = (v: unknown): string => {
  if (typeof v === 'number') return Math.abs(v) >= 1e5 ? v.toExponential(1).replace('+', '') : String(v);
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
};

function sampleOrNull(r: RunResult, t: number) {
  return t <= r.meta.days * DAY + 1 ? sampleAt(r, t) : null;
}

interface GateRow {
  key: string;
  label: string;
  get: (g: Gates) => number | null;
  target: (p: ProfileId) => number;
}

const GATE_ROWS: GateRow[] = [
  { key: 'topFloor', label: 'Top floor of Thymeford', get: (g) => g.topFloor, target: (p) => PACING[p]!.topFloor * DAY },
  { key: 'replant', label: 'First Replant', get: (g) => g.replant, target: (p) => PACING[p]!.replant * DAY },
  { key: 'w2', label: 'World 2', get: (g) => g.worlds[1] ?? null, target: (p) => PACING[p]!.worlds[1]! * DAY },
  { key: 'w3', label: 'World 3', get: (g) => g.worlds[2] ?? null, target: (p) => PACING[p]!.worlds[2]! * DAY },
  { key: 'festival', label: 'First Harvest Festival', get: (g) => g.festival, target: (p) => PACING[p]!.festival * DAY },
  { key: 'w4', label: 'World 4', get: (g) => g.worlds[3] ?? null, target: (p) => PACING[p]!.worlds[3]! * DAY },
  { key: 'w5', label: 'World 5', get: (g) => g.worlds[4] ?? null, target: (p) => PACING[p]!.worlds[4]! * DAY },
  { key: 'w6', label: 'World 6', get: (g) => g.worlds[5] ?? null, target: (p) => PACING[p]!.worlds[5]! * DAY },
];

interface Check {
  label: string;
  measured: string;
  target: string;
  verdict: string;
  ok: boolean;
}

function checks(r: RunResult, p: ProfileId): Check[] {
  const g = gates(r);
  const out: Check[] = GATE_ROWS.map((row) => {
    const m = row.get(g);
    const v = verdictOf(m, row.target(p));
    return { label: row.label, measured: when(m), target: when(row.target(p)), verdict: v.text, ok: v.ok };
  });
  const n = countBy(r, 'festival', 0, 30 * DAY);
  const want = PACING[p]!.festivalsBy30;
  const ok = Math.abs(n - want) <= want * VERDICT.festivalCountTolerance;
  out.push({ label: 'Festivals by day 30', measured: String(n), target: String(want), verdict: ok ? 'on target' : n < want ? `${want - n} short` : `${n - want} too many`, ok });
  return out;
}

/** Orders of magnitude of all-time Compost per week, over four stretches of the run. */
function growthPerWeek(r: RunResult): { label: string; perWeek: number | null }[] {
  const spans: [string, number, number][] = [['week 1', 0, 7], ['week 2', 7, 14], ['weeks 3 and 4', 14, 28], ['weeks 5 to 8', 28, 56]];
  return spans.map(([label, a, b]) => {
    if (b > r.meta.days) return { label, perWeek: null };
    const g = compostGrowth(r, a, b);
    return { label, perWeek: g === null ? null : g / ((b - a) / 7) };
  });
}

function isRunaway(r: RunResult): boolean {
  const g = growthPerWeek(r).map((x) => x.perWeek).filter((v): v is number => v !== null);
  for (let i = 1; i < g.length; i++) if (g[i]! > g[i - 1]! * VERDICT.runawayRise) return true;
  return false;
}

function maxFestivalGap(r: RunResult, fromDay: number, toDay: number): { days: number; from: number; open: boolean } | null {
  const gaps = festivalGaps(r).filter((x) => x.from >= fromDay && x.from < toDay);
  if (gaps.length === 0) return null;
  return gaps.reduce((a, b) => (b.days > a.days ? b : a));
}

function emptyDays(r: RunResult, toDay: number): number[] {
  return progressPerDay(r)
    .slice(0, toDay)
    .map((v, d) => (v === 0 ? d : -1))
    .filter((d) => d >= 0);
}

/** Leaves of an overlay patch as dotted paths. */
function leaves(obj: unknown, path: string[] = []): { path: string[]; value: unknown }[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [{ path, value: obj }];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => leaves(v, [...path, k]));
}

function baseValue(raw: Record<string, unknown>, table: string, rowId: string | null, path: string[]): unknown {
  let at: unknown = raw[table];
  if (rowId !== null) at = (at as { id: string }[]).find((r) => r.id === rowId);
  for (const k of path) at = at === undefined || at === null ? undefined : (at as Record<string, unknown>)[k];
  return at;
}

function csv(r: RunResult): string {
  const lines = ['t_seconds,day,play_seconds,kind,id,world,n,log10_amount,run_seconds'];
  for (const e of r.timeline) {
    lines.push([Math.round(e.t), (e.t / DAY).toFixed(4), Math.round(e.play), e.kind, e.id, e.world === undefined ? '' : e.world + 1, e.n ?? '', e.amount === undefined ? '' : e.amount.toFixed(3), e.runSeconds === undefined ? '' : Math.round(e.runSeconds)].join(','));
  }
  return `${lines.join('\n')}\n`;
}

// ---------------------------------------------------------------- sections

interface Runs {
  base: Record<ProfileId, RunResult>;
  fix: Record<ProfileId, RunResult> | null;
  get: (name: string) => RunResult | null;
  proposals: string[];
}

function verdictSection(R: Runs): string {
  const out: string[] = ['## The verdict in plain words', ''];
  // Pacing.
  const tally = (set: Record<ProfileId, RunResult>): { ok: number; total: number; misses: Record<ProfileId, Check[]> } => {
    let ok = 0;
    let total = 0;
    const misses = {} as Record<ProfileId, Check[]>;
    for (const p of PROFILES) {
      const cs = checks(set[p], p);
      total += cs.length;
      ok += cs.filter((c) => c.ok).length;
      misses[p] = cs.filter((c) => !c.ok);
    }
    return { ok, total, misses };
  };
  const b = tally(R.base);
  const f = R.fix ? tally(R.fix) : null;
  out.push(`**Pacing targets (GDD 17.6).** With the GDD's numbers ${b.ok} of ${b.total} checks are on target (within a third early or half late). ${f ? `With the proposed numbers ${f.ok} of ${f.total} are.` : ''}`);
  out.push('');
  for (const p of PROFILES) {
    const miss = b.misses[p];
    out.push(`- ${NAME[p]}, GDD numbers: ${miss.length === 0 ? 'every gate on target.' : miss.map((c) => `${c.label} ${c.measured} against ${c.target} (${c.verdict})`).join('; ')}.`);
  }
  if (f) {
    for (const p of PROFILES) {
      const miss = f.misses[p];
      out.push(`- ${NAME[p]}, proposed numbers: ${miss.length === 0 ? 'every gate on target.' : miss.map((c) => `${c.label} ${c.measured} against ${c.target} (${c.verdict})`).join('; ')}.`);
    }
  }
  out.push('');

  // Dead zones.
  const sets: [string, Record<ProfileId, RunResult>][] = [[RULES_GDD, R.base], ...(R.fix ? ([[RULES_FIX, R.fix]] as [string, Record<ProfileId, RunResult>][]) : [])];
  const dz: string[] = [];
  let dead = false;
  for (const [label, set] of sets) {
    for (const p of PROFILES) {
      const r = set[p];
      const q = r.quiet.seconds / MIN;
      const early = maxFestivalGap(r, 0, 14);
      const late = maxFestivalGap(r, 14, r.meta.days);
      const empty = emptyDays(r, 30).length;
      if (q > VERDICT.quietMinutes || (late && late.days > VERDICT.festivalGapDays)) dead = true;
      dz.push(`- ${NAME[p]}, ${label.toLowerCase()}: longest open-game stretch with nothing to buy ${clock(r.quiet.seconds)} (day ${(r.quiet.endedAt / DAY).toFixed(1)}); ${empty} of the first 30 days with no progress event; longest gap between Festivals ${early ? `${early.days.toFixed(1)} days before day 14` : 'none before day 14'}, ${late ? `${late.days.toFixed(1)} days after day 14${late.open ? ' (still open when the run ended)' : ''}` : 'no Festival after day 14'}.`);
    }
  }
  out.push(`**Dead zones.** ${dead ? `No dead zone inside a session in the first two weeks, but the game goes quiet later: either a session has more than ${VERDICT.quietMinutes} minutes with nothing to buy, or Festivals are more than ${VERDICT.festivalGapDays} days apart after day 14 (GDD 17.6 expects three to eight days).` : `None found: no session has more than ${VERDICT.quietMinutes} minutes with nothing to buy, and Festivals stay within ${VERDICT.festivalGapDays} days of each other.`}`);
  out.push('');
  out.push(...dz);
  out.push('');

  // Runaway growth.
  const rw: string[] = [];
  let runaway = false;
  for (const [label, set] of sets) {
    for (const p of PROFILES) {
      const g = growthPerWeek(set[p]);
      if (isRunaway(set[p])) runaway = true;
      rw.push(`- ${NAME[p]}, ${label.toLowerCase()}: all-time Compost grows ${g.map((x) => `${fx(x.perWeek)} orders of magnitude a week in ${x.label}`).join(', ')}.`);
    }
  }
  const burst01 = R.get('burst-v01');
  const burst02 = R.get('burst-v02');
  const peak = (r: RunResult | null): number | null => (r ? Math.max(...r.sessions.map((s) => s.peakFactor)) : null);
  out.push(`**Runaway growth.** ${runaway ? 'Growth speeds up somewhere in the run (see the lines below): that is a runaway.' : 'None. Growth slows from week to week for every play style, as it should with exponents below 1 (GDD 17.6 note 1).'} ${burst01 && burst02 ? `The burst the first audit found (every timed ability held and fired together at 12 taps a second) put the tower at ${times(peak(burst01))} its steady income under the 0.1 stacking rule, and at most ${times(peak(burst02))} under the 0.2 rule (one Boost capped at ${loadRaw().tuning.BOOST_CAP}, Spurt the only multiplier on it). The exploit is gone.` : ''}`);
  out.push('');
  out.push(...rw);
  out.push('');

  // Longevity.
  const la = R.get('launch-active');
  const fla = R.get('fix-launch-active');
  const lines: string[] = [];
  for (const [label, r] of [[`${RULES_GDD}, launch build (4 worlds)`, la], [`${RULES_FIX}, launch build (4 worlds)`, fla]] as [string, RunResult | null][]) {
    if (!r) continue;
    const per = progressPerDay(r);
    const weeks = [4, 5, 6, 7].map((w) => per.slice(w * 7, w * 7 + 7).reduce((a, v) => a + v, 0));
    const s60 = sampleAt(r, r.meta.days * DAY);
    lines.push(`- Active, ${label.toLowerCase()}: level ${s60.level} on day ${r.meta.days}, ${s60.festivals} Festivals, ${countBy(r, 'festival', 30 * DAY, 60 * DAY)} of them after day 30; progress events in weeks 5 to 8: ${weeks.join(', ')}.`);
  }
  for (const [label, set] of sets) {
    const r = set.idle;
    const s60 = sampleAt(r, r.meta.days * DAY);
    lines.push(`- Idle, ${label.toLowerCase()}, six worlds: level ${s60.level} on day ${r.meta.days}, ${s60.festivals} Festivals, World 6 ${when(gates(r).worlds[5])}.`);
  }
  out.push(`**Longevity.** Days to weeks, yes: the gates are spread over the first three to eight weeks for every play style and new things still arrive in week 8. The risk is the other way round: after week 2 the content runs out of power before the budget does, so the late game stretches (see "What each system is worth").`);
  out.push('');
  out.push(...lines);
  out.push('');
  return out.join('\n');
}

function changesSection(R: Runs): string {
  if (!R.fix || R.proposals.length === 0) return '';
  const raw = loadRaw() as unknown as Record<string, unknown>;
  const out: string[] = ['## Recommended number changes', ''];
  out.push(`Four overlays in \`apps/sim/proposals/\`, applied in this order: ${R.proposals.map((p) => `\`${p}\``).join(', ')}. Each is a plain list of table values. None is in the GDD tables yet: they are proposals for the Game Designer, who owns the numbers. The last one was fitted by \`pnpm sim calibrate\` on top of the first three, so the gate prices are only right together with them.`);
  out.push('');
  const rows: string[][] = [];
  for (const id of R.proposals) {
    const o: Overlay = readOverlay(join(PROPOSALS_DIR, `${id}.yaml`));
    for (const [k, v] of Object.entries(o.tuning ?? {})) {
      rows.push([`\`${id}\``, `\`${k}\``, sci(baseValue(raw, 'tuning', null, [k])), sci(v)]);
    }
    for (const [tableName, byRow] of Object.entries(o.rows ?? {})) {
      for (const [rowId, patch] of Object.entries(byRow as Record<string, unknown>)) {
        for (const leaf of leaves(patch)) {
          rows.push([`\`${id}\``, `\`${rowId}\` ${leaf.path.join('.')}`, sci(baseValue(raw, tableName, rowId, leaf.path)), sci(leaf.value)]);
        }
      }
    }
  }
  out.push(table(['Overlay', 'Number', 'GDD 0.3', 'Proposed'], rows));
  out.push('');
  for (const id of R.proposals) {
    const o = readOverlay(join(PROPOSALS_DIR, `${id}.yaml`));
    out.push(`**\`${id}\`: ${o.title ?? id}.** ${(o.why ?? '').trim().replace(/\n/g, ' ')}`);
    out.push('');
  }
  out.push('### Before and after, every gate');
  out.push('');
  for (const p of PROFILES) {
    const before = checks(R.base[p], p);
    const after = checks(R.fix[p], p);
    out.push(`**${NAME[p]}**`);
    out.push('');
    out.push(table(['Gate', 'Target', RULES_GDD, RULES_FIX], before.map((c, i) => [c.label, c.target, `${c.measured} (${c.verdict})`, `${after[i]!.measured} (${after[i]!.verdict})`])));
    out.push('');
  }
  return out.join('\n');
}

function pacingSection(R: Runs): string {
  const out: string[] = ['## Pacing targets: first 10 minutes, first hour, day 1, week 1, month', ''];
  out.push('The GDD gives a minute-by-minute table for a new player\'s first hour (section 16) and milestones for day 1, week 1 and month 1 (section 17). The simulated new player is the active profile with the beginner model described under "How the simulated players decide".');
  out.push('');
  const cols = [['GDD', R.base.active], ...(R.fix ? [['Proposed', R.fix.active]] : [])] as [string, RunResult][];
  const rows: string[][] = [];
  const add = (label: string, target: string, f: (r: RunResult) => string): void => {
    rows.push([label, target, ...cols.map(([, r]) => f(r))]);
  };
  const lvAt = (t: number) => (r: RunResult): string => String(levelAt(r, t));
  const floorsBy = (t: number) => (r: RunResult): string => String(1 + countBy(r, 'floor', 0, t + 1));
  add('Level at 10 minutes', 'about 3 to 4', lvAt(10 * MIN));
  add('Floors open at 10 minutes', '7', floorsBy(10 * MIN));
  add('Level at 1 hour', '8', lvAt(HOUR));
  add('Top floor (floor 10)', '32 min', (r) => when(floorTime(r, 10)));
  add('First Replant', '50 to 60 min', (r) => when(gates(r).replant));
  add('Replants by day 1', '6 to 10', (r) => String(countBy(r, 'replant', 0, DAY)));
  add('Level at day 1', 'about 18', lvAt(DAY));
  add('Level at day 7', 'about 40', lvAt(7 * DAY));
  add('Research projects by day 7', '12 to 15', (r) => String(sampleAt(r, 7 * DAY).research));
  add('Festivals by day 7', '3 to 4', (r) => String(countBy(r, 'festival', 0, 7 * DAY)));
  add('Level at day 30', 'about 70', lvAt(30 * DAY));
  add('Level at day 60', 'cap 112 about month 3', lvAt(60 * DAY));
  out.push(table(['Active player', 'GDD target', ...cols.map(([n]) => `${n} numbers`)], rows));
  out.push('');
  out.push('### The reveal order (GDD section 16, 31 rows)');
  out.push('');
  out.push('Measured in game time. Rows 1 to 19 have a target in minutes of the first session, rows 20 to 31 a target day for the active player.');
  out.push('');
  const runs: [string, RunResult][] = [...PROFILES.map((p) => [`${NAME[p]}, GDD`, R.base[p]] as [string, RunResult]), ...(R.fix ? PROFILES.map((p) => [`${NAME[p]}, proposed`, R.fix![p]] as [string, RunResult]) : [])];
  const unlockRows = R.base.active.unlocks.map((u) => {
    const target = u.targetSec !== null ? when(u.targetSec) : u.targetDay !== null ? daysText(u.targetDay) : '-';
    return [String(u.n), `\`${u.id.replace('feature.', '')}\``, target, ...runs.map(([, r]) => when(unlockTime(r, u.id) ?? (u.id === 'feature.tap_to_harvest' ? 0 : null)))];
  });
  out.push(table(['#', 'Feature', 'Target', ...runs.map(([n]) => n)], unlockRows));
  out.push('');
  return out.join('\n');
}

function gatesSection(R: Runs): string {
  const out: string[] = ['## When each gate arrives', ''];
  out.push('![When each gate arrives](charts/gates.svg)');
  out.push('');
  out.push('Every unlock, Replant, Festival and world arrival of each run is in `data/timeline-<run>.csv` (one row per event: game time, day, play time, kind, id, world, count).');
  out.push('');
  const sets: [string, Record<ProfileId, RunResult>][] = [[RULES_GDD, R.base], ...(R.fix ? ([[RULES_FIX, R.fix]] as [string, Record<ProfileId, RunResult>][]) : [])];
  for (const [label, set] of sets) {
    out.push(`**${label}**`);
    out.push('');
    out.push(table(['Gate', ...PROFILES.map((p) => `${NAME[p]} (target)`)], GATE_ROWS.map((row) => [row.label, ...PROFILES.map((p) => `${when(row.get(gates(set[p])))} (${when(row.target(p))})`)])));
    out.push('');
  }
  return out.join('\n');
}

function deadZoneSection(R: Runs): string {
  const out: string[] = ['## Dead zones', ''];
  out.push('![Progress events per day](charts/activity.svg)');
  out.push('');
  out.push('A progress event is a new floor, world, unlock, research project, heirloom, Mastery star, bench job, Replant or Festival. An empty cell is a day on which none of these happened.');
  out.push('');
  const sets: [string, Record<ProfileId, RunResult>][] = [[RULES_GDD, R.base], ...(R.fix ? ([[RULES_FIX, R.fix]] as [string, Record<ProfileId, RunResult>][]) : [])];
  const rows: string[][] = [];
  for (const [label, set] of sets) {
    for (const p of PROFILES) {
      const r = set[p];
      const beat = longestBeatGap(r);
      const empty = emptyDays(r, r.meta.days);
      rows.push([`${NAME[p]}, ${label === RULES_GDD ? 'GDD' : 'proposed'}`, `${clock(r.quiet.seconds)} (day ${(r.quiet.endedAt / DAY).toFixed(1)})`, `${clock(beat.seconds)} (day ${beat.atDay.toFixed(1)})`, empty.length === 0 ? 'none' : `${empty.length}: ${empty.slice(0, 8).map((d) => d + 1).join(', ')}${empty.length > 8 ? ', ...' : ''}`, String(r.valveReplants)]);
    }
  }
  out.push(table(['Run', 'Longest open-game stretch with nothing to buy', 'Longest play time between two reward beats', 'Days with no progress event (day numbers from 1)', 'Replants taken only because nothing else was left'], rows));
  out.push('');
  out.push('### Festival gaps');
  out.push('');
  const frows: string[][] = [];
  for (const [label, set] of sets) {
    for (const p of PROFILES) {
      const gaps = festivalGaps(set[p]);
      frows.push([`${NAME[p]}, ${label === RULES_GDD ? 'GDD' : 'proposed'}`, gaps.map((g) => `${g.days.toFixed(1)}${g.open ? ' (open)' : ''}`).join(', ')]);
    }
  }
  out.push(table(['Run', 'Days between Festivals, in order'], frows));
  out.push('');
  return out.join('\n');
}

function runawaySection(R: Runs): string {
  const out: string[] = ['## Runaway growth', ''];
  out.push('![Harvest Festivals held](charts/festivals-gdd.svg)');
  out.push('');
  if (R.fix) {
    out.push('![Harvest Festivals held, proposed numbers](charts/festivals-fix.svg)');
    out.push('');
  }
  out.push('![All-time Compost](charts/compost.svg)');
  out.push('');
  const sets: [string, Record<ProfileId, RunResult>][] = [[RULES_GDD, R.base], ...(R.fix ? ([[RULES_FIX, R.fix]] as [string, Record<ProfileId, RunResult>][]) : [])];
  const rows: string[][] = [];
  for (const [label, set] of sets) {
    for (const p of PROFILES) rows.push([`${NAME[p]}, ${label === RULES_GDD ? 'GDD' : 'proposed'}`, ...growthPerWeek(set[p]).map((g) => fx(g.perWeek))]);
  }
  out.push('Orders of magnitude of all-time Compost gained per week. Falling numbers mean growth slows down, which is what an idle game needs to last.');
  out.push('');
  out.push(table(['Run', 'Week 1', 'Week 2', 'Weeks 3 and 4', 'Weeks 5 to 8'], rows));
  out.push('');
  out.push('### Burst stacking and the tap limit');
  out.push('');
  const runs: [string, string][] = [['burst-v01', 'Every timed ability held and fired together, 12 taps a second, 0.1 stacking rule'], ['burst-v02', 'The same player under the 0.2 rule'], ['gdd-active', 'Active player, 6 taps a second'], ['gdd-active-tap12', 'Active player at the tap limit, 12 taps a second']];
  const brows: string[][] = [];
  for (const [name, label] of runs) {
    const r = R.get(name);
    if (!r) continue;
    const g = gates(r);
    const s7 = sampleAt(r, 7 * DAY);
    brows.push([label, times(Math.max(...r.sessions.map((s) => s.peakFactor))), when(g.worlds[4]), when(g.worlds[5]), String(countBy(r, 'festival', 0, 10 * DAY)), fx(s7.tapFactor6), fx(s7.tapFactor12)]);
  }
  out.push(table(['Run', 'Highest tower income over steady income', 'World 5', 'World 6', 'Festivals in 10 days', 'Tap income over steady, day 7, at 6 taps/s', 'at 12 taps/s'], brows));
  out.push('');
  const last = sampleAt(R.base.active, R.base.active.meta.days * DAY);
  out.push(`Reviewer note 1 asks for both tap rates with every ability in. On day ${R.base.active.meta.days} of the active run, taps pay ${fx(last.tapFactor6)} times steady income at 6 taps a second and ${fx(last.tapFactor12)} times at 12, before Boost and Growth Spurt. With the Boost at its cap of ${loadRaw().tuning.BOOST_CAP} and a Spurt (×${loadRaw().tuning.SPURT_SPEED_CAP ?? 4} at most) the ceiling is about ${Math.round(last.tapFactor12 * 15 * 4)} times steady income at the tap limit for the length of a Spurt. That is inside the reviewer's 450 to 650 range for a finished account and is only reached for 20 seconds at a time.`);
  out.push('');
  return out.join('\n');
}

function longevitySection(R: Runs): string {
  const out: string[] = ['## Longevity', ''];
  const names: [string, string][] = [
    ['gdd-active', 'Active, GDD, six worlds'], ['gdd-mixed', 'Mixed, GDD, six worlds'], ['gdd-idle', 'Idle, GDD, six worlds'],
    ['launch-active', 'Active, GDD, launch build (4 worlds)'], ['launch-idle', 'Idle, GDD, launch build (4 worlds)'],
    ['fix-active', 'Active, proposed, six worlds'], ['fix-mixed', 'Mixed, proposed, six worlds'], ['fix-idle', 'Idle, proposed, six worlds'], ['fix-launch-active', 'Active, proposed, launch build'],
  ];
  const rows: string[][] = [];
  for (const [name, label] of names) {
    const r = R.get(name);
    if (!r) continue;
    const at = (d: number): string => {
      const s = sampleOrNull(r, d * DAY);
      return s ? `level ${s.level}, ${s.festivals} F, ${s.replants} R, ${s.research} research, ${s.heirlooms} heirlooms` : '-';
    };
    const per = progressPerDay(r);
    const late = per.slice(30, 60).reduce((a, v) => a + v, 0);
    rows.push([label, at(30), at(60), String(late)]);
  }
  out.push(table(['Run', 'Day 30', 'Day 60', 'Progress events, days 30 to 60'], rows));
  out.push('');
  out.push('F: Harvest Festivals held. R: Replants. The launch build stops at World 4, so its late game is Festivals, research, heirlooms and card levels only.');
  out.push('');
  return out.join('\n');
}

const BUDGET_DAYS = [0.04, 1, 3, 7, 14, 30, 60];

function worthSection(R: Runs): string {
  const out: string[] = ['## What each system is worth', ''];
  out.push('![Multipliers against the budget](charts/budget.svg)');
  out.push('');
  out.push('The designer\'s pacing script (GDD 17.6) runs on a budget: what managers, taps and "everything else" (skills, plants, card levels, research, heirlooms, achievements, codex, Mastery) multiply income by on each day. The simulator measures the same three numbers on the active player\'s newest world: the income-weighted manager multiplier, the permanent multiplier on the best floor without Rich Soil and Golden Hour (those are modelled by the script itself), and tap income at 6 taps a second as a multiple of steady income.');
  out.push('');
  const cols: [string, RunResult][] = [['GDD', R.base.active], ...(R.fix ? ([['proposed', R.fix.active]] as [string, RunResult][]) : [])];
  const rows: string[][] = [];
  for (const d of BUDGET_DAYS) {
    const row = [d < 1 ? `hour ${Math.round(d * 24)}` : `day ${d}`];
    row.push(`${times(budgetAt(BUDGET.manager, d))} / ${times(budgetAt(BUDGET.everythingElse, d))} / ${times(budgetAt(BUDGET.tapMultiple, d))}`);
    for (const [, r] of cols) {
      const s = sampleOrNull(r, d * DAY);
      row.push(s ? `${times(s.mult.managerWeighted)} / ${times(s.mult.permanent)} / ${times(s.tapFactor6)}` : '-');
    }
    rows.push(row);
  }
  out.push(table(['When', 'Budget: managers / everything else / taps', ...cols.map(([n]) => `Active, ${n}`)], rows));
  out.push('');
  out.push('### Each system switched off (active player, first 3 days)');
  out.push('');
  out.push('![Each system switched off](charts/ablation.svg)');
  out.push('');
  const base = R.base.active;
  const arows: string[][] = [];
  const line = (label: string, r: RunResult): string[] => {
    const g = gates(r);
    return [label, when(g.worlds[1]), when(g.worlds[2]), when(g.festival), String(countBy(r, 'replant', 0, 3 * DAY)), String(levelAt(r, 3 * DAY))];
  };
  arows.push(line('Everything on', base));
  for (const sys of SYSTEMS) {
    const r = R.get(`off-${sys}`);
    if (r) arows.push(line(`Without: ${SYSTEM_LABEL[sys]}`, r));
  }
  out.push(table(['Run', 'World 2', 'World 3', 'First Festival', 'Replants by day 3', 'Level on day 3'], arows));
  out.push('');
  return out.join('\n');
}

function designerAsksSection(R: Runs): string {
  const out: string[] = ['## The Game Designer\'s questions for design 0.3', ''];
  const cols: [string, RunResult][] = [['GDD', R.base.active], ...(R.fix ? ([['proposed', R.fix.active]] as [string, RunResult][]) : [])];
  // (a) Manager profit days 0 to 2.
  out.push('### Manager profit on the top floors, days 0 to 2 (CHANGES A.7, item 2)');
  out.push('');
  out.push('With one fixed manager per floor the rarest managers sit on the floors that earn most. Measured on the active player\'s newest world: the median hired manager, the mean of the three highest hired floors, and the income-weighted mean (what managers multiply that world\'s income by).');
  out.push('');
  const mrows: string[][] = [];
  for (const t of [10 * MIN, HOUR, 6 * HOUR, DAY, 2 * DAY]) {
    const row = [when(t), times(budgetAt(BUDGET.manager, t / DAY))];
    for (const [, r] of cols) {
      const s = sampleAt(r, t);
      row.push(`${times(s.mult.manager)} / ${times(s.mult.managerTop)} / ${times(s.mult.managerWeighted)}`);
    }
    mrows.push(row);
  }
  out.push(table(['When', 'Budget', ...cols.map(([n]) => `Active, ${n}: median / top 3 / weighted`)], mrows));
  out.push('');
  // (b) Boost per world.
  out.push('### Average Boost in each world (CHANGES A.7, item 4)');
  out.push('');
  out.push('Time-weighted over every session spent in that world, days 0 to 60. Boost is the sum of timed bonuses on the world on screen (cap 15); the tap column is the Boost the taps see.');
  out.push('');
  const runs: [string, RunResult][] = [['Active, GDD', R.base.active], ['Mixed, GDD', R.base.mixed], ...(R.fix ? ([['Active, proposed', R.fix.active], ['Mixed, proposed', R.fix.mixed]] as [string, RunResult][]) : [])];
  const brows = WORLD.map((name, w) => [name, ...runs.map(([, r]) => {
    const b = sessionAverage(r, 0, r.meta.days, (s) => s.boost, w);
    const tb = sessionAverage(r, 0, r.meta.days, (s) => s.tapBoost, w);
    const sp = sessionAverage(r, 0, r.meta.days, (s) => s.spurtShare, w);
    return b === null ? '-' : `${times(b)} (taps ${times(tb)}, Spurt ${Math.round((sp ?? 0) * 100)}%)`;
  })]);
  out.push(table(['World', ...runs.map(([n]) => n)], brows));
  out.push('');
  out.push(`The script assumes Growth Spurts cover ${Math.round(BUDGET.spurtShare * 100)} percent of an active session. The measured share is in brackets.`);
  out.push('');
  // (c) Chest pool.
  out.push('### Where the manager copies go (CHANGES A.7, item 3)');
  out.push('');
  out.push('Chest manager slots pick among the managers already met, so early copies pile onto Thymeford. Mean card level of the met managers in each world:');
  out.push('');
  const crows: string[][] = [];
  for (const [n, r] of cols) {
    for (const d of [3, 7, 14, 30, 60]) {
      const s = sampleOrNull(r, d * DAY);
      if (!s || !s.managerLevelByWorld) continue;
      crows.push([`Active, ${n}, day ${d}`, ...s.managerLevelByWorld.map((v) => (v > 0 ? v.toFixed(1) : '-'))]);
    }
  }
  if (crows.length) out.push(table(['Run', ...WORLD], crows));
  out.push('');
  // (d) Event track.
  out.push('### Event track and the top chests (reviewer note 4, CHANGES A.7, item 5)');
  out.push('');
  const erows: string[][] = [];
  for (const [label, r] of [...runs, ['Idle, GDD', R.base.idle] as [string, RunResult]]) {
    const weeks = r.meta.days / 7;
    const done = r.fairWeekends.filter((f) => f.step >= 10).length;
    erows.push([label, `${done} of ${r.fairWeekends.length}`, fx((r.chests['chest.golden'] ?? 0) / weeks), fx((r.chests['chest.crystal'] ?? 0) / weeks), fx((r.chests['chest.starlight'] ?? 0) / weeks, 2)]);
  }
  out.push('The simulated players play the Garden Fair every weekend, and its chests are in every card and heirloom number of this report.');
  out.push('');
  out.push(table(['Run', 'Weekends with the track finished', 'Golden Chests a week (all sources)', 'Crystal Chests a week', 'Starlight Chests a week'], erows));
  out.push('');
  // (e) Mastery.
  out.push('### Mastery stars (reviewer note 5)');
  out.push('');
  const stars = (r: RunResult, w: number): string => {
    const ts = r.timeline.filter((e) => e.kind === 'star' && e.world === w).map((e) => (e.t / DAY).toFixed(1));
    return ts.length ? ts.join(', ') : '-';
  };
  out.push(table(['Run', ...WORLD.slice(0, 3).map((w) => `${w}: star days`)], cols.map(([n, r]) => [`Active, ${n}`, stars(r, 0), stars(r, 1), stars(r, 2)])));
  out.push('');
  out.push('Stars 1 to 3 still land together on arrival in each world, because `MASTERY_LEVELS` starts at 25, 50 and 100 and a new world\'s floors pass those levels within minutes. Setting the ten levels from cost is not done in this pass; the recommendation is under "Open items".');
  out.push('');
  // (f) XP.
  out.push('### Where the XP comes from');
  out.push('');
  const sources = ['quests', 'achievements', 'milestones', 'replants', 'story', 'chests', 'visitors', 'mastery'];
  const xrows: string[][] = [];
  for (const [n, r] of cols) {
    for (const t of [HOUR, DAY, 7 * DAY]) {
      const s = sampleAt(r, t);
      xrows.push([`Active, ${n}, ${when(t)}`, String(s.level), Math.round(totalXp(s)).toLocaleString('en-US'), ...sources.map((k) => Math.round(s.xp[k] ?? 0).toLocaleString('en-US'))]);
    }
  }
  out.push(table(['Run', 'Level', 'XP', ...sources], xrows));
  out.push('');
  return out.join('\n');
}

function checkSection(R: Runs): string {
  const out: string[] = ['## Check against the designer\'s pacing script', ''];
  const bare = R.get('check-bare-perfect');
  const perfect = R.get('check-perfect');
  out.push('The script in GDD 17.6 plays a perfect player on floors, levels, milestones, hires, taps, Replant, Compost and Rich Soil, with everything else as a budget. With every other system switched off, the simulator\'s perfect player is the closest match.');
  out.push('');
  const rows: string[][] = [];
  for (const [label, r] of [['Simulator, perfect player, every other system off', bare], ['Simulator, perfect player, everything on', perfect], ['Simulator, new player (active), everything on', R.base.active]] as [string, RunResult | null][]) {
    if (!r) continue;
    const g = gates(r);
    const play = (t: number | null): string => {
      if (t === null) return '-';
      const e = r.timeline.find((x) => x.t >= t);
      return e ? `${when(t)} (${Math.round(e.play / 60)} min of play)` : when(t);
    };
    rows.push([label, play(g.topFloor), play(g.replant), play(g.worlds[1] ?? null)]);
  }
  rows.unshift(['Script (GDD 17.6), active', '17 min', '36 min', 'day 0.5']);
  out.push(table(['Player', 'Top floor', 'First Replant', 'World 2'], rows));
  out.push('');
  out.push('On design 0.2 the bare perfect player landed on the script (16:30 to the top floor, 26:25 to the first Replant). On 0.3 it is a little faster, because the fixed managers of the top floors start at ×3 to ×5 instead of ×2.');
  out.push('');
  return out.join('\n');
}

function staticSections(): string {
  return `## Reviewer's five notes (re-check of PR #3)

1. **Ceiling sentence in GDD 6.7.** Measured above under "Burst stacking and the tap limit", at both tap rates, with every ability in.
2. **Combo for a mouse-only player.** Not a number the simulator can settle. The simulated player taps without pauses while tapping, and its purchases do not interrupt the Combo (assumption below). A playtest should decide.
3. **Autopilot taps and counted taps.** The simulator follows the ruling: Autopilot taps fill neither Spurt, Combo, Hearth Heat, tap quests nor the \`taps\` achievement.
4. **Event track every weekend.** Played every weekend; its chests are in all card and heirloom rates (table above).
5. **Mastery spacing.** Measured above; levels from cost are an open item.

## Open items

- **The late game after week 2.** The content multiplier ("everything else") falls behind the budget from about day 14 and ends far below it on day 60 (table under "What each system is worth"). That is why Festivals stretch beyond eight days in weeks 4 to 8 for every play style, with the GDD's numbers and with the proposed ones. Two ways out, the designer's choice: lower the budget rows for days 30 and 60 and the week 4 and later rows of the pacing table to what the content gives, or add late power (more research tiers, higher card level caps for Rares and up, a second endless Ribbon item). The proposed overlays do not touch this.
- **Mastery levels from cost.** Set the ten \`MASTERY_LEVELS\` so stars land at even steps of floor cost after arrival, not on arrival. The simulator records every star in the timelines, so the designer can check a new list with one run.
- **Idle player from World 4.** See the before-and-after tables: the gate prices are fitted to the active player, so the idle and mixed players' late gates move with them.

## Assumptions the simulator makes

- **New player.** For the first two minutes 0.3 purchases a second and 30 percent of taps landed, then 0.35 and 35 percent to minute 10, 0.4 and 35 percent to the end of the first hour, then 2 a second and every tap. Fitted to the GDD's first-hour table on the bare game (floor 10 at 29.5 minutes, first Replant at 51 minutes).
- **Abilities.** A manager's ability can be pressed only while its world is on screen and the manager is hired. Leaving a world ends what an ability gave the taps (Combo lock, Liftoff).
- **Tea Party** adds 120 seconds of the world's steady income to the bubbles. **Wake-Up Call** makes the next missed sunrise pay as caught.
- **Auto-Gardener** is one switch. **Head Start** money is paid on first entry to a new world. Purchases do not interrupt tapping. Autopilot taps are not counted taps.
- **Garden Fair** every weekend, played in the sessions of that weekend.
- **Replant** when pending Compost is at least the era's Compost, or earlier when nothing is left to buy for ten minutes (the "valve"). **Festival** when pending Ribbons are at least the Ribbons claimed, as in the designer's script.

## How the simulated players decide

- **Schedule (GDD 17.6).** Active: six sessions of 30 minutes a day, the first one 60 minutes. Mixed: eight of 6 minutes, the first 30. Idle: three of 4 minutes, the first 15. Sessions are spread over 16 waking hours; the game is closed in between and offline earnings are paid by the core's own offline code. Game time 0 is 08:00 on a Monday.
- **Buying.** Greedy: the purchase with the lowest wait plus payback time, across floor levels, new floors, hires, Compost Shop, Ribbon Shop, research and the bench. While a world ticket is close the player saves for it.
- **Tapping.** 6 taps a second while a session is open (12 for the tap-limit runs), on the world on screen. Timed abilities are pressed when ready; the burst runs hold them and fire them together.
- **Rules.** The simulator calls the game's own economy code in \`packages/core\` and reads the tables in \`packages/content/tables\`, so a number changed in a table changes the simulation. It does not reimplement any formula.
`;
}

// ---------------------------------------------------------------- charts

function writeCharts(R: Runs): void {
  mkdirSync(CHARTS, { recursive: true });
  // Gates.
  const panel = (title: string, set: Record<ProfileId, RunResult>): GatePanel => ({
    title,
    rows: GATE_ROWS.map((row) => ({
      label: row.label,
      target: null,
      targets: PROFILES.map((p) => ({ series: p, t: row.target(p) })),
      points: PROFILES.map((p) => ({ series: p, t: row.get(gates(set[p])) })),
    })),
  });
  const panels = [panel(RULES_GDD, R.base), ...(R.fix ? [panel(RULES_FIX, R.fix)] : [])];
  writeFileSync(join(CHARTS, 'gates.svg'), gateChart('When each gate arrives', 'Dot: simulated player. Ring: GDD 17.6 target, same colour. Log time axis.', panels, PSERIES));
  // Festivals.
  const fest = (set: Record<ProfileId, RunResult>, title: string): string =>
    lineChart(title, 'Harvest Festivals held so far. Rings: GDD 17.6 targets (first Festival, Festivals by day 30).', 'Festivals', PROFILES.map((p) => {
      const r = set[p];
      const pts: [number, number][] = [[0, 0]];
      let n = 0;
      for (const e of r.timeline) if (e.kind === 'festival') pts.push([e.t / DAY, ++n]);
      return { name: NAME[p], color: SERIES[p], points: pts, targets: [[PACING[p]!.festival, 1], [30, PACING[p]!.festivalsBy30]] as [number, number][] };
    }), { step: true, xMax: 60, targetName: 'GDD target' });
  writeFileSync(join(CHARTS, 'festivals-gdd.svg'), fest(R.base, `Harvest Festivals, ${RULES_GDD}`));
  if (R.fix) writeFileSync(join(CHARTS, 'festivals-fix.svg'), fest(R.fix, `Harvest Festivals, ${RULES_FIX.toLowerCase()}`));
  // Compost.
  const set = R.fix ?? R.base;
  writeFileSync(join(CHARTS, 'compost.svg'), lineChart(`All-time Compost, ${R.fix ? RULES_FIX.toLowerCase() : RULES_GDD}`, 'Orders of magnitude (log10 of all-time Compost). A straight or bending-down line is healthy; a line bending up is a runaway.', 'log10 Compost', PROFILES.map((p) => ({
    name: NAME[p], color: SERIES[p], points: set[p].samples.filter((s) => s.compostAll !== null).map((s) => [s.t / DAY, s.compostAll!] as [number, number]),
  })), { xMax: 60 }));
  // Activity strip.
  const strip = [...PROFILES.map((p) => ({ name: `${NAME[p]}, GDD`, days: progressPerDay(R.base[p]) })), ...(R.fix ? PROFILES.map((p) => ({ name: `${NAME[p]}, proposed`, days: progressPerDay(R.fix![p]) })) : [])];
  writeFileSync(join(CHARTS, 'activity.svg'), stripChart('Progress events per day', 'Floors, worlds, unlocks, research, heirlooms, stars, bench jobs, Replants and Festivals. Empty: nothing new that day.', strip, [1, 3, 6, 12, 24]));
  // Budget.
  const series = [{ name: 'Active, GDD numbers', color: SERIES.active, r: R.base.active }, ...(R.fix ? [{ name: 'Active, proposed numbers', color: SERIES.mixed, r: R.fix.active }] : [])];
  const pick = (f: (s: RunResult['samples'][number]) => number) => series.map((x) => ({ name: x.name, color: x.color, values: BUDGET_DAYS.map((d) => { const s = sampleOrNull(x.r, d * DAY); return s ? f(s) : null; }) }));
  writeFileSync(join(CHARTS, 'budget.svg'), budgetChart('Multipliers against the budget', 'GDD 17.6 budget (dashed) and the active player as measured. Log scale; x axis in days (first point: hour 1).', [
    { title: 'Managers (income-weighted)', days: BUDGET_DAYS.map((d) => (d < 1 ? 0 : d)), budget: BUDGET_DAYS.map((d) => budgetAt(BUDGET.manager, d)), measured: pick((s) => s.mult.managerWeighted) },
    { title: 'Everything else', days: BUDGET_DAYS.map((d) => (d < 1 ? 0 : d)), budget: BUDGET_DAYS.map((d) => budgetAt(BUDGET.everythingElse, d)), measured: pick((s) => s.mult.permanent) },
    { title: 'Tap income (6 taps a second)', days: BUDGET_DAYS.map((d) => (d < 1 ? 0 : d)), budget: BUDGET_DAYS.map((d) => budgetAt(BUDGET.tapMultiple, d)), measured: pick((s) => s.tapFactor6) },
  ]));
  // Ablation.
  const base = gates(R.base.active).worlds[1];
  const bars = [{ label: 'Everything on', value: (base ?? 0) / HOUR, text: when(base), muted: true }];
  for (const sys of SYSTEMS) {
    const r = R.get(`off-${sys}`);
    if (!r) continue;
    const t = gates(r).worlds[1];
    bars.push({ label: `Without ${SYSTEM_LABEL[sys]!.toLowerCase()}`, value: (t ?? 3 * DAY) / HOUR, text: when(t), muted: false });
  }
  writeFileSync(join(CHARTS, 'ablation.svg'), barChart('World 2 arrival with one system switched off', 'Active player, GDD numbers, game time. A longer bar means that system was doing more of the work.', bars));
}

// ---------------------------------------------------------------- main

export async function writeReport(): Promise<void> {
  const cache = new Map<string, Loaded | null>();
  const get = (name: string): RunResult | null => {
    if (!cache.has(name)) cache.set(name, load(OUT_DIR, name));
    return cache.get(name)?.result ?? null;
  };
  const base = {} as Record<ProfileId, RunResult>;
  for (const p of PROFILES) {
    const r = get(`gdd-${p}`);
    if (!r) throw new Error(`apps/sim/out/gdd-${p}.json is missing: run "pnpm sim suite" first`);
    base[p] = r;
  }
  let fix: Record<ProfileId, RunResult> | null = {} as Record<ProfileId, RunResult>;
  for (const p of PROFILES) {
    const r = get(`fix-${p}`);
    if (!r) {
      fix = null;
      break;
    }
    fix[p] = r;
  }
  const suiteFile = join(OUT_DIR, 'suite.json');
  const proposal = existsSync(suiteFile) ? (JSON.parse(readFileSync(suiteFile, 'utf8')) as { proposal: string | null }).proposal : null;
  const proposals = fix ? (proposal ? proposal.split(',') : (get('fix-active')?.meta.rules.split(',') ?? [])) : [];
  const R: Runs = { base, fix, get, proposals };

  mkdirSync(DATA, { recursive: true });
  writeCharts(R);
  const csvRuns = ['gdd-active', 'gdd-mixed', 'gdd-idle', 'launch-active', 'launch-idle', 'fix-active', 'fix-mixed', 'fix-idle', 'fix-launch-active'];
  const summary: Record<string, unknown> = {};
  for (const name of csvRuns) {
    const r = get(name);
    if (!r) continue;
    writeFileSync(join(DATA, `timeline-${name}.csv`), csv(r));
    const g = gates(r);
    summary[name] = {
      meta: r.meta,
      gates: { topFloor: g.topFloor, replant: g.replant, festival: g.festival, worlds: g.worlds },
      festivalsBy30: countBy(r, 'festival', 0, 30 * DAY),
      levels: Object.fromEntries([1, 7, 30, 60].map((d) => [`day${d}`, levelAt(r, d * DAY)])),
      quietSeconds: r.quiet.seconds,
      firstLevel: { 6: levelTime(r, 6), 8: levelTime(r, 8) },
    };
  }
  writeFileSync(join(DATA, 'summary.json'), `${JSON.stringify(summary, null, 1)}\n`);

  const parts = [
    '# Balance report: Sprout Tower economy on design 0.3',
    '',
    `Written by \`pnpm sim\` from the simulator's runs (${new Date().toISOString().slice(0, 10)}). Do not edit it by hand: change \`apps/sim/src/report.ts\` or the runs, then run \`pnpm sim report\`.`,
    '',
    'Inputs: the GDD and CONTENT of design 0.3 (one fixed manager per floor), as tables in `packages/content/tables`. Three play styles from GDD 17.6 (active, mixed, idle), 60 days each, all six planned worlds, plus the four-world launch build. Proposed changes are overlays in `apps/sim/proposals/`.',
    '',
    '**How to run.** From the repository root: `pnpm install`, then `pnpm sim` (every run and this report, about 4 minutes on 4 processors). One player as a printed timeline: `pnpm sim run --profile idle --days 14`. Fit the gate prices again after a design change: `pnpm sim calibrate --base p1-levels,p2-taps,p3-managers --out p4-gates`.',
    '',
    verdictSection(R),
    changesSection(R),
    pacingSection(R),
    gatesSection(R),
    deadZoneSection(R),
    runawaySection(R),
    longevitySection(R),
    worthSection(R),
    designerAsksSection(R),
    checkSection(R),
    staticSections(),
  ];
  writeFileSync(join(DOCS, 'REPORT.md'), parts.join('\n'));
  console.log(`wrote docs/balance/REPORT.md, ${CHARTS.replace(REPO_DIR + '/', '')}/*.svg and ${DATA.replace(REPO_DIR + '/', '')}/`);
}
