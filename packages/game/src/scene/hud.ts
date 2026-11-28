/**
 * The heads-up display: Coins and income at the top, the player's level and
 * Gems either side, the Combo meter and Growth Spurt once they unlock, the
 * story quest, and the bottom bar of panels. It adapts to any width from a
 * phone held upright to a wide PC window.
 */
import { Container, Graphics, Sprite } from 'pixi.js';
import { comboMult, formatNum, Num, xpToNext } from '@sprout/core';
import { C } from '../engine/palette';
import { PixelText } from '../engine/font';
import { Bar, Button, F, box, chip, pop } from '../engine/ui';
import { tex } from '../engine/assets';
import { clock, ease } from '../engine/tween';
import { session, BUY_MODES } from '../app/session';
import { content, txt, ui } from '../app/content';
import { sfx } from '../engine/audio';

export const TOP_H = 38;
export const BOTTOM_H = 42;

export class Hud extends Container {
  private readonly coinChip = new Graphics();
  private readonly coinIcon = new Sprite(tex('ui/coin_16.png'));
  private readonly coins: PixelText;
  private readonly rate: PixelText;
  private readonly lvChip = new Graphics();
  private readonly lvText: PixelText;
  private readonly xpBar = new Bar(30, 4, C['lavender-4'], C['lavender-5']);
  private readonly gemChip = new Graphics();
  private readonly gemIcon = new Sprite(tex('ui/gem_16.png'));
  private readonly gems: PixelText;
  private readonly combo = new Container();
  private readonly comboBar = new Bar(80, 6, C['gold-3'], C['gold-4']);
  private readonly comboText: PixelText;
  readonly spurt: Button;
  private readonly spurtBar = new Bar(30, 4, C['sky-3'], C['sky-4']);
  private readonly quest = new Container();
  private readonly questBg = new Graphics();
  private readonly questText: PixelText;
  private readonly bottom = new Container();
  private readonly bottomBg = new Graphics();
  readonly buyMode: Button;
  readonly chests: Button;
  readonly cards: Button;
  readonly replant: Button;
  readonly settings: Button;
  private readonly chestBadge = new Container();
  private readonly chestBadgeText: PixelText;
  private w = 0;
  private h = 0;
  private shownCoins = Num.ZERO;
  private questId = '';
  private wasUnlocked: Record<string, boolean> = {};
  private chipW = { coin: 0, gem: 0, screen: 0 };
  private badgeCount = -1;

  constructor() {
    super();
    this.coins = new PixelText(F.big, '0', { color: C.white });
    this.rate = new PixelText(F.body, '', { color: C['leaf-5'] });
    this.lvText = new PixelText(F.body, '', { align: 'center', color: C['gold-4'] });
    this.gems = new PixelText(F.body, '0', { color: C.white });
    this.addChild(this.coinChip, this.coinIcon, this.coins, this.rate, this.lvChip, this.lvText, this.xpBar, this.gemChip, this.gemIcon, this.gems);

    // Combo meter.
    this.comboText = new PixelText(F.body, 'x1.0', { color: C['gold-4'], outline: true });
    const chev = new Sprite(tex('icons/ui/triple_chevrons_16.png'));
    this.combo.addChild(chev, this.comboBar, this.comboText);
    this.comboBar.position.set(19, 5);
    this.comboText.position.set(103, 0);
    this.combo.visible = false;
    this.addChild(this.combo);

    // Growth Spurt.
    this.spurt = new Button({ w: 40, h: 30, look: 'sky', icon: tex('icons/ui/lightning_24.png') });
    this.spurt.onTap = () => {
      if (session.game.dispatch({ type: 'startSpurt' })) sfx.spurt();
    };
    this.spurt.addChild(this.spurtBar);
    this.spurtBar.position.set(5, 23);
    this.spurt.visible = false;
    this.addChild(this.spurt);

    // Story quest pin.
    this.questText = new PixelText(F.body, '', { color: C['ink-1'], maxWidth: 160 });
    const scroll = new Sprite(tex('icons/ui/quest_scroll_16.png'));
    scroll.position.set(5, 4);
    this.questText.position.set(24, 4);
    this.quest.addChild(this.questBg, scroll, this.questText);
    this.quest.eventMode = 'static';
    this.addChild(this.quest);

    // Bottom bar.
    this.buyMode = new Button({ w: 56, h: 30, look: 'wood', label: 'x1', font: F.body });
    this.buyMode.onTap = () => {
      session.settings.buyMode = (session.settings.buyMode + 1) % BUY_MODES.length;
      session.saveSettings();
      this.buyMode.setText(BUY_MODES[session.settings.buyMode]!);
      pop(this.buyMode, 0.2);
    };
    this.chests = new Button({ w: 64, h: 30, look: 'wood', label: ui('chests'), icon: tex('ui/chest_16.png') });
    this.chests.onTap = () => session.hooks.openPanel('chests');
    this.cards = new Button({ w: 64, h: 30, look: 'wood', label: ui('cards'), icon: tex('icons/ui/card_stack_16.png') });
    this.cards.onTap = () => session.hooks.openPanel('cards');
    this.replant = new Button({ w: 64, h: 30, look: 'lavender', label: ui('replant'), icon: tex('ui/compost_16.png') });
    this.replant.onTap = () => session.hooks.openPanel('replant');
    this.settings = new Button({ w: 30, h: 30, look: 'wood', icon: tex('icons/ui/settings_gear_16.png') });
    this.settings.onTap = () => session.hooks.openPanel('settings');
    this.chestBadgeText = new PixelText(F.small, '', { align: 'center', color: C.white });
    this.bottom.addChild(this.bottomBg, this.buyMode, this.chests, this.cards, this.replant, this.settings);
    this.chests.addChild(this.chestBadge);
    this.addChild(this.bottom);
    this.buyMode.setText(BUY_MODES[session.settings.buyMode] ?? 'x1');
    this.wasUnlocked = { ...Object.fromEntries(Object.keys(session.game.state.unlocked).map((k) => [k, true])) };
  }

  layout(w: number, h: number): void {
    this.w = w;
    this.h = h;
    // Bottom bar: buttons share the width, the gear stays square.
    this.bottomBg.clear();
    this.bottomBg.rect(0, h - BOTTOM_H, w, BOTTOM_H).fill(C['wood-2']);
    this.bottomBg.rect(0, h - BOTTOM_H, w, 1).fill(C['ink-1']);
    this.bottomBg.rect(0, h - BOTTOM_H + 1, w, 1).fill(C['wood-4']);
    this.bottomBg.rect(0, h - BOTTOM_H + 2, w, 1).fill(C['wood-3']);
    this.relayoutBottom();
  }

  private relayoutBottom(): void {
    const w = this.w;
    const h = this.h;
    const unlocked = session.game.state.unlocked;
    const items: Button[] = [this.buyMode];
    this.chests.visible = unlocked['feature.managers'] !== undefined || Object.values(session.game.state.chests).some((n) => n > 0);
    this.cards.visible = unlocked['feature.managers'] !== undefined;
    this.replant.visible = unlocked['feature.replant'] !== undefined || session.game.state.worlds[0]!.replantsEver > 0;
    if (this.chests.visible) items.push(this.chests);
    if (this.cards.visible) items.push(this.cards);
    if (this.replant.visible) items.push(this.replant);
    items.push(this.settings);
    const maxW = Math.min(w, 520);
    const gap = 4;
    const fixed = 30 + 56;
    const flex = items.length - 2;
    const each = flex > 0 ? Math.min(92, Math.floor((maxW - 16 - fixed - gap * (items.length - 1)) / flex)) : 0;
    let x = Math.floor((w - (fixed + each * flex + gap * (items.length - 1))) / 2);
    for (const b of items) {
      const bw = b === this.settings ? 30 : b === this.buyMode ? 56 : each;
      b.resize(bw, 30);
      b.position.set(x, h - BOTTOM_H + 7);
      x += bw + gap;
    }
    // A narrow button drops its word and keeps its icon.
    for (const b of [this.chests, this.cards, this.replant]) {
      const want = b === this.chests ? ui('chests') : b === this.cards ? ui('cards') : ui('replant');
      const fits = F.body.measure(want) + 26 <= b.w;
      b.setText(fits ? want : '');
    }
  }

  /** The lowest y of the things pinned under the top bar (quest, combo, Spurt). */
  pinnedBottom(): number {
    let y = TOP_H + 2;
    if (this.combo.visible) y = Math.max(y, this.combo.y + 16);
    if (this.spurt.visible) y = Math.max(y, this.spurt.y + 32);
    if (this.quest.visible) y = Math.max(y, this.quest.y + this.questBg.height);
    return y + 4;
  }

  coinTarget(): { x: number; y: number } {
    return { x: this.coinIcon.x + 8, y: this.coinIcon.y + 8 };
  }

  coinLanded(): void {
    pop(this.coinIcon, 0.35, 0.12);
    pop(this.coins, 0.12, 0.12);
  }

  update(_dt: number): void {
    const g = session.game;
    const s = g.state;
    const w = this.w;
    const ws = s.worlds[0]!;

    // Coins roll toward the real value so big gains count up.
    const real = ws.coins;
    if (real.lt(this.shownCoins) || this.shownCoins.lte(0)) this.shownCoins = real;
    else this.shownCoins = this.shownCoins.add(real.sub(this.shownCoins).mul(0.25));
    if (real.sub(this.shownCoins).lt(real.mul(0.001).max(1))) this.shownCoins = real;
    this.coins.text = formatNum(this.shownCoins);
    const ips = g.worldIps(0);
    this.rate.text = ips.gt(0) ? `+${formatNum(ips)}${ui('per_sec')}` : '';
    this.rate.visible = ips.gt(0);

    // Chips grow in steps of 8 pixels so they are not redrawn every frame.
    const coinW = Math.ceil(Math.max(118, 16 + 6 + this.coins.textWidth + (this.rate.visible ? 8 + this.rate.textWidth : 0) + 14) / 8) * 8;
    const cx = Math.floor((w - coinW) / 2);
    if (coinW !== this.chipW.coin || w !== this.chipW.screen) {
      this.coinChip.clear();
      chip(this.coinChip, cx, 4, coinW, 30);
      this.chipW.coin = coinW;
    }
    this.coinIcon.position.set(cx + 8, 11);
    this.coins.position.set(cx + 30, 19 - F.big.capTop - Math.ceil(F.big.cap / 2));
    this.rate.position.set(this.coins.x + this.coins.textWidth + 8, 19 - F.body.capTop - Math.ceil(F.body.cap / 2));

    // Player level and XP.
    if (w !== this.chipW.screen) {
      this.lvChip.clear();
      chip(this.lvChip, 6, 4, 44, 30);
    }
    this.lvText.text = `${ui('level')} ${s.level}`;
    this.lvText.position.set(28, 9 - F.body.capTop);
    this.xpBar.position.set(13, 24);
    this.xpBar.value = s.xp / Math.max(1, xpToNext(s.level, g.t));

    // Gems.
    this.gems.text = formatNum(s.gems);
    const gw = Math.ceil(Math.max(48, 30 + this.gems.textWidth + 10) / 8) * 8;
    if (gw !== this.chipW.gem || w !== this.chipW.screen) {
      this.gemChip.clear();
      chip(this.gemChip, w - gw - 6, 4, gw, 30);
      this.chipW.gem = gw;
    }
    this.chipW.screen = w;
    this.gemIcon.position.set(w - gw + 2, 11);
    this.gems.position.set(w - gw + 22, 19 - F.body.capTop - Math.ceil(F.body.cap / 2));

    // Combo and Spurt, once the tap bonus is on.
    const tapBonus = s.unlocked['feature.tap_bonus'] !== undefined;
    this.combo.visible = tapBonus;
    if (tapBonus) {
      const cap = g.derived.worlds[0]!.comboCap;
      this.comboBar.value = s.combo / Math.max(1, cap);
      this.comboText.text = `x${comboMult(s.combo, g.t).toFixed(1)}`;
      this.combo.position.set(Math.floor(w / 2 - 66), TOP_H + 2);
    }
    const spurtOn = s.unlocked['feature.spurt'] !== undefined;
    this.spurt.visible = spurtOn;
    if (spurtOn) {
      this.spurt.position.set(w - 46, TOP_H + 2);
      const active = g.spurtActive(0);
      const need = g.derived.worlds[0]!.spurtTaps;
      this.spurtBar.value = active ? active.remaining / g.derived.worlds[0]!.spurtDuration : s.spurtMeter / Math.max(1, need);
      this.spurt.enabled = g.spurtReady();
      this.spurt.look = active ? 'gold' : 'sky';
      if (g.spurtReady()) this.spurt.y += Math.round(Math.sin(clock.time * 8));
    }

    // Story quest.
    const step = content.story[s.storyIndex];
    const qid = step?.id ?? '';
    if (qid !== this.questId) {
      this.questId = qid;
      this.questText.setMaxWidth(Math.min(200, Math.floor(w * 0.5)) - 30);
      this.questText.text = step ? txt('story', qid) : '';
      this.questBg.clear();
      if (step) {
        const qw = this.questText.textWidth + 30;
        const qh = Math.max(22, this.questText.textHeight + 10);
        box(this.questBg, 0, 0, qw, qh, C['ink-1'], 1);
        this.questBg.rect(1, 1, qw - 2, qh - 2).fill(C['cream-3']);
        this.questBg.rect(1, 1, qw - 2, 1).fill(C['cream-4']);
        this.questBg.rect(1, qh - 2, qw - 2, 1).fill(C['cream-2']);
        this.quest.scale.set(0.6);
        void clock.tween(this.quest.scale, { x: 1, y: 1 }, 0.25, { ease: ease.outBack });
      }
      this.quest.visible = !!step;
    }
    this.quest.position.set(6, TOP_H + (tapBonus ? 20 : 2));

    // Chest count badge.
    const chestCount = this.chests.visible ? Object.values(s.chests).reduce((a, b) => a + b, 0) : 0;
    if (chestCount !== this.badgeCount) {
      this.badgeCount = chestCount;
      for (const c of this.chestBadge.removeChildren()) if (c !== this.chestBadgeText) c.destroy();
    }
    if (chestCount > 0 && this.chestBadge.children.length === 0) {
      const gg = new Graphics();
      const label = String(chestCount);
      const bw = Math.max(9, F.small.measure(label) + 4);
      box(gg, 0, 0, bw, 9, C['ink-1'], 1);
      gg.rect(1, 1, bw - 2, 7).fill(C['red-3']);
      this.chestBadge.addChild(gg);
      this.chestBadgeText.text = label;
      this.chestBadgeText.position.set(Math.floor(bw / 2), 2 - F.small.capTop);
      this.chestBadge.addChild(this.chestBadgeText);
      this.chestBadge.position.set(this.chests.w - bw + 2, -3);
    }

    // Newly unlocked buttons pop in.
    let changed = false;
    for (const k of Object.keys(s.unlocked)) {
      if (!this.wasUnlocked[k]) {
        this.wasUnlocked[k] = true;
        changed = true;
      }
    }
    if (changed) this.relayoutBottom();
  }
}
