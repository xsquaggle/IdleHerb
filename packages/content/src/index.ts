/**
 * @sprout/content: reads the YAML tables, checks them against the schemas in
 * @sprout/core and hands back the compiled bundle the core runs on
 * (docs/tech/04-content-pipeline.md).
 *
 * The balance simulator also uses this module to try out number changes
 * without touching the tables: a "proposal" is a small YAML overlay that is
 * merged over the raw tables before validation (see apps/sim/proposals/).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { Num, RawContentSchema, hydrateContent, numToSave, type Content, type RawContent } from '@sprout/core';
import { generateFloors, type FloorTemplate, type GeneratedFloor } from './floor-template';

export { generateFloors, type FloorTemplate, type GeneratedFloor } from './floor-template';

const here = dirname(fileURLToPath(import.meta.url));
export const TABLES_DIR = join(here, '../tables');

/** A proposal: named changes laid over the tables. Every key is optional. */
export interface Overlay {
  id: string;
  title?: string;
  /** Why the change is proposed. Shown in the balance report. */
  why?: string;
  /** Keys of tuning.yaml to replace. Objects merge, arrays and values are replaced. */
  tuning?: Record<string, unknown>;
  /** Rows to patch by id, per table: { worlds: { "world.w2": { T: 0.92 } } }. */
  rows?: Record<string, Record<string, Record<string, unknown>>>;
  /** Keys of floors/template.yaml to replace. Floors are generated again from it. */
  floorTemplate?: Record<string, unknown>;
  /** Keys of events/fair.yaml to replace. */
  fair?: Record<string, unknown>;
}

function readYaml(path: string): unknown {
  return parse(readFileSync(path, 'utf8'));
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Objects merge key by key. Anything else (numbers, text, arrays) is replaced. */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isObject(base) || !isObject(patch)) return patch as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = k in out ? deepMerge(out[k], v) : v;
  return out as T;
}

/** Reads every table as written, with no validation yet. */
export function readTables(dir: string = TABLES_DIR): Record<string, unknown> {
  const floorsDir = join(dir, 'floors');
  const floorFiles = readdirSync(floorsDir)
    .filter((f) => /^w\d+\.yaml$/.test(f))
    .sort();
  const floors = floorFiles.flatMap((f) => readYaml(join(floorsDir, f)) as unknown[]);
  const fair = readYaml(join(dir, 'events/fair.yaml'));
  return {
    tuning: readYaml(join(dir, 'tuning.yaml')),
    worlds: readYaml(join(dir, 'worlds/worlds.yaml')),
    floors,
    floorTemplate: readYaml(join(floorsDir, 'template.yaml')),
    managers: readYaml(join(dir, 'cards/managers.yaml')),
    traits: readYaml(join(dir, 'plants/traits.yaml')),
    plants: readYaml(join(dir, 'plants/plants.yaml')),
    dupeCurves: readYaml(join(dir, 'cards/dupe-curves.yaml')),
    chests: readYaml(join(dir, 'chests/chests.yaml')),
    artifacts: readYaml(join(dir, 'artifacts/artifacts.yaml')),
    sets: readYaml(join(dir, 'artifacts/sets.yaml')),
    skills: readYaml(join(dir, 'skills/tree.yaml')),
    research: readYaml(join(dir, 'research/tree.yaml')),
    compostShop: readYaml(join(dir, 'resets/rebirth.yaml')),
    ribbonShop: readYaml(join(dir, 'resets/prestige.yaml')),
    story: readYaml(join(dir, 'quests/story.yaml')),
    daily: readYaml(join(dir, 'quests/daily.yaml')),
    weekly: readYaml(join(dir, 'quests/weekly.yaml')),
    achievements: readYaml(join(dir, 'achievements.yaml')),
    unlocks: readYaml(join(dir, 'unlocks.yaml')),
    fair,
  };
}

function showNum(n: Num): string | number {
  if (n.lt(1e15)) return Number(n.toNumber().toPrecision(15));
  return numToSave(n);
}

/** Floor rows in table form, from the template and the world rows (GDD 5.3). */
export function floorRowsFromTemplate(template: FloorTemplate, worlds: { id: string; D: string | number; T: number; floors: number }[]): unknown[] {
  const rows: unknown[] = [];
  for (const w of worlds) {
    const made: GeneratedFloor[] = generateFloors(template, { id: w.id, D: Num.from(String(w.D)), T: w.T, floors: w.floors });
    for (const r of made) {
      rows.push({
        id: r.id,
        world: w.id,
        order: r.order,
        favouredFamily: r.favouredFamily,
        openCost: showNum(r.openCost),
        basePayout: showNum(r.basePayout),
        baseCycleSec: r.baseCycleSec,
        levelCost: { base: showNum(r.levelBaseCost), growth: r.growth },
        hireFee: showNum(r.hireFee),
      });
    }
  }
  return rows;
}

/** Lays one overlay over raw tables. Unknown tables or row ids are errors, so a typo cannot pass silently. */
export function applyOverlay(tables: Record<string, unknown>, overlay: Overlay): Record<string, unknown> {
  const out: Record<string, unknown> = { ...tables };
  if (overlay.tuning) {
    const tuning = out.tuning as Record<string, unknown>;
    for (const key of Object.keys(overlay.tuning)) if (!(key in tuning)) throw new Error(`overlay ${overlay.id}: tuning has no key ${key}`);
    out.tuning = deepMerge(tuning, overlay.tuning);
  }
  if (overlay.fair) out.fair = deepMerge(out.fair, overlay.fair);
  let floorsStale = false;
  if (overlay.floorTemplate) {
    out.floorTemplate = deepMerge(out.floorTemplate, overlay.floorTemplate);
    floorsStale = true;
  }
  for (const [table, patches] of Object.entries(overlay.rows ?? {})) {
    const rows = out[table];
    if (!Array.isArray(rows)) throw new Error(`overlay ${overlay.id}: no row table called ${table}`);
    const next = rows.map((r) => ({ ...(r as Record<string, unknown>) }));
    for (const [id, patch] of Object.entries(patches)) {
      const at = next.findIndex((r) => r.id === id);
      if (at < 0) throw new Error(`overlay ${overlay.id}: ${table} has no row ${id}`);
      next[at] = deepMerge(next[at]!, patch);
    }
    out[table] = next;
    if (table === 'worlds') floorsStale = true;
  }
  if (floorsStale) {
    out.floors = floorRowsFromTemplate(
      out.floorTemplate as FloorTemplate,
      out.worlds as { id: string; D: string | number; T: number; floors: number }[],
    );
  }
  return out;
}

export function readOverlay(path: string): Overlay {
  const o = readYaml(path) as Overlay;
  if (!o || typeof o.id !== 'string') throw new Error(`overlay ${path}: needs an id`);
  return o;
}

/** Validates raw tables. Throws with every problem listed, one per line. */
export function validateTables(tables: Record<string, unknown>): RawContent {
  const parsed = RawContentSchema.safeParse(tables);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`);
    throw new Error(`content: ${lines.length} problem(s) in the tables\n${lines.join('\n')}`);
  }
  return parsed.data;
}

export interface LoadOptions {
  dir?: string;
  overlays?: Overlay[];
}

/** Reads, overlays, validates and compiles the tables. */
export function loadContent(opts: LoadOptions = {}): Content {
  let tables = readTables(opts.dir);
  for (const o of opts.overlays ?? []) tables = applyOverlay(tables, o);
  return hydrateContent(validateTables(tables));
}

/** The raw tables after overlays, for tools that want to show what changed. */
export function loadRaw(opts: LoadOptions = {}): RawContent {
  let tables = readTables(opts.dir);
  for (const o of opts.overlays ?? []) tables = applyOverlay(tables, o);
  return validateTables(tables);
}
