/**
 * The tower: the entrance on the street, the open floors stacked above it, the
 * next floor behind its shutter, and the roof on top. The camera scrolls up
 * and down it by drag, wheel or keys, and glides to a floor when asked.
 */
import { Container, Sprite, type FederatedPointerEvent, type FederatedWheelEvent } from 'pixi.js';
import { tex } from '../engine/assets';
import { clock, ease } from '../engine/tween';
import { session } from '../app/session';
import { FLOOR_H, FloorView, NextFloorView } from './floor';

export const ENTRANCE_H = 232;
const ROOF_OVERLAP = 10;

export class Tower extends Container {
  readonly floors: FloorView[] = [];
  readonly next = new NextFloorView();
  private readonly entrance: Sprite;
  private readonly roof: Sprite;
  readonly body = new Container();
  /** Tower y (negative is up) shown at the middle of the view area. */
  camY = -ENTRANCE_H;
  private target: number | null = null;
  private vel = 0;
  private drag: { id: number; y: number; cam: number; moved: number; t: number } | null = null;
  private viewTop = 0;
  private viewBottom = 0;
  private shown = -1;

  constructor() {
    super();
    this.entrance = new Sprite(tex('tower/w1_entrance_360x232.png'));
    this.entrance.y = -ENTRANCE_H;
    this.roof = new Sprite(tex('tower/w1_roof_376x271.png'));
    this.roof.x = -8;
    this.roof.anchor.set(0, 1);
    this.addChild(this.body);
    this.body.addChild(this.entrance, this.roof);
    for (let i = 0; i < 10; i++) {
      const f = new FloorView(i);
      f.position.set(0, floorTop(i));
      f.visible = false;
      this.floors.push(f);
      this.body.addChild(f);
    }
    this.body.addChild(this.next);
    clock.every((dt) => {
      this.step(dt);
      return true;
    });
  }

  /** The screen band the tower is seen through (between the HUD bars). */
  setView(top: number, bottom: number): void {
    this.viewTop = top;
    this.viewBottom = bottom;
  }

  /** Open floors count; the next one shows its shutter above them. */
  private openCount(): number {
    const floors = session.game.state.worlds[0]!.floors;
    let n = 0;
    while (n < floors.length && floors[n]!.level > 0) n++;
    return n;
  }

  private topY(): number {
    const n = this.openCount();
    const modules = n + (session.game.nextFloor(0) >= 0 ? 1 : 0);
    return floorTop(modules - 1) - this.roof.height + ROOF_OVERLAP;
  }

  private bounds(): [number, number] {
    const half = (this.viewBottom - this.viewTop) / 2;
    const lowest = 40 - half; // the street's foot at the bottom edge
    const highest = this.topY() + half - 20;
    return [Math.min(highest, lowest), lowest];
  }

  /** Glides the camera to a tower y. */
  glideTo(y: number): void {
    this.target = y;
  }

  focusFloor(i: number): void {
    if (i < 0) this.glideTo(-ENTRANCE_H / 2);
    else this.glideTo(floorTop(i) + FLOOR_H / 2);
  }

  onDown(e: FederatedPointerEvent): void {
    if (this.drag) return;
    this.drag = { id: e.pointerId, y: e.global.y, cam: this.camY, moved: 0, t: performance.now() };
    this.vel = 0;
    this.target = null;
  }

  onMove(e: FederatedPointerEvent): void {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    const dy = e.global.y - d.y;
    d.moved = Math.max(d.moved, Math.abs(dy));
    if (d.moved < 6) return;
    const now = performance.now();
    const prev = this.camY;
    this.camY = d.cam - dy;
    const [lo, hi] = this.bounds();
    if (this.camY < lo) this.camY = lo - (lo - this.camY) * 0.4;
    if (this.camY > hi) this.camY = hi + (this.camY - hi) * 0.4;
    const dt = Math.max(1, now - d.t) / 1000;
    this.vel = (this.camY - prev) / dt;
    d.t = now;
  }

  onUp(e: FederatedPointerEvent): void {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    if (this.drag.moved < 6) this.vel = 0;
    this.drag = null;
  }

  onWheel(e: FederatedWheelEvent): void {
    this.target = null;
    this.vel = 0;
    this.camY += e.deltaY * 0.6;
    this.clamp();
  }

  scrollBy(dy: number): void {
    this.target = null;
    this.camY += dy;
    this.clamp();
  }

  private clamp(): void {
    const [lo, hi] = this.bounds();
    this.camY = Math.max(lo, Math.min(hi, this.camY));
  }

  private step(dt: number): void {
    const n = this.openCount();
    if (n !== this.shown) this.relayout(n);
    for (let i = 0; i < n; i++) this.floors[i]!.update(dt);
    this.next.update();

    if (!this.drag) {
      const [lo, hi] = this.bounds();
      if (this.target !== null) {
        const t = Math.max(lo, Math.min(hi, this.target));
        this.camY += (t - this.camY) * Math.min(1, dt * 7);
        if (Math.abs(t - this.camY) < 0.5) {
          this.camY = t;
          this.target = null;
        }
      } else if (Math.abs(this.vel) > 5) {
        this.camY += this.vel * dt;
        this.vel *= Math.max(0, 1 - dt * 4);
        if (this.camY < lo || this.camY > hi) this.vel *= 0.5;
      } else this.vel = 0;
      // Spring back inside the bounds.
      if (this.camY < lo) this.camY += (lo - this.camY) * Math.min(1, dt * 10);
      if (this.camY > hi) this.camY += (hi - this.camY) * Math.min(1, dt * 10);
    }
  }

  private relayout(n: number): void {
    this.shown = n;
    this.floors.forEach((f, i) => (f.visible = i < n));
    const nextI = session.game.nextFloor(0);
    this.next.visible = nextI >= 0;
    this.next.y = floorTop(n);
    const modules = n + (nextI >= 0 ? 1 : 0);
    this.roof.y = floorTop(modules - 1) + ROOF_OVERLAP;
  }

  /** Where the tower's ground line (y = 0) sits on screen for the current camera. */
  groundScreenY(): number {
    const mid = (this.viewTop + this.viewBottom) / 2;
    return Math.round(mid - this.camY);
  }

  place(screenW: number): void {
    this.x = Math.floor((screenW - 360) / 2);
    this.y = this.groundScreenY();
  }
}

export function floorTop(i: number): number {
  return -ENTRANCE_H - (i + 1) * FLOOR_H;
}

export { ease };
