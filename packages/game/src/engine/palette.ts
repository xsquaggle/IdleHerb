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

// Rarity colours live with the tiers (tables/tiers.yaml), read by app/tiers.ts.
