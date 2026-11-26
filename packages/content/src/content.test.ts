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
    const all = ['p1-levels', 'p2-taps', 'p4-gates'].map((id) => readOverlay(join(PROPOSALS, `${id}.yaml`)));
    expect(() => loadContent({ overlays: all })).not.toThrow();
  });

  it('rejects an overlay with a typo in a row id', () => {
    expect(() => loadContent({ overlays: [{ id: 'typo', rows: { worlds: { 'world.w9': { ticket: '1' } } } }] })).toThrow();
  });
});
