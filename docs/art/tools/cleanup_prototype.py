#!/usr/bin/env python3
"""Sprout Tower art clean-up prototype (reference implementation, numpy + Pillow only).

Turns one AI "pixel-styled" painting into a clean production sprite:
  1. cut the subject out of its baked-in flat background (or threshold a dirty alpha channel),
  2. find the sprite's own 12 to 20 colour families (k-means in OKLab), which removes paint noise,
  3. re-pixelate onto OUR grid: each art pixel takes the dominant colour family of its cell,
     trying several grid phases and keeping thin dark lines alive,
  4. snap every colour family to the locked master palette (optionally only to whitelisted ramps),
  5. hard alpha (0 or 255 only), remove orphan pixels, rebuild a continuous 1 px ink outline.

Usage:
  python3 -I cleanup_prototype.py SRC.png OUT_PREFIX --box X0 Y0 X1 Y1 --factor 3.5
          [--k 16] [--ramps leaf,sage,clay,ink] [--bg auto|alpha|#RRGGBB] [--bg-thresh 0.06]

This is the Phase 0 proof, not the final tool: the production version belongs to the content pipeline.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from oklab import rgb_to_oklab, oklab_to_rgb  # noqa: E402


def load_palette(path, ramps=None):
    data = json.load(open(path))
    names, cols = [], []
    for r in data['ramps']:
        if ramps and r['id'] not in ramps:
            continue
        for i, c in enumerate(r['colors']):
            names.append(f"{r['id']}-{i + 1}"); cols.append(c)
    rgb = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for c in cols], dtype=np.float64)
    return names, rgb, rgb_to_oklab(rgb)


def background_mask(rgb, alpha, mode, thresh):
    """True where the pixel is background."""
    h, w, _ = rgb.shape
    if mode == 'alpha' or (mode == 'auto' and alpha is not None and (alpha < 128).mean() > 0.02):
        return alpha < 128
    if mode.startswith('#'):
        bg = np.array([int(mode[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float64)
    else:  # auto: median colour of the crop border
        bg = np.median(np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]), axis=0)
    dist = np.linalg.norm(rgb_to_oklab(rgb) - rgb_to_oklab(bg), axis=2)
    pad = np.full((h + 2, w + 2), 255, dtype=np.uint8)
    pad[1:-1, 1:-1] = np.where(dist < thresh, 255, 0)
    im = Image.fromarray(pad, 'L')
    ImageDraw.floodfill(im, (0, 0), 128)  # only background connected to the border
    connected = np.asarray(im)[1:-1, 1:-1] == 128
    return connected | (dist < thresh * 0.45)  # plus enclosed pockets (handle holes)


def kmeans(X, k, seed=3, iters=30):
    rng = np.random.default_rng(seed)
    C = [X[rng.integers(len(X))]]
    d2 = ((X - C[0]) ** 2).sum(1)
    for _ in range(k - 1):
        C.append(X[rng.choice(len(X), p=d2 / d2.sum())])
        d2 = np.minimum(d2, ((X - C[-1]) ** 2).sum(1))
    C = np.array(C)
    for _ in range(iters):
        lab = ((X[:, None, :] - C[None]) ** 2).sum(2).argmin(1)
        new = np.array([X[lab == j].mean(0) if (lab == j).any() else C[j] for j in range(k)])
        if np.abs(new - C).max() < 1e-5:
            break
        C = new
    return C


def assign(lab, C, chunk=200000):
    flat = lab.reshape(-1, 3)
    out = np.empty(len(flat), dtype=np.int32)
    for i in range(0, len(flat), chunk):
        out[i:i + chunk] = ((flat[i:i + chunk, None, :] - C[None]) ** 2).sum(2).argmin(1)
    return out.reshape(lab.shape[:2])


def repixelate(idx, bgmask, factor, C, phase=(0.0, 0.0), line_share=0.30, line_dl=0.16):
    """Dominant colour family per cell. Returns (index map, alpha, mean purity)."""
    H, W = idx.shape
    k = len(C)
    h, w = max(1, round(H / factor)), max(1, round(W / factor))
    s = int(np.ceil(factor)) + 1
    counts = np.zeros((h, w, k), dtype=np.float32)
    fg = np.zeros((h, w), dtype=np.float32)
    ii, jj = np.meshgrid(np.arange(h), np.arange(w), indexing='ij')
    for a in range(s):
        for b in range(s):
            ys = np.clip(((ii + (a + 0.5) / s) * factor + phase[1]).astype(int), 0, H - 1)
            xs = np.clip(((jj + (b + 0.5) / s) * factor + phase[0]).astype(int), 0, W - 1)
            isfg = ~bgmask[ys, xs]
            np.add.at(counts, (ii, jj, idx[ys, xs]), isfg.astype(np.float32))
            fg += isfg
    total = np.maximum(counts.sum(2), 1e-6)
    share = counts / total[..., None]
    mode = share.argmax(2)
    purity = share.max(2)
    # thin dark lines: if a clearly darker family owns >= line_share of the cell, it wins
    L = C[:, 0]
    darker = (L[None, None, :] < (L[mode][..., None] - line_dl)) & (share >= line_share)
    cand = np.where(darker, share, 0)
    has = cand.max(2) > 0
    out = np.where(has, cand.argmax(2), mode)
    alpha = fg >= (s * s) * 0.5
    return out, alpha, float(purity[alpha].mean()) if alpha.any() else 0.0


def neighbours(a, fill):
    p = np.pad(a, 1, constant_values=fill)
    h, w = a.shape
    return [p[1 + dy:1 + dy + h, 1 + dx:1 + dx + w] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy, dx) != (0, 0)]


def remove_orphans(idx, alpha, L, passes=2):
    idx = idx.copy()
    for _ in range(passes):
        work = np.where(alpha, idx, -1)
        nb = np.stack(neighbours(work, -1))
        same = (nb == work[None]).sum(0)
        protect = (L[idx] > 0.9) | (L[idx] < 0.3)  # sparkles and ink dots stay
        ys, xs = np.nonzero(alpha & (same == 0) & ~protect)
        if not len(ys):
            break
        for y, x in zip(ys, xs):
            v = nb[:, y, x]; v = v[v >= 0]
            if len(v):
                vals, c = np.unique(v, return_counts=True)
                idx[y, x] = vals[c.argmax()]
    return idx


def despeckle_alpha(alpha):
    nb = np.stack(neighbours(alpha, False)).sum(0)
    alpha = alpha & ~(alpha & (nb < 2))
    p = np.pad(alpha, 1); h, w = alpha.shape
    nb4 = p[0:h, 1:w + 1].astype(int) + p[2:h + 2, 1:w + 1] + p[1:h + 1, 0:w] + p[1:h + 1, 2:w + 2]
    return alpha | (~alpha & (nb4 == 4))


def rebuild_outline(idx, alpha, L, ink):
    """Every opaque pixel that touches transparency (4-neighbour) becomes ink unless already dark."""
    p = np.pad(alpha, 1); h, w = alpha.shape
    inside = p[0:h, 1:w + 1] & p[2:h + 2, 1:w + 1] & p[1:h + 1, 0:w] & p[1:h + 1, 2:w + 2]
    idx = idx.copy()
    idx[alpha & ~inside & (L[idx] > 0.36)] = ink
    return idx


def run(args):
    names, pal_rgb, pal_lab = load_palette(args.palette, set(args.ramps.split(',')) if args.ramps else None)
    src = Image.open(args.src)
    box = tuple(args.box) if args.box else (0, 0) + src.size
    crop = src.crop(box)
    rgb = np.asarray(crop.convert('RGB')).astype(np.float64)
    alpha_src = np.asarray(crop)[..., 3] if src.mode == 'RGBA' else None
    bgmask = background_mask(rgb, alpha_src, args.bg, args.bg_thresh)
    lab = rgb_to_oklab(rgb)
    fgpix = lab[~bgmask]
    rng = np.random.default_rng(1)
    sample = fgpix[rng.choice(len(fgpix), min(len(fgpix), 30000), replace=False)]
    C = kmeans(sample, args.k)
    idx_full = assign(lab, C)
    best = None
    steps = 3
    for py in range(steps):
        for px in range(steps):
            ph = (px * args.factor / steps, py * args.factor / steps)
            res = repixelate(idx_full, bgmask, args.factor, C, ph)
            if best is None or res[2] > best[0][2]:
                best = (res, ph)
    (idx, a, purity), phase = best
    a = despeckle_alpha(a)
    # snap each colour family to the locked palette
    snap = np.array([np.linalg.norm(pal_lab - c, axis=1).argmin() for c in C])
    pidx = snap[idx]
    pidx = remove_orphans(pidx, a, pal_lab[:, 0])
    ink = int(pal_lab[:, 0].argmin())
    if not args.no_outline:
        pidx = rebuild_outline(pidx, a, pal_lab[:, 0], ink)
    out = np.zeros(pidx.shape + (4,), dtype=np.uint8)
    out[..., :3] = pal_rgb[pidx].astype(np.uint8)
    out[..., 3] = np.where(a, 255, 0)
    out[~a, :3] = 0
    Image.fromarray(out, 'RGBA').save(args.out + '_1x.png')
    kk = args.preview
    Image.fromarray(out, 'RGBA').resize((out.shape[1] * kk, out.shape[0] * kk), Image.NEAREST).save(f'{args.out}_{kk}x.png')
    crop.save(args.out + '_before.png')
    n_src = len(np.unique((rgb.reshape(-1, 3).astype(np.uint32) * [65536, 256, 1]).sum(1)))
    used = sorted({names[i] for i in np.unique(pidx[a])})
    stats = dict(source=os.path.basename(args.src), box=box, source_px=[crop.width, crop.height],
                 sprite_px=[out.shape[1], out.shape[0]], factor=args.factor, phase=[round(p, 2) for p in phase],
                 cell_purity=round(purity, 3), colours_before=n_src, colours_after=len(used), palette_entries=used)
    json.dump(stats, open(args.out + '_stats.json', 'w'), indent=1)
    print(f"{stats['source']} {crop.width}x{crop.height} -> {out.shape[1]}x{out.shape[0]} art px | factor {args.factor} "
          f"| purity {purity:.2f} | colours {n_src} -> {len(used)}")


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('out')
    ap.add_argument('--box', type=int, nargs=4)
    ap.add_argument('--factor', type=float, default=3.5)
    ap.add_argument('--k', type=int, default=16)
    ap.add_argument('--ramps', default='')
    ap.add_argument('--palette', default=os.path.join(HERE, '..', 'palette', 'sprout_master_palette_v1.json'))
    ap.add_argument('--bg', default='auto')
    ap.add_argument('--bg-thresh', type=float, default=0.06)
    ap.add_argument('--preview', type=int, default=4)
    ap.add_argument('--no-outline', action='store_true')
    run(ap.parse_args())
