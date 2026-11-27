"""Automatic clean-up pass for Asset Batch 3 (Loomington, World 2): images 1 to 7 (rooms), 8 to 11 (back walls),
12 and 13 (background layers), 14 (Mayor Thyme), 15 and 16 (card pictures) and 17 (heirloom icons).
An image runs when its folder is in UPLOAD_DIR.

Usage: python3 -I clean_batch03.py UPLOAD_DIR OUT_DIR

UPLOAD_DIR holds one folder per image, named after its sheet without .png (b03_02_w2_floor02_herb_kiosk/),
with that image's unpacked zip: the sheet, one PNG per item at true size and a slices.json
({"sprites": [{"name", "file", "box", "true_size"}]}).
OUT_DIR receives the sprite folders (same layout as the repo's art/) and review/batch03/.

What came back and what this pass does about it:
- Rooms. ChatGPT drew them on a finer pixel than the game grid: the workers are 74 to 85 pixels tall where the
  bible asks for 64, and most sheets are 390 to 411 pixels wide for a 360 floor. Every room item is brought
  down to five sixths (ROOM_SCALE) by dropping whole rows and columns, never by blending (cleanlib.fit_pixels),
  so a worker of 78 becomes 65. Then the usual pass: snap to the master palette, rebuild the ink outline,
  hold the budget. The items are laid out again on the 360x120 floor with their feet on y 112: the first item
  at the left of the content zone (x 20), the tap target as near the middle as fits, the manager's seat ending
  at x 336.
- Back walls came back 324x108 instead of 336x104. They are brought to 336x104 the same way (twelve columns
  doubled, four rows dropped, each where it shows least). The flat pale-blue sky of the two open-air walls is
  cut out first, so the game's night sky shows there.
- The far skyline and the river came back 360x90, one pixel per art pixel, which is already the game grid. They
  stay that size and repeat left to right (bible section 14: strips tile). The far layer keeps no outline; the
  river's three empty columns at each end are filled with its own edge, so the water runs on when it repeats.
- The town and street layers came back 360x90 too. The town's thin dark lines become stone-1 (the Town outline of
  bible section 14) and its two clusters are saved apart, to stand at the two screen edges beside the tower.
- Mayor Thyme came back in 96x128 frames, body 76 tall but 94 to 98 with his top hat. He gets a 96x104 frame with
  the feet on y 100. His skin came back a light tan where the brief asked for warm brown, so it moves one step
  darker on the skin ramp.
- Card pictures and heirloom icons came back far larger than 108x100 and 48x48 (plants 89 to 187 tall). Reductions
  below two thirds use cleanlib.shrink_pixels (each pixel takes the colour that covers most of its patch, dark
  lines win once they cover a third), smaller ones fit_pixels. Plants stand 94 tall on row 96 like the World 1
  cards; icons sit inside 2 to 45 like the Batch 2 icons.
- Every export carried runs of nearly equal colours (#772b47, #782c48, #792d49). They are folded into one before
  the snap (unify), or they fall on both sides of a palette boundary and show as speckle.
- New colour rules for this batch, each written where it is defined: YELLOW, PLUMCLOTH, DUSTYPLUM,
  BROWN_SKIN_SOFT, SAGE_DRESS, SPROUT_PAINT, STRIPE_DARK, PERI, WATER_HI.
"""
import sys
import os
import json
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402
from cleanlib import (load, snap_many, merge_plan, apply_plan, outline, save, used, sheet, to_rgba,  # noqa: E402
                      veil, VEIL, INK, P_NAMES, fit_pixels, shrink_pixels)
from oklab import rgb_to_oklab  # noqa: E402

SRC, OUT = sys.argv[1], sys.argv[2]
REVIEW = os.path.join(OUT, 'review', 'batch03')
REPORT = []
MANIFESTS = {}
INKSET = {'ink'}
ROOM_SCALE = 5 / 6
FLOOR_Y = 112             # feet and bases on the floor line (bible section 4)
ZONE = (20, 336)          # content zone, left edge to the right end of the manager's spot


def pkg(key):
    return os.path.join(SRC, key)


def slices_of(key):
    return json.load(open(os.path.join(pkg(key), 'slices.json')))['sprites']


def manifest(rel):
    if rel not in MANIFESTS:
        path = os.path.join(OUT, rel)
        MANIFESTS[rel] = json.load(open(path)) if os.path.exists(path) else {}
    return MANIFESTS[rel]


def note(cls, name, idxs, st, fixed, budget, **extra):
    cols = used(idxs)
    h, w = idxs[0].shape
    REPORT.append(dict(cls=cls, name=name, size=[w, h], files=len(idxs), source_colours=st['src'],
                       colours=len(cols), budget=budget, within_budget=len(cols) <= budget,
                       outline_pixels_fixed=fixed, mean_move=round(st['mean'], 3),
                       max_move=round(st['max'], 3), palette=cols, **extra))


def unify(raw, tol=0.015):
    """Fold source colours that are nearly the same (OKLab distance under tol) into the most used of them.
    The Batch 3 exports carry runs like #772b47, #782c48, #792d49: one colour to the eye, but they fell on
    either side of a palette boundary and came out as speckle."""
    op = raw[..., 3] == 255
    cols, inv, cnt = np.unique(raw[op][:, :3], axis=0, return_inverse=True, return_counts=True)
    lab = rgb_to_oklab(cols.astype(np.float64))
    to = np.arange(len(cols))
    for i in np.argsort(-cnt):
        if to[i] != i:
            continue
        near = (np.sqrt(((lab - lab[i]) ** 2).sum(-1)) < tol) & (to == np.arange(len(cols)))
        near[i] = False
        to[near] = i
    out = raw.copy()
    px = out[op]
    px[:, :3] = cols[to[inv.ravel()]]
    out[op] = px
    return out


def clean_one(cls, name, raw, ramps, budget, edge=True, thin=False, rules=None, keep=(), ink=True, **extra):
    raw = unify(raw)
    idxs, st = snap_many([raw], set(ramps) | (INKSET if ink else set()), rules=rules)
    idx, fixed = (outline(idxs[0], keep_thin=thin) if edge else (idxs[0], 0))
    idx = apply_plan([idx], merge_plan([idx], budget, keep))[0]
    note(cls, name, [idx], st, fixed, budget, **extra)
    return idx


# ---------------------------------------------------------------- colour rules (from Batch 2)
# a deep brown skin sits between the skin ramp and the dark golds; it must not turn khaki
BROWN_SKIN = (lambda L, C, h: h < 56 and C > 0.08 and 0.28 < L < 0.72, {'skin'})
# tin and glass are greys with almost no colour: they belong on steel
TIN = (lambda L, C, h: C < 0.04 and 100 <= h < 260 and L > 0.28, {'steel'})
# olive cloth went teal on sage without this
OLIVE = (lambda L, C, h: 90 <= h < 135 and C > 0.035 and L < 0.6, {'leaf-1', 'leaf-2', 'leaf-3'})
# Batch 3: ChatGPT's strong mustard yellow (#fab71f) sat nearer the pale wood-6 than gold-3, so cardigans,
# shirts and brass came out washed out
YELLOW = (lambda L, C, h: 68 <= h < 90 and C > 0.14, {'gold'})
# Batch 3: the lavender cloth of this batch is a dusty plum (hue about 350). Nearest colour put it on pink
# rose-2 or on grey ash; the brief asked for lavender
PLUMCLOTH = (lambda L, C, h: h >= 330 and 0.09 <= C < 0.13 and 0.42 < L < 0.72,
             {'lavender-3', 'lavender-4', 'lavender-5'})
DUSTYPLUM = (lambda L, C, h: h >= 330 and 0.06 < C < 0.09 and 0.42 < L < 0.72,
             {'lavender-4', 'lavender-5', 'stone-3', 'stone-4'})
ROOM_RULES = [YELLOW, PLUMCLOTH, DUSTYPLUM, OLIVE]
# the brickyard mixer's orange work vest is as red-orange as his skin, only stronger: skin stops at chroma 0.14
BROWN_SKIN_SOFT = (lambda L, C, h: h < 56 and 0.08 < C < 0.14 and 0.28 < L < 0.72, {'skin'})
# the tailor's sage dress came back khaki (hue 84 to 94) and split into orange, green and tan
SAGE_DRESS = (lambda L, C, h: 75 <= h < 135 and 0.04 < C < 0.12 and 0.4 < L < 0.8,
              {'sage-2', 'sage-3', 'sage-4', 'sage-5'})

# ---------------------------------------------------------------- images 1 to 7: rooms
WOOD = {'wood', 'clay', 'gold', 'cream', 'white', 'stone', 'ash', 'steel'}
PEOPLE = {'skin', 'blush', 'ash', 'white', 'cream', 'gold', 'wood', 'clay', 'stone', 'steel'}

# image: (floor, folder, room accents for props, [(item, cls, budget, extra ramps, rules)] left to right)
# cls 'tap' is the tap target (item 3), 'seat' the manager's spot (item 6). A worker who holds a prop may use 32.
ROOMS = {
    'b03_01_w2_floor01_rooftop_beds': (1, 'rooftop_garden', {'leaf', 'sage', 'sky'}, [
        ('trellis_arch', 'prop', 16, set(), None),
        ('watering_worker', 'actor', 24, {'sky', 'leaf', 'sage'}, [TIN]),
        ('empty_raised_garden_bed', 'tap', 16, set(), None),
        ('seedling_tray_worker', 'actor', 24, {'teal', 'leaf', 'sage'}, [BROWN_SKIN]),
        ('twin_beehives', 'prop', 16, set(), None),
        ('manager_stool_crate_bell', 'seat', 16, set(), None)]),
    'b03_02_w2_floor02_herb_kiosk': (2, 'herb_kiosk', {'leaf', 'sage'}, [
        ('mint_street_lamp', 'prop', 16, set(), [OLIVE]),
        ('mint_bundling_worker', 'actor', 32, {'leaf', 'sage'}, [OLIVE]),
        ('herb_kiosk', 'tap', 16, set(), [OLIVE]),
        ('mint_serving_worker', 'actor', 24, {'leaf', 'sage'}, [BROWN_SKIN, OLIVE]),
        ('mint_handcart', 'prop', 16, set(), None),
        ('manager_stool_ledger_bell', 'seat', 16, set(), None)]),
    'b03_03_w2_floor03_weaving_mill': (3, 'weaving_mill', {'sky', 'lavender'}, [
        ('thread_cone_rack', 'prop', 16, set(), None),
        ('weaving_worker', 'actor', 24, {'red', 'rose', 'lavender'}, None),
        ('canvas_floor_loom', 'tap', 16, set(), None),
        ('canvas_carrying_worker', 'actor', 24, {'sky', 'lavender'}, None),
        ('canvas_bolts_shuttles', 'prop', 16, set(), None),
        ('manager_bench_bell', 'seat', 16, set(), None)]),
    'b03_04_w2_floor04_paper_workshop': (4, 'paper_workshop', {'lavender', 'sky', 'sage', 'rose', 'red'}, [
        ('paper_drying_line', 'prop', 16, set(), None),
        ('papermaking_worker', 'actor', 24, {'sky', 'teal', 'sage', 'leaf'}, None),
        ('paper_pulp_vat', 'tap', 16, set(), None),
        ('kite_worker', 'actor', 24, {'lavender', 'red', 'rose', 'sky'}, None),
        ('paper_notebooks_kites_table', 'prop', 16, set(), None),
        ('manager_stool_bell', 'seat', 16, set(), None)]),
    'b03_05_w2_floor06_atelier': (6, 'atelier', {'lavender', 'sage', 'leaf'}, [
        ('jacket_dress_form', 'prop', 16, set(), None),
        ('sewing_worker_machine', 'actor', 32, {'lavender'}, [BROWN_SKIN]),
        ('linen_cutting_table', 'tap', 16, set(), None),
        ('shirt_worker', 'actor', 24, {'sage', 'leaf', 'lavender'}, [SAGE_DRESS]),
        ('clothing_rail_sachets', 'prop', 16, set(), None),
        ('manager_stool_pincushion_bell', 'seat', 16, set(), None)]),
    'b03_06_w2_floor07_brickyard': (7, 'brickyard', set(), [
        ('hempcrete_block_pallet', 'prop', 16, set(), None),
        ('mixing_worker', 'actor', 24, {'red'}, [BROWN_SKIN_SOFT]),
        ('mixing_trough_mould_block', 'tap', 16, set(), None),
        ('bricklaying_worker', 'actor', 24, {'sky', 'red'}, None),
        ('block_wall_tools', 'prop', 16, set(), None),
        ('manager_stool_plan_bell', 'seat', 16, set(), None)]),
    'b03_07_w2_floor08_emporium': (8, 'emporium', {'lavender', 'leaf', 'sage', 'sky'}, [
        ('display_cabinet', 'prop', 16, set(), None),
        ('parcel_wrapping_worker', 'actor', 32, {'lavender'}, None),
        ('grand_display_stand', 'tap', 16, set(), None),
        ('gift_box_porter', 'actor', 32, {'red', 'lavender'}, None),
        ('linen_gift_shelf', 'prop', 16, set(), None),
        ('manager_velvet_stool_bell', 'seat', 16, set(), None)]),
}


# accents a room's props must not lose to the colour budget: the least used colour is folded away first, and the
# small lavender and green touches went into stone and wood without this
KEEP = {'b03_01_w2_floor01_rooftop_beds': {'leaf'}, 'b03_02_w2_floor02_herb_kiosk': {'leaf'},
        'b03_03_w2_floor03_weaving_mill': {'sky', 'lavender'}, 'b03_04_w2_floor04_paper_workshop': {'lavender', 'sky'},
        'b03_05_w2_floor06_atelier': {'lavender', 'sage', 'leaf'}, 'b03_06_w2_floor07_brickyard': set(),
        'b03_07_w2_floor08_emporium': {'lavender', 'leaf'}}


def layout(widths, gmin=2):
    """Left edges of the six items on the floor: item 1 at the left of the zone, item 6 ending at the right,
    the tap target (item 3) as near the middle as fits, items 2, 4 and 5 spread evenly between."""
    a, b = ZONE
    w = widths
    x3 = round((a + b) / 2 - w[2] / 2)
    lo = a + w[0] + w[1] + 2 * gmin
    hi = b - w[5] - w[4] - w[3] - 3 * gmin - w[2]
    x3 = min(max(x3, lo), hi) if lo <= hi else round(a + w[0] + w[1] + (b - a - sum(w)) * 2 / 5)
    x6 = b - w[5]
    g1 = (x3 - (a + w[0]) - w[1]) / 2
    g2 = (x6 - (x3 + w[2]) - w[3] - w[4]) / 3
    x2 = round(a + w[0] + g1)
    x4 = round(x3 + w[2] + g2)
    x5 = round(x4 + w[3] + g2)
    return [a, x2, x3, x4, x5, x6]


def rooms():
    for key, (floor, short, accents, items) in ROOMS.items():
        if not os.path.isdir(pkg(key)):
            continue
        folder = 'w2_floor%02d_%s' % (floor, short)
        sl = {s['name']: s for s in slices_of(key)}
        assert [i[0] for i in items] == [s['name'] for s in slices_of(key)], key
        pairs, idxs = [], []
        for name, cls, budget, extra, rules in items:
            raw = load(os.path.join(pkg(key), sl[name]['file']))
            h, w = raw.shape[:2]
            small = fit_pixels(raw, round(w * ROOM_SCALE), round(h * ROOM_SCALE))
            ramps = (PEOPLE | extra) if cls == 'actor' else (WOOD | accents | extra)
            rules = [r for r in ROOM_RULES if not (r is OLIVE and SAGE_DRESS in (rules or []))] + \
                [r for r in (rules or []) if r not in ROOM_RULES]
            idx = clean_one('actor' if cls == 'actor' else 'prop', '%s/%s' % (folder, name), small, ramps, budget,
                            rules=rules, keep=() if cls == 'actor' else KEEP[key], source_size=[w, h])
            idxs.append(idx)
            pairs.append((raw, idx))
        xs = layout([i.shape[1] for i in idxs])
        mf = manifest('props/%s/floor.json' % folder)
        mf.clear()
        mf.update(world=2, floor=floor, size=[360, 120], baseline_y=FLOOR_Y, tap_target=items[2][0],
                  manager_spot=items[5][0], source=key + '.png', parts={},
                  note='Loomington. Drawn on a finer pixel than the game grid, so every item was brought to five '
                       'sixths in the clean-up. The two workers are single standing frames until their Batch 4 '
                       'sheets. Workers are drawn after the props.')
        for (name, cls, *_), idx, x in zip(items, idxs, xs):
            h, w = idx.shape
            sub = 'actors' if cls == 'actor' else 'props'
            rel = '%s/%s/%s_%dx%d.png' % (sub, folder, name, w, h)
            save(idx, os.path.join(OUT, rel))
            mf['parts'][name] = dict(file=('../../' + rel) if cls == 'actor' else os.path.basename(rel),
                                     size=[w, h], origin_on_floor=[x, FLOOR_Y - h],
                                     cls='actor' if cls == 'actor' else 'prop')
        sheet(pairs, 6, 3, os.path.join(REVIEW, '%s_before_after.png' % key[:6]))


# ---------------------------------------------------------------- images 8 to 11: back walls
WALL = {'wood', 'cream', 'gold', 'stone', 'ash', 'steel', 'clay', 'red', 'lavender', 'sky', 'white'}
# the faded painted sprout on the kiosk wall is a yellow-green that snapped to gold
SPROUT_PAINT = (lambda L, C, h: 95 <= h < 140 and C > 0.05, {'sage-3', 'sage-4', 'leaf-3', 'leaf-4'})
# the atelier wallpaper stripes are two lilac greys 0.1 apart in lightness; both landed on stone-4
STRIPE_DARK = (lambda L, C, h: (h >= 310 or h < 5) and C < 0.07 and 0.55 < L < 0.64, {'stone-3'})
# image: [(panel, floor, short name, extra ramps, open air, colour rules)]
WALLS = {
    'b03_08_backwalls_rooftop_kiosk': [('rooftop_garden_backwall', 1, 'rooftop_garden', set(), True, None),
                                       ('herb_kiosk_backwall', 2, 'herb_kiosk', {'sage', 'leaf'}, False,
                                        [SPROUT_PAINT])],
    'b03_09_backwalls_mill_paper': [('weaving_mill_backwall', 3, 'weaving_mill', set(), False, None),
                                    ('paper_workshop_backwall', 4, 'paper_workshop', set(), False, None)],
    'b03_10_backwalls_bistro_atelier': [('bistro_kitchen_backwall', 5, 'bistro', set(), False, None),
                                        ('tailor_atelier_backwall', 6, 'atelier', set(), False, [STRIPE_DARK])],
    'b03_11_backwalls_brickyard_emporium': [('brickyard_backwall', 7, 'brickyard', set(), True, None),
                                            ('grand_emporium_backwall', 8, 'emporium', {'rose'}, False, None)],
}
NIGHT = (52, 58, 110)     # a stand-in night sky for the review sheets only


def cut_sky(raw):
    """Clear the one flat sky colour wherever it touches the top row (flood fill, four neighbours)."""
    out = raw.copy()
    col = raw[0, raw.shape[1] // 2].copy()
    same = (raw == col).all(-1)
    seen = np.zeros(same.shape, bool)
    stack = [(0, x) for x in range(raw.shape[1]) if same[0, x]]
    while stack:
        y, x = stack.pop()
        if seen[y, x] or not same[y, x]:
            continue
        seen[y, x] = True
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < same.shape[0] and 0 <= xx < same.shape[1] and not seen[yy, xx]:
                stack.append((yy, xx))
    out[seen] = 0
    return out, int(seen.sum())


def walls():
    rows = []
    for key, panels in WALLS.items():
        if not os.path.isdir(pkg(key)):
            continue
        sl = {s['name']: s for s in slices_of(key)}
        for name, floor, short, extra, open_sky, rules in panels:
            raw = np.array(Image.open(os.path.join(pkg(key), sl[name]['file'])).convert('RGBA'))
            cut = 0
            if open_sky:
                raw, cut = cut_sky(raw)
            fitted = fit_pixels(raw, 336, 104)
            fname = 'w2_floor%02d_%s_336x104.png' % (floor, short)
            idx = clean_one('wall', 'w2_floor%02d_%s' % (floor, short), fitted, WALL | extra, 32, edge=False,
                            rules=[YELLOW] + (rules or []), source_size=list(raw.shape[1::-1]), sky_pixels_cut=cut)
            save(idx, os.path.join(OUT, 'walls', fname))
            shown = veil(to_rgba(idx))
            os.makedirs(os.path.join(OUT, 'walls', 'veiled'), exist_ok=True)
            Image.fromarray(shown, 'RGBA').save(os.path.join(OUT, 'walls', 'veiled', fname))
            mw = manifest('walls/walls.json')
            mw.setdefault('walls', {})[fname] = dict(world=2, floor=floor, size=[336, 104], open_sky=open_sky)
            mw['veil'] = dict(colour=VEIL[0], alpha=VEIL[1], note='veiled/ holds each wall as the game shows it')
            rows.append((fitted, to_rgba(idx), shown))
    if not rows:
        return

    def on_bg(x):
        o = np.zeros(x.shape[:2] + (3,), np.uint8)
        o[:] = NIGHT
        m = x[..., 3] == 255
        o[m] = x[m][:, :3]
        return np.repeat(np.repeat(o, 2, 0), 2, 1)
    lines = []
    for r in rows:
        gap = np.full((208, 8, 3), 255, np.uint8)
        lines.append(np.concatenate([on_bg(r[0]), gap, on_bg(r[1]), gap, on_bg(r[2])], 1))
        lines.append(np.full((8, lines[-1].shape[1], 3), 255, np.uint8))
    os.makedirs(REVIEW, exist_ok=True)
    Image.fromarray(np.concatenate(lines[:-1], 0)).save(os.path.join(REVIEW, 'b03_08-11_walls_raw_plain_veiled.png'))


# ---------------------------------------------------------------- image 12: far skyline and river
CITY = {'sky', 'stone', 'lavender', 'gold', 'cream', 'leaf', 'sage', 'wood', 'clay'}
# periwinkle walls (hue 277 to 290) sat nearer the bright sky-3 than lavender and made the far city loud
PERI = (lambda L, C, h: 270 <= h < 292 and L >= 0.45, {'lavender', 'stone'})
# the river's lighter ripple lines all landed on sky-2 with the water, so the river went flat
WATER_HI = (lambda L, C, h: 255 <= h < 270 and C > 0.16 and L >= 0.47, {'sky-3'})
# layer: (file name, depth layer of bible section 14, suggested scroll, outline, ramps, colour rules)
LAYERS = {
    'far_skyline': ('far_skyline', 'far', 0.15, 'none', CITY, [PERI, YELLOW]),
    'river_and_stone_bridge': ('river_bridge', 'river', 0.3, 'none', CITY, [PERI, WATER_HI, YELLOW]),
}


def fill_ends(raw):
    """Fill the empty columns at the two ends of a strip with its own end column, row by row, where the
    neighbouring pixel is opaque: the water then runs on when the strip repeats."""
    out = raw.copy()
    op = out[..., 3] == 255
    cols = np.nonzero(op.any(0))[0]
    a, b = cols.min(), cols.max()
    for x in range(a - 1, -1, -1):
        out[:, x] = out[:, x + 1]
    for x in range(b + 1, out.shape[1]):
        out[:, x] = out[:, x - 1]
    return out


def background():
    key = 'b03_12_w2_bg_far_river'
    if not os.path.isdir(pkg(key)):
        return
    pairs = []
    mf = manifest('backgrounds/w2/layers.json')
    mf.update(world=2, note='Loomington background, back layers. One pixel per art pixel; each strip repeats left '
                            'to right. The sky is drawn by the game behind them.', layers=mf.get('layers', {}))
    for s in slices_of(key):
        short, depth, scroll, line, ramps, rules = LAYERS[s['name']]
        raw = load(os.path.join(pkg(key), s['file']))
        if short == 'river_bridge':
            raw = fill_ends(raw)
        h, w = raw.shape[:2]
        # no ink: the back layers of the background have no dark outline (bible section 14)
        idx = clean_one('bg', 'w2 %s' % short, raw, ramps, 32, edge=False, ink=False, rules=rules)
        fname = '%s_%dx%d.png' % (short, w, h)
        save(idx, os.path.join(OUT, 'backgrounds', 'w2', fname))
        mf['layers'][short] = dict(file=fname, size=[w, h], depth=depth, scroll=scroll, outline=line, tiles=True)
        pairs.append((np.concatenate([raw, raw], 1), np.concatenate([idx, idx], 1)))
    sheet(pairs, 1, 2, os.path.join(REVIEW, 'b03_12_background_before_after.png'))


def smaller(img, w, h):
    """fit_pixels for small reductions (rooms, walls), shrink_pixels below two thirds (cards, icons)."""
    if w >= img.shape[1] * 0.7 and h >= img.shape[0] * 0.7:
        return fit_pixels(img, w, h)
    return shrink_pixels(img, w, h)


def into(idx, w, h, x0, y0):
    """Place an index image on an empty w x h canvas at (x0, y0)."""
    out = np.full((h, w), -1, np.int32)
    out[y0:y0 + idx.shape[0], x0:x0 + idx.shape[1]] = idx
    return out


# ---------------------------------------------------------------- image 13: town and riverside street
STREET = CITY | {'ash', 'steel', 'red', 'rose'}
STONE1 = P_NAMES.index('stone-1')


def town_street():
    key = 'b03_13_w2_bg_town_street'
    if not os.path.isdir(pkg(key)):
        return
    pairs = []
    mf = manifest('backgrounds/w2/layers.json')
    mf.setdefault('layers', {})
    for s in slices_of(key):
        raw = unify(load(os.path.join(pkg(key), s['file'])))
        h, w = raw.shape[:2]
        if s['name'] == 'riverside_street':
            raw = fill_ends(raw)
            idx = clean_one('bg', 'w2 street', raw, STREET, 32, rules=[PERI, YELLOW, OLIVE])
            fname = 'street_%dx%d.png' % (w, h)
            save(idx, os.path.join(OUT, 'backgrounds', 'w2', fname))
            mf['layers']['street'] = dict(file=fname, size=[w, h], depth='street', scroll=1.0, outline='ink-1',
                                          tiles=True)
            pairs.append((raw, idx))
            continue
        # the town: its thin dark lines become stone-1, the Town outline of bible section 14
        idxs, st = snap_many([raw], CITY | INKSET, rules=[PERI, YELLOW, OLIVE])
        idx = idxs[0]
        idx[idx == INK] = STONE1
        idx = apply_plan([idx], merge_plan([idx], 32))[0]
        note('bg', 'w2 town', [idx], st, 0, 32)
        pairs.append((raw, idx))
        # two clusters, left and right of the tower, saved apart so the game can set them at the screen edges
        for side, (a, b) in (('left', (0, 120)), ('right', (240, w))):
            part = idx[:, a:b]
            cols = np.nonzero((part >= 0).any(0))[0]
            x0, x1 = a + cols.min(), a + cols.max() + 1
            piece = idx[:, x0:x1]
            fname = 'town_%s_%dx%d.png' % (side, x1 - x0, h)
            save(piece, os.path.join(OUT, 'backgrounds', 'w2', fname))
            mf['layers']['town_' + side] = dict(file=fname, size=[int(x1 - x0), h], depth='town', scroll=0.5,
                                                outline='stone-1', tiles=False, x_in_strip=int(x0),
                                                note='Stands beside the tower, at the %s edge of the screen' % side)
        assert not (idx[:, 120:240] >= 0).any(), 'town middle third must be empty'
    sheet(pairs, 1, 2, os.path.join(REVIEW, 'b03_13_town_street_before_after.png'))


# ---------------------------------------------------------------- image 14: Mayor Thyme
MAYOR_FRAME, MAYOR_FEET = (96, 104), 100
# his face and hands came back a light tan (hue 40 to 68) where the brief asked for warm brown; they snap to skin
# and then move one step darker
MAYOR_SKIN = (lambda L, C, h: 35 <= h < 68 and 0.06 < C < 0.17 and 0.45 < L < 0.9, {'skin'})
# his sky-blue frock coat is a soft periwinkle that fell on grey steel, and the red ribbon fell on orange clay-3
COAT = (lambda L, C, h: 255 <= h < 285 and C > 0.06 and L > 0.36, {'sky-2', 'sky-3', 'sky-4'})
RIBBON = (lambda L, C, h: (h < 32 or h >= 350) and C > 0.15, {'red'})


def mayor():
    key = 'b03_14_mayor_thyme'
    if not os.path.isdir(pkg(key)):
        return
    sl = slices_of(key)
    raws, names = [], []
    for s in sl:
        a = load(os.path.join(pkg(key), s['file']))
        top = s['anchor']['y'] - MAYOR_FEET
        assert not (a[:top, :, 3] > 0).any() and not (a[top + MAYOR_FRAME[1]:, :, 3] > 0).any(), s['name']
        raws.append(unify(a[top:top + MAYOR_FRAME[1]]))
        names.append(s['name'].replace('mayor_thyme_', ''))
    ramps = PEOPLE | {'sky', 'leaf', 'sage', 'red', 'rose'} | INKSET
    idxs, st = snap_many(raws, ramps, rules=[MAYOR_SKIN, COAT, RIBBON, YELLOW, OLIVE])
    darker = {P_NAMES.index('skin-%d' % k): P_NAMES.index('skin-%d' % (k - 1)) for k in range(2, 7)}
    fixed = 0
    for i in range(len(idxs)):
        o = idxs[i].copy()
        for a, b in darker.items():
            o[idxs[i] == a] = b
        idxs[i], n = outline(o)
        fixed += n
    idxs = apply_plan(idxs, merge_plan(idxs, 32, {'skin'}))
    mf = manifest('story/mayor_thyme/mayor_thyme.json')
    mf.clear()
    mf.update(who='Mayor Thyme', role='story character: hosts the Grand Harvest Festival and pins on the Prize Ribbons',
              frame=list(MAYOR_FRAME), baseline_y=MAYOR_FEET, source=key + '.png', frames=[],
              note='Built like a manager, but his top hat needs a taller frame: 96x104 with the feet on y 100. '
                   'Body about 76 tall, 94 to 98 with the hat. Skin moved one step darker in the clean-up, as the '
                   'brief asked for warm brown skin. The face is replaced later by one hand-drawn head.')
    for name, idx in zip(names, idxs):
        fname = '%s_%dx%d.png' % (name, *MAYOR_FRAME)
        save(idx, os.path.join(OUT, 'story', 'mayor_thyme', fname))
        mf['frames'].append(dict(name=name[3:], file=fname))
    note('story', 'mayor_thyme (4 frames)', idxs, st, fixed, 32)
    sheet(list(zip(raws, idxs)), 4, 3, os.path.join(REVIEW, 'b03_14_mayor_thyme_before_after.png'))


# ---------------------------------------------------------------- images 15 and 16: card pictures
# sheet: [(sprite, file stem, design id, rarity, ramps)]
CARD_SHEETS = {
    'b03_15_w2_plant_cards': [
        ('rosemary_topiary', 'rosemary_topiary', 'plant.rosemary.topiary', 'epic',
         {'leaf', 'sage', 'white', 'cream', 'gold', 'wood', 'stone', 'ash'}),
        ('royal_lavender', 'lavender_royal', 'plant.lavender.royal', 'rare',
         {'lavender', 'leaf', 'sage', 'gold', 'wood'}),
        ('silver_sage', 'sage_silver', 'plant.sage.silver', 'rare',
         {'sage', 'leaf', 'white', 'stone', 'ash', 'steel', 'cream'}),
        ('creeping_thyme', 'thyme_creeping', 'plant.thyme.creeping', 'rare',
         {'leaf', 'sage', 'rose', 'clay', 'red', 'wood', 'cream'})],
    'b03_16_w2_hybrid_cards': [
        ('honeymint', 'mint_honey', 'plant.mint.honey', 'legendary', {'leaf', 'sage', 'gold', 'cream', 'wood', 'white'}),
        ('pepperleaf_basil', 'basil_pepperleaf', 'plant.basil.pepperleaf', 'legendary',
         {'leaf', 'sage', 'lavender', 'rose', 'stone', 'ash', 'clay', 'wood', 'steel'}),
        ('sunset_sage', 'sage_sunset', 'plant.sage.sunset', 'legendary',
         {'sage', 'leaf', 'clay', 'rose', 'red', 'gold', 'wood', 'cream'})],
}
CARD, CARD_BOX, CARD_FOOT = (108, 100), (96, 94), 97   # the World 1 cards stand 94 tall with their base on row 96


def cards():
    for key, items in CARD_SHEETS.items():
        if not os.path.isdir(pkg(key)):
            continue
        sl = {s['name']: s for s in slices_of(key)}
        mf = manifest('cards/plants/cards.json')
        pairs = []
        for name, stem, pid, rarity, ramps in items:
            raw = load(os.path.join(pkg(key), sl[name]['file']))
            h, w = raw.shape[:2]
            s = min(CARD_BOX[0] / w, CARD_BOX[1] / h)
            small = smaller(raw, round(w * s), round(h * s))
            idx = clean_one('card', stem, small, ramps, 32, thin=True, rules=[YELLOW, OLIVE], source_size=[w, h])
            idx = into(idx, CARD[0], CARD[1], (CARD[0] - idx.shape[1]) // 2, CARD_FOOT - idx.shape[0])
            fname = '%s_%dx%d.png' % (stem, *CARD)
            save(idx, os.path.join(OUT, 'cards', 'plants', fname))
            mf.setdefault('cards', {})[stem] = dict(file=fname, plant=pid, rarity=rarity)
            pairs.append((raw, idx))
        sheet(pairs, len(pairs), 2, os.path.join(REVIEW, '%s_cards_before_after.png' % key[:6]))


# ---------------------------------------------------------------- image 17: heirloom icons
HEIRLOOMS = [  # (sprite, design id, rarity, ramps)
    ('clover_locket', 'artifact.clover_locket', 'legendary', {'gold', 'leaf', 'sage', 'cream', 'wood'}),
    ('moonstone_birdbath', 'artifact.moonstone_birdbath', 'epic',
     {'stone', 'ash', 'white', 'sky', 'lavender', 'cream', 'steel'}),
    ('bramble_gloves', 'artifact.bramble_gloves', 'rare', {'wood', 'clay', 'leaf', 'lavender', 'stone', 'gold', 'cream'}),
    ('whetstone_of_plenty', 'artifact.whetstone_of_plenty', 'legendary',
     {'stone', 'ash', 'steel', 'wood', 'gold', 'lavender', 'leaf'}),
    ('heirloom_spindle', 'artifact.heirloom_spindle', 'rare', {'wood', 'cream', 'gold', 'white'}),
    ('canvas_guild_banner', 'artifact.canvas_guild_banner', 'epic', {'cream', 'white', 'wood', 'gold', 'leaf', 'sage'}),
    ('golden_rope_coil', 'artifact.golden_rope_coil', 'legendary', {'gold', 'wood', 'cream'}),
]
ICON, ICON_BOX = 48, 44   # the Batch 2 icons sit inside x and y 2 to 45


def heirlooms():
    key = 'b03_17_heirloom_icons'
    if not os.path.isdir(pkg(key)):
        return
    sl = {s['name']: s for s in slices_of(key)}
    mf = manifest('icons/heirlooms/heirlooms.json')
    mf.update(size=[ICON, ICON], note='Heirloom icons (design: artifacts), 48x48. The other heirlooms still use '
                                      'their B11 pictures until those are cleaned. Smaller sizes are drawn by hand.')
    mf.setdefault('icons', {})
    pairs = []
    for name, hid, rarity, ramps in HEIRLOOMS:
        raw = load(os.path.join(pkg(key), sl[name]['file']))
        h, w = raw.shape[:2]
        s = min(ICON_BOX / w, ICON_BOX / h)
        small = smaller(raw, round(w * s), round(h * s))
        idx = clean_one('icon', 'heirloom ' + name, small, ramps, 16, thin=True, rules=[YELLOW, OLIVE],
                        keep=ramps - {'wood', 'gold', 'cream'}, source_size=[w, h])
        idx = into(idx, ICON, ICON, (ICON - idx.shape[1]) // 2, (ICON - idx.shape[0]) // 2)
        fname = '%s_48x48.png' % name
        save(idx, os.path.join(OUT, 'icons', 'heirlooms', fname))
        mf['icons'][name] = dict(file=fname, id=hid, rarity=rarity)
        pairs.append((raw, idx))
    sheet(pairs, len(pairs), 3, os.path.join(REVIEW, 'b03_17_heirlooms_before_after.png'))


# ---------------------------------------------------------------- floor mock-ups for the review
def mockups():
    """Each new room put together: veiled wall, props, workers. A review picture, not a game screen."""
    tiles = []
    for key, (floor, short, _, items) in ROOMS.items():
        folder = 'w2_floor%02d_%s' % (floor, short)
        fj = os.path.join(OUT, 'props', folder, 'floor.json')
        wall = os.path.join(OUT, 'walls', 'veiled', 'w2_floor%02d_%s_336x104.png' % (floor, short))
        if not os.path.exists(fj):
            continue
        f = json.load(open(fj))
        sc = Image.new('RGBA', (360, 120), NIGHT + (255,))
        if os.path.exists(wall):
            sc.alpha_composite(Image.open(wall).convert('RGBA'), (12, 8))
        parts = sorted(f['parts'].items(), key=lambda kv: kv[1]['cls'] == 'actor')
        for name, p in parts:
            im = Image.open(os.path.join(OUT, 'props', folder, p['file'])).convert('RGBA')
            sc.alpha_composite(im, tuple(p['origin_on_floor']))
        sc.paste(Image.new('RGBA', (360, 8), (0x8C, 0x44, 0x26, 255)), (0, 112))
        sc.paste(Image.new('RGBA', (360, 1), (0x1A, 0x10, 0x24, 255)), (0, 112))
        tiles.append(sc)
    if not tiles:
        return
    out = Image.new('RGBA', (360, 124 * len(tiles) - 4), (255, 255, 255, 255))
    for i, t in enumerate(tiles):
        out.alpha_composite(t, (0, 124 * i))
    os.makedirs(REVIEW, exist_ok=True)
    out.resize((out.width * 3, out.height * 3), Image.NEAREST).save(os.path.join(REVIEW, 'batch03_rooms_mockup.png'))


rooms()
walls()
background()
town_street()
mayor()
cards()
heirlooms()
for rel, data in MANIFESTS.items():
    os.makedirs(os.path.dirname(os.path.join(OUT, rel)), exist_ok=True)
    json.dump(data, open(os.path.join(OUT, rel), 'w'), indent=1)
mockups()
os.makedirs(REVIEW, exist_ok=True)
json.dump(REPORT, open(os.path.join(REVIEW, 'report_b03.json'), 'w'), indent=1)
for r in REPORT:
    print('%-5s %-46s %3dx%-3d colours %2d -> %2d (budget %d %s) outline %3d  move mean %.3f max %.3f' % (
        r['cls'], r['name'][:46], r['size'][0], r['size'][1], r['source_colours'], r['colours'], r['budget'],
        'ok' if r['within_budget'] else 'OVER', r['outline_pixels_fixed'], r['mean_move'], r['max_move']))
