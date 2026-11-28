/**
 * Saves (docs/tech/06, first version for the slice): the core's save text in an
 * envelope with the real time it was written and a checksum, plus one backup.
 *
 * In the Windows app the envelope goes to a file through the shell, which writes
 * it with a temporary file and an atomic rename (apps/desktop/main.cjs). In a
 * browser (the phone preview and tests) it goes to localStorage.
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

/** What the Windows app's preload script offers (apps/desktop/preload.cjs). */
export interface Shell {
  info: { portable: boolean; version: string; saveDir: string };
  readSave(): Promise<{ main: string | null; backup: string | null }>;
  writeSave(text: string): void;
  writeSaveNow(text: string): boolean;
  wipeSave(): boolean;
  toggleFullscreen(): void;
  openSaveFolder(): void;
}

export const shell: Shell | null = (window as unknown as { sproutShell?: Shell }).sproutShell ?? null;

function checksum(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function parse(raw: string | null): { state: GameState; savedAt: number } | null {
  try {
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope;
    if (env.v !== 1 || checksum(env.data) !== env.sum) return null;
    return { state: deserializeState(env.data), savedAt: env.savedAt };
  } catch {
    return null;
  }
}

function local(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** The newest good save, or null for a new game. A damaged save falls back to the backup. */
export async function loadSave(): Promise<{ state: GameState; savedAt: number } | null> {
  if (shell) {
    const files = await shell.readSave().catch(() => ({ main: null, backup: null }));
    return parse(files.main) ?? parse(files.backup);
  }
  return parse(local(KEY)) ?? parse(local(BACKUP));
}

/** `final`: the last save on the way out, written before this returns where the platform allows. */
export function writeSave(state: GameState, final = false): boolean {
  try {
    const data = serializeState(state);
    const env: Envelope = { v: 1, savedAt: Date.now(), sum: checksum(data), data };
    const text = JSON.stringify(env);
    if (shell) {
      if (final) return shell.writeSaveNow(text);
      shell.writeSave(text);
      return true;
    }
    const prev = localStorage.getItem(KEY);
    if (prev) localStorage.setItem(BACKUP, prev);
    localStorage.setItem(KEY, text);
    return true;
  } catch (err) {
    console.warn('[save] could not write', err);
    return false;
  }
}

export function wipeSave(): void {
  if (shell) shell.wipeSave();
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
