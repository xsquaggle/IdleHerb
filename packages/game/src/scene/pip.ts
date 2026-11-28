/**
 * Pip, the little sprout in a pot who guides the first session. Pip pops up in
 * the corner with a line when something new happens, once per line, and goes
 * back down after a while or when tapped.
 */
import { Container, Graphics, Rectangle, Sprite } from 'pixi.js';
import { C } from '../engine/palette';
import { PixelText } from '../engine/font';
import { F, box } from '../engine/ui';
import { tex } from '../engine/assets';
import { clock, ease } from '../engine/tween';
import { sfx } from '../engine/audio';
import { pipLine } from '../app/content';

const SEEN_KEY = 'sprout-tower.pip';
type Pose = 'smile' | 'blink' | 'talk' | 'wave' | 'jump' | 'surprised' | 'thinking' | 'sad' | 'peek';
const POSES: Pose[] = ['smile', 'blink', 'talk', 'wave', 'jump', 'surprised', 'thinking', 'sad', 'peek'];

function poseTex(p: Pose) {
  const i = POSES.indexOf(p);
  return tex(`story/pip/${String(i + 1).padStart(2, '0')}_${p}_48x48.png`);
}

export class Pip extends Container {
  private readonly sprite = new Sprite(poseTex('smile'));
  private readonly bubble = new Container();
  private readonly bubbleBg = new Graphics();
  private readonly text: PixelText;
  private seen: Record<string, true> = {};
  private queue: { id: string; pose: Pose }[] = [];
  private showing = false;
  private hideJob: { kill(): void } | null = null;
  private dismiss: (() => void) | null = null;
  private baseY = 0;
  private w = 0;
  private talkT = 0;

  constructor() {
    super();
    try {
      this.seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}') as Record<string, true>;
    } catch {
      this.seen = {};
    }
    this.text = new PixelText(F.body, '', { color: C['ink-1'], maxWidth: 200 });
    this.bubble.addChild(this.bubbleBg, this.text);
    this.addChild(this.bubble, this.sprite);
    this.visible = false;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointertap', (e) => {
      e.stopPropagation();
      this.dismiss?.();
    });
    this.on('pointerdown', (e) => e.stopPropagation());
    clock.every((dt) => {
      if (!this.showing) return true;
      this.talkT += dt;
      return true;
    });
  }

  layout(w: number, bottom: number): void {
    this.w = w;
    this.baseY = bottom - 52;
    this.x = 4;
    if (!this.showing) this.y = this.baseY + 60;
    else this.y = this.baseY;
  }

  /** Says a line once ever, by its id in text/en.yaml `pip`. */
  say(id: string, pose: Pose = 'talk', force = false): void {
    if ((this.seen[id] && !force) || !pipLine(id)) return;
    if (this.queue.some((q) => q.id === id)) return;
    this.queue.push({ id, pose });
    if (!this.showing) void this.next();
  }

  hasSeen(id: string): boolean {
    return !!this.seen[id];
  }

  private async next(): Promise<void> {
    const item = this.queue.shift();
    if (!item) {
      this.showing = false;
      await clock.tween(this, { y: this.baseY + 60 }, 0.2, { ease: ease.inQuad });
      if (!this.showing) this.visible = false;
      return;
    }
    this.showing = true;
    this.seen[item.id] = true;
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(this.seen));
    } catch {
      /* storage blocked */
    }
    const line = pipLine(item.id)!;
    const maxW = Math.max(140, Math.min(260, this.w - 70));
    this.text.setMaxWidth(maxW - 14);
    this.text.text = line;
    const bw = this.text.textWidth + 14;
    const bh = this.text.textHeight + 12;
    const g = this.bubbleBg;
    g.clear();
    box(g, 0, 0, bw, bh, C['ink-1'], 2);
    box(g, 1, 1, bw - 2, bh - 2, C['cream-4'], 1);
    g.rect(2, bh - 3, bw - 4, 1).fill(C['cream-2']);
    // Tail toward Pip.
    g.rect(-4, bh - 12, 5, 3).fill(C['ink-1']);
    g.rect(-2, bh - 11, 3, 1).fill(C['cream-4']);
    this.text.position.set(7, 6 - F.body.capTop + 2);
    this.bubble.position.set(50, 44 - bh);
    this.bubble.scale.set(0.3);
    this.hitArea = new Rectangle(0, 44 - bh, 50 + bw, bh + 10);
    this.visible = true;
    this.sprite.texture = poseTex(item.pose === 'talk' ? 'wave' : item.pose);
    sfx.pip();
    await clock.tween(this, { y: this.baseY }, 0.25, { ease: ease.outBack });
    void clock.tween(this.bubble.scale, { x: 1, y: 1 }, 0.18, { ease: ease.outBack });
    // Talk for a moment, then smile and blink while the line stays up.
    let t = 0;
    const anim = clock.every((dt) => {
      t += dt;
      if (t < 1.2) this.sprite.texture = poseTex(Math.floor(t * 6) % 2 ? 'talk' : 'smile');
      else this.sprite.texture = poseTex(Math.floor(t) % 4 === 0 && t % 1 < 0.12 ? 'blink' : 'smile');
      return true;
    });
    const readTime = 3 + line.length / 18;
    await new Promise<void>((resolve) => {
      this.dismiss = resolve;
      this.hideJob = clock.after(readTime, resolve);
    });
    this.dismiss = null;
    this.hideJob?.kill();
    anim.kill();
    await clock.tween(this.bubble.scale, { x: 0.3, y: 0.3 }, 0.1);
    this.bubble.scale.set(0);
    void this.next();
  }
}
