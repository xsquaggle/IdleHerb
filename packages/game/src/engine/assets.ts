/**
 * Sprite loading. Every PNG the game draws comes from the repo's art/ folder,
 * found at build time by Vite, so a newly cleaned sprite needs no code change to
 * ship. Keys are paths under art/, such as `actors/w1_floor01_manager/01_stand_96x96.png`.
 */
import { Texture, TextureSource } from 'pixi.js';

const urls = import.meta.glob(
  [
    '../../../../art/actors/w1_floor*/*.png',
    '../../../../art/floors/**/*.png',
    '../../../../art/tower/*.png',
    '../../../../art/backgrounds/w1/*.png',
    '../../../../art/walls/veiled/w1_*.png',
    '../../../../art/chests/frames/*.png',
    '../../../../art/cards/frames/*.png',
    '../../../../art/cards/plants/*.png',
    '../../../../art/effects/reveal/*.png',
    '../../../../art/plants/hemp_fibre_*.png',
    '../../../../art/story/pip/*.png',
    '../../../../art/visitors/*.png',
    '../../../../art/icons/ui/*_16.png',
    '../../../../art/icons/ui/*_24.png',
    '../../../../art/icons/currency/*.png',
    '../../../../art/ui/*.png',
  ],
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

const PREFIX = '../../../../art/';
const textures = new Map<string, Texture>();

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url.slice(0, 80)}`));
    img.src = url;
  });
}

/** Loads every sprite. `onProgress` gets a fraction from 0 to 1. */
export async function loadArt(onProgress?: (f: number) => void): Promise<void> {
  TextureSource.defaultOptions.scaleMode = 'nearest';
  const entries = Object.entries(urls);
  let done = 0;
  await Promise.all(
    entries.map(async ([path, url]) => {
      const img = await loadImage(url);
      const tex = Texture.from(img);
      tex.source.scaleMode = 'nearest';
      textures.set(path.slice(PREFIX.length), tex);
      done++;
      onProgress?.(done / entries.length);
    }),
  );
}

/** The texture at an art path. A missing sprite shows as an empty texture and logs once. */
export function tex(key: string): Texture {
  const t = textures.get(key);
  if (t) return t;
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(`[art] missing ${key}`);
  }
  return Texture.EMPTY;
}
const warned = new Set<string>();

export function hasTex(key: string): boolean {
  return textures.has(key);
}

/** Every loaded key under a folder, sorted by name (frame files are numbered). */
export function texList(folder: string): string[] {
  const pre = folder.endsWith('/') ? folder : `${folder}/`;
  return [...textures.keys()].filter((k) => k.startsWith(pre) && !k.slice(pre.length).includes('/')).sort();
}
