/**
 * Pixel particles (style bible 19): square palette pixels and small sprites on
 * the grid, pooled so a storm of taps never allocates. They pop out of
 * existence at the end of their life rather than fading, as pixel art does.
 */
import { Container, Sprite, Texture } from 'pixi.js';
import { clock } from './tween';

interface P {
  s: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  drag: number;
  life: number;
  age: number;
  /** Size shrinks by one pixel per step at the end of life. */
  size: number;
  frames?: Texture[];
  fps: number;
  spin: boolean;
}

export interface Emit {
  x: number;
  y: number;
  colors: number[];
  count: number;
  /** Speed range in pixels per second. */
  speed?: [number, number];
  /** Direction in radians and the spread around it. Default: all round. */
  angle?: number;
  spread?: number;
  gravity?: number;
  drag?: number;
  life?: [number, number];
  size?: [number, number];
  frames?: Texture[];
  fps?: number;
}

export class Particles extends Container {
  private live: P[] = [];
  private pool: Sprite[] = [];
  /** Reduce motion: fewer particles. */
  thin = false;

  constructor() {
    super();
    this.eventMode = 'none';
    clock.every((dt) => {
      if (this.destroyed) return false;
      this.step(dt);
      return true;
    });
  }

  spawn(e: Emit): void {
    const n = this.thin ? Math.ceil(e.count / 3) : e.count;
    for (let i = 0; i < n; i++) {
      const s = this.pool.pop() ?? new Sprite(Texture.WHITE);
      const sizeR = e.size ?? [1, 2];
      const size = Math.round(sizeR[0] + Math.random() * (sizeR[1] - sizeR[0]));
      const a = e.angle === undefined ? Math.random() * Math.PI * 2 : e.angle + (Math.random() - 0.5) * (e.spread ?? 1);
      const sp = (e.speed ?? [40, 120])[0] + Math.random() * ((e.speed ?? [40, 120])[1] - (e.speed ?? [40, 120])[0]);
      const life = (e.life ?? [0.4, 0.8])[0] + Math.random() * ((e.life ?? [0.4, 0.8])[1] - (e.life ?? [0.4, 0.8])[0]);
      if (e.frames) {
        s.texture = e.frames[0]!;
        s.anchor.set(0.5);
        s.width = s.texture.width;
        s.height = s.texture.height;
        s.tint = 0xffffff;
      } else {
        s.texture = Texture.WHITE;
        s.anchor.set(0);
        s.width = size;
        s.height = size;
        s.tint = e.colors[Math.floor(Math.random() * e.colors.length)]!;
      }
      s.visible = true;
      this.addChild(s);
      this.live.push({
        s,
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: e.gravity ?? 220,
        drag: e.drag ?? 1.5,
        life,
        age: 0,
        size,
        frames: e.frames,
        fps: e.fps ?? 10,
        spin: false,
      });
    }
  }

  private step(dt: number): void {
    if (dt <= 0) return;
    const keep: P[] = [];
    for (const p of this.live) {
      p.age += dt;
      if (p.age >= p.life) {
        p.s.visible = false;
        this.removeChild(p.s);
        this.pool.push(p.s);
        continue;
      }
      const d = Math.max(0, 1 - p.drag * dt);
      p.vx *= d;
      p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.s.position.set(Math.round(p.x), Math.round(p.y));
      if (p.frames) {
        const f = Math.min(p.frames.length - 1, Math.floor(p.age * p.fps));
        p.s.texture = p.frames[f]!;
      } else {
        // In the last third of life the pixel steps down in size.
        const left = 1 - p.age / p.life;
        const sz = left < 0.33 ? Math.max(1, Math.ceil(p.size * left * 3)) : p.size;
        p.s.width = sz;
        p.s.height = sz;
      }
      keep.push(p);
    }
    this.live = keep;
  }

  clear(): void {
    for (const p of this.live) {
      p.s.visible = false;
      this.removeChild(p.s);
      this.pool.push(p.s);
    }
    this.live = [];
  }
}
