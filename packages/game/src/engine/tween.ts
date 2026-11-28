/**
 * The presentation clock: tweens, timers and per-frame jobs. It runs on real
 * time and never touches the game state, so animations can be skipped or
 * slowed without changing what the player earns.
 */

export type Ease = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  outCubic: (t: number) => 1 - (1 - t) ** 3,
  inCubic: (t: number) => t * t * t,
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
  outElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  outBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
} satisfies Record<string, Ease>;

/** A job runs every frame until it returns false. */
type Job = (dt: number) => boolean | void;

interface Handle {
  dead: boolean;
}

export class Clock {
  private jobs: { fn: Job; h: Handle; owner?: object }[] = [];
  /** Scales every job's time. 0 freezes the presentation (used for hit-pause). */
  speed = 1;
  private freezeLeft = 0;
  time = 0;

  /** Runs `fn(dt)` each frame until it returns false or the handle is killed. */
  every(fn: Job, owner?: object): { kill(): void } {
    const h: Handle = { dead: false };
    this.jobs.push({ fn, h, owner });
    return { kill: () => (h.dead = true) };
  }

  /** Calls `fn` after `sec` seconds. */
  after(sec: number, fn: () => void, owner?: object): { kill(): void } {
    let t = 0;
    return this.every((dt) => {
      t += dt;
      if (t >= sec) {
        fn();
        return false;
      }
      return true;
    }, owner);
  }

  wait(sec: number): Promise<void> {
    return new Promise((r) => this.after(sec, r));
  }

  /**
   * Tweens numeric fields of `target` to `to` over `dur` seconds.
   * Resolves when done (or at once when killed).
   */
  tween(
    target: object,
    to: Record<string, number>,
    dur: number,
    opts: { ease?: Ease; delay?: number; owner?: object; onUpdate?: (k: number) => void } = {},
  ): Promise<void> {
    const keys = Object.keys(to);
    const obj = target as Record<string, number>;
    const from: number[] = [];
    let t = -(opts.delay ?? 0);
    let started = false;
    const e = opts.ease ?? ease.outQuad;
    return new Promise((resolve) => {
      this.every((dt) => {
        if ((target as { destroyed?: boolean }).destroyed) {
          resolve();
          return false;
        }
        t += dt;
        if (t < 0) return true;
        if (!started) {
          started = true;
          for (const k of keys) from.push(obj[k]!);
        }
        const k = dur <= 0 ? 1 : Math.min(1, t / dur);
        const v = e(k);
        keys.forEach((key, i) => {
          obj[key] = from[i]! + (to[key]! - from[i]!) * v;
        });
        opts.onUpdate?.(k);
        if (k >= 1) {
          resolve();
          return false;
        }
        return true;
      }, opts.owner);
    });
  }

  /** Stops every job started with this owner. */
  killOwner(owner: object): void {
    for (const j of this.jobs) if (j.owner === owner) j.h.dead = true;
  }

  /** Freezes the presentation for a moment (a hit-pause). Real time keeps running for the game. */
  freeze(sec: number): void {
    this.freezeLeft = Math.max(this.freezeLeft, sec);
  }

  update(realDt: number): void {
    let dt = realDt * this.speed;
    if (this.freezeLeft > 0) {
      this.freezeLeft -= realDt;
      dt = 0;
    }
    this.time += dt;
    const jobs = this.jobs;
    this.jobs = [];
    const keep: typeof jobs = [];
    for (const j of jobs) {
      if (j.h.dead) continue;
      let alive: boolean | void;
      try {
        alive = j.fn(dt);
      } catch (err) {
        console.error(err);
        alive = false;
      }
      if (alive !== false && !j.h.dead) keep.push(j);
    }
    // Jobs added while running go after the survivors.
    this.jobs = keep.concat(this.jobs);
  }
}

export const clock = new Clock();
