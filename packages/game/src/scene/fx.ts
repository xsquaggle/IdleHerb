/**
 * Shared juice: rising numbers, coin flights to the counter, screen shake and
 * flashes. Snappy, bouncy timing (style bible 19).
 */
import { Container, Graphics, Sprite, type Texture } from 'pixi.js';
import { PixelText, type PixelFont } from '../engine/font';
import { clock, ease } from '../engine/tween';
import { C } from '../engine/palette';
import { F } from '../engine/ui';
import { tex } from '../engine/assets';
import { session } from '../app/session';
import { sfx } from '../engine/audio';

/** A number or word that pops up and rises, e.g. "+1.2K" over a floor. */
export function popText(
  parent: Container,
  x: number,
  y: number,
  text: string,
  opts: { color?: number; font?: PixelFont; rise?: number; life?: number; icon?: Texture } = {},
): void {
  const c = new Container();
  const t = new PixelText(opts.font ?? F.body, text, { align: 'center', color: opts.color ?? C['gold-4'], outline: true });
  c.addChild(t);
  if (opts.icon) {
    const s = new Sprite(opts.icon);
    s.anchor.set(1, 0);
    s.position.set(-Math.ceil(t.textWidth / 2) - 1, Math.max(0, t.font.capTop + Math.floor((t.font.cap - opts.icon.height) / 2)));
    t.x = Math.ceil(opts.icon.width / 2);
    s.x += t.x;
    c.addChild(s);
  }
  c.position.set(Math.round(x), Math.round(y));
  c.scale.set(0.4);
  parent.addChild(c);
  const rise = opts.rise ?? 22;
  const life = opts.life ?? 0.8;
  void clock.tween(c.scale, { x: 1, y: 1 }, 0.16, { ease: ease.outBack });
  void clock.tween(c, { y: c.y - rise }, life, { ease: ease.outCubic }).then(() => c.destroy({ children: true }));
}

/** Coins arc from a screen point to the HUD counter in about half a second. */
export function coinFlight(screen: Container, from: { x: number; y: number }, count: number): void {
  const n = Math.min(12, Math.max(1, count));
  const target = session.hooks.coinTarget();
  for (let i = 0; i < n; i++) {
    const s = new Sprite(tex('ui/coin_10.png'));
    s.anchor.set(0.5);
    const sx = from.x + (Math.random() - 0.5) * 24;
    const sy = from.y + (Math.random() - 0.5) * 12;
    s.position.set(Math.round(sx), Math.round(sy));
    screen.addChild(s);
    const lift = 30 + Math.random() * 40;
    const delay = i * 0.03;
    const dur = 0.45 + Math.random() * 0.15;
    let t = -delay;
    clock.every((dt) => {
      if (s.destroyed) return false;
      t += dt;
      if (t < 0) return true;
      const k = Math.min(1, t / dur);
      const e = ease.inQuad(k);
      const x = sx + (target.x - sx) * e;
      const y = sy + (target.y - sy) * e - Math.sin(k * Math.PI) * lift;
      s.position.set(Math.round(x), Math.round(y));
      if (k >= 1) {
        s.destroy();
        if (i === 0 || i === n - 1) {
          session.hooks.coinLanded();
          sfx.coin();
        }
        return false;
      }
      return true;
    });
  }
}

/** A full-screen flash in one colour, stepped off rather than faded. */
export function flash(layer: Container, w: number, h: number, color: number, sec = 0.12, alpha = 0.6): void {
  if (session.settings.reduceMotion) return;
  const g = new Graphics().rect(0, 0, w, h).fill({ color, alpha });
  g.eventMode = 'none';
  layer.addChild(g);
  clock.after(sec / 2, () => (g.alpha = 0.5));
  clock.after(sec, () => g.destroy());
}

/** A ring of pixels that grows outward: the level-up ring and the shockwave. */
export function ring(parent: Container, x: number, y: number, color: number, maxR = 40, dur = 0.35): void {
  const g = new Graphics();
  g.position.set(Math.round(x), Math.round(y));
  parent.addChild(g);
  let t = 0;
  clock.every((dt) => {
    if (g.destroyed) return false;
    t += dt;
    const k = Math.min(1, t / dur);
    const r = Math.round(4 + (maxR - 4) * ease.outCubic(k));
    g.clear();
    const steps = Math.max(16, Math.round(r * 1.5));
    const thick = k < 0.6 ? 2 : 1;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      g.rect(Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r * 0.6), thick, thick).fill(color);
    }
    if (k >= 1) {
      g.destroy();
      return false;
    }
    return true;
  });
}

/** Four-point sparkles, the "ready" and "new" glint. */
export function sparkle(parent: Container, x: number, y: number, color = C.white, size = 2): void {
  const g = new Graphics();
  g.position.set(Math.round(x), Math.round(y));
  const draw = (s: number) => {
    g.clear();
    g.rect(0, -s, 1, s * 2 + 1).fill(color);
    g.rect(-s, 0, s * 2 + 1, 1).fill(color);
  };
  parent.addChild(g);
  let t = 0;
  clock.every((dt) => {
    if (g.destroyed) return false;
    t += dt;
    const k = t / 0.5;
    const s = k < 0.5 ? Math.ceil(size * k * 2) : Math.ceil(size * (1 - k) * 2);
    if (k >= 1) {
      g.destroy();
      return false;
    }
    draw(Math.max(0, s));
    return true;
  });
}
