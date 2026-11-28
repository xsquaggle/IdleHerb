/**
 * Card faces: the large card (style bible 19's Show beat, art/cards/frames) and
 * the small tile for the collection. The card's tier (its native tier raised by
 * any Tier Ups) drives the frame, colours and pips from tables/tiers.yaml, so a
 * new tier needs one row there and its art, not new code. A tier whose frame is
 * not drawn yet borrows the nearest lower frame and wears its own colours round it.
 */
import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import type { CardDef, Effect } from '@sprout/core';
import { C } from '../engine/palette';
import { PixelText } from '../engine/font';
import { F, box } from '../engine/ui';
import { tex, hasTex, texList } from '../engine/assets';
import { content, cardName, txt } from '../app/content';
import { cardTierIndex, nearestBelow, tierAt } from '../app/tiers';
import frames from '../../../../art/cards/frames/frames.json';
import plantCards from '../../../../art/cards/plants/cards.json';

interface FrameInfo {
  file: string;
  window: [number, number, number, number];
}
const FRAMES = (frames as unknown as { frames: Record<string, FrameInfo> }).frames;

const STAT_WORDS: Record<string, string> = {
  'floor.profit': 'Profit',
  'floor.speed': 'Speed',
  'floor.levelCost': 'Level costs',
  'tap.power': 'Tap power',
  'tap.critChance': 'Bumper chance',
  'tap.critMult': 'Bumper size',
  'tower.milestoneMult': 'Milestone bonus',
  'plant.power': 'Plant power',
  'insight.gain': 'Insight',
  'offline.earnings': 'Offline earnings',
  'visitor.reward': 'Visitor rewards',
  'compost.gain': 'Compost',
  'chest.luck': 'Chest luck',
};
const SCOPE_WORDS: Record<string, string> = { floor: 'this floor', adjacent: 'next-door floors', world: 'this world', global: 'everywhere' };

/** "Profit +20% on this floor" from an effect. */
export function describeEffect(e: Effect, level = 1, perLevel = 0): string {
  const v = e.value * (1 + perLevel * (level - 1));
  const word = STAT_WORDS[e.stat] ?? e.stat.split('.').pop()!;
  let amount: string;
  if (e.op === 'inc') amount = `${v >= 0 ? '+' : ''}${Math.round(v * 1000) / 10}%`;
  else if (e.op === 'mul') amount = `x${Math.round(v * 100) / 100}`;
  else if (e.op === 'reduce') amount = `-${Math.round(v * 1000) / 10}%`;
  else amount = e.stat === 'tap.critChance' ? `+${Math.round(v * 1000) / 10}%` : `+${Math.round(v * 100) / 100}`;
  const fam = e.family ? ` (${e.family})` : '';
  return `${word} ${amount}${fam}, ${SCOPE_WORDS[e.scope ?? 'global']}`;
}

/** The picture for a card: a plant's card art, or the manager standing. */
export function cardArt(def: CardDef): Texture {
  if (def.kind === 'plant') {
    const key = plantArtKey(def.id);
    if (key) return tex(key);
    return Texture.EMPTY;
  }
  const folder = `actors/w${def.world + 1}_floor${String(def.floorIndex + 1).padStart(2, '0')}_manager`;
  const list = texList(folder);
  return list[0] ? tex(list[0]) : Texture.EMPTY;
}

function plantArtKey(id: string): string | null {
  // plant.mint.garden -> mint_garden; the art map may give a different file.
  const map = (plantCards as unknown as { cards?: Record<string, { file: string; plant: string }> }).cards ?? {};
  const mapped = Object.values(map).find((c) => c.plant === id)?.file;
  if (mapped && hasTex(`cards/plants/${mapped}`)) return `cards/plants/${mapped}`;
  const [, fam, kind] = id.split('.');
  const guess = `cards/plants/${fam}_${kind}_108x100.png`;
  return hasTex(guess) ? guess : null;
}

/** The frame art for a tier: its own, else the nearest lower tier's. `own` is false for a borrowed frame. */
function frameFor(index: number): { info: FrameInfo; own: boolean } {
  const info = nearestBelow(index, (r) => FRAMES[r.id]) ?? Object.values(FRAMES)[0]!;
  return { info, own: FRAMES[tierAt(index).id] !== undefined };
}

/**
 * The large card, 180x240, origin top-left. `tier`: show it at this 0-based tier (the reveal
 * theatre); otherwise the card's own tier.
 */
export function bigCard(id: string, level: number, opts: { newCard?: boolean; copies?: [number, number]; tier?: number } = {}): Container {
  const def = content.cards.get(id)!;
  const tierI = opts.tier ?? cardTierIndex(id);
  const look = tierAt(tierI);
  const c = new Container();
  const { info: frameInfo, own: ownFrame } = frameFor(tierI);
  const [wx, wy, ww, wh] = frameInfo.window;
  const back = new Graphics();
  back.rect(wx, wy, ww, wh).fill(look.dark);
  // Soft rays behind the picture in the rarity's light colour.
  for (let i = 0; i < 6; i++) back.rect(wx + 6 + i * Math.floor(ww / 6), wy, 3, wh).fill({ color: look.main, alpha: 0.35 });
  c.addChild(back);
  const art = new Sprite(cardArt(def));
  if (def.kind === 'plant') art.position.set(36, 33);
  else {
    art.anchor.set(0.5, 1);
    art.position.set(wx + Math.floor(ww / 2), wy + wh + 4);
  }
  // The manager stands in the window; a mask keeps feet off the ribbon.
  const m = new Graphics().rect(wx, wy, ww, wh).fill(0xffffff);
  art.mask = m;
  c.addChild(m, art, new Sprite(tex(`cards/frames/${frameInfo.file}`)));
  if (!ownFrame) {
    // Placeholder until the tier's frame is drawn: a band of the tier's colours round the borrowed frame.
    const band = new Graphics();
    const ring = (x: number, y: number, w: number, h: number, t: number, col: number) => {
      band.rect(x, y, w, t).fill(col);
      band.rect(x, y + h - t, w, t).fill(col);
      band.rect(x, y + t, t, h - t * 2).fill(col);
      band.rect(x + w - t, y + t, t, h - t * 2).fill(col);
    };
    ring(0, 0, 180, 240, 2, look.dark);
    ring(2, 2, 176, 236, 3, look.main);
    band.rect(6, 3, 168, 1).fill(look.light);
    // The colours the tier braids, as a strip along the foot of the frame.
    look.flood.slice(0, 11).forEach((col, i, all) => {
      const w = Math.floor(160 / all.length);
      band.rect(10 + i * w, 236, w - 1, 2).fill(col);
    });
    c.addChild(band);
  }
  const name = new PixelText(F.body, cardName(id), { align: 'center', color: C['ink-1'] });
  name.position.set(90, 139 - F.body.capTop - Math.ceil(F.body.cap / 2));
  c.addChild(name);
  const row1 = new PixelText(F.body, `${txt('rarities', look.id)}  Lv ${level}`, { align: 'center', color: look.index === 0 ? C['wood-2'] : look.dark === C['ink-1'] ? C['lavender-2'] : look.dark });
  row1.position.set(90, 171 - F.body.capTop - Math.ceil(F.body.cap / 2));
  c.addChild(row1);
  let line2 = '';
  if (def.kind === 'manager') line2 = describeEffect(def.perk, level, content.tuning.PERK_PER_LEVEL);
  else line2 = def.traitDefs.map((t) => `${STAT_WORDS[t.stat] ?? t.stat} +${Math.round(t.base * 100)}%`).join(', ');
  const row2 = new PixelText(F.small, line2.toUpperCase(), { align: 'center', color: C['ink-2'], maxWidth: 120 });
  row2.position.set(90, 188 - F.small.capTop);
  c.addChild(row2);
  if (opts.copies) {
    const [have, need] = opts.copies;
    const g = new Graphics();
    box(g, 40, 205, 100, 7, C['ink-1'], 1);
    g.rect(41, 206, 98, 5).fill(C['ink-2']);
    const fw = Math.round(98 * Math.min(1, have / Math.max(1, need)));
    if (fw > 0) g.rect(41, 206, fw, 5).fill(have >= need ? C['leaf-4'] : look.main);
    c.addChild(g);
  }
  if (opts.newCard) {
    const tag = new PixelText(F.big, 'New!', { align: 'center', color: C['gold-5'], outline: true });
    tag.position.set(150, 30);
    tag.rotation = 0.2;
    c.addChild(tag);
  }
  return c;
}

/** A small collection tile: 76x96. */
export const TILE_W = 76;
export const TILE_H = 96;
export function smallCard(id: string, level: number, copies: number, need: number, owned: boolean): Container {
  const def = content.cards.get(id)!;
  const look = tierAt(cardTierIndex(id));
  const c = new Container();
  const g = new Graphics();
  // Frame in the rarity colours: dark outline, main body, light top line.
  box(g, 0, 0, TILE_W, TILE_H, C['ink-1'], 2);
  box(g, 1, 1, TILE_W - 2, TILE_H - 2, owned ? look.main : C['ash-2'], 1);
  g.rect(2, 1, TILE_W - 4, 1).fill(owned ? look.light : C['ash-3']);
  g.rect(4, 4, TILE_W - 8, 56).fill(owned ? look.dark : C['ash-1']);
  box(g, 4, 62, TILE_W - 8, 30, C['cream-3'], 1);
  c.addChild(g);
  const tex0 = cardArt(def);
  const art = new Sprite(tex0);
  if (def.kind === 'plant') {
    art.texture = new Texture({ source: tex0.source, frame: new Rectangle(tex0.frame.x + 26, tex0.frame.y + 22, Math.min(56, tex0.width), Math.min(54, tex0.height)) });
    art.position.set(10, 5);
  } else {
    art.texture = new Texture({ source: tex0.source, frame: new Rectangle(tex0.frame.x + 20, tex0.frame.y + 2, 56, 56) });
    art.position.set(10, 4);
  }
  if (!owned) art.tint = C['ink-2'];
  c.addChild(art);
  // Rarity pips along the top of the picture. From 6 up: a gold bar for the first five, then single pips (bible 8).
  const pips = new Graphics();
  if (look.pips <= 5) {
    for (let i = 0; i < look.pips; i++) {
      pips.rect(6 + i * 5, 6, 3, 3).fill(C['ink-1']);
      pips.rect(7 + i * 5, 7, 1, 1).fill(look.light);
    }
  } else {
    pips.rect(6, 6, 18, 3).fill(C['ink-1']);
    pips.rect(7, 7, 16, 1).fill(C['gold-4']);
    for (let i = 0; i < look.pips - 5; i++) {
      pips.rect(26 + i * 5, 6, 3, 3).fill(C['ink-1']);
      pips.rect(27 + i * 5, 7, 1, 1).fill(look.light);
    }
  }
  c.addChild(pips);
  const name = new PixelText(F.small, cardName(id).toUpperCase(), { align: 'center', color: C['ink-1'], maxWidth: TILE_W - 10 });
  name.position.set(TILE_W / 2, 66 - F.small.capTop);
  c.addChild(name);
  if (owned) {
    const lv = new PixelText(F.small, `LV ${level}`, { color: C['ink-1'] });
    lv.position.set(8, 84 - F.small.capTop);
    c.addChild(lv);
    const bar = new Graphics();
    box(bar, 30, 82, 40, 6, C['ink-1'], 1);
    bar.rect(31, 83, 38, 4).fill(C['ink-2']);
    const fw = Math.round(38 * Math.min(1, copies / Math.max(1, need)));
    if (fw > 0) bar.rect(31, 83, fw, 4).fill(copies >= need ? C['leaf-4'] : look.main);
    c.addChild(bar);
  }
  return c;
}

