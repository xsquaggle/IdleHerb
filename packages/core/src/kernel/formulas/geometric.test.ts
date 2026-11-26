import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Num } from '../num/num';
import { bulkCost, levelCost, maxAffordable } from './geometric';

const rel = (a: Num, b: Num): number => Math.abs(a.sub(b).div(b.max(1e-300)).toNumber());

describe('geometric cost curves', () => {
  it('bulk cost equals buying the levels one at a time', () => {
    fc.assert(
      fc.property(fc.double({ min: 1.01, max: 1.3, noNaN: true }), fc.integer({ min: 1, max: 2000 }), fc.integer({ min: 1, max: 150 }), fc.double({ min: 1, max: 1e30, noNaN: true }), (g, level, count, base) => {
        let loop = Num.ZERO;
        for (let k = 0; k < count; k++) loop = loop.add(levelCost(base, g, level + k));
        expect(rel(bulkCost(base, g, level, count), loop)).toBeLessThan(1e-9);
      }),
      { numRuns: 400 },
    );
  });

  it('max affordable buys the most levels the cash covers and no more', () => {
    fc.assert(
      fc.property(fc.double({ min: 1.01, max: 1.3, noNaN: true }), fc.integer({ min: 1, max: 5000 }), fc.double({ min: 0, max: 400, noNaN: true }), (g, level, cashLog) => {
        const cash = Num.pow10(cashLog);
        const n = maxAffordable(1, g, level, cash);
        if (n > 0) expect(bulkCost(1, g, level, n).lte(cash)).toBe(true);
        expect(bulkCost(1, g, level, n + 1).gt(cash)).toBe(true);
      }),
      { numRuns: 1000 },
    );
  });

  it('a flat curve is a plain product', () => {
    expect(bulkCost(5, 1, 10, 4).eq(20)).toBe(true);
    expect(maxAffordable(5, 1, 1, Num(21))).toBe(4);
  });
});
