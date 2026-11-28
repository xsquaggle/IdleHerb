/**
 * The economy core under a simulated player: saves, ticks, offline time and a
 * two-day soak with no NaN, no Infinity and no Boost above its cap.
 */
import { Num, createGame, deserializeState, serializeState, type Game } from '@sprout/core';
import { loadContent } from '@sprout/content';
import { describe, expect, it } from 'vitest';
import { Bot } from './bot';
import { DEFAULT_STYLE, PROFILES } from './profiles';
import { runSim } from './run';

const content = loadContent();

/** A game after `minutes` of active play by the simulated player. */
function played(minutes: number): Game {
  const g = createGame({ content, seed: 3, debug: true });
  const bot = new Bot(g, PROFILES.active, DEFAULT_STYLE, 6);
  bot.sessionStart(minutes * 60);
  for (let s = 0; s < minutes * 60; s++) {
    g.advance(1);
    bot.tick(1);
  }
  bot.sessionEnd();
  return g;
}

const fork = (g: Game): Game => createGame({ content, seed: 3, debug: true, state: deserializeState(serializeState(g.state)) });
const life = (g: Game): Num => g.state.worlds.reduce((a, w) => a.add(w.lifetime), Num.ZERO);
const rel = (a: Num, b: Num): number => Math.abs(a.sub(b).div(b).toNumber());

describe('economy core under play', () => {
  const g = played(40);

  it('a save reads back to the same state', () => {
    const text = serializeState(g.state);
    expect(serializeState(deserializeState(text))).toBe(text);
    expect(serializeState(fork(g).state)).toBe(text);
  });

  it('a loaded save carries on exactly like the original', () => {
    const a = fork(g);
    const b = fork(g);
    for (let s = 0; s < 600; s++) {
      a.advance(1);
      b.advance(1);
    }
    expect(serializeState(a.state)).toBe(serializeState(b.state));
  });

  it('ten one-second ticks earn what one ten-second tick earns', () => {
    const a = fork(g);
    const b = fork(g);
    for (let s = 0; s < 600; s++) a.advance(1);
    for (let s = 0; s < 60; s++) b.advance(10);
    expect(rel(life(a), life(b))).toBeLessThan(1e-3);
  });

  it('offline time pays in proportion to time away, up to the cap and not past it', () => {
    const before = life(g);
    const gain = (hours: number): Num => {
      const x = fork(g);
      x.fastForward(hours * 3600 * 1000);
      return life(x).sub(before);
    };
    const cap = g.derived.global.offlineCapSec / 3600;
    const one = gain(cap / 4);
    const two = gain(cap / 2);
    expect(one.gt(0)).toBe(true);
    expect(rel(two, one.mul(2))).toBeLessThan(0.02);
    expect(rel(gain(cap + 5), gain(cap + 10))).toBeLessThan(1e-9);
  });

  it('two days of active play stay finite, inside the Boost cap and on schedule', () => {
    const r = runSim({ content, profile: PROFILES.active, style: DEFAULT_STYLE, seed: 1, days: 2, maxWorld: 6, rules: 'test' });
    for (const s of r.samples) {
      for (const w of s.worlds) if (w.life !== null) expect(Number.isFinite(w.life)).toBe(true);
      expect(Number.isFinite(s.tapFactor6)).toBe(true);
    }
    for (const s of r.sessions) expect(s.boost).toBeLessThanOrEqual(content.tuning.BOOST_CAP + 1e-9);
    expect(r.timeline.some((e) => e.kind === 'replant')).toBe(true);
    expect(r.timeline.some((e) => e.kind === 'world' && e.world === 1)).toBe(true);
  });
});

describe('the Auto-Gardener keeps a world going (CONTENT 8, design 0.4)', () => {
  // At 50 minutes the simulated player has Replanted once and has Compost pending again.
  const g = played(50);
  /** The 50-minute game with the Auto-Gardener owned, every switch on as it starts. */
  const withGardener = (): Game => {
    const state = deserializeState(serializeState(g.state));
    state.ribbonShop['shop.ribbon.auto_gardener'] = 1;
    return createGame({ content, seed: 3, debug: true, state });
  };
  const minutesAlone = (x: Game, minutes: number): void => {
    for (let s = 0; s < minutes * 60; s++) x.advance(1);
  };

  it('starts with every switch on', () => {
    const x = withGardener();
    for (const ws of x.state.worlds) for (const f of ws.floors) expect(f.autoBuy).toBe(true);
  });

  it('keeps floor 1 hired through a Replant with no fee and opens floors on its own', () => {
    const x = withGardener();
    expect(x.dispatch({ type: 'replant', world: 0 })).toBe(true);
    const ws = x.state.worlds[0]!;
    expect(ws.floors[0]!.hired).toBe(true);
    const coins = ws.coins;
    x.advance(1);
    expect(ws.coins.gte(coins)).toBe(true);
    minutesAlone(x, 10);
    expect(ws.floors[1]!.level).toBeGreaterThan(0);
  });

  it("with the world's switches off, a Replanted world with no hired manager stands still", () => {
    const x = withGardener();
    expect(x.dispatch({ type: 'setAutoBuy', on: false, world: 0 })).toBe(true);
    expect(x.dispatch({ type: 'replant', world: 0 })).toBe(true);
    const ws = x.state.worlds[0]!;
    expect(ws.floors[0]!.hired).toBe(false);
    minutesAlone(x, 10);
    expect(ws.floors[1]!.level).toBe(0);
  });

  it('a floor whose switch is off is not levelled; the others are', () => {
    const x = withGardener();
    const ws = x.state.worlds[0]!;
    const open = ws.floors.map((f, i) => (f.level > 0 ? i : -1)).filter((i) => i >= 0);
    expect(open.length).toBeGreaterThan(1);
    const off = open[open.length - 1]!;
    expect(x.dispatch({ type: 'setAutoBuy', on: false, world: 0, floor: off })).toBe(true);
    const before = ws.floors.map((f) => f.level);
    minutesAlone(x, 10);
    expect(ws.floors[off]!.level).toBe(before[off]);
    expect(open.some((i) => i !== off && ws.floors[i]!.level > before[i]!)).toBe(true);
  });

  it('reads a save with no floor switches as every switch on', () => {
    const state = deserializeState(serializeState(g.state));
    state.ribbonShop['shop.ribbon.auto_gardener'] = 1;
    for (const ws of state.worlds) for (const f of ws.floors) delete (f as { autoBuy?: boolean }).autoBuy;
    const x = createGame({ content, seed: 3, debug: true, state });
    expect(x.dispatch({ type: 'replant', world: 0 })).toBe(true);
    expect(x.state.worlds[0]!.floors[0]!.hired).toBe(true);
  });

  it('refuses a switch for a world or floor that does not exist', () => {
    const x = withGardener();
    expect(x.dispatch({ type: 'setAutoBuy', on: false, world: 99 })).toBe(false);
    expect(x.dispatch({ type: 'setAutoBuy', on: false, floor: 0 })).toBe(false);
    expect(x.dispatch({ type: 'setAutoBuy', on: false, world: 0, floor: 99 })).toBe(false);
  });
});
