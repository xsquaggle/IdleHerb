/** Short banners at the top of the screen: "New floor!", "Level 3!", quest done. */
import { Container, Graphics } from 'pixi.js';
import { PixelText } from '../engine/font';
import { F, box } from '../engine/ui';
import { C } from '../engine/palette';
import { clock, ease } from '../engine/tween';

export class Toasts extends Container {
  private queue: { text: string; color: number }[] = [];
  private busy = false;
  private w = 0;
  private top: () => number = () => 40;

  constructor() {
    super();
    this.eventMode = 'none';
  }

  /** `top` gives the y where banners hang, below whatever is pinned at the top. */
  layout(w: number, top: () => number): void {
    this.w = w;
    this.top = top;
  }

  show(text: string, color = C['gold-4']): void {
    // Drop repeats of the toast already waiting.
    if (this.queue.some((q) => q.text === text)) return;
    this.queue.push({ text, color });
    if (!this.busy) void this.next();
  }

  private async next(): Promise<void> {
    const item = this.queue.shift();
    if (!item) {
      this.busy = false;
      return;
    }
    this.busy = true;
    const c = new Container();
    const t = new PixelText(F.body, item.text, { align: 'center', color: item.color, maxWidth: Math.min(300, this.w - 40) });
    const bw = t.textWidth + 20;
    const bh = t.textHeight + 12;
    const g = new Graphics();
    box(g, -Math.floor(bw / 2), 0, bw, bh, C['ink-1'], 2);
    box(g, -Math.floor(bw / 2) + 1, 1, bw - 2, bh - 2, C['ink-2'], 1);
    g.rect(-Math.floor(bw / 2) + 2, 1, bw - 4, 1).fill(C['lavender-2']);
    t.position.set(0, 6 - t.font.capTop + Math.floor((t.font.lineHeight - t.font.cap) / 2) - 1);
    c.addChild(g, t);
    const y0 = this.top();
    c.position.set(Math.floor(this.w / 2), y0 - 6);
    c.alpha = 0;
    this.addChild(c);
    void clock.tween(c, { alpha: 1 }, 0.1);
    await clock.tween(c, { y: y0 }, 0.22, { ease: ease.outBack });
    await clock.wait(this.queue.length > 0 ? 0.9 : 1.6);
    await clock.tween(c, { alpha: 0, y: y0 - 6 }, 0.18, { ease: ease.inQuad });
    c.destroy({ children: true });
    void this.next();
  }
}
