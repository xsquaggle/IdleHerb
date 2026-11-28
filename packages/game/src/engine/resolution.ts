/**
 * The resolution manager (docs/tech/03, "Pixel grid and resolution").
 *
 * One art pixel is always a whole block of device pixels. The logical view grows
 * with the screen instead of stretching. Landscape screens need at least 600x360
 * art pixels (the 640x360 layout of the tech plan, with a little give for 1366x768);
 * portrait screens, such as a phone held upright, need at least 360x420, so the
 * 360-wide tower fills the width and more floors show above it.
 */
export interface View {
  /** Logical size in art pixels. */
  w: number;
  h: number;
  /** Device pixels per art pixel. */
  scale: number;
  dpr: number;
  /** A narrow view: HUD top and bottom, tower full width. */
  tall: boolean;
}

export function computeView(cssW: number, cssH: number, dpr: number): View {
  const devW = Math.max(1, Math.round(cssW * dpr));
  const devH = Math.max(1, Math.round(cssH * dpr));
  const portrait = devH > devW;
  const minW = portrait ? 360 : 600;
  const minH = portrait ? 420 : 360;
  const scale = Math.max(1, Math.floor(Math.min(devW / minW, devH / minH)));
  const w = Math.floor(devW / scale);
  const h = Math.floor(devH / scale);
  return { w, h, scale, dpr, tall: w < 600 };
}

/** Sizes and places the canvas so every art pixel lands on whole device pixels. */
export function applyView(canvas: HTMLCanvasElement, v: View, cssW: number, cssH: number): void {
  const cw = (v.w * v.scale) / v.dpr;
  const ch = (v.h * v.scale) / v.dpr;
  canvas.style.width = `${cw}px`;
  canvas.style.height = `${ch}px`;
  canvas.style.left = `${Math.floor((cssW - cw) / 2)}px`;
  canvas.style.top = `${Math.floor((cssH - ch) / 2)}px`;
}
