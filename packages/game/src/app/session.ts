/**
 * The running session: the game, the player's settings and the few hooks the
 * scenes share. Filled once at boot by main.ts.
 */
import type { Game } from '@sprout/core';
import type { Settings } from './save';
import type { RevealOptions } from '../scene/reveal';

export interface Hooks {
  /** Screen-space point of the HUD coin counter, where coins fly to. */
  coinTarget(): { x: number; y: number };
  /** Puffs the coin counter when coins land. */
  coinLanded(): void;
  shake(px: number, sec: number): void;
  toast(text: string, color?: number): void;
  openPanel(id: 'chests' | 'cards' | 'replant' | 'settings' | 'theatre'): void;
  /** Scrolls the tower to show a floor (-1: the ground). */
  focusFloor(i: number): void;
  /** Queues a reveal behind any already playing; resolves when it is put away. */
  reveal(opts: RevealOptions): Promise<void>;
}

export const session = {} as {
  game: Game;
  settings: Settings;
  hooks: Hooks;
  saveSettings(): void;
};

/** Levels the buy button buys at once: x1, x10, to the next milestone, or as many as affordable. */
export const BUY_MODES = ['x1', 'x10', 'Next', 'Max'] as const;
