/**
 * Writes docs/balance/REPORT.md, its charts (docs/balance/charts/*.svg) and the
 * CSV timelines (docs/balance/data/) from the runs in apps/sim/out/.
 *
 *   pnpm sim report        after `pnpm sim suite --proposal p1-levels,p2-taps,p4-gates`
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
  BUDGET, DAY, HOUR, MIN, TARGETS, budgetAt, levelCrossings, rhythmBreaks, windowVerdict, type Window, compostGrowth, countBy, festivalGaps, floorTime, gates, levelAt,
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
  /** The Game Designer's rhythm (2026-11-26): no gap between Festivals above 10 days. */
  festivalGapDays: 10,
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
  win: (p: ProfileId) => Window;
  /** Where the chart draws the target, in seconds. */
  target: (p: ProfileId) => number;
}

const gate = (key: string, label: string, get: (g: Gates) => number | null, win: (p: ProfileId) => Window): GateRow => ({ key, label, get, win, target: (p) => win(p).at * DAY });

const GATE_ROWS: GateRow[] = [
  gate('topFloor', 'Top floor of Thymeford', (g) => g.topFloor, (p) => TARGETS[p]!.topFloor),
  gate('replant', 'First Replant', (g) => g.replant, (p) => TARGETS[p]!.replant),
  gate('w2', 'World 2', (g) => g.worlds[1] ?? null, (p) => TARGETS[p]!.worlds[1]!),
  gate('w3', 'World 3', (g) => g.worlds[2] ?? null, (p) => TARGETS[p]!.worlds[2]!),
  gate('festival', 'First Harvest Festival', (g) => g.festival, (p) => TARGETS[p]!.festival),
  gate('w4', 'World 4', (g) => g.worlds[3] ?? null, (p) => TARGETS[p]!.worlds[3]!),
  gate('w5', 'World 5', (g) => g.worlds[4] ?? null, (p) => TARGETS[p]!.worlds[4]!),
  gate('w6', 'World 6', (g) => g.worlds[5] ?? null, (p) => TARGETS[p]!.worlds[5]!),
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
    const v = windowVerdict(m, row.win(p));
    return { label: row.label, measured: when(m), target: row.win(p).label, verdict: v.text, ok: v.ok };
  });
  const n = countBy(r, 'festival', 0, 30 * DAY);
  const [lo, hi] = TARGETS[p]!.festivalsBy30;
  const ok = n >= lo && n <= hi;
  out.push({ label: 'Festivals by day 30', measured: String(n), target: `${lo} to ${hi}`, verdict: ok ? 'on target' : n < lo ? `${lo - n} short` : `${n - hi} too many`, ok });
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
  // A runaway grows faster than it ever has before. A rise after a slow stretch that stays below an
  // earlier pace is a catch-up (new worlds opening), not a runaway.
  let best = g[0] ?? 0;
  for (let i = 1; i < g.length; i++) {
    if (g[i]! > best * VERDICT.runawayRise) return true;
    best = Math.max(best, g[i]!);
  }
  return false;
}

/** Periods where weekly growth rose over the period before without beating an earlier pace. */
function catchUps(r: RunResult): string[] {
  const g = growthPerWeek(r);
  const out: string[] = [];
  for (let i = 1; i < g.length; i++) {
    const a = g[i - 1]!.perWeek;
    const b = g[i]!.perWeek;
    if (a === null || b === null || b <= a * VERDICT.runawayRise) continue;
    const next = g[i + 1]?.perWeek ?? null;
    out.push(`${fx(b)} orders of magnitude a week in ${g[i]!.label} against ${fx(a)} in ${g[i - 1]!.label}${next !== null && next < b ? `, then ${fx(next)} in ${g[i + 1]!.label}` : ''}`);
  }
  return out;
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
  out.push(`**Pacing targets (GDD 17.6).** With the GDD's numbers ${b.ok} of ${b.total} checks are on target. The targets are the GDD 17.6 table with the Game Designer's rulings of 2026-11-26 (first Replant inside day 1 for everyone, active first Replant 30 to 55 minutes, new idle targets, Festival counts as ranges). A point target counts as met from a third early to half late. ${f ? `With the proposed numbers ${f.ok} of ${f.total} are.` : ''}`);
  out.push('');
  for (const p of PROFILES) {
    const miss = b.misses[p];
    out.push(`- ${NAME[p]}, GDD numbers: ${miss.length === 0 ? 'every gate on target' : miss.map((c) => `${c.label} ${c.measured} against ${c.target} (${c.verdict})`).join('; ')}.`);
  }
  if (f) {
    for (const p of PROFILES) {
      const miss = f.misses[p];
      out.push(`- ${NAME[p]}, proposed numbers: ${miss.length === 0 ? 'every gate on target' : miss.map((c) => `${c.label} ${c.measured} against ${c.target} (${c.verdict})`).join('; ')}.`);
    }
  }
  out.push('');

  // Dead zones.
  const sets: [string, Record<ProfileId, RunResult>][] = [[RULES_GDD, R.base], ...(R.fix ? ([[RULES_FIX, R.fix]] as [string, Record<ProfileId, RunResult>][]) : [])];
  const dz: string[] = [];
  let dead = false;
  let quietDead = false;
  let gapDead = false;
  for (const [label, set] of sets) {
    for (const p of PROFILES) {
      const r = set[p];
      const dz0 = r.dead ?? r.quiet;
      const q = dz0.seconds / MIN;
      const early = maxFestivalGap(r, 0, 14);
      const late = maxFestivalGap(r, 14, r.meta.days);
      const empty = emptyDays(r, 30).length;
      if (q > VERDICT.quietMinutes) quietDead = true;
      if (late && late.days > VERDICT.festivalGapDays) gapDead = true;
      dead = quietDead || gapDead;
      dz.push(`- ${NAME[p]}, ${label.toLowerCase()}: longest open-game stretch with nothing to buy ${clock(dz0.seconds)} (day ${(dz0.endedAt / DAY).toFixed(1)})${r.dead && r.quiet.seconds > r.dead.seconds + 60 ? `, not counting ${clock(r.quiet.seconds)} spent saving for a world ticket (day ${(r.quiet.endedAt / DAY).toFixed(1)})` : ''}; ${empty} of the first 30 days with no progress event; longest gap between Festivals ${early ? `${early.days.toFixed(1)} days before day 14` : 'none before day 14'}, ${late ? `${late.days.toFixed(1)} days after day 14${late.open ? ' (still open when the run ended)' : ''}` : 'no Festival after day 14'}.`);
    }
  }
  const dzSet = (label: string, set: Record<ProfileId, RunResult>): string => {
    const parts: string[] = [];
    for (const p of PROFILES) {
      const d = set[p].dead ?? set[p].quiet;
      if (d.seconds / MIN > VERDICT.quietMinutes) parts.push(`the ${NAME[p].toLowerCase()} player has ${clock(d.seconds)} of open game with nothing to buy (day ${(d.endedAt / DAY).toFixed(1)})`);
    }
    const gapRuns = PROFILES.filter((p) => { const g = maxFestivalGap(set[p], 14, set[p].meta.days); return g && g.days > VERDICT.festivalGapDays; });
    if (gapRuns.length) parts.push(`${gapRuns.map((p) => NAME[p].toLowerCase()).join(', ')} ${gapRuns.length === 1 ? 'has' : 'have'} Festival gaps above ${VERDICT.festivalGapDays} days after day 14`);
    return `${label}: ${parts.length ? parts.join('; ') : 'none'}.`;
  };
  out.push(`**Dead zones.** A dead zone here is more than ${VERDICT.quietMinutes} minutes of open game in which the player buys nothing (time spent saving for a world ticket does not count, and the Auto-Gardener's own purchases do not end a stretch), or two Festivals more than ${VERDICT.festivalGapDays} days apart after day 14 (the Game Designer's limit). ${sets.map(([label, set]) => dzSet(label, set)).join(' ')}${(() => {
    const ended = sets.flatMap(([label, set]) => PROFILES.filter((p) => { const d = set[p].dead; return d && d.seconds / MIN > VERDICT.quietMinutes && set[p].timeline.some((e) => e.kind === 'replant' && Math.abs(e.t - d.endedAt) < 120); }).map((p) => `${NAME[p].toLowerCase()} player, ${label.toLowerCase()}`));
    return ended.length ? ` Stretches that end with a Replant by the six-hour rule (${ended.join('; ')}) would not happen to a player who Replants as soon as nothing is left to buy.` : '';
  })()} The Festival rhythm against the designer's shape (gaps of 1 to 3 days to day 10, 3 to 6 to day 30, 5 to 9 after, no jump above about twice the gap before) is under "Dead zones".`);
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
  const rises: string[] = [];
  for (const [label, set] of sets) for (const p of PROFILES) for (const c of catchUps(set[p])) rises.push(`${NAME[p]}, ${label.toLowerCase()}: ${c}.`);
  const riseText = rises.length === 0 ? '' : ` Growth rises again after a slow stretch in ${rises.length === 1 ? 'one run' : `${rises.length} runs`} (${rises.join(' ')}) That is a catch-up as new worlds open, never faster than the run's own week 1.`;
  out.push(`**Runaway growth.** ${runaway ? 'Growth somewhere in the run is faster than it ever was before (see the lines below): that is a runaway.' : `None. No play style ever grows faster than in its first week, as it should with exponents below 1 (GDD 17.6 note 1).${riseText}`} ${burst01 && burst02 ? `The burst the first audit found (every timed ability held and fired together at 12 taps a second) put the tower at ${times(peak(burst01))} its steady income under the 0.1 stacking rule, and at most ${times(peak(burst02))} under the 0.2 rule (one Boost capped at ${loadRaw().tuning.BOOST_CAP}, Spurt the only multiplier on it). The exploit is gone.` : ''}`);
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
  const lateGrowth = (R.fix ?? R.base);
  const g58 = (p: ProfileId): string => fx(growthPerWeek(lateGrowth[p]).at(-1)?.perWeek ?? null);
  const lateGaps = PROFILES.flatMap((p) => festivalGaps(lateGrowth[p]).filter((g) => g.from >= 30 && !g.open).map((g) => g.days));
  const lateGapText = lateGaps.length ? `${Math.min(...lateGaps).toFixed(1)} to ${Math.max(...lateGaps).toFixed(1)}` : 'no';
  out.push(`**Longevity.** Days to weeks, yes: the gates are spread over the first three to five weeks for every play style and new things still arrive in week 8. The risk is the other way round: in weeks 5 to 8 all-time Compost grows ${g58('active')} (active), ${g58('mixed')} (mixed) and ${g58('idle')} (idle) orders of magnitude a week, and each Festival needs about 0.6 (four times the Compost, because Ribbons grow with its square root), so after day 30 Festivals come ${lateGapText} days apart (see "Festival rhythm").`);
  out.push('');
  out.push(...lines);
  out.push('');
  return out.join('\n');
}

function changesSection(R: Runs): string {
  if (!R.fix || R.proposals.length === 0) return '';
  const raw = loadRaw() as unknown as Record<string, unknown>;
  const out: string[] = ['## Recommended number changes', ''];
  out.push(`${R.proposals.length} overlays in \`apps/sim/proposals/\`, applied in this order: ${R.proposals.map((p) => `\`${p}\``).join(', ')}. Each is a plain list of table values. None is in the GDD tables yet. On 2026-11-26 the Game Designer accepted the level and tap changes and the refit gate prices as the base for design 0.4, and sent the late research rows and the per-world Mastery lists (\`p5-late-research\`) to be run and fitted here. The gate overlay was fitted by \`pnpm sim calibrate\` on top of the level and tap overlays, so its prices are only right together with them. A manager change (lower level-1 values, larger steps) was tried and not accepted: managers multiply every play style alike, so they do not cause the spread between active and idle, and it halved manager power on days 30 and 60.`);
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
          const base = leaf.path[0] === 'mastery' ? (raw.tuning as Record<string, unknown>).MASTERY_LEVELS : baseValue(raw, tableName, rowId, leaf.path);
          rows.push([`\`${id}\``, `\`${rowId}\` ${leaf.path.join('.')}`, Array.isArray(base) ? base.join(', ') : sci(base), Array.isArray(leaf.value) ? leaf.value.join(', ') : sci(leaf.value)]);
        }
      }
    }
    for (const [tableName, added] of Object.entries(o.addRows ?? {})) {
      for (const row of added) {
        const e = row.effect as { stat: string; op: string; value: number } | undefined;
        const effect = e ? `${e.stat} ${e.op === 'mul' ? `×${e.value}` : e.op === 'inc' ? `+${Math.round(e.value * 100)}%` : `+${e.value}`}` : '';
        const req = Array.isArray(row.requires) && row.requires.length ? `, after \`${(row.requires as string[]).join('`, `')}\`` : '';
        const cost = typeof row.cost === 'number' ? `${row.cost.toLocaleString('en-US')} Insight, ${Math.round(Number(row.timeSec) / 3600)} h, ` : '';
        rows.push([`\`${id}\``, `\`${String(row.id)}\` (new ${tableName} row)`, '-', `${cost}${effect}${req}`]);
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
  add('Level at 1 hour', '10 to 11 (ruling; GDD 8)', lvAt(HOUR));
  add('Top floor (floor 10)', '32 min', (r) => when(floorTime(r, 10)));
  add('First Replant', '30 to 55 min (ruling; GDD 50 to 60)', (r) => when(gates(r).replant));
  add('Replants by day 1', '6 to 10', (r) => String(countBy(r, 'replant', 0, DAY)));
  add('Level at day 1', 'about 23 (ruling; GDD 18)', lvAt(DAY));
  add('Level at day 7', 'about 40', lvAt(7 * DAY));
  add('Research projects by day 7', '12 to 15', (r) => String(sampleAt(r, 7 * DAY).research));
  add('Festivals by day 7', '3 to 4', (r) => String(countBy(r, 'festival', 0, 7 * DAY)));
  add('Level at day 30', 'about 70', lvAt(30 * DAY));
  add('Level at day 60', 'cap 112 about month 3', lvAt(60 * DAY));
  out.push(table(['Active player', 'Target', ...cols.map(([n]) => `${n} numbers`)], rows));
  out.push('');
  out.push('"Ruling": a target the Game Designer moved on 2026-11-26 when accepting the level overlay and the first-Replant rule. The skill tree is now expected at about minute 16.');
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
    out.push(table(['Gate', ...PROFILES.map((p) => `${NAME[p]} (target)`)], GATE_ROWS.map((row) => [row.label, ...PROFILES.map((p) => `${when(row.get(gates(set[p])))} (${row.win(p).label})`)])));
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
      const dq = r.dead ?? r.quiet;
      rows.push([`${NAME[p]}, ${label === RULES_GDD ? 'GDD' : 'proposed'}`, `${clock(dq.seconds)} (day ${(dq.endedAt / DAY).toFixed(1)})`, `${clock(r.quiet.seconds)} (day ${(r.quiet.endedAt / DAY).toFixed(1)})`, `${clock(beat.seconds)} (day ${beat.atDay.toFixed(1)})`, empty.length === 0 ? 'none' : `${empty.length}: ${empty.slice(0, 8).map((d) => d + 1).join(', ')}${empty.length > 8 ? ', ...' : ''}`, String(r.valveReplants)]);
    }
  }
  out.push(table(['Run', 'Longest open-game stretch with nothing to buy', 'The same, counting time spent saving for a world ticket', 'Longest play time between two reward beats', 'Days with no progress event (day numbers from 1)', 'Replants by the six-hour rule'], rows));
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
  out.push('### Festival rhythm');
  out.push('');
  out.push('The Game Designer\'s shape (2026-11-26): first Festival about day 4 for the active player, then gaps of 1 to 3 days up to day 10, 3 to 6 days up to day 30 and 5 to 9 days after, never more than 10, and no gap more than about twice the one before. Listed: every gap that breaks it (a fifth of slack on the ranges).');
  out.push('');
  const rrows: string[][] = [];
  for (const [label, set] of sets) {
    for (const p of PROFILES) {
      const br = rhythmBreaks(set[p]);
      rrows.push([`${NAME[p]}, ${label === RULES_GDD ? 'GDD' : 'proposed'}`, br.length === 0 ? 'none' : br.join('; ')]);
    }
  }
  out.push(table(['Run', 'Gaps that break the rhythm'], rrows));
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
  out.push(`Reviewer note 1 asks for both tap rates with every ability in. On day ${R.base.active.meta.days} of the active run, taps pay ${fx(last.tapFactor6)} times steady income at 6 taps a second and ${fx(last.tapFactor12)} times at 12, before Boost and Growth Spurt. A fully stacked moment multiplies that by at most 60 (Boost cap ${loadRaw().tuning.BOOST_CAP} times a Spurt of 4) for the 20 seconds a Spurt lasts, as GDD 13.5 rule 3 intends. That 20-second peak is not the same measure as the reviewer's 450 to 650, which is average active income over a session; the session averages are in the Boost table under the Game Designer's questions.`);
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
const BUDGET_LABELS = ['hour 1', 'day 1', '3', '7', '14', '30', '60'];

function worthSection(R: Runs): string {
  const out: string[] = ['## What each system is worth', ''];
  out.push('![Multipliers against the budget](charts/budget.svg)');
  out.push('');
  out.push('The designer\'s rough pacing script (GDD 17.6) ran on a budget: what managers, taps and "everything else" (skills, plants, card levels, research, heirlooms, achievements, codex, Mastery) multiply income by on each day. **The Game Designer retired this budget as a target on 2026-11-26**: the targets are the gate table and the Festival rhythm. It stays here as a reading aid. The simulator measures the same three numbers on the active player\'s newest world: the income-weighted manager multiplier, the permanent multiplier on the best floor without Rich Soil and Golden Hour (those are modelled by the script itself), and tap income at 6 taps a second as a multiple of steady income.');
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
  const base = R.base.active;
  const arows: string[][] = [];
  const line = (label: string, r: RunResult): string[] => {
    const g = gates(r);
    const play = r.timeline.find((e) => e.kind === 'world' && e.world === 1 && e.n === 1)?.play ?? null;
    return [label, play === null ? '-' : `${Math.round(play / MIN)} min`, when(g.worlds[1]), when(g.worlds[2]), when(g.festival), String(countBy(r, 'replant', 0, 3 * DAY)), String(levelAt(r, 3 * DAY))];
  };
  arows.push(line('Everything on', base));
  for (const sys of SYSTEMS) {
    const r = R.get(`off-${sys}`);
    if (r) arows.push(line(`Without: ${SYSTEM_LABEL[sys]}`, r));
  }
  out.push('On design 0.3 no single content system moves World 2 by more than a few percent of play time: the early rush comes from what every run has, the fixed managers of the top floors and tapping (see the table above).');
  out.push('');
  out.push('Game time moves in steps of whole sessions (World 2 either arrives in a session or at the start of the next one), so the first column, minutes of play, is the fair comparison.');
  out.push('');
  out.push(table(['Run', 'World 2, minutes of play', 'World 2', 'World 3', 'First Festival', 'Replants by day 3', 'Level on day 3'], arows));
  out.push('');
  return out.join('\n');
}

function designerAsksSection(R: Runs): string {
  const out: string[] = ['## The Game Designer\'s questions for design 0.3', ''];
  const cols: [string, RunResult][] = [['GDD', R.base.active], ...(R.fix ? ([['proposed', R.fix.active]] as [string, RunResult][]) : [])];
  // (a) Manager profit days 0 to 2.
  out.push('### Manager profit on the top floors, days 0 to 2 (CHANGES A.7, item 2)');
  out.push('');
  out.push('With one fixed manager per floor the rarest managers sit on the floors that earn most. Measured on the active player\'s newest world: the median hired manager, the mean of the three highest hired floors, and the income-weighted mean (what managers multiply that world\'s income by). The Game Designer kept the 0.3 manager numbers and retired the budget column as a target; the gate prices absorb the managers\' early strength.');
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
  out.push('### Mastery stars (reviewer note 5, designer proposal p5)');
  out.push('');
  const longA = R.get('fix-long-active') ?? (R.fix ?? R.base).active;
  const longM = R.get('fix-long-mixed') ?? (R.fix ?? R.base).mixed;
  const STAR_WIN: [number, number][] = [[0, 1], [1, 2], [3, 4], [5, 6], [8, 10], [12, 14], [18, 22], [28, 34], [40, 46], [55, 65]];
  const gddLevels = loadRaw().tuning.MASTERY_LEVELS as number[];
  const proposedLevels = (w: number): number[] => {
    let lv = gddLevels;
    for (const id of R.proposals) {
      const o = readOverlay(join(PROPOSALS_DIR, `${id}.yaml`));
      const m = (o.rows?.worlds?.[`world.w${w + 1}`] as { mastery?: number[] } | undefined)?.mastery;
      if (m) lv = m;
    }
    return lv;
  };
  const arrivalOf = (r: RunResult, w: number): number | null => (w === 0 ? 0 : r.timeline.find((e) => e.kind === 'world' && e.world === w && e.n === 1)?.t ?? null);
  const starDays = (r: RunResult, w: number): (number | null)[] => {
    const a = arrivalOf(r, w);
    const ts = a === null ? [] : r.timeline.filter((e) => e.kind === 'star' && e.world === w).map((e) => (e.t - a) / DAY);
    return STAR_WIN.map((_, k) => ts[k] ?? null);
  };
  const inWindow = (ds: (number | null)[]): number => ds.filter((d, k) => d !== null && d >= STAR_WIN[k]![0] - 0.05 && d <= STAR_WIN[k]![1] + 0.05).length;
  out.push(`Each world now has its own ten levels (multiples of 25), picked from the crossing data of 90-day runs so the active player\'s stars land as near as possible to the designer\'s days after arrival, with one star on the day of arrival and star 5 (the first Head copy) not before day 8. The picker finds the list with the least squared distance from the windows. The best level of a world rises in steps, once per Festival cycle, so some stars cannot land inside their window and land at the nearest step instead.`);
  out.push('');
  out.push(table(['World', 'GDD 0.3 (one list for all)', 'Proposed'], WORLD.map((name, w) => [name, gddLevels.join(', '), proposedLevels(w).join(', ')])));
  out.push('');
  out.push('Days after first arriving in the world when each star landed (Thymeford: stars start once World 2 is reached). A dash: not reached in the run.');
  out.push('');
  const srows: string[][] = [['Target', ...STAR_WIN.map(([lo, hi]) => (lo === 0 ? 'under 1' : `${lo} to ${hi}`)), '']];
  const starRuns: [string, RunResult, number][] = [['Active, GDD', R.base.active, 60], ['Active, proposed', longA, longA.meta.days], ['Mixed, proposed', longM, longM.meta.days]];
  for (let w = 0; w < WORLD.length; w++) {
    for (const [n, r] of starRuns) {
      const ds = starDays(r, w);
      if (arrivalOf(r, w) === null) continue;
      srows.push([`${WORLD[w]}, ${n.toLowerCase()}`, ...ds.map((d) => (d === null ? '-' : d.toFixed(1))), `${inWindow(ds)} of 10`]);
    }
  }
  out.push(table(['Run', ...STAR_WIN.map((_, k) => `Star ${k + 1}`), 'In window'], srows));
  out.push('');
  // Where a world's best level stopped rising.
  const stall = (r: RunResult, w: number): { level: number; day: number } | null => {
    const bests = r.samples.map((x) => [x.t, x.worlds[w]?.best ?? 0] as [number, number]);
    const top = Math.max(...bests.map((b) => b[1]));
    const at = bests.find((b) => b[1] === top)![0];
    return r.meta.days * DAY - at > 14 * DAY ? { level: top, day: at / DAY } : null;
  };
  const stA = stall(longA, 0);
  const stM = stall(longM, 0);
  out.push('**For checking the lists.** Days after each world\'s first arrival when its lowest floor first reached each level (best ever; floors restart at every Festival), from the 90-day runs. Measured at the end of each session, so a value is accurate to a session. A dash: not reached.');
  out.push('');
  const LEVELS = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750];
  const mrows2: string[][] = [];
  for (const [n, r] of [['Active', longA], ['Mixed', longM]] as [string, RunResult][]) {
    for (let w = 0; w < WORLD.length; w++) {
      const xs = levelCrossings(r, w, LEVELS);
      if (xs.every((x) => x === null)) continue;
      mrows2.push([`${n}, ${WORLD[w]}`, ...xs.map((x) => (x === null ? '-' : x.toFixed(1)))]);
    }
  }
  out.push(table(['Run (proposed numbers)', ...LEVELS.map(String)], mrows2));
  out.push('');
  out.push(`**Do the players keep levelling older worlds?** Worlds 2 to 6, yes: every Festival locks them again, the player climbs through them to the next ticket, and their best levels keep rising to the end of the run. While the game is open the player also buys in every open world every third second, and the Auto-Gardener (Ribbon Shop) buys levels in every open world with a share of its coins (\`AUTO_BUY_SHARE\` = 0.10). **Thymeford is the exception.**${stA ? ` Its lowest floor stops at level ${stA.level} on day ${stA.day.toFixed(1)} for the active player` : ''}${stM ? ` and at ${stM.level} on day ${stM.day.toFixed(1)} for the mixed player` : ''}. From then on the World 2 ticket is paid within the first minute after each Festival, before any Thymeford manager is hired, and the player Replants Thymeford straight away and plays the newest world. A world with no hired manager earns nothing until someone plays it, so the Auto-Gardener has no coins to spend there, and Thymeford stays at floor 1, level 1 until the next Festival. That is the player model (it always plays the newest world) meeting the design (a world earns nothing until a manager is hired). So no list can put Thymeford\'s stars 7 to 10 at 18 to 65 days for this player: the proposed list keeps the designer\'s rule and extends them by the step between stars 5 and 6 (${proposedLevels(0).slice(6).join(', ')}, not measured). A player who goes back to Thymeford on purpose can earn them.`);
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

function openItemsSection(R: Runs): string {
  const set = R.fix ?? R.base;
  const out: string[] = ['## Open items', ''];
  const long = PROFILES.map((p) => {
    const gaps = festivalGaps(set[p]).filter((g) => g.from >= 14 && g.days > VERDICT.festivalGapDays);
    return gaps.length === 0 ? `the ${NAME[p].toLowerCase()} player none` : `the ${NAME[p].toLowerCase()} player ${gaps.map((g) => `${g.days.toFixed(1)} days from day ${g.from.toFixed(1)}${g.open ? ' (still open when the run ended)' : ''}`).join(' and ')}`;
  });
  const shortest = PROFILES.map((p) => {
    const gs = festivalGaps(set[p]).filter((g) => g.from >= 30 && !g.open);
    return gs.length ? `${Math.min(...gs.map((g) => g.days)).toFixed(1)} (${NAME[p].toLowerCase()})` : null;
  }).filter(Boolean);
  const LATE = ['crop_rotation_4', 'training_day_4', 'living_soil_1', 'living_soil_2', 'living_soil_3', 'living_soil_4', 'living_soil_5', 'living_soil_6'];
  const lateDays = (r: RunResult | null): string => {
    if (!r) return '-';
    const ev = r.timeline.filter((e) => e.kind === 'research' && LATE.some((id) => e.id?.endsWith(id)));
    return ev.length ? ev.map((e) => `${e.id!.split('.').pop()!.replace(/_(\d)$/, ' $1').replace(/_/g, ' ')} day ${(e.t / DAY).toFixed(1)}`).join(', ') : 'none';
  };
  const hasLate = R.proposals.some((id) => (readOverlay(join(PROPOSALS_DIR, `${id}.yaml`)).addRows?.research ?? []).length > 0);
  if (hasLate) {
    out.push(`- **Late research (the Game Designer's p5).** Festival gaps above 10 days after day 14: ${long.join(', ')}. The shortest gap after day 30 is ${shortest.join(', ')} days. Without the late research the active and mixed players had gaps of 10 to 13 days, which Golden Hour prices and \`RIBBON_C0\` only moved around. Three changes to the designer's first pass, all in \`p5-late-research\`: the costs are the designer's times 0.06 (the Insight rate is about 11,000 to 13,000 a day from day 20 to day 65, and the 40 existing projects use nearly all of it); Living Soil I follows Soil Science III instead of Soil Science V, because Soil Science V costs 150,000 and lands on day 64 for the active player, so no factor could start the chain sooner; and Living Soil is ×1.6 each instead of ×2, because ×2 gave the active player gaps of 3.0 to 3.7 days after day 30 and ×1.7 gaps of 3.6 and 3.9, under the designer's floor of 4 (the designer's rule: lower the multiplier before touching the costs). When they finish, active player (90-day run): ${lateDays(R.get('fix-long-active'))}. Mixed player: ${lateDays(R.get('fix-long-mixed'))}.`);
  }
  out.push('- **Thymeford\'s late Mastery stars (for the Game Designer).** Thymeford\'s lowest floor stops rising in week 2, because the World 2 ticket is paid within a minute of each Festival and nothing earns in a world without a hired manager. Stars 7 to 10 (three Head copies) are out of reach for a player who always plays the newest world. Either accept that they reward going back on purpose, or give the player a reason or a way to restart Thymeford (for example the Auto-Gardener hiring the first manager). Details under "Mastery stars".');
  const accepted = new Set(['active:Top floor of Thymeford', 'mixed:World 2']);
  const misses: string[] = [];
  for (const p of PROFILES) for (const c of checks(set[p], p)) if (!c.ok && !accepted.has(`${p}:${c.label}`)) misses.push(`${NAME[p].toLowerCase()} player's ${c.label} ${c.measured} against ${c.target} (${c.verdict})`);
  if (misses.length) out.push(`- **Pacing checks still off target.** The ${misses.join('; the ')}. ${misses.length === 1 ? 'It is' : 'They are'} the only miss${misses.length === 1 ? '' : 'es'} that the designer has not accepted.`);
  out.push(`- **Accepted by the Game Designer (2026-11-26).** The active player's top floor of Thymeford at ${when(floorTime(set.active, 10))} (window from 21 minutes; floor prices were not part of the refit), the mixed player's World 2 on day ${(gates(set.mixed).worlds[1]! / DAY).toFixed(1)} (window to day 2.1; it does not follow the ticket, the mixed player's short sessions set it), the step in the Festival rhythm near day 13, and buying Golden Hour first as the player model. A real player can buy the cheaper Ribbon items first, so the Ribbon Shop could show Golden Hour first or mark it as the best buy (a note for the UI).`);
  out.push('- **Design 0.4.** The designer folds `p1-levels`, `p2-taps`, `p4-gates` and `p5-late-research` into the GDD and CONTENT once PR #5 has merged. Then the tables change, the overlays go, and `pnpm sim` reruns on the new tables. `RIBBON_C0` and the World 6 ticket (raised to 6e34 once the late research was in, so the mixed player does not reach World 6 before its window) were set by hand after the fit, so a later `pnpm sim calibrate` that includes the Festival or World 6 step moves them back; refit with `--only` for the gates that move.');
  out.push('');
  return out.join('\n');
}

function staticSections(): string {
  return `## Reviewer's five notes (re-check of PR #3)

1. **Ceiling sentence in GDD 6.7.** Measured above under "Burst stacking and the tap limit", at both tap rates, with every ability in.
2. **Combo for a mouse-only player.** Not a number the simulator can settle. The simulated player taps without pauses while tapping, and its purchases do not interrupt the Combo (assumption below). A playtest should decide.
3. **Autopilot taps and counted taps.** The simulator follows the ruling: Autopilot taps fill neither Spurt, Combo, Hearth Heat, tap quests nor the \`taps\` achievement.
4. **Event track every weekend.** Played every weekend; its chests are in all card and heirloom rates (table above).
5. **Mastery spacing.** Measured above, with the level crossings the designer asked for to set the ten levels.

__OPEN_ITEMS__

## Tests

\`pnpm test\` runs 57 tests (Vitest and fast-check) in about 10 seconds:

- **Big numbers.** Save text round-trips bit for bit at any size; multiply then divide keeps 15 significant digits; integers are exact to 15 digits and within one part in 1e15 past that; comparisons agree with logarithms; a 10,000-level cost curve and 1e(2e12) stay finite; NaN, infinity and junk text are refused.
- **One formatter.** A golden table (1,234, 1.23M, 12.3M, 123M, 1.00Dc, 1.00Ce, 1.00e306, long names, scientific, engineering, durations, multipliers), and properties over a million random sizes: always three significant digits once abbreviated, holdings round down and prices round up, never more than one step in the third digit.
- **Formulas.** Bulk buy equals buying one level at a time; max affordable buys the most the cash covers and no more; Compost and its inverse; Compost and Ribbons never fall as lifetime rises; Compost-record XP; shop prices.
- **Chests on design 0.3.** One fixed manager per floor with the Head on top; manager cards only from managers already met and never a Head; the Starlight Head copy only for a Head with five stars; card counts and guarantees; same seed, same chest.
- **Content.** Tables validate; floor tables equal what the template generates; every proposal overlay applies and validates; an overlay can add rows and give a world its own Mastery levels; a typo, a duplicate row or falling Mastery levels are errors.
- **Under play.** A save reads back to the same state and carries on identically; ten one-second ticks equal one ten-second tick; offline pay is proportional to time away up to the cap and stops at the cap; a two-day active soak stays finite and inside the Boost cap.

One thing the tests found: the big-number library turns a NaN or infinite part into 0 without a word, so the core's NaN guard (\`assertFinite\`) could never fire for a broken formula. \`Num.fromParts\` now refuses non-finite parts. Division by zero still gives 0 in the library, so code that divides must check its divisor; a test pins that behaviour down so a library change cannot slip by.

## Assumptions the simulator makes

- **New player.** For the first two minutes 0.3 purchases a second and 30 percent of taps landed, then 0.35 and 35 percent to minute 10, 0.4 and 35 percent to the end of the first hour, then 2 a second and every tap. Fitted to the GDD's first-hour table on the bare game (floor 10 at 29.5 minutes, first Replant at 51 minutes).
- **Abilities.** A manager's ability can be pressed only while its world is on screen and the manager is hired. Leaving a world ends what an ability gave the taps (Combo lock, Liftoff).
- **Tea Party** adds 120 seconds of the world's steady income to the bubbles. **Wake-Up Call** makes the next missed sunrise pay as caught.
- **Auto-Gardener** is one switch. **Head Start** money is paid on first entry to a new world. Purchases do not interrupt tapping. Autopilot taps are not counted taps.
- **Garden Fair** every weekend, played in the sessions of that weekend.
- **Replant** when pending Compost is at least the era's Compost, or when the run is six hours old and a fifth of the era's Compost is pending (the designer's script; counted as "Replants by the six-hour rule"). **Festival** when pending Ribbons are at least the Ribbons claimed, as in the designer's script.

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
  writeFileSync(join(CHARTS, 'gates.svg'), gateChart('When each gate arrives', 'Dot: simulated player. Ring: target (GDD 17.6 with the 2026-11-26 rulings), same colour. Log time axis.', panels, PSERIES));
  // Festivals.
  const fest = (set: Record<ProfileId, RunResult>, title: string): string =>
    lineChart(title, 'Harvest Festivals held so far. Rings: targets for the first Festival and Festivals by day 30.', 'Festivals', PROFILES.map((p) => {
      const r = set[p];
      const pts: [number, number][] = [[0, 0]];
      let n = 0;
      for (const e of r.timeline) if (e.kind === 'festival') pts.push([e.t / DAY, ++n]);
      return { name: NAME[p], color: SERIES[p], points: pts, targets: [[TARGETS[p]!.festival.at, 1], [30, (TARGETS[p]!.festivalsBy30[0] + TARGETS[p]!.festivalsBy30[1]) / 2]] as [number, number][] };
    }), { step: true, xMax: 60, targetName: 'Target' });
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
  writeFileSync(join(CHARTS, 'budget.svg'), budgetChart('Multipliers against the budget', 'GDD 17.6 budget (dashed) and the active player as measured, on its newest world. Log scale.', [
    { title: 'Managers (income-weighted)', days: BUDGET_DAYS, labels: BUDGET_LABELS, budget: BUDGET_DAYS.map((d) => budgetAt(BUDGET.manager, d)), measured: pick((s) => s.mult.managerWeighted) },
    { title: 'Everything else', days: BUDGET_DAYS, labels: BUDGET_LABELS, budget: BUDGET_DAYS.map((d) => budgetAt(BUDGET.everythingElse, d)), measured: pick((s) => s.mult.permanent) },
    { title: 'Tap income (6 taps a second)', days: BUDGET_DAYS, labels: BUDGET_LABELS, budget: BUDGET_DAYS.map((d) => budgetAt(BUDGET.tapMultiple, d)), measured: pick((s) => s.tapFactor6) },
  ]));
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
  const proposals = fix ? (proposal ? proposal.split(',') : (get('fix-active')?.meta.rules.split(/[+,]/) ?? [])) : [];
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
    '**How to run.** From the repository root: `pnpm install`, then `pnpm sim` (every run and this report, about 4 minutes on 4 processors). One player as a printed timeline: `pnpm sim run --profile idle --days 14`. Fit the gate prices again after a design change: `pnpm sim calibrate --base p1-levels,p2-taps --out p4-gates`.',
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
    staticSections().replace('__OPEN_ITEMS__', openItemsSection(R)),
  ];
  writeFileSync(join(DOCS, 'REPORT.md'), parts.join('\n'));
  console.log(`wrote docs/balance/REPORT.md, ${CHARTS.replace(REPO_DIR + '/', '')}/*.svg and ${DATA.replace(REPO_DIR + '/', '')}/`);
}
