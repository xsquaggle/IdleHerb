/**
 * Visitors: the Golden Sprout and its friends float across the tower for a
 * while. Tapping one catches it (the core decides what it gives).
 */
import { Container, Sprite, type Texture } from 'pixi.js';
import type { VisitorKind } from '@sprout/core';
import { tex } from '../engine/assets';
import { clock, ease } from '../engine/tween';
import { C } from '../engine/palette';
import { Particles } from '../engine/particles';
import { session } from '../app/session';
import { sfx } from '../engine/audio';

const ART: Record<VisitorKind, string> = {
  windfall: 'golden_sprout',
  sunbeam: 'sunbeam_sprout',
  storm: 'tap_storm_sprout',
  dewdrop: 'dewdrop',
  crate: 'mystery_crate',
  bee: 'busy_bee',
};

class VisitorSprite extends Container {
  readonly s: Sprite;
  private frames: Texture[];
  private t = Math.random() * 10;
  constructor(
    readonly kind: VisitorKind,
    public ref: object,
  ) {
    super();
    const name = ART[kind];
    this.frames = [tex(`visitors/${name}_01_32x32.png`), tex(`visitors/${name}_02_32x32.png`)];
    this.s = new Sprite(this.frames[0]);
    this.s.anchor.set(0.5, 0.75);
    this.addChild(this.s);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = { contains: (x: number, y: number) => x * x + y * y < 22 * 22 };
  }

  step(dt: number, w: number, top: number, bottom: number): void {
    this.t += dt;
    this.s.texture = this.frames[Math.floor(this.t * 4) % 2]!;
    // A lazy figure-eight drift across the middle of the view.
    const span = Math.max(60, w / 2 - 40);
    const midY = (top + bottom) / 2;
    this.x = Math.round(w / 2 + Math.sin(this.t * 0.35) * span);
    this.y = Math.round(midY + Math.sin(this.t * 0.7) * Math.min(80, (bottom - top) / 4));
  }
}

export class Visitors extends Container {
  private readonly sprites: VisitorSprite[] = [];
  readonly parts = new Particles();
  private w = 0;
  private top = 0;
  private bottom = 0;

  constructor() {
    super();
    this.addChild(this.parts);
  }

  layout(w: number, top: number, bottom: number): void {
    this.w = w;
    this.top = top;
    this.bottom = bottom;
  }

  update(dt: number): void {
    const list = session.game.state.visitors;
    // Match sprites to the state's visitor objects by identity.
    for (const sp of [...this.sprites]) {
      if (!list.includes(sp.ref as (typeof list)[number])) {
        this.sprites.splice(this.sprites.indexOf(sp), 1);
        void clock.tween(sp, { alpha: 0 }, 0.3).then(() => sp.destroy({ children: true }));
      }
    }
    for (const v of list) {
      if (!this.sprites.some((s) => s.ref === v)) {
        const sp = new VisitorSprite(v.kind, v);
        sp.on('pointerdown', (e) => {
          e.stopPropagation();
          const idx = session.game.state.visitors.indexOf(sp.ref as (typeof list)[number]);
          if (idx >= 0 && session.game.dispatch({ type: 'catchVisitor', index: idx })) {
            sfx.visitor();
            this.parts.spawn({ x: sp.x, y: sp.y, colors: [C['gold-4'], C['gold-5'], C.white, C['leaf-5']], count: 30, speed: [60, 180], life: [0.4, 0.9], size: [1, 3] });
          }
        });
        sp.scale.set(0.2);
        void clock.tween(sp.scale, { x: 1, y: 1 }, 0.3, { ease: ease.outBack });
        this.sprites.push(sp);
        this.addChildAt(sp, 0);
      }
    }
    for (const sp of this.sprites) {
      sp.step(dt, this.w, this.top, this.bottom);
      if (Math.random() < dt * 4) this.parts.spawn({ x: sp.x, y: sp.y + 6, colors: [C['gold-4'], C['gold-5']], count: 1, speed: [5, 20], life: [0.3, 0.6], gravity: 30 });
    }
  }
}
