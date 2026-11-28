/**
 * One simulated player from first launch to day N: the daily schedule, the
 * offline gaps and everything that is written down along the way.
 *
 * Schedule (GDD 17.6): a longer first session, then every day the profile's
 * sessions spread evenly over 16 waking hours and 8 hours of sleep. Between
 * sessions the game is closed and `fastForward` pays the offline earnings.
 * Game time 0 is 08:00 on a Monday.
 */
import {
  Num, createGame, tapIncomeFactor,
  type Content, type Game, type GameEvent, type IncomeSource,
} from '@sprout/core';
import { Bot } from './bot';
import type { PlayStyle, Profile } from './profiles';

export interface RunOptions {
  content: Content;
  profile: Profile;
  style: PlayStyle;
  seed: number;
  days: number;
  /** Highest world that can be reached: 4 for the launch build, 6 for the full plan. */
  maxWorld: number;
  /** Name of the rule set (the GDD, or a proposal overlay). */
  rules: string;
}

export interface TimelineEvent {
  t: number;
  play: number;
  kind: 'unlock' | 'floor' | 'world' | 'replant' | 'festival' | 'level' | 'star' | 'story' | 'research' | 'bench' | 'heirloom' | 'fair' | 'hire';
  id: string;
  world?: number;
  n?: number;
  /** log10 of an amount, where one applies (Compost gained, Ribbons held). */
  amount?: number;
  runSeconds?: number;
}

export interface WorldSample {
  life: number | null;
  steady: number | null;
  min: number;
  max: number;
  best: number;
  stars: number;
}

export interface Sample {
  t: number;
  play: number;
  level: number;
  gems: number;
  pollen: number;
  insight: number;
  compostEra: number | null;
  compostAll: number | null;
  ribbons: number | null;
  festivals: number;
  replants: number;
  frontier: number;
  worlds: WorldSample[];
  cards: number;
  managerLevels: Record<string, number>;
  /** Mean card level of the managers met so far, per world (0 where none is met). */
  managerLevelByWorld: number[];
  research: number;
  heirlooms: number;
  achievements: number;
  offlineEff: number;
  offlineCapH: number;
  tapFactor6: number;
  tapFactor12: number;
  /** XP awarded so far, by source. */
  xp: Record<string, number>;
  /** The parts of tap income on the frontier world. */
  tap: { power: number; comboCap: number; critChance: number; critMult: number };
  /** Multipliers on the frontier world's best floor. */
  mult: {
    /** The median hired manager, the mean of the three highest hired floors, and the income-weighted mean. */
    manager: number;
    managerTop: number;
    managerWeighted: number;
    permanent: number;
    research: number;
    skills: number;
    heirlooms: number;
    plantsAndPerks: number;
    achievements: number;
    codex: number;
    mastery: number;
    speed: number;
    cost: number;
    richSoil: number;
    goldenHour: number;
    compostPassive: number | null;
    ribbonPassive: number | null;
  };
}

export interface SessionStat {
  t: number;
  seconds: number;
  world: number;
  moved: boolean;
  /** Time-weighted averages on the world on screen. */
  boost: number;
  tapBoost: number;
  towerFactor: number;
  spurtShare: number;
  /** Income by source as a multiple of steady income over the session. */
  multiple: Partial<Record<IncomeSource, number>>;
  /** Share of everything earned since the last session ended (the offline gap included). */
  share: Partial<Record<IncomeSource, number>>;
  peakFactor: number;
}

export interface RunResult {
  meta: { profile: string; tapRate: number; skill: string; burst: boolean; seed: number; days: number; maxWorld: number; rules: string; seconds: number };
  unlocks: { n: number; id: string; t: number | null; play: number | null; targetSec: number | null; targetDay: number | null }[];
  timeline: TimelineEvent[];
  /** Every reward beat as [game time, play time]. */
  beats: [number, number][];
  samples: Sample[];
  sessions: SessionStat[];
  counts: Record<string, number>;
  chests: Record<string, number>;
  spent: { gems: number; pollen: number; insight: number };
  quiet: { seconds: number; endedAtPlay: number; endedAt: number };
  /** The longest stretch with nothing bought that was not spent saving for a world ticket. */
  dead: { seconds: number; endedAtPlay: number; endedAt: number };
  valveReplants: number;
  actions: number;
  fairWeekends: { week: number; step: number; tickets: number | null }[];
  offline: { t: number; seconds: number; paid: number }[];
  /**
   * The Ribbon Shop (GDD 18): when each fixed item (every one but the endless
   * Blue Ribbon Polish) reached its last level, and when all of them had, in game
   * and play seconds. Missing in runs saved before design 0.4.
   */
  ribbonShop?: { done: Record<string, number>; all: { t: number; play: number } | null };
}

const l10 = (n: Num): number | null => (n.gt(0) ? n.log10() : null);

/** Income-weighted mean of manager multipliers, from log10 incomes of any size. */
function weightedByLog(rows: ({ l: number; m: number } | null)[]): number {
  const live = rows.filter((r): r is { l: number; m: number } => r !== null && Number.isFinite(r.l));
  if (live.length === 0) return 1;
  const max = Math.max(...live.map((r) => r.l));
  let a = 0;
  let b = 0;
  for (const r of live) {
    const w = 10 ** (r.l - max);
    a += w;
    b += w / r.m;
  }
  return b > 0 ? a / b : 1;
}
const SOURCES: IncomeSource[] = ['floors', 'taps', 'visitors', 'twist', 'abilities', 'offline', 'autopilot'];

class Recorder {
  readonly timeline: TimelineEvent[] = [];
  readonly beats: [number, number][] = [];
  readonly samples: Sample[] = [];
  readonly sessions: SessionStat[] = [];
  readonly counts: Record<string, number> = {};
  readonly chests: Record<string, number> = {};
  readonly spent = { gems: 0, pollen: 0, insight: 0 };
  readonly unlockAt = new Map<string, { t: number; play: number }>();
  readonly fairWeekends: { week: number; step: number; tickets: number | null }[] = [];
  readonly offline: { t: number; seconds: number; paid: number }[] = [];
  readonly ribbonShop: { done: Record<string, number>; all: { t: number; play: number } | null } = { done: {}, all: null };

  private sess = { seconds: 0, boost: 0, tapBoost: 0, tower: 0, spurt: 0, peak: 1, world: 0, moved: false, steady: Num.ZERO };

  constructor(private readonly g: Game) {
    g.on((e) => this.onEvent(e));
    // Count what is spent on the three soft currencies, so income can be worked out from balances.
    const dispatch = g.dispatch.bind(g);
    g.dispatch = (cmd) => {
      const s = g.state;
      const before = { gems: s.gems, pollen: s.pollen, insight: s.insight };
      const ok = dispatch(cmd);
      if (ok) {
        if (s.gems < before.gems) this.spent.gems += before.gems - s.gems;
        if (s.pollen < before.pollen) this.spent.pollen += before.pollen - s.pollen;
        if (s.insight < before.insight) this.spent.insight += before.insight - s.insight;
        if (cmd.type === 'buyRibbonShop') this.ribbonBought(cmd.id);
      }
      return ok;
    };
  }

  private ribbonBought(id: string): void {
    const g = this.g;
    const s = g.state;
    const row = g.content.ribbonShop.find((r) => r.id === id);
    if (row?.costs && (s.ribbonShop[id] ?? 0) >= row.costs.length && !(id in this.ribbonShop.done)) this.ribbonShop.done[id] = s.time;
    if (this.ribbonShop.all) return;
    const fixed = g.content.ribbonShop.filter((r) => r.costs);
    if (fixed.every((r) => r.id in this.ribbonShop.done)) this.ribbonShop.all = { t: s.time, play: s.playTime };
  }

  private bump(name: string, n = 1): void {
    this.counts[name] = (this.counts[name] ?? 0) + n;
  }

  private beat(): void {
    this.beats.push([this.g.state.time, this.g.state.playTime]);
  }

  private add(e: Omit<TimelineEvent, 't' | 'play'>): void {
    this.timeline.push({ t: this.g.state.time, play: this.g.state.playTime, ...e });
    this.beat();
  }

  private onEvent(e: GameEvent): void {
    const s = this.g.state;
    switch (e.type) {
      case 'unlock':
        this.unlockAt.set(e.id, { t: s.time, play: s.playTime });
        this.add({ kind: 'unlock', id: e.id });
        break;
      case 'floorOpened':
        if (e.first) this.add({ kind: 'floor', id: this.g.content.worlds[e.world]!.floors[e.floor]!.id, world: e.world, n: e.floor + 1 });
        break;
      case 'worldReached':
        this.add({ kind: 'world', id: this.g.content.worlds[e.world]!.id, world: e.world, n: e.first ? 1 : 0 });
        break;
      case 'replant':
        this.add({ kind: 'replant', id: `replant.w${e.world + 1}`, world: e.world, n: s.worlds[e.world]!.replantsEver, amount: l10(e.gained) ?? 0, runSeconds: e.runSeconds });
        break;
      case 'festival':
        this.add({ kind: 'festival', id: 'festival', n: e.n, amount: l10(e.ribbons) ?? 0 });
        break;
      case 'levelUp':
        this.add({ kind: 'level', id: `level.${e.level}`, n: e.level });
        break;
      case 'star':
        this.add({ kind: 'star', id: `star.w${e.world + 1}.${e.stars}`, world: e.world, n: e.stars });
        break;
      case 'story':
        this.add({ kind: 'story', id: e.id, n: e.n });
        break;
      case 'researchDone':
        this.add({ kind: 'research', id: e.id });
        break;
      case 'benchDone':
        this.add({ kind: 'bench', id: e.id });
        break;
      case 'heirloomNew':
        this.add({ kind: 'heirloom', id: e.id });
        break;
      case 'fairStep':
        this.add({ kind: 'fair', id: `fair.step.${e.step}`, n: e.step });
        break;
      case 'hire':
        if ((this.counts.hires ?? 0) === 0) this.add({ kind: 'hire', id: 'first_hire', world: e.world, n: e.floor + 1 });
        this.bump('hires');
        break;
      case 'milestone':
        this.bump('milestones');
        if (e.record) {
          this.bump('recordMilestones');
          this.beat();
        }
        break;
      case 'chestOpened':
        this.chests[e.chest] = (this.chests[e.chest] ?? 0) + 1;
        this.beat();
        break;
      case 'cardNew':
        this.bump('cardsNew');
        break;
      case 'achievement':
        this.bump('achievements');
        this.beat();
        break;
      case 'quest':
        this.bump(`quests.${e.kind}`);
        this.beat();
        break;
      case 'offline':
        this.offline.push({ t: s.time, seconds: e.seconds, paid: e.paidSeconds });
        break;
      case 'sunrise':
        this.bump(e.caught ? 'sunrisesCaught' : 'sunrisesMissed');
        break;
      default:
        break;
    }
  }

  sessionStart(): void {
    this.sess = { seconds: 0, boost: 0, tapBoost: 0, tower: 0, spurt: 0, peak: 1, world: this.g.state.focus, moved: false, steady: Num.ZERO };
  }

  /** Clears the income tally. Called when a session ends, so the next tally covers the gap and the session after it. */
  resetTally(): void {
    this.g.clearTally();
  }

  tick(dt: number): void {
    const g = this.g;
    const w = g.state.focus;
    const x = this.sess;
    if (w !== x.world) {
      x.world = w;
      x.moved = true;
      x.steady = Num.ZERO;
    }
    const steady = g.steadyIps(w);
    const now = g.worldIps(w);
    const factor = steady.gt(0) ? now.div(steady).toNumber() : 1;
    x.seconds += dt;
    x.boost += g.boost(w, -1) * dt;
    x.tapBoost += g.boost(w, -1, true) * dt;
    x.tower += factor * dt;
    if (g.spurtMult(w) > 1) x.spurt += dt;
    if (factor > x.peak) x.peak = factor;
    x.steady = x.steady.add(steady.mul(dt));
  }

  sessionEnd(): void {
    const g = this.g;
    const x = this.sess;
    const tally = g.tally[x.world]!;
    let total = Num.ZERO;
    for (const src of SOURCES) total = total.add(tally[src]);
    const multiple: Partial<Record<IncomeSource, number>> = {};
    const share: Partial<Record<IncomeSource, number>> = {};
    for (const src of SOURCES) {
      if (!tally[src].gt(0)) continue;
      if (total.gt(0)) share[src] = tally[src].div(total).toNumber();
      if (!x.moved && x.steady.gt(0) && src !== 'offline') multiple[src] = tally[src].div(x.steady).toNumber();
    }
    const sec = Math.max(1e-9, x.seconds);
    this.sessions.push({
      t: g.state.time, seconds: x.seconds, world: x.world, moved: x.moved,
      boost: x.boost / sec, tapBoost: x.tapBoost / sec, towerFactor: x.tower / sec, spurtShare: x.spurt / sec,
      multiple, share, peakFactor: x.peak,
    });
    const f = g.state.fair;
    if (f.active) {
      const last = this.fairWeekends[this.fairWeekends.length - 1];
      const row = { week: f.weekKey, step: f.step, tickets: l10(f.tickets) };
      if (last && last.week === f.weekKey) this.fairWeekends[this.fairWeekends.length - 1] = row;
      else this.fairWeekends.push(row);
    }
    this.sample();
    this.resetTally();
  }

  sample(): void {
    const g = this.g;
    const s = g.state;
    const t = g.t;
    const d = g.derived;
    let frontier = 0;
    s.worlds.forEach((w, i) => {
      if (w.unlocked) frontier = i;
    });
    const worlds: WorldSample[] = s.worlds.map((ws, w) => {
      let min = Infinity;
      let max = 0;
      for (const f of ws.floors) {
        if (f.level < min) min = f.level;
        if (f.level > max) max = f.level;
      }
      return { life: l10(ws.lifetime), steady: ws.unlocked ? l10(g.steadyIps(w)) : null, min: ws.unlocked ? min : 0, max: ws.unlocked ? max : 0, best: ws.bestMinLevel, stars: ws.stars };
    });
    const managerLevels: Record<string, number> = {};
    const seen: Record<string, number> = {};
    for (const m of g.content.managers) {
      const own = s.cards[m.id];
      if (!own) continue;
      managerLevels[m.rarity] = (managerLevels[m.rarity] ?? 0) + own.level;
      seen[m.rarity] = (seen[m.rarity] ?? 0) + 1;
    }
    for (const r of Object.keys(managerLevels)) managerLevels[r] = managerLevels[r]! / seen[r]!;
    const lvSum = s.worlds.map(() => 0);
    const lvN = s.worlds.map(() => 0);
    for (const m of g.content.managers) {
      const own = s.cards[m.id];
      if (!own) continue;
      lvSum[m.world] = (lvSum[m.world] ?? 0) + own.level;
      lvN[m.world] = (lvN[m.world] ?? 0) + 1;
    }
    const managerLevelByWorld = lvSum.map((v, i) => (lvN[i]! > 0 ? v / lvN[i]! : 0));

    // The frontier world's best open floor stands for "a typical floor".
    const ws = s.worlds[frontier]!;
    const wd = d.worlds[frontier]!;
    let top = 0;
    let mgrs: number[] = [];
    const hiredInOrder: number[] = [];
    ws.floors.forEach((f, i) => {
      if (f.level > 0) top = i;
      if (f.level > 0 && f.hired) {
        mgrs.push(wd.floors[i]!.manager);
        hiredInOrder.push(wd.floors[i]!.manager);
      }
    });
    // What the hired managers multiply this world's income by, all told.
    const managerWeighted = weightedByLog(
      ws.floors.map((f, i) => {
        if (f.level <= 0 || !f.hired) return null;
        const ips = g.floorInfo(frontier, i).ipsSteady;
        return ips.gt(0) ? { l: ips.log10(), m: wd.floors[i]!.manager } : null;
      }),
    );
    const topThree = hiredInOrder.slice(-3);
    mgrs = mgrs.sort((a, b) => a - b);
    const fd = wd.floors[top]!;
    const richSoil = 1.25 ** (s.compostShop['shop.compost.rich_soil'] ?? 0);
    const goldenHour = 2 ** (s.ribbonShop['shop.ribbon.golden_hour'] ?? 0);
    const research = fd.parts.research! * researchMul(g);
    const wdTap = d.worlds[frontier]!;
    this.samples.push({
      t: s.time, play: s.playTime, level: s.level, gems: s.gems, pollen: s.pollen, insight: s.insight,
      compostEra: l10(s.compostEra), compostAll: l10(s.compostAllTime), ribbons: l10(s.ribbonsClaimed),
      festivals: s.festivals, replants: g.counter('replants'), frontier, worlds,
      cards: Object.keys(s.cards).length, managerLevels, managerLevelByWorld,
      research: Object.keys(s.researchDone).length, heirlooms: Object.keys(s.heirlooms).length, achievements: s.achievementCount,
      offlineEff: wd.offlineEfficiency, offlineCapH: d.global.offlineCapSec / 3600,
      tapFactor6: tapIncomeFactor(t.HOLD_RATE, wdTap.tapPower, wdTap.comboCap, wdTap.critChance, wdTap.critMult, t),
      tapFactor12: tapIncomeFactor(t.TAP_RATE_CAP, wdTap.tapPower, wdTap.comboCap, wdTap.critChance, wdTap.critMult, t),
      xp: { ...g.xpTally },
      tap: { power: wdTap.tapPower, comboCap: wdTap.comboCap, critChance: wdTap.critChance, critMult: wdTap.critMult },
      mult: {
        manager: mgrs.length > 0 ? mgrs[Math.floor(mgrs.length / 2)]! : 1,
        managerTop: topThree.length > 0 ? topThree.reduce((a, b) => a + b, 0) / topThree.length : 1,
        managerWeighted,
        permanent: (fd.profit / richSoil / goldenHour) * fd.speed * (1 + fd.doubleChance),
        research,
        skills: fd.parts.skill!,
        heirlooms: fd.parts.heirloom!,
        plantsAndPerks: fd.parts.floor!,
        achievements: fd.parts.achievements!,
        codex: fd.parts.codex!,
        mastery: fd.parts.mastery!,
        speed: fd.speed,
        cost: fd.cost,
        richSoil,
        goldenHour,
        compostPassive: l10(d.global.compostPassive),
        ribbonPassive: l10(d.global.ribbonPassive),
      },
    });
  }
}

/** Product of the finished research projects that multiply profit (Soil Science). */
function researchMul(g: Game): number {
  let m = 1;
  for (const r of g.content.research) {
    if (g.state.researchDone[r.id] && r.effect?.stat === 'floor.profit' && r.effect.op === 'mul') m *= r.effect.value;
  }
  return m;
}

export function runSim(o: RunOptions): RunResult {
  const started = Date.now();
  const g = createGame({ content: o.content, seed: o.seed, maxWorld: o.maxWorld });
  const rec = new Recorder(g);
  const bot = new Bot(g, o.profile, o.style, o.maxWorld);
  const p = o.profile;
  const end = o.days * 86400;
  const gap = (16 * 3600) / p.sessionsPerDay - p.sessionSec;

  const session = (length: number, first = false): void => {
    rec.sessionStart();
    bot.sessionStart(length);
    let left = length;
    while (left > 1e-9) {
      const step = Math.min(1, left);
      g.advance(step);
      bot.tick(step);
      rec.tick(step);
      left -= step;
      // Two extra samples inside the first session, for the first-ten-minutes and first-hour targets.
      if (first && (length - left === 600 || length - left === 1800)) rec.sample();
    }
    bot.sessionEnd();
    rec.sessionEnd();
  };
  const away = (seconds: number): void => {
    g.fastForward(seconds * 1000);
  };

  rec.sample();
  session(p.firstSessionSec, true);
  while (g.state.time < end) {
    for (let k = 0; k < p.sessionsPerDay && g.state.time < end; k++) {
      away(gap);
      session(p.sessionSec);
    }
    away(8 * 3600);
  }

  return {
    meta: {
      profile: p.id, tapRate: o.style.tapRate, skill: o.style.skill, burst: o.style.burst, seed: o.seed, days: o.days, maxWorld: o.maxWorld, rules: o.rules,
      seconds: (Date.now() - started) / 1000,
    },
    unlocks: o.content.unlocks.map((u) => ({
      n: u.n, id: u.id, t: rec.unlockAt.get(u.id)?.t ?? (u.when.kind === 'start' ? 0 : null), play: rec.unlockAt.get(u.id)?.play ?? (u.when.kind === 'start' ? 0 : null),
      targetSec: u.targetSec ?? null, targetDay: u.targetDay ?? null,
    })),
    timeline: rec.timeline,
    beats: rec.beats,
    samples: rec.samples,
    sessions: rec.sessions,
    counts: { ...rec.counts, ...Object.fromEntries(Object.entries(g.state.counters).map(([k, v]) => [`counter.${k}`, v])) },
    chests: rec.chests,
    spent: rec.spent,
    quiet: bot.longestQuiet,
    dead: bot.longestDead,
    valveReplants: bot.valveReplants,
    actions: bot.actions,
    fairWeekends: rec.fairWeekends,
    offline: rec.offline,
    ribbonShop: rec.ribbonShop,
  };
}
