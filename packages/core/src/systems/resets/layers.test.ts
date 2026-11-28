/**
 * Reset layers are a list (design 0.5, EXPANSION 15.1 item 6): Replant and the Harvest Festival are
 * rows of tables/resets/layers.yaml, New Generation and Big Bloom are rows waiting to be enabled, and
 * a new layer needs no new reset code.
 */
import { loadContent, loadRaw } from '@sprout/content';
import { describe, expect, it } from 'vitest';
import { hydrateContent } from '../../content/content';
import type { ResetLayerRow } from '../../content/schema';
import { Num } from '../../kernel/num/num';
import { Game } from '../../game/game';
import type { GameEvent } from '../../game/types';

const content = loadContent();

/** A save whose first world has earned enough for a Replant. */
function readyToReplant(): Game {
  const g = new Game({ content, seed: 11 });
  const ws = g.state.worlds[0]!;
  ws.lifetime = Num.from(1e16);
  ws.floors[ws.floors.length - 1]!.level = 1;
  return g;
}

describe('reset layers', () => {
  it('holds the four layers in order, with the last two not offered yet', () => {
    expect(content.resetLayers.map((l) => [l.id, l.enabled])).toEqual([
      ['replant', true],
      ['festival', true],
      ['new_generation', false],
      ['big_bloom', false],
    ]);
    const g = new Game({ content, seed: 1 });
    g.state.worldReached = 6;
    expect(g.canReset('new_generation')).toBe(false);
    expect(g.canReset('big_bloom')).toBe(false);
    expect(g.dispatch({ type: 'reset', layer: 'big_bloom' })).toBe(false);
  });

  it('takes a Replant by walking its row, the same as the replant command', () => {
    const a = readyToReplant();
    const b = readyToReplant();
    const pending = a.pendingCompost(0);
    expect(pending.gte(content.tuning.FIRST_REPLANT_MIN)).toBe(true);
    const events: GameEvent[] = [];
    a.on((e) => events.push(e));
    expect(a.dispatch({ type: 'replant', world: 0 })).toBe(true);
    expect(b.dispatch({ type: 'reset', layer: 'replant', world: 0 })).toBe(true);
    expect(a.state.compost.eq(pending)).toBe(true);
    expect(a.state.worlds[0]!.claimed.eq(pending)).toBe(true);
    expect(a.counter('replants')).toBe(1);
    expect(a.state.worlds[0]!.lifetime.eq(Num.from(1e16))).toBe(true);
    expect(a.state.compost.eq(b.state.compost) && a.state.compostRecordPow === b.state.compostRecordPow).toBe(true);
    const reset = events.find((e) => e.type === 'reset');
    expect(reset && reset.type === 'reset' && reset.layer === 'replant' && reset.n === 1).toBe(true);
  });

  it('refuses a row that forgets a step, or an enabled row that uses something not built', () => {
    const raw = loadRaw();
    const forget = raw.resetLayers.map((r) => (r.id === 'festival' ? { ...r, resets: { ...r.resets, save: r.resets.save.filter((x) => x !== 'visitors') } } : r));
    expect(() => hydrateContent({ ...raw, resetLayers: forget })).toThrow(/visitors/);
    const early = raw.resetLayers.map((r) => (r.id === 'new_generation' ? { ...r, enabled: true } : r));
    expect(() => hydrateContent({ ...raw, resetLayers: early })).toThrow(/not built/);
  });

  it('runs a new layer that is only a row', () => {
    const raw = loadRaw();
    const toy: ResetLayerRow = {
      id: 'toy',
      order: 9,
      enabled: true,
      scope: 'save',
      currency: 'ribbons',
      gain: { source: 'compostAllTime', claimed: 'ribbonsClaimed', base: 1, exp: 1, scale: null, stat: null },
      claim: ['ribbonsClaimed'],
      tally: ['festivals'],
      times: 'festivals',
      first: 1,
      needs: {},
      grants: [{ step: 'respec', count: 2 }],
      resets: { save: ['combo', 'visitors'], world: [] },
      keeps: { save: ['compost', 'compostShop', 'records', 'focus'], world: ['era', 'run', 'lock'] },
    };
    const c = hydrateContent({ ...raw, resetLayers: [...raw.resetLayers, toy] });
    const g = new Game({ content: c, seed: 2 });
    const s = g.state;
    s.compostAllTime = Num.from(10);
    s.compost = Num.from(4);
    s.combo = 5;
    const respecs = s.freeRespecs;
    expect(g.dispatch({ type: 'reset', layer: 'toy' })).toBe(true);
    expect(s.ribbonsClaimed.eq(10)).toBe(true);
    expect(s.freeRespecs).toBe(respecs + 2);
    expect(s.combo).toBe(0);
    expect(s.compost.eq(4)).toBe(true);
    expect(g.dispatch({ type: 'reset', layer: 'toy' })).toBe(false);
  });
});
