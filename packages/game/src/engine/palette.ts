/**
 * The master palette (style bible section 8) as numbers for PixiJS. Read from the
 * Art Director's palette file, so the UI can never drift from the sprites.
 * `C['leaf-4']` is the fourth step of the leaf ramp, counted dark to light.
 */
import paletteFile from '../../../../docs/art/palette/sprout_master_palette_v1.json';

interface PaletteFile {
  ramps: { id: string; colors: string[] }[];
}

const table: Record<string, number> = {};
for (const ramp of (paletteFile as PaletteFile).ramps) {
  ramp.colors.forEach((hex, i) => {
    table[`${ramp.id}-${i + 1}`] = parseInt(hex.slice(1), 16);
  });
}
table.white = table['white-1']!;

export const C = table as Record<string, number> & { white: number };

/** Rarity colours and cues (style bible 8, "Rarity colours"). One row per tier, in order. */
export interface RarityLook {
  id: string;
  /** Main colour, a light step, a dark step. */
  main: number;
  light: number;
  dark: number;
  pips: number;
}

export const RARITY_LOOKS: RarityLook[] = [
  { id: 'common', main: C['wood-4'], light: C['wood-6'], dark: C['wood-2'], pips: 1 },
  { id: 'uncommon', main: C['leaf-4'], light: C['leaf-5'], dark: C['leaf-2'], pips: 2 },
  { id: 'rare', main: C['sky-3'], light: C['sky-4'], dark: C['sky-2'], pips: 3 },
  { id: 'epic', main: C['lavender-4'], light: C['lavender-5'], dark: C['lavender-2'], pips: 4 },
  { id: 'legendary', main: C['gold-3'], light: C['gold-5'], dark: C['gold-2'], pips: 5 },
  { id: 'exotic', main: C['teal-3'], light: C['rose-3'], dark: C['lavender-3'], pips: 6 },
  { id: 'mythic', main: C['teal-2'], light: C['lavender-5'], dark: C['sky-1'], pips: 7 },
  { id: 'godly', main: C['cream-4'], light: C.white, dark: C['gold-4'], pips: 8 },
];

export function rarityLook(id: string): RarityLook {
  return RARITY_LOOKS.find((r) => r.id === id) ?? RARITY_LOOKS[0]!;
}

export function rarityIndex(id: string): number {
  const i = RARITY_LOOKS.findIndex((r) => r.id === id);
  return i < 0 ? 0 : i;
}
