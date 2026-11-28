/**
 * The content bundle (packages/content, `pnpm content:bundle`): design 0.4
 * tables and the English display text, hydrated once at boot.
 */
import { hydrateContent, type Content, type RawContent } from '@sprout/core';
import bundle from '@content/content.json';

interface Bundle {
  design: string;
  overlays: string[];
  raw: RawContent;
  text: Record<string, Record<string, string>>;
}

const b = bundle as unknown as Bundle;

export const DESIGN = b.design;
export const content: Content = hydrateContent(b.raw);
const TEXT = b.text;

/** Display text by section and id, e.g. `txt('floors', 'floor.w1.balcony')`. Falls back to a readable id. */
export function txt(section: string, id: string): string {
  const v = TEXT[section]?.[id];
  if (v !== undefined) return v;
  const tail = id.split('.').pop() ?? id;
  return tail.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export const ui = (id: string): string => txt('ui', id);
export const pipLine = (id: string): string | undefined => TEXT.pip?.[id];

export function floorName(w: number, i: number): string {
  return txt('floors', content.worlds[w]!.floors[i]!.id);
}

export function cardName(id: string): string {
  const def = content.cards.get(id);
  if (def?.kind === 'manager') return txt('managers', id);
  return txt('plants', id);
}
