/**
 * The one formatter (docs/tech/05-big-numbers.md). Every label, tooltip, popup,
 * simulator report and content report turns numbers into text here and nowhere else.
 *
 * Fixed rules:
 *  - three significant digits once abbreviated: 1.23M, 12.3M, 123M
 *  - below one million: whole numbers with thousands separators
 *  - what you have rounds down, what something costs rounds up
 *  - output never depends on the PC's regional settings
 */
import { Num, type NumLike } from './num';

export type Notation = 'short' | 'long' | 'scientific' | 'engineering';
export type Rounding = 'down' | 'up' | 'nearest';

export interface FormatOptions {
  notation?: Notation;
  /** 'down' for amounts the player holds (the default), 'up' for prices. */
  rounding?: Rounding;
  /** Decimals to show below 1,000 for currencies that declare them (for example 2 gives 49.31). */
  smallDecimals?: number;
}

const UNITS_SHORT = ['', 'U', 'D', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
const TENS_SHORT = ['', 'Dc', 'Vg', 'Tg', 'Qag', 'Qig', 'Sxg', 'Spg', 'Ocg', 'Nog'];
const FIRST_SHORT = ['', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
const UNITS_LONG = ['', 'un', 'duo', 'tre', 'quattuor', 'quin', 'sex', 'septen', 'octo', 'novem'];
const TENS_LONG = ['', 'dec', 'vigint', 'trigint', 'quadragint', 'quinquagint', 'sexagint', 'septuagint', 'octogint', 'nonagint'];
const FIRST_LONG = ['', 'm', 'b', 'tr', 'quadr', 'quint', 'sext', 'sept', 'oct', 'non'];

/** Highest named size: index 100 is a centillion, 1e303. Past it, short and long fall back to scientific. */
export const MAX_NAMED_INDEX = 100;

/** Name for 10^(3*index + 3): index 1 is a million. Generated, so the list cannot have gaps. */
export function sizeName(index: number, long: boolean): string {
  if (!Number.isInteger(index) || index < 1 || index > MAX_NAMED_INDEX) throw new RangeError(`sizeName: no name for index ${index}`);
  if (index === 100) return long ? 'Centillion' : 'Ce';
  if (index < 10) {
    if (!long) return FIRST_SHORT[index]!;
    const stem = FIRST_LONG[index]!;
    return stem[0]!.toUpperCase() + stem.slice(1) + 'illion';
  }
  const unit = index % 10;
  const ten = Math.floor(index / 10);
  if (!long) return UNITS_SHORT[unit]! + TENS_SHORT[ten]!;
  const word = UNITS_LONG[unit]! + TENS_LONG[ten]! + 'illion';
  return word[0]!.toUpperCase() + word.slice(1);
}

function groupThousands(digits: string): string {
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ',';
    out += digits[i];
  }
  return out;
}

function roundTo(value: number, decimals: number, rounding: Rounding): number {
  const scale = 10 ** decimals;
  const scaled = value * scale;
  // A whisker of tolerance so 1.23 does not become 1.22 or 1.24 through binary noise.
  const eps = 1e-9 * Math.max(1, Math.abs(scaled));
  if (rounding === 'down') return Math.floor(scaled + eps) / scale;
  if (rounding === 'up') return Math.ceil(scaled - eps) / scale;
  return Math.round(scaled) / scale;
}

/**
 * Splits a positive Num into three significant digits and a power of ten that
 * is a multiple of `step` (3 for names and engineering, 1 for scientific),
 * carrying when rounding pushes the digits over the top (999.9 up becomes 1.00 of the next size).
 */
function threeDigits(n: Num, step: 1 | 3, rounding: Rounding): { text: string; exponent: number } {
  let exponent = step === 3 ? Math.floor(n.exponent / 3) * 3 : n.exponent;
  let lead = n.mantissa * 10 ** (n.exponent - exponent);
  const limit = step === 3 ? 1000 : 10;
  for (let pass = 0; pass < 2; pass++) {
    const decimals = lead >= 100 ? 0 : lead >= 10 ? 1 : 2;
    const rounded = roundTo(lead, decimals, rounding);
    if (rounded >= limit) {
      exponent += step;
      lead = rounded / limit;
      continue;
    }
    return { text: rounded.toFixed(decimals), exponent };
  }
  return { text: lead.toFixed(2), exponent };
}

/** Formats an amount. The default is the short notation, rounded down. */
export function formatNum(value: NumLike, opts: FormatOptions = {}): string {
  const n = Num.from(value);
  const notation = opts.notation ?? 'short';
  const rounding = opts.rounding ?? 'down';
  if (n.mantissa === 0) return '0';
  if (n.mantissa < 0) {
    const flipped: Rounding = rounding === 'down' ? 'up' : rounding === 'up' ? 'down' : 'nearest';
    return '-' + formatNum(n.mul(-1), { ...opts, rounding: flipped });
  }

  if (n.lt(1e6)) {
    const plain = n.toNumber();
    const decimals = plain < 1000 ? (opts.smallDecimals ?? 0) : 0;
    const rounded = roundTo(plain, decimals, rounding);
    if (rounded < 1e6) {
      const [whole, frac] = rounded.toFixed(decimals).split('.');
      return groupThousands(whole!) + (frac ? '.' + frac : '');
    }
    // Rounding up carried 999,999.x to a million: fall through to the abbreviated form.
    return formatNum(1e6, { ...opts, rounding: 'nearest' });
  }

  if (notation === 'scientific') {
    const { text, exponent } = threeDigits(n, 1, rounding);
    return `${text}e${exponent}`;
  }
  const { text, exponent } = threeDigits(n, 3, rounding);
  if (notation === 'engineering') return `${text}e${exponent}`;
  const index = exponent / 3 - 1;
  if (index > MAX_NAMED_INDEX) {
    const sci = threeDigits(n, 1, rounding);
    return `${sci.text}e${sci.exponent}`;
  }
  return notation === 'long' ? `${text} ${sizeName(index, true)}` : `${text}${sizeName(index, false)}`;
}

/** A price: always rounded up, so the text can never show something as affordable when it is not. */
export function formatCost(value: NumLike, opts: Omit<FormatOptions, 'rounding'> = {}): string {
  return formatNum(value, { ...opts, rounding: 'up' });
}

/** An income rate, for example "1.23M/s". */
export function formatRate(value: NumLike, opts: FormatOptions = {}): string {
  return `${formatNum(value, { smallDecimals: 2, ...opts })}/s`;
}

/** A multiplier, for example "x3.5", "x12.4" or "x1.23M". */
export function formatMult(value: NumLike): string {
  const n = Num.from(value);
  if (n.lt(1000)) {
    const v = n.toNumber();
    const decimals = v >= 100 ? 0 : v >= 10 ? 1 : 2;
    let text = roundTo(v, decimals, 'nearest').toFixed(decimals);
    if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
    return `x${text}`;
  }
  return `x${formatNum(n, { rounding: 'nearest' })}`;
}

/** A percentage from a fraction: 0.125 gives "12.5%". */
export function formatPercent(fraction: number, decimals = 1): string {
  let text = (fraction * 100).toFixed(decimals);
  if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
  return `${text}%`;
}

/** A duration from seconds: "45s", "2m 05s", "2h 14m", "3d 4h". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'never';
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}
