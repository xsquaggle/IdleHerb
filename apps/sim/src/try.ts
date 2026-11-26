import { loadContent } from '@sprout/content';
import { PROFILES, DEFAULT_STYLE } from './profiles';
import { runSim } from './run';

const [profile = 'active', days = '2', skill = 'human', rate = '6', off = '', verbose = ''] = process.argv.slice(2);
const content = loadContent();
const r = runSim({ content, profile: PROFILES[profile as 'active'], style: { ...DEFAULT_STYLE, skill: skill as 'human', tapRate: Number(rate), off: off ? off.split(',') : [] }, seed: 1, days: Number(days), maxWorld: 4, rules: 'gdd' });
const fmt = (t: number) => (t < 7200 ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}` : `d${(t / 86400).toFixed(2)}`);
const seen = new Set<string>();
for (const e of r.timeline) {
  if (!verbose && (e.kind === 'level' || e.kind === 'story' || e.kind === 'star' || e.kind === 'hire' || e.kind === 'heirloom' || e.kind === 'research' || e.kind === 'fair' || e.kind === 'bench')) continue;
  if (e.kind === 'replant' && (e.n ?? 0) > 1) continue;
  if (e.kind === 'floor' && !(e.world === 0) ) continue;
  if (e.kind === 'world' && e.n === 0) continue;
  console.log(fmt(e.t).padStart(8), `play ${fmt(e.play)}`.padEnd(14), e.kind.padEnd(9), e.id, e.n ?? '', e.amount !== undefined ? `1e${e.amount.toFixed(1)}` : '');
}
const last = r.samples[r.samples.length - 1]!;
console.log(JSON.stringify({ sec: r.meta.seconds, level: last.level, festivals: last.festivals, replants: last.replants, cards: last.cards, research: last.research, quiet: r.quiet, valve: r.valveReplants, actions: r.actions, mult: last.mult }, null, 0));
