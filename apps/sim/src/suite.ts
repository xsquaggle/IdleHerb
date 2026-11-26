/**
 * The list of simulations behind docs/balance/REPORT.md. Each entry is one
 * player from first launch to day N. `pnpm sim` runs them all.
 */
export interface RunSpec {
  name: string;
  profile: 'active' | 'mixed' | 'idle';
  days: number;
  tapRate?: number;
  skill?: 'human' | 'perfect';
  seed?: number;
  /** 4 = the launch build, 6 = all six planned worlds. */
  maxWorld?: number;
  /** Overlay files from apps/sim/proposals, by id. */
  proposals?: string[];
  burst?: boolean;
  off?: string[];
  group: 'baseline' | 'check' | 'seeds' | 'ablation' | 'burst' | 'proposal' | 'launch';
}

export const SYSTEMS = ['skills', 'bestSeats', 'cardLevels', 'plants', 'heirlooms', 'abilities', 'visitors', 'research', 'shopExtras', 'spurt'] as const;

export const SYSTEM_LABEL: Record<string, string> = {
  skills: 'Skill tree',
  bestSeats: 'Best managers on the best floors (worst first instead)',
  cardLevels: 'Card levels',
  plants: 'Plants',
  heirlooms: 'Heirlooms',
  abilities: 'Manager and heirloom abilities',
  visitors: 'Garden Visitors',
  research: 'Research',
  shopExtras: 'Compost Shop items other than Rich Soil',
  spurt: 'Growth Spurts',
  chests: 'Chests (no cards beyond the scripted ones)',
};

/** Every system the designer's rough script leaves out. */
export const BARE = ['skills', 'plants', 'abilities', 'cardLevels', 'heirlooms', 'research', 'visitors', 'bestSeats', 'shopExtras', 'chests'];

export function suite(proposal: string | null): RunSpec[] {
  const runs: RunSpec[] = [
    // The GDD's numbers, all six planned worlds, the three profiles of GDD 17.6.
    { name: 'gdd-active', profile: 'active', days: 60, maxWorld: 6, group: 'baseline' },
    { name: 'gdd-mixed', profile: 'mixed', days: 60, maxWorld: 6, group: 'baseline' },
    { name: 'gdd-idle', profile: 'idle', days: 60, maxWorld: 6, group: 'baseline' },
    { name: 'gdd-active-tap12', profile: 'active', days: 30, maxWorld: 6, tapRate: 12, group: 'baseline' },
    // The launch build stops at world 4.
    { name: 'launch-active', profile: 'active', days: 60, maxWorld: 4, group: 'launch' },
    { name: 'launch-idle', profile: 'idle', days: 60, maxWorld: 4, group: 'launch' },
    // Checks of the simulator itself.
    { name: 'check-bare-perfect', profile: 'active', days: 3, skill: 'perfect', maxWorld: 6, off: BARE, group: 'check' },
    { name: 'check-perfect', profile: 'active', days: 3, skill: 'perfect', maxWorld: 6, group: 'check' },
    { name: 'seed-2', profile: 'active', days: 14, seed: 2, maxWorld: 6, group: 'seeds' },
    { name: 'seed-3', profile: 'active', days: 14, seed: 3, maxWorld: 6, group: 'seeds' },
    // The audit's burst: every timed ability held and fired together, at the tap limit.
    { name: 'burst-v01', profile: 'active', days: 10, tapRate: 12, burst: true, proposals: ['gdd-v0.1-boosts'], maxWorld: 6, group: 'burst' },
    { name: 'burst-v02', profile: 'active', days: 10, tapRate: 12, burst: true, maxWorld: 6, group: 'burst' },
  ];
  for (const sys of SYSTEMS) runs.push({ name: `off-${sys}`, profile: 'active', days: 3, maxWorld: 6, off: [sys], group: 'ablation' });
  if (proposal) {
    runs.push(
      { name: `${proposal}-active`, profile: 'active', days: 60, maxWorld: 6, proposals: [proposal], group: 'proposal' },
      { name: `${proposal}-mixed`, profile: 'mixed', days: 60, maxWorld: 6, proposals: [proposal], group: 'proposal' },
      { name: `${proposal}-idle`, profile: 'idle', days: 60, maxWorld: 6, proposals: [proposal], group: 'proposal' },
      { name: `${proposal}-active-tap12`, profile: 'active', days: 30, maxWorld: 6, tapRate: 12, proposals: [proposal], group: 'proposal' },
      { name: `${proposal}-perfect`, profile: 'active', days: 3, skill: 'perfect', maxWorld: 6, proposals: [proposal], group: 'proposal' },
      { name: `${proposal}-launch-active`, profile: 'active', days: 60, maxWorld: 4, proposals: [proposal], group: 'proposal' },
    );
  }
  return runs;
}
