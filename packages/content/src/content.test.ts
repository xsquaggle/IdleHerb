import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TABLES_DIR, floorRowsFromTemplate, loadContent, readOverlay, readTables, type FloorTemplate } from './index';

const PROPOSALS = join(TABLES_DIR, '../../../apps/sim/proposals');

describe('content tables', () => {
  it('validate and compile', () => {
    const c = loadContent();
    expect(c.worlds.length).toBe(6);
    expect(c.unlocks.length).toBe(31);
    expect(c.managers.filter((m) => m.launch).length).toBe(34);
  });

  it('floor tables are exactly what the template generates', () => {
    const t = readTables();
    const made = floorRowsFromTemplate(t.floorTemplate as FloorTemplate, t.worlds as { id: string; D: string; T: number; floors: number }[]);
    const norm = (rows: unknown[]): unknown[] => JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === 'number' ? Number(v.toPrecision(12)) : typeof v === 'string' && /^[\d.]+e\d+$/.test(v) ? Number(Number(v).toPrecision(12)) : v)));
    const want = norm(made) as { id: string }[];
    const have = norm(t.floors as unknown[]) as { id: string }[];
    expect(have.map((r) => r.id)).toEqual(want.map((r) => r.id));
    for (let i = 0; i < want.length; i++) expect(have[i]).toMatchObject(want[i]!);
  });

  it('every proposal overlay applies and still validates', () => {
    const files = readdirSync(PROPOSALS).filter((f) => f.endsWith('.yaml') && !f.startsWith('tmp-'));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(() => loadContent({ overlays: [readOverlay(join(PROPOSALS, f))] })).not.toThrow();
  });

  it('adds new rows and gives a world its own Mastery levels', () => {
    const base = loadContent();
    const c = loadContent({
      overlays: [{
        id: 'add',
        addRows: { research: [{ id: 'research.soil.test_row', lane: 'soil', requires: ['research.soil.soil_science_1'], cost: 10, timeSec: 60, effect: { stat: 'floor.profit', op: 'mul', value: 2 } }] },
        rows: { worlds: { 'world.w2': { mastery: [25, 50, 75, 100, 125, 150, 175, 200, 225, 250] } } },
      }],
    });
    expect(c.research.length).toBe(base.research.length + 1);
    expect(c.worlds[1]!.mastery).toEqual([25, 50, 75, 100, 125, 150, 175, 200, 225, 250]);
    expect(c.worlds[0]!.mastery).toEqual(base.worlds[0]!.mastery);
    // A row id that already exists, or levels that do not rise, are errors.
    expect(() => loadContent({ overlays: [{ id: 'dup', addRows: { research: [{ id: 'research.soil.soil_science_1' }] } }] })).toThrow();
    expect(() => loadContent({ overlays: [{ id: 'fall', rows: { worlds: { 'world.w2': { mastery: [50, 25, 75, 100, 125, 150, 175, 200, 225, 250] } } } }] })).toThrow();
  });

  it('holds the design 0.4 numbers (CHANGES.md part B)', () => {
    const c = loadContent();
    const t = c.tuning;
    expect([t.FIRST_REPLANT_MIN, Number(t.RIBBON_C0), t.XP_DAILY, t.XP_DAILY_ALL]).toEqual([440, 900000, 1000, 1000]);
    expect(t.XP_ACHIEVEMENT).toEqual([100, 200, 400, 750, 1500]);
    expect(c.worlds.map((w) => (w.ticket ? Number(w.ticket.toNumber().toPrecision(12)) : null))).toEqual([3e23, 4.5e23, 1e25, 3e30, 3e35, null]);
    expect(c.worlds[5]!.mastery).toEqual([100, 150, 175, 200, 225, 250, 300, 325, 375, 400]);
    // Research: 48 projects, 808,900 Insight and 1,354 hours in all (CONTENT 6).
    expect(c.research.length).toBe(48);
    expect(c.research.reduce((a, r) => a + r.cost, 0)).toBe(808900);
    expect(Math.round(c.research.reduce((a, r) => a + r.timeSec, 0) / 3600)).toBe(1354);
    // The Ribbon Shop's fixed items (every one but Blue Ribbon Polish) cost 3,600 Ribbons (GDD 18).
    const fixed = c.ribbonShop.filter((r) => r.id !== 'shop.ribbon.blue_polish');
    expect(fixed.reduce((a, r) => a + (r.costs ?? []).reduce((x, y) => x + y, 0), 0)).toBe(3600);
  });

  it('rejects an overlay with a typo in a row id', () => {
    expect(() => loadContent({ overlays: [{ id: 'typo', rows: { worlds: { 'world.w9': { ticket: '1' } } } }] })).toThrow();
  });
});
