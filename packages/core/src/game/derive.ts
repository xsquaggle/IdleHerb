/**
 * The stat pipeline (GDD 13, docs/tech/02-architecture.md "Stats and modifiers").
 *
 * One rule: bonuses of the same kind from the same bucket add together, and
 * buckets multiply each other. Every bonus in the game enters as a modifier
 * with a bucket and a scope; this file collects them and resolves the final
 * values. `breakdown` keeps each bucket's factor so tooltips and the
 * simulator can attribute income to systems.
 *
 * The stacking policy lives in `resolve*` below and nowhere else.
 */
import { Num } from '../kernel/num/num';
import type { Content, ManagerDef, PlantDef } from '../content/content';
import type { Effect, Family, StatId } from '../content/schema';
import { managerProfit, perkValue } from '../systems/managers/logic';
import { offlineEfficiency } from '../systems/offline/logic';
import { traitValue } from '../systems/plants/logic';
import { weatherAverage, weatherGroupOf } from '../systems/worlds/logic';
import type { GameState } from './state';

export type Bucket = 'floor' | 'heirloom' | 'skill' | 'research' | 'compost' | 'ribbon' | 'event';

class Acc {
  inc: Partial<Record<Bucket, number>> = {};
  add = 0;
  mul = 1;
  red = 1;
  put(op: Effect['op'], value: number, bucket: Bucket): void {
    if (op === 'inc') this.inc[bucket] = (this.inc[bucket] ?? 0) + value;
    else if (op === 'add') this.add += value;
    else if (op === 'mul') this.mul *= value;
    else this.red *= 1 - value;
  }
}

type AccMap = Partial<Record<StatId, Acc>>;

function acc(map: AccMap, stat: StatId): Acc {
  return (map[stat] ??= new Acc());
}

/** Sum of every percentage on a stat across the given scopes, all buckets together: "1 + every source added". */
function incTotal(...accs: (Acc | undefined)[]): number {
  let total = 0;
  for (const a of accs) if (a) for (const b in a.inc) total += a.inc[b as Bucket]!;
  return total;
}

function incOf(bucket: Bucket, ...accs: (Acc | undefined)[]): number {
  let total = 0;
  for (const a of accs) if (a) total += a.inc[bucket] ?? 0;
  return total;
}

function addOf(...accs: (Acc | undefined)[]): number {
  let total = 0;
  for (const a of accs) if (a) total += a.add;
  return total;
}

function mulOf(...accs: (Acc | undefined)[]): number {
  let total = 1;
  for (const a of accs) if (a) total *= a.mul;
  return total;
}

function redOf(...accs: (Acc | undefined)[]): number {
  let total = 1;
  for (const a of accs) if (a) total *= a.red;
  return total;
}

const BUCKETS: Bucket[] = ['floor', 'heirloom', 'skill', 'research', 'compost', 'ribbon', 'event'];

/** Product over buckets of (1 + sum of percentages in that bucket), times every multiplier. */
function bucketProduct(...accs: (Acc | undefined)[]): number {
  let total = mulOf(...accs);
  for (const b of BUCKETS) total *= 1 + incOf(b, ...accs);
  return total;
}

export interface FloorDerived {
  /** Manager profit multiplier while a manager is hired here, else 1. */
  manager: number;
  /** Every number-sized profit factor except the manager, the twist and timed buffs. */
  profit: number;
  /** Speed bonuses other than milestones and timed buffs. */
  speed: number;
  /** Level cost multiplier before timed buffs, already clamped. */
  cost: number;
  doubleChance: number;
  /** Papaya Cay: average weather multiplier for the plants on this floor. 1 elsewhere. */
  weather: number;
  /** Papaya Cay: the weather groups planted on this floor (the live game reads the loop instead of the average). */
  weatherGroups: ReadonlySet<string>;
  /** Factor of each profit bucket, for attribution. */
  parts: Record<string, number>;
}

export interface WorldDerived {
  towerMult: number;
  mastery: number;
  tapPower: number;
  critChance: number;
  critMult: number;
  comboCap: number;
  comboGrace: number;
  spurtDuration: number;
  spurtTaps: number;
  spurtSpeed: number;
  visitorInterval: number;
  windfall: number;
  offlineEfficiency: number;
  /** Multipliers applied after the efficiency cap (the Night Market). */
  offlineBonus: number;
  hires: number;
  floors: FloorDerived[];
}

export interface GlobalDerived {
  /** Compost passive x Ribbon passive: the two factors that can outgrow a double. */
  passive: Num;
  compostPassive: Num;
  ribbonPassive: Num;
  achievements: number;
  codex: number;
  offlineCapSec: number;
  chestLuck: number;
  insightGain: number;
  pollenGain: number;
  pollenMaxedBonus: number;
  compostGain: number;
  hireFee: number;
  cooldownReduction: number;
  heirloomSlots: number;
  planters: number;
  basketStore: number;
  researchDesks: number;
  benchSlots: number;
  benchSpeed: number;
  dewDuration: number;
  bumperFill: number;
  visitorLifetime: number;
  managerPower: number;
  heirloomPower: number;
  keystones: Record<string, Record<string, number> | undefined>;
  specials: Record<string, true>;
}

export interface Derived {
  global: GlobalDerived;
  worlds: WorldDerived[];
}

interface PlantPower {
  value: number;
  family?: Family;
  world: number;
  floor: number;
}

/** Recomputes every derived stat from the state. Called when something that grants a bonus changes. */
export function computeDerived(state: GameState, content: Content, eventBonus: Effect | null): Derived {
  const t = content.tuning;
  const global: AccMap = {};
  const world: AccMap[] = state.worlds.map(() => ({}));
  const floor: AccMap[][] = state.worlds.map((w) => w.floors.map(() => ({})));
  const plantPower: PlantPower[] = [];
  const keystones: GlobalDerived['keystones'] = {};
  const specials: Record<string, true> = {};

  const put = (e: Effect, value: number, bucket: Bucket, w = -1, i = -1): void => {
    if (e.stat === 'plant.power') {
      const scope = e.scope ?? 'global';
      plantPower.push({ value, family: e.family, world: scope === 'global' ? -1 : w, floor: scope === 'floor' ? i : -1 });
      return;
    }
    const scope = e.scope ?? 'global';
    if (scope === 'global' || w < 0) acc(global, e.stat).put(e.op, value, bucket);
    else if (scope === 'world') acc(world[w]!, e.stat).put(e.op, value, bucket);
    else if (scope === 'floor') acc(floor[w]![i]!, e.stat).put(e.op, value, bucket);
    else {
      if (i > 0) acc(floor[w]![i - 1]!, e.stat).put(e.op, value, bucket);
      if (i + 1 < floor[w]!.length) acc(floor[w]![i + 1]!, e.stat).put(e.op, value, bucket);
    }
  };

  // 1. Sources that depend on nothing else: skills, research, both shops, the weekend event.
  for (const s of content.skills) {
    const rank = state.skills[s.id] ?? 0;
    if (rank <= 0) continue;
    if (s.effect) put(s.effect, s.effect.op === 'mul' ? s.effect.value ** rank : s.effect.value * rank, 'skill');
    if (s.special) keystones[s.special] = s.params ?? {};
  }
  for (const r of content.research) {
    if (!state.researchDone[r.id]) continue;
    if (r.effect) put(r.effect, r.effect.value, 'research');
    if (r.special) specials[r.special] = true;
  }
  for (const s of content.compostShop) {
    const lv = state.compostShop[s.id] ?? 0;
    if (lv <= 0) continue;
    if (s.effect) put(s.effect, s.effect.op === 'mul' ? s.effect.value ** lv : s.effect.value * lv, 'compost');
  }
  for (const s of content.ribbonShop) {
    const lv = state.ribbonShop[s.id] ?? 0;
    if (lv <= 0) continue;
    if (s.effect) put(s.effect, s.effect.op === 'mul' ? s.effect.value ** lv : s.effect.value * lv, 'ribbon');
    if (s.special) specials[s.special] = true;
  }
  if (eventBonus) put(eventBonus, eventBonus.value, 'event');

  // 2. Heirlooms, scaled by level and by heirloom power.
  const heirloomPower = 1 + incTotal(global['heirloom.power']);
  const setCount: Record<string, number> = {};
  for (const id of state.equipped) {
    const def = content.artifactById.get(id);
    const own = state.heirlooms[id];
    if (!def || !own) continue;
    setCount[def.set] = (setCount[def.set] ?? 0) + 1;
    for (const p of def.passives) {
      const scale = p.fixed ? 1 : (1 + t.HEIRLOOM_PER_LEVEL * (own.level - 1)) * heirloomPower;
      put(p, p.value * scale, 'heirloom');
    }
  }
  for (const s of content.sets) {
    const n = setCount[s.id] ?? 0;
    if (n >= 2) put(s.two, s.two.value, 'heirloom');
    if (n >= 3) put(s.three, s.three.value, 'heirloom');
  }

  // 3. Manager perks, for managers that are hired. Global perks count once per manager.
  const starPupil = keystones['keystone.star_pupil'];
  const managerLevel: number[][] = state.worlds.map((w) => w.floors.map(() => 0));
  const globalPerkSeen = new Set<string>();
  state.worlds.forEach((ws, w) => {
    if (!ws.unlocked) return;
    const floorDefs = content.worlds[w]!.floors;
    ws.floors.forEach((f, i) => {
      if (!f.hired || f.level <= 0) return;
      const card = state.cards[floorDefs[i]!.manager.id];
      if (!card) return;
      managerLevel[w]![i] = card.level;
    });
    // Star Pupil: the Head counts as one level higher while hired (CONTENT 5.2).
    const top = ws.floors.length - 1;
    if (starPupil && managerLevel[w]![top]! > 0) managerLevel[w]![top]! += starPupil.extraLevels ?? 1;
    ws.floors.forEach((_f, i) => {
      const lv = managerLevel[w]![i]!;
      if (lv <= 0) return;
      const def: ManagerDef = floorDefs[i]!.manager;
      const scope = def.perk.scope ?? 'global';
      if (scope === 'global') {
        if (globalPerkSeen.has(def.id)) return;
        globalPerkSeen.add(def.id);
      }
      put(def.perk, perkValue(def.perk.value, lv, t), 'floor', w, i);
    });
  });
  if (starPupil) acc(global, 'manager.cooldown').put('add', starPupil.cooldownReduction ?? 0, 'skill');

  // 4. Plants, scaled by plant power and the at-home bonus. Global traits count once per card.
  const affinity = t.AFFINITY_BONUS + addOf(global['plant.affinity']);
  const globalTraitSeen = new Set<string>();
  const weatherGroups: Set<string>[][] = state.worlds.map((w) => w.floors.map(() => new Set<string>()));
  const families: Set<Family>[][] = state.worlds.map((w) => w.floors.map(() => new Set<Family>()));
  state.worlds.forEach((ws, w) => {
    if (!ws.unlocked) return;
    ws.floors.forEach((f, i) => {
      if (f.level <= 0) return;
      const fam = content.worlds[w]!.floors[i]!.favouredFamily;
      for (const pid of f.plants) {
        const card = state.cards[pid];
        const def = content.cards.get(pid) as PlantDef | undefined;
        if (!card || !def) continue;
        weatherGroups[w]![i]!.add(weatherGroupOf(def.family, t));
        families[w]![i]!.add(def.family);
        let power = 1;
        for (const pp of plantPower) {
          if (pp.family && pp.family !== def.family) continue;
          if (pp.world >= 0 && pp.world !== w) continue;
          if (pp.floor >= 0 && pp.floor !== i) continue;
          power += pp.value;
        }
        const atHome = fam === 'wild' || fam === def.family;
        for (const tr of def.traitDefs) {
          if (tr.scope === 'global') {
            if (globalTraitSeen.has(def.id + tr.id)) continue;
            globalTraitSeen.add(def.id + tr.id);
          }
          const value = traitValue(tr.base, def.rarity, card.level, atHome, def.traitDefs.length, power, affinity, t);
          put({ stat: tr.stat, op: tr.op, value, scope: tr.scope }, value, 'floor', w, i);
        }
      }
    });
  });

  // Companion Planting: every floor directly next to this one holds a plant of one of its own families (CONTENT 5.2).
  const companion = keystones['keystone.companion_planting'];
  if (companion) {
    families.forEach((list, w) => {
      list.forEach((own, i) => {
        if (own.size === 0 || list.length < 2) return;
        const shares = (other: Set<Family> | undefined): boolean => {
          if (!other) return true; // an edge floor has one neighbour
          for (const f of own) if (other.has(f)) return true;
          return false;
        };
        if (shares(list[i - 1]) && shares(list[i + 1])) acc(floor[w]![i]!, 'floor.profit').put('mul', companion.mult ?? 1.5, 'skill');
      });
    });
  }

  // 5. Resolve.
  const managerPower = 1 + incTotal(global['manager.power']);
  const mcLevel = state.ribbonShop['shop.ribbon.master_composter'] ?? 0;
  const bpLevel = state.ribbonShop['shop.ribbon.blue_polish'] ?? 0;
  const compostPassive = state.compostEra.mul(t.COMPOST_PCT + t.MASTER_COMPOSTER_PCT * mcLevel).add(1);
  const ribbonPassive = state.ribbonsClaimed.mul(t.RIBBON_PCT + t.BLUE_POLISH_PCT * bpLevel).add(1);
  const achievements = 1 + t.ACHIEVEMENT_PCT * state.achievementCount;
  const codex = 1 + t.CODEX_PCT * state.codexCount;

  const g: GlobalDerived = {
    passive: compostPassive.mul(ribbonPassive),
    compostPassive,
    ribbonPassive,
    achievements,
    codex,
    offlineCapSec: 3600 * Math.min(t.OFFLINE_CAP_MAX, t.OFFLINE_CAP_BASE + addOf(global['offline.cap'])),
    chestLuck: addOf(global['chest.luck']),
    insightGain: 1 + incTotal(global['insight.gain']),
    pollenGain: 1 + incTotal(global['pollen.gain']),
    pollenMaxedBonus: addOf(global['pollen.maxedBonus']),
    compostGain: 1 + incTotal(global['compost.gain']),
    hireFee: Math.max(t.HIRE_FEE_MULT_MIN, mulOf(global['hire.fee']) * redOf(global['hire.fee'])),
    cooldownReduction: Math.min(t.COOLDOWN_REDUCTION_CAP, addOf(global['manager.cooldown'])),
    heirloomSlots: t.HEIRLOOM_SLOTS_BASE + addOf(global['heirloom.slots']),
    planters: 1 + addOf(global['planter.count']),
    basketStore: t.BASKET_STORE + addOf(global['basket.store']),
    researchDesks: 1 + addOf(global['research.desks']),
    benchSlots: 1 + addOf(global['bench.slots']),
    benchSpeed: 1 + incTotal(global['bench.speed']),
    dewDuration: t.DEW_DURATION + addOf(global['dew.duration']),
    bumperFill: addOf(global['spurt.bumperFill']),
    visitorLifetime: t.VISITOR_LIFETIME + addOf(global['visitor.lifetime']),
    managerPower,
    heirloomPower,
    keystones,
    specials,
  };

  const worlds: WorldDerived[] = state.worlds.map((ws, w) => {
    const wa = world[w]!;
    const mastery = 1 + t.MASTERY_PCT * ws.stars;
    const floors: FloorDerived[] = ws.floors.map((f, i) => {
      const fa = floor[w]![i]!;
      const P: (Acc | undefined)[] = [global['floor.profit'], wa['floor.profit'], fa['floor.profit']];
      const parts: Record<string, number> = {};
      for (const b of BUCKETS) parts[b] = 1 + incOf(b, ...P);
      parts.multipliers = mulOf(...P);
      parts.achievements = achievements;
      parts.codex = codex;
      parts.mastery = mastery;
      const profit = bucketProduct(...P) * achievements * codex * mastery;
      const lv = managerLevel[w]![i]!;
      const manager = lv > 0 ? managerProfit(content.worlds[w]!.floors[i]!.manager.rarity, lv, managerPower, t) : 1;
      const S: (Acc | undefined)[] = [global['floor.speed'], wa['floor.speed'], fa['floor.speed']];
      const C: (Acc | undefined)[] = [global['floor.levelCost'], wa['floor.levelCost'], fa['floor.levelCost']];
      const floorDiscount = Math.max(-t.FLOOR_DISCOUNT_CAP, incOf('floor', ...C));
      let cost = (1 + floorDiscount) * mulOf(...C);
      for (const b of BUCKETS) if (b !== 'floor') cost *= 1 + incOf(b, ...C);
      return {
        manager,
        profit,
        speed: bucketProduct(...S),
        cost: Math.max(t.COST_MULT_FLOOR, cost),
        doubleChance: Math.min(1, addOf(global['floor.doubleChance'], wa['floor.doubleChance'], fa['floor.doubleChance'])),
        weather: content.worlds[w]!.twist === 'weather' ? weatherAverage(weatherGroups[w]![i]!, t) : 1,
        weatherGroups: weatherGroups[w]![i]!,
        parts,
      };
    });
    const eff = offlineEfficiency(
      addOf(global['offline.efficiency'], wa['offline.efficiency']),
      incTotal(global['offline.earnings'], wa['offline.earnings']),
      t,
    );
    return {
      towerMult: Math.min(t.TOWER_MILESTONE_CAP, t.TOWER_MILESTONE_MULT + addOf(global['tower.milestoneMult'], wa['tower.milestoneMult'])),
      mastery,
      tapPower: Math.min(t.TAP_POWER_CAP, bucketProduct(global['tap.power'], wa['tap.power'])),
      critChance: Math.min(t.CRIT_CHANCE_CAP, t.CRIT_CHANCE_BASE + addOf(global['tap.critChance'], wa['tap.critChance'])),
      critMult: Math.min(t.CRIT_MULT_CAP, t.CRIT_MULT_BASE + addOf(global['tap.critMult'], wa['tap.critMult'])),
      comboCap: Math.min(t.COMBO_CAP_MAX, t.COMBO_CAP_BASE + addOf(global['tap.comboCap'], wa['tap.comboCap'])),
      comboGrace: Math.min(t.COMBO_GRACE_CAP, t.COMBO_GRACE + addOf(global['tap.comboGrace'], wa['tap.comboGrace'])),
      spurtDuration: Math.min(t.SPURT_DURATION_CAP, t.SPURT_DURATION + addOf(global['spurt.duration'], wa['spurt.duration'])),
      spurtTaps: Math.max(t.SPURT_TAPS_MIN, t.SPURT_TAPS * redOf(global['spurt.tapsNeeded'], wa['spurt.tapsNeeded'])),
      spurtSpeed: Math.min(t.SPURT_SPEED_CAP, t.SPURT_SPEED + addOf(global['spurt.speed'], wa['spurt.speed'])),
      visitorInterval: Math.max(t.VISITOR_INTERVAL_MIN_MULT, redOf(global['visitor.interval'], wa['visitor.interval'])),
      windfall: 1 + addOf(global['visitor.reward'], wa['visitor.reward'], global['visitor.windfall'], wa['visitor.windfall']),
      offlineEfficiency: eff,
      offlineBonus: mulOf(global['offline.earnings'], wa['offline.earnings']),
      hires: ws.floors.reduce((n, f) => n + (f.hired && f.level > 0 ? 1 : 0), 0),
      floors,
    };
  });

  return { global: g, worlds };
}
