/**
 * Reset layers as a list (GDD 12; design 0.5, EXPANSION 7 and 15.1 item 6). tables/resets/layers.yaml
 * holds one row per layer; this file names the parts a row can use and checks the rows against them.
 * The core (game.ts) runs a layer by walking its row: claim the gain, count it, give the grants, then
 * run the reset steps. So New Generation and Big Bloom are rows plus a few new named steps, never a
 * second reset path.
 */
import { Num, parseNum } from '../../kernel/num/num';
import type { ResetLayerRow, Tuning } from '../../content/schema';

/** Steps run once per reset, on the whole save. */
export const SAVE_STEPS = ['compost', 'compostShop', 'records', 'focus', 'combo', 'visitors'] as const;
/** Steps run for each world in the layer's scope. */
export const WORLD_STEPS = ['era', 'run', 'lock'] as const;
/** Numbers a layer reads its gain from and adds its gain to. `world.` ones are per world. */
export const LAYER_COUNTERS = ['world.lifetime', 'world.claimed', 'compost', 'compostEra', 'compostAllTime', 'ribbons', 'ribbonsClaimed'] as const;
/** Counts of how often something happened, raised by one per reset. */
export const LAYER_TALLIES = ['world.replantsEra', 'world.replantsEver', 'replants', 'festivals'] as const;
/** What a reset can give. */
export const GRANT_STEPS = ['compostRecordXp', 'replantChest', 'respec', 'chest', 'heirloomPick'] as const;
/** World columns a gain can be scaled by, and global stats it can be multiplied by. */
export const GAIN_SCALES = ['compostK'] as const;
export const GAIN_STATS = ['compostGain'] as const;

export type SaveStep = (typeof SAVE_STEPS)[number];
export type WorldStep = (typeof WORLD_STEPS)[number];
export type LayerCounter = (typeof LAYER_COUNTERS)[number];
export type LayerTally = (typeof LAYER_TALLIES)[number];
export type GrantStep = (typeof GRANT_STEPS)[number];
export type GainScale = (typeof GAIN_SCALES)[number];
export type GainStat = (typeof GAIN_STATS)[number];

export type LayerGrant = ResetLayerRow['grants'][number] & { step: GrantStep };

/** A layer row with its tuning keys looked up. Rows that are not enabled keep their names unchecked. */
export interface ResetLayer {
  id: string;
  order: number;
  enabled: boolean;
  scope: 'world' | 'save';
  currency: string;
  source: LayerCounter;
  claimed: LayerCounter;
  base: Num;
  exp: number;
  scale: GainScale | null;
  stat: GainStat | null;
  claim: LayerCounter[];
  tally: LayerTally[];
  times: LayerTally;
  first: number;
  needsTopFloor: boolean;
  needsWorld: number;
  grants: LayerGrant[];
  resets: { save: SaveStep[]; world: WorldStep[] };
  row: ResetLayerRow;
}

/** total = floor(scale x (source / base) ^ exp). Nothing earned gives nothing. */
export function layerTotal(source: Num, base: Num, exp: number, scale: number): Num {
  if (source.lte(0)) return Num.ZERO;
  const t = source.div(base).pow(exp);
  return (scale === 1 ? t : t.mul(scale)).floor();
}

const has = <T extends string>(list: readonly T[], v: string | null): v is T => v !== null && (list as readonly string[]).includes(v);

/** Checks the rows and looks up their tuning keys. Throws on a broken row. */
export function hydrateResetLayers(rows: ResetLayerRow[], tuning: Tuning, chestIds: Set<string>): ResetLayer[] {
  const t = tuning as unknown as Record<string, unknown>;
  const ids = new Set<string>();
  let lastOrder = 0;
  return rows.map((row) => {
    const where = `content: reset layer ${row.id}`;
    if (ids.has(row.id)) throw new Error(`${where} is listed twice`);
    ids.add(row.id);
    if (row.order <= lastOrder) throw new Error(`${where} is out of order`);
    lastOrder = row.order;

    // Every built step is named once, under resets or keeps, in every row.
    for (const [part, built] of [['save', SAVE_STEPS], ['world', WORLD_STEPS]] as const) {
      const named = [...row.resets[part], ...row.keeps[part]];
      for (const step of built) {
        const n = named.filter((x) => x === step).length;
        if (n !== 1) throw new Error(`${where} names the ${part} step ${step} ${n} times; it must be under resets or keeps exactly once`);
      }
    }

    const num = (ref: string | number, what: string): number => {
      if (typeof ref === 'number') return ref;
      const v = t[ref];
      if (typeof v === 'number') return v;
      if (typeof v === 'string' && Number.isFinite(Number(v))) return Number(v);
      if (row.enabled) throw new Error(`${where}: ${what} ${ref} is not a tuning number`);
      return NaN;
    };
    const big = (ref: string | number, what: string): Num => {
      const v = typeof ref === 'number' ? ref : t[ref];
      if (typeof v === 'string' || typeof v === 'number') return parseNum(String(v));
      if (row.enabled) throw new Error(`${where}: ${what} ${ref} is not a tuning number`);
      return Num.ZERO;
    };

    if (row.enabled) {
      const bad: string[] = [];
      const check = (ok: boolean, what: string) => ok || bad.push(what);
      for (const step of row.resets.save) check(has(SAVE_STEPS, step), `save step ${step}`);
      for (const step of row.resets.world) check(has(WORLD_STEPS, step), `world step ${step}`);
      for (const c of [row.gain.source, row.gain.claimed, ...row.claim]) check(has(LAYER_COUNTERS, c), `counter ${c}`);
      for (const c of [...row.tally, row.times]) check(has(LAYER_TALLIES, c), `tally ${c}`);
      check(row.gain.scale === null || has(GAIN_SCALES, row.gain.scale), `scale ${row.gain.scale}`);
      check(row.gain.stat === null || has(GAIN_STATS, row.gain.stat), `stat ${row.gain.stat}`);
      for (const g of row.grants) {
        check(has(GRANT_STEPS, g.step), `grant ${g.step}`);
        for (const c of [g.chest, g.first, g.every?.chest]) if (c) check(chestIds.has(c), `chest ${c}`);
      }
      if (row.scope === 'world') check(row.gain.source.startsWith('world.') && row.gain.claimed.startsWith('world.'), 'a world layer reads world counters');
      if (bad.length) throw new Error(`${where} is enabled but uses what is not built: ${bad.join(', ')}`);
    }

    return {
      id: row.id,
      order: row.order,
      enabled: row.enabled,
      scope: row.scope,
      currency: row.currency,
      source: row.gain.source as LayerCounter,
      claimed: row.gain.claimed as LayerCounter,
      base: big(row.gain.base, 'base'),
      exp: num(row.gain.exp, 'exp'),
      scale: row.gain.scale as GainScale | null,
      stat: row.gain.stat as GainStat | null,
      claim: row.claim as LayerCounter[],
      tally: row.tally as LayerTally[],
      times: row.times as LayerTally,
      first: num(row.first, 'first'),
      needsTopFloor: row.needs.topFloorOpen ?? false,
      needsWorld: row.needs.worldReached === undefined ? 0 : num(row.needs.worldReached, 'worldReached'),
      grants: row.grants as LayerGrant[],
      resets: row.resets as { save: SaveStep[]; world: WorldStep[] },
      row,
    };
  });
}
