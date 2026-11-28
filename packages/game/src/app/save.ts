/**
 * Browser saves (docs/tech/06, first version for the slice): the core's save
 * text in an envelope with the real time it was written and a checksum, kept
 * in localStorage with one backup. The Electron app uses the same storage for
 * now; the file-based save with atomic writes is a follow-up.
 */
import { deserializeState, serializeState, type GameState } from '@sprout/core';

const KEY = 'sprout-tower.save';
const BACKUP = 'sprout-tower.save.backup';

interface Envelope {
  v: 1;
  savedAt: number;
  sum: number;
  data: string;
}

function checksum(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function read(key: string): { state: GameState; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope;
    if (env.v !== 1 || checksum(env.data) !== env.sum) return null;
    return { state: deserializeState(env.data), savedAt: env.savedAt };
  } catch {
    return null;
  }
}

/** The newest good save, or null for a new game. */
export function loadSave(): { state: GameState; savedAt: number } | null {
  return read(KEY) ?? read(BACKUP);
}

export function writeSave(state: GameState): boolean {
  try {
    const data = serializeState(state);
    const env: Envelope = { v: 1, savedAt: Date.now(), sum: checksum(data), data };
    const prev = localStorage.getItem(KEY);
    if (prev) localStorage.setItem(BACKUP, prev);
    localStorage.setItem(KEY, JSON.stringify(env));
    return true;
  } catch (err) {
    console.warn('[save] could not write', err);
    return false;
  }
}

export function wipeSave(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(BACKUP);
  } catch {
    /* storage blocked */
  }
}

const SETTINGS = 'sprout-tower.settings';
export interface Settings {
  muted: boolean;
  reduceMotion: boolean;
  buyMode: number;
}

export function loadSettings(): Settings {
  const d: Settings = { muted: false, reduceMotion: false, buyMode: 0 };
  try {
    const raw = localStorage.getItem(SETTINGS);
    if (raw) return { ...d, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* storage blocked */
  }
  return d;
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS, JSON.stringify(s));
  } catch {
    /* storage blocked */
  }
}
