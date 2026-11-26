/**
 * The balance simulator's command line.
 *
 *   pnpm sim                      run every simulation and write docs/balance/REPORT.md
 *   pnpm sim run [options]        one player, printed as a timeline
 *   pnpm sim suite [options]      every simulation of the report, in parallel, to apps/sim/out/
 *   pnpm sim report               rebuild the report and charts from apps/sim/out/
 *   pnpm sim calibrate [options]  fit the gate prices to the pacing table (see calibrate.ts)
 *
 * Options for `run`:
 *   --profile active|mixed|idle   (default active)
 *   --days N                      (default 7)
 *   --tap 6|12                    taps per second while tapping (default 6)
 *   --skill human|perfect         (default human)
 *   --seed N                      (default 1)
 *   --max-world N                 4 = launch build, 6 = all planned worlds (default 6)
 *   --proposal id[,id]            overlay files from apps/sim/proposals
 *   --off a,b                     systems the player ignores (see profiles.ts)
 *   --burst                       hold timed abilities and fire them together
 *   --out file.json               write the full record
 *
 * Options for `suite` and the default command:
 *   --proposal id[,id]            also run the before-and-after set with these overlays
 *   --only group[,group]          baseline, check, seeds, ablation, burst, proposal, launch
 *   --jobs N                      parallel runs (default: the machine's processors)
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, readOverlay } from '@sprout/content';
import { DEFAULT_STYLE, PROFILES, type ProfileId } from './profiles';
import { runSim, type RunResult } from './run';
import { suite, type RunSpec } from './suite';

const here = dirname(fileURLToPath(import.meta.url));
export const SIM_DIR = join(here, '..');
export const OUT_DIR = join(SIM_DIR, 'out');
export const PROPOSALS_DIR = join(SIM_DIR, 'proposals');
export const REPO_DIR = join(SIM_DIR, '../..');

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

export function clock(t: number): string {
  if (t < 3 * 3600) return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  if (t < 86400) return `${(t / 3600).toFixed(1)} h`;
  return `day ${(t / 86400).toFixed(1)}`;
}

export function execute(spec: RunSpec): RunResult {
  const overlays = (spec.proposals ?? []).map((id) => readOverlay(join(PROPOSALS_DIR, `${id}.yaml`)));
  const content = loadContent({ overlays });
  return runSim({
    content,
    profile: PROFILES[spec.profile],
    style: { ...DEFAULT_STYLE, tapRate: spec.tapRate ?? 6, skill: spec.skill ?? 'human', burst: spec.burst ?? false, off: spec.off ?? [] },
    seed: spec.seed ?? 1,
    days: spec.days,
    maxWorld: spec.maxWorld ?? 6,
    rules: (spec.proposals ?? []).join('+') || 'gdd-0.2',
  });
}

function specFromFlags(f: Record<string, string>): RunSpec {
  return {
    name: f.name ?? 'run',
    profile: (f.profile ?? 'active') as ProfileId,
    days: Number(f.days ?? 7),
    tapRate: Number(f.tap ?? 6),
    skill: (f.skill ?? 'human') as 'human' | 'perfect',
    seed: Number(f.seed ?? 1),
    maxWorld: Number(f['max-world'] ?? 6),
    proposals: f.proposal ? f.proposal.split(',') : [],
    burst: f.burst === 'true',
    off: f.off ? f.off.split(',') : [],
    group: 'baseline',
  };
}

function printRun(r: RunResult): void {
  for (const e of r.timeline) {
    if (e.kind === 'level' || e.kind === 'story' || e.kind === 'hire' || e.kind === 'fair' || e.kind === 'star' || e.kind === 'heirloom' || e.kind === 'bench') continue;
    if (e.kind === 'replant' && (e.n ?? 0) > 1) continue;
    if (e.kind === 'floor' && e.world !== 0) continue;
    if (e.kind === 'world' && e.n === 0) continue;
    const amount = e.amount !== undefined ? ` (1e${e.amount.toFixed(1)})` : '';
    console.log(`${clock(e.t).padStart(9)}  played ${clock(e.play).padEnd(9)} ${e.kind.padEnd(9)} ${e.id}${e.kind === 'festival' ? ` #${e.n}` : ''}${amount}`);
  }
  const last = r.samples[r.samples.length - 1]!;
  console.log(`\nday ${r.meta.days}: level ${last.level}, ${last.festivals} Festivals, ${last.replants} Replants, ${last.cards} cards, ${last.research} research projects`);
  console.log(`longest stretch of open-game time with nothing to buy: ${clock(r.quiet.seconds)} (ended ${clock(r.quiet.endedAt)})`);
  console.log(`simulated in ${r.meta.seconds.toFixed(1)} s`);
}

function runChild(spec: RunSpec, outFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [join(here, 'cli.ts'), 'run', '--quiet', '--name', spec.name, '--profile', spec.profile, '--days', String(spec.days),
      '--tap', String(spec.tapRate ?? 6), '--skill', spec.skill ?? 'human', '--seed', String(spec.seed ?? 1), '--max-world', String(spec.maxWorld ?? 6), '--out', outFile];
    if (spec.proposals?.length) args.push('--proposal', spec.proposals.join(','));
    if (spec.off?.length) args.push('--off', spec.off.join(','));
    if (spec.burst) args.push('--burst');
    const child = spawn(join(REPO_DIR, 'node_modules/.bin/tsx'), args, { stdio: ['ignore', 'inherit', 'inherit'] });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${spec.name} failed with code ${code}`))));
  });
}

async function runSuite(f: Record<string, string>): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  let runs = suite(f.proposal ?? null);
  if (f.only) {
    const groups = new Set(f.only.split(','));
    runs = runs.filter((r) => groups.has(r.group));
  }
  // Longest first, so the short runs fill the gaps.
  runs.sort((a, b) => b.days * (b.profile === 'active' ? 8 : b.profile === 'mixed' ? 3 : 1) - a.days * (a.profile === 'active' ? 8 : a.profile === 'mixed' ? 3 : 1));
  const jobs = Math.max(1, Number(f.jobs ?? cpus().length));
  const started = Date.now();
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < runs.length) {
      const spec = runs[next++]!;
      const t0 = Date.now();
      await runChild(spec, join(OUT_DIR, `${spec.name}.json`));
      console.log(`  ${spec.name.padEnd(28)} ${String(spec.days).padStart(3)} days  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  };
  console.log(`running ${runs.length} simulations on ${jobs} processors`);
  await Promise.all(Array.from({ length: jobs }, worker));
  writeFileSync(join(OUT_DIR, 'suite.json'), JSON.stringify({ proposal: f.proposal ?? null, runs }, null, 1));
  console.log(`done in ${((Date.now() - started) / 1000).toFixed(0)} s`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'all';
  const f = flags(argv);
  if (command === 'run') {
    const spec = specFromFlags(f);
    const result = execute(spec);
    if (f.out) {
      mkdirSync(dirname(f.out), { recursive: true });
      writeFileSync(f.out, JSON.stringify({ spec, result }));
    }
    if (f.quiet !== 'true') printRun(result);
    return;
  }
  if (command === 'suite') return runSuite(f);
  if (command === 'calibrate') {
    const { calibrate } = await import('./calibrate');
    return calibrate(argv);
  }
  const { writeReport } = await import('./report');
  if (command === 'report') return writeReport();
  if (command === 'all') {
    await runSuite(f);
    return writeReport();
  }
  console.error(`unknown command "${command}". See the comment at the top of apps/sim/src/cli.ts.`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
