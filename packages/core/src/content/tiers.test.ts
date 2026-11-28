/**
 * Design 0.5 foundations (EXPANSION 15.1): tiers are data, cards carry their tier, chests come in
 * every tier with card slots capped, and only counted taps act on the tower.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, loadRaw } from '@sprout/content';
import { describe, expect, it } from 'vitest';
import { cardTier, hydrateContent, tierUps } from './content';
import { Game } from '../game/game';

const content = loadContent();
const repo = fileURLToPath(new URL('../../../../', import.meta.url));

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === 'dist' || name === 'dist-single' || name === 'generated' || name === 'release') continue;
    if (statSync(p).isDirectory()) out.push(...sources(p));
    else if (/\.(ts|cjs|mjs)$/.test(name) && !/\.test\.ts$/.test(name)) out.push(p);
  }
  return out;
}

describe('the rarity ladder is data', () => {
  it('has eleven tiers in the design order, each 1.5 times the one below', () => {
    expect(content.tiers.list.map((t) => t.id)).toEqual(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exotic', 'godly', 'ungodly', 'holy', 'grailed']);
    content.tiers.list.forEach((t, i) => {
      expect(t.order).toBe(i + 1);
      expect(t.pips).toBe(i + 1);
      expect(content.tiers.power(t.id)).toBeCloseTo(1.5 ** i, 10);
    });
    // Reveals get longer and chimes higher at every step (EXPANSION 4.1 rules 4 and 5).
    for (let i = 1; i < content.tiers.count; i++) {
      const [a, b] = [content.tiers.list[i - 1]!, content.tiers.list[i]!];
      expect(b.reveal.total).toBeGreaterThan(a.reveal.total);
      expect(b.chime).toBeGreaterThan(a.chime);
      expect(b.reveal.short).toBeLessThanOrEqual(1);
    }
  });

  it('no code compares or names a tier: every rule that singles one out reads it from data', () => {
    const ids = content.tiers.list.map((t) => t.id);
    const named = new RegExp(`(['"\`])(${ids.join('|')})\\1`);
    const dirs = ['packages/core/src', 'packages/content/src', 'packages/game/src', 'apps/sim/src', 'apps/desktop'];
    const found: string[] = [];
    for (const d of dirs) {
      for (const file of sources(join(repo, d))) {
        readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (named.test(line)) found.push(`${relative(repo, file)}:${i + 1}: ${line.trim()}`);
          });
      }
    }
    expect(found).toEqual([]);
  });

  it('refuses a table that names a tier off the ladder', () => {
    const raw = loadRaw();
    const bad = { ...raw, plants: raw.plants.map((p, i) => (i === 0 ? { ...p, rarity: 'shiny' } : p)) };
    expect(() => hydrateContent(bad)).toThrow(/unknown tier shiny/);
  });
});

describe('cards carry their tier', () => {
  it('knows each card native tier and counts Tier Ups from it', () => {
    for (const c of content.cards.values()) expect(c.nativeTier).toBe(content.tiers.order(c.rarity));
    const m = content.managers[0]!;
    expect(cardTier(m, undefined)).toBe(m.nativeTier);
    expect(cardTier(m, { tier: m.nativeTier + 2 })).toBe(m.nativeTier + 2);
    expect(tierUps(m, { tier: m.nativeTier + 2 })).toBe(2);
    // A Tier Up never lowers anything.
    expect(cardTier(m, { tier: m.nativeTier - 1 })).toBe(m.nativeTier);
  });
});

describe('chests by tier', () => {
  it('has a chest for every tier, and no card slot rolls above CHEST_CARD_TOP', () => {
    const tiers = [...content.chests.values()].map((c) => c.tier).sort((a, b) => a - b);
    expect(tiers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const top = content.tiers.order(content.tuning.CHEST_CARD_TOP);
    for (const c of content.chests.values()) {
      for (const id of [...Object.keys(c.odds), ...c.guarantee]) expect(content.tiers.order(id)).toBeLessThanOrEqual(top);
    }
  });

  it('refuses a chest whose card slot could roll above CHEST_CARD_TOP', () => {
    const raw = loadRaw();
    const bad = { ...raw, chests: raw.chests.map((c, i) => (i === 0 ? { ...c, odds: { ...c.odds, mythic: 1 } } : c)) };
    expect(() => hydrateContent(bad)).toThrow(/above CHEST_CARD_TOP/);
  });

  it('opens a Grail Chest with its fixed extras, sure heirlooms and Head copies', () => {
    const g = new Game({ content, seed: 7 });
    const s = g.state;
    s.unlocked['feature.heirlooms'] = 0;
    s.unlocked['feature.plants'] = 0;
    s.chests['chest.grail'] = 1;
    const events: { cards: string[] }[] = [];
    g.on((e) => {
      if (e.type === 'chestOpened') events.push(e);
    });
    expect(g.dispatch({ type: 'openChest', chest: 'chest.grail' })).toBe(true);
    expect(events.length).toBe(1);
    expect(Object.keys(s.heirlooms).length).toBeGreaterThanOrEqual(1);
    expect(s.items?.['ore.grailstone']).toBe(1);
    expect(s.items?.['ore.cloud_pearl']).toBe(2);
    expect(s.items?.['cosmetic.random@grailed']).toBe(1);
  });
});

describe('counted taps', () => {
  it('only counted input sources act on the tower', () => {
    const g = new Game({ content, seed: 3 });
    expect(g.dispatch({ type: 'tap', count: 1, source: 'field' })).toBe(false);
    expect(g.state.counters.taps ?? 0).toBe(0);
    expect(g.dispatch({ type: 'tap', count: 1, source: 'key' })).toBe(true);
    expect(g.dispatch({ type: 'tap', count: 1 })).toBe(true);
    expect(g.state.counters.taps).toBe(2);
  });
});
