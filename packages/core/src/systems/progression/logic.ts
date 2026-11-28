/** Green Thumb level (GDD 9.1) and level-up chests (GDD 8.4). Pure functions. */
import type { Tuning } from '../../content/schema';

/** XP needed to go from `level` to `level + 1`. */
export function xpToNext(level: number, t: Pick<Tuning, 'XP_BASE' | 'XP_PER_LEVEL'>): number {
  return t.XP_BASE + t.XP_PER_LEVEL * level;
}

/** Total XP needed to reach `level` from level 1. */
export function xpForLevel(level: number, t: Pick<Tuning, 'XP_BASE' | 'XP_PER_LEVEL'>): number {
  const n = level - 1;
  return t.XP_BASE * n + (t.XP_PER_LEVEL * n * (n + 1)) / 2;
}

/** The chest for reaching `level`: only the best one that applies is given. */
export function levelUpChest(level: number): string {
  if (level === 50 || level === 100) return 'chest.starlight';
  if (level % 25 === 0) return 'chest.crystal';
  if (level % 10 === 0) return 'chest.golden';
  if (level % 5 === 0) return 'chest.silver';
  return 'chest.copper';
}
