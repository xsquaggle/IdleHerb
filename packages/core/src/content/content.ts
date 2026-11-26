/**
 * The compiled content bundle the core runs on: validated rows with big
 * numbers parsed and the lookups the systems need. Built by `hydrateContent`
 * from the raw tables that packages/content reads and validates.
 */
import { Num, parseNum } from '../kernel/num/num';
import type {
  Ability, AchievementRow, ArtifactRow, ChestRow, CompostShopRow, Effect, Family, FairTable, ManagerRow, PlantRow,
  PoolQuestRow, Rarity, RawContent, ResearchRow, RibbonShopRow, SetRow, SkillRow, StoryRow, TraitRow, Tuning, UnlockRow,
} from './schema';

export interface FloorDef {
  id: string;
  worldIndex: number;
  /** 0-based position in the tower. */
  index: number;
  favouredFamily: Family | 'wild';
  openCost: Num;
  basePayout: Num;
  baseCycleSec: number;
  levelBaseCost: Num;
  growth: number;
  hireFee: Num;
  /** The manager who runs this floor (GDD 7.1). */
  manager: ManagerDef;
}

export interface WorldDef {
  id: string;
  /** 0-based. World 1 is index 0. */
  index: number;
  climate: string;
  currency: string;
  D: Num;
  T: number;
  compostK: number;
  ticket: Num | null;
  deedRibbons: number;
  twist: 'none' | 'customers' | 'weather' | 'heat' | 'bubbles' | 'sunrise';
  launch: boolean;
  floors: FloorDef[];
}

export interface ManagerDef extends ManagerRow {
  kind: 'manager';
  maxLevel: number;
  dupes: number[];
  /** 0-based world and floor of the manager's own floor. */
  world: number;
  floorIndex: number;
  /** The Exotic manager of a world's top floor (GDD 7.1 rule 8). */
  head: boolean;
}
export interface PlantDef extends PlantRow {
  kind: 'plant';
  maxLevel: number;
  dupes: number[];
  traitDefs: TraitRow[];
}
export type CardDef = ManagerDef | PlantDef;

export interface ArtifactDef extends ArtifactRow {
  maxLevel: number;
  dupes: number[];
}

export interface AbilityOwner {
  ability: Ability;
  ownerKind: 'manager' | 'artifact';
  ownerId: string;
}

export interface Content {
  tuning: Tuning;
  compostE0: Num;
  ribbonC0: Num;
  worlds: WorldDef[];
  managers: ManagerDef[];
  plants: PlantDef[];
  cards: Map<string, CardDef>;
  traits: Map<string, TraitRow>;
  chests: Map<string, ChestRow>;
  artifacts: ArtifactDef[];
  artifactById: Map<string, ArtifactDef>;
  sets: SetRow[];
  skills: SkillRow[];
  skillById: Map<string, SkillRow>;
  research: ResearchRow[];
  researchById: Map<string, ResearchRow>;
  compostShop: CompostShopRow[];
  ribbonShop: RibbonShopRow[];
  story: StoryRow[];
  daily: PoolQuestRow[];
  weekly: PoolQuestRow[];
  achievements: AchievementRow[];
  unlocks: UnlockRow[];
  fair: FairTable;
  fairSteps: Num[];
  abilities: Map<string, AbilityOwner>;
  /** Head Start money per level, before the world's cost scale. */
  headStart: Num[];
  /** Floor milestone thresholds as a function, so the ladder can be endless. */
  raw: RawContent;
}

export const RARITY_ORDER: Record<Rarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, exotic: 5 };

/** Turns validated raw tables into the runtime bundle. Throws on a broken reference. */
export function hydrateContent(raw: RawContent): Content {
  const curves = new Map(raw.dupeCurves.map((c) => [c.id, c.copies]));
  const curve = (id: string): number[] => {
    const c = curves.get(id);
    if (!c) throw new Error(`content: missing dupe curve ${id}`);
    return c;
  };
  const traits = new Map(raw.traits.map((t) => [t.id, t]));

  const worlds: WorldDef[] = [...raw.worlds]
    .sort((a, b) => a.order - b.order)
    .map((w, index) => {
      if (w.order !== index + 1) throw new Error(`content: world order must be 1..n without gaps (${w.id})`);
      const floors = raw.floors
        .filter((f) => f.world === w.id)
        .sort((a, b) => a.order - b.order)
        .map((f, i): Omit<FloorDef, 'manager'> => {
          if (f.order !== i + 1) throw new Error(`content: floor order must be 1..n without gaps (${f.id})`);
          return {
            id: f.id,
            worldIndex: index,
            index: i,
            favouredFamily: f.favouredFamily,
            openCost: parseNum(String(f.openCost)),
            basePayout: parseNum(String(f.basePayout)),
            baseCycleSec: f.baseCycleSec,
            levelBaseCost: parseNum(String(f.levelCost.base)),
            growth: f.levelCost.growth,
            hireFee: parseNum(String(f.hireFee)),
          };
        });
      if (floors.length !== w.floors) throw new Error(`content: ${w.id} declares ${w.floors} floors but has ${floors.length}`);
      // The managers are attached below, once they are built.
      const floorDefs = floors as FloorDef[];
      return {
        id: w.id,
        index,
        climate: w.climate,
        currency: w.currency,
        D: parseNum(String(w.D)),
        T: w.T,
        compostK: w.compostK,
        ticket: w.ticket === null ? null : parseNum(String(w.ticket)),
        deedRibbons: w.deedRibbons,
        twist: w.twist,
        launch: w.launch,
        floors: floorDefs,
      };
    });

  const managers: ManagerDef[] = raw.managers.map((m) => {
    const dupes = curve(`curve.dupes.${m.rarity}`);
    let floor: FloorDef | undefined;
    for (const w of worlds) floor ??= w.floors.find((f) => f.id === m.floor);
    if (!floor) throw new Error(`content: ${m.id} names unknown floor ${m.floor}`);
    if (floor.manager) throw new Error(`content: ${m.floor} has two managers (${floor.manager.id} and ${m.id})`);
    const head = floor.index === worlds[floor.worldIndex]!.floors.length - 1;
    if (head !== (m.rarity === 'exotic')) throw new Error(`content: ${m.id}: the Exotic managers are the Heads of the top floors, and only they`);
    const def: ManagerDef = { ...m, kind: 'manager', dupes, maxLevel: dupes.length + 1, world: floor.worldIndex, floorIndex: floor.index, head };
    floor.manager = def;
    return def;
  });
  for (const w of worlds) for (const f of w.floors) if (!f.manager) throw new Error(`content: ${f.id} has no manager`);
  const plants: PlantDef[] = raw.plants.map((p) => {
    const dupes = curve(`curve.dupes.${p.rarity}`);
    const traitDefs = p.traits.map((id) => {
      const t = traits.get(id);
      if (!t) throw new Error(`content: ${p.id} names unknown trait ${id}`);
      return t;
    });
    return { ...p, kind: 'plant', dupes, maxLevel: dupes.length + 1, traitDefs };
  });
  const cards = new Map<string, CardDef>();
  for (const c of [...managers, ...plants]) {
    if (cards.has(c.id)) throw new Error(`content: duplicate card id ${c.id}`);
    cards.set(c.id, c);
  }
  for (const p of plants) {
    for (const parent of p.parents ?? []) if (!cards.has(parent)) throw new Error(`content: ${p.id} names unknown parent ${parent}`);
  }

  const artifacts: ArtifactDef[] = raw.artifacts.map((a) => {
    const dupes = curve(`curve.heirloom.${a.rarity}`);
    return { ...a, dupes, maxLevel: dupes.length + 1 };
  });
  const setIds = new Set(raw.sets.map((s) => s.id));
  for (const a of artifacts) if (!setIds.has(a.set)) throw new Error(`content: ${a.id} names unknown set ${a.set}`);

  const abilities = new Map<string, AbilityOwner>();
  for (const m of managers) if (m.ability) abilities.set(m.ability.id, { ability: m.ability, ownerKind: 'manager', ownerId: m.id });
  for (const a of artifacts) if (a.ability) abilities.set(a.ability.id, { ability: a.ability, ownerKind: 'artifact', ownerId: a.id });

  const researchById = new Map(raw.research.map((r) => [r.id, r]));
  for (const r of raw.research) for (const req of r.requires) if (!researchById.has(req)) throw new Error(`content: ${r.id} requires unknown ${req}`);

  const headStartRow = raw.compostShop.find((s) => s.special === 'shop.head_start');
  const headStart = ((headStartRow?.params?.start as (string | number)[] | undefined) ?? []).map((v) => parseNum(String(v)));

  return {
    tuning: raw.tuning,
    compostE0: parseNum(String(raw.tuning.COMPOST_E0)),
    ribbonC0: parseNum(String(raw.tuning.RIBBON_C0)),
    worlds,
    managers,
    plants,
    cards,
    traits,
    chests: new Map(raw.chests.map((c) => [c.id, c])),
    artifacts,
    artifactById: new Map(artifacts.map((a) => [a.id, a])),
    sets: raw.sets,
    skills: raw.skills,
    skillById: new Map(raw.skills.map((s) => [s.id, s])),
    research: raw.research,
    researchById,
    compostShop: raw.compostShop,
    ribbonShop: raw.ribbonShop,
    story: [...raw.story].sort((a, b) => a.n - b.n),
    daily: raw.daily,
    weekly: raw.weekly,
    achievements: raw.achievements,
    unlocks: [...raw.unlocks].sort((a, b) => a.n - b.n),
    fair: raw.fair,
    fairSteps: raw.fair.track.map((s) => parseNum(String(s.tickets))),
    abilities,
    headStart,
    raw,
  };
}

/** Chest-drop effect helper used by several systems. */
export function effectScope(e: Effect): 'floor' | 'adjacent' | 'world' | 'global' {
  return e.scope ?? 'global';
}
