/**
 * The game: state, commands, the tick and the closed-form offline pass
 * (docs/tech/02-architecture.md). No rendering, no real clock, no Math.random.
 *
 * First version, written for the Phase 0 balance simulator. The rules are the
 * GDD's (section numbers are in the comments); the layout is one class so the
 * simulator could exist before the kernel's SystemModule contract does. Each
 * block below maps to one system folder and can move there unchanged.
 *
 * Two deliberate simplifications, both expected-value forms of a random rule:
 *  - a tap batch is paid at the average Bumper factor instead of rolling each tap
 *  - a Bountiful harvest pays (1 + chance) instead of rolling for a double
 * Chest contents, visitor kinds and spawn times are rolled from the seeded streams.
 */
import { Num, assertFinite } from '../kernel/num/num';
import { bulkCost, maxAffordable } from '../kernel/formulas/geometric';
import { nextRange, pickWeighted, seedRng } from '../kernel/rng/rng';
import type { Content, FloorDef, ManagerDef, PlantDef } from '../content/content';
import { RARITY_ORDER } from '../content/content';
import type { Ability, ChestRow, Condition, Effect, PoolQuestRow, Reward, Tuning } from '../content/schema';
import { rollChest } from '../systems/chests/logic';
import { floorOutput, milestoneCount } from '../systems/floors/logic';
import { averageHeat, compoundInterest } from '../systems/offline/logic';
import { levelUpChest, xpToNext } from '../systems/progression/logic';
import { compostRecordXp, compostTotal, ribbonsTotal, shopCost } from '../systems/resets/logic';
import { comboRun, expectedCrit } from '../systems/tapping/logic';
import { bubbleSweepAverage, heatMult, masteryStars, sunriseMult, weatherAt, weatherLoopSeconds, weatherGroupOf } from '../systems/worlds/logic';
import { computeDerived, type Derived } from './derive';
import { newWorldState, switchOn, type Buff, type FairState, type GameState, type QuestSlot, type VisitorKind, type WorldState } from './state';
import type { Command, EventBody, GameEvent, IncomeSource } from './types';

export const SAVE_VERSION = 1;
const EPS = 1e-9;
const MIN_STEP = 1e-6;

/** Fixed contents of the two scripted chests (GDD 8.3, "Special chests"). */
/** The Welcome Chest: this many copies of each manager of world 1 floors 1 to 3 (GDD 8.3). */
export const WELCOME_FLOORS = 3;
export const WELCOME_COPIES = 2;
/** A Hiring Crate (world 1 floors 4 to 9): this many copies of the floor's own manager, plus two Wooden Crate slots. */
export const HIRING_CRATE_COPIES = 2;
export const SEED_PACKET = ['plant.mint.garden', 'plant.hemp.fibre'];
const TIER_GATE = [0, 5, 15, 30];
const SOURCES: IncomeSource[] = ['floors', 'taps', 'visitors', 'twist', 'abilities', 'offline', 'autopilot', 'start'];

export interface GameOptions {
  content: Content;
  seed: number;
  /** Seconds between a local Monday 00:00 and game time 0. Default: 08:00 on a Monday. */
  clockOffsetSec?: number;
  /** Highest world (1-based) that can be reached. Default: every world in the content. */
  maxWorld?: number;
  /** Check every currency write for NaN and Infinity (tests and development). */
  debug?: boolean;
  /** Continue from a saved state instead of starting a new game. */
  state?: GameState;
}

export interface FloorInfo {
  open: boolean;
  managed: boolean;
  cycleSec: number;
  payout: Num;
  /** Income per second right now: steady x Boost x Growth Spurt. */
  ips: Num;
  /** Steady income per second: no Boost, no Spurt, the twist at its current value (GDD 13.5). */
  ipsSteady: Num;
  /** The offline rate: steady, with the weather loop at its average. */
  ipsOffline: Num;
}

interface WorldCache {
  dirty: boolean;
  floors: FloorInfo[];
  minLevel: number;
  towerMilestones: number;
  ipsAll: Num;
  ipsManaged: Num;
  steadyAll: Num;
  steadyManaged: Num;
  offlineManaged: Num;
  managedCount: number;
}

export interface AbilityInfo {
  ability: Ability;
  ownerKind: 'manager' | 'artifact';
  ownerId: string;
  /** Worlds where the owner is hired (managers) or -1 for "the world on screen" (heirlooms). */
  worlds: number[];
  ready: boolean;
  /** Seconds of cooldown left at the current tick rate. */
  readyIn: number;
}

export function newGameState(content: Content, seed: number, clockOffsetSec = 8 * 3600): GameState {
  const worlds = content.worlds.map((w) => newWorldState(w.floors.length));
  const w1 = worlds[0]!;
  w1.unlocked = true;
  w1.everReached = true;
  w1.floors[0]!.level = 1;
  return {
    version: SAVE_VERSION,
    time: 0,
    playTime: 0,
    clockOffset: clockOffsetSec,
    seed,
    rng: { loot: seedRng(seed, 'loot'), events: seedRng(seed, 'events'), quests: seedRng(seed, 'quests') },
    worlds,
    focus: 0,
    gems: 0,
    pollen: 0,
    insight: 0,
    compost: Num.ZERO,
    compostEra: Num.ZERO,
    compostAllTime: Num.ZERO,
    ribbons: Num.ZERO,
    ribbonsClaimed: Num.ZERO,
    festivals: 0,
    xp: 0,
    level: 1,
    skillPoints: 0,
    skills: {},
    freeRespecs: 0,
    compostRecordPow: 0,
    cards: {},
    heirlooms: {},
    equipped: [],
    chests: {},
    chestsOpened: 0,
    pity: { sinceEpic: 0, sinceLegendary: 0, heirloomsSinceLegendary: 0 },
    luckDoubleNext: false,
    heirloomPicks: 0,
    compostShop: {},
    ribbonShop: {},
    autoReplant: worlds.map(() => 0),
    researchDone: {},
    researchQueue: [],
    benchJobs: [],
    recordMilestones: 0,
    combo: 0,
    comboIdle: 0,
    comboLock: 0,
    spurtMeter: 0,
    spurtExtended: 0,
    guaranteedCrits: 0,
    tapBoostTaps: 0,
    tapBoostMult: 1,
    jackpotArmed: 0,
    buffs: [],
    cooldowns: {},
    tapHarvestCredit: 0,
    visitorTimer: 0,
    beeTimer: 0,
    visitors: [],
    basketTimer: 0,
    basketStored: 0,
    storyIndex: 0,
    day: Math.floor(clockOffsetSec / 86400),
    daily: [],
    dailyAllDone: false,
    week: Math.floor(clockOffsetSec / 86400 / 7),
    weekly: [],
    weeklyAllDone: false,
    counters: {},
    achievements: {},
    achievementCount: 0,
    codex: { [content.worlds[0]!.id]: true, [content.worlds[0]!.floors[0]!.id]: true },
    codexCount: 2,
    unlocked: {},
    worldReached: 1,
    returns: 0,
    hiringCrates: {},
    fair: { active: false, weekKey: -1, coins: Num.ZERO, tickets: Num.ZERO, step: 0, levels: [], progress: [] },
  };
}

export class Game {
  readonly content: Content;
  readonly t: Tuning;
  state: GameState;
  /** Income by source, per world, since the tally was last cleared. Not part of the save. */
  tally: Record<IncomeSource, Num>[];
  /** XP awarded so far by source. Not part of the save. */
  xpTally: Record<string, number> = {};

  private readonly maxWorld: number;
  private readonly debug: boolean;
  private listeners: ((e: GameEvent) => void)[] = [];
  private derivedCache: Derived | null = null;
  private caches: WorldCache[];
  private progressDue = 0;
  private autoDue = 0;
  private constructingCount = 0;
  private readonly questRows = new Map<string, PoolQuestRow>();
  private readonly fairFloors: FloorDef[];
  private fairCache: { cycleSec: number; payout: Num; ips: Num }[] | null = null;

  constructor(opts: GameOptions) {
    this.content = opts.content;
    this.t = opts.content.tuning;
    this.maxWorld = Math.min(opts.maxWorld ?? opts.content.worlds.length, opts.content.worlds.length);
    this.debug = opts.debug ?? false;
    this.state = opts.state ?? newGameState(opts.content, opts.seed, opts.clockOffsetSec);
    this.caches = this.state.worlds.map((w) => ({
      dirty: true,
      floors: w.floors.map(() => ({ open: false, managed: false, cycleSec: 1, payout: Num.ZERO, ips: Num.ZERO, ipsSteady: Num.ZERO, ipsOffline: Num.ZERO })),
      minLevel: 0,
      towerMilestones: 0,
      ipsAll: Num.ZERO,
      ipsManaged: Num.ZERO,
      steadyAll: Num.ZERO,
      steadyManaged: Num.ZERO,
      offlineManaged: Num.ZERO,
      managedCount: 0,
    }));
    this.tally = this.state.worlds.map(() => this.emptyTally());
    for (const q of [...this.content.daily, ...this.content.weekly]) this.questRows.set(q.id, q);
    this.fairFloors = this.content.worlds[0]!.floors.slice(0, this.t.FAIR_FLOORS);
    for (const w of this.state.worlds) for (const f of w.floors) if (f.constructing > 0) this.constructingCount++;
    this.checkProgress();
  }

  // ------------------------------------------------------------------ events

  on(listener: (e: GameEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(e: EventBody): void {
    if (this.listeners.length === 0) return;
    const full = { ...e, t: this.state.time } as GameEvent;
    for (const l of this.listeners) l(full);
  }

  private emptyTally(): Record<IncomeSource, Num> {
    const out = {} as Record<IncomeSource, Num>;
    for (const s of SOURCES) out[s] = Num.ZERO;
    return out;
  }

  clearTally(): void {
    this.tally = this.state.worlds.map(() => this.emptyTally());
  }

  private count(name: string, n = 1): void {
    const c = this.state.counters;
    c[name] = (c[name] ?? 0) + n;
  }

  counter(name: string): number {
    return this.state.counters[name] ?? 0;
  }

  // ----------------------------------------------------------- derived stats

  get derived(): Derived {
    if (!this.derivedCache) {
      this.derivedCache = computeDerived(this.state, this.content, this.eventBonus());
      for (const c of this.caches) c.dirty = true;
      this.fairCache = null;
    }
    return this.derivedCache;
  }

  /** Call after anything that grants or removes a bonus. */
  private invalidate(): void {
    this.derivedCache = null;
  }

  private dirtyAll(): void {
    for (const c of this.caches) c.dirty = true;
  }

  private eventBonus(): Effect | null {
    const f = this.state.fair;
    if (!f.active) return null;
    const n = this.content.fair.events.length;
    return this.content.fair.events.find((e) => e.weekMod === ((f.weekKey % n) + n) % n)?.bonus ?? null;
  }

  /**
   * Combines boosts written "xN" into one Boost (GDD 13.5). The rule is data:
   * BOOST_STACKING add (1 + sum of N - 1), multiply or strongest, then BOOST_CAP.
   */
  private combine(sum: number, product: number, strongest: number): number {
    const t = this.t;
    const value = t.BOOST_STACKING === 'add' ? 1 + sum : t.BOOST_STACKING === 'multiply' ? product : strongest;
    return t.BOOST_CAP > 0 ? Math.min(t.BOOST_CAP, value) : value;
  }

  /**
   * The Boost on one floor: every active world boost plus the boosts on that
   * floor. Pass floor -1 for the world's own Boost. `tap` also counts tap-only
   * boosts, and `extra` adds one more boost written "xN" (Liftoff).
   */
  boost(world: number, floor: number, tap = false, extra = 1): number {
    const buffs = this.state.buffs;
    if (buffs.length === 0 && extra === 1) return 1;
    let sum = extra - 1;
    let product = extra;
    let strongest = extra;
    for (const b of buffs) {
      if (b.kind !== 'boost' && !(tap && b.kind === 'tapBoost')) continue;
      if (b.world >= 0 && b.world !== world) continue;
      if (b.floor >= 0 && b.floor !== floor) continue;
      sum += b.mult - 1;
      product *= b.mult;
      if (b.mult > strongest) strongest = b.mult;
    }
    return this.combine(sum, product, strongest);
  }

  /** Growth Spurt speed while one is active in this world, else 1. */
  spurtMult(world: number): number {
    for (const b of this.state.buffs) if (b.kind === 'spurt' && b.world === world) return b.mult;
    return 1;
  }

  private discount(world: number, floor: number): number {
    let product = 1;
    for (const b of this.state.buffs) if (b.kind === 'discount' && b.world === world && b.floor === floor) product *= b.mult;
    return product;
  }

  private refreshWorld(w: number): WorldCache {
    const d = this.derived;
    const c = this.caches[w]!;
    if (!c.dirty) return c;
    const s = this.state;
    const t = this.t;
    const ws = s.worlds[w]!;
    const wd = d.worlds[w]!;
    const def = this.content.worlds[w]!;
    let minLevel = Infinity;
    for (const f of ws.floors) if (f.level < minLevel) minLevel = f.level;
    c.minLevel = minLevel;
    c.towerMilestones = milestoneCount(minLevel, t);
    const live = def.twist === 'weather' ? weatherAt(ws.weatherClock, t) : null;
    const anyBuff = s.buffs.length > 0;
    const spurt = anyBuff ? this.spurtMult(w) : 1;
    let all = Num.ZERO;
    let managedSum = Num.ZERO;
    let steadyAll = Num.ZERO;
    let steadyManaged = Num.ZERO;
    let offlineManaged = Num.ZERO;
    let managedCount = 0;
    for (let i = 0; i < ws.floors.length; i++) {
      const f = ws.floors[i]!;
      const fc = c.floors[i]!;
      if (f.level <= 0) {
        fc.open = false;
        fc.managed = false;
        fc.ips = fc.ipsSteady = fc.ipsOffline = fc.payout = Num.ZERO;
        continue;
      }
      const fd = wd.floors[i]!;
      const managed = f.hired;
      const common = fd.profit * (managed ? fd.manager : 1) * (1 + fd.doubleChance);
      const fdef = def.floors[i]!;
      // The twist counts at its current value in the steady rate (GDD 13.5 rule 9).
      const liveWeather = live === null ? 1 : fd.weatherGroups.size > 0 && (live === 'rainbow' || fd.weatherGroups.has(live)) ? t.WEATHER_PROFIT : 1;
      const steady = floorOutput(fdef, f.level, c.towerMilestones, wd.towerMult, fd.speed, d.global.passive.mul(common * liveWeather), t);
      let out = steady;
      if (anyBuff) {
        const boost = this.boost(w, i);
        if (boost !== 1 || spurt !== 1) {
          out = floorOutput(fdef, f.level, c.towerMilestones, wd.towerMult, fd.speed * spurt, d.global.passive.mul(common * liveWeather * boost), t);
        }
      }
      fc.open = true;
      fc.managed = managed;
      fc.cycleSec = out.cycleSec;
      fc.payout = out.payout;
      fc.ips = out.ips;
      fc.ipsSteady = steady.ips;
      fc.ipsOffline = live === null ? steady.ips : steady.ips.mul(fd.weather / liveWeather);
      all = all.add(out.ips);
      steadyAll = steadyAll.add(steady.ips);
      if (managed) {
        managedSum = managedSum.add(out.ips);
        steadyManaged = steadyManaged.add(steady.ips);
        offlineManaged = offlineManaged.add(fc.ipsOffline);
        managedCount++;
      }
    }
    c.ipsAll = all;
    c.ipsManaged = managedSum;
    c.steadyAll = steadyAll;
    c.steadyManaged = steadyManaged;
    c.offlineManaged = offlineManaged;
    c.managedCount = managedCount;
    c.dirty = false;
    return c;
  }

  private heatFactor(w: number): number {
    return this.content.worlds[w]!.twist === 'heat' ? heatMult(this.state.worlds[w]!.heat, this.t) : 1;
  }

  // ----------------------------------------------------------------- queries

  /** steadyIPS (GDD 6.2): every open floor at its own rate, with no Boost and no Growth Spurt. */
  steadyIps(w: number): Num {
    return this.refreshWorld(w).steadyAll.mul(this.heatFactor(w));
  }

  /** Every open floor at the rate it runs right now, with the Boost and any Growth Spurt. */
  worldIps(w: number): Num {
    return this.refreshWorld(w).ipsAll.mul(this.heatFactor(w));
  }

  /** Income per second of the floors that harvest themselves: right now, steady, or at the offline average. */
  managedIps(w: number, mode: 'now' | 'steady' | 'offline' = 'now'): Num {
    const c = this.refreshWorld(w);
    return (mode === 'now' ? c.ipsManaged : mode === 'steady' ? c.steadyManaged : c.offlineManaged).mul(this.heatFactor(w));
  }

  floorInfo(w: number, i: number): FloorInfo {
    return this.refreshWorld(w).floors[i]!;
  }

  towerMilestones(w: number): number {
    return this.refreshWorld(w).towerMilestones;
  }

  minLevel(w: number): number {
    return this.refreshWorld(w).minLevel;
  }

  levelCostMult(w: number, i: number): number {
    const fd = this.derived.worlds[w]!.floors[i]!;
    return Math.max(this.t.COST_MULT_FLOOR, fd.cost * this.discount(w, i));
  }

  levelsCost(w: number, i: number, count: number): Num {
    const def = this.content.worlds[w]!.floors[i]!;
    return bulkCost(def.levelBaseCost, def.growth, this.state.worlds[w]!.floors[i]!.level, count, this.levelCostMult(w, i));
  }

  maxLevels(w: number, i: number, cash?: Num): number {
    const def = this.content.worlds[w]!.floors[i]!;
    const ws = this.state.worlds[w]!;
    return maxAffordable(def.levelBaseCost, def.growth, ws.floors[i]!.level, cash ?? ws.coins, this.levelCostMult(w, i));
  }

  hireFee(w: number, i: number): Num {
    return this.content.worlds[w]!.floors[i]!.hireFee.mul(this.derived.global.hireFee);
  }

  /** Index of the next floor that can be opened, or -1 when the tower is complete. */
  nextFloor(w: number): number {
    const floors = this.state.worlds[w]!.floors;
    for (let i = 0; i < floors.length; i++) if (floors[i]!.level <= 0) return i;
    return -1;
  }

  topFloorOpen(w: number): boolean {
    const floors = this.state.worlds[w]!.floors;
    return floors[floors.length - 1]!.level > 0;
  }

  compostTotalOf(w: number): Num {
    const t = this.t;
    return compostTotal(this.state.worlds[w]!.lifetime, this.content.worlds[w]!.compostK, this.content.compostE0, t.COMPOST_EXP, this.derived.global.compostGain);
  }

  pendingCompost(w: number): Num {
    const p = this.compostTotalOf(w).sub(this.state.worlds[w]!.claimed);
    return p.gt(0) ? p : Num.ZERO;
  }

  canReplant(w: number): boolean {
    const ws = this.state.worlds[w]!;
    if (!ws.unlocked || !this.topFloorOpen(w)) return false;
    const need = this.counter('replants') === 0 ? this.t.FIRST_REPLANT_MIN : 1;
    return this.pendingCompost(w).gte(need);
  }

  pendingRibbons(): Num {
    const p = ribbonsTotal(this.state.compostAllTime, this.content.ribbonC0, this.t.RIBBON_EXP).sub(this.state.ribbonsClaimed);
    return p.gt(0) ? p : Num.ZERO;
  }

  canFestival(): boolean {
    const s = this.state;
    if (s.worldReached < this.t.FESTIVAL_NEEDS_WORLD) return false;
    return this.pendingRibbons().gte(s.festivals === 0 ? this.t.FIRST_FESTIVAL_MIN : 1);
  }

  insightPerHour(): number {
    return this.t.INSIGHT_PER_MILESTONE * this.state.recordMilestones * this.derived.global.insightGain;
  }

  spurtActive(w: number): Buff | undefined {
    return this.state.buffs.find((b) => b.kind === 'spurt' && b.world === w);
  }

  canBuyTicket(w: number): boolean {
    const def = this.content.worlds[w]!;
    const next = w + 1;
    if (def.ticket === null || next >= this.maxWorld) return false;
    const s = this.state;
    if (!s.worlds[w]!.unlocked || s.worlds[next]!.unlocked || !this.topFloorOpen(w)) return false;
    if (this.content.worlds[next]!.deedRibbons > 0 && !this.derived.global.specials[`deed.w${next + 1}`]) return false;
    return s.worlds[w]!.coins.gte(def.ticket);
  }

  /** Every ability the player could press now or later, with its cooldown. */
  abilities(): AbilityInfo[] {
    const s = this.state;
    const out: AbilityInfo[] = [];
    for (const owner of this.content.abilities.values()) {
      let worlds: number[];
      if (owner.ownerKind === 'manager') {
        worlds = [];
        // A manager's ability belongs to its own world, and works while the manager is hired (GDD 7.1 rule 7).
        const m = this.content.cards.get(owner.ownerId) as ManagerDef;
        const f = s.worlds[m.world]!.floors[m.floorIndex]!;
        if (!s.worlds[m.world]!.unlocked || !f.hired || f.level <= 0) continue;
        worlds.push(m.world);
      } else {
        if (!s.equipped.includes(owner.ownerId)) continue;
        worlds = [-1];
      }
      const rate = owner.ownerKind === 'manager' ? 1 / (1 - this.derived.global.cooldownReduction) : 1;
      const readyIn = Math.max(0, s.cooldowns[owner.ability.id] ?? 0) / rate;
      out.push({ ability: owner.ability, ownerKind: owner.ownerKind, ownerId: owner.ownerId, worlds, ready: readyIn <= 0, readyIn });
    }
    return out;
  }

  /** The day of the week for the current game time: 0 is Monday. */
  dayOfWeek(): number {
    return ((this.state.day % 7) + 7) % 7;
  }

  fairIps(): Num {
    let total = Num.ZERO;
    for (const f of this.fairInfo()) total = total.add(f.ips);
    return total;
  }

  // -------------------------------------------------------------- the tick

  /** Advance the open game by `dtMs` of play. Exact for any step size (docs/tech/07). */
  tick(dtMs: number): void {
    this.advance(dtMs / 1000);
  }

  advance(dt: number): void {
    let left = dt;
    let guard = 0;
    while (left > EPS) {
      const step = Math.min(left, this.nextBoundary());
      this.step(step);
      left -= step;
      if (++guard > 100000) throw new Error('advance: too many segments in one tick');
    }
    this.afterTime();
  }

  private afterTime(): void {
    const s = this.state;
    const day = Math.floor((s.time + s.clockOffset) / 86400);
    if (day !== s.day) this.newDay(day);
    if (s.time >= this.autoDue) {
      this.autoDue = s.time + 1;
      this.runAutomation();
    }
    if (s.time >= this.progressDue) this.checkProgress();
  }

  /** Seconds until the next moment an income rate changes. */
  private nextBoundary(): number {
    const s = this.state;
    const t = this.t;
    let next = Infinity;
    for (const b of s.buffs) if (b.remaining < next) next = b.remaining;
    if (this.constructingCount > 0) {
      for (const ws of s.worlds) {
        if (!ws.unlocked) continue;
        for (const f of ws.floors) if (f.constructing > 0 && f.constructing < next) next = f.constructing;
      }
    }
    const desks = Math.min(this.derived.global.researchDesks, s.researchQueue.length);
    for (let k = 0; k < desks; k++) if (s.researchQueue[k]!.remaining < next) next = s.researchQueue[k]!.remaining;
    for (let w = 0; w < s.worlds.length; w++) {
      const ws = s.worlds[w]!;
      if (!ws.unlocked) continue;
      const twist = this.content.worlds[w]!.twist;
      if (twist === 'weather') {
        const left = this.weatherPhaseLeft(ws.weatherClock);
        if (left < next) next = left;
      } else if (twist === 'bubbles') {
        const left = t.BUBBLE_CAP_SECONDS - ws.bankClock;
        if (left < next) next = left;
      } else if (twist === 'sunrise') {
        const left = t.ORBIT_SECONDS - ws.bankClock;
        if (left < next) next = left;
        if (ws.sunriseWindow > 0 && ws.sunriseWindow < next) next = ws.sunriseWindow;
      }
    }
    return Math.max(MIN_STEP, next);
  }

  private weatherPhaseLeft(clock: number): number {
    const loop = this.t.WEATHER_LOOP;
    let s = clock % weatherLoopSeconds(this.t);
    for (const len of [loop.sunshine, loop.rain, loop.breeze, loop.rainbow]) {
      if (s < len) return len - s;
      s -= len;
    }
    return MIN_STEP;
  }

  private step(dt: number): void {
    const s = this.state;
    const t = this.t;
    const d = this.derived;
    s.time += dt;
    s.playTime += dt;

    // Floors (GDD 5.5) and world twists (GDD 14.4).
    for (let w = 0; w < s.worlds.length; w++) {
      const ws = s.worlds[w]!;
      if (!ws.unlocked) continue;
      const c = this.refreshWorld(w);
      const twist = this.content.worlds[w]!.twist;
      let income: Num | null = null;
      const floors = ws.floors;
      for (let i = 0; i < floors.length; i++) {
        const f = floors[i]!;
        if (f.level <= 0) break;
        if (f.constructing > 0) {
          f.constructing -= dt;
          if (f.constructing <= EPS) {
            f.constructing = 0;
            this.constructingCount--;
          }
          continue;
        }
        const fc = c.floors[i]!;
        if (fc.managed) {
          const total = f.progress + dt / fc.cycleSec;
          const cycles = Math.floor(total + 1e-12);
          f.progress = Math.max(0, total - cycles);
          if (cycles > 0) income = income ? income.add(fc.payout.mul(cycles)) : fc.payout.mul(cycles);
        } else if (!f.ready) {
          f.progress += dt / fc.cycleSec;
          if (f.progress >= 1 - 1e-12) {
            f.ready = true;
            f.progress = 0;
          }
        }
      }
      if (twist === 'heat') {
        const floorHeat = d.worlds[w]!.hires > 0 ? t.HEAT_FLOOR : 0;
        const h = averageHeat(Math.max(ws.heat, floorHeat), floorHeat, t.HEAT_DECAY, dt);
        if (income) this.earn(w, income.mul(heatMult(h.average, t)), 'floors');
        ws.heat = h.end;
      } else if (twist === 'bubbles') {
        if (income) ws.bank = ws.bank.add(income);
        ws.bankClock += dt;
        if (ws.bankClock >= t.BUBBLE_CAP_SECONDS - EPS) {
          if (ws.bank.gt(0)) this.earn(w, ws.bank, 'floors');
          ws.bank = Num.ZERO;
          ws.bankClock = 0;
        }
      } else if (twist === 'sunrise') {
        if (income) ws.bank = ws.bank.add(income);
        if (ws.sunriseWindow > 0) {
          ws.sunriseWindow -= dt;
          if (ws.sunriseWindow <= EPS) this.settleSunrise(w, false);
        }
        ws.bankClock += dt;
        if (ws.bankClock >= t.ORBIT_SECONDS - EPS) {
          if (ws.sunriseWindow > 0) this.settleSunrise(w, false);
          ws.sunrisePending = ws.bank;
          ws.bank = Num.ZERO;
          ws.bankClock = 0;
          ws.sunriseWindow = t.SUNRISE_WINDOW;
        }
      } else {
        if (income) this.earn(w, income, 'floors');
        if (twist === 'customers') {
          ws.customerTimer += dt;
          while (ws.customerTimer >= t.CUSTOMER_INTERVAL) {
            ws.customerTimer -= t.CUSTOMER_INTERVAL;
            if (ws.customerQueue < t.CUSTOMER_QUEUE_CAP) ws.customerQueue++;
          }
        } else if (twist === 'weather') {
          const before = weatherAt(ws.weatherClock, t);
          ws.weatherClock += dt;
          if (weatherAt(ws.weatherClock, t) !== before) c.dirty = true;
        }
      }
    }

    // Autopilot (CONTENT 5.3): every hired manager in every unlocked world taps once a second,
    // from that world's steady rate: no Combo, Bumpers, Boost or Spurt.
    const autopilot = d.global.keystones['keystone.autopilot'];
    if (autopilot && s.unlocked['feature.tap_bonus'] !== undefined) {
      for (let w = 0; w < s.worlds.length; w++) {
        const hires = d.worlds[w]!.hires;
        if (!s.worlds[w]!.unlocked || hires <= 0) continue;
        const taps = hires * (autopilot.tapsPerSecond ?? 1) * dt;
        this.earn(w, this.steadyIps(w).mul(t.TAP_SECONDS * d.worlds[w]!.tapPower * taps), 'autopilot');
      }
    }

    // Weekend fair stall (GDD 15.3).
    if (s.fair.active) this.stepFair(dt);

    // Ability cooldowns. Manager cooldown reduction makes them tick faster (GDD 13.4).
    this.tickCooldowns(dt);

    // Timed boosts run out after the income they covered is paid.
    if (s.buffs.length > 0) {
      let expired = false;
      for (const b of s.buffs) {
        b.remaining -= dt;
        if (b.remaining <= EPS) expired = true;
      }
      if (expired) {
        s.buffs = s.buffs.filter((b) => b.remaining > EPS);
        this.dirtyAll();
      }
    }

    // Combo (GDD 6.3).
    const fw = d.worlds[s.focus]!;
    if (s.combo > 0) {
      if (s.combo >= fw.comboCap - 1e-6 && s.comboIdle <= fw.comboGrace) this.count('fullComboSec', dt);
      s.comboIdle += dt;
      if (s.comboLock > 0) s.comboLock = Math.max(0, s.comboLock - dt);
      else if (s.comboIdle > fw.comboGrace && !(d.global.keystones['keystone.thunder_thumb'] && this.spurtActive(s.focus))) {
        s.combo = Math.max(0, s.combo - t.COMBO_DECAY * Math.min(dt, s.comboIdle - fw.comboGrace));
      }
    } else if (s.comboLock > 0) s.comboLock = Math.max(0, s.comboLock - dt);

    // Visitors (GDD 6.6): only on the world on screen, only while the game is open.
    if (s.unlocked['feature.visitors'] !== undefined) {
      const focusDef = this.content.worlds[s.focus]!;
      const rainbow = focusDef.twist === 'weather' && weatherAt(s.worlds[s.focus]!.weatherClock, t) === 'rainbow';
      s.visitorTimer -= dt * (rainbow ? 2 : 1);
      if (s.visitorTimer <= 0) {
        this.spawnVisitor(this.rollSprout(true));
        s.visitorTimer += nextRange(s.rng.events, t.VISITOR_MIN, t.VISITOR_MAX) * fw.visitorInterval;
      }
    }
    if (d.global.specials['unlock.bees']) {
      if (s.beeTimer <= 0) s.beeTimer = nextRange(s.rng.events, t.BEE_MIN, t.BEE_MAX);
      s.beeTimer -= dt;
      if (s.beeTimer <= 0) this.spawnVisitor('bee');
    }
    if (s.visitors.length > 0) {
      let gone = false;
      for (const v of s.visitors) {
        v.remaining -= dt;
        if (v.remaining <= 0) gone = true;
      }
      if (gone) s.visitors = s.visitors.filter((v) => v.remaining > 0);
    }

    this.stepClocks(dt, Math.min(dt, Infinity));
  }

  /**
   * Timers that also run while the game is closed (GDD 15.1): research, the
   * bench, Insight and the Morning Basket. `insightSec` is the part of `dt`
   * that still fits in the Insight tank.
   */
  private stepClocks(dt: number, insightSec: number): void {
    const s = this.state;
    const t = this.t;
    const g = this.derived.global;
    if (s.unlocked['feature.research'] !== undefined && insightSec > 0) s.insight += (this.insightPerHour() * insightSec) / 3600;
    if (s.researchQueue.length > 0) {
      const desks = Math.min(g.researchDesks, s.researchQueue.length);
      let done = false;
      for (let k = 0; k < desks; k++) {
        const job = s.researchQueue[k]!;
        job.remaining -= dt;
        if (job.remaining <= EPS) done = true;
      }
      if (done) {
        const finished = s.researchQueue.filter((j, k) => k < desks && j.remaining <= EPS);
        s.researchQueue = s.researchQueue.filter((j, k) => !(k < desks && j.remaining <= EPS));
        for (const j of finished) {
          s.researchDone[j.id] = true;
          this.count('researchDone');
          this.emit({ type: 'researchDone', id: j.id });
        }
        this.invalidate();
      }
    }
    if (s.benchJobs.length > 0) {
      let done = false;
      for (const j of s.benchJobs) {
        j.remaining -= dt;
        if (j.remaining <= EPS) done = true;
      }
      if (done) {
        const finished = s.benchJobs.filter((j) => j.remaining <= EPS);
        s.benchJobs = s.benchJobs.filter((j) => j.remaining > EPS);
        for (const j of finished) {
          const def = this.content.cards.get(j.plantId) as PlantDef;
          this.addCard(j.plantId);
          this.count('benchJobsDone');
          this.count(def.source === 'exotic' ? 'exoticsGrown' : 'hybridsMade');
          this.emit({ type: 'benchDone', id: j.plantId });
        }
      }
    }
    if (s.unlocked['feature.basket'] !== undefined) {
      if (s.basketStored >= g.basketStore) s.basketTimer = 0;
      else {
        s.basketTimer += dt;
        const every = t.BASKET_HOURS * 3600;
        while (s.basketTimer >= every && s.basketStored < g.basketStore) {
          s.basketTimer -= every;
          s.basketStored++;
        }
        if (s.basketStored >= g.basketStore) s.basketTimer = 0;
      }
    }
  }

  private tickCooldowns(dt: number): void {
    const cd = this.state.cooldowns;
    let fast = 0;
    for (const id in cd) {
      if (fast === 0) fast = 1 / (1 - this.derived.global.cooldownReduction);
      const left = cd[id]! - dt * (this.content.abilities.get(id)?.ownerKind === 'manager' ? fast : 1);
      if (left <= EPS) delete cd[id];
      else cd[id] = left;
    }
  }

  private settleSunrise(w: number, caught: boolean): void {
    const ws = this.state.worlds[w]!;
    const t = this.t;
    // Wake-Up Call: a missed sunrise pays as if it was caught, once.
    if (!caught && ws.sunriseArmed) caught = true;
    if (caught) ws.sunriseArmed = false;
    if (ws.sunrisePending.gt(0)) {
      if (caught) {
        const mult = sunriseMult(ws.sunriseStreak, t);
        this.earn(w, ws.sunrisePending, 'floors');
        this.earn(w, ws.sunrisePending.mul(mult - 1), 'twist');
      } else this.earn(w, ws.sunrisePending, 'floors');
    }
    // A miss steps the streak down by one (GDD 14.4).
    ws.sunriseStreak = caught ? ws.sunriseStreak + 1 : Math.max(0, ws.sunriseStreak - 1);
    ws.sunrisePending = Num.ZERO;
    ws.sunriseWindow = 0;
    this.emit({ type: 'sunrise', world: w, caught });
  }

  private earn(w: number, amount: Num, source: IncomeSource): void {
    const ws = this.state.worlds[w]!;
    if (this.debug) assertFinite(amount, `income (${source})`);
    ws.coins = ws.coins.add(amount);
    if (source !== 'start') ws.lifetime = ws.lifetime.add(amount);
    const tl = this.tally[w]!;
    tl[source] = tl[source].add(amount);
  }

  /** Automation the player bought: auto-hire (research), the Auto-Gardener and Auto-Replant (Ribbon Shop). */
  private runAutomation(): void {
    const s = this.state;
    const sp = this.derived.global.specials;
    if (!sp['unlock.auto_hire'] && !sp['unlock.auto_gardener'] && !sp['unlock.auto_replant']) return;
    for (let w = 0; w < s.worlds.length; w++) {
      const ws = s.worlds[w]!;
      if (!ws.unlocked) continue;
      if (sp['unlock.auto_replant'] && s.autoReplant[w]! > 0 && this.canReplant(w)) {
        if (this.pendingCompost(w).gte(s.compostEra.mul(s.autoReplant[w]!))) {
          this.replant(w);
          continue;
        }
      }
      const gardener = !!sp['unlock.auto_gardener'];
      if (gardener) {
        // Floor 1's manager works with no fee while floor 1's switch is on.
        const f0 = ws.floors[0]!;
        if (f0.level > 0 && !f0.hired && switchOn(f0)) this.putToWork(w, 0);
      }
      if (sp['unlock.auto_hire']) {
        for (let i = 0; i < ws.floors.length; i++) {
          const f = ws.floors[i]!;
          if (f.level > 0 && !f.hired && ws.coins.gte(this.hireFee(w, i))) this.hire(w, i);
        }
      }
      if (gardener) {
        // A floor that is not open yet opens itself when that costs at most AUTO_BUY_SHARE of the coins in hand.
        const n = this.nextFloor(w);
        if (n >= 0 && switchOn(ws.floors[n]!) && this.content.worlds[w]!.floors[n]!.openCost.lte(ws.coins.mul(this.t.AUTO_BUY_SHARE))) this.openFloor(w);
        for (let i = ws.floors.length - 1; i >= 0; i--) {
          if (ws.floors[i]!.level <= 0 || !switchOn(ws.floors[i]!)) continue;
          const k = this.maxLevels(w, i, ws.coins.mul(this.t.AUTO_BUY_SHARE));
          if (k > 0) this.buyLevels(w, i, k);
        }
      }
    }
  }

  // ---------------------------------------------------------------- offline

  /**
   * The game was closed for `awayMs`. Closed form, never a replay of ticks
   * (GDD 15.1, docs/tech/07-offline-and-time.md). Split only where a research
   * project finishes, because that changes the income rate.
   */
  fastForward(awayMs: number): void {
    const s = this.state;
    const t = this.t;
    const away = Math.max(0, awayMs / 1000);
    if (away <= 0) return;

    // Leaving: banks pay out plain, the things that only exist on screen stop.
    for (let w = 0; w < s.worlds.length; w++) {
      const ws = s.worlds[w]!;
      if (ws.sunrisePending.gt(0)) {
        // While away every orbit pays x1 and the streak is kept (GDD 14.4).
        this.earn(w, ws.sunrisePending, 'floors');
        ws.sunrisePending = Num.ZERO;
      }
      ws.sunriseWindow = 0;
      if (ws.bank.gt(0)) {
        this.earn(w, ws.bank, 'floors');
        ws.bank = Num.ZERO;
      }
      ws.bankClock = 0;
    }
    s.combo = 0;
    s.comboIdle = 0;
    s.comboLock = 0;
    s.visitors = [];
    if (s.buffs.length > 0) {
      for (const b of s.buffs) b.remaining -= away;
      s.buffs = s.buffs.filter((b) => b.remaining > EPS);
      this.dirtyAll();
    }

    const capSec = this.derived.global.offlineCapSec;
    const paidTotal = Math.min(away, capSec);
    const interest = this.derived.global.keystones['keystone.compound_interest'] ? compoundInterest(away, t) : 1;
    const earned = s.worlds.map(() => Num.ZERO);
    let left = away;
    let paidLeft = paidTotal;
    let insightLeft = Math.min(away, t.INSIGHT_TANK_HOURS * 3600);
    let fairLeft = Math.min(away, t.FAIR_OFFLINE_CAP * 3600);
    let guard = 0;
    while (left > EPS) {
      const desks = Math.min(this.derived.global.researchDesks, s.researchQueue.length);
      let seg = left;
      for (let k = 0; k < desks; k++) seg = Math.min(seg, Math.max(MIN_STEP, s.researchQueue[k]!.remaining));
      const paid = Math.min(seg, paidLeft);
      for (let w = 0; w < s.worlds.length; w++) {
        const ws = s.worlds[w]!;
        if (!ws.unlocked) continue;
        const c = this.refreshWorld(w);
        const twist = this.content.worlds[w]!.twist;
        let factor = this.derived.worlds[w]!.offlineEfficiency * this.derived.worlds[w]!.offlineBonus * interest;
        if (twist === 'heat') {
          const floorHeat = this.derived.worlds[w]!.hires > 0 ? t.HEAT_FLOOR : 0;
          const h = averageHeat(Math.max(ws.heat, floorHeat), floorHeat, t.HEAT_DECAY, paid);
          factor *= heatMult(h.average, t);
          ws.heat = averageHeat(Math.max(ws.heat, floorHeat), floorHeat, t.HEAT_DECAY, seg).end;
        } else if (twist === 'customers') {
          ws.customerQueue = Math.min(t.CUSTOMER_QUEUE_CAP, ws.customerQueue + Math.floor((ws.customerTimer + seg) / t.CUSTOMER_INTERVAL));
          ws.customerTimer = (ws.customerTimer + seg) % t.CUSTOMER_INTERVAL;
        } else if (twist === 'weather') {
          ws.weatherClock += seg;
          c.dirty = true;
        }
        if (paid > 0 && c.managedCount > 0) {
          const amount = c.offlineManaged.mul(factor * paid);
          earned[w] = earned[w]!.add(amount);
          this.earn(w, amount, 'offline');
        }
        // A floor without a manager finishes the cycle it was on and waits.
        for (let i = 0; i < ws.floors.length; i++) {
          const f = ws.floors[i]!;
          if (f.level <= 0) break;
          if (f.constructing > 0) {
            f.constructing = 0;
            this.constructingCount--;
          }
          if (!c.floors[i]!.managed && !f.ready && (1 - f.progress) * c.floors[i]!.cycleSec <= seg) {
            f.ready = true;
            f.progress = 0;
          }
        }
      }
      if (s.fair.active && fairLeft > 0) {
        // The stall has its own offline rule, the same for everyone (GDD 15.3).
        const fairPaid = Math.min(seg, fairLeft);
        this.fairEarn(this.fairIps().mul(t.FAIR_OFFLINE_EFF * fairPaid));
        fairLeft -= fairPaid;
      }
      s.time += seg;
      this.tickCooldowns(seg);
      const insightSeg = Math.min(seg, insightLeft);
      this.stepClocks(seg, insightSeg);
      insightLeft -= insightSeg;
      paidLeft -= paid;
      left -= seg;
      if (++guard > 10000) throw new Error('fastForward: too many segments');
    }

    s.returns++;
    this.count('offlineHours', paidTotal / 3600);
    if (away >= 1800) this.count('offlineCollects30');
    if (away >= 300 && this.derived.worlds.some((w) => w.hires > 0)) this.count('offlineReturns5');
    if (away >= t.DEW_AWAY_HOURS * 3600) {
      this.addBuff({ id: 'boost.morning_dew', kind: 'boost', world: -1, floor: -1, mult: t.DEW_MULT, remaining: this.derived.global.dewDuration });
    }
    if (s.unlocked['feature.visitors'] !== undefined && s.visitorTimer <= 0) {
      s.visitorTimer = nextRange(s.rng.events, t.VISITOR_MIN, t.VISITOR_MAX) * this.derived.worlds[s.focus]!.visitorInterval;
    }
    this.emit({ type: 'offline', seconds: away, paidSeconds: paidTotal, earned });
    this.afterTime();
  }

  // --------------------------------------------------------------- commands

  /** Applies a player command. Returns false, changing nothing, when the command is not allowed. */
  dispatch(cmd: Command): boolean {
    const ok = this.apply(cmd);
    if (ok && this.state.playTime < 900) this.progressDue = 0;
    return ok;
  }

  private apply(cmd: Command): boolean {
    switch (cmd.type) {
      case 'harvest': return this.harvest(cmd.world, cmd.floor);
      case 'buyLevels': return this.buyLevels(cmd.world, cmd.floor, cmd.count);
      case 'openFloor': return this.openFloor(cmd.world);
      case 'hire': return this.hire(cmd.world, cmd.floor);
      case 'plant': return this.plant(cmd.world, cmd.floor, cmd.plants);
      case 'buyTicket': return this.buyTicket(cmd.world);
      case 'focus': return this.setFocus(cmd.world);
      case 'tap': return this.tap(cmd.count);
      case 'startSpurt': return this.startSpurt(false);
      case 'catchVisitor': return this.catchVisitor(cmd.index);
      case 'useAbility': return this.useAbility(cmd.id, cmd.world);
      case 'serveCustomers': return this.serveCustomers(cmd.count);
      case 'popBubbles': return this.popBubbles();
      case 'catchSunrise': return this.catchSunrise();
      case 'openChest': return this.openChest(cmd.chest);
      case 'buyChest': return this.buyChest(cmd.chest);
      case 'collectBasket': return this.collectBasket();
      case 'levelCard': return this.levelCard(cmd.id);
      case 'buyCopy': return this.buyCopy(cmd.id);
      case 'equip': return this.equip(cmd.heirlooms);
      case 'levelHeirloom': return this.levelHeirloom(cmd.id);
      case 'buyHeirloomCopy': return this.buyHeirloomCopy(cmd.id);
      case 'pickHeirloom': return this.pickHeirloom(cmd.id);
      case 'skill': return this.buySkill(cmd.id);
      case 'respec': return this.respec();
      case 'research': return this.startResearch(cmd.id);
      case 'bench': return this.startBench(cmd.plantId);
      case 'replant': return this.replant(cmd.world);
      case 'festival': return this.festival();
      case 'buyCompostShop': return this.buyCompostShop(cmd.id);
      case 'buyRibbonShop': return this.buyRibbonShop(cmd.id);
      case 'setAutoBuy':
        return this.setAutoBuy(cmd.on, cmd.world, cmd.floor);
      case 'setAutoReplant':
        if (cmd.world < 0 || cmd.world >= this.state.worlds.length || cmd.multiple < 0) return false;
        this.state.autoReplant[cmd.world] = cmd.multiple;
        return true;
      case 'timeWarp': return this.timeWarp(cmd.size);
      case 'fairBuy': return this.fairBuy(cmd.floor, cmd.count);
      case 'fairTap': return this.fairTap(cmd.count);
    }
  }

  private world(w: number): WorldState | null {
    const ws = this.state.worlds[w];
    return ws && ws.unlocked ? ws : null;
  }

  // Floors (GDD 5) -----------------------------------------------------------

  private harvest(w: number, i: number): boolean {
    const ws = this.world(w);
    const f = ws?.floors[i];
    if (!ws || !f || f.level <= 0 || !f.ready) return false;
    const fc = this.refreshWorld(w).floors[i]!;
    if (fc.managed) return false;
    this.earn(w, fc.payout.mul(this.heatFactor(w)), 'floors');
    f.ready = false;
    f.progress = 0;
    this.count('harvests');
    return true;
  }

  private buyLevels(w: number, i: number, count: number): boolean {
    const ws = this.world(w);
    const f = ws?.floors[i];
    if (!ws || !f || f.level <= 0 || count < 1 || !Number.isInteger(count)) return false;
    const cost = this.levelsCost(w, i, count);
    if (ws.coins.lt(cost)) return false;
    ws.coins = ws.coins.sub(cost);
    const before = f.level;
    f.level += count;
    this.count('levelsBought', count);
    this.afterLevels(w, i, before);
    return true;
  }

  /** Milestones, records, crates, tower milestones and Mastery after a floor's level changed (GDD 5.7, 14.5). */
  private afterLevels(w: number, i: number, before: number): void {
    const s = this.state;
    const t = this.t;
    const ws = s.worlds[w]!;
    const f = ws.floors[i]!;
    const c = this.caches[w]!;
    c.dirty = true;
    if (f.level > (s.counters.maxFloorLevel ?? 0)) s.counters.maxFloorLevel = f.level;
    const was = milestoneCount(before, t);
    const now = milestoneCount(f.level, t);
    for (let tier = was + 1; tier <= now; tier++) {
      this.count('milestones');
      const record = tier > f.eraMilestones;
      if (record) {
        f.eraMilestones = tier;
        s.recordMilestones++;
        this.count('recordMilestones');
      }
      if (tier > f.bestMilestones) {
        f.bestMilestones = tier;
        this.addXp(t.XP_MILESTONE_PER_TIER * tier, 'milestones');
      }
      this.emit({ type: 'milestone', world: w, floor: i, tier, record });
    }
    if (f.level > ws.bestLevelEver) {
      for (const lv of t.MILESTONE_CRATE_TIERS) if (ws.bestLevelEver < lv && f.level >= lv) this.grantChest('chest.wooden');
      ws.bestLevelEver = f.level;
    }
    const oldTower = c.towerMilestones;
    let min = Infinity;
    for (const fl of ws.floors) if (fl.level < min) min = fl.level;
    const tower = milestoneCount(min, t);
    if (tower !== oldTower && tower > 0) this.emit({ type: 'towerMilestone', world: w, count: tower });
    if (min > ws.bestMinLevel) {
      ws.bestMinLevel = min;
      this.updateStars(w);
    }
  }

  private updateStars(w: number): void {
    const s = this.state;
    const t = this.t;
    // World Mastery starts when the player first reaches world 2 (GDD 16, row 20).
    if (s.worldReached < 2) return;
    const ws = s.worlds[w]!;
    const stars = masteryStars(ws.bestMinLevel, this.content.worlds[w]!.mastery);
    while (ws.stars < stars) {
      ws.stars++;
      this.count('masteryStars');
      this.addXp(t.XP_MASTERY_STAR, 'mastery');
      // Stars 5, 7, 9 and 10 give one copy of this world's Head (GDD 14.5).
      if (t.MASTERY_EXOTIC_STARS.includes(ws.stars)) {
        const floors = this.content.worlds[w]!.floors;
        this.addCard(floors[floors.length - 1]!.manager.id);
      }
      this.emit({ type: 'star', world: w, stars: ws.stars });
      this.invalidate();
    }
  }

  private openFloor(w: number): boolean {
    const ws = this.world(w);
    if (!ws) return false;
    const i = this.nextFloor(w);
    if (i < 0) return false;
    const def = this.content.worlds[w]!.floors[i]!;
    if (ws.coins.lt(def.openCost)) return false;
    ws.coins = ws.coins.sub(def.openCost);
    this.openFloorFree(w, i, this.t.CONSTRUCTION_TIME);
    return true;
  }

  private openFloorFree(w: number, i: number, construction: number): void {
    const s = this.state;
    const ws = s.worlds[w]!;
    const f = ws.floors[i]!;
    const def = this.content.worlds[w]!.floors[i]!;
    f.level = 1;
    f.progress = 0;
    f.ready = false;
    f.constructing = construction;
    if (construction > 0) this.constructingCount++;
    this.count('floorsOpened');
    if (w === 0 && i === ws.floors.length - 1) this.count('w1TopFloorOpens');
    const first = !s.codex[def.id];
    if (first) this.addCodex(def.id);
    // The floor's manager is met: the card is owned at level 1 from now on (GDD 7.1 rule 5).
    this.meet(def.manager.id);
    // Hiring Crates: the first time each of floors 4 to 9 opens in world 1 (GDD 7.1 rule 9). Floor 10's manager is the Head.
    if (w === 0 && i >= WELCOME_FLOORS && !def.manager.head && !s.hiringCrates[def.id]) {
      s.hiringCrates[def.id] = true;
      this.openHiringCrate(def.manager.id);
    }
    this.emit({ type: 'floorOpened', world: w, floor: i, first });
    this.afterLevels(w, i, 0);
    this.invalidate();
  }

  /** Pays the floor's fee and puts its own manager to work (GDD 7.1 rule 2). */
  private hire(w: number, i: number): boolean {
    const s = this.state;
    const ws = this.world(w);
    const f = ws?.floors[i];
    if (!ws || !f || f.level <= 0 || f.hired) return false;
    // Hire buttons appear once the Welcome Chest has been opened (GDD 16, row 5).
    if (s.unlocked['feature.managers'] === undefined) return false;
    const fee = this.hireFee(w, i);
    if (ws.coins.lt(fee)) return false;
    ws.coins = ws.coins.sub(fee);
    this.count('hires');
    this.putToWork(w, i);
    return true;
  }

  /** The floor's manager starts work, paid for or not. */
  private putToWork(w: number, i: number): void {
    const s = this.state;
    const f = s.worlds[w]!.floors[i]!;
    f.hired = true;
    const card = s.cards[this.content.worlds[w]!.floors[i]!.manager.id];
    if (card && !card.everHired) {
      card.everHired = true;
      this.count('managersHired');
    }
    if (f.ready) {
      // The new manager collects the waiting harvest at the manual rate.
      this.earn(w, this.refreshWorld(w).floors[i]!.payout.mul(this.heatFactor(w)), 'floors');
      f.ready = false;
      f.progress = 0;
    }
    this.invalidate();
    this.emit({ type: 'hire', world: w, floor: i });
  }

  /**
   * CONTENT.md 8 (design 0.4): while the Auto-Gardener is owned, no world goes
   * dead. Floor 1's manager in every unlocked world works with no fee while
   * floor 1's switch is on: hired free the moment the world is reached and kept
   * through every Replant and Festival.
   */
  private freeFirstManager(w: number): boolean {
    return !!this.derived.global.specials['unlock.auto_gardener'] && switchOn(this.state.worlds[w]!.floors[0]!);
  }

  /** Auto-Gardener switches. No world: every floor of every world; no floor: every floor of that world. */
  private setAutoBuy(on: boolean, world?: number, floor?: number): boolean {
    const worlds = this.state.worlds;
    if (world !== undefined && (world < 0 || world >= worlds.length)) return false;
    if (floor !== undefined && (world === undefined || floor < 0 || floor >= worlds[world]!.floors.length)) return false;
    for (let w = 0; w < worlds.length; w++) {
      if (world !== undefined && w !== world) continue;
      worlds[w]!.floors.forEach((f, i) => {
        if (floor === undefined || i === floor) f.autoBuy = on;
      });
    }
    return true;
  }

  /** The first time a floor opens, in any run, its manager's card is owned at level 1. */
  private meet(managerId: string): void {
    const s = this.state;
    if (s.cards[managerId]) return;
    s.cards[managerId] = { level: 1, copies: 0 };
    this.addCodex(managerId);
    this.count('managersMet');
    this.emit({ type: 'cardNew', id: managerId });
  }

  private plant(w: number, i: number, plants: string[]): boolean {
    const s = this.state;
    const ws = s.worlds[w];
    const f = ws?.floors[i];
    if (!ws || !f || s.unlocked['feature.plants'] === undefined) return false;
    if (plants.length > this.derived.global.planters || new Set(plants).size !== plants.length) return false;
    for (const id of plants) {
      const def = this.content.cards.get(id);
      if (!def || def.kind !== 'plant' || !s.cards[id]) return false;
    }
    // A plant is in one planter per world.
    for (const other of ws.floors) if (other !== f) other.plants = other.plants.filter((p) => !plants.includes(p));
    f.plants = [...plants];
    const fam = this.content.worlds[w]!.floors[i]!.favouredFamily;
    if (plants.some((id) => fam === 'wild' || (this.content.cards.get(id) as PlantDef).family === fam)) this.count('plantsAtHome');
    if (this.content.worlds[w]!.twist === 'weather') {
      const groups = new Set<string>();
      for (const fl of ws.floors) for (const id of fl.plants) groups.add(weatherGroupOf((this.content.cards.get(id) as PlantDef).family, this.t));
      s.counters.weatherGroupsPlanted = Math.max(s.counters.weatherGroupsPlanted ?? 0, groups.size);
    }
    this.invalidate();
    return true;
  }

  private buyTicket(w: number): boolean {
    if (!this.canBuyTicket(w)) return false;
    const s = this.state;
    const ws = s.worlds[w]!;
    ws.coins = ws.coins.sub(this.content.worlds[w]!.ticket!);
    this.enterWorld(w + 1);
    return true;
  }

  private enterWorld(w: number): void {
    const s = this.state;
    const ws = s.worlds[w]!;
    const def = this.content.worlds[w]!;
    ws.unlocked = true;
    ws.runStartedAt = s.time;
    const first = !ws.everReached;
    ws.everReached = true;
    this.startRun(w);
    if (first) {
      s.worldReached = Math.max(s.worldReached, w + 1);
      this.addCodex(def.id);
      if (w === 1) for (let k = 0; k < s.worlds.length; k++) this.updateStars(k);
    }
    this.emit({ type: 'worldReached', world: w, first });
    this.invalidate();
  }

  /** Floor 1 open at level 1, Head Start money in hand (GDD 12.1, CONTENT 7). */
  private startRun(w: number): void {
    const s = this.state;
    const ws = s.worlds[w]!;
    const loyal = (s.compostShop['shop.compost.loyal_staff'] ?? 0) * (this.loyalFloorsPerLevel());
    const keepFirst = this.freeFirstManager(w);
    ws.floors.forEach((f, i) => {
      if (f.constructing > 0) this.constructingCount--;
      f.level = 0;
      f.progress = 0;
      f.ready = false;
      f.constructing = 0;
      f.hired = (f.hired && i < loyal) || (i === 0 && keepFirst && ws.unlocked);
    });
    ws.coins = Num.ZERO;
    ws.bank = Num.ZERO;
    ws.bankClock = 0;
    ws.sunrisePending = Num.ZERO;
    ws.sunriseWindow = 0;
    ws.runStartedAt = s.time;
    const head = s.compostShop['shop.compost.head_start'] ?? 0;
    if (head > 0) this.earn(w, this.content.headStart[head - 1]!.mul(this.content.worlds[w]!.D), 'start');
    const f0 = ws.floors[0]!;
    f0.level = 1;
    this.caches[w]!.dirty = true;
    this.afterLevels(w, 0, 0);
  }

  private loyalFloorsPerLevel(): number {
    const row = this.content.compostShop.find((r) => r.special === 'shop.loyal_staff');
    return Number(row?.params?.floorsPerLevel ?? 2);
  }

  private setFocus(w: number): boolean {
    const s = this.state;
    if (!this.world(w)) return false;
    if (s.focus === w) return true;
    s.focus = w;
    s.combo = 0;
    s.comboIdle = 0;
    // A manager's ability stays in its own world: what it gave the taps ends when the player leaves.
    s.comboLock = 0;
    s.tapBoostTaps = 0;
    s.visitors = [];
    return true;
  }

  // Tapping (GDD 6) ----------------------------------------------------------

  /**
   * `count` counted taps on the world on screen, paid at their average value.
   * The caller keeps to TAP_RATE_CAP; fractions are allowed so a tick of any
   * length can carry its share of a tapping rate.
   */
  private tap(count: number): boolean {
    if (!(count > 0)) return false;
    const s = this.state;
    const t = this.t;
    const w = s.focus;
    const ws = s.worlds[w]!;
    const d = this.derived;
    const wd = d.worlds[w]!;
    this.count('taps', count);
    if (this.content.worlds[w]!.twist === 'heat') ws.heat = Math.min(t.HEAT_MAX, ws.heat + t.HEAT_PER_TAP * count);
    // A tap harvests the unmanaged floor that has been waiting, one floor per tap (GDD 6.1).
    s.tapHarvestCredit = Math.min(s.tapHarvestCredit + count, Math.max(1, count));
    for (let i = 0; i < ws.floors.length && s.tapHarvestCredit >= 1; i++) {
      if (ws.floors[i]!.ready && this.harvest(w, i)) s.tapHarvestCredit -= 1;
    }
    if (s.unlocked['feature.tap_bonus'] === undefined) return true;

    const run = comboRun(s.combo, count, wd.comboCap, 1 / t.COMBO_TAPS_PER_STACK, t.COMBO_PER_STACK);
    s.combo = run.stacks;
    s.comboIdle = 0;

    const critOn = s.unlocked['feature.bumpers'] !== undefined;
    const sure = Math.min(s.guaranteedCrits, count);
    s.guaranteedCrits -= sure;
    const rolled = count - sure;
    const bumpers = sure + (critOn ? rolled * wd.critChance : 0);
    const critFactor = (sure * wd.critMult + rolled * (critOn ? expectedCrit(wd.critChance, wd.critMult) : 1)) / count;
    // tapBoost: the world's Boost plus tap-only boosts, under the same cap (GDD 13.5).
    let tapBoost = this.boost(w, -1, true);
    if (s.tapBoostTaps > 0) {
      const boosted = Math.min(s.tapBoostTaps, count);
      tapBoost = (boosted * this.boost(w, -1, true, s.tapBoostMult) + (count - boosted) * tapBoost) / count;
      s.tapBoostTaps -= boosted;
    }
    const value = t.TAP_SECONDS * wd.tapPower * run.multSum * critFactor * this.spurtMult(w) * tapBoost;
    this.earn(w, this.steadyIps(w).mul(value), 'taps');
    if (bumpers > 0) this.count('bumpers', bumpers);

    const spurt = this.spurtActive(w);
    if (spurt) {
      const thunder = d.global.keystones['keystone.thunder_thumb'];
      if (thunder && bumpers > 0) {
        const extra = Math.min((thunder.maxExtraSec ?? 15) - s.spurtExtended, bumpers * (thunder.secPerBumper ?? 0.25));
        if (extra > 0) {
          spurt.remaining += extra;
          s.spurtExtended += extra;
        }
      }
    } else if (s.unlocked['feature.spurt'] !== undefined) {
      s.spurtMeter = Math.min(wd.spurtTaps, s.spurtMeter + count + bumpers * d.global.bumperFill);
    }
    return true;
  }

  spurtReady(): boolean {
    const s = this.state;
    return s.unlocked['feature.spurt'] !== undefined && !this.spurtActive(s.focus) && s.spurtMeter >= this.derived.worlds[s.focus]!.spurtTaps - 1e-6;
  }

  private startSpurt(free: boolean): boolean {
    const s = this.state;
    const w = s.focus;
    if (s.unlocked['feature.spurt'] === undefined || this.spurtActive(w)) return false;
    const wd = this.derived.worlds[w]!;
    if (!free) {
      if (s.spurtMeter < wd.spurtTaps - 1e-6) return false;
      s.spurtMeter = 0;
    }
    s.spurtExtended = 0;
    this.addBuff({ id: 'spurt', kind: 'spurt', world: w, floor: -1, mult: wd.spurtSpeed, remaining: wd.spurtDuration });
    this.count('spurts');
    // Golden Touch: the first tap of every Growth Spurt calls a Golden Sprout.
    if (this.derived.global.keystones['keystone.golden_touch']) this.spawnVisitor(this.rollSprout(false));
    this.emit({ type: 'spurt', world: w });
    return true;
  }

  private addBuff(b: Buff): void {
    const s = this.state;
    const same = s.buffs.find((x) => x.id === b.id && x.world === b.world && x.floor === b.floor);
    if (same) {
      // A boost never stacks with itself: triggering it again restarts its timer (GDD 13.5 rule 2).
      same.remaining = b.remaining;
      same.mult = b.mult;
    } else s.buffs.push(b);
    this.dirtyAll();
  }

  // Visitors (GDD 6.6) -------------------------------------------------------

  /** Rolls a visitor kind. With `all` false only the three Golden Sprouts can come up. */
  private rollSprout(all: boolean): VisitorKind {
    const wt = this.t.VISITOR_WEIGHTS;
    const kinds: VisitorKind[] = ['windfall', 'sunbeam', 'storm', 'dewdrop', 'crate'];
    const weights = [wt.windfall, wt.sunbeam, wt.storm, all ? wt.dewdrop : 0, all ? wt.crate : 0];
    return kinds[pickWeighted(this.state.rng.events, weights)]!;
  }

  private spawnVisitor(kind: VisitorKind): void {
    const s = this.state;
    const v = { kind, remaining: this.derived.global.visitorLifetime } as { kind: VisitorKind; remaining: number; jackpot?: number };
    if (kind !== 'bee' && kind !== 'dewdrop' && kind !== 'crate' && s.jackpotArmed > 0) {
      v.kind = 'windfall';
      v.jackpot = s.jackpotArmed;
      s.jackpotArmed = 0;
    }
    s.visitors.push(v);
    this.emit({ type: 'visitor', kind: v.kind });
  }

  private catchVisitor(index: number): boolean {
    const s = this.state;
    const t = this.t;
    const v = s.visitors[index];
    if (!v) return false;
    s.visitors.splice(index, 1);
    const w = s.focus;
    const d = this.derived;
    this.count('visitorsCaught');
    this.addXp(t.XP_VISITOR, 'visitors');
    this.addCodex(`visitor.${v.kind}`);
    if (v.kind === 'bee') {
      this.addPollen(t.BEE_POLLEN);
      this.count('beesCaught');
      return true;
    }
    if (v.kind === 'dewdrop') s.gems += t.DEWDROP_GEMS;
    else if (v.kind === 'crate') this.grantChest('chest.wooden');
    else {
      this.count('sproutsCaught');
      if (v.kind === 'windfall') this.earn(w, this.lumpRate(w).mul(t.WINDFALL_SECONDS * d.worlds[w]!.windfall * (v.jackpot ?? 1)), 'visitors');
      else if (v.kind === 'sunbeam') this.addBuff({ id: 'boost.sunbeam', kind: 'boost', world: w, floor: -1, mult: t.SUNBEAM_MULT, remaining: t.SUNBEAM_DURATION });
      else this.addBuff({ id: 'boost.tap_storm', kind: 'tapBoost', world: w, floor: -1, mult: t.TAP_STORM_MULT, remaining: t.TAP_STORM_DURATION });
      const touch = d.global.keystones['keystone.golden_touch'];
      if (touch && !this.spurtActive(w) && s.unlocked['feature.spurt'] !== undefined) {
        s.spurtMeter = Math.min(d.worlds[w]!.spurtTaps, s.spurtMeter + (touch.meterTaps ?? 60));
      }
    }
    return true;
  }

  /** The rate "pay N seconds of income now" effects read: the steady rate (GDD 13.5 rule 4). */
  private lumpRate(w: number): Num {
    return this.t.LUMP_SUM_USES_BOOSTS ? this.worldIps(w) : this.steadyIps(w);
  }

  // Abilities (CONTENT 2.2, 4.1) ---------------------------------------------

  private useAbility(id: string, world?: number): boolean {
    const s = this.state;
    const t = this.t;
    const owner = this.content.abilities.get(id);
    if (!owner) return false;
    if ((s.cooldowns[id] ?? 0) > EPS) return false;
    const a = owner.ability;
    let w = s.focus;
    let floor = -1;
    if (owner.ownerKind === 'manager') {
      // The button is on the manager's own floor, so its world must be on screen (GDD 7.1 rule 7, 7.2).
      const m = this.content.cards.get(owner.ownerId) as ManagerDef;
      const f = s.worlds[m.world]!.floors[m.floorIndex]!;
      if (!s.worlds[m.world]!.unlocked || !f.hired || f.level <= 0 || m.world !== s.focus) return false;
      w = m.world;
      floor = m.floorIndex;
    } else if (!s.equipped.includes(owner.ownerId)) return false;

    switch (a.kind) {
      case 'buff':
        // Written as profit or as speed, a timed ability is a boost; a level-cost one is a discount (GDD 13.5 rules 5 and 6).
        this.addBuff({ id: a.id, kind: a.stat === 'floor.levelCost' ? 'discount' : 'boost', world: w, floor: a.scope === 'floor' ? floor : -1, mult: a.mult!, remaining: a.durationSec! });
        break;
      case 'lumpSum': {
        if (a.scope === 'floor') {
          const fc = this.refreshWorld(w).floors[floor]!;
          this.earn(w, (t.LUMP_SUM_USES_BOOSTS ? fc.ips : fc.ipsSteady).mul(a.seconds! * this.heatFactor(w)), 'abilities');
        } else this.earn(w, this.lumpRate(w).mul(a.seconds!), 'abilities');
        break;
      }
      case 'comboLock':
        // Tea Break (Old Moss, CONTENT 2): Combo jumps to full and cannot fall.
        if (w === s.focus) s.combo = this.derived.worlds[w]!.comboCap;
        s.comboIdle = 0;
        s.comboLock = a.durationSec!;
        break;
      case 'callVisitor':
        for (let k = 0; k < (a.count ?? 1); k++) this.spawnVisitor(this.rollSprout(false));
        break;
      case 'guaranteedCrits':
        s.guaranteedCrits += a.taps!;
        break;
      case 'fillSpurt':
        if (s.unlocked['feature.spurt'] === undefined || this.spurtActive(s.focus)) return false;
        s.spurtMeter = Math.min(this.derived.worlds[s.focus]!.spurtTaps, s.spurtMeter + (a.fraction ?? 1) * this.derived.worlds[s.focus]!.spurtTaps);
        break;
      case 'startSpurt':
        if (w !== s.focus || !this.startSpurt(true)) return false;
        break;
      case 'chestLuckNext':
        s.luckDoubleNext = true;
        break;
      case 'fillHeat':
        if (this.content.worlds[w]!.twist !== 'heat') return false;
        s.worlds[w]!.heat = t.HEAT_MAX;
        break;
      case 'fillBubbles':
        // Tea Party: every bubble fills with `seconds` of its floor's steady income (a lump sum, GDD 13.5 rule 4).
        if (this.content.worlds[w]!.twist !== 'bubbles') return false;
        s.worlds[w]!.bank = s.worlds[w]!.bank.add(this.lumpRate(w).mul(a.seconds!));
        break;
      case 'catchSunrise':
        // Wake-Up Call: the next sunrise pays as if it was caught.
        if (this.content.worlds[w]!.twist !== 'sunrise' || s.worlds[w]!.sunriseArmed) return false;
        s.worlds[w]!.sunriseArmed = true;
        break;
      case 'tapBoost':
        s.tapBoostTaps = a.taps!;
        s.tapBoostMult = a.mult!;
        break;
      case 'jackpot':
        s.jackpotArmed = a.mult!;
        break;
      case 'timeSkip':
        for (let k = 0; k < s.worlds.length; k++) {
          if (!s.worlds[k]!.unlocked) continue;
          this.earn(k, this.managedIps(k, 'offline').mul(a.seconds! * this.derived.worlds[k]!.offlineEfficiency), 'abilities');
        }
        break;
      case 'resetCooldowns':
        s.worlds[s.focus]!.floors.forEach((f, i) => {
          const ab = this.content.worlds[s.focus]!.floors[i]!.manager.ability;
          if (f.hired && ab) delete s.cooldowns[ab.id];
        });
        break;
    }
    s.cooldowns[id] = a.cooldownSec;
    this.count('abilitiesUsed');
    return true;
  }

  // World twists (GDD 14.4) --------------------------------------------------

  private serveCustomers(count: number): boolean {
    const s = this.state;
    const w = s.focus;
    const ws = s.worlds[w]!;
    if (this.content.worlds[w]!.twist !== 'customers') return false;
    const n = Math.min(Math.floor(count), ws.customerQueue);
    if (n <= 0) return false;
    ws.customerQueue -= n;
    this.earn(w, this.lumpRate(w).mul(this.t.CUSTOMER_TIP_SECONDS * n), 'twist');
    this.count('customersServed', n);
    return true;
  }

  private popBubbles(): boolean {
    const s = this.state;
    const w = s.focus;
    const ws = s.worlds[w]!;
    if (this.content.worlds[w]!.twist !== 'bubbles' || !ws.bank.gt(0)) return false;
    const mult = bubbleSweepAverage(this.refreshWorld(w).managedCount, this.t);
    this.earn(w, ws.bank, 'floors');
    this.earn(w, ws.bank.mul(mult - 1), 'twist');
    ws.bank = Num.ZERO;
    ws.bankClock = 0;
    this.count('bubblesPopped');
    return true;
  }

  private catchSunrise(): boolean {
    const s = this.state;
    const w = s.focus;
    if (this.content.worlds[w]!.twist !== 'sunrise' || s.worlds[w]!.sunriseWindow <= 0) return false;
    this.settleSunrise(w, true);
    this.count('sunrisesCaught');
    return true;
  }

  // Cards, chests and heirlooms (GDD 8) --------------------------------------

  grantChest(id: string, n = 1): void {
    const c = this.state.chests;
    c[id] = (c[id] ?? 0) + n;
  }

  private addPollen(n: number): void {
    this.state.pollen += n * this.derived.global.pollenGain;
  }

  private addCodex(id: string): void {
    const s = this.state;
    if (s.codex[id]) return;
    s.codex[id] = true;
    s.codexCount++;
    s.gems += this.t.CODEX_GEMS;
    this.invalidate();
  }

  private addCard(id: string, copies = 1): void {
    const s = this.state;
    const t = this.t;
    const def = this.content.cards.get(id);
    if (!def) throw new Error(`addCard: unknown card ${id}`);
    this.count('cardsCollected', copies);
    for (let k = 0; k < copies; k++) {
      const own = s.cards[id];
      if (!own) {
        s.cards[id] = { level: 1, copies: 0 };
        this.addCodex(id);
        this.count(def.kind === 'manager' ? 'managersMet' : 'plantsOwned');
        this.emit({ type: 'cardNew', id });
      } else if (own.level >= def.maxLevel) {
        this.addPollen(t.POLLEN_FROM_MAXED[def.rarity] * (1 + this.derived.global.pollenMaxedBonus));
      } else own.copies++;
    }
  }

  private addHeirloom(id: string): void {
    const s = this.state;
    const def = this.content.artifactById.get(id);
    if (!def) throw new Error(`addHeirloom: unknown heirloom ${id}`);
    const own = s.heirlooms[id];
    if (!own) {
      s.heirlooms[id] = { level: 1, copies: 0 };
      this.addCodex(id);
      this.count('heirloomsOwned');
      this.emit({ type: 'heirloomNew', id });
    } else if (own.level >= def.maxLevel) {
      this.addPollen(this.t.HEIRLOOM_POLLEN_FROM_MAXED[def.rarity] * (1 + this.derived.global.pollenMaxedBonus));
    } else own.copies++;
  }

  private rollInto(chest: ChestRow): { cards: string[]; heirloom: string | null } {
    const s = this.state;
    const res = rollChest({
      content: this.content,
      rng: s.rng.loot,
      chest,
      luck: this.derived.global.chestLuck,
      doubleLuck: s.luckDoubleNext,
      plantsUnlocked: s.unlocked['feature.plants'] !== undefined,
      heirloomsUnlocked: s.unlocked['feature.heirlooms'] !== undefined,
      worldReached: s.worldReached,
      owned: new Set(Object.keys(s.cards)),
      heads: this.content.worlds.filter((_, w) => s.worlds[w]!.stars >= 5).map((wd) => wd.floors[wd.floors.length - 1]!.manager.id),
      ownedHeirlooms: new Set(Object.keys(s.heirlooms)),
      newCardHelp: s.chestsOpened < this.t.NEW_CARD_CHESTS,
      pity: s.pity,
    });
    s.luckDoubleNext = false;
    for (const c of res.cards) this.addCard(c);
    if (res.exoticManager) this.addCard(res.exoticManager);
    if (res.heirloom) this.addHeirloom(res.heirloom);
    if (res.pollen > 0) this.addPollen(res.pollen);
    return { cards: res.cards, heirloom: res.heirloom };
  }

  private chestOpened(id: string, tier: number, cards: string[], heirloom: string | null): void {
    this.state.chestsOpened++;
    this.count('chestsOpened');
    this.addXp(this.t.XP_CHEST_PER_TIER * tier, 'chests');
    this.emit({ type: 'chestOpened', chest: id, cards, heirloom });
  }

  private openChest(id: string): boolean {
    const s = this.state;
    const chest = this.content.chests.get(id);
    if (!chest || !((s.chests[id] ?? 0) > 0)) return false;
    s.chests[id]!--;
    const res = this.rollInto(chest);
    this.chestOpened(id, chest.tier, res.cards, res.heirloom);
    return true;
  }

  /** Two copies of the manager of the floor that just opened, plus two Wooden Crate slots (GDD 8.3). */
  private openHiringCrate(managerId: string): void {
    const cards: string[] = [];
    for (let k = 0; k < HIRING_CRATE_COPIES; k++) cards.push(managerId);
    this.addCard(managerId, HIRING_CRATE_COPIES);
    const wooden = this.content.chests.get('chest.wooden')!;
    const res = this.rollInto({ ...wooden, cards: 2, guarantee: [], pollen: 0, heirloomChance: 0 });
    this.chestOpened('chest.hiring', 1, [...cards, ...res.cards], null);
  }

  private buyChest(id: string): boolean {
    const s = this.state;
    const key = id.replace('chest.', '') as keyof Tuning['GEM_CHEST_COST'];
    const cost = this.t.GEM_CHEST_COST[key];
    if (cost === undefined || !this.content.chests.has(id) || s.gems < cost) return false;
    s.gems -= cost;
    this.grantChest(id);
    return true;
  }

  private collectBasket(): boolean {
    const s = this.state;
    if (s.basketStored <= 0) return false;
    this.grantChest(this.derived.global.specials['unlock.deluxe_basket'] ? 'chest.copper' : 'chest.wooden', s.basketStored);
    s.basketStored = 0;
    return true;
  }

  private levelCard(id: string): boolean {
    const own = this.state.cards[id];
    const def = this.content.cards.get(id);
    if (!own || !def || own.level >= def.maxLevel) return false;
    const need = def.dupes[own.level - 1]!;
    if (own.copies < need) return false;
    own.copies -= need;
    own.level++;
    this.count('cardLevelUps');
    this.emit({ type: 'cardLevel', id, level: own.level });
    if (own.level >= def.maxLevel && own.copies > 0) {
      this.addPollen(own.copies * this.t.POLLEN_FROM_MAXED[def.rarity] * (1 + this.derived.global.pollenMaxedBonus));
      own.copies = 0;
    }
    this.invalidate();
    return true;
  }

  private buyCopy(id: string): boolean {
    const s = this.state;
    const own = s.cards[id];
    const def = this.content.cards.get(id);
    if (!own || !def || def.rarity === 'exotic' || own.level >= def.maxLevel) return false;
    if (def.kind === 'plant' && def.source !== 'chest') return false;
    const cost = this.t.POLLEN_COPY_COST[def.rarity];
    if (s.pollen < cost) return false;
    s.pollen -= cost;
    own.copies++;
    return true;
  }

  private equip(ids: string[]): boolean {
    const s = this.state;
    if (s.unlocked['feature.heirlooms'] === undefined) return false;
    if (ids.length > this.derived.global.heirloomSlots || new Set(ids).size !== ids.length) return false;
    for (const id of ids) if (!s.heirlooms[id]) return false;
    s.equipped = [...ids];
    this.invalidate();
    return true;
  }

  private levelHeirloom(id: string): boolean {
    const own = this.state.heirlooms[id];
    const def = this.content.artifactById.get(id);
    if (!own || !def || own.level >= def.maxLevel) return false;
    const need = def.dupes[own.level - 1]!;
    if (own.copies < need) return false;
    own.copies -= need;
    own.level++;
    this.invalidate();
    return true;
  }

  /** Pollen buys a copy of an heirloom the player already owns (GDD 8.6). */
  private buyHeirloomCopy(id: string): boolean {
    const s = this.state;
    const own = s.heirlooms[id];
    const def = this.content.artifactById.get(id);
    if (!own || !def || own.level >= def.maxLevel) return false;
    const cost = this.t.POLLEN_HEIRLOOM_COPY_COST[def.rarity];
    if (s.pollen < cost) return false;
    s.pollen -= cost;
    own.copies++;
    return true;
  }

  /** The Heirloom Pick: one Legendary heirloom of the player's choice (GDD 8.3). */
  private pickHeirloom(id: string): boolean {
    const s = this.state;
    const def = this.content.artifactById.get(id);
    if (s.heirloomPicks <= 0 || !def || def.rarity !== 'legendary') return false;
    s.heirloomPicks--;
    this.addHeirloom(id);
    return true;
  }

  // Player level, skills, research, bench (GDD 9, 10, 8.6) --------------------

  private addXp(n: number, source: string): void {
    this.xpTally[source] = (this.xpTally[source] ?? 0) + n;
    const s = this.state;
    const t = this.t;
    s.xp += n;
    while (s.level < t.LEVEL_CAP && s.xp >= xpToNext(s.level, t)) {
      s.xp -= xpToNext(s.level, t);
      s.level++;
      s.skillPoints++;
      s.gems += t.LEVEL_UP_GEMS;
      this.grantChest(levelUpChest(s.level));
      this.emit({ type: 'levelUp', level: s.level });
    }
  }

  /** Points spent in one branch of the skill tree. */
  branchPoints(branch: string): number {
    let n = 0;
    for (const sk of this.content.skills) if (sk.branch === branch) n += this.state.skills[sk.id] ?? 0;
    return n;
  }

  canBuySkill(id: string): boolean {
    const s = this.state;
    const sk = this.content.skillById.get(id);
    if (!sk || s.skillPoints < 1 || s.unlocked['feature.skills'] === undefined) return false;
    if ((s.skills[id] ?? 0) >= sk.ranks) return false;
    if (this.branchPoints(sk.branch) < TIER_GATE[sk.tier - 1]!) return false;
    if (sk.keystone) {
      for (const other of this.content.skills) if (other.keystone && other.branch === sk.branch && other.id !== id && (s.skills[other.id] ?? 0) > 0) return false;
    }
    return true;
  }

  private buySkill(id: string): boolean {
    if (!this.canBuySkill(id)) return false;
    const s = this.state;
    s.skillPoints--;
    s.skills[id] = (s.skills[id] ?? 0) + 1;
    this.invalidate();
    return true;
  }

  private respec(): boolean {
    const s = this.state;
    let spent = 0;
    for (const id in s.skills) spent += s.skills[id]!;
    if (spent === 0) return false;
    if (s.freeRespecs > 0) s.freeRespecs--;
    else if (s.gems >= this.t.RESPEC_GEMS) s.gems -= this.t.RESPEC_GEMS;
    else return false;
    s.skills = {};
    s.skillPoints += spent;
    this.invalidate();
    return true;
  }

  canResearch(id: string): boolean {
    const s = this.state;
    const r = this.content.researchById.get(id);
    if (!r || s.unlocked['feature.research'] === undefined) return false;
    if (s.researchDone[id] || s.researchQueue.some((j) => j.id === id)) return false;
    for (const req of r.requires) if (!s.researchDone[req]) return false;
    if (r.needs === 'heirlooms' && s.unlocked['feature.heirlooms'] === undefined) return false;
    if (r.needs === 'world2' && s.worldReached < 2) return false;
    if (r.needs === 'world3' && s.worldReached < 3) return false;
    if (s.researchQueue.length >= this.t.RESEARCH_QUEUE * this.derived.global.researchDesks) return false;
    return s.insight >= r.cost;
  }

  private startResearch(id: string): boolean {
    if (!this.canResearch(id)) return false;
    const s = this.state;
    const r = this.content.researchById.get(id)!;
    s.insight -= r.cost;
    s.researchQueue.push({ id, remaining: r.timeSec });
    this.count('researchStarted');
    return true;
  }

  canBench(plantId: string): boolean {
    const s = this.state;
    const t = this.t;
    const def = this.content.cards.get(plantId);
    if (!def || def.kind !== 'plant' || def.source === 'chest') return false;
    const g = this.derived.global;
    const exotic = def.source === 'exotic';
    if (!g.specials[exotic ? 'unlock.mutation' : 'unlock.bench']) return false;
    if (s.benchJobs.length >= g.benchSlots) return false;
    const own = s.cards[plantId];
    if (own && own.level >= def.maxLevel) return false;
    const needLevel = exotic ? t.EXOTIC_PARENT_LEVEL : t.HYBRID_PARENT_LEVEL;
    for (const p of def.parents ?? []) if ((s.cards[p]?.level ?? 0) < needLevel) return false;
    if (exotic && (def.climateWorld ?? 1) > s.worldReached) return false;
    return s.pollen >= (exotic ? t.EXOTIC_POLLEN : t.HYBRID_POLLEN);
  }

  private startBench(plantId: string): boolean {
    if (!this.canBench(plantId)) return false;
    const s = this.state;
    const t = this.t;
    const exotic = (this.content.cards.get(plantId) as PlantDef).source === 'exotic';
    s.pollen -= exotic ? t.EXOTIC_POLLEN : t.HYBRID_POLLEN;
    s.benchJobs.push({ plantId, remaining: ((exotic ? t.EXOTIC_HOURS : t.HYBRID_HOURS) * 3600) / this.derived.global.benchSpeed });
    return true;
  }

  // Resets and shops (GDD 12) ------------------------------------------------

  private replant(w: number): boolean {
    if (!this.canReplant(w)) return false;
    const s = this.state;
    const t = this.t;
    const ws = s.worlds[w]!;
    const gained = this.pendingCompost(w);
    const before = s.compostEra;
    const runSeconds = s.time - ws.runStartedAt;
    ws.claimed = ws.claimed.add(gained);
    s.compost = s.compost.add(gained);
    s.compostEra = s.compostEra.add(gained);
    s.compostAllTime = s.compostAllTime.add(gained);
    s.counters.compostAllTime = Math.min(1e300, s.compostAllTime.toNumber());
    ws.replantsEra++;
    ws.replantsEver++;
    this.count('replants');
    // XP only for a new all-time Compost record, never for the Replant itself (GDD 9.1).
    const record = compostRecordXp(s.compostRecordPow, s.compostAllTime, t.REPLANT_XP_STEP);
    s.compostRecordPow = record.passed;
    if (record.xp > 0) this.addXp(record.xp, 'replants');
    if (gained.gte(before.mul(t.REPLANT_CHEST_FRACTION)) && s.time - ws.lastReplantChestAt >= t.REPLANT_CHEST_COOLDOWN_HOURS * 3600) {
      ws.lastReplantChestAt = s.time;
      this.grantChest('chest.copper');
    }
    this.startRun(w);
    this.invalidate();
    this.emit({ type: 'replant', world: w, gained, compostEra: s.compostEra, runSeconds });
    return true;
  }

  private festival(): boolean {
    if (!this.canFestival()) return false;
    const s = this.state;
    const gained = this.pendingRibbons();
    s.ribbonsClaimed = s.ribbonsClaimed.add(gained);
    s.ribbons = s.ribbons.add(gained);
    s.festivals++;
    this.count('festivals');
    s.freeRespecs++;
    this.grantChest(s.festivals === 1 ? 'chest.crystal' : s.festivals % 5 === 0 ? 'chest.starlight' : 'chest.golden');
    if (s.festivals === 1) s.heirloomPicks++;
    s.compost = Num.ZERO;
    s.compostEra = Num.ZERO;
    s.compostShop = {};
    s.recordMilestones = 0;
    s.focus = 0;
    s.combo = 0;
    s.visitors = [];
    // Design 0.5 (GDD 14.5): a world with its 10th star has its Head crowned at this Festival.
    const crowned: number[] = [];
    if (this.t.HEAD_CROWN_TIERUPS > 0) {
      s.worlds.forEach((ws, w) => {
        if (!ws.crowned && ws.stars >= this.content.worlds[w]!.mastery.length) {
          ws.crowned = true;
          crowned.push(w);
        }
      });
    }
    s.worlds.forEach((ws, w) => {
      ws.lifetime = Num.ZERO;
      ws.claimed = Num.ZERO;
      ws.replantsEra = 0;
      for (const f of ws.floors) {
        f.eraMilestones = 0;
        f.hired = false;
      }
      if (w === 0) this.startRun(0);
      else if (ws.unlocked) {
        this.startRun(w);
        ws.floors[0]!.level = 0;
        ws.floors[0]!.hired = false;
        ws.unlocked = false;
        this.caches[w]!.dirty = true;
      }
    });
    this.invalidate();
    this.emit({ type: 'festival', gained, ribbons: s.ribbonsClaimed, n: s.festivals });
    for (const w of crowned) this.emit({ type: 'crowned', world: w });
    return true;
  }

  compostShopCost(id: string): Num | null {
    const row = this.content.compostShop.find((r) => r.id === id);
    if (!row) return null;
    const level = this.state.compostShop[id] ?? 0;
    return level >= row.maxLevel ? null : shopCost(row.cost.base, row.cost.growth, level + 1);
  }

  private buyCompostShop(id: string): boolean {
    const s = this.state;
    const cost = this.compostShopCost(id);
    if (!cost || s.unlocked['feature.research'] === undefined || s.compost.lt(cost)) return false;
    s.compost = s.compost.sub(cost);
    s.compostShop[id] = (s.compostShop[id] ?? 0) + 1;
    this.invalidate();
    return true;
  }

  ribbonShopCost(id: string): Num | null {
    const row = this.content.ribbonShop.find((r) => r.id === id);
    if (!row) return null;
    const level = this.state.ribbonShop[id] ?? 0;
    if (row.endless) return shopCost(row.endless.base, row.endless.growth, level + 1);
    const price = row.costs?.[level];
    return price === undefined ? null : Num.from(price);
  }

  private buyRibbonShop(id: string): boolean {
    const s = this.state;
    const cost = this.ribbonShopCost(id);
    if (!cost || s.festivals < 1 || s.ribbons.lt(cost)) return false;
    s.ribbons = s.ribbons.sub(cost);
    s.ribbonShop[id] = (s.ribbonShop[id] ?? 0) + 1;
    this.invalidate();
    return true;
  }

  private timeWarp(size: 'small' | 'large'): boolean {
    const s = this.state;
    const warp = this.t.TIME_WARP[size];
    if (s.gems < warp.gems) return false;
    s.gems -= warp.gems;
    for (let w = 0; w < s.worlds.length; w++) {
      if (!s.worlds[w]!.unlocked) continue;
      this.earn(w, this.managedIps(w, 'offline').mul(warp.hours * 3600 * this.derived.worlds[w]!.offlineEfficiency), 'offline');
    }
    return true;
  }

  // Weekend fair (GDD 15.3) --------------------------------------------------

  private fairInfo(): { cycleSec: number; payout: Num; ips: Num }[] {
    if (this.fairCache) return this.fairCache;
    const t = this.t;
    const f = this.state.fair;
    let min = Infinity;
    for (let i = 0; i < this.fairFloors.length; i++) min = Math.min(min, f.levels[i] ?? 0);
    const tower = milestoneCount(min, t);
    this.fairCache = this.fairFloors.map((def, i) => floorOutput(def, f.levels[i] ?? 0, tower, t.TOWER_MILESTONE_MULT, 1, Num.ONE, t));
    return this.fairCache;
  }

  private startFair(week: number): void {
    const n = this.fairFloors.length;
    const fair: FairState = { active: true, weekKey: week, coins: Num.ZERO, tickets: Num.ZERO, step: 0, levels: Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0)), progress: Array.from({ length: n }, () => 0) };
    this.state.fair = fair;
    this.fairCache = null;
    this.invalidate();
  }

  private fairEarn(amount: Num): void {
    const f = this.state.fair;
    f.coins = f.coins.add(amount);
    f.tickets = f.tickets.add(amount);
    while (f.step < this.content.fairSteps.length && f.tickets.gte(this.content.fairSteps[f.step]!)) {
      this.giveReward(this.content.fair.track[f.step]!.reward);
      f.step++;
      this.emit({ type: 'fairStep', step: f.step });
    }
  }

  private stepFair(dt: number): void {
    const f = this.state.fair;
    const info = this.fairInfo();
    let income: Num | null = null;
    for (let i = 0; i < info.length; i++) {
      if ((f.levels[i] ?? 0) <= 0) break;
      const total = f.progress[i]! + dt / info[i]!.cycleSec;
      const cycles = Math.floor(total + 1e-12);
      f.progress[i] = Math.max(0, total - cycles);
      if (cycles > 0) income = income ? income.add(info[i]!.payout.mul(cycles)) : info[i]!.payout.mul(cycles);
    }
    // Growth Spurts work as usual on the stall; boosts do not (GDD 15.3).
    if (income) this.fairEarn(income.mul(this.spurtMult(this.state.focus)));
  }

  fairCost(i: number, count: number): Num | null {
    const f = this.state.fair;
    const def = this.fairFloors[i];
    if (!f.active || !def) return null;
    const level = f.levels[i] ?? 0;
    if (level <= 0) return i > 0 && (f.levels[i - 1] ?? 0) > 0 ? def.openCost : null;
    return bulkCost(def.levelBaseCost, def.growth, level, count);
  }

  private fairBuy(i: number, count: number): boolean {
    const f = this.state.fair;
    const cost = this.fairCost(i, count);
    if (!cost || count < 1 || f.coins.lt(cost)) return false;
    f.coins = f.coins.sub(cost);
    f.levels[i] = (f.levels[i] ?? 0) <= 0 ? 1 : f.levels[i]! + count;
    this.fairCache = null;
    return true;
  }

  /**
   * Taps on the fair stall (GDD 15.3). Only tap skills and heirloom passives
   * apply, never cards; Combo is shared with the main game.
   */
  private fairTap(count: number): boolean {
    const s = this.state;
    const t = this.t;
    if (!s.fair.active || !(count > 0)) return false;
    const wd = this.derived.global.fairTap;
    const run = comboRun(s.combo, count, wd.comboCap, 1 / t.COMBO_TAPS_PER_STACK, t.COMBO_PER_STACK);
    s.combo = run.stacks;
    s.comboIdle = 0;
    const crit = s.unlocked['feature.bumpers'] !== undefined ? expectedCrit(wd.critChance, wd.critMult) : 1;
    this.count('taps', count);
    const spurt = this.spurtMult(s.focus);
    this.fairEarn(this.fairIps().mul(t.TAP_SECONDS * wd.tapPower * run.multSum * crit * spurt));
    if (spurt === 1 && s.unlocked['feature.spurt'] !== undefined) s.spurtMeter = Math.min(this.derived.worlds[s.focus]!.spurtTaps, s.spurtMeter + count);
    return true;
  }

  // Quests, achievements, unlocks (GDD 11, 16) -------------------------------

  private newDay(day: number): void {
    const s = this.state;
    s.day = day;
    if (s.unlocked['feature.quests'] !== undefined) this.drawDaily();
    const week = Math.floor(day / 7);
    if (week !== s.week) {
      s.week = week;
      if (s.unlocked['feature.world2'] !== undefined) this.drawWeekly();
    }
    this.syncFair();
  }

  /** The fair runs Friday to Sunday once weekend events are unlocked. */
  private syncFair(): void {
    const s = this.state;
    const weekend = this.dayOfWeek() >= 4 && s.unlocked['feature.events'] !== undefined;
    if (weekend && (!s.fair.active || s.fair.weekKey !== s.week)) this.startFair(s.week);
    else if (!weekend && s.fair.active) {
      s.fair.active = false;
      this.invalidate();
    }
  }

  private questAllowed(q: PoolQuestRow): boolean {
    const s = this.state;
    if (!q.needs) return true;
    if (q.needs === 'ability') return this.abilities().length > 0;
    if (q.needs === 'research3') return s.unlocked['feature.research'] !== undefined;
    return s.unlocked[q.needs] !== undefined;
  }

  private draw(pool: PoolQuestRow[], n: number): QuestSlot[] {
    const s = this.state;
    const open = pool.filter((q) => this.questAllowed(q));
    const out: QuestSlot[] = [];
    while (out.length < n && open.length > 0) {
      const k = Math.floor((nextRange(s.rng.quests, 0, 1)) * open.length);
      const q = open.splice(Math.min(k, open.length - 1), 1)[0]!;
      out.push({ id: q.id, start: s.counters[q.counter] ?? 0, done: false });
    }
    return out;
  }

  private drawDaily(): void {
    this.state.daily = this.draw(this.content.daily, this.t.DAILY_COUNT);
    this.state.dailyAllDone = false;
  }

  private drawWeekly(): void {
    this.state.weekly = this.draw(this.content.weekly, this.t.WEEKLY_COUNT);
    this.state.weeklyAllDone = false;
  }

  private giveReward(r: Reward): void {
    const s = this.state;
    if (r.gems) s.gems += r.gems;
    if (r.pollen) this.addPollen(r.pollen);
    if (r.chest) this.grantChest(r.chest);
    if (r.heirloom) this.addHeirloom(r.heirloom);
    if (r.special === 'chest.welcome') {
      const cards: string[] = [];
      for (const f of this.content.worlds[0]!.floors.slice(0, WELCOME_FLOORS)) {
        this.addCard(f.manager.id, WELCOME_COPIES);
        for (let k = 0; k < WELCOME_COPIES; k++) cards.push(f.manager.id);
      }
      this.chestOpened('chest.welcome', 1, cards, null);
    } else if (r.special === 'chest.seed_packet') {
      for (const id of SEED_PACKET) this.addCard(id);
      this.chestOpened('chest.seed_packet', 1, SEED_PACKET, null);
    }
    if (r.epicCopies) {
      const epics = this.content.managers.filter((m) => m.rarity === 'epic' && s.cards[m.id] !== undefined);
      if (epics.length > 0) this.addCard(epics[((s.fair.weekKey % epics.length) + epics.length) % epics.length]!.id, r.epicCopies);
    }
  }

  private unlock(id: string): void {
    const s = this.state;
    if (s.unlocked[id] !== undefined) return;
    s.unlocked[id] = s.time;
    if (id === 'feature.quests') this.drawDaily();
    else if (id === 'feature.world2') this.drawWeekly();
    else if (id === 'feature.visitors') s.visitorTimer = nextRange(s.rng.events, this.t.VISITOR_MIN, this.t.VISITOR_MAX) * this.derived.worlds[s.focus]!.visitorInterval;
    else if (id === 'feature.events') this.syncFair();
    this.emit({ type: 'unlock', id });
  }

  /** Evaluates an unlock or story condition (CONTENT 9 and GDD 16). Worlds and floors in conditions are 1-based. */
  cond(c: Condition): boolean {
    const s = this.state;
    switch (c.kind) {
      case 'start': return true;
      case 'counter': return (s.counters[c.counter!] ?? 0) >= Number(c.gte ?? 1);
      case 'floorLevel': return (s.worlds[c.world! - 1]?.floors[c.floor! - 1]?.level ?? 0) >= c.level!;
      case 'anyFloorLevel': return (s.counters.maxFloorLevel ?? 0) >= c.level!;
      case 'floorOpened': {
        const def = this.content.worlds[c.world! - 1]?.floors[c.floor! - 1];
        return def !== undefined && s.codex[def.id] === true;
      }
      case 'lifetime': return s.worlds[c.world! - 1]!.lifetime.gte(Num.from(String(c.gte)));
      case 'playerLevel': return s.level >= Number(c.gte);
      case 'playSeconds': return s.playTime >= Number(c.gte);
      case 'firstReturn': return (s.counters.offlineReturns5 ?? 0) >= 1;
      case 'replantAvailable': return s.worlds.some((_, w) => this.canReplant(w)) || (s.counters.replants ?? 0) > 0;
      case 'festivalAvailable': return this.canFestival() || s.festivals > 0;
      case 'worldReached': return s.worldReached >= c.world!;
      case 'research': return s.researchDone[c.id!] === true;
      case 'shopLevel': return (s.compostShop[c.id!] ?? s.ribbonShop[c.id!] ?? 0) >= Number(c.gte ?? 1);
      case 'masteryStars': return s.worlds.filter((w) => w.stars >= Number(c.gte)).length >= (c.worlds ?? 1);
      case 'managerHired': return s.worlds[c.world! - 1]?.floors[c.floor! - 1]?.hired === true;
      case 'allFloorsLevel': return this.minLevel(c.world! - 1) >= c.level!;
      case 'holdCoins': {
        const ws = s.worlds[c.world! - 1]!;
        if (c.floor !== undefined && (ws.floors[c.floor - 1]?.level ?? 0) <= 0) return false;
        return ws.coins.gte(Num.from(String(c.gte)));
      }
      case 'ribbonsPending': return this.pendingRibbons().gte(Number(c.gte)) || s.festivals > 0;
    }
  }

  private checkProgress(): void {
    const s = this.state;
    const t = this.t;
    this.progressDue = s.time + (s.playTime < 900 ? 0.2 : 1);

    for (const u of this.content.unlocks) {
      if (s.unlocked[u.id] !== undefined) continue;
      if (u.when.kind === 'worldReached' && u.when.world! > this.maxWorld) continue;
      if (this.cond(u.when)) this.unlock(u.id);
    }

    // Story: one step at a time; a step whose goal is already met completes at once.
    while (s.storyIndex < this.content.story.length) {
      const step = this.content.story[s.storyIndex]!;
      if (step.goal.kind === 'worldReached' && step.goal.world! > this.maxWorld) {
        s.storyIndex++;
        continue;
      }
      if (!this.cond(step.goal)) break;
      s.storyIndex++;
      this.count('questsDone');
      for (const r of step.rewards ?? []) this.giveReward(r);
      this.addXp(step.xp, 'story');
      this.emit({ type: 'story', id: step.id, n: step.n });
    }

    // Chapter goals after the fixed chain: every floor of a world at 100 x n (CONTENT 9).
    if (s.storyIndex >= this.content.story.length) {
      s.worlds.forEach((ws, w) => {
        while (ws.everReached && ws.chapterClaimed < Math.floor(ws.bestMinLevel / 100)) {
          ws.chapterClaimed++;
          this.grantChest('chest.silver');
          this.addXp(t.XP_CHAPTER, 'story');
          this.count('questsDone');
          this.emit({ type: 'quest', kind: 'chapter', id: `${this.content.worlds[w]!.id}.${ws.chapterClaimed}` });
        }
      });
    }

    // Ticket waypoint marks: Gems the first time each fraction of the price is in hand (GDD 14.3).
    s.worlds.forEach((ws, w) => {
      const ticket = this.content.worlds[w]!.ticket;
      if (!ticket || !ws.unlocked || ws.waypoints >= t.TICKET_WAYPOINTS.length || !this.topFloorOpen(w)) return;
      while (ws.waypoints < t.TICKET_WAYPOINTS.length && ws.coins.gte(ticket.mul(t.TICKET_WAYPOINTS[ws.waypoints]!))) {
        ws.waypoints++;
        s.gems += t.WAYPOINT_GEMS;
      }
    });

    this.checkQuests(s.daily, 'daily');
    this.checkQuests(s.weekly, 'weekly');

    if (s.unlocked['feature.achievements'] !== undefined) {
      for (const a of this.content.achievements) {
        let tier = s.achievements[a.id] ?? 0;
        const value = s.counters[a.counter] ?? 0;
        while (tier < a.tiers.length && value >= a.tiers[tier]!) {
          s.gems += t.ACHIEVEMENT_GEMS[tier]!;
          this.addXp(t.XP_ACHIEVEMENT[tier]!, 'achievements');
          tier++;
          s.achievements[a.id] = tier;
          s.achievementCount++;
          this.invalidate();
          this.emit({ type: 'achievement', id: a.id, tier });
        }
      }
    }
  }

  private checkQuests(slots: QuestSlot[], kind: 'daily' | 'weekly'): void {
    if (slots.length === 0) return;
    const s = this.state;
    const t = this.t;
    const daily = kind === 'daily';
    let open = 0;
    for (const q of slots) {
      if (q.done) continue;
      const row = this.questRows.get(q.id)!;
      if ((s.counters[row.counter] ?? 0) - q.start < row.goal) {
        open++;
        continue;
      }
      q.done = true;
      this.count('questsDone');
      if (daily) this.count('dailiesDone');
      s.gems += daily ? t.DAILY_GEMS : t.WEEKLY_GEMS;
      this.grantChest(daily ? 'chest.wooden' : 'chest.silver');
      if (daily && this.derived.global.specials['unlock.bench']) this.addPollen(t.DAILY_POLLEN);
      this.addXp(daily ? t.XP_DAILY : t.XP_WEEKLY, 'quests');
      this.emit({ type: 'quest', kind, id: q.id });
    }
    const allDone = daily ? s.dailyAllDone : s.weeklyAllDone;
    if (open === 0 && !allDone && slots.length >= (daily ? t.DAILY_COUNT : t.WEEKLY_COUNT)) {
      if (daily) s.dailyAllDone = true;
      else s.weeklyAllDone = true;
      s.gems += daily ? t.DAILY_GEMS_ALL : t.WEEKLY_GEMS_ALL;
      this.grantChest(daily ? 'chest.copper' : 'chest.golden');
      if (daily && this.derived.global.specials['unlock.bench']) this.addPollen(t.DAILY_POLLEN_ALL);
      this.addXp(daily ? t.XP_DAILY_ALL : t.XP_WEEKLY_ALL, 'quests');
    }
  }
}

export function createGame(opts: GameOptions): Game {
  return new Game(opts);
}
