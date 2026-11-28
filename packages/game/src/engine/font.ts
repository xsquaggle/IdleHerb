/**
 * Bitmap pixel text (style bible section 18, tech plan 03: "text is bitmap text").
 *
 * Open pixel fonts are drawn once at boot into an atlas at their own pixel size,
 * every pixel forced fully on or fully off, so text sits on the art grid like any
 * sprite. Each glyph also gets a baked outline-and-shadow twin in `ink-1`, the look
 * the bible gives text that stands on the world.
 */
import { Container, Sprite, Texture, Rectangle } from 'pixi.js';
import { C } from './palette';

export interface FontSpec {
  id: string;
  family: string;
  url: string;
  /** CSS pixel size at which the font's own pixels land on whole pixels. */
  size: number;
  /** Alpha (0 to 255) at or above which a pixel is on. */
  threshold: number;
}

interface Glyph {
  fill: Texture;
  edge: Texture;
  adv: number;
}

export class PixelFont {
  readonly glyphs = new Map<string, Glyph>();
  /** Capital height in pixels, measured from the drawn 'H'. */
  cap = 0;
  constructor(
    readonly id: string,
    readonly lineHeight: number,
    readonly ascent: number,
  ) {}

  /** Offset from a PixelText's origin to the top of its capitals. */
  get capTop(): number {
    return this.ascent - this.cap;
  }

  glyph(ch: string): Glyph {
    return this.glyphs.get(ch) ?? this.glyphs.get('?')!;
  }

  measure(text: string): number {
    let w = 0;
    let best = 0;
    for (const ch of text) {
      if (ch === '\n') {
        best = Math.max(best, w);
        w = 0;
        continue;
      }
      w += this.glyph(ch).adv;
    }
    return Math.max(best, w);
  }
}

const CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '×•…’–';

export async function loadPixelFont(spec: FontSpec): Promise<PixelFont> {
  const face = new FontFace(spec.family, `url(${spec.url})`);
  await face.load();
  (document.fonts as FontFaceSet & { add(f: FontFace): void }).add(face);

  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = `${spec.size}px "${spec.family}"`;
  const m = probe.measureText('Hgjy|');
  const ascent = Math.ceil(m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent);
  const descent = Math.ceil(m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent);
  const lineH = ascent + descent;
  const cellH = lineH + 3;

  const advs = [...CHARS].map((ch) => Math.max(1, Math.round(probe.measureText(ch).width)));
  const cellWs = advs.map((a) => a + 6);
  const atlasW = 1024;
  // Lay the cells out in rows: a fill row and an edge row per line of glyphs.
  const places: { x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  for (const w of cellWs) {
    if (x + w > atlasW) {
      x = 0;
      y += cellH * 2;
    }
    places.push({ x, y });
    x += w;
  }
  const atlasH = y + cellH * 2;

  const raw = document.createElement('canvas');
  raw.width = atlasW;
  raw.height = atlasH;
  const g = raw.getContext('2d', { willReadFrequently: true })!;
  g.font = `${spec.size}px "${spec.family}"`;
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#ffffff';
  [...CHARS].forEach((ch, i) => g.fillText(ch, places[i]!.x + 2, places[i]!.y + 1 + ascent));

  const img = g.getImageData(0, 0, atlasW, atlasH);
  const d = img.data;
  const on = (px: number, py: number) => px >= 0 && py >= 0 && px < atlasW && py < atlasH && d[(py * atlasW + px) * 4 + 3]! >= 255;
  // Threshold the fill rows.
  for (let i = 3; i < d.length; i += 4) {
    const a = d[i]! >= spec.threshold ? 255 : 0;
    d[i] = a;
    d[i - 1] = d[i - 2] = d[i - 3] = 255;
  }
  // Edge rows: the glyph grown by one pixel all round, plus a one-pixel drop shadow, in ink-1.
  const ink = C['ink-1'];
  const ir = (ink >> 16) & 255;
  const ig = (ink >> 8) & 255;
  const ib = ink & 255;
  [...CHARS].forEach((_, i) => {
    const p = places[i]!;
    for (let cy = 0; cy < cellH; cy++) {
      for (let cx = 0; cx < cellWs[i]!; cx++) {
        const sx = p.x + cx;
        const sy = p.y + cy;
        let hit = false;
        for (let dy = -1; dy <= 2 && !hit; dy++) {
          for (let dx = -1; dx <= 1 && !hit; dx++) {
            if (dy === 2 && dx !== 0) continue;
            if (on(sx - dx, sy - dy) && sy - dy < p.y + cellH) hit = true;
          }
        }
        const o = ((sy + cellH) * atlasW + sx) * 4;
        if (hit) {
          d[o] = ir;
          d[o + 1] = ig;
          d[o + 2] = ib;
          d[o + 3] = 255;
        }
      }
    }
  });
  g.putImageData(img, 0, 0);
  // Capital height from the thresholded 'H'.
  const hi = [...CHARS].indexOf('H');
  let capTopRow = -1;
  let capBottomRow = -1;
  for (let cy = 0; cy < cellH; cy++) {
    for (let cx = 0; cx < cellWs[hi]!; cx++) {
      if (d[((places[hi]!.y + cy) * atlasW + places[hi]!.x + cx) * 4 + 3]! >= 255) {
        if (capTopRow < 0) capTopRow = cy;
        capBottomRow = cy;
        break;
      }
    }
  }

  const base = Texture.from(raw);
  base.source.scaleMode = 'nearest';
  const font = new PixelFont(spec.id, lineH, ascent);
  font.cap = capTopRow >= 0 ? capBottomRow - capTopRow + 1 : ascent;
  [...CHARS].forEach((ch, i) => {
    const p = places[i]!;
    font.glyphs.set(ch, {
      fill: new Texture({ source: base.source, frame: new Rectangle(p.x, p.y, cellWs[i]!, cellH) }),
      edge: new Texture({ source: base.source, frame: new Rectangle(p.x, p.y + cellH, cellWs[i]!, cellH) }),
      adv: advs[i]!,
    });
  });
  return font;
}

export type Align = 'left' | 'center' | 'right';

export interface TextOptions {
  color?: number;
  /** Ink outline and drop shadow, for text that stands on the world. */
  outline?: boolean;
  align?: Align;
  /** Wrap at this width (art pixels). */
  maxWidth?: number;
  /** Extra pixels between lines. */
  leading?: number;
}

/**
 * A line or block of pixel text. Its origin is the top of the text: left, centre or
 * right edge by `align`. Glyph positions are always whole art pixels.
 */
export class PixelText extends Container {
  private _text = '';
  private readonly back = new Container();
  private readonly front = new Container();
  private pool: Sprite[] = [];
  private used = 0;
  private _color: number;
  textWidth = 0;
  textHeight = 0;

  constructor(
    readonly font: PixelFont,
    text = '',
    readonly opts: TextOptions = {},
  ) {
    super();
    this._color = opts.color ?? C.white;
    this.addChild(this.back, this.front);
    this.text = text;
  }

  get text(): string {
    return this._text;
  }

  set text(v: string) {
    if (v === this._text && this.used > 0) return;
    this._text = v;
    this.rebuild();
  }

  get color(): number {
    return this._color;
  }

  /** Changes the wrap width and redraws. */
  setMaxWidth(w: number | undefined): void {
    if (this.opts.maxWidth === w) return;
    this.opts.maxWidth = w;
    this.rebuild();
  }

  set color(c: number) {
    if (c === this._color) return;
    this._color = c;
    for (const s of this.front.children as Sprite[]) s.tint = c;
  }

  private take(): Sprite {
    const s = this.pool.pop() ?? new Sprite();
    s.visible = true;
    return s;
  }

  private wrap(text: string): string[] {
    const max = this.opts.maxWidth;
    const out: string[] = [];
    for (const para of text.split('\n')) {
      if (!max) {
        out.push(para);
        continue;
      }
      let line = '';
      for (const word of para.split(' ')) {
        const tryLine = line ? `${line} ${word}` : word;
        if (line && this.font.measure(tryLine) > max) {
          out.push(line);
          line = word;
        } else line = tryLine;
      }
      out.push(line);
    }
    return out;
  }

  private rebuild(): void {
    for (const c of [...this.back.children, ...this.front.children] as Sprite[]) {
      c.visible = false;
      this.pool.push(c);
    }
    this.back.removeChildren();
    this.front.removeChildren();
    const lines = this.wrap(this._text);
    const lh = this.font.lineHeight + (this.opts.leading ?? 0);
    let widest = 0;
    lines.forEach((line, li) => {
      const w = this.font.measure(line);
      widest = Math.max(widest, w);
      const align = this.opts.align ?? 'left';
      let x = align === 'center' ? -Math.floor(w / 2) : align === 'right' ? -w : 0;
      const y = li * lh;
      for (const ch of line) {
        const gl = this.font.glyph(ch);
        if (ch !== ' ') {
          if (this.opts.outline) {
            const e = this.take();
            e.texture = gl.edge;
            e.tint = 0xffffff;
            e.position.set(x - 2, y - 1);
            this.back.addChild(e);
          }
          const f = this.take();
          f.texture = gl.fill;
          f.tint = this._color;
          f.position.set(x - 2, y - 1);
          this.front.addChild(f);
        }
        x += gl.adv;
      }
    });
    this.used = 1;
    this.textWidth = widest;
    this.textHeight = lines.length * lh - (this.opts.leading ?? 0);
  }
}
