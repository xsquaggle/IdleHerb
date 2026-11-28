"""Floor contents for World 1 floors that have no cleaned props yet, cut from the v2 floor
paintings of the expansion pack (B4_floorNN_*_v2.png, 2160x720, an exact 6x of the 360x120
floor module). Phase 1 slice stand-in until the Art Director's hand pass (style bible 13).

Usage: python3 -I tools/art/cut_v2_floors.py EXPANSION_DIR OUT_ART_DIR [--report DIR]

For each floor: shrink 6x to the grid (cleanlib.shrink_pixels), snap to the master palette,
split into connected pieces, drop the pieces listed in DROP (the painted workers, who are
replaced by the animated worker sprites in art/actors/), and write one PNG per kept piece
plus floor.json in the same shape as art/props/floor03_hemp_patch/floor.json.
"""
import sys, os, json
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'docs', 'art', 'tools'))
import cleanlib as cl  # noqa: E402

FLOORS = {
    1: ('B4_floor01_windowsill_planter_v2.png', 'floor01_windowsill'),
    2: ('B4_floor02_balcony_pots_v2.png', 'floor02_balcony'),
    4: ('B4_floor04_garden_shed_nursery_v2.png', 'floor04_garden_shed'),
    5: ('B4_floor05_greenhouse_v2.png', 'floor05_greenhouse'),
    6: ('B4_floor06_farmers_market_v2.png', 'floor06_market'),
    7: ('B4_floor07_tea_house_v2.png', 'floor07_tea_house'),
    10: ('B4_floor10_herb_empire_hq_v2.png', 'floor10_hq'),
}
ALL = [r for r in cl.RAMPS]


def components(alpha):
    h, w = alpha.shape
    lab = -np.ones((h, w), int)
    comps = []
    for y in range(h):
        for x in range(w):
            if alpha[y, x] and lab[y, x] < 0:
                n = len(comps)
                stack = [(y, x)]
                lab[y, x] = n
                pts = []
                while stack:
                    cy, cx = stack.pop()
                    pts.append((cy, cx))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = cy + dy, cx + dx
                            if 0 <= ny < h and 0 <= nx < w and alpha[ny, nx] and lab[ny, nx] < 0:
                                lab[ny, nx] = n
                                stack.append((ny, nx))
                ys = [p[0] for p in pts]
                xs = [p[1] for p in pts]
                comps.append({'n': n, 'px': len(pts), 'box': [min(xs), min(ys), max(xs) + 1, max(ys) + 1]})
    return lab, comps


def shrink_floor(path):
    im = np.array(Image.open(path).convert('RGBA'))
    im[..., 3] = np.where(im[..., 3] >= 128, 255, 0)
    im[im[..., 3] == 0, :3] = 0
    small = cl.shrink_pixels(im, 360, 120)
    idx, _ = cl.snap(small, ALL)
    return idx


# Per floor, in floor pixels: rectangles (x0, y0, x1, y1) of painted workers to erase, and
# points (x, y) inside connected pieces to drop, to clear the manager's spot or a worker.
EDITS = {
    1: dict(erase=[(96, 12, 138, 112), (138, 34, 150, 47), (228, 16, 280, 112), (214, 40, 228, 62)], drop=[(300, 90)]),
    2: dict(erase=[(88, 8, 144, 112), (140, 30, 162, 64)], drop=[(225, 90), (322, 95), (295, 95)]),
    4: dict(erase=[(128, 20, 184, 73)], drop=[(240, 90), (315, 96)]),
    5: dict(erase=[(54, 38, 99, 112), (238, 29, 268, 112)], drop=[]),
    6: dict(erase=[(102, 16, 150, 112), (236, 28, 290, 112)], drop=[(310, 90)]),
    7: dict(erase=[(95, 28, 152, 88), (95, 88, 140, 112), (150, 50, 172, 76)], drop=[(240, 90)]),
    10: dict(erase=[(130, 6, 198, 80)], drop=[(250, 90)]),
}


def apply_edits(idx, n):
    e = EDITS.get(n, {})
    idx = idx.copy()
    for x0, y0, x1, y1 in e.get('erase', []):
        idx[y0:y1, x0:x1] = -1
    lab, comps = components(idx >= 0)
    for c in comps:
        if c['px'] < 15 or any(lab[dy, dx] == c['n'] for dx, dy in e.get('drop', [])):
            idx[lab == c['n']] = -1
    return idx


def main():
    src, out = sys.argv[1], sys.argv[2]
    report = sys.argv[sys.argv.index('--report') + 1] if '--report' in sys.argv else None
    for n, (fname, folder) in FLOORS.items():
        idx = shrink_floor(os.path.join(src, fname))
        rgba = cl.to_rgba(idx)
        lab, comps = components(rgba[..., 3] == 255)
        if report:
            os.makedirs(report, exist_ok=True)
            Image.fromarray(rgba).save(os.path.join(report, folder + '_full.png'))
            json.dump(comps, open(os.path.join(report, folder + '_parts.json'), 'w'), indent=1)
        print(folder, len(comps), 'pieces;', ', '.join('%d:%s(%d)' % (c['n'], c['box'], c['px']) for c in comps if c['px'] >= 20))
        kept = apply_edits(idx, n)
        path = os.path.join(out, 'floors', 'w1', 'floor%02d_contents_360x120.png' % n)
        cl.save(kept, path)
        print('  wrote', path, 'colours', len(np.unique(kept[kept >= 0])))


if __name__ == '__main__':
    main()
