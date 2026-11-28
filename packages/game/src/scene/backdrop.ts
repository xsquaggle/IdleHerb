/**
 * The world behind the tower (style bible 14): flat golden-hour sky bands, the
 * far hills and lake, the town street at the tower's foot. Layers scroll at
 * different speeds as the camera climbs, and the sky darkens toward night
 * high up the tower.
 */
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { C } from '../engine/palette';
import { tex } from '../engine/assets';
import { clock } from '../engine/tween';

// From the horizon up: colour and height in art pixels.
const BANDS: [string, number][] = [
  ['gold-4', 18],
  ['gold-3', 14],
  ['clay-5', 22],
  ['clay-4', 16],
  ['rose-3', 30],
  ['lavender-5', 26],
  ['lavender-4', 40],
  ['lavender-3', 60],
  ['lavender-2', 90],
  ['sky-1', 120],
  ['lavender-1', 160],
];
const NIGHT = 'ink-2';

export class Backdrop extends Container {
  private readonly sky = new Graphics();
  private readonly stars = new Container();
  private readonly far = new Container();
  private readonly street = new Container();
  private readonly ground = new Graphics();
  private w = 0;
  private h = 0;

  constructor() {
    super();
    this.eventMode = 'none';
    this.addChild(this.sky, this.stars, this.far, this.ground, this.street);
    // Twinkle: a few stars change step now and then.
    let t = 0;
    clock.every((dt) => {
      t += dt;
      if (t > 0.35) {
        t = 0;
        const s = this.stars.children[Math.floor(Math.random() * this.stars.children.length)] as Sprite | undefined;
        if (s) s.tint = s.tint === C.white ? C['lavender-5'] : C.white;
      }
      return true;
    });
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.far.removeChildren();
    this.street.removeChildren();
    // The far layer is open in the middle between the lake and the town: the lake runs on behind the houses.
    this.far.addChild(new Graphics().rect(-4000, -244, 8000, 200).fill(C['sky-2']));
    // Below the far town, the cobbles run on to the street (seen when the camera sits low).
    this.far.addChild(new Graphics().rect(-4000, -2, 8000, 600).fill(C['stone-2']));
    // The 640-wide layers are mirrored outward to fill any width.
    const farTex = tex('backgrounds/w1/far_hills_lake_640x430.png');
    const streetTex = tex('backgrounds/w1/town_street_640x85.png');
    const copies = Math.ceil((w - 640) / 1280) + 1;
    for (let i = -copies; i <= copies; i++) {
      for (const [layer, t] of [
        [this.far, farTex],
        [this.street, streetTex],
      ] as const) {
        const s = new Sprite(t);
        s.anchor.set(0, 1);
        if (i % 2 !== 0) {
          s.scale.x = -1;
          s.x = i * 640 + 640;
        } else s.x = i * 640;
        layer.addChild(s);
      }
    }
    this.ground.clear().rect(0, 0, w, h + 400).fill(C['leaf-1']);
    this.lastHorizon = NaN;
    this.stars.removeChildren();
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < Math.floor((w * 900) / 2500); i++) {
      const star = new Sprite(Texture.WHITE);
      star.width = rnd() < 0.15 ? 2 : 1;
      star.height = star.width;
      star.tint = rnd() < 0.5 ? C.white : C['lavender-5'];
      star.position.set(Math.floor(rnd() * w), Math.floor(rnd() * 900));
      this.stars.addChild(star);
    }
  }

  /**
   * Places the layers for a camera. `groundY` is the screen y of the street line
   * (the tower's foot); it rises off the bottom as the camera climbs.
   */
  update(groundY: number, towerX: number): void {
    const w = this.w;
    const h = this.h;
    // Sky: the horizon sits a little above the street and moves at a fifth of the camera's speed.
    const horizon = Math.round(this.h * 0.62 + (groundY - this.h * 0.8) * 0.2);
    if (horizon !== this.lastHorizon || w !== this.lastW) this.drawSky(horizon);
    // Far hills: half speed, their foot just behind the street.
    const farY = Math.round(horizon + (groundY - horizon) * 0.5 + 40);
    this.far.position.set(Math.round(towerX + 180 - 320), farY);
    // The street is part of the tower's ground and moves with it.
    this.street.position.set(Math.round(towerX + 180 - 320), Math.round(groundY + 46));
    const gy = Math.round(groundY + 46);
    this.ground.y = gy;
    this.ground.visible = gy < h;
  }

  private lastHorizon = NaN;
  private lastW = 0;

  private drawSky(horizon: number): void {
    const w = this.w;
    const h = this.h;
    this.lastHorizon = horizon;
    this.lastW = w;
    const g = this.sky;
    g.clear();
    g.rect(0, 0, w, h).fill(C[NIGHT]!);
    let y = horizon;
    g.rect(0, horizon, w, Math.max(0, h - horizon)).fill(C[BANDS[0]![0]]!);
    for (const [c, bh] of BANDS) {
      const top = y - bh * 2;
      g.rect(0, top, w, y - top).fill(C[c]!);
      y = top;
    }
    this.stars.y = y - 900;
    this.stars.visible = y > 0;
  }
}
