/**
 * Save text (docs/tech/06-save-system.md, first version).
 *
 * The state is one plain object tree, so a save is JSON with one rule: every
 * big number is written as { "$n": "<mantissa>e<exponent>" } in the exact form
 * of `numToSave`, which reads back bit for bit. The shell adds the envelope
 * (checksum, backups, atomic write); this module only turns state into text
 * and back.
 */
import { Num, numFromSave, numToSave } from '../kernel/num/num';
import type { GameState } from './state';

const TAG = '$n';

function encode(value: unknown): unknown {
  if (Num.isNum(value)) return { [TAG]: numToSave(value) };
  if (Array.isArray(value)) return value.map(encode);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = encode(v);
    return out;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw new RangeError('save: non-finite number in state');
  return value;
}

function decode(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decode);
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === TAG && typeof obj[TAG] === 'string') return numFromSave(obj[TAG] as string);
    const out: Record<string, unknown> = {};
    for (const k of keys) out[k] = decode(obj[k]);
    return out;
  }
  return value;
}

/** State to save text. Throws if the state holds NaN or Infinity anywhere. */
export function serializeState(state: GameState): string {
  return JSON.stringify(encode(state));
}

/** Save text back to state. The caller checks `version` and migrates before use. */
export function deserializeState(text: string): GameState {
  return decode(JSON.parse(text)) as GameState;
}

/** A deep copy that keeps big numbers as big numbers. */
export function cloneState(state: GameState): GameState {
  return deserializeState(serializeState(state));
}
