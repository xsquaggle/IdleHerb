/**
 * The windows behind the bottom bar: Chests, Cards, Replant with the Compost
 * Shop, Settings, and the welcome-back note after time away.
 */
import { Container, Graphics, Sprite } from 'pixi.js';
import { formatCost, formatDuration, formatNum, type CardDef, type Num } from '@sprout/core';
import { C, rarityIndex } from '../engine/palette';
import { PixelText } from '../engine/font';
import { Button, F, box } from '../engine/ui';
import { tex } from '../engine/assets';
import { clock } from '../engine/tween';
import { setMuted, sfx } from '../engine/audio';
import { content, txt, ui, floorName, cardName } from '../app/content';
import { session } from '../app/session';
import { shell, wipeSave } from '../app/save';
import { Window, ink } from './window';
import { bigCard, smallCard, TILE_H, TILE_W } from './cards';

const CHEST_ORDER = ['chest.welcome', 'chest.hiring', 'chest.seed_packet', 'chest.wooden', 'chest.copper', 'chest.silver', 'chest.golden', 'chest.crystal', 'chest.starlight'];
const CHEST_MAT: Record<string, string> = {
  'chest.wooden': 'common', 'chest.copper': 'copper', 'chest.silver': 'silver', 'chest.golden': 'legendary',
  'chest.crystal': 'crystal', 'chest.starlight': 'starlight', 'chest.welcome': 'copper', 'chest.hiring': 'common', 'chest.seed_packet': 'common',
};

function row(g: Graphics, y: number, w: number, h: number): void {
  box(g, 0, y, w, h, C['cream-1'], 1);
  g.rect(1, y + 1, w - 2, h - 2).fill(C['cream-4']);
}

export class ChestsPanel extends Window {
  private sig = '';
  constructor() {
    super(ui('chests'), 340, 440);
  }

  protected build(width: number): void {
    const s = session.game.state;
    const ids = CHEST_ORDER.filter((id) => (s.chests[id] ?? 0) > 0).concat(Object.keys(s.chests).filter((id) => !CHEST_ORDER.includes(id) && (s.chests[id] ?? 0) > 0));
    this.sig = ids.map((id) => `${id}:${s.chests[id]}`).join(',');
    if (ids.length === 0) {
      this.body.addChild(Object.assign(ink(ui('no_chests'), { maxWidth: width - 8 }), { x: 4, y: 6 }));
      return;
    }
    let y = 0;
    const g = new Graphics();
    this.body.addChild(g);
    for (const id of ids) {
      const h = 84;
      row(g, y, width, h);
      const sp = new Sprite(tex(`chests/frames/${CHEST_MAT[id] ?? 'common'}_closed_96x80.png`));
      sp.position.set(2, y + 2);
      this.body.addChild(sp);
      const name = ink(txt('chests', id), { maxWidth: width - 110 });
      name.position.set(102, y + 10);
      const count = ink(`x${s.chests[id]}`, { color: C['wood-3'] });
      count.position.set(102, y + 26);
      const open = new Button({ w: Math.min(110, width - 108), h: 28, look: 'gold', label: ui('open') });
      open.position.set(102, y + 46);
      open.onTap = () => {
        if (session.game.dispatch({ type: 'openChest', chest: id })) sfx.open();
      };
      this.body.addChild(name, count, open);
      y += h + 4;
    }
  }

  override update(): void {
    const s = session.game.state;
    const sig = Object.keys(s.chests)
      .filter((id) => (s.chests[id] ?? 0) > 0)
      .map((id) => `${id}:${s.chests[id]}`)
      .sort()
      .join(',');
    if (sig !== this.sig.split(',').sort().join(',')) this.rebuild();
  }
}

export class CardsPanel extends Window {
  private detail: Container | null = null;
  private sig = '';

  constructor() {
    super(ui('cards'), 360, 520);
  }

  private signature(): string {
    return Object.entries(session.game.state.cards)
      .map(([k, v]) => `${k}:${v.level}:${v.copies}`)
      .join(',');
  }

  protected build(width: number): void {
    const s = session.game.state;
    this.sig = this.signature();
    // World 1's managers in floor order, then plants: owned first, rarest first.
    const managers = content.worlds[0]!.floors.map((f) => f.manager.id);
    const plants = content.plants.filter((p) => p.launch && (p.source === 'chest' || s.cards[p.id])).map((p) => p.id);
    const sections: [string, string[]][] = [
      [ui('managers_title'), managers],
      [ui('plants_title'), plants.sort((a, b) => Number(!!s.cards[b]) - Number(!!s.cards[a]) || rarityIndex(content.cards.get(b)!.rarity) - rarityIndex(content.cards.get(a)!.rarity))],
    ];
    const cols = Math.max(2, Math.floor((width + 4) / (TILE_W + 4)));
    const gap = Math.floor((width - cols * TILE_W) / Math.max(1, cols - 1));
    let y = 0;
    for (const [title, ids] of sections) {
      if (title === ui('plants_title') && s.unlocked['feature.plants'] === undefined && !ids.some((id) => s.cards[id])) continue;
      const t = ink(title, { color: C['wood-2'] });
      t.position.set(0, y);
      this.body.addChild(t);
      y += 16;
      ids.forEach((id, i) => {
        const own = s.cards[id];
        const def = content.cards.get(id)! as CardDef;
        const need = own ? def.dupes[own.level - 1] ?? 0 : 0;
        const tile = smallCard(id, own?.level ?? 0, own?.copies ?? 0, need, !!own);
        tile.position.set((i % cols) * (TILE_W + gap), y + Math.floor(i / cols) * (TILE_H + 4));
        if (own) {
          tile.eventMode = 'static';
          tile.cursor = 'pointer';
          tile.on('pointertap', () => this.showDetail(id));
          if (own.level < def.maxLevel && own.copies >= need) {
            const up = new Sprite(tex('icons/ui/upgrade_arrow_16.png'));
            up.position.set(TILE_W - 20, 4);
            tile.addChild(up);
            let t0 = Math.random() * 3;
            clock.every(() => {
              if (up.destroyed) return false;
              t0 += 0.016;
              up.y = 4 + Math.round(Math.sin(t0 * 5));
              return true;
            });
          }
        }
        this.body.addChild(tile);
      });
      y += Math.ceil(ids.length / cols) * (TILE_H + 4) + 6;
    }
  }

  private showDetail(id: string): void {
    sfx.card();
    this.detail?.destroy({ children: true });
    const s = session.game.state;
    const own = s.cards[id]!;
    const def = content.cards.get(id)! as CardDef;
    const need = def.dupes[own.level - 1] ?? 0;
    const d = new Container();
    const shade = new Graphics().rect(0, 0, 4000, 4000).fill({ color: C['ink-1'], alpha: 0.7 });
    shade.eventMode = 'static';
    shade.on('pointertap', () => {
      d.destroy({ children: true });
      this.detail = null;
    });
    d.addChild(shade);
    const card = bigCard(id, own.level, { copies: [own.copies, need] });
    const sw = this.shadeW();
    const sh = this.shadeH();
    const wide = sw > sh && sh < 420;
    const cx = wide ? Math.floor(sw / 2) - 100 : Math.floor(sw / 2);
    const top = wide ? Math.floor((sh - 240) / 2) : Math.max(8, Math.floor(sh / 2) - 160);
    card.position.set(cx - 90, top);
    d.addChild(card);
    const bx = wide ? cx + 100 : cx - 80;
    let by = wide ? top + 40 : top + 248;
    const status = new PixelText(F.body, own.level >= def.maxLevel ? ui('max_level') : `${own.copies} / ${need} ${ui('copies')}`, { color: C.white, outline: true });
    status.position.set(bx, by);
    d.addChild(status);
    by += 18;
    if (own.level < def.maxLevel) {
      const lvl = new Button({ w: 160, h: 28, look: 'leaf', label: ui('level_up') });
      lvl.enabled = own.copies >= need;
      lvl.position.set(bx, by);
      lvl.onTap = () => {
        if (session.game.dispatch({ type: 'levelCard', id })) {
          sfx.levelUp();
          this.rebuild();
          this.showDetail(id);
        }
      };
      d.addChild(lvl);
      by += 32;
    }
    if (def.kind === 'plant' && s.unlocked['feature.plants'] !== undefined) {
      const where = bestFloorFor(def);
      const plantBtn = new Button({ w: 160, h: 28, look: 'gold', label: where >= 0 ? `${ui('plant')}: ${shortFloor(where)}` : ui('plant') });
      plantBtn.enabled = where >= 0;
      plantBtn.position.set(bx, by);
      plantBtn.onTap = () => {
        if (plantOn(id, where)) {
          sfx.levelUp();
          session.hooks.toast(`${cardName(id)} ${ui('planted_on')} ${floorName(0, where)}`, C['leaf-5']);
          d.destroy({ children: true });
          this.detail = null;
        }
      };
      d.addChild(plantBtn);
      by += 32;
    }
    const close = new Button({ w: 160, h: 24, look: 'wood', label: ui('close') });
    close.position.set(bx, by);
    close.onTap = () => {
      d.destroy({ children: true });
      this.detail = null;
    };
    d.addChild(close);
    this.detail = d;
    this.addChild(d);
  }

  private shadeW(): number {
    return this.sw;
  }

  private shadeH(): number {
    return this.sh;
  }

  override update(): void {
    if (!this.detail && this.signature() !== this.sig) this.rebuild();
  }
}

function shortFloor(i: number): string {
  return floorName(0, i).split(' ')[0] ?? '';
}

/** The open floor that favours a plant's family, else the highest open floor. */
export function bestFloorFor(def: CardDef): number {
  if (def.kind !== 'plant') return -1;
  const floors = session.game.state.worlds[0]!.floors;
  const defs = content.worlds[0]!.floors;
  let fallback = -1;
  for (let i = 0; i < floors.length; i++) {
    if (floors[i]!.level <= 0) continue;
    if (defs[i]!.favouredFamily === def.family || defs[i]!.favouredFamily === 'wild') return i;
    fallback = i;
  }
  return fallback;
}

/** Puts a plant in a floor's planters, replacing the oldest when they are full. */
export function plantOn(id: string, floor: number): boolean {
  const g = session.game;
  const f = g.state.worlds[0]!.floors[floor]!;
  const cap = g.derived.global.planters;
  const list = f.plants.filter((p) => p !== id);
  list.push(id);
  while (list.length > cap) list.shift();
  return g.dispatch({ type: 'plant', world: 0, floor, plants: list });
}

export class ReplantPanel extends Window {
  private pending = '';
  constructor() {
    super(ui('replant_title'), 360, 520);
  }

  protected build(width: number): void {
    const g = session.game;
    const s = g.state;
    const gain = g.pendingCompost(0);
    this.pending = formatNum(gain);
    let y = 0;
    const body = ink(ui('replant_body'), { maxWidth: width - 4 });
    body.position.set(2, y);
    this.body.addChild(body);
    y += body.textHeight + 10;
    const line = new Container();
    const ic = new Sprite(tex('ui/compost_16.png'));
    const t = ink(`+${formatNum(gain)} ${txt('currencies', 'compost')}`, { color: C['wood-2'] });
    t.position.set(20, 2);
    line.addChild(ic, t);
    line.position.set(2, y);
    this.body.addChild(line);
    y += 22;
    const btn = new Button({ w: Math.min(220, width), h: 30, look: 'lavender', label: ui('replant_now'), icon: tex('ui/compost_16.png') });
    btn.enabled = g.canReplant(0);
    btn.position.set(Math.floor((width - btn.w) / 2), y);
    btn.onTap = () => {
      if (g.dispatch({ type: 'replant', world: 0 })) this.close();
    };
    this.body.addChild(btn);
    y += 40;
    if (!g.canReplant(0)) {
      const why = ink(ui('replant_not_yet'), { maxWidth: width - 4, color: C['wood-3'] });
      why.position.set(2, y - 6);
      this.body.addChild(why);
      y += why.textHeight + 6;
    }

    // Compost Shop.
    const head = new Container();
    const hg = new Graphics();
    hg.rect(0, 6, width, 1).fill(C['wood-4']);
    head.addChild(hg);
    const ht = ink(`${ui('compost_shop')}   `, { color: C['wood-2'] });
    ht.position.set(0, 10);
    const have = ink(`${formatNum(s.compost)} ${txt('currencies', 'compost')}`, { color: C['leaf-2'], align: 'right' });
    have.position.set(width, 10);
    head.addChild(ht, have);
    head.position.set(0, y);
    this.body.addChild(head);
    y += 30;
    const shopOpen = s.unlocked['feature.research'] !== undefined;
    if (!shopOpen) {
      const note = ink(ui('shop_after_replant'), { maxWidth: width - 4, color: C['wood-3'] });
      note.position.set(2, y);
      this.body.addChild(note);
      return;
    }
    const rows = new Graphics();
    this.body.addChild(rows);
    for (const r of content.compostShop) {
      const lv = s.compostShop[r.id] ?? 0;
      const cost = g.compostShopCost(r.id);
      const h = 46;
      row(rows, y, width, h);
      const name = ink(`${txt('shop', r.id)}  ${lv}/${r.maxLevel}`);
      name.position.set(6, y + 5);
      const eff = new PixelText(F.small, txt('shop_effects', r.id).toUpperCase(), { color: C['wood-3'], maxWidth: width - 100 });
      eff.position.set(6, y + 22);
      const buy = new Button({ w: 82, h: 26, look: 'leaf', label: cost ? formatCost(cost) : ui('max'), icon: tex('ui/compost_10.png') });
      buy.enabled = !!cost && s.compost.gte(cost);
      buy.position.set(width - 88, y + 10);
      buy.onTap = () => {
        if (g.dispatch({ type: 'buyCompostShop', id: r.id })) {
          sfx.levelUp();
          this.rebuild();
        }
      };
      this.body.addChild(name, eff, buy);
      y += h + 3;
    }
  }

  override update(): void {
    const p = formatNum(session.game.pendingCompost(0));
    if (p !== this.pending) this.rebuild();
  }
}

export class SettingsPanel extends Window {
  private confirmReset = 0;
  constructor() {
    super(ui('settings'), 300, 330);
  }

  protected build(width: number): void {
    const st = session.settings;
    let y = 0;
    const mk = (label: string, look: 'wood' | 'leaf' | 'red', fn: () => void) => {
      const b = new Button({ w: width, h: 28, look, label });
      b.position.set(0, y);
      b.onTap = fn;
      this.body.addChild(b);
      y += 34;
      return b;
    };
    mk(st.muted ? ui('sound_off') : ui('sound_on'), st.muted ? 'wood' : 'leaf', () => {
      st.muted = !st.muted;
      setMuted(st.muted);
      session.saveSettings();
      this.rebuild();
    });
    mk(st.reduceMotion ? ui('reduce_motion_on') : ui('reduce_motion_off'), st.reduceMotion ? 'leaf' : 'wood', () => {
      st.reduceMotion = !st.reduceMotion;
      session.saveSettings();
      this.rebuild();
    });
    mk(this.confirmReset === 0 ? ui('reset') : ui('reset_confirm'), 'red', () => {
      this.confirmReset++;
      if (this.confirmReset >= 2) {
        wipeSave();
        session.hooks.toast(ui('reset_done'));
        clock.after(0.3, () => location.reload());
        (window as unknown as { __sproutNoSave?: boolean }).__sproutNoSave = true;
      }
      this.rebuild();
    });
    if (shell) {
      const sh = shell;
      mk(ui('fullscreen'), 'wood', () => sh.toggleFullscreen());
      mk(ui('open_saves'), 'wood', () => sh.openSaveFolder());
    }
    const where = shell ? ` · v${shell.info.version}${shell.info.portable ? ' portable' : ''}` : '';
    const info = ink(`${ui('build')} ${__BUILD__}${where}`, { font: F.small, color: C['wood-3'] });
    info.position.set(0, y + 4);
    this.body.addChild(info);
    const help = ink(shell ? `${ui('controls_help')} ${ui('controls_help_desktop')}` : ui('controls_help'), { maxWidth: width, color: C['wood-2'] });
    help.position.set(0, y + 18);
    this.body.addChild(help);
  }
}

export class WelcomeBack extends Window {
  constructor(
    private readonly seconds: number,
    private readonly earned: Num,
  ) {
    super(ui('welcome_back'), 300, 220);
  }

  protected build(width: number): void {
    const t = ink(`${ui('while_away')} (${formatDuration(this.seconds)})`, { maxWidth: width, align: 'center' });
    t.position.set(Math.floor(width / 2), 6);
    this.body.addChild(t);
    const line = new Container();
    const ic = new Sprite(tex('ui/coin_16.png'));
    const amt = new PixelText(F.big, `+${formatNum(this.earned)}`, { color: C['gold-2'] });
    amt.position.set(22, 0);
    line.addChild(ic, amt);
    line.position.set(Math.floor((width - (22 + amt.textWidth)) / 2), 40);
    this.body.addChild(line);
    const btn = new Button({ w: 140, h: 30, look: 'leaf', label: ui('collect') });
    btn.position.set(Math.floor((width - 140) / 2), 80);
    btn.onTap = () => this.close();
    this.body.addChild(btn);
  }
}

declare const __BUILD__: string;
export { content };
