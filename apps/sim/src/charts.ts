/**
 * The report's charts, as hand-written SVG. Static pictures for a Markdown
 * file: every number in a chart is also in a table next to it.
 *
 * Colours: three categorical slots that stay apart for colour-blind readers
 * (checked with the dataviz validator, all pairs), one neutral for targets and
 * budgets, one blue ramp for magnitude. Text always uses the ink colours.
 */
const C = {
  surface: '#ffffff',
  ink: '#191919',
  ink2: '#666666',
  grid: '#e7e7e7',
  axis: '#c2c2c2',
  neutral: '#8a8a8a',
};
export const SERIES = { active: '#257de0', mixed: '#f47230', idle: '#00b894' } as const;
export const NEUTRAL = C.neutral;
const RAMP = ['#cce3fd', '#84b9f3', '#338ced', '#1b64be', '#0e3d7e'];
const FONT = 'system-ui, -apple-system, &quot;Segoe UI&quot;, sans-serif';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n1 = (v: number): string => (Math.round(v * 10) / 10).toString();

function text(x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number } = {}): string {
  return `<text x="${n1(x)}" y="${n1(y)}" font-size="${o.size ?? 12}" fill="${o.fill ?? C.ink2}" text-anchor="${o.anchor ?? 'start'}"${o.weight ? ` font-weight="${o.weight}"` : ''}>${esc(s)}</text>`;
}

function frame(w: number, h: number, title: string, subtitle: string, body: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="${FONT}" role="img">`,
    `<title>${esc(title)}</title><desc>${esc(subtitle)}</desc>`,
    `<rect width="${w}" height="${h}" rx="8" fill="${C.surface}" stroke="${C.grid}"/>`,
    text(20, 28, title, { size: 15, fill: C.ink, weight: 600 }),
    text(20, 46, subtitle, { size: 12 }),
    body,
    '</svg>',
  ].join('\n');
}

/** A filled dot with a surface ring, or a hollow ring for a target. */
function dot(x: number, y: number, color: string, hollow = false): string {
  if (hollow) return `<circle cx="${n1(x)}" cy="${n1(y)}" r="5" fill="${C.surface}" stroke="${color}" stroke-width="2"/>`;
  return `<circle cx="${n1(x)}" cy="${n1(y)}" r="6" fill="${color}" stroke="${C.surface}" stroke-width="2"/>`;
}

function legend(x: number, y: number, items: { name: string; color: string; hollow?: boolean; line?: boolean }[]): string {
  let out = '';
  let at = x;
  for (const it of items) {
    if (it.line) out += `<line x1="${at}" y1="${y - 4}" x2="${at + 16}" y2="${y - 4}" stroke="${it.color}" stroke-width="2" stroke-linecap="round"/>`;
    else out += dot(at + 8, y - 4, it.color, it.hollow);
    out += text(at + 22, y, it.name);
    at += 30 + it.name.length * 6.4;
  }
  return out;
}

const TIME_TICKS: [number, string][] = [
  [600, '10 min'], [3600, '1 h'], [6 * 3600, '6 h'], [86400, 'day 1'], [3 * 86400, 'day 3'], [7 * 86400, 'day 7'], [14 * 86400, 'day 14'], [30 * 86400, 'day 30'], [60 * 86400, 'day 60'],
];

export interface GatePanel {
  title: string;
  rows: { label: string; target: number | null; targets?: { series: string; t: number }[]; points: { series: string; t: number | null }[] }[];
}

/**
 * When each gate is passed, on a log time axis. One panel per play style, one
 * row per gate: a ring for the GDD's target, a dot for each measured run.
 */
export function gateChart(title: string, subtitle: string, panels: GatePanel[], series: { key: string; name: string; color: string }[]): string {
  const w = 860;
  const left = 150;
  const right = 100;
  const rowH = 26;
  const t0 = Math.log10(240);
  const t1 = Math.log10(75 * 86400);
  const x = (t: number): number => left + ((Math.log10(Math.max(t, 240)) - t0) / (t1 - t0)) * (w - left - right);
  let y = 96;
  const perSeries = panels.some((p) => p.rows.some((r) => r.targets?.length));
  let body = legend(20, 70, [...series.map((s) => ({ name: s.name, color: s.color })), perSeries ? { name: 'ring: GDD target, same colour', color: C.neutral, hollow: true } : { name: 'GDD target', color: C.neutral, hollow: true }]);
  for (const p of panels) {
    body += text(20, y, p.title, { size: 13, fill: C.ink, weight: 600 });
    const top = y + 8;
    const bottom = top + p.rows.length * rowH;
    for (const [t, label] of TIME_TICKS) {
      body += `<line x1="${n1(x(t))}" y1="${top}" x2="${n1(x(t))}" y2="${bottom}" stroke="${C.grid}"/>`;
      body += text(x(t), bottom + 14, label, { size: 10, anchor: 'middle' });
    }
    p.rows.forEach((row, i) => {
      const cy = top + i * rowH + rowH / 2;
      body += text(left - 12, cy + 4, row.label, { anchor: 'end', fill: C.ink });
      const xs = row.points.filter((q) => q.t !== null).map((q) => x(q.t!));
      if (row.target !== null) xs.push(x(row.target));
      for (const q of row.targets ?? []) xs.push(x(q.t));
      if (xs.length > 1) body += `<line x1="${n1(Math.min(...xs))}" y1="${cy}" x2="${n1(Math.max(...xs))}" y2="${cy}" stroke="${C.axis}" stroke-width="2"/>`;
      if (row.target !== null) body += dot(x(row.target), cy, C.neutral, true);
      for (const q of row.targets ?? []) body += dot(x(q.t), cy, series.find((k) => k.key === q.series)!.color, true);
      for (const q of row.points) {
        const s = series.find((k) => k.key === q.series)!;
        if (q.t !== null) body += dot(x(q.t), cy, s.color);
      }
      if (row.points.some((q) => q.t === null)) body += text(w - right + 8, cy + 4, 'not reached', { size: 11 });
    });
    y = bottom + 46;
  }
  return frame(w, y - 14, title, subtitle, body);
}

export interface LineSeries {
  name: string;
  color: string;
  points: [number, number][];
  /** Hollow rings on the same scale, for targets. */
  targets?: [number, number][];
}

/** Lines over days. `step` draws a staircase (for counts). */
export function lineChart(title: string, subtitle: string, yLabel: string, series: LineSeries[], o: { step?: boolean; xMax: number; yMax?: number; yTicks?: number[]; targetName?: string } = { xMax: 60 }): string {
  const w = 860;
  const h = 380;
  const left = 64;
  const right = 110;
  const top = 92;
  const bottom = 44;
  const all = series.flatMap((s) => [...s.points, ...(s.targets ?? [])]);
  const yMax = o.yMax ?? Math.max(...all.map((p) => p[1])) * 1.08;
  const x = (d: number): number => left + (d / o.xMax) * (w - left - right);
  const y = (v: number): number => h - bottom - (v / yMax) * (h - top - bottom);
  const span = yMax / 5;
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * 10 ** Math.floor(Math.log10(span))).find((s) => s >= span)!;
  const ticks = o.yTicks ?? Array.from({ length: Math.floor(yMax / nice) + 1 }, (_, i) => i * nice);
  let body = legend(20, 70, [...series.map((s) => ({ name: s.name, color: s.color, line: true })), ...(o.targetName ? [{ name: o.targetName, color: C.neutral, hollow: true }] : [])]);
  for (const t of ticks) {
    body += `<line x1="${left}" y1="${n1(y(t))}" x2="${w - right}" y2="${n1(y(t))}" stroke="${t === 0 ? C.axis : C.grid}"/>`;
    body += text(left - 8, y(t) + 4, String(Math.round(t * 10) / 10), { size: 11, anchor: 'end' });
  }
  for (let d = 0; d <= o.xMax; d += o.xMax > 30 ? 10 : 5) body += text(x(d), h - bottom + 16, d === 0 ? 'day 0' : String(d), { size: 11, anchor: 'middle' });
  body += text(left, top - 8, yLabel, { size: 11 });
  const ends: { y: number; name: string; value: number }[] = [];
  for (const s of series) {
    if (s.points.length === 0) continue;
    let d = '';
    s.points.forEach((p, i) => {
      if (i === 0) d += `M${n1(x(p[0]))},${n1(y(p[1]))}`;
      else if (o.step) d += `H${n1(x(p[0]))}V${n1(y(p[1]))}`;
      else d += `L${n1(x(p[0]))},${n1(y(p[1]))}`;
    });
    const last = s.points[s.points.length - 1]!;
    if (o.step && last[0] < o.xMax) d += `H${n1(x(o.xMax))}`;
    body += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const t of s.targets ?? []) body += dot(x(t[0]), y(t[1]), s.color, true);
    body += dot(x(o.step ? o.xMax : last[0]), y(last[1]), s.color);
    ends.push({ y: y(last[1]), name: s.name, value: last[1] });
  }
  // End labels, pushed apart when two lines finish close together.
  ends.sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i]!.y - ends[i - 1]!.y < 14) ends[i]!.y = ends[i - 1]!.y + 14;
  for (const e of ends) body += text(w - right + 12, e.y + 4, `${e.name} ${Math.round(e.value * 10) / 10}`, { size: 11, fill: C.ink });
  return frame(w, h, title, subtitle, body);
}

export interface BudgetPanel {
  title: string;
  days: number[];
  budget: number[];
  measured: { name: string; color: string; values: (number | null)[] }[];
}

/** Budget against measured, one small panel per multiplier, log scale. */
export function budgetChart(title: string, subtitle: string, panels: BudgetPanel[]): string {
  const pw = 270;
  const ph = 230;
  const gap = 16;
  const w = 20 * 2 + panels.length * pw + (panels.length - 1) * gap;
  const names = panels[0]!.measured.map((m) => ({ name: m.name, color: m.color, line: true }));
  let body = legend(20, 70, [...names, { name: 'Budget (GDD 17.6)', color: C.neutral, line: true }]);
  panels.forEach((p, k) => {
    const x0 = 20 + k * (pw + gap);
    const left = x0 + 46;
    const rightEdge = x0 + pw - 12;
    const top = 112;
    const bottom = top + ph - 60;
    const vals = [...p.budget, ...p.measured.flatMap((m) => m.values.filter((v): v is number => v !== null && v > 0))];
    const lo = Math.floor(Math.log10(Math.min(...vals)));
    const hi = Math.max(lo + 1, Math.ceil(Math.log10(Math.max(...vals)) + 0.05));
    const x = (i: number): number => left + (i / (p.days.length - 1)) * (rightEdge - left);
    const y = (v: number): number => bottom - ((Math.log10(v) - lo) / (hi - lo)) * (bottom - top);
    body += text(x0, 96, p.title, { size: 13, fill: C.ink, weight: 600 });
    for (let e = lo; e <= hi; e++) {
      body += `<line x1="${left}" y1="${n1(y(10 ** e))}" x2="${rightEdge}" y2="${n1(y(10 ** e))}" stroke="${e === lo ? C.axis : C.grid}"/>`;
      body += text(left - 6, y(10 ** e) + 4, e >= 3 ? `${10 ** (e - 3)}K` : String(10 ** e), { size: 10, anchor: 'end' });
    }
    p.days.forEach((d, i) => (body += text(x(i), bottom + 16, i === 0 ? `day ${d}` : String(d), { size: 10, anchor: 'middle' })));
    const path = (vs: (number | null)[]): string => {
      let d = '';
      let pen = false;
      vs.forEach((v, i) => {
        if (v === null || v <= 0) {
          pen = false;
          return;
        }
        d += `${pen ? 'L' : 'M'}${n1(x(i))},${n1(y(v))}`;
        pen = true;
      });
      return d;
    };
    body += `<path d="${path(p.budget)}" fill="none" stroke="${C.neutral}" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>`;
    for (const m of p.measured) {
      body += `<path d="${path(m.values)}" fill="none" stroke="${m.color}" stroke-width="2" stroke-linejoin="round"/>`;
      m.values.forEach((v, i) => {
        if (v !== null && v > 0) body += `<circle cx="${n1(x(i))}" cy="${n1(y(v))}" r="4" fill="${m.color}" stroke="${C.surface}" stroke-width="2"/>`;
      });
    }
  });
  return frame(w, 112 + ph - 20, title, subtitle, body);
}

/** One row of day cells per play style: darker means more happened that day, an empty cell means nothing did. */
export function stripChart(title: string, subtitle: string, rows: { name: string; days: number[] }[], bins: number[]): string {
  const w = 900;
  const left = 140;
  const cell = 11;
  const gapX = 1;
  const rowH = 30;
  const top = 100;
  const shade = (v: number): string | null => {
    if (v <= 0) return null;
    let k = 0;
    while (k < bins.length - 1 && v >= bins[k + 1]!) k++;
    return RAMP[Math.min(k, RAMP.length - 1)]!;
  };
  let body = '';
  // Scale legend.
  let lx = 20;
  body += `<rect x="${lx}" y="60" width="${cell}" height="${cell}" fill="${C.surface}" stroke="${C.axis}"/>` + text(lx + 18, 71, 'nothing', { size: 11 });
  lx += 74;
  bins.forEach((b, i) => {
    const label = i === bins.length - 1 ? `${b} or more` : bins[i + 1]! - 1 === b ? String(b) : `${b} to ${bins[i + 1]! - 1}`;
    body += `<rect x="${lx}" y="60" width="${cell}" height="${cell}" fill="${RAMP[i]}"/>` + text(lx + 18, 71, label, { size: 11 });
    lx += 30 + label.length * 6.2;
  });
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    body += text(left - 12, y + cell - 1, r.name, { anchor: 'end', fill: C.ink });
    r.days.forEach((v, d) => {
      const fill = shade(v);
      body += `<rect x="${left + d * (cell + gapX)}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${fill ?? C.surface}"${fill ? '' : ` stroke="${C.axis}"`}/>`;
    });
  });
  const n = Math.max(...rows.map((r) => r.days.length));
  for (let d = 0; d <= n; d += 10) body += text(left + d * (cell + gapX), top + rows.length * rowH + 8, d === 0 ? 'day 0' : String(d), { size: 10 });
  return frame(w, top + rows.length * rowH + 26, title, subtitle, body);
}

/** Horizontal bars with the value at the tip. `muted` rows are reference rows. */
export function barChart(title: string, subtitle: string, rows: { label: string; value: number; text: string; muted?: boolean }[]): string {
  const w = 860;
  const left = 250;
  const right = 110;
  const rowH = 26;
  const top = 70;
  const max = Math.max(...rows.map((r) => r.value));
  let body = `<line x1="${left}" y1="${top - 4}" x2="${left}" y2="${top + rows.length * rowH}" stroke="${C.axis}"/>`;
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const len = Math.max(2, (r.value / max) * (w - left - right));
    body += text(left - 12, y + 15, r.label, { anchor: 'end', fill: C.ink });
    body += `<path d="M${left},${y + 4}h${n1(len - 4)}a4,4 0 0 1 4,4v6a4,4 0 0 1 -4,4h${n1(-(len - 4))}z" fill="${r.muted ? C.neutral : SERIES.active}"/>`;
    body += text(left + len + 8, y + 15, r.text, { size: 11, fill: C.ink });
  });
  return frame(w, top + rows.length * rowH + 16, title, subtitle, body);
}
