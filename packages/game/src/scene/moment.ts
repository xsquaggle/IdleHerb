/**
 * One effect for every big moment (design 0.5, EXPANSION 4.2): `moment(tier, place, form)` scales
 * particles, light, shake, sound layers and hit-pause by the tier's `juice` row (tables/tiers.yaml),
 * and tables/moments.yaml says which tier each event is. So the juice goes where the moment is
 * biggest, and one table tunes it all. Reduce motion keeps the particles and the sound and drops
 * the shake, the flash and the pause.
 */
import type { Container } from 'pixi.js';
import { C } from '../engine/palette';
import { clock } from '../engine/tween';
import { Particles } from '../engine/particles';
import { sfx } from '../engine/audio';
import { content } from '../app/content';
import { session } from '../app/session';
import { tierAt } from '../app/tiers';
import { flash, ring } from './fx';

export type MomentForm = 'short' | 'full';

/** Where a moment happens: a layer and a point in it. */
export interface Place {
  layer: Container;
  x: number;
  y: number;
}

let stage: { fx: Container; particles: Particles; size: () => { w: number; h: number } } | null = null;

/** main.ts hands over the screen-wide layer for flashes and the shared particles. */
export function initMoments(fx: Container, particles: Particles, size: () => { w: number; h: number }): void {
  stage = { fx, particles, size };
}

/** The tier of a named moment (tables/moments.yaml): its base tier, raised by a number reached or a named case. */
export function momentTier(id: string, opts: { value?: number; cases?: string[] } = {}): { tier: number; form: MomentForm } {
  const row = content.moments.get(id);
  if (!row) return { tier: 0, form: 'short' };
  const tiers = content.tiers;
  let tier = tiers.index(row.tier);
  const raise = (t: string) => (tier = Math.max(tier, tiers.index(t)));
  const v = opts.value;
  if (v !== undefined) {
    for (const s of row.steps ?? []) if (v >= s.at) raise(s.tier);
    if (row.every && v > 0 && v % row.every.n === 0) raise(row.every.tier);
    const exact = row.cases?.[String(v)];
    if (exact) raise(exact);
  }
  for (const c of opts.cases ?? []) {
    const t = row.cases?.[c];
    if (t) raise(t);
  }
  return { tier, form: row.form };
}

/** Plays a moment of tier `tier` (0-based) at `place`. */
export function moment(tier: number, place: Place, form: MomentForm = 'short'): void {
  const look = tierAt(tier);
  const j = look.row.juice;
  const reduce = session.settings.reduceMotion;
  const full = form === 'full';
  const pos = stage ? stage.fx.toLocal(place.layer.toGlobal({ x: place.x, y: place.y })) : { x: place.x, y: place.y };

  // Particles in the tier's colours, more and faster the higher the tier.
  stage?.particles.spawn({
    x: pos.x,
    y: pos.y,
    colors: [look.main, look.light, C.white],
    count: Math.round(j.particles * (full ? 1.5 : 1)),
    speed: [40, 120 + tier * 18],
    life: [0.4, 0.8 + tier * 0.08],
    size: [1, tier >= 4 ? 3 : 2],
  });

  // Light: a ring from Rare up, and a screen flash (half strength on a short moment).
  if (tier >= 2 && stage) ring(stage.fx, pos.x, pos.y, look.light, 18 + tier * (full ? 9 : 5), full ? 0.45 : 0.3);
  const flashAt = full ? j.flash : j.flash / 2;
  if (flashAt >= 0.08 && stage) {
    const { w, h } = stage.size();
    flash(stage.fx, w, h, look.light, full ? 0.14 : 0.08, flashAt);
  }

  // Shake and hit-pause (half as long on a short moment).
  if (!reduce) {
    if (j.shake > 0) session.hooks.shake(j.shake, full ? 0.3 : 0.18);
    if (j.pause > 0) clock.freeze(full ? j.pause : j.pause / 2);
  }

  // Sound: a chord with one more layer per step of juice, and a sting on full moments.
  sfx.chord(look.row.chime, j.layers);
  if (full) sfx.sting(Math.max(2, Math.round(look.row.sting / 2)), tier >= 4);
}

/** Plays a named moment (tables/moments.yaml) at `place`. */
export function namedMoment(id: string, place: Place, opts: { value?: number; cases?: string[] } = {}): number {
  const { tier, form } = momentTier(id, opts);
  moment(tier, place, form);
  return tier;
}
