import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Num } from './num';
import { MAX_NAMED_INDEX, formatCost, formatDuration, formatMult, formatNum, formatPercent, formatRate, sizeName } from './format';

describe('formatNum golden table', () => {
  const rows: [string | number, string, string?][] = [
    [0, '0'],
    [7, '7'],
    [999, '999'],
    [1234, '1,234'],
    [999999, '999,999'],
    [1e6, '1.00M'],
    [1234567, '1.23M', '1.24M'],
    [12345678, '12.3M', '12.4M'],
    [123456789, '123M', '124M'],
    [999999999, '999M', '1.00B'],
    [1.5e9, '1.50B'],
    [1e12, '1.00T'],
    [4.56e15, '4.56Qa'],
    ['1e33', '1.00Dc'],
    ['1.239e36', '1.23UDc', '1.24UDc'],
    ['1e303', '1.00Ce'],
    ['1e306', '1.00e306'],
    ['5.5e1000', '5.50e1000'],
  ];
  for (const [value, down, up] of rows) {
    it(`${value} shows as ${down}`, () => {
      expect(formatNum(value)).toBe(down);
      expect(formatCost(value)).toBe(up ?? down);
    });
  }

  it('writes the long names', () => {
    expect(formatNum(1e6, { notation: 'long' })).toBe('1.00 Million');
    expect(formatNum('2.5e33', { notation: 'long' })).toBe('2.50 Decillion');
    expect(sizeName(21, true)).toBe('Unvigintillion');
  });

  it('writes scientific and engineering forms', () => {
    expect(formatNum('1.234e50', { notation: 'scientific' })).toBe('1.23e50');
    expect(formatNum('1.234e50', { notation: 'engineering' })).toBe('123e48');
  });

  it('handles negative numbers and small decimals', () => {
    // A negative holding rounds toward minus infinity, like a positive one rounds down.
    expect(formatNum(-1234567)).toBe('-1.24M');
    expect(formatRate(49.317)).toBe('49.31/s');
    expect(formatMult(3.5)).toBe('x3.5');
    expect(formatMult(12.44)).toBe('x12.4');
    expect(formatMult(1234567)).toBe('x1.23M');
    expect(formatPercent(0.125)).toBe('12.5%');
  });

  it('writes durations', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(125)).toBe('2m 05s');
    expect(formatDuration(2 * 3600 + 14 * 60)).toBe('2h 14m');
    expect(formatDuration(3 * 86400 + 4 * 3600)).toBe('3d 4h');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('never');
  });
});

describe('formatNum properties', () => {
  // Suffix to power of ten, built from the same name list.
  const power = new Map<string, number>();
  for (let i = 1; i <= MAX_NAMED_INDEX; i++) power.set(sizeName(i, false), 3 * i + 3);
  const read = (text: string): number => {
    const m = /^([\d.]+)(?:e(\d+)|([A-Za-z]+))$/.exec(text);
    if (!m) throw new Error(`cannot read ${text}`);
    const exp = m[2] !== undefined ? Number(m[2]) : power.get(m[3]!)!;
    return Math.log10(Number(m[1])) + exp;
  };
  const value = fc.tuple(fc.double({ min: 1, max: 9.999, noNaN: true }), fc.integer({ min: 6, max: 2000 })).map(([m, e]) => Num.fromParts(m, e));

  it('always shows three significant digits once abbreviated', () => {
    fc.assert(
      fc.property(value, (n) => {
        const digits = formatNum(n).replace(/e\d+$|[A-Za-z]+$/, '').replace('.', '');
        expect(digits.length).toBe(3);
      }),
      { numRuns: 3000 },
    );
  });

  it('rounds holdings down and prices up', () => {
    fc.assert(
      fc.property(value, (n) => {
        const l = n.log10();
        expect(read(formatNum(n))).toBeLessThanOrEqual(l + 1e-9);
        expect(read(formatCost(n))).toBeGreaterThanOrEqual(l - 1e-9);
        // and never by more than one step in the third digit
        expect(l - read(formatNum(n))).toBeLessThan(Math.log10(1.01) + 1e-9);
      }),
      { numRuns: 3000 },
    );
  });

  it('never depends on the size of the number for its shape', () => {
    fc.assert(
      fc.property(value, (n) => {
        expect(formatNum(n)).toMatch(/^\d{1,3}(\.\d{1,2})?([A-Za-z]+|e\d+)$/);
      }),
      { numRuns: 3000 },
    );
  });
});
