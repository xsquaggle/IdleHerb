/**
 * Placeholder sound: small procedural effects made with WebAudio until Lawson's
 * sound pack arrives (tech plan 03, audio). Every sound is short, soft and
 * warm, and the tap pop rises in pitch as the Combo builds.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let lastTap = 0;

function ac(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Browsers start audio only after a gesture; call this on the first pointer down. */
export function unlockAudio(): void {
  ac();
}

export function setMuted(m: boolean): void {
  muted = m;
  if (m && ctx) void ctx.suspend();
  if (!m && ctx) void ctx.resume();
}

export function isMuted(): boolean {
  return muted;
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; vol?: number; at?: number; slide?: number; attack?: number } = {}): void {
  const c = ac();
  if (!c || !master) return;
  const t0 = c.currentTime + (opts.at ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? 'triangle';
  o.frequency.setValueAtTime(freq, t0);
  if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * opts.slide), t0 + dur);
  const v = opts.vol ?? 0.5;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + (opts.attack ?? 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur: number, opts: { vol?: number; at?: number; freq?: number } = {}): void {
  const c = ac();
  if (!c || !master) return;
  const t0 = c.currentTime + (opts.at ?? 0);
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = opts.freq ?? 1200;
  const g = c.createGain();
  g.gain.value = opts.vol ?? 0.3;
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

// A pentatonic ladder keeps every rising sound pleasant.
const PENTA = [0, 2, 4, 7, 9];
function note(step: number, base = 523.25): number {
  const oct = Math.floor(step / 5);
  const semi = PENTA[((step % 5) + 5) % 5]! + 12 * oct;
  return base * 2 ** (semi / 12);
}

export const sfx = {
  /** One tap. `combo` 0 to 1 raises the pitch. */
  tap(combo = 0): void {
    const now = performance.now();
    if (now - lastTap < 35) return;
    lastTap = now;
    const f = 380 + combo * 420 + Math.random() * 30;
    tone(f, 0.07, { type: 'triangle', vol: 0.35, slide: 1.6 });
  },
  harvest(): void {
    tone(660, 0.08, { type: 'square', vol: 0.12 });
    tone(990, 0.12, { type: 'square', vol: 0.1, at: 0.06 });
  },
  coin(): void {
    tone(1320, 0.05, { type: 'square', vol: 0.08 });
    tone(1760, 0.09, { type: 'square', vol: 0.07, at: 0.04 });
  },
  bumper(): void {
    tone(150, 0.25, { type: 'sine', vol: 0.8, slide: 0.4 });
    noise(0.15, { vol: 0.35, freq: 900 });
    tone(880, 0.18, { type: 'square', vol: 0.08, at: 0.05 });
    tone(1320, 0.2, { type: 'square', vol: 0.07, at: 0.1 });
  },
  buy(): void {
    tone(520, 0.06, { type: 'triangle', vol: 0.3 });
    tone(780, 0.08, { type: 'triangle', vol: 0.25, at: 0.05 });
  },
  levelUp(): void {
    [0, 2, 4, 5].forEach((s, i) => tone(note(s), 0.16, { type: 'square', vol: 0.1, at: i * 0.07 }));
  },
  milestone(): void {
    [0, 2, 4, 5, 7].forEach((s, i) => tone(note(s), 0.22, { type: 'square', vol: 0.11, at: i * 0.08 }));
    tone(note(10, 261.63), 0.5, { type: 'triangle', vol: 0.2, at: 0.4 });
  },
  open(): void {
    noise(0.3, { vol: 0.25, freq: 600 });
    [0, 4, 7, 9].forEach((s, i) => tone(note(s, 392), 0.2, { type: 'triangle', vol: 0.25, at: 0.15 + i * 0.09 }));
  },
  click(): void {
    tone(900, 0.03, { type: 'square', vol: 0.06 });
  },
  deny(): void {
    tone(220, 0.1, { type: 'square', vol: 0.08, slide: 0.8 });
  },
  /** One step of the rarity climb: a chime one note higher per tier. */
  climb(tier: number): void {
    tone(note(tier * 2), 0.25, { type: 'triangle', vol: 0.3 });
    tone(note(tier * 2 + 5), 0.2, { type: 'sine', vol: 0.12, at: 0.02 });
  },
  hop(): void {
    tone(240, 0.08, { type: 'triangle', vol: 0.25, slide: 1.8 });
  },
  burst(tier: number): void {
    noise(0.25 + tier * 0.08, { vol: 0.3 + tier * 0.05, freq: 1500 + tier * 300 });
    tone(110, 0.3, { type: 'sine', vol: 0.6, slide: 0.5 });
  },
  /** The closing sting for a rarity: longer and fuller the rarer it is. */
  sting(tier: number): void {
    const steps = [0, 2, 4, 7, 9, 12, 14, 16].slice(0, 2 + tier);
    steps.forEach((s, i) => tone(note(s, 392), 0.3 + tier * 0.05, { type: tier >= 4 ? 'square' : 'triangle', vol: tier >= 4 ? 0.1 : 0.22, at: i * 0.07 }));
    if (tier >= 4) tone(note(14, 196), 1.2, { type: 'triangle', vol: 0.18, at: steps.length * 0.07 });
  },
  card(): void {
    tone(700, 0.04, { type: 'triangle', vol: 0.2 });
    noise(0.05, { vol: 0.1, freq: 3000 });
  },
  pip(): void {
    tone(880, 0.06, { type: 'sine', vol: 0.2 });
    tone(1175, 0.08, { type: 'sine', vol: 0.18, at: 0.07 });
  },
  visitor(): void {
    [0, 4, 7, 12].forEach((s, i) => tone(note(s, 784), 0.1, { type: 'sine', vol: 0.15, at: i * 0.05 }));
  },
  spurt(): void {
    tone(300, 0.6, { type: 'sawtooth', vol: 0.08, slide: 3 });
    [0, 4, 7, 12].forEach((s, i) => tone(note(s, 523), 0.18, { type: 'square', vol: 0.09, at: 0.3 + i * 0.06 }));
  },
  floorOpen(): void {
    noise(0.4, { vol: 0.2, freq: 500 });
    [0, 2, 4, 7, 9, 12].forEach((s, i) => tone(note(s, 392), 0.18, { type: 'triangle', vol: 0.22, at: 0.2 + i * 0.07 }));
  },
};
