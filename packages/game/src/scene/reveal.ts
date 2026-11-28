/**
 * The reveal player (style bible v1.7, section 19; design 0.5, EXPANSION 4.1): one player for every
 * reveal, taking a tier and a form. The full form plays five beats, Arrive, Build, Tell, Burst and
 * Show; the short form plays only the climb, the burst and the chime, in under a second. The rarer
 * the tier, the longer the build-up and the bigger the payoff. The light climbs the tier colours one
 * step at a time and never goes back down, so the climb is always honest.
 *
 * Every tier's staging and timing is its row of tables/tiers.yaml, so tiers 6 to 11 play the day
 * their art arrives; until then they borrow the nearest lower tier's art and wear their own colours.
 */
import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import type { TierRow } from '@sprout/core';
import { C } from '../engine/palette';
import { PixelText } from '../engine/font';
import { F } from '../engine/ui';
import { tex, hasTex } from '../engine/assets';
import { clock, ease } from '../engine/tween';
import { Particles } from '../engine/particles';
import { sfx } from '../engine/audio';
import { content, txt, ui } from '../app/content';
import { session } from '../app/session';
import { bestTierIndex, cardTierIndex, chestMaterial, nearestBelow, tierAt, tierChestMaterial } from '../app/tiers';
import { bigCard } from './cards';
import { flash, ring } from './fx';
import burstsFile from '../../../../art/effects/reveal/bursts.json';

export type RevealForm = 'full' | 'short';

export interface RevealOptions {
  /** The chest being opened, for its name and art. None: a bare climb (the reveal theatre, later tier-ups and finds). */
  chestId?: string;
  /** Cards held up at the Show, lowest tier first. */
  cards: string[];
  /** Cards the player did not have before. */
  isNew?: Set<string>;
  /** The tier the climb stops on, 0-based. Default: the best card's tier. */
  tier?: number;
  /** Default full. */
  form?: RevealForm;
  /** Show every card at this tier (the reveal theatre), instead of its own. */
  cardTier?: number;
  /** A title in place of the chest's name. */
  title?: string;
}

/** Seconds of the burst beat itself (open frames and the pause after), inside the tier's total. */
const BURST_BEAT = 0.31;
/** Seconds per colour of a burst's flood. */
const FLOOD_STEP = 0.12;

/**
 * Seconds per climb step so the full form meets the tier's total (EXPANSION 4.1 rule 4): the total
 * runs from the first jolt to the end of the Show, and the Show holds the best card for `hold`.
 */
export function climbStep(row: TierRow, steps: number, form: RevealForm): number {
  if (form === 'short') return Math.max(0.04, (row.reveal.short * 0.55) / steps);
  const rest = row.reveal.total - row.reveal.hold - BURST_BEAT - row.reveal.blackout - row.look.flood.length * FLOOD_STEP;
  return Math.max(0.1, rest / steps);
}

const BURSTS = (burstsFile as unknown as { bursts: Record<string, { frames: string[] }> }).bursts;

function chestFrames(material: string): Texture[] {
  return ['closed', 'cracked', 'half_open', 'fully_open'].map((st) => tex(`chests/frames/${material}_${st}_96x80.png`));
}

function burstFrames(tier: number): Texture[] {
  const id = nearestBelow(tier, (r) => (r.burst && BURSTS[r.burst] ? r.burst : null));
  const b = id ? BURSTS[id] : undefined;
  if (!b) return [];
  return b.frames.filter((f) => hasTex(`effects/reveal/${f}`)).map((f) => tex(`effects/reveal/${f}`));
}

export class Reveal extends Container {
  private readonly shade = new Graphics();
  private readonly dimmer = new Graphics();
  private readonly back = new Container();
  private readonly chest: Sprite;
  private readonly frames: Texture[];
  private readonly glow = new Graphics();
  private readonly front = new Container();
  private readonly parts = new Particles();
  private readonly hint: PixelText;
  private readonly cards: string[];
  private readonly isNew: Set<string>;
  private readonly form: RevealForm;
  private skip = false;
  private tapped: (() => void) | null = null;
  private cx = 0;
  private cy = 0;
  private w = 0;
  private h = 0;
  done: Promise<void> | null = null;

  constructor(
    readonly opts: RevealOptions,
    w: number,
    h: number,
  ) {
    super();
    this.w = w;
    this.h = h;
    this.cards = opts.cards;
    this.isNew = opts.isNew ?? new Set();
    this.form = opts.form ?? 'full';
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, w, h);
    this.frames = chestFrames(opts.chestId ? chestMaterial(opts.chestId) : tierChestMaterial(this.best()));
    this.chest = new Sprite(this.frames[0]);
    this.chest.anchor.set(0.5, 1);
    this.hint = new PixelText(F.body, ui('tap_to_continue'), { align: 'center', color: C['cream-4'], outline: true });
    this.hint.visible = false;
    this.addChild(this.shade, this.back, this.glow, this.chest, this.dimmer, this.front, this.parts, this.hint);
    this.on('pointertap', () => {
      if (this.tapped) {
        const t = this.tapped;
        this.tapped = null;
        t();
      } else this.skip = true;
    });
    this.layout(w, h);
    this.visible = false;
  }

  /** Plays the whole reveal; resolves when the last card is put away. */
  start(): Promise<void> {
    this.visible = true;
    this.done ??= this.play();
    return this.done;
  }

  layout(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.hitArea = new Rectangle(0, 0, w, h);
    this.shade.clear().rect(0, 0, w, h).fill({ color: C['ink-1'], alpha: 0.78 });
    this.cx = Math.floor(w / 2);
    this.cy = Math.floor(h * 0.62);
    this.chest.position.set(this.cx, this.cy);
    this.hint.position.set(this.cx, h - 28);
  }

  private wait(sec: number): Promise<void> {
    if (this.skip) return Promise.resolve();
    return clock.wait(sec);
  }

  private waitTap(): Promise<void> {
    return new Promise((r) => (this.tapped = r));
  }

  /** The tier the climb stops on, 0-based. */
  private best(): number {
    if (this.opts.tier !== undefined) return this.opts.tier;
    if (this.opts.cardTier !== undefined) return this.opts.cardTier;
    return bestTierIndex(this.cards);
  }

  private cardTier(id: string): number {
    return this.opts.cardTier ?? cardTierIndex(id);
  }

  private async play(): Promise<void> {
    try {
      await this.ladder();
    } catch (err) {
      // Skipped or torn down mid-reveal: nothing left to show.
      if (!this.destroyed) console.error(err);
    }
    if (!this.destroyed) this.destroy({ children: true });
  }

  private async ladder(): Promise<void> {
    const best = this.best();
    const look = tierAt(best);
    const st = look.row.reveal;
    const short = this.form === 'short';
    const reduce = session.settings.reduceMotion;
    this.alpha = 0;
    void clock.tween(this, { alpha: 1 }, short ? 0.08 : 0.15);

    // Title: the chest's name, or what is being revealed.
    const name = this.opts.title ?? (this.opts.chestId ? txt('chests', this.opts.chestId) : txt('rarities', look.id));
    const title = new PixelText(F.big, name, { align: 'center', color: C['gold-4'], outline: true });
    title.position.set(this.cx, Math.max(40, this.cy - 200));
    this.front.addChild(title);

    // Arrive: drop in with a squash.
    this.chest.y = -40;
    await clock.tween(this.chest, { y: this.cy }, short ? 0.14 : 0.32, { ease: ease.outBounce });
    sfx.hop();
    if (!short) {
      await this.squash();
      await this.wait(0.15);
    }

    // Build (full form only).
    let lifted = 0;
    if (!short) {
      if (st.dim > 0) this.setDim(st.dim * 0.6);
      for (let i = 0; i < st.hops && !this.skip; i++) {
        const hgt = 6 + i * 5;
        sfx.hop();
        await clock.tween(this.chest, { y: this.cy - hgt }, 0.12, { ease: ease.outQuad });
        await clock.tween(this.chest, { y: this.cy }, 0.12, { ease: ease.inQuad });
        await this.squash();
        await this.wait(0.08);
      }
      if (st.lift && !this.skip) {
        this.setDim(st.dim);
        lifted = 22;
        await clock.tween(this.chest, { y: this.cy - lifted }, 0.6, { ease: ease.inOutQuad });
      }
    }

    // Tell: the light climbs one tier at a time and stops on the best.
    this.chest.texture = this.frames[1]!;
    const step = climbStep(look.row, best + 1, this.form);
    for (let t = 0; t <= best; t++) {
      const lk = tierAt(t);
      sfx.climb(lk.row.chime);
      this.drawGlow(lk.main, lk.light, t);
      this.jolt();
      if (!this.skip) await clock.wait(step);
    }
    if (st.blackout > 0 && !short && !this.skip) {
      this.setDim(0.95);
      this.drawGlow(look.light, C.white, 0, true);
      await clock.wait(st.blackout);
    }

    // Burst. A short reveal of a high tier pauses the game for its burst, so it is never missed.
    this.chest.texture = this.frames[2]!;
    await this.wait(0.06);
    this.chest.texture = this.frames[3]!;
    this.glow.clear();
    this.setDim(short ? 0 : st.dim * 0.5);
    sfx.burst(Math.min(best, 6));
    if (look.row.juice.pause > 0 && !reduce) clock.freeze(look.row.juice.pause);
    const by = this.cy - lifted - 40;
    if (st.rays && !short) this.rays(look.main, by);
    if (st.beam) this.beam(look.light, by);
    this.playBurst(best, by);
    this.parts.spawn({ x: this.cx, y: by, colors: [look.main, look.light, C.white], count: look.row.juice.particles + (short ? 0 : 14), speed: [60, 160 + best * 20], life: [0.5, 1 + best * 0.12], size: [1, 3] });
    if (st.lift) this.parts.spawn({ x: this.cx, y: by - 20, frames: [tex('ui/coin_10.png')], colors: [], count: 12 + best * 2, speed: [80, 200], angle: -Math.PI / 2, spread: 2.4, life: [0.9, 1.4], gravity: 260 });
    if (st.ring) ring(this.front, this.cx, by, look.light, 60 + best * 10, 0.45);
    if (st.shake && !reduce) session.hooks.shake(short ? Math.min(2, st.shake) : st.shake, 0.35);
    if (!short) {
      for (const f of look.flood) {
        flash(this.front, this.w, this.h, f, FLOOD_STEP + 0.04, 0.45);
        await clock.wait(FLOOD_STEP);
      }
    }
    if (best === 0) flash(this.front, this.w, this.h, C.white, 0.08, 0.2);
    if (lifted) void clock.tween(this.chest, { y: this.cy }, 0.3, { ease: ease.outBounce });
    await this.wait(short ? 0.12 : 0.25);
    sfx.sting(look.row.sting, look.row.order >= 5);

    // Show: the cards come up, lowest tier first, best last.
    const order = [...this.cards].sort((a, b) => this.cardTier(a) - this.cardTier(b));
    title.destroy();
    this.skip = false;
    await this.showCards(order);
    await clock.tween(this, { alpha: 0 }, short ? 0.1 : 0.15);
  }

  private async showCards(order: string[]): Promise<void> {
    const short = this.form === 'short';
    for (let i = 0; i < order.length; i++) {
      const id = order[i]!;
      const tierI = this.cardTier(id);
      const look = tierAt(tierI);
      const own = session.game.state.cards[id];
      const def = content.cards.get(id)!;
      const need = def.dupes[(own?.level ?? 1) - 1] ?? 0;
      const card = bigCard(id, own?.level ?? 1, { newCard: this.isNew.has(id), copies: own ? [own.copies, need] : undefined, tier: tierI });
      const holder = new Container();
      holder.addChild(card);
      card.position.set(-90, -120);
      const fitsBig = this.h >= 300;
      const top = Math.max(124, Math.floor(this.h * 0.42));
      holder.position.set(this.cx, fitsBig ? top : Math.floor(this.h / 2));
      if (!fitsBig) holder.scale.set(0.75);
      const sx = holder.scale.x;
      holder.scale.x = 0.05;
      this.front.addChild(holder);
      sfx.card();
      await clock.tween(holder.scale, { x: sx }, tierI >= 4 && !short ? 0.5 : 0.18, { ease: ease.outBack });
      if (tierI >= 2) this.parts.spawn({ x: this.cx, y: holder.y - 60, colors: [look.main, look.light, C.white], count: 10 + tierI * 5, speed: [40, 120], life: [0.4, 0.9] });
      if (tierI >= 3) {
        // Read the position now: a fast tap can put the card away before the last sparkle.
        const hy = holder.y;
        for (let k = 0; k < 4 + tierI; k++) clock.after(k * 0.1, () => !this.destroyed && this.sparkleAt(this.cx + (Math.random() - 0.5) * 180, hy + (Math.random() - 0.5) * 220, look.light));
      }
      // Common and Uncommon cards ripple past; the rest wait for a tap. The short form never waits.
      const quick = short || (tierI <= 1 && i < order.length - 1);
      await clock.wait(quick ? (short ? 0.5 : 0.55) : look.row.reveal.hold);
      if (!quick) {
        this.hint.visible = true;
        this.hint.text = i < order.length - 1 ? ui('next') : ui('tap_to_continue');
        await this.waitTap();
        this.hint.visible = false;
      }
      await clock.tween(holder, { alpha: 0, y: holder.y - 20 }, 0.12);
      holder.destroy({ children: true });
    }
  }

  private sparkleAt(x: number, y: number, color: number): void {
    const g = new Graphics();
    g.position.set(Math.round(x), Math.round(y));
    this.front.addChild(g);
    let t = 0;
    clock.every((dt) => {
      if (g.destroyed) return false;
      t += dt;
      const k = t / 0.4;
      const s = Math.max(0, Math.round((k < 0.5 ? k : 1 - k) * 8));
      g.clear();
      g.rect(0, -s, 1, s * 2 + 1).fill(color);
      g.rect(-s, 0, s * 2 + 1, 1).fill(color);
      if (k >= 1) {
        g.destroy();
        return false;
      }
      return true;
    });
  }

  private async squash(): Promise<void> {
    await clock.tween(this.chest.scale, { x: 1.15, y: 0.85 }, 0.06);
    await clock.tween(this.chest.scale, { x: 1, y: 1 }, 0.12, { ease: ease.outBack });
  }

  private jolt(): void {
    const x0 = this.cx;
    this.chest.x = x0 + (Math.random() < 0.5 ? -1 : 1);
    clock.after(0.05, () => (this.chest.x = x0 - (this.chest.x - x0)));
    clock.after(0.1, () => (this.chest.x = x0));
  }

  private setDim(a: number): void {
    this.dimmer.clear();
    if (a <= 0) return;
    // The dimmer sits over the room but under the chest's own light.
    this.dimmer.rect(0, 0, this.w, this.h).fill({ color: C['ink-1'], alpha: a });
    this.setChildIndex(this.dimmer, this.getChildIndex(this.back));
  }

  /** Light leaking from the lid seam, stronger at each step. */
  private drawGlow(main: number, light: number, step: number, crack = false): void {
    const g = this.glow;
    g.clear();
    const y = this.chest.y - 42;
    const half = crack ? 3 : 20 + step * 4;
    g.rect(this.cx - half, y, half * 2, 2).fill(light);
    if (!crack) {
      g.rect(this.cx - half - 4, y - 1, half * 2 + 8, 1).fill(main);
      g.rect(this.cx - half + 6, y + 2, half * 2 - 12, 1).fill(main);
      // Hard-edged beams climbing out of the seam.
      const beams = 1 + step;
      for (let i = 0; i < beams; i++) {
        const bx = this.cx - half + Math.round(((i + 0.5) / beams) * half * 2);
        const bh = 10 + step * 6 + (i % 2) * 6;
        g.rect(bx, y - bh, 2, bh).fill({ color: i % 2 ? light : main, alpha: 0.8 });
      }
    } else {
      g.rect(this.cx - 1, y - 30, 2, 30).fill(light);
    }
  }

  private rays(color: number, y: number): void {
    const g = new Graphics();
    g.position.set(this.cx, y);
    this.back.addChild(g);
    let t = 0;
    clock.every((dt) => {
      if (g.destroyed) return false;
      t += dt;
      g.clear();
      const n = 12;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + t * 0.6;
        const r1 = 30;
        const r2 = 200;
        for (let r = r1; r < r2; r += 3) {
          const w = Math.max(1, Math.round(r / 30));
          g.rect(Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r), w, w).fill({ color, alpha: i % 2 ? 0.35 : 0.2 });
        }
      }
      if (t > 4 || g.destroyed) {
        if (!g.destroyed) g.destroy();
        return false;
      }
      return true;
    });
  }

  private beam(color: number, y: number): void {
    const g = new Graphics();
    this.back.addChild(g);
    let t = 0;
    clock.every((dt) => {
      if (g.destroyed) return false;
      t += dt;
      const k = Math.min(1, t / 0.6);
      const w = Math.round(28 * (1 - k)) + 2;
      g.clear();
      g.rect(this.cx - Math.floor(w / 2), 0, w, y).fill({ color, alpha: 0.7 });
      if (k >= 1) {
        g.destroy();
        return false;
      }
      return true;
    });
  }

  private playBurst(tier: number, y: number): void {
    const frames = burstFrames(tier);
    if (frames.length === 0) return;
    const s = new Sprite(frames[0]);
    s.anchor.set(0.5);
    s.position.set(this.cx, y);
    this.front.addChild(s);
    let t = 0;
    clock.every((dt) => {
      if (s.destroyed) return false;
      t += dt;
      const f = Math.floor(t * 12);
      if (f >= frames.length) {
        s.destroy();
        return false;
      }
      s.texture = frames[f]!;
      return true;
    });
  }
}
