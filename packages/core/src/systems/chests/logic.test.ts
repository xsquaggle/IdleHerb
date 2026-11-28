import { loadContent } from '@sprout/content';
import { describe, expect, it } from 'vitest';
import { seedRng } from '../../kernel/rng/rng';
import { rollChest, type ChestRollInput } from './logic';

const content = loadContent();
const byId = new Map(content.managers.map((m) => [m.id, m]));
const w1 = content.managers.filter((m) => m.world === 0);
const head = w1.find((m) => m.head)!;
// A player who has opened floors 1 to 9 of Thymeford: every rarity but Exotic is met.
const met = w1.filter((m) => !m.head).map((m) => m.id);

function input(chestId: string, seed: number, heads: string[] = []): ChestRollInput {
  return {
    content,
    rng: seedRng(seed, 'chest-test'),
    chest: content.chests.get(chestId)!,
    luck: 0,
    doubleLuck: false,
    plantsUnlocked: true,
    heirloomsUnlocked: true,
    worldReached: 1,
    owned: new Set(met),
    heads,
    ownedHeirlooms: new Set(),
    newCardHelp: false,
    pity: { sinceEpic: 0, sinceLegendary: 0, heirloomsSinceLegendary: 0 },
  };
}

describe('chest rolls on design 0.3', () => {
  it('has one fixed manager per floor and the Head on the top floor', () => {
    expect(content.managers.length).toBe(50);
    for (const world of content.worlds) {
      for (const [i, f] of world.floors.entries()) {
        expect(f.manager.floorIndex).toBe(i);
        expect(f.manager.head).toBe(i === world.floors.length - 1);
        expect(f.manager.rarity === 'exotic').toBe(f.manager.head);
      }
    }
    expect(head.rarity).toBe('exotic');
  });

  it('draws manager cards only from managers already met, never a Head', () => {
    for (const id of ['chest.wooden', 'chest.copper', 'chest.silver', 'chest.golden', 'chest.crystal']) {
      for (let seed = 1; seed <= 150; seed++) {
        const res = rollChest(input(id, seed));
        for (const c of res.cards) {
          const m = byId.get(c);
          if (!m) continue;
          expect(met).toContain(c);
          expect(m.head).toBe(false);
        }
        expect(res.exoticManager).toBeNull();
      }
    }
  });

  it('Legendary pity draws a Legendary, and with none in the pool leaves the roll as it was', () => {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'exotic'];
    const rarityOf = (c: string): string => byId.get(c)?.rarity ?? content.plants.find((p) => p.id === c)!.rarity;
    const forced = { ...input('chest.wooden', 7), pity: { sinceEpic: 0, sinceLegendary: 1000, heirloomsSinceLegendary: 0 } };
    expect(rarityOf(rollChest(forced).cards[0]!)).toBe('legendary');
    // No Legendary met and no plants yet: the pity cannot be paid, so cards keep their rolled rarity.
    const below: string[] = [];
    for (let seed = 1; seed <= 40; seed++) {
      const x = input('chest.wooden', seed);
      x.plantsUnlocked = false;
      x.owned = new Set(met.filter((id) => byId.get(id)!.rarity !== 'legendary'));
      x.pity = { sinceEpic: 0, sinceLegendary: 1000, heirloomsSinceLegendary: 0 };
      for (const c of rollChest(x).cards) if (order.indexOf(rarityOf(c)) < order.indexOf('epic')) below.push(c);
      expect(x.pity.sinceLegendary).toBeGreaterThan(1000);
    }
    expect(below.length).toBeGreaterThan(0);
  });

  it('gives a Starlight Head copy only for a Head whose world has five stars', () => {
    for (let seed = 1; seed <= 50; seed++) {
      expect(rollChest(input('chest.starlight', seed, [head.id])).exoticManager).toBe(head.id);
      expect(rollChest(input('chest.starlight', seed, [])).exoticManager).toBeNull();
    }
  });

  it('honours each chest\'s card count and guarantees', () => {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'exotic'];
    for (const chest of content.chests.values()) {
      if (chest.id === 'chest.welcome' || chest.id === 'chest.hiring' || chest.id === 'chest.seed_packet') continue;
      for (let seed = 1; seed <= 40; seed++) {
        const res = rollChest(input(chest.id, seed));
        // The Starlight Chest adds one card on top: a Head copy, or a third Legendary when no Head qualifies.
        expect(res.cards.length).toBeLessThanOrEqual(chest.cards + (chest.exoticManagerCopy ? 1 : 0));
        const rarities = res.cards.map((c) => byId.get(c)?.rarity ?? content.plants.find((p) => p.id === c)?.rarity).filter((r) => r !== undefined) as string[];
        for (const g of (chest.guarantee ?? []) as string[]) {
          expect(rarities.some((r) => order.indexOf(r) >= order.indexOf(g))).toBe(true);
        }
      }
    }
  });

  it('is deterministic for a seed', () => {
    expect(rollChest(input('chest.golden', 9))).toEqual(rollChest(input('chest.golden', 9)));
  });
});
