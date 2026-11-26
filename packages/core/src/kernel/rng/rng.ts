/**
 * Seeded random streams (docs/tech/02-architecture.md, "Time, ticks and determinism").
 *
 * The core never calls Math.random. Each kind of randomness has its own
 * stream whose state lives in the game state, so a simulator run is
 * reproducible from its seed and reopening the game cannot reroll a chest.
 *
 * Generator: sfc32 (Chris Doty-Humphrey's Small Fast Chaotic generator), a
 * 128-bit state that passes PractRand and is a few integer operations a draw.
 */

export interface RngState {
  a: number;
  b: number;
  c: number;
  d: number;
}

/** FNV-1a hash of a stream name, used to give every stream its own starting point. */
function hashString(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function splitmix32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return (z ^ (z >>> 16)) >>> 0;
  };
}

export function seedRng(seed: number, stream: string): RngState {
  const mix = splitmix32((seed >>> 0) ^ hashString(stream));
  const state: RngState = { a: mix(), b: mix(), c: mix(), d: 1 };
  for (let i = 0; i < 12; i++) nextUint(state);
  return state;
}

/** Advances the stream and returns a whole number from 0 to 2^32 - 1. */
export function nextUint(s: RngState): number {
  const t = (((s.a + s.b) | 0) + s.d) | 0;
  s.d = (s.d + 1) | 0;
  s.a = s.b ^ (s.b >>> 9);
  s.b = (s.c + (s.c << 3)) | 0;
  s.c = (s.c << 21) | (s.c >>> 11);
  s.c = (s.c + t) | 0;
  return t >>> 0;
}

/** A number from 0 (included) to 1 (not included). */
export function nextFloat(s: RngState): number {
  return nextUint(s) / 4294967296;
}

/** A number from `min` (included) to `max` (not included). */
export function nextRange(s: RngState, min: number, max: number): number {
  return min + (max - min) * nextFloat(s);
}

/** A whole number from 0 to n - 1. */
export function nextInt(s: RngState, n: number): number {
  return Math.floor(nextFloat(s) * n);
}

export function chance(s: RngState, probability: number): boolean {
  return nextFloat(s) < probability;
}

/** Picks an index with probability proportional to its weight. Weights must not all be zero. */
export function pickWeighted(s: RngState, weights: readonly number[]): number {
  let total = 0;
  for (const w of weights) total += w;
  if (!(total > 0)) throw new RangeError('pickWeighted: weights sum to zero');
  let roll = nextFloat(s) * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]!;
    if (roll < 0) return i;
  }
  return weights.length - 1;
}

export function pickOne<T>(s: RngState, items: readonly T[]): T {
  if (items.length === 0) throw new RangeError('pickOne: empty list');
  return items[nextInt(s, items.length)]!;
}
