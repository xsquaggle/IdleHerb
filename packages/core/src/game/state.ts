/**
 * The game state: one plain object tree (docs/tech/02-architecture.md, "State").
 * Only the core writes to it. Timers hold time remaining in game time, never a date.
 */
import { Num } from '../kernel/num/num';
import type { RngState } from '../kernel/rng/rng';
import type { Pity } from '../systems/chests/logic';

export interface FloorState {
  /** 0 = not open. */
  level: number;
  /** The hire fee has been paid in the current run. */
  hired: boolean;
  /** Plant cards in this floor's planters (kept through Replants). */
  plants: string[];
  /** Fraction of the current cycle that has run, 0 to 1. */
  progress: number;
  /** An unmanaged floor that has finished its cycle and waits for a tap. */
  ready: boolean;
  /** Seconds of construction left after opening. */
  constructing: number;
  /** Highest milestone count reached in the current era (drives Insight). */
  eraMilestones: number;
  /** Highest milestone count ever (drives first-time XP). */
  bestMilestones: number;
  /**
   * This floor's Auto-Gardener switch (CONTENT.md 8). Starts on and is kept
   * through every reset. Floor 1's switch also governs its free manager.
   * Saves from before design 0.4 have no switch: read it with `switchOn`.
   */
  autoBuy: boolean;
}

export interface WorldState {
  /** Reachable in the current era (ticket bought, or world 1). */
  unlocked: boolean;
  /** Reached at least once, ever. */
  everReached: boolean;
  coins: Num;
  /** Currency earned in the current era. Does not reset on Replant. */
  lifetime: Num;
  /** Compost already claimed from this world in the current era. */
  claimed: Num;
  floors: FloorState[];
  replantsEra: number;
  replantsEver: number;
  /** Game time of the last Replant chest from this world. */
  lastReplantChestAt: number;
  /** Game time when the current run started. */
  runStartedAt: number;
  /** Best-ever lowest floor level (World Mastery). */
  bestMinLevel: number;
  stars: number;
  /** Highest level any floor in this world has ever reached, for milestone crates. */
  bestLevelEver: number;
  /** Best-ever "all floors at level 100 x n" chapter goal claimed. */
  chapterClaimed: number;
  // Twist state. Only the fields of the world's own twist are used.
  customerQueue: number;
  customerTimer: number;
  heat: number;
  weatherClock: number;
  /** The Moon: income held in bubbles. Nebula Nursery: income banked this orbit. */
  bank: Num;
  /** Seconds since the bubbles were last popped, or since the orbit began. */
  bankClock: number;
  /** Nebula Nursery: last orbit's bank, waiting for the sunrise click. */
  sunrisePending: Num;
  /** Seconds left in the sunrise window; 0 when no window is open. */
  sunriseWindow: number;
  sunriseStreak: number;
  /** Wake-Up Call is waiting for the next sunrise. */
  sunriseArmed?: boolean;
  /** Ticket waypoint marks passed, ever (GDD 14.3). */
  waypoints: number;
}

export interface CardState {
  level: number;
  /** Copies held toward the next level. */
  copies: number;
  /** A manager who has been hired at least once, in any run (achievement `managers`). */
  everHired?: boolean;
}

/**
 * What a timed effect is (GDD 13.5):
 *  boost     adds into the world's (or one floor's) Boost
 *  tapBoost  adds into the Boost for taps only
 *  spurt     the Growth Spurt: the one timed multiplier on top of the Boost
 *  discount  a timed level-cost discount on one floor (Dig In); not a boost
 */
export type BuffKind = 'boost' | 'tapBoost' | 'spurt' | 'discount';

export interface Buff {
  id: string;
  kind: BuffKind;
  /** World index, or -1 for every world. */
  world: number;
  /** Floor index, or -1 for every floor in the world. */
  floor: number;
  /** Written "xN": a boost's bonus is N - 1. */
  mult: number;
  remaining: number;
}

export interface ResearchJob {
  id: string;
  remaining: number;
}

export interface BenchJob {
  plantId: string;
  remaining: number;
}

export type VisitorKind = 'windfall' | 'sunbeam' | 'storm' | 'dewdrop' | 'crate' | 'bee';

export interface VisitorState {
  kind: VisitorKind;
  remaining: number;
  /** Lucky Day: this Windfall pays this many times as much. */
  jackpot?: number;
}

export interface QuestSlot {
  id: string;
  /** Value of the quest's counter when the quest was drawn. */
  start: number;
  done: boolean;
}

export interface FairState {
  active: boolean;
  /** Week number of the event this stall belongs to. */
  weekKey: number;
  /** Fair Tickets in hand. */
  coins: Num;
  /** Lifetime Fair Tickets this event: moves the reward track. */
  tickets: Num;
  /** Reward steps already claimed. */
  step: number;
  levels: number[];
  progress: number[];
}

/** Lifetime counters. They feed achievements, quests and story goals and never reset. */
export type Counters = Record<string, number>;

export interface GameState {
  version: number;
  /** Game time in seconds: the running total of time the core has been given. */
  time: number;
  /** Seconds with the game open. */
  playTime: number;
  /** Seconds between a local Monday 00:00 and game time 0. Day and week numbers come from it. */
  clockOffset: number;
  seed: number;
  rng: { loot: RngState; events: RngState; quests: RngState };

  worlds: WorldState[];
  /** The world on screen: taps, Combo, Spurts and visitors belong to it. */
  focus: number;

  // Global currencies
  gems: number;
  pollen: number;
  insight: number;
  /** Compost in hand, for the Compost Shop. */
  compost: Num;
  /** Compost earned this era: the passive bonus reads this. */
  compostEra: Num;
  compostAllTime: Num;
  /** Ribbons in hand, for the Ribbon Shop. */
  ribbons: Num;
  /** Ribbons ever earned: the passive bonus reads this. */
  ribbonsClaimed: Num;
  festivals: number;

  // Player
  xp: number;
  level: number;
  skillPoints: number;
  skills: Record<string, number>;
  freeRespecs: number;
  /** Highest n for which all-time Compost has passed 2^n and paid its XP (GDD 9.1). */
  compostRecordPow: number;

  // Collection
  cards: Record<string, CardState>;
  heirlooms: Record<string, CardState>;
  equipped: string[];
  chests: Record<string, number>;
  chestsOpened: number;
  pity: Pity;
  luckDoubleNext: boolean;
  /** Heirloom Picks waiting to be used (one is given at the first Harvest Festival). */
  heirloomPicks: number;

  // Shops
  compostShop: Record<string, number>;
  ribbonShop: Record<string, number>;
  /** Auto-Replant rule per world: Replant at this multiple of the era's Compost. 0 = off. */
  autoReplant: number[];

  // Research and bench
  researchDone: Record<string, true>;
  researchQueue: ResearchJob[];
  benchJobs: BenchJob[];
  /** Sum of every floor's era-best milestone count (GDD 10). */
  recordMilestones: number;

  // Tapping
  combo: number;
  comboIdle: number;
  comboLock: number;
  spurtMeter: number;
  spurtExtended: number;
  guaranteedCrits: number;
  tapBoostTaps: number;
  tapBoostMult: number;
  jackpotArmed: number;
  buffs: Buff[];
  /** Ability id to seconds of cooldown left. Finished cooldowns are removed. */
  cooldowns: Record<string, number>;
  /** Taps not yet spent on harvesting a waiting floor (a tap harvests at most one). */
  tapHarvestCredit: number;

  // Visitors
  visitorTimer: number;
  beeTimer: number;
  visitors: VisitorState[];

  // Baskets
  basketTimer: number;
  basketStored: number;

  // Quests
  storyIndex: number;
  day: number;
  daily: QuestSlot[];
  dailyAllDone: boolean;
  week: number;
  weekly: QuestSlot[];
  weeklyAllDone: boolean;

  // Records
  counters: Counters;
  achievements: Record<string, number>;
  achievementCount: number;
  codex: Record<string, true>;
  codexCount: number;
  /** Feature id to the game time it unlocked. */
  unlocked: Record<string, number>;
  /** Highest world ever reached, 1-based. */
  worldReached: number;
  returns: number;
  hiringCrates: Record<string, true>;

  // Weekend fair
  fair: FairState;
}

export function newFloorState(): FloorState {
  return { level: 0, hired: false, plants: [], progress: 0, ready: false, constructing: 0, eraMilestones: 0, bestMilestones: 0, autoBuy: true };
}

/** A floor's Auto-Gardener switch. Missing (a save from before design 0.4) counts as on. */
export function switchOn(f: FloorState): boolean {
  return f.autoBuy !== false;
}

export function newWorldState(floorCount: number): WorldState {
  return {
    unlocked: false,
    everReached: false,
    coins: Num.ZERO,
    lifetime: Num.ZERO,
    claimed: Num.ZERO,
    floors: Array.from({ length: floorCount }, newFloorState),
    replantsEra: 0,
    replantsEver: 0,
    lastReplantChestAt: -1e12,
    runStartedAt: 0,
    bestMinLevel: 0,
    stars: 0,
    bestLevelEver: 0,
    chapterClaimed: 0,
    customerQueue: 0,
    customerTimer: 0,
    heat: 0,
    weatherClock: 0,
    bank: Num.ZERO,
    bankClock: 0,
    sunrisePending: Num.ZERO,
    sunriseWindow: 0,
    sunriseStreak: 0,
    waypoints: 0,
  };
}
