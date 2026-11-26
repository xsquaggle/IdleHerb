import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Num, assertFinite, isFiniteNum, numFromSave, numToSave, parseNum, safeLog10, sumNum } from './num';

const mantissa = fc.double({ min: 1, max: 9.999999999999998, noNaN: true });
const exponent = fc.integer({ min: -300, max: 9e14 });
const big = fc.tuple(mantissa, exponent).map(([m, e]) => Num.fromParts(m, e));

describe('Num', () => {
  it('save text round-trips bit for bit at any size', () => {
    fc.assert(
      fc.property(mantissa, exponent, fc.boolean(), (m, e, neg) => {
        const n = Num.fromParts(neg ? -m : m, e);
        const back = numFromSave(numToSave(n));
        expect(back.mantissa).toBe(n.mantissa);
        expect(back.exponent).toBe(n.exponent);
      }),
      { numRuns: 2000 },
    );
    expect(numToSave(Num.ZERO)).toBe('0');
    expect(numFromSave('0').eq(0)).toBe(true);
  });

  it('keeps about 15 significant digits through multiply and divide', () => {
    fc.assert(
      fc.property(big, big, (a, b) => {
        const back = a.mul(b).div(b);
        expect(Math.abs(back.mantissa * 10 ** (back.exponent - a.exponent) - a.mantissa)).toBeLessThan(1e-12 * a.mantissa);
      }),
      { numRuns: 2000 },
    );
  });

  it('adds exactly while the sum fits in 15 digits, and within one part in 1e15 past that', () => {
    expect(Num(123456789012345).add(1).eq(123456789012346)).toBe(true);
    // 16 digits: the mantissa-exponent form is no longer exact (why nothing that needs unit accuracy is a Num).
    const v = Num('9007199254740990').add(1).toNumber();
    expect(Math.abs(v - 9007199254740991) / 9007199254740991).toBeLessThan(1e-15);
  });

  it('orders values the same way their logarithms do', () => {
    fc.assert(
      fc.property(big, big, (a, b) => {
        const la = a.log10();
        const lb = b.log10();
        if (Math.abs(la - lb) < 1e-9 * Math.max(1, Math.abs(la))) return;
        expect(a.gt(b)).toBe(la > lb);
        expect(a.lt(b)).toBe(la < lb);
      }),
      { numRuns: 2000 },
    );
  });

  it('does not overflow on the growth curves the game uses', () => {
    // 10,000 levels of a 1.15 cost curve, an idle game's longest plausible run of a floor.
    const cost = Num.pow(1.15, 10000).mul('1e60');
    expect(isFiniteNum(cost)).toBe(true);
    expect(cost.log10()).toBeCloseTo(60 + 10000 * Math.log10(1.15), 6);
    const huge = Num.pow10(1e12).mul(Num.pow10(1e12));
    expect(isFiniteNum(huge)).toBe(true);
    expect(huge.exponent).toBe(2e12);
    expect(isFiniteNum(huge.sqrt())).toBe(true);
  });

  it('refuses NaN, infinity and junk instead of carrying them', () => {
    expect(() => Num(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => Num(Number.NaN)).toThrow(RangeError);
    expect(() => parseNum('12abc')).toThrow(SyntaxError);
    expect(() => parseNum('')).toThrow(SyntaxError);
    expect(() => numFromSave('1.5e')).toThrow(SyntaxError);
    expect(() => Num.fromParts(Number.NaN, 0)).toThrow(RangeError);
    expect(() => Num.fromParts(1, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(assertFinite(Num(5)).eq(5)).toBe(true);
  });

  it('documents the library\'s division by zero: it gives 0, not Infinity, so callers check divisors', () => {
    expect(Num(1).div(0).eq(0)).toBe(true);
  });

  it('reads numbers the way the data tables write them', () => {
    expect(parseNum('25,798,901,760').eq(25798901760)).toBe(true);
    expect(parseNum('7.25e12').eq(7.25e12)).toBe(true);
    expect(parseNum('1e400').exponent).toBe(400);
    expect(parseNum(' 42 ').eq(42)).toBe(true);
  });

  it('sums and takes safe logarithms', () => {
    expect(sumNum([Num(1), Num(2), Num('3e3')]).eq(3003)).toBe(true);
    expect(safeLog10(Num.ZERO)).toBe(Number.NEGATIVE_INFINITY);
    expect(safeLog10(Num('1e500'))).toBe(500);
  });
});
