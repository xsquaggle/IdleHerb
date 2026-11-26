"""Automatic clean-up pass for Batch 1 round 4 (prompts 11 to 14).

The four sheets arrived as exact whole-number enlargements of true-size pixel art,
with a slices.json that names every region. So the pass is: bring the sheet back to
native size, cut each window, snap its colours to the master palette (limited to the
ramps that sprite may use), rebuild the ink outline, and write the sprite.

Usage: python3 -I clean_batch01_round4.py UPLOAD_DIR OUT_DIR

UPLOAD_DIR is the unpacked round 4 zip (four sheets, chest_parts/ and slices.json).
OUT_DIR receives chests/, cards/, icons/ and a review/ folder with before/after sheets.
"""
import sys, os, json, argparse
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--tools', default=os.path.dirname(os.path.abspath(__file__)))
A = ap.parse_args()
sys.path.insert(0, A.tools)
from oklab import rgb_to_oklab  # noqa: E402

PAL = json.load(open(os.path.join(A.tools, '..', 'palette', 'sprout_master_palette_v1.json')))
P_NAMES, P_RGB = [], []
for r in PAL['ramps']:
    for i, c in enumerate(r['colors']):
        P_NAMES.append('%s-%d' % (r['id'], i + 1))
        P_RGB.append([int(c[j:j + 2], 16) for j in (1, 3, 5)])
P_RGB = np.array(P_RGB, np.uint8)
P_LAB = rgb_to_oklab(P_RGB.astype(np.float64))
INK = P_NAMES.index('ink-1')
SLICES = json.load(open(os.path.join(A.src, 'slices.json')))['sheets']


def native(name, s):
    im = np.array(Image.open(os.path.join(A.src, name)).convert('RGBA'))
    return im[::s, ::s].copy()


def hue_class(lab):
    """warm, green, blue or purple, or neutral when there is almost no colour in it."""
    a, b = lab[..., 1], lab[..., 2]
    c = np.sqrt(a * a + b * b)
    h = np.degrees(np.arctan2(b, a)) % 360
    out = np.zeros(lab.shape[:-1], np.int8)          # 0 neutral
    out[(c >= 0.03)] = 1                              # 1 warm
    out[(c >= 0.03) & (h >= 104) & (h < 200)] = 2     # 2 green
    out[(c >= 0.03) & (h >= 200) & (h < 285)] = 3     # 3 blue
    out[(c >= 0.03) & (h >= 285) & (h < 345)] = 4     # 4 purple
    return out


P_CLASS = hue_class(P_LAB)


def allowed(ramps):
    """ramps may hold ramp names (sage) or single colours (leaf-5)."""
    return np.array([(n.rsplit('-', 1)[0] in ramps) or (n in ramps) for n in P_NAMES])


def snap_map(colors, ramps, overrides=None):
    """Nearest master colour for each source colour, inside the allowed ramps.
    Greens stay green, blues stay blue and purples stay purple when the sprite has such a ramp."""
    allow = allowed(ramps)
    lab = rgb_to_oklab(colors.astype(np.float64))
    d = np.sqrt(((lab[:, None, :] - P_LAB[None, :, :]) ** 2).sum(-1))
    d[:, ~allow] = 9
    cls = hue_class(lab)
    for i in range(len(colors)):
        if cls[i] in (2, 3, 4) and lab[i, 0] > 0.30:
            same = allow & (P_CLASS == cls[i])
            if same.any() and d[i, same].min() <= 0.14:
                d[i, ~same] = 9
    near = d.argmin(1)
    if overrides:
        for i, c in enumerate(colors):
            h = '#%02x%02x%02x' % tuple(c)
            if h in overrides:
                near[i] = P_NAMES.index(overrides[h])
    return near, d.min(1)


def reduce_to(idx, budget):
    """Merge the least used colours into their nearest used neighbour until the budget holds."""
    idx = idx.copy()
    merged = 0
    while True:
        vals, cnt = np.unique(idx[idx >= 0], return_counts=True)
        if len(vals) <= budget:
            return idx, merged
        order = np.argsort(cnt)
        v = next(int(vals[o]) for o in order if int(vals[o]) != INK)
        others = [int(x) for x in vals if int(x) != v]
        dd = np.sqrt(((P_LAB[others] - P_LAB[v]) ** 2).sum(-1))
        idx[idx == v] = others[int(dd.argmin())]
        merged += 1


def snap(img, ramps, overrides=None):
    """Return an index image (palette index, -1 = transparent) and stats."""
    op = img[..., 3] == 255
    cols, inv = np.unique(img[op][:, :3], axis=0, return_inverse=True)
    near, dist = snap_map(cols, ramps, overrides)
    idx = np.full(img.shape[:2], -1, np.int32)
    idx[op] = near[inv]
    cnt = np.bincount(inv, minlength=len(cols))
    return idx, dict(src=len(cols), mean=float((dist * cnt).sum() / max(1, cnt.sum())), max=float(dist.max()) if len(dist) else 0.0)


def outline(idx, thresh=0.36):
    """Opaque pixels that touch transparency (4 neighbours) become ink unless already dark."""
    a = idx >= 0
    p = np.pad(a, 1)
    h, w = a.shape
    inside = p[0:h, 1:w + 1] & p[2:h + 2, 1:w + 1] & p[1:h + 1, 0:w] & p[1:h + 1, 2:w + 2]
    L = P_LAB[:, 0]
    fix = a & ~inside & (L[np.where(a, idx, 0)] > thresh)
    out = idx.copy()
    out[fix] = INK
    return out, int(fix.sum())


def components(mask):
    lab = np.zeros(mask.shape, np.int32)
    n = 0
    h, w = mask.shape
    for y0, x0 in zip(*np.nonzero(mask)):
        if lab[y0, x0]:
            continue
        n += 1
        st = [(y0, x0)]
        lab[y0, x0] = n
        while st:
            y, x = st.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        st.append((yy, xx))
    return lab, n


def drop_small(idx, max_px):
    lab, n = components(idx >= 0)
    out = idx.copy()
    dropped = 0
    for k in range(1, n + 1):
        m = lab == k
        if m.sum() <= max_px:
            out[m] = -1
            dropped += 1
    return out, dropped


def to_rgba(idx):
    out = np.zeros(idx.shape + (4,), np.uint8)
    a = idx >= 0
    out[a, :3] = P_RGB[idx[a]]
    out[a, 3] = 255
    return out


def save(idx, rel):
    path = os.path.join(A.out, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(to_rgba(idx), 'RGBA').save(path)


def used(idx):
    return sorted(set(P_NAMES[i] for i in np.unique(idx[idx >= 0])))


def window(nat, w, s):
    x, y, ww, hh = w['x'] // s, w['y'] // s, w['width'] // s, w['height'] // s
    return nat[y:y + hh, x:x + ww]


REPORT = []
SHEETS = {}


def note(cls, name, size, st, cols, fixed, budget):
    REPORT.append(dict(cls=cls, name=name, size=list(size), source_colours=st['src'], colours=len(cols), budget=budget,
                       within_budget=len(cols) <= budget, outline_pixels_fixed=fixed,
                       mean_move=round(st['mean'], 3), max_move=round(st['max'], 3), palette=cols))


BASE = {'ink'}

# ---------- prompt 12: hemp card art, 108x100 windows ----------
CARD = {
    'fibre':           dict(ramps={'sage', 'leaf-5', 'gold', 'wood', 'cream', 'clay'}),
    'seed':            dict(ramps={'sage', 'leaf-5', 'gold', 'cream', 'wood', 'steel', 'clay'}),
    'longstalk':       dict(ramps={'sage', 'leaf-5', 'gold', 'wood', 'sky', 'cream', 'clay'}),
    'giant_show_hemp': dict(ramps={'sage', 'leaf-5', 'gold', 'wood', 'sky', 'steel', 'cream', 'clay'}),
    'silkspun':        dict(ramps={'sage', 'leaf-5', 'gold', 'lavender', 'stone', 'cream'}),
    'sunspun':         dict(ramps={'sage', 'leaf-5', 'gold', 'cream', 'wood', 'clay'}, drop=40),
}
s = SLICES['b01_12_hemp_card_art.png']
nat = native('b01_12_hemp_card_art.png', s['native_scale'])
SHEETS['p12'] = []
for k, cfg in CARD.items():
    crop = window(nat, s['art_windows'][k], s['native_scale'])
    idx, st = snap(crop, cfg['ramps'] | BASE, cfg.get('over'))
    if cfg.get('drop'):
        idx, _ = drop_small(idx, cfg['drop'])
    idx, fixed = outline(idx)
    idx, _ = reduce_to(idx, 32)
    name = 'hemp_%s' % k.replace('giant_show_hemp', 'giant_show')
    save(idx, 'cards/plants/%s_108x100.png' % name)
    note('card', name, idx.shape[::-1], st, used(idx), fixed, 32)
    SHEETS['p12'].append((crop, idx))

# ---------- prompt 13: seed packets and jars, 48x48 ----------
PACK = {
    'fibre_packet':       dict(ramps={'wood', 'gold', 'clay', 'sage', 'leaf-5', 'cream'}),
    'seed_packet':        dict(ramps={'cream', 'gold', 'sage', 'leaf-5', 'wood', 'clay'}),
    'longstalk_packet':   dict(ramps={'sky', 'sage', 'leaf-5', 'gold', 'cream', 'wood', 'steel'}),
    'giant_prize_packet': dict(ramps={'sage', 'leaf-5', 'leaf-6', 'gold', 'sky', 'cream', 'wood'}),
    'silkspun_jar':       dict(ramps={'lavender', 'stone', 'sky', 'white', 'cream'}),
    'sunspun_jar':        dict(ramps={'gold', 'sky', 'cream', 'wood', 'white', 'clay'}),
    'seed_scoop':         dict(ramps={'wood', 'gold', 'cream', 'ash', 'clay'}),
    'seed_sack':          dict(ramps={'wood', 'gold', 'cream', 'leaf', 'clay'}),
}
s = SLICES['b01_13_hemp_seed_packets.png']
nat = native('b01_13_hemp_seed_packets.png', s['native_scale'])
SHEETS['p13'] = []
for k, cfg in PACK.items():
    crop = window(nat, s['art_windows'][k], s['native_scale'])
    idx, st = snap(crop, cfg['ramps'] | BASE, cfg.get('over'))
    idx, fixed = outline(idx)
    idx, _ = reduce_to(idx, 16)
    save(idx, 'icons/seeds/hemp_%s_48.png' % k)
    note('icon', 'hemp_' + k, idx.shape[::-1], st, used(idx), fixed, 16)
    SHEETS['p13'].append((crop, idx))

# ---------- prompt 14: product icons, 48x48 ----------
PROD = {
    'rope_coil':              dict(ramps={'cream', 'gold', 'wood'}),
    'twine_ball':             dict(ramps={'cream', 'gold', 'wood'}),
    'canvas_bolt':            dict(ramps={'cream', 'gold', 'wood'}),
    'folded_shirt':           dict(ramps={'cream', 'gold', 'wood'}),
    'canvas_tote':            dict(ramps={'cream', 'gold', 'wood'}),
    'tied_paper':             dict(ramps={'cream', 'gold', 'wood'}),
    'sage_notebook':          dict(ramps={'sage', 'cream', 'gold', 'wood', 'red', 'rose'}),
    'building_block':         dict(ramps={'cream', 'gold', 'wood'}),
    'block_stack_and_trowel': dict(ramps={'cream', 'gold', 'wood', 'steel', 'clay'}),
    'seed_sack':              dict(ramps={'cream', 'gold', 'wood', 'ash', 'clay'}),
    'cooking_oil':            dict(ramps={'gold', 'cream', 'wood', 'white', 'clay'}),
    'sprout_soap':            dict(ramps={'sage', 'leaf-5', 'gold', 'wood', 'clay'}),
}
s = SLICES['b01_14_hemp_product_icons.png']
nat = native('b01_14_hemp_product_icons.png', s['native_scale'])
SHEETS['p14'] = []
for k, cfg in PROD.items():
    crop = window(nat, s['art_windows'][k], s['native_scale'])
    idx, st = snap(crop, cfg['ramps'] | BASE, cfg.get('over'))
    idx, fixed = outline(idx)
    idx, _ = reduce_to(idx, 16)
    save(idx, 'icons/products/hemp_%s_48.png' % k)
    note('icon', 'hemp_product_' + k, idx.shape[::-1], st, used(idx), fixed, 16)
    SHEETS['p14'].append((crop, idx))

# ---------- prompt 11: chests, 96x80, base and lids as separate parts ----------
CHEST = {
    'common':    {'wood', 'steel', 'ash', 'cream', 'gold', 'leaf', 'clay'},
    'legendary': {'gold', 'wood', 'cream-3', 'cream-4', 'cream-2'},
}
s = SLICES['b01_11_chest_opening_frames.png']
SHEETS['p11'] = []
for kind, an in s['animations'].items():
    ramps = CHEST[kind] | BASE
    parts = {}
    def load(rel):
        if rel not in parts:
            im = np.array(Image.open(os.path.join(A.src, rel)).convert('RGBA'))
            parts[rel] = [im, None]
        return parts[rel]
    # one shared colour map for every part of this chest, so the frames cannot flicker
    allcols = []
    rels = [an['base']] + [st[k] for st in an['steps'] for k in ('interior_shadow', 'lid') if k in st]
    for rel in rels:
        im = load(rel)[0]
        allcols.append(im[im[..., 3] == 255][:, :3])
    cols = np.unique(np.concatenate(allcols), axis=0)
    near, dist = snap_map(cols, ramps)
    lut = {tuple(c): n for c, n in zip(cols, near)}
    for rel in rels:
        im = parts[rel][0]
        idx = np.full(im.shape[:2], -1, np.int32)
        for (y, x) in zip(*np.nonzero(im[..., 3] == 255)):
            idx[y, x] = lut[tuple(im[y, x, :3])]
        parts[rel][1] = idx
    # the outline is rebuilt on each composed frame and written back to the top-most part there
    total_fixed = 0
    for st in an['steps']:
        layers = [an['base']] + [st[k] for k in ('interior_shadow', 'lid') if k in st]
        for _ in range(2):
            comp = np.full(parts[an['base']][1].shape, -1, np.int32)
            owner = np.full(comp.shape, -1, np.int32)
            for li, rel in enumerate(layers):
                m = parts[rel][1] >= 0
                comp[m] = parts[rel][1][m]
                owner[m] = li
            fixed_comp, n = outline(comp)
            ch = fixed_comp != comp
            for li, rel in enumerate(layers):
                m = ch & (owner == li)
                parts[rel][1][m] = INK
            total_fixed += n
            if not n:
                break
    for rel in rels:
        save(parts[rel][1], 'chests/%s' % os.path.basename(rel))
    frames = []
    for st in an['steps']:
        comp = np.full(parts[an['base']][1].shape, -1, np.int32)
        raw = np.zeros(comp.shape + (4,), np.uint8)
        for rel in [an['base']] + [st[k] for k in ('interior_shadow', 'lid') if k in st]:
            m = parts[rel][1] >= 0
            comp[m] = parts[rel][1][m]
            raw[m] = parts[rel][0][m]
        save(comp, 'chests/frames/%s_96x80.png' % st['frame'])
        frames.append(comp)
        SHEETS['p11'].append((raw, comp))
    allidx = np.concatenate([f.ravel() for f in frames])
    cols_used = sorted(set(P_NAMES[i] for i in np.unique(allidx[allidx >= 0])))
    cnt = np.ones(len(cols))
    note('chest', 'chest_%s (4 frames, base + lids)' % kind, (96, 80),
         dict(src=len(cols), mean=float(dist.mean()), max=float(dist.max())), cols_used, total_fixed, 24)

# ---------- contact sheets: before on the left, after on the right ----------
BG = (60, 52, 78)


def tile(img_rgba, p):
    o = np.zeros(img_rgba.shape[:2] + (3,), np.uint8)
    o[:] = BG
    m = img_rgba[..., 3] == 255
    o[m] = img_rgba[m][:, :3]
    return np.repeat(np.repeat(o, p, 0), p, 1)


def sheet(pairs, cols, p, path):
    hh = max(a.shape[0] for a, _ in pairs)
    ww = max(a.shape[1] for a, _ in pairs)
    rows = (len(pairs) + cols - 1) // cols
    gap = 4
    def grid(sel):
        g = np.zeros((rows * (hh + gap) * p, cols * (ww + gap) * p, 3), np.uint8)
        g[:] = BG
        for i, pr in enumerate(pairs):
            t = tile(sel(pr), p)
            y, x = (i // cols) * (hh + gap) * p, (i % cols) * (ww + gap) * p
            g[y:y + t.shape[0], x:x + t.shape[1]] = t
        return g
    left = grid(lambda pr: pr[0])
    right = grid(lambda pr: to_rgba(pr[1]))
    bar = np.full((left.shape[0], 6, 3), 255, np.uint8)
    Image.fromarray(np.concatenate([left, bar, right], 1)).save(path)


os.makedirs(os.path.join(A.out, 'review'), exist_ok=True)
sheet(SHEETS['p11'], 4, 3, os.path.join(A.out, 'review', 'p11_chests_before_after.png'))
sheet(SHEETS['p12'], 3, 3, os.path.join(A.out, 'review', 'p12_hemp_cards_before_after.png'))
sheet(SHEETS['p13'], 4, 5, os.path.join(A.out, 'review', 'p13_seed_packets_before_after.png'))
sheet(SHEETS['p14'], 4, 5, os.path.join(A.out, 'review', 'p14_product_icons_before_after.png'))
json.dump(REPORT, open(os.path.join(A.out, 'review', 'report.json'), 'w'), indent=1)
for r in REPORT:
    print('%-6s %-44s %3dx%-3d colours %2d -> %2d (budget %d %s) outline fixed %3d  move mean %.3f max %.3f' % (
        r['cls'], r['name'], r['size'][0], r['size'][1], r['source_colours'], r['colours'], r['budget'],
        'ok' if r['within_budget'] else 'OVER', r['outline_pixels_fixed'], r['mean_move'], r['max_move']))
