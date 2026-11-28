/**
 * The hand-built UI kit (style bible 16): panels, buttons, bars and chips drawn
 * as pixel rectangles from the palette, with a 1 pixel ink outline and a
 * 1 pixel bevel. Nothing here is a bitmap, so any size stays crisp.
 */
import { Container, Graphics, Rectangle, Sprite, Texture, type FederatedPointerEvent } from 'pixi.js';
import { C } from './palette';
import { PixelText, type PixelFont } from './font';
import { clock } from './tween';
import { sfx } from './audio';

/** The three fonts, set once at boot. */
export const F = {} as { big: PixelFont; body: PixelFont; small: PixelFont };

/** Draws a rectangle with its four corner pixels cut, the pixel-art rounded box. */
export function box(g: Graphics, x: number, y: number, w: number, h: number, color: number, cut = 1): Graphics {
  if (w <= 0 || h <= 0) return g;
  if (cut <= 0 || w < 3 || h < 3) return g.rect(x, y, w, h).fill(color);
  g.rect(x + cut, y, w - cut * 2, h).fill(color);
  g.rect(x, y + cut, cut, h - cut * 2).fill(color);
  g.rect(x + w - cut, y + cut, cut, h - cut * 2).fill(color);
  return g;
}

export interface Look {
  body: number;
  top: number;
  bottom: number;
  text: number;
}

export const LOOKS = {
  leaf: { body: C['leaf-3'], top: C['leaf-4'], bottom: C['leaf-2'], text: C.white },
  leafHi: { body: C['leaf-4'], top: C['leaf-5'], bottom: C['leaf-3'], text: C.white },
  wood: { body: C['wood-3'], top: C['wood-4'], bottom: C['wood-2'], text: C.white },
  woodHi: { body: C['wood-4'], top: C['wood-5'], bottom: C['wood-3'], text: C.white },
  gold: { body: C['gold-3'], top: C['gold-4'], bottom: C['gold-2'], text: C['ink-1'] },
  goldHi: { body: C['gold-4'], top: C['gold-5'], bottom: C['gold-3'], text: C['ink-1'] },
  lavender: { body: C['lavender-3'], top: C['lavender-4'], bottom: C['lavender-2'], text: C.white },
  lavenderHi: { body: C['lavender-4'], top: C['lavender-5'], bottom: C['lavender-3'], text: C.white },
  sky: { body: C['sky-2'], top: C['sky-3'], bottom: C['sky-1'], text: C.white },
  skyHi: { body: C['sky-3'], top: C['sky-4'], bottom: C['sky-2'], text: C.white },
  ash: { body: C['ash-2'], top: C['ash-2'], bottom: C['ash-1'], text: C['ash-4'] },
  red: { body: C['red-2'], top: C['red-3'], bottom: C['red-1'], text: C.white },
  redHi: { body: C['red-3'], top: C['red-3'], bottom: C['red-2'], text: C.white },
} satisfies Record<string, Look>;
export type LookId = keyof typeof LOOKS;

/** A bevelled slab: ink outline, light top line, dark bottom lines. */
export function slab(g: Graphics, x: number, y: number, w: number, h: number, look: Look, pressed = false): Graphics {
  box(g, x, y, w, h, C['ink-1'], 1);
  g.rect(x + 1, y + 1, w - 2, h - 2).fill(look.body);
  if (pressed) {
    g.rect(x + 1, y + 1, w - 2, 1).fill(look.bottom);
  } else {
    g.rect(x + 1, y + 1, w - 2, 1).fill(look.top);
    g.rect(x + 1, y + h - 3, w - 2, 2).fill(look.bottom);
  }
  return g;
}

/** A window: wood frame with parchment inside (style bible 16). */
export function panel(g: Graphics, x: number, y: number, w: number, h: number, inside = C['cream-3']): Graphics {
  box(g, x, y, w, h, C['ink-1'], 2);
  box(g, x + 1, y + 1, w - 2, h - 2, C['wood-3'], 1);
  g.rect(x + 2, y + 1, w - 4, 1).fill(C['wood-5']);
  g.rect(x + 2, y + h - 3, w - 4, 1).fill(C['wood-2']);
  box(g, x + 4, y + 4, w - 8, h - 8, C['wood-2'], 1);
  g.rect(x + 5, y + 5, w - 10, h - 10).fill(inside);
  g.rect(x + 5, y + 5, w - 10, 1).fill(C['cream-4']);
  return g;
}

/** A dark enamel chip for the HUD: sage body with brass trim. */
export function chip(g: Graphics, x: number, y: number, w: number, h: number): Graphics {
  box(g, x, y, w, h, C['ink-1'], 2);
  box(g, x + 1, y + 1, w - 2, h - 2, C['gold-2'], 1);
  g.rect(x + 2, y + 1, w - 4, 1).fill(C['gold-4']);
  box(g, x + 2, y + 2, w - 4, h - 4, C['leaf-1'], 1);
  g.rect(x + 3, y + 2, w - 6, 1).fill(C['sage-1']);
  return g;
}

export interface ButtonOpts {
  w: number;
  h: number;
  look?: LookId;
  label?: string;
  font?: PixelFont;
  icon?: Texture;
  onTap?: () => void;
  /** Holding the button repeats the tap. */
  repeat?: boolean;
  sound?: boolean;
}

/** A button with the four states of the style bible: normal, hover, pressed, disabled. */
export class Button extends Container {
  private readonly g = new Graphics();
  private readonly content = new Container();
  caption: PixelText | null = null;
  sub: PixelText | null = null;
  icon: Sprite | null = null;
  private hover = false;
  private down = false;
  private _enabled = true;
  private _look: LookId;
  private repeatJob: { kill(): void } | null = null;
  w: number;
  h: number;
  onTap: (() => void) | undefined;
  /** Shown when pressed while disabled. */
  onDenied: (() => void) | undefined;

  constructor(readonly opts: ButtonOpts) {
    super();
    this.w = opts.w;
    this.h = opts.h;
    this._look = opts.look ?? 'leaf';
    this.onTap = opts.onTap;
    this.addChild(this.g, this.content);
    if (opts.icon) {
      this.icon = new Sprite(opts.icon);
      this.content.addChild(this.icon);
    }
    if (opts.label !== undefined) {
      this.caption = new PixelText(opts.font ?? F.body, opts.label, { align: 'center', color: LOOKS[this._look].text });
      this.content.addChild(this.caption);
    }
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(0, 0, this.w, this.h);
    this.on('pointerover', () => {
      this.hover = true;
      this.redraw();
    });
    this.on('pointerout', () => {
      this.hover = false;
      this.redraw();
    });
    this.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.down = true;
      this.redraw();
      if (this.opts.repeat && this._enabled) {
        let t = 0;
        let next = 0.45;
        this.repeatJob?.kill();
        this.repeatJob = clock.every((dt) => {
          if (!this.down) return false;
          t += dt;
          if (t >= next) {
            next += 0.11;
            if (this._enabled) this.fire();
          }
          return true;
        });
      }
    });
    const up = () => {
      this.down = false;
      this.repeatJob?.kill();
      this.repeatJob = null;
      this.redraw();
    };
    this.on('pointerup', up);
    this.on('pointerupoutside', up);
    this.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      if (this._enabled) this.fire();
      else {
        sfx.deny();
        this.onDenied?.();
        this.wiggle();
      }
    });
    this.layout();
    this.redraw();
  }

  private fire(): void {
    if (this.opts.sound !== false) sfx.click();
    this.onTap?.();
  }

  wiggle(): void {
    const x0 = this.content.x;
    let t = 0;
    clock.every((dt) => {
      t += dt;
      this.content.x = x0 + Math.round(Math.sin(t * 60) * 2 * (1 - t / 0.25));
      if (t >= 0.25) {
        this.content.x = x0;
        return false;
      }
      return true;
    }, this);
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(v: boolean) {
    if (v === this._enabled) return;
    this._enabled = v;
    this.cursor = v ? 'pointer' : 'default';
    this.redraw();
  }

  set look(l: LookId) {
    if (l === this._look) return;
    this._look = l;
    this.redraw();
  }

  get look(): LookId {
    return this._look;
  }

  setText(text: string, sub?: string): void {
    if (this.caption) this.caption.text = text;
    if (sub !== undefined) {
      if (!this.sub) {
        this.sub = new PixelText(F.small, sub, { align: 'center' });
        this.content.addChild(this.sub);
      } else this.sub.text = sub;
    }
    this.layout();
    this.redraw();
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.hitArea = new Rectangle(0, 0, w, h);
    this.layout();
    this.redraw();
  }

  /** Places icon and label(s) centred in the button. */
  layout(): void {
    const iw = this.icon ? this.icon.texture.width : 0;
    const lw = this.caption ? this.caption.textWidth : 0;
    const sw = this.sub ? this.sub.textWidth : 0;
    const textW = Math.max(lw, sw);
    const gap = this.icon && (this.caption?.text || this.sub?.text) ? 3 : 0;
    const total = iw + gap + textW;
    let x = Math.floor((this.w - total) / 2);
    const bodyH = this.h - 2;
    if (this.icon) {
      this.icon.position.set(x, Math.floor((bodyH - this.icon.texture.height) / 2));
      x += iw + gap;
    }
    const cx = x + Math.floor(textW / 2);
    if (this.caption && this.sub && this.sub.text) {
      const lc = this.caption.font.cap;
      const sc = this.sub.font.cap;
      const gapY = 3;
      const top = Math.floor((bodyH - (lc + gapY + sc)) / 2);
      this.caption.position.set(cx, top - this.caption.font.capTop);
      this.sub.position.set(cx, top + lc + gapY - this.sub.font.capTop);
    } else if (this.caption) {
      this.caption.position.set(cx, Math.floor((bodyH - this.caption.font.cap) / 2) - this.caption.font.capTop);
    }
  }

  private redraw(): void {
    const look = !this._enabled ? LOOKS.ash : this.hover && !this.down ? LOOKS[`${this._look}Hi` as LookId] ?? LOOKS[this._look] : LOOKS[this._look];
    this.g.clear();
    const lift = this._enabled && this.hover && !this.down ? -1 : 0;
    const press = this.down && this._enabled ? 1 : 0;
    slab(this.g, 0, lift + press, this.w, this.h - Math.abs(lift), look, press > 0);
    this.content.y = lift + press;
    if (this.caption) this.caption.color = look.text;
    if (this.sub) this.sub.color = look.text;
    if (this.icon) this.icon.alpha = this._enabled ? 1 : 0.5;
  }
}

/** A progress bar: `ink-2` track with a fill and a light top line (style bible 16). */
export class Bar extends Container {
  private readonly g = new Graphics();
  private _v = -1;
  constructor(
    public w: number,
    public h: number,
    public fill = C['leaf-4'],
    public top = C['leaf-5'],
    public track = C['ink-2'],
  ) {
    super();
    this.addChild(this.g);
    this.value = 0;
  }

  get value(): number {
    return this._v;
  }

  set value(v: number) {
    const px = Math.round(Math.max(0, Math.min(1, v)) * (this.w - 2));
    const old = Math.round(Math.max(0, Math.min(1, this._v)) * (this.w - 2));
    if (px === old && this._v >= 0) {
      this._v = v;
      return;
    }
    this._v = v;
    this.redraw(px);
  }

  recolor(fill: number, top: number): void {
    this.fill = fill;
    this.top = top;
    this._v = -1;
  }

  private redraw(px: number): void {
    const g = this.g;
    g.clear();
    box(g, 0, 0, this.w, this.h, C['ink-1'], 1);
    g.rect(1, 1, this.w - 2, this.h - 2).fill(this.track);
    if (px > 0) {
      g.rect(1, 1, px, this.h - 2).fill(this.fill);
      g.rect(1, 1, px, 1).fill(this.top);
    }
  }
}

/** A dim full-screen layer that swallows taps behind a window. */
export class Shade extends Graphics {
  constructor(w: number, h: number, alpha = 0.55) {
    super();
    this.resize(w, h, alpha);
    this.eventMode = 'static';
  }

  resize(w: number, h: number, alpha = 0.55): void {
    this.clear();
    this.rect(0, 0, w, h).fill({ color: C['ink-1'], alpha });
    this.hitArea = new Rectangle(0, 0, w, h);
  }
}

/** A small sprite icon. */
export function icon(t: Texture, x = 0, y = 0): Sprite {
  const s = new Sprite(t);
  s.position.set(x, y);
  return s;
}

/** Squash-and-pop on any display object, about 120 ms (style bible 19). */
export function pop(target: Container, amount = 0.15, dur = 0.14): void {
  const sx = target.scale.x;
  const sy = target.scale.y;
  clock.killOwner(target.scale);
  let t = 0;
  clock.every((dt) => {
    t += dt;
    const k = Math.min(1, t / dur);
    const s = Math.sin(k * Math.PI);
    target.scale.set(sx * (1 + amount * s), sy * (1 - amount * 0.6 * s));
    if (k >= 1) {
      target.scale.set(sx, sy);
      return false;
    }
    return true;
  }, target.scale);
}
