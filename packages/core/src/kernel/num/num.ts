/**
 * Num: the game's big-number type (docs/tech/05-big-numbers.md).
 *
 * break_infinity.js is hidden behind this module. Gameplay code imports `Num`
 * and the helpers below and never the library, so a later swap to a wider
 * library is a change to this one file.
 *
 * A Num is a mantissa (1 <= |m| < 10) and a power-of-ten exponent: about 16
 * significant digits at any size, up to roughly 1e(9e15).
 *
 * Rules for callers (also in the tech plan):
 *  - compare with methods (`a.gte(b)`), never with operators
 *  - check before subtracting (`if (cash.gte(cost)) cash = cash.sub(cost)`)
 *  - use `Num.pow` / `powNum` for growth curves, never `Math.pow`
 *  - nothing that needs unit accuracy is stored as a Num
 */
import Decimal from 'break_infinity.js';

export type NumLike = Num | number | string;

/** The public face of a big number. Instances are immutable in practice: every method returns a new value. */
export interface Num {
  readonly mantissa: number;
  readonly exponent: number;
  add(other: NumLike): Num;
  sub(other: NumLike): Num;
  mul(other: NumLike): Num;
  div(other: NumLike): Num;
  pow(power: number): Num;
  sqrt(): Num;
  floor(): Num;
  ceil(): Num;
  max(other: NumLike): Num;
  min(other: NumLike): Num;
  cmp(other: NumLike): -1 | 0 | 1;
  eq(other: NumLike): boolean;
  gt(other: NumLike): boolean;
  gte(other: NumLike): boolean;
  lt(other: NumLike): boolean;
  lte(other: NumLike): boolean;
  log10(): number;
  toNumber(): number;
  toString(): string;
}

interface NumStatic {
  (value: NumLike): Num;
  readonly ZERO: Num;
  readonly ONE: Num;
  from(value: NumLike): Num;
  fromParts(mantissa: number, exponent: number): Num;
  pow(base: NumLike, power: number): Num;
  pow10(power: number): Num;
  isNum(value: unknown): value is Num;
}

const D = Decimal as unknown as {
  new (v?: unknown): Num;
  fromMantissaExponent(m: number, e: number): Num;
  pow(b: unknown, p: number): Num;
  pow10(p: number): Num;
};

function from(value: NumLike): Num {
  if (typeof value === 'object') return value;
  if (typeof value === 'string') return parseNum(value);
  if (!Number.isFinite(value)) throw new RangeError(`Num.from: non-finite number ${value}`);
  return new D(value);
}

export const Num: NumStatic = Object.assign((value: NumLike) => from(value), {
  ZERO: new D(0),
  ONE: new D(1),
  from,
  fromParts: (mantissa: number, exponent: number): Num => D.fromMantissaExponent(mantissa, exponent),
  pow: (base: NumLike, power: number): Num => D.pow(from(base), power),
  pow10: (power: number): Num => D.pow10(power),
  isNum: (value: unknown): value is Num => value instanceof (Decimal as unknown as new () => object),
});

/** True when the value is a usable number: not NaN and not infinite. */
export function isFiniteNum(n: Num): boolean {
  return Number.isFinite(n.mantissa) && Number.isFinite(n.exponent);
}

/** Throws when a Num is NaN or infinite. Called at every state write in development and test builds. */
export function assertFinite(n: Num, what = 'value'): Num {
  if (!isFiniteNum(n)) throw new RangeError(`${what} is not finite (mantissa ${n.mantissa}, exponent ${n.exponent})`);
  return n;
}

/**
 * The exact text form used in saves and data tables: full mantissa and the
 * exponent, for example "1.2345678901234567e345". Unlike the library's own
 * text conversion this round-trips bit for bit (property test in num.test.ts).
 */
export function numToSave(n: Num): string {
  if (n.mantissa === 0) return '0';
  // JavaScript prints the shortest decimal that parses back to the same double.
  return `${n.mantissa}e${n.exponent}`;
}

const SAVE_RE = /^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)e(-?\d+)$/;

export function numFromSave(text: string): Num {
  if (text === '0') return Num.ZERO;
  const m = SAVE_RE.exec(text);
  if (!m) throw new SyntaxError(`numFromSave: bad big number "${text}"`);
  const mantissa = Number(m[1]);
  const exponent = Number(m[2]);
  if (!Number.isFinite(mantissa) || !Number.isInteger(exponent)) throw new SyntaxError(`numFromSave: bad big number "${text}"`);
  return Num.fromParts(mantissa, exponent);
}

const PLAIN_RE = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/**
 * Reads a number written by a person in a data table: "7.25e12", "1e400",
 * "25,798,901,760" or a plain "42". Stricter than the library: junk is an error.
 */
export function parseNum(text: string): Num {
  const clean = text.trim().replace(/,/g, '').replace(/_/g, '');
  if (!PLAIN_RE.test(clean)) throw new SyntaxError(`parseNum: bad big number "${text}"`);
  const eAt = clean.search(/[eE]/);
  if (eAt < 0) return new D(Number(clean));
  const mantissa = Number(clean.slice(0, eAt));
  const exponent = Number(clean.slice(eAt + 1));
  return Num.fromParts(mantissa, exponent);
}

/** Sum of many Nums without building intermediate arrays. */
export function sumNum(values: Iterable<Num>): Num {
  let total = Num.ZERO;
  for (const v of values) total = total.add(v);
  return total;
}

/** log10 that returns -Infinity for zero or negative values instead of NaN. */
export function safeLog10(n: Num): number {
  return n.mantissa > 0 ? n.log10() : Number.NEGATIVE_INFINITY;
}
