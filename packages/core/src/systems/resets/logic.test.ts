import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Num } from '../../kernel/num/num';
import { compostRecordXp, compostTotal, lifetimeForCompost, ribbonsTotal, shopCost } from './logic';

describe('Replant and Festival formulas (GDD 12)', () => {
  const e0 = Num('2e10');

  it('Compost follows K x (lifetime / E0)^0.4 and its inverse', () => {
    expect(compostTotal(e0, 5, e0, 0.4, 1).eq(5)).toBe(true);
    expect(compostTotal(Num('2e20'), 5, e0, 0.4, 1).eq(Math.floor(5 * 1e10 ** 0.4))).toBe(true);
    expect(compostTotal(Num.ZERO, 5, e0, 0.4, 1).eq(0)).toBe(true);
    fc.assert(
      fc.property(fc.double({ min: 11, max: 3000, noNaN: true }), fc.double({ min: 1, max: 600, noNaN: true }), (lifeLog, k) => {
        const life = Num.pow10(lifeLog);
        const c = compostTotal(life, k, e0, 0.4, 1);
        if (c.lt(1)) return;
        // The lifetime that pays exactly c Compost is at most what was earned.
        expect(lifetimeForCompost(c, k, e0, 0.4, 1).lte(life.mul(1 + 1e-9))).toBe(true);
      }),
      { numRuns: 1000 },
    );
  });

  it('Compost and Ribbons never fall when lifetime rises', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 3000, noNaN: true }), fc.double({ min: 0, max: 50, noNaN: true }), (a, d) => {
        expect(compostTotal(Num.pow10(a + d), 5, e0, 0.4, 1).gte(compostTotal(Num.pow10(a), 5, e0, 0.4, 1))).toBe(true);
        expect(ribbonsTotal(Num.pow10(a + d), Num(50000), 0.5).gte(ribbonsTotal(Num.pow10(a), Num(50000), 0.5))).toBe(true);
      }),
      { numRuns: 1000 },
    );
  });

  it('Ribbons are the square root of Compost over C0', () => {
    expect(ribbonsTotal(Num(50000 * 64), Num(50000), 0.5).eq(8)).toBe(true);
    expect(ribbonsTotal(Num(49999), Num(50000), 0.5).eq(0)).toBe(true);
  });

  it('Compost records pay step x n for every power of two passed', () => {
    expect(compostRecordXp(0, Num(1), 150)).toEqual({ xp: 0, passed: 0 });
    expect(compostRecordXp(0, Num(8), 150)).toEqual({ xp: 150 * (1 + 2 + 3), passed: 3 });
    expect(compostRecordXp(3, Num(8), 150)).toEqual({ xp: 0, passed: 3 });
    expect(compostRecordXp(3, Num(32), 150)).toEqual({ xp: 150 * (4 + 5), passed: 5 });
  });

  it('shop prices are whole numbers of at least 1 and never fall', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 500 }), fc.double({ min: 1, max: 1.5, noNaN: true }), fc.integer({ min: 1, max: 200 }), (base, g, n) => {
        const c = shopCost(base, g, n);
        expect(c.gte(1)).toBe(true);
        expect(shopCost(base, g, n + 1).gte(c)).toBe(true);
        // Whole to the precision a Num holds (15 digits).
        const v = c.toNumber();
        if (v < 1e15) expect(Math.abs(v - Math.round(v))).toBeLessThan(1e-6 * Math.max(1, v));
      }),
    );
    expect(shopCost(50, 1.15, 1).eq(50)).toBe(true);
  });
});
