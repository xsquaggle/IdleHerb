/**
 * A modal window: a dim shade, a wood-framed parchment panel with a title and a
 * close button, and a body that scrolls when its content is taller than the
 * screen. Panels (chests, cards, Replant, settings) build on it.
 */
import { Container, Graphics, Rectangle, type FederatedPointerEvent, type FederatedWheelEvent } from 'pixi.js';
import { PixelText } from '../engine/font';
import { Button, F, Shade, panel } from '../engine/ui';
import { C } from '../engine/palette';
import { tex } from '../engine/assets';
import { clock, ease } from '../engine/tween';

export abstract class Window extends Container {
  protected readonly shade: Shade;
  protected readonly frame = new Graphics();
  protected readonly titleText: PixelText;
  protected readonly closeBtn: Button;
  /** Scrolling content. Children are laid out from (0,0) at the body's width. */
  protected readonly body = new Container();
  private readonly clip = new Graphics();
  private readonly viewport = new Container();
  protected bw = 0;
  protected bh = 0;
  /** Screen size at the last layout. */
  protected sw = 0;
  protected sh = 0;
  private scrollY = 0;
  private contentH = 0;
  private drag: { y: number; s: number; moved: number } | null = null;
  onClosed: (() => void) | undefined;
  closed = false;

  constructor(
    title: string,
    protected readonly maxW = 340,
    protected readonly maxH = 420,
  ) {
    super();
    this.shade = new Shade(1, 1);
    this.shade.on('pointertap', () => this.close());
    this.titleText = new PixelText(F.big, title, { align: 'center', color: C.white, outline: true });
    this.closeBtn = new Button({ w: 24, h: 24, look: 'red', icon: tex('icons/ui/close_16.png') });
    this.closeBtn.onTap = () => this.close();
    this.viewport.addChild(this.body);
    this.viewport.mask = this.clip;
    this.frame.eventMode = 'static';
    this.addChild(this.shade, this.frame, this.clip, this.viewport, this.titleText, this.closeBtn);

    this.viewport.eventMode = 'static';
    this.viewport.on('pointerdown', (e: FederatedPointerEvent) => {
      this.drag = { y: e.global.y, s: this.scrollY, moved: 0 };
    });
    this.viewport.on('globalpointermove', (e: FederatedPointerEvent) => {
      if (!this.drag) return;
      const dy = e.global.y - this.drag.y;
      this.drag.moved = Math.max(this.drag.moved, Math.abs(dy));
      if (this.drag.moved > 4) this.setScroll(this.drag.s - dy);
    });
    const up = () => (this.drag = null);
    this.viewport.on('pointerup', up);
    this.viewport.on('pointerupoutside', up);
    this.viewport.on('wheel', (e: FederatedWheelEvent) => this.setScroll(this.scrollY + e.deltaY * 0.5));
  }

  /** Builds the body for the current width. Called on open and on resize. */
  protected abstract build(width: number): void;

  /** Called each frame while open. */
  update(_dt: number): void {}

  layout(sw: number, sh: number): void {
    this.sw = sw;
    this.sh = sh;
    this.shade.resize(sw, sh);
    const w = Math.min(this.maxW, sw - 12);
    const h = Math.min(this.maxH, sh - 12);
    const x = Math.floor((sw - w) / 2);
    const y = Math.floor((sh - h) / 2);
    this.frame.clear();
    panel(this.frame, x, y, w, h);
    // Title bar on the wood.
    this.frame.rect(x + 5, y + 5, w - 10, 22).fill(C['wood-3']);
    this.frame.rect(x + 5, y + 26, w - 10, 1).fill(C['wood-2']);
    this.titleText.position.set(x + Math.floor(w / 2), y + 16 - F.big.capTop - Math.ceil(F.big.cap / 2));
    this.closeBtn.position.set(x + w - 28, y + 4);
    this.bw = w - 22;
    this.bh = h - 40;
    this.viewport.position.set(x + 11, y + 32);
    this.viewport.hitArea = new Rectangle(0, 0, this.bw, this.bh);
    this.clip.clear();
    this.clip.rect(x + 6, y + 28, w - 12, h - 34).fill(0xffffff);
    this.rebuild();
  }

  /** Rebuilds the body content in place, keeping the scroll. */
  rebuild(): void {
    for (const c of this.body.removeChildren()) c.destroy({ children: true });
    this.build(this.bw);
    this.contentH = this.body.height;
    this.setScroll(this.scrollY);
  }

  private setScroll(s: number): void {
    const max = Math.max(0, this.contentH - this.bh + 6);
    this.scrollY = Math.max(0, Math.min(max, s));
    this.body.y = -Math.round(this.scrollY);
  }

  openAnim(): void {
    this.frame.scale.set(1);
    this.alpha = 0;
    void clock.tween(this, { alpha: 1 }, 0.12);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    void clock.tween(this, { alpha: 0 }, 0.1, { ease: ease.inQuad }).then(() => {
      this.onClosed?.();
      this.destroy({ children: true });
    });
  }
}

/** Plain ink text on parchment. */
export function ink(text: string, opts: { font?: typeof F.body; maxWidth?: number; color?: number; align?: 'left' | 'center' | 'right' } = {}): PixelText {
  return new PixelText(opts.font ?? F.body, text, { color: opts.color ?? C['ink-1'], maxWidth: opts.maxWidth, align: opts.align });
}
