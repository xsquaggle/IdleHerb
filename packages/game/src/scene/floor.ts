/**
 * One floor of the tower (style bible 13): a 360x120 module built back to
 * front from the wall, the props, the crop, the workers and manager, the
 * shell, and the floor's UI plate. The whole module is the tap target.
 */
import { Container, Graphics, Rectangle, Sprite, Texture, type FederatedPointerEvent } from 'pixi.js';
import { formatCost, formatNum, formatDuration, nextMilestone, Num } from '@sprout/core';
import { tex, texList, hasTex } from '../engine/assets';
import { C } from '../engine/palette';
import { PixelText } from '../engine/font';
import { Bar, Button, F, box, pop } from '../engine/ui';
import { clock, ease } from '../engine/tween';
import { Particles } from '../engine/particles';
import { sfx } from '../engine/audio';
import { session } from '../app/session';
import { content, floorName, ui } from '../app/content';
import { popText, sparkle } from './fx';

export const FLOOR_W = 360;
export const FLOOR_H = 120;
const FLOOR_LINE = 112;

interface Layout {
  /** Worker A stands here (centre x). */
  a: number;
  /** Worker B walks this range, or stands at its first end. */
  b?: [number, number];
  /** The manager's spot when hired. */
  m: number;
  /** Where coins and numbers rise from. */
  spot: [number, number];
  hemp?: number[];
  sky?: boolean;
}

// Hand-placed on the cut floor art (tools/art/cut_v2_floors.py and compose_floor_contents.py).
const LAYOUTS: Layout[] = [
  { a: 112, b: [150, 246], m: 300, spot: [182, 58] },
  { a: 122, b: [196, 262], m: 310, spot: [180, 56] },
  { a: 96, b: [252, 282], m: 318, spot: [188, 40], hemp: [150, 176, 202, 228], sky: true },
  { a: 238, b: [120, 200], m: 318, spot: [160, 60] },
  { a: 78, b: [124, 206], m: 252, spot: [170, 56] },
  { a: 126, b: [236, 262], m: 300, spot: [192, 50], sky: true },
  { a: 118, b: [140, 206], m: 246, spot: [180, 60] },
  { a: 126, b: [140, 196], m: 268, spot: [210, 60] },
  { a: 110, b: [160, 252], m: 300, spot: [190, 56] },
  { a: 166, m: 252, spot: [170, 56] },
];

function workerFolders(i: number): string[] {
  const n = String(i + 1).padStart(2, '0');
  const dirs = i < 3 ? [`w1_floor${n}_gardener`, `w1_floor${n}_worker2`] : [`w1_floor${n}_worker1`, `w1_floor${n}_worker2`];
  return dirs.map((d) => `actors/${d}`).filter((d) => texList(d).length > 0);
}

/** A worker or manager: a sprite that plays named poses. */
class Actor extends Container {
  readonly s: Sprite;
  private frames: Texture[];
  private mode: 'idle' | 'work' | 'walk' | 'cheer' = 'idle';
  private t = 0;
  private blinkAt = 2 + Math.random() * 3;
  private walk?: { from: number; to: number; dir: number; pause: number };
  private cheerLeft = 0;
  readonly manager: boolean;

  constructor(folder: string, manager: boolean, x: number) {
    super();
    this.manager = manager;
    this.frames = texList(folder).map((k) => tex(k));
    this.s = new Sprite(this.frames[0]);
    const size = this.frames[0]?.width ?? 80;
    const feet = manager ? 92 : 76;
    this.s.anchor.set(0.5, feet / (this.frames[0]?.height ?? size));
    this.addChild(this.s);
    this.position.set(x, FLOOR_LINE);
    this.t = Math.random() * 3;
  }

  setWalk(from: number, to: number): void {
    this.walk = { from, to, dir: 1, pause: Math.random() * 2 };
    this.mode = 'walk';
  }

  cheer(sec = 0.6): void {
    this.cheerLeft = sec;
  }

  /** `working`: the floor's cycle is running. */
  step(dt: number, working: boolean): void {
    this.t += dt;
    const fr = this.frames;
    if (fr.length === 0) return;
    if (this.cheerLeft > 0) {
      this.cheerLeft -= dt;
      this.s.texture = fr[this.manager ? 2 : 2]!;
      this.s.y = this.cheerLeft > 0.3 ? -2 : 0;
      return;
    }
    this.s.y = 0;
    if (this.manager) {
      // Managers: stand, work, cheer, big moment.
      if (working) this.s.texture = fr[Math.floor(this.t * 2.5) % 2 === 0 ? 1 : 0]!;
      else this.s.texture = fr[0]!;
      return;
    }
    if (this.walk) {
      const w = this.walk;
      if (w.pause > 0) {
        w.pause -= dt;
        this.s.texture = working ? fr[6 + (Math.floor(this.t * 3) % 2)] ?? fr[0]! : this.idleFrame();
        return;
      }
      const speed = 18;
      this.x += w.dir * speed * dt;
      this.s.scale.x = w.dir;
      const walkCycle = [3, 4, 5, 4];
      const carry = working && fr[8] ? 8 : -1;
      this.s.texture = carry >= 0 && Math.floor(this.t * 6) % 2 === 0 ? fr[carry]! : fr[walkCycle[Math.floor(this.t * 7) % 4]!] ?? fr[0]!;
      if ((w.dir > 0 && this.x >= w.to) || (w.dir < 0 && this.x <= w.from)) {
        this.x = w.dir > 0 ? w.to : w.from;
        w.dir = -w.dir;
        w.pause = 1.5 + Math.random() * 2.5;
      }
      this.x = Math.round(this.x * 100) / 100;
      return;
    }
    if (working) this.s.texture = fr[6 + (Math.floor(this.t * 2.5) % 2)] ?? fr[0]!;
    else this.s.texture = this.idleFrame();
  }

  private idleFrame(): Texture {
    const fr = this.frames;
    if (this.t > this.blinkAt) {
      if (this.t > this.blinkAt + 0.12) this.blinkAt = this.t + 2 + Math.random() * 4;
      return fr[1] ?? fr[0]!;
    }
    return fr[0]!;
  }
}

export class FloorView extends Container {
  private readonly lay: Layout;
  private readonly actors = new Container();
  private readonly workers: Actor[] = [];
  private manager: Actor | null = null;
  private readonly crop = new Container();
  private readonly hemp: Sprite[] = [];
  private readonly plate = new Container();
  private readonly nameText: PixelText;
  private readonly levelText: PixelText;
  private readonly rateText: PixelText;
  private readonly bar: Bar;
  private readonly buy: Button;
  private readonly hire: Button;
  private readonly tapHint: PixelText;
  private readonly readyGlow = new Graphics();
  private readonly construction: Sprite;
  readonly fx = new Container();
  readonly particles = new Particles();
  private wasReady = false;
  private lastLevel = -1;
  private buyCount = 1;
  private plantIcons = new Container();

  constructor(readonly index: number) {
    super();
    const lay = (this.lay = LAYOUTS[index] ?? LAYOUTS[0]!);
    const n = String(index + 1).padStart(2, '0');

    // 1. Back wall, with the sky behind it on open-air floors.
    if (lay.sky) {
      const g = new Graphics();
      const bands: [string, number][] = [['lavender-3', 20], ['lavender-4', 22], ['rose-3', 22], ['clay-5', 20], ['gold-4', 20]];
      let y = 8;
      for (const [c, h] of bands) {
        g.rect(12, y, 336, h).fill(C[c]!);
        y += h;
      }
      this.addChild(g);
    }
    const wallKey = texList('walls/veiled').find((k) => k.includes(`w1_floor${n}_`));
    if (wallKey) this.addChild(Object.assign(new Sprite(tex(wallKey)), { x: 12, y: 8 }));

    // 2. Props.
    this.addChild(new Sprite(tex(`floors/w1/floor${n}_contents_360x120.png`)));
    // 3. The crop (the hemp patch grows its own).
    this.addChild(this.crop);
    if (lay.hemp) {
      for (const x of lay.hemp) {
        const s = new Sprite(tex('plants/hemp_fibre_1_seed_32x96.png'));
        s.anchor.set(0.5, 1);
        s.position.set(x, 104);
        this.hemp.push(s);
        this.crop.addChild(s);
      }
    }
    // 4. Actors.
    box(this.readyGlow, 12, 110, 336, 2, C['gold-4'], 0);
    this.readyGlow.visible = false;
    this.addChild(this.readyGlow, this.actors);
    const folders = workerFolders(index);
    if (folders[0]) this.workers.push(new Actor(folders[0], false, lay.a));
    if (folders[1] && lay.b) {
      const b = new Actor(folders[1], false, lay.b[0]);
      if (lay.b[1] - lay.b[0] > 16) b.setWalk(lay.b[0], lay.b[1]);
      this.workers.push(b);
    }
    for (const w of this.workers) this.actors.addChild(w);

    // 5. Shell.
    this.addChild(new Sprite(tex('floors/shell_360x120.png')));

    // 6. Construction scaffold, shown while the floor is being built.
    this.construction = new Sprite(tex('floors/construction_360x120.png'));
    this.construction.visible = false;
    this.addChild(this.construction);

    // 7. UI plate.
    this.addChild(this.plate);
    this.nameText = new PixelText(F.body, floorName(0, index), { outline: true, color: C.white });
    this.nameText.position.set(19, 10);
    this.levelText = new PixelText(F.body, '', { outline: true, color: C['gold-4'] });
    this.levelText.position.set(19, 24);
    this.rateText = new PixelText(F.small, '', { outline: true, color: C['cream-4'] });
    this.rateText.position.set(19, 39);
    this.plate.addChild(this.plantIcons);
    this.plantIcons.position.set(19, 48);

    this.bar = new Bar(336, 7, C['leaf-4'], C['leaf-5']);
    this.bar.position.set(12, 112);

    this.buy = new Button({ w: 96, h: 28, look: 'leaf', label: '', icon: tex('ui/coin_16.png'), repeat: true, sound: false });
    this.buy.position.set(248, 10);
    this.buy.onTap = () => this.doBuy();
    this.buy.onDenied = () => session.hooks.toast(ui('need_coins'), C['clay-5']);

    this.hire = new Button({ w: 96, h: 28, look: 'gold', label: '', icon: tex('ui/coin_16.png') });
    this.hire.position.set(248, 42);
    this.hire.onTap = () => {
      if (session.game.dispatch({ type: 'hire', world: 0, floor: this.index })) sfx.levelUp();
    };

    this.tapHint = new PixelText(F.big, ui('tap_to_harvest'), { align: 'center', outline: true, color: C['gold-4'] });
    this.tapHint.position.set(lay.spot[0], lay.spot[1] - 26);
    this.tapHint.visible = false;

    this.plate.addChild(this.nameText, this.levelText, this.rateText, this.bar, this.tapHint, this.buy, this.hire);
    this.addChild(this.fx, this.particles);

    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, FLOOR_W, FLOOR_H);
    this.cursor = 'pointer';
    this.on('pointerdown', (e: FederatedPointerEvent) => this.onTap(e));
  }

  private onTap(e: FederatedPointerEvent): void {
    const g = session.game;
    const f = g.state.worlds[0]!.floors[this.index]!;
    if (f.level <= 0 || f.constructing > 0) return;
    const p = this.toLocal(e.global);
    g.dispatch({ type: 'tap', count: 1, floor: this.index });
    // Every tap gets a small squash where it lands.
    this.particles.spawn({ x: p.x, y: p.y, colors: [C['leaf-4'], C['leaf-5'], C['gold-4']], count: 4, speed: [30, 70], life: [0.2, 0.4], gravity: 120 });
  }

  /** The game reported a tap on this floor (or one that harvested it). */
  tapped(amount: Num, bumper: boolean, harvested: boolean, combo: number): void {
    const lay = this.lay;
    if (harvested) this.harvested();
    if (amount.gt(0)) {
      const x = lay.spot[0] + Math.round((Math.random() - 0.5) * 40);
      const y = lay.spot[1] + Math.round((Math.random() - 0.5) * 12);
      if (bumper) {
        popText(this.fx, x, y - 8, ui('bumper'), { color: C['rose-4'], font: F.big, rise: 30, life: 1 });
        popText(this.fx, x, y + 12, `+${formatNum(amount)}`, { color: C['gold-5'], font: F.big, rise: 26, life: 1, icon: tex('ui/coin_16.png') });
        this.particles.spawn({ x, y, colors: [C['gold-4'], C['gold-5'], C.white, C['rose-3']], count: 26, speed: [80, 200], life: [0.4, 0.9], size: [1, 3] });
        for (const w of this.workers) w.cheer(0.5);
      } else {
        popText(this.fx, x, y, `+${formatNum(amount)}`, { color: combo > 0.5 ? C['gold-5'] : C['gold-4'] });
      }
    }
  }

  harvested(): void {
    const lay = this.lay;
    sfx.harvest();
    this.particles.spawn({ x: lay.spot[0], y: lay.spot[1] + 20, colors: [C['leaf-3'], C['leaf-4'], C['leaf-5']], count: 12, speed: [50, 130], angle: -Math.PI / 2, spread: 2.2, life: [0.4, 0.8], size: [1, 3] });
    for (const w of this.workers) w.cheer(0.45);
    for (const s of this.hemp) pop(s, 0.25, 0.2);
  }

  milestone(): void {
    sfx.milestone();
    const lay = this.lay;
    popText(this.fx, 180, 30, ui('milestone'), { color: C['gold-5'], font: F.big, rise: 18, life: 1.6 });
    popText(this.fx, 180, 52, ui('twice_as_fast'), { color: C.white, rise: 14, life: 1.6 });
    for (let i = 0; i < 6; i++) clock.after(i * 0.08, () => sparkle(this.fx, 30 + Math.random() * 300, 20 + Math.random() * 80, C['gold-5'], 3));
    this.particles.spawn({ x: lay.spot[0], y: lay.spot[1], colors: [C['gold-3'], C['gold-4'], C['gold-5'], C.white], count: 40, speed: [60, 220], life: [0.6, 1.2], size: [1, 3] });
    for (const w of this.workers) w.cheer(1.2);
    this.manager?.cheer(1.2);
  }

  opened(): void {
    sfx.floorOpen();
    this.particles.spawn({ x: 180, y: 100, colors: [C['cream-2'], C['cream-3'], C['wood-5']], count: 40, speed: [40, 160], angle: -Math.PI / 2, spread: 3, life: [0.5, 1.0], size: [2, 4], gravity: 80 });
    for (const w of this.workers) w.cheer(1);
    this.alpha = 1;
  }

  hired(): void {
    this.ensureManager();
    if (this.manager) {
      this.manager.y = FLOOR_LINE - 40;
      void clock.tween(this.manager, { y: FLOOR_LINE }, 0.35, { ease: ease.outBounce });
      this.manager.cheer(1.4);
    }
    this.particles.spawn({ x: this.lay.m, y: 70, colors: [C['gold-4'], C['gold-5'], C.white], count: 24, speed: [60, 160], life: [0.5, 1], size: [1, 3] });
  }

  private ensureManager(): void {
    if (this.manager) return;
    const n = String(this.index + 1).padStart(2, '0');
    const folder = `actors/w1_floor${n}_manager`;
    if (texList(folder).length === 0) return;
    this.manager = new Actor(folder, true, this.lay.m);
    this.actors.addChild(this.manager);
  }

  setBuyCount(n: number): void {
    this.buyCount = n;
  }

  private doBuy(): void {
    const g = session.game;
    const count = this.countFor(session.settings.buyMode);
    if (count <= 0) return;
    if (g.dispatch({ type: 'buyLevels', world: 0, floor: this.index, count })) {
      sfx.buy();
      pop(this.levelText, 0.3, 0.16);
      this.particles.spawn({ x: 296, y: 30, colors: [C['leaf-4'], C['leaf-5'], C.white], count: 6, speed: [40, 90], angle: -Math.PI / 2, spread: 1.6, life: [0.3, 0.5] });
    }
  }

  /** How many levels the buy button would buy in a mode. */
  countFor(mode: number): number {
    const g = session.game;
    const f = g.state.worlds[0]!.floors[this.index]!;
    if (mode === 0) return 1;
    if (mode === 1) return 10;
    if (mode === 2) return Math.max(1, nextMilestone(f.level, g.t) - f.level);
    return Math.max(1, g.maxLevels(0, this.index));
  }

  /** Called every frame with the presentation time step. */
  update(dt: number): void {
    const g = session.game;
    const s = g.state;
    const f = s.worlds[0]!.floors[this.index]!;
    const info = g.floorInfo(0, this.index);
    const coins = s.worlds[0]!.coins;
    const building = f.constructing > 0;
    this.construction.visible = building;
    this.actors.visible = !building;
    this.plate.visible = !building;
    if (building) return;

    const managed = info.managed;
    const fast = info.cycleSec < 0.5;
    const working = managed || !f.ready;

    // Plate texts.
    if (f.level !== this.lastLevel) {
      this.levelText.text = `${ui('level')} ${f.level}`;
      this.lastLevel = f.level;
    }
    const perCycle = info.payout;
    this.rateText.text = fast ? `${formatNum(info.ips)}${ui('per_sec')}` : `+${formatNum(perCycle)} / ${cycleText(info.cycleSec)}`;

    // Progress bar on the bottom beam.
    this.bar.value = f.ready ? 1 : fast ? 1 : f.progress;
    if (f.ready) this.bar.recolor(C['gold-4'], C['gold-5']);
    else if (managed) this.bar.recolor(C['sky-3'], C['sky-4']);
    else this.bar.recolor(C['leaf-4'], C['leaf-5']);

    // Buy button.
    const count = this.countFor(session.settings.buyMode);
    const cost = g.levelsCost(0, this.index, count);
    const afford = coins.gte(cost);
    this.buy.enabled = afford;
    const label = count > 1 ? `+${count}  ${formatCost(cost)}` : formatCost(cost);
    if (this.buy.caption!.text !== label) this.buy.setText(label);

    // Hire button.
    const canHire = s.unlocked['feature.managers'] !== undefined && !f.hired;
    this.hire.visible = canHire;
    if (canHire) {
      const fee = g.hireFee(0, this.index);
      this.hire.enabled = coins.gte(fee);
      const hl = `${ui('hire')} ${formatCost(fee)}`;
      if (this.hire.caption!.text !== hl) this.hire.setText(hl);
    }
    if (f.hired) this.ensureManager();
    if (this.manager) this.manager.visible = f.hired;

    // Ready: the floor waits for a tap.
    if (f.ready && !this.wasReady) {
      this.tapHint.visible = true;
      this.tapHint.scale.set(0.2);
      void clock.tween(this.tapHint.scale, { x: 1, y: 1 }, 0.25, { ease: ease.outBack });
    }
    if (!f.ready) this.tapHint.visible = false;
    this.wasReady = f.ready;
    if (f.ready) {
      this.tapHint.y = this.lay.spot[1] - 26 + Math.round(Math.sin(clock.time * 6) * 2);
      if (Math.random() < dt * 3) sparkle(this.fx, this.lay.spot[0] + (Math.random() - 0.5) * 80, this.lay.spot[1] + (Math.random() - 0.5) * 40, C['gold-5'], 2);
    }
    this.readyGlow.visible = f.ready && Math.floor(clock.time * 3) % 2 === 0;

    // The hemp grows with the cycle.
    if (this.hemp.length) {
      const stage = f.ready || fast ? 5 : 1 + Math.min(3, Math.floor(f.progress * 4));
      const key = ['', '1_seed', '2_sprout', '3_young', '4_tall', '5_harvest_ready'][stage]!;
      const t = tex(`plants/hemp_fibre_${key}_32x96.png`);
      this.hemp.forEach((h, i) => {
        h.texture = t;
        h.skew.x = stage >= 4 ? Math.sin(clock.time * 1.6 + i * 0.9) * 0.03 : 0;
      });
    }

    // Planted cards show as small leaf markers under the level.
    if (this.plantIcons.children.length !== f.plants.length) {
      this.plantIcons.removeChildren();
      f.plants.forEach((_, i) => {
        const g2 = new Graphics();
        box(g2, i * 10, 0, 8, 8, C['ink-1'], 1);
        g2.rect(i * 10 + 1, 1, 6, 6).fill(C['leaf-4']);
        g2.rect(i * 10 + 3, 2, 2, 4).fill(C['leaf-5']);
        this.plantIcons.addChild(g2);
      });
    }

    for (const w of this.workers) w.step(dt, working);
    this.manager?.step(dt, managed);
  }
}

/**
 * The next floor to open: the shutter with its price plate (style bible 16),
 * or the scaffold while it is being built.
 */
export class NextFloorView extends Container {
  private readonly title: PixelText;
  private readonly open: Button;
  private readonly bar: Bar;
  private index = -1;

  constructor() {
    super();
    this.addChild(new Sprite(tex('floors/shutter_360x120.png')));
    const plate = new Graphics();
    this.addChild(plate);
    this.title = new PixelText(F.body, '', { align: 'center', outline: true, color: C.white });
    this.title.position.set(180, 26);
    this.open = new Button({ w: 132, h: 28, look: 'leaf', label: '', icon: tex('ui/coin_16.png') });
    this.open.position.set(114, 62);
    this.open.onTap = () => {
      if (session.game.dispatch({ type: 'openFloor', world: 0 })) sfx.buy();
    };
    this.bar = new Bar(132, 5, C['gold-3'], C['gold-4']);
    this.bar.position.set(114, 94);
    this.addChild(this.title, this.open, this.bar);
    this.eventMode = 'static';
  }

  update(): void {
    const g = session.game;
    const i = g.nextFloor(0);
    this.visible = i >= 0;
    if (i < 0) return;
    const def = content.worlds[0]!.floors[i]!;
    if (i !== this.index) {
      this.index = i;
      this.title.text = `${floorName(0, i)}`;
    }
    const coins = g.state.worlds[0]!.coins;
    this.open.enabled = coins.gte(def.openCost);
    const label = `${ui('open')} ${formatCost(def.openCost)}`;
    if (this.open.caption!.text !== label) this.open.setText(label);
    const frac = def.openCost.gt(0) ? Math.min(1, coins.div(def.openCost).toNumber()) : 1;
    this.bar.value = frac;
    this.bar.visible = frac < 1;
  }
}

/** A cycle length: "0.6s", "12s", "2m 05s". */
function cycleText(sec: number): string {
  if (sec < 10) return `${(Math.round(sec * 10) / 10).toFixed(1)}s`;
  return formatDuration(sec);
}

export function hasFloorArt(i: number): boolean {
  return hasTex(`floors/w1/floor${String(i + 1).padStart(2, '0')}_contents_360x120.png`);
}

export { Num };
