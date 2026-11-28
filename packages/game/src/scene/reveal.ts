/**
 * The rarity reveal ladder (style bible 19): Arrive, Build, Tell, Burst, Show.
 * The rarer the best card inside, the longer the build-up and the bigger the
 * payoff. The light climbs the rarity colours one step at a time and never
 * goes back down, so the climb is always honest.
 *
 * Every tier's staging is a row of REVEAL_TIERS, indexed like RARITY_LOOKS, so
 * new tiers (Mythic, Godly and beyond) slot in as data.
 */
import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { C, RARITY_LOOKS, rarityIndex } from '../engine/palette';
import { PixelText } from '../engine/font';
import { F } from '../engine/ui';
import { tex, hasTex } from '../engine/assets';
import { clock, ease } from '../engine/tween';
import { Particles } from '../engine/particles';
import { sfx } from '../engine/audio';
import { content, txt, ui } from '../app/content';
import { session } from '../app/session';
import { bigCard } from './cards';
import { flash, ring } from './fx';
import burstsFile from '../../../../art/effects/reveal/bursts.json';
import chestsFile from '../../../../art/chests/chests.json';

export interface RevealTier {
  /** Hops before the light, each higher. */
  hops: number;
  /** The chest lifts off the floor and the rest of the screen dims. */
  lift: boolean;
  /** How dark the room goes during the build, 0 to 1. */
  dim: number;
  /** A beat of darkness with one crack of light before the burst. */
  blackout: boolean;
  /** Screen shake at the burst, in pixels. */
  shake: number;
  /** Rays turn behind the chest. */
  rays: boolean;
  /** A shockwave ring at the burst. */
  ring: boolean;
  /** A beam of light at the burst. */
  beam: boolean;
  /** Colours flooding the screen at the burst. */
  flood: string[];
  /** Seconds the card is held up before "Tap to continue". */
  hold: number;
  /** Seconds per climb step. */
  climbStep: number;
}

export const REVEAL_TIERS: RevealTier[] = [
  { hops: 0, lift: false, dim: 0, blackout: false, shake: 0, rays: false, ring: false, beam: false, flood: [], hold: 0.4, climbStep: 0.25 },
  { hops: 1, lift: false, dim: 0, blackout: false, shake: 0, rays: false, ring: false, beam: false, flood: [], hold: 0.5, climbStep: 0.25 },
  { hops: 2, lift: false, dim: 0.15, blackout: false, shake: 0, rays: false, ring: false, beam: true, flood: [], hold: 0.7, climbStep: 0.28 },
  { hops: 3, lift: false, dim: 0.33, blackout: false, shake: 1, rays: false, ring: true, beam: true, flood: [], hold: 1.0, climbStep: 0.3 },
  { hops: 3, lift: true, dim: 0.5, blackout: false, shake: 2, rays: true, ring: true, beam: true, flood: ['gold-4'], hold: 1.5, climbStep: 0.34 },
  { hops: 3, lift: true, dim: 0.5, blackout: true, shake: 3, rays: true, ring: true, beam: true, flood: ['teal-3', 'rose-3', 'lavender-4'], hold: 2.5, climbStep: 0.36 },
  { hops: 4, lift: true, dim: 0.7, blackout: true, shake: 3, rays: true, ring: true, beam: true, flood: ['teal-2', 'lavender-5', 'sky-3'], hold: 3, climbStep: 0.4 },
  { hops: 4, lift: true, dim: 0.7, blackout: true, shake: 4, rays: true, ring: true, beam: true, flood: ['cream-4', 'white-1', 'gold-4'], hold: 4, climbStep: 0.42 },
];

const BURSTS = (burstsFile as unknown as { bursts: Record<string, { frames: string[] }> }).bursts;
const CHEST_IDS = (chestsFile as unknown as { design_ids: Record<string, string> }).design_ids;
/** Chests the design has but the art does not name: each borrows a material. */
const CHEST_MATERIAL_FALLBACK: Record<string, string> = { 'chest.welcome': 'copper', 'chest.hiring': 'common', 'chest.seed_packet': 'common' };

function chestFrames(chestId: string): Texture[] {
  const mat = CHEST_IDS[chestId] ?? CHEST_MATERIAL_FALLBACK[chestId] ?? 'common';
  return ['closed', 'cracked', 'half_open', 'fully_open'].map((st) => tex(`chests/frames/${mat}_${st}_96x80.png`));
}

function burstFrames(tier: number): Texture[] {
  const id = RARITY_LOOKS[Math.min(tier, RARITY_LOOKS.length - 1)]!.id;
  const b = BURSTS[id] ?? BURSTS.exotic!;
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
  private skip = false;
  private tapped: (() => void) | null = null;
  private cx = 0;
  private cy = 0;
  private w = 0;
  private h = 0;
  done: Promise<void> | null = null;

  constructor(
    readonly chestId: string,
    readonly cards: string[],
    readonly isNew: Set<string>,
    w: number,
    h: number,
  ) {
    super();
    this.w = w;
    this.h = h;
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, w, h);
    this.frames = chestFrames(chestId);
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

  /** Plays the whole ladder; resolves when the last card is put away. */
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

  private best(): number {
    return Math.max(0, ...this.cards.map((id) => rarityIndex(content.cards.get(id)?.rarity ?? 'common')));
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
    const tier = REVEAL_TIERS[Math.min(best, REVEAL_TIERS.length - 1)]!;
    const reduce = session.settings.reduceMotion;
    this.alpha = 0;
    void clock.tween(this, { alpha: 1 }, 0.15);

    // Chest name.
    const title = new PixelText(F.big, txt('chests', this.chestId), { align: 'center', color: C['gold-4'], outline: true });
    title.position.set(this.cx, Math.max(40, this.cy - 200));
    this.front.addChild(title);

    // Arrive: drop in with a squash.
    this.chest.y = -40;
    await clock.tween(this.chest, { y: this.cy }, 0.32, { ease: ease.outBounce });
    sfx.hop();
    await this.squash();
    await this.wait(0.15);

    // Build.
    if (tier.dim > 0) this.setDim(tier.dim * 0.6);
    for (let i = 0; i < tier.hops && !this.skip; i++) {
      const hgt = 6 + i * 5;
      sfx.hop();
      await clock.tween(this.chest, { y: this.cy - hgt }, 0.12, { ease: ease.outQuad });
      await clock.tween(this.chest, { y: this.cy }, 0.12, { ease: ease.inQuad });
      await this.squash();
      await this.wait(0.08);
    }
    let lifted = 0;
    if (tier.lift && !this.skip) {
      this.setDim(tier.dim);
      lifted = 22;
      await clock.tween(this.chest, { y: this.cy - lifted }, 0.6, { ease: ease.inOutQuad });
    }

    // Tell: the light climbs one rarity at a time and stops on the best.
    this.chest.texture = this.frames[1]!;
    for (let t = 0; t <= best; t++) {
      const look = RARITY_LOOKS[t]!;
      sfx.climb(t);
      this.drawGlow(look.main, look.light, t);
      this.jolt();
      if (!this.skip) await clock.wait(tier.climbStep + t * 0.03);
    }
    if (tier.blackout && !this.skip) {
      this.setDim(0.95);
      this.drawGlow(RARITY_LOOKS[best]!.light, C.white, 0, true);
      await clock.wait(0.7);
    }

    // Burst.
    this.chest.texture = this.frames[2]!;
    await this.wait(0.06);
    this.chest.texture = this.frames[3]!;
    this.glow.clear();
    this.setDim(tier.dim * 0.5);
    const look = RARITY_LOOKS[best]!;
    sfx.burst(best);
    const by = this.cy - lifted - 40;
    if (tier.rays) this.rays(look.main, by);
    if (tier.beam) this.beam(look.light, by);
    this.playBurst(best, by);
    this.parts.spawn({ x: this.cx, y: by, colors: [look.main, look.light, C.white], count: 20 + best * 14, speed: [60, 160 + best * 30], life: [0.5, 1 + best * 0.2], size: [1, 3] });
    if (best >= 4) this.parts.spawn({ x: this.cx, y: by - 20, frames: [tex('ui/coin_10.png')], colors: [], count: 18, speed: [80, 200], angle: -Math.PI / 2, spread: 2.4, life: [0.9, 1.4], gravity: 260 });
    if (tier.ring) ring(this.front, this.cx, by, look.light, 60 + best * 10, 0.45);
    if (tier.shake && !reduce) session.hooks.shake(tier.shake, 0.35);
    for (const f of tier.flood) {
      flash(this.front, this.w, this.h, C[f] ?? C.white, 0.16, 0.45);
      await clock.wait(0.12);
    }
    if (best === 0) flash(this.front, this.w, this.h, C.white, 0.08, 0.2);
    if (lifted) void clock.tween(this.chest, { y: this.cy }, 0.3, { ease: ease.outBounce });
    await this.wait(0.25);
    sfx.sting(best);

    // Show: the cards come up, lowest rarity first, best last.
    const order = [...this.cards].sort((a, b) => rarityIndex(content.cards.get(a)!.rarity) - rarityIndex(content.cards.get(b)!.rarity));
    title.destroy();
    this.skip = false;
    await this.showCards(order);
    await clock.tween(this, { alpha: 0 }, 0.15);
  }

  private async showCards(order: string[]): Promise<void> {
    // Small row of every card, then each is held up big.
    const shown: Container[] = [];
    for (let i = 0; i < order.length; i++) {
      const id = order[i]!;
      const tierI = rarityIndex(content.cards.get(id)!.rarity);
      const tier = REVEAL_TIERS[Math.min(tierI, REVEAL_TIERS.length - 1)]!;
      const own = session.game.state.cards[id];
      const def = content.cards.get(id)!;
      const need = def.dupes[(own?.level ?? 1) - 1] ?? 0;
      const card = bigCard(id, own?.level ?? 1, { newCard: this.isNew.has(id), copies: own ? [own.copies, need] : undefined });
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
      shown.push(holder);
      sfx.card();
      const look = RARITY_LOOKS[tierI]!;
      await clock.tween(holder.scale, { x: sx }, tierI >= 4 ? 0.5 : 0.18, { ease: ease.outBack });
      if (tierI >= 2) this.parts.spawn({ x: this.cx, y: holder.y - 60, colors: [look.main, look.light, C.white], count: 10 + tierI * 6, speed: [40, 120], life: [0.4, 0.9] });
      if (tierI >= 3) {
        for (let k = 0; k < 4 + tierI; k++) clock.after(k * 0.1, () => this.sparkleAt(this.cx + (Math.random() - 0.5) * 180, holder.y + (Math.random() - 0.5) * 220, look.light));
      }
      const quick = tierI <= 1 && i < order.length - 1;
      await clock.wait(quick ? 0.55 : tier.hold);
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
