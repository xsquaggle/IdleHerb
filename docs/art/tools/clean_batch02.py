"""Automatic clean-up pass for Asset Batch 2: prompts 2 to 6 (currency icons, herb cards, herb growth stages)
and 7 to 17 (soap workshop, walls 9 and 10, Pip, two-worker sheets). A prompt runs when its package is in UPLOAD_DIR.

Every package arrived with its parts already cut at true size: props at their place on the 360x120 floor,
walls at 336x104, Pip at 48x48 and every worker pose at 80x80. The pass is the one from Batch 1:
snap the colours to the master palette (limited to the ramps that sprite may use), rebuild the ink outline,
hold the colour budget, write the sprite.

Usage: python3 -I clean_batch02.py UPLOAD_DIR OUT_DIR

UPLOAD_DIR holds one folder per prompt, named <sheet>_pkg, with that prompt's unpacked zip.
OUT_DIR receives the sprite folders (same layout as the repo's art/) and review/batch02/.

Worker sheets: the slices files came in several shapes, so the frames are found by their file names and
the character and pose fields. Each sheet holds two people. Every person gets its own folder, its own
colour map and its own budget, and its feet are moved to the Batch 1 baseline (y 76 in the 80x80 frame).
"""
import sys
import os
import json
import glob
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402
from cleanlib import (load, snap_many, reduce_many, merge_plan, apply_plan, outline, save, used,  # noqa: E402
                      sheet, to_rgba, veil, VEIL, INK, P_RGB, P_NAMES)

SRC, OUT = sys.argv[1], sys.argv[2]
ART = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'art')   # the repo's art/ folder
REVIEW = os.path.join(OUT, 'review', 'batch02')
REPORT = []
MANIFESTS = {}
INKSET = {'ink'}
BASELINE = 76   # feet stand on row 75 of the 80x80 frame, as in Batch 1


def pkg(sheet_name):
    return os.path.join(SRC, sheet_name + '_pkg')


def slices_of(sheet_name):
    d = json.load(open(os.path.join(pkg(sheet_name), 'slices.json')))
    return d['slices']


def manifest(rel):
    if rel not in MANIFESTS:
        path = os.path.join(OUT, rel)
        MANIFESTS[rel] = json.load(open(path)) if os.path.exists(path) else {}
    return MANIFESTS[rel]


def note(cls, name, idxs, st, fixed, budget):
    cols = used(idxs)
    h, w = idxs[0].shape
    REPORT.append(dict(cls=cls, name=name, size=[w, h], files=len(idxs), source_colours=st['src'],
                       colours=len(cols), budget=budget, within_budget=len(cols) <= budget,
                       outline_pixels_fixed=fixed, mean_move=round(st['mean'], 3),
                       max_move=round(st['max'], 3), palette=cols))


def clean(cls, name, raws, rels, ramps, budget, edge=True, thin=False, over=None, rules=None, keep=()):
    idxs, st = snap_many(raws, set(ramps) | INKSET, over, rules=rules)
    fixed = 0
    if edge:
        for i in range(len(idxs)):
            idxs[i], n = outline(idxs[i], keep_thin=thin)
            fixed += n
    idxs = apply_plan(idxs, merge_plan(idxs, budget, keep))
    for idx, rel in zip(idxs, rels):
        save(idx, os.path.join(OUT, rel))
    note(cls, name, idxs, st, fixed, budget)
    return list(zip(raws, idxs))


# ---------------------------------------------------------------- prompt 1: visitors, two frames each, 32x32
# The storm badge came back as a lilac cap on a yellow stalk, which at game size reads as a mushroom.
# It is redrawn here as a flat cloud over a zigzag bolt (letters in STORM_COL).
STORM = ["...LL...",
         ".LLhhLL.",
         "LLhLLLLL",
         ".dddddd.",
         "....YG..",
         "...YG...",
         "..YYYG..",
         "...YG..."]
STORM_COL = {'d': 'lavender-3', 'L': 'lavender-4', 'h': 'lavender-5', 'Y': 'gold-3', 'G': 'gold-1', '.': 'cream-4'}


def visitors():
    key = 'b02_01_visitors'
    root = pkg(key)
    sl = json.load(open(os.path.join(root, 'slices.json')))
    spr = {s['name']: s for s in sl['sprites'] if s.get('kind') == 'sprite'}
    groups = {
        'sprouts': (['golden_sprout', 'sunbeam_sprout', 'tap_storm_sprout'],
                    {'gold', 'cream', 'wood-1', 'wood-2', 'wood-3', 'clay-1', 'clay-2', 'clay-4', 'lavender'}),
        'dewdrop': (['dewdrop'], {'sky', 'leaf', 'white', 'cream', 'gold', 'steel'}),
        'mystery_crate': (['mystery_crate'], {'wood', 'gold', 'cream', 'white', 'lavender', 'rose'}),
        'busy_bee': (['busy_bee'], {'gold', 'wood', 'sky-5', 'white', 'steel', 'cream'}),
    }
    def fpath(s):
        f = s['file']
        return os.path.join(root, f.split('/', 1)[1] if f.startswith(key + '/') else f)
    mf = manifest('visitors/visitors.json')
    mf.update(frame=[32, 32], note='Two-frame loops. The three Golden Sprouts share one body; only the badge differs. '
                                   'The storm badge was redrawn by hand in the clean-up (cloud over a bolt).',
              visitors={})
    pairs = []
    for g, (names, ramps) in groups.items():
        keys = ['%s_%02d' % (n, i) for n in names for i in (1, 2)]
        raws = [load(fpath(spr[k])) for k in keys]
        rels = ['visitors/%s_32x32.png' % k for k in keys]
        idxs, st = snap_many(raws, ramps | INKSET)
        fixed = 0
        for i in range(len(idxs)):
            idxs[i], n = outline(idxs[i], keep_thin=True)
            fixed += n
        idxs = apply_plan(idxs, merge_plan(idxs, 16, {'lavender'} if g == 'sprouts' else ()))
        if g == 'sprouts':
            for i in (1, 2):
                gold = idxs[keys.index('golden_sprout_%02d' % i)]
                storm = idxs[keys.index('tap_storm_sprout_%02d' % i)]
                ys, xs = np.nonzero(gold != storm)
                x0, y0 = xs.min() + 2, ys.min() + 3
                for dy, row in enumerate(STORM):
                    for dx, ch in enumerate(row):
                        storm[y0 + dy, x0 + dx] = P_NAMES.index(STORM_COL[ch])
        for idx, rel in zip(idxs, rels):
            save(idx, os.path.join(OUT, rel))
        note('visitor', '%s (%d frames)' % (g, len(keys)), idxs, st, fixed, 16)
        for n in names:
            mf['visitors'][n] = dict(frames=['%s_%02d_32x32.png' % (n, i) for i in (1, 2)],
                                     pivot=spr['%s_01' % n].get('pivot', [16, 24]))
        pairs += list(zip(raws, idxs))
    sheet(pairs, 4, 6, os.path.join(REVIEW, 'p01_visitors_before_after.png'))


# ---------------------------------------------------------------- prompt 2: currency icons
def currency_icons():
    key = 'b02_02_currency_icons'
    table = {
        'insight': {'gold', 'leaf', 'wood', 'cream'},
        'pollen': {'gold', 'cream', 'wood'},
        'skill_points': {'lavender', 'leaf', 'gold'},
        'shells': {'rose', 'blush', 'cream', 'gold', 'clay-5'},
        'snowmarks': {'sky', 'white', 'clay', 'gold', 'red-1'},
        'fair_tickets': {'cream', 'red', 'clay', 'leaf', 'gold'},
    }
    pairs = []
    for s in slices_of(key):
        name = os.path.splitext(s['file'])[0]
        raw = load(os.path.join(pkg(key), s['file']))
        assert raw.shape[:2] == (48, 48), name
        pairs += clean('icon', 'currency_' + name, [raw], ['icons/currency/%s_48x48.png' % name], table[name], 16,
                       thin=True)
    manifest('icons/currency/currency.json').update(
        size=[48, 48], icons=sorted('%s_48x48.png' % os.path.splitext(s['file'])[0] for s in slices_of(key)),
        note='Coins, Notes, Gems, Compost and Ribbons come from B12 and are still to be cleaned. '
             'The 32, 24 and 16 pixel sizes are drawn by hand.')
    sheet(pairs, 6, 6, os.path.join(REVIEW, 'p02_currency_icons_before_after.png'))


# ---------------------------------------------------------------- prompts 3 to 5: herb card pictures, 108x100
# purple leaves and glaze must stay purple: without this they slid to the blue-grey stone ramp
# (the palette has no dusty mauve: a plum and stone mix striped the leaves, so they go to clean violet)
PURPLE = (lambda L, C, h: 270 <= h < 350 and C > 0.03, {'lavender', 'rose-1'})
# a deep cool leaf green must stay on leaf: next to a teal planter it slid to teal
COOL_LEAF = (lambda L, C, h: 100 <= h < 170 and C > 0.03, {'leaf'})
CARDS = {
    'b02_03_herb_cards_common': {
        'kitchen_rosemary': ('rosemary_kitchen', 'common', {'sage', 'leaf', 'wood', 'cream', 'sky'}),
        'garden_sage': ('sage_garden', 'common', {'sage', 'leaf', 'clay', 'wood'}),
        'meadow_chamomile': ('chamomile_meadow', 'common', {'leaf', 'gold', 'wood', 'cream', 'white'}),
        'garden_thyme': ('thyme_garden', 'common', {'leaf', 'wood', 'clay', 'rose', 'lavender-4', 'lavender-5'}),
    },
    'b02_04_herb_cards_uncommon': {
        'peppermint': ('mint_pepper', 'uncommon', {'leaf', 'teal', 'lavender', 'rose-1', 'cream', 'white'}, [COOL_LEAF]),
        'lemon_basil': ('basil_lemon', 'uncommon', {'leaf', 'gold', 'cream'}),
        'trailing_rosemary': ('rosemary_trailing', 'uncommon', {'sage', 'leaf', 'clay', 'wood', 'sky'}),
        'butterfly_lavender': ('lavender_butterfly', 'uncommon', {'sage', 'leaf', 'lavender', 'rose', 'white', 'cream'}),
    },
    'b02_05_herb_cards_rare': {
        'pineapple_sage': ('sage_pineapple', 'uncommon', {'leaf', 'red', 'gold', 'wood', 'clay'}),
        'double_chamomile': ('chamomile_double', 'uncommon', {'leaf', 'cream', 'white', 'sky', 'gold'}),
        'lemon_thyme': ('thyme_lemon', 'uncommon', {'leaf', 'gold', 'cream'}),
        'chocolate_mint': ('mint_chocolate', 'rare', {'leaf', 'wood', 'cream', 'rose-1', 'clay-1'}),
        'purple_basil': ('basil_purple', 'rare', {'lavender', 'rose', 'gold', 'leaf-2'}, [PURPLE]),
    },
}


def herb_cards():
    mf = manifest('cards/plants/cards.json')
    mf.setdefault('size', [108, 100])
    mf.setdefault('note', 'Card pictures. The game draws the rarity backdrop, frame, name and level around them.')
    cards = mf.setdefault('cards', {})
    for key, table in CARDS.items():
        if not os.path.isdir(pkg(key)):
            continue
        pairs = []
        for part in sorted(glob.glob(os.path.join(pkg(key), 'parts', '*', '*.png'))):
            name = os.path.splitext(os.path.basename(part))[0]
            fname, rarity, ramps = table[name][:3]
            rules = table[name][3] if len(table[name]) > 3 else None
            raw = load(part)
            assert raw.shape[:2] == (100, 108), name
            rel = 'cards/plants/%s_108x100.png' % fname
            pairs += clean('card', fname, [raw], [rel], ramps, 32, thin=True, rules=rules)
            cards[fname] = dict(file=os.path.basename(rel), plant='plant.' + fname.replace('_', '.', 1), rarity=rarity)
        sheet(pairs, 5, 4, os.path.join(REVIEW, '%s_before_after.png' % key[:6]))


# ---------------------------------------------------------------- prompt 6: growth stages of thyme, sage and chamomile
def paste(canvas, idx, x, y):
    h, w = idx.shape
    m = idx >= 0
    canvas[y:y + h, x:x + w][m] = idx[m]


def rgba_to_idx(path):
    """A cleaned sprite back to palette indices (-1 for transparent)."""
    a = np.array(Image.open(path).convert('RGBA'))
    idx = np.full(a.shape[:2], -1, np.int32)
    m = a[..., 3] == 255
    lut = {tuple(c): i for i, c in enumerate(P_RGB.tolist())}
    idx[m] = [lut[tuple(c)] for c in a[m][:, :3].tolist()]
    return idx


def growth_stages():
    """The planter and the seeds are the cleaned Batch 1 layers, so every herb stands in the same planter.
    Only the foliage is new. The outline is fixed on the composed frame and written back to the foliage."""
    key = 'b02_06_herb_growth_stages'
    sl = json.load(open(os.path.join(pkg(key), 'slices.json')))['sheets'][key + '.png']
    px, py = sl['planter']['offset_in_frame']
    plants = json.load(open(os.path.join(ART, 'plants', 'plants.json')))
    b1 = plants['herbs']
    assert b1['planter']['offset_in_frame'] == [px, py] and b1['frame'] == sl['native_cell_size']
    planter = rgba_to_idx(os.path.join(ART, 'plants', b1['planter']['file']))
    seeds_rel = b1['stages']['basil_seed']['layer']
    seeds = rgba_to_idx(os.path.join(ART, 'plants', seeds_rel))
    sx, sy = b1['stages']['basil_seed']['offset_in_frame']
    sheet_rgba = load(os.path.join(pkg(key), sl['foliage_sheet']))
    fw, fh = sl['native_cell_size']
    HERB = {'thyme': {'leaf', 'wood', 'rose-2', 'rose-3', 'lavender-4', 'lavender-5'},
            'sage': {'sage', 'lavender'},
            'chamomile': {'leaf', 'white', 'cream', 'gold'}}
    order = sl['growth_order']
    mh = manifest('plants/plants.json')
    pairs = []
    for row, (herb, ramps) in enumerate(HERB.items()):
        keys = ['%s_%s' % (herb, g) for g in order]
        raws, offs = [], []
        for col, k in enumerate(keys[1:], 1):
            cell = sheet_rgba[row * fh:(row + 1) * fh, col * fw:(col + 1) * fw]
            ys, xs = np.nonzero(cell[..., 3] == 255)
            x0, y0 = xs.min(), ys.min()
            crop = cell[y0:ys.max() + 1, x0:xs.max() + 1]
            part = load(os.path.join(pkg(key), 'parts', '06_growth', k + '.png'))
            assert crop.shape == part.shape and (crop == part).all(), k
            raws.append(part)
            offs.append((int(x0), int(y0)))
        idxs, st = snap_many(raws, ramps | INKSET)
        idxs, _ = reduce_many(idxs, 9)
        fixed = 0
        for top, (ox, oy) in zip(idxs, offs):
            for _ in range(2):
                comp = np.full((fh, fw), -1, np.int32)
                own = np.zeros((fh, fw), np.int8)
                paste(comp, planter, px, py)
                h, w = top.shape
                m = top >= 0
                comp[oy:oy + h, ox:ox + w][m] = top[m]
                own[oy:oy + h, ox:ox + w][m] = 1
                fx, n = outline(comp, keep_thin=True)
                ch = (fx != comp) & (own == 1)      # only foliage pixels change; the Batch 1 planter stays as it is
                if not ch.any():
                    break
                fixed += int(ch.sum())
                ys, xs = np.nonzero(ch)
                top[ys - oy, xs - ox] = INK
        frames = []
        for i, k in enumerate(keys):
            stage = order[i]
            comp = np.full((fh, fw), -1, np.int32)
            paste(comp, planter, px, py)
            if i == 0:
                paste(comp, seeds, sx, sy)
                lname, off = seeds_rel, [sx, sy]
            else:
                top = idxs[i - 1]
                ox, oy = offs[i - 1]
                paste(comp, top, ox, oy)
                lname = 'herb_layers/%s_%d_%s_foliage_%dx%d.png' % (herb, i + 1, stage, top.shape[1], top.shape[0])
                save(top, os.path.join(OUT, 'plants', lname))
                off = [ox, oy]
            fname = '%s_%d_%s_72x90.png' % (herb, i + 1, stage)
            save(comp, os.path.join(OUT, 'plants', fname))
            mh.setdefault('herbs', {}).setdefault('stages', {})[k] = dict(frame=fname, layer=lname, offset_in_frame=off)
            frames.append(comp)
            src = np.zeros((fh, fw, 4), np.uint8)
            if i:
                src[offs[i - 1][1]:offs[i - 1][1] + raws[i - 1].shape[0],
                    offs[i - 1][0]:offs[i - 1][0] + raws[i - 1].shape[1]] = raws[i - 1]
            pairs.append((src, comp))
        note('plant', '%s (5 growth stages, Batch 1 planter + new foliage)' % herb, frames, st, fixed, 16)
    sheet(pairs, 5, 3, os.path.join(REVIEW, 'p06_herb_growth_before_after.png'))


# ---------------------------------------------------------------- prompt 7: Soap and Scent Workshop props
def soap_props():
    key = 'b02_07_floor09_soap_workshop_props'
    table = {
        'soap_kettle_and_stove': {'wood', 'clay', 'gold', 'stone-1', 'stone-2', 'ash-1', 'ash-2'},
        'soap_mould_table': {'wood', 'gold', 'cream', 'lavender'},
        'soap_drying_rack': {'wood', 'gold', 'cream', 'lavender', 'sage'},
        'lotion_shelf_and_soap_basket': {'wood', 'gold', 'cream'},
        'manager_stool_and_side_table': {'wood', 'gold', 'rose-1', 'rose-2', 'red-1'},
    }
    folder = 'props/floor09_soap_workshop'
    mf = manifest(folder + '/floor.json')
    mf.update(size=[360, 120], baseline_y=112, parts={},
              note='Replaces the copper still and glass flasks of v2 floor 09. The two workers, the perfume '
                   'stand and the lavender basket of v2 floor 09 stay.')
    pairs = []
    for s in slices_of(key):
        name = s['name']
        nb = s['native_box']
        rel = '%s/%s_%dx%d.png' % (folder, name, nb['width'], nb['height'])
        raw = load(os.path.join(pkg(key), s['file']))
        assert raw.shape[:2] == (nb['height'], nb['width']), name
        pairs += clean('prop', name, [raw], [rel], table[name], 16)
        mf['parts'][name] = dict(file=os.path.basename(rel), size=[nb['width'], nb['height']],
                                 origin_on_floor=[nb['x'], nb['y']], cls='prop')
    sheet(pairs, 5, 4, os.path.join(REVIEW, 'p07_soap_props_before_after.png'))


# ---------------------------------------------------------------- prompt 8: back walls of floors 9 and 10
def walls():
    key = 'b02_08_backwalls_soap_hq'
    table = {
        'soap_workshop_backwall': (9, 'soap_workshop', {'sage', 'cream', 'wood', 'gold', 'lavender', 'stone', 'ash'}),
        'tower_hq_backwall': (10, 'hq', {'leaf', 'sage', 'wood', 'gold', 'cream', 'stone', 'lavender'}),
    }
    rows = []
    for s in slices_of(key):
        floor, short, ramps = table[s['name']]
        fname = 'w1_floor%02d_%s_336x104.png' % (floor, short)
        raw = load(os.path.join(pkg(key), s['file']))
        assert raw.shape[:2] == (104, 336)
        raw_, idx = clean('wall', 'w1_floor%02d_%s' % (floor, short), [raw], ['walls/' + fname], ramps, 32,
                          edge=False)[0]
        shown = veil(to_rgba(idx))
        os.makedirs(os.path.join(OUT, 'walls', 'veiled'), exist_ok=True)
        Image.fromarray(shown, 'RGBA').save(os.path.join(OUT, 'walls', 'veiled', fname))
        mw = manifest('walls/walls.json')
        mw.setdefault('walls', {})[fname] = dict(world=1, floor=floor, size=[336, 104], open_sky=False)
        mw['veil'] = dict(colour=VEIL[0], alpha=VEIL[1], note='veiled/ holds each wall as the game shows it')
        rows.append((raw_, to_rgba(idx), shown))

    def on_bg(x):
        o = np.zeros(x.shape[:2] + (3,), np.uint8)
        o[:] = (247, 188, 102)
        m = x[..., 3] == 255
        o[m] = x[m][:, :3]
        return np.repeat(np.repeat(o, 2, 0), 2, 1)
    lines = []
    for r in rows:
        gap = np.full((208, 8, 3), 255, np.uint8)
        lines.append(np.concatenate([on_bg(r[0]), gap, on_bg(r[1]), gap, on_bg(r[2])], 1))
        lines.append(np.full((8, lines[-1].shape[1], 3), 255, np.uint8))
    os.makedirs(REVIEW, exist_ok=True)
    Image.fromarray(np.concatenate(lines[:-1], 0)).save(os.path.join(REVIEW, 'p08_walls_raw_plain_veiled.png'))


# ---------------------------------------------------------------- prompt 9: Pip
def pip():
    key = 'b02_09_pip_guide'
    ss = slices_of(key)
    frames = [os.path.join(pkg(key), s['file']) for s in ss]
    layer_files = sorted(set(l['file'] for s in ss for l in s.get('layers', [])))
    raws = [load(f) for f in frames] + [load(os.path.join(pkg(key), f)) for f in layer_files]
    # no gold and no leaf-6: they put a hard yellow cap on Pip's head and leaves
    ramps = {'clay', 'wood', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'leaf-5', 'skin', 'blush', 'cream', 'white', 'ink'}
    rels = ['story/pip/%02d_%s_48x48.png' % (i + 1, s['name']) for i, s in enumerate(ss)]
    rels += ['story/pip/layers/' + os.path.basename(f) for f in layer_files]
    idxs, st = snap_many(raws, ramps)
    fixed = 0
    for i in range(len(ss)):
        idxs[i], n = outline(idxs[i], keep_thin=True)
        fixed += n
    idxs = apply_plan(idxs, merge_plan(idxs, 24, {'blush'}))
    for idx, rel in zip(idxs, rels):
        save(idx, os.path.join(OUT, rel))
    note('story', 'pip (9 poses and layers)', idxs[:len(ss)], st, fixed, 24)
    mf = manifest('story/pip/pip.json')
    mf.update(frame=[48, 48], poses=[dict(name=s['name'], file=os.path.basename(r)) for s, r in zip(ss, rels)],
              layers={s['name']: [dict(file='layers/' + os.path.basename(l['file']),
                                       offset=[l['offset_in_frame']['x'], l['offset_in_frame']['y']])
                                  for l in s.get('layers', [])] for s in ss},
              note='The planter is one shared layer. Pip is the tutorial guide (story character).')
    sheet(list(zip(raws[:len(ss)], idxs[:len(ss)])), 3, 6, os.path.join(REVIEW, 'p09_pip_before_after.png'))


# ---------------------------------------------------------------- prompts 10 to 17: workers, two per sheet
PEOPLE = {'skin', 'blush', 'ash', 'white', 'cream', 'gold', 'wood-1', 'wood-2', 'wood-3', 'wood-4',
          'clay-1', 'clay-2', 'clay-3'}
# a deep brown skin sits between the skin ramp and the dark golds; it must not turn khaki
BROWN_SKIN = (lambda L, C, h: h < 56 and C > 0.08 and 0.28 < L < 0.72, {'skin'})
# tin and glass are greys with almost no colour: they belong on steel
TIN = (lambda L, C, h: C < 0.04 and 100 <= h < 260 and L > 0.28, {'steel'})
# dusty mauve and plum cloth (hue near 0) sits between skin, clay and rose: it went brown without this rule
MAUVE = (lambda L, C, h: (h >= 335 or h < 18) and C > 0.05 and L < 0.62,
         {'rose-1', 'lavender-1', 'lavender-2', 'stone-1', 'stone-2', 'stone-3'})

# sheet: [(folder, who, extra ramps, accents kept in the budget, rules), for character A then B]
SHEETS = {
    'b02_10_workers_floor04_garden_shed': [
        ('w1_floor04_worker1', 'Garden Shed Nursery, lead: the potter in the orange cap',
         {'clay-4', 'clay-5', 'leaf', 'sage', 'steel', 'lavender-1', 'lavender-2'}, {'leaf'}, [TIN]),
        ('w1_floor04_worker2', 'Garden Shed Nursery, second: the seedling keeper in purple dungarees',
         {'lavender', 'stone', 'red', 'leaf', 'clay-4', 'clay-5', '-ash'}, {'red', 'leaf'}, [MAUVE])],
    'b02_11_workers_floor05_greenhouse': [
        ('w1_floor05_worker1', 'Glass Greenhouse, lead: the botanist in the wheelchair',
         {'leaf', 'sage', 'lavender', 'rose', 'clay-4', 'steel'}, {'rose', 'lavender'}, None),
        ('w1_floor05_worker2', 'Glass Greenhouse, second: the gardener in rust dungarees',
         {'clay-4', 'leaf', 'sage', 'steel', 'sky-5'}, {'leaf'}, [TIN])],
    'b02_12_workers_floor06_market': [
        ('w1_floor06_worker1', "Farmers' Market Stall, lead: the seller in the red head wrap",
         {'red', 'leaf', 'sage', 'clay-4'}, {'leaf', 'red'}, None),
        ('w1_floor06_worker2', "Farmers' Market Stall, second: the shopper with the white braid",
         {'leaf', 'sage', 'rose-1', 'lavender-1', 'stone-2'}, {'leaf'}, [MAUVE])],
    'b02_13_workers_floor07_tea_house': [
        ('w1_floor07_worker1', 'Tea House, lead: the tea pourer in the plum robe',
         {'rose-1', 'lavender-1', 'lavender-2', 'sage', 'leaf', 'clay-4'}, {'sage'}, None),
        ('w1_floor07_worker2', 'Tea House, second: the waiter with ginger curls',
         {'clay-4', 'clay-5', 'rose-1', 'lavender-1', 'sage', 'leaf'}, {'sage'}, None)],
    'b02_14_workers_floor08_ropewalk': [
        ('w1_floor08_worker1', 'Ropewalk and Twine Shop, lead: the crank worker',
         {'sage', 'leaf-1', 'leaf-2'}, set(), None),
        ('w1_floor08_worker2', 'Ropewalk and Twine Shop, second: the twine winder',
         {'rose-1', 'lavender-1', 'stone', 'steel', '-clay-1', '-clay-2', '-clay-3'}, {'rose-1'}, None)],
    'b02_15_workers_floor09_soap_workshop': [
        ('w1_floor09_worker1', 'Soap and Scent Workshop, lead: the lavender binder',
         {'leaf', 'sage', 'lavender', 'steel'}, {'lavender'}, None),
        ('w1_floor09_worker2', 'Soap and Scent Workshop, second: the perfumer in the plum coat',
         {'lavender', 'stone', 'rose-1', 'red', 'sage', 'leaf', 'teal'}, {'teal', 'red'}, None)],
    'b02_16_workers_floor10_floor01': [
        ('w1_floor10_worker1', 'Sprout Tower HQ: the clerk with the books',
         {'leaf', 'sage', 'lavender-1', 'lavender-2', 'rose-1'}, {'lavender'}, None),
        ('w1_floor01_worker2', 'Windowsill Planter, second: the gardener in the green bandana',
         {'leaf', 'sage', 'red', 'sky-3', 'sky-4'}, {'red', 'sky'}, None)],
    'b02_17_workers_floor02_floor03': [
        ('w1_floor02_worker2', 'Balcony Boxes, second: the planter in the purple waistcoat',
         {'lavender', 'leaf', 'clay-4', 'rose'}, {'rose', 'leaf'}, None),
        ('w1_floor03_worker2', 'Backyard Hemp Patch, second: the gardener with the red braid',
         {'leaf', 'rose', 'red', 'steel', 'clay-4'}, {'rose'}, [TIN])],
}


def worker_frames(key):
    """[(character key, [(pose, file)] in pose order)] for the two people on one sheet."""
    groups = {}
    order = []
    for s in slices_of(key):
        f = s.get('file') or s.get('frame')
        ch = s.get('character')
        if ch not in groups:
            groups[ch] = []
            order.append(ch)
        pose = s.get('pose') or s['name']
        groups[ch].append((s.get('row', 0), s.get('column', 0), s.get('frame', 0) if isinstance(s.get('frame'), int) else 0,
                           pose, os.path.join(pkg(key), f)))
    out = []
    for ch in order:
        g = sorted(groups[ch], key=lambda t: (t[0], t[1], t[2]))
        assert len(g) == 9, (key, ch, len(g))
        out.append((ch, [(t[3], t[4]) for t in g]))
    assert len(out) == 2, key
    return out


def to_baseline(raws):
    """Move all frames of one person by the same amount so the idle feet stand on the Batch 1 baseline.
    If a pose would lose pixels at the frame edge, nothing moves and frames.json records the real baseline."""
    ys = np.where(raws[0][..., 3] == 255)[0]
    dy = BASELINE - (ys.max() + 1)
    if dy == 0:
        return raws, 0
    out = []
    for r in raws:
        o = np.zeros_like(r)
        if dy > 0:
            o[dy:] = r[:-dy]
        else:
            o[:dy] = r[-dy:]
        if (r[..., 3] == 255).sum() != (o[..., 3] == 255).sum():
            return raws, 0   # a pose would lose pixels at the frame edge: keep the frames and record the baseline
        out.append(o)
    return out, int(dy)


def workers():
    for key, people in SHEETS.items():
        pairs = []
        for (ch, poses), (folder, who, extra, keep, rules) in zip(worker_frames(key), people):
            raws = [load(f) for _, f in poses]
            assert all(r.shape[:2] == (80, 80) for r in raws), key
            raws, dy = to_baseline(raws)
            # extra ramps; an entry such as '-ash' takes that ramp or colour out of PEOPLE for this person
            ramps = (PEOPLE | {e for e in extra if not e.startswith('-')}) - {e[1:] for e in extra if e.startswith('-')}
            idxs, st = snap_many(raws, ramps | INKSET, rules=rules)
            # the person alone: idle, blink, cheer and the three walk frames
            idxs = apply_plan(idxs, merge_plan(idxs[:6], 24, {'blush'} | keep))
            person = used(idxs[:6])
            idxs = apply_plan(idxs, merge_plan(idxs, 32, set(person) | keep))
            fixed = 0
            for i in range(9):
                idxs[i], n = outline(idxs[i], keep_thin=True)
                fixed += n
            mf = manifest('actors/%s/frames.json' % folder)
            mf.clear()
            feet = int(np.where(raws[0][..., 3] == 255)[0].max() + 1)
            mf.update(who=who, frame=[80, 80], baseline_y=feet, source=key + '.png', frames=[],
                      note='Flip-book frames. The face is replaced later by one hand-drawn head per person.')
            for i, ((pose, _), idx) in enumerate(zip(poses, idxs)):
                name = pose.split('/')[-1].strip().lower().replace(' ', '_').replace('-', '_')
                fname = '%02d_%s_80x80.png' % (i + 1, name)
                save(idx, os.path.join(OUT, 'actors', folder, fname))
                mf['frames'].append(dict(name=name, file=fname))
            note('actor', '%s (9 frames, moved %+d)' % (folder, dy), idxs, st, fixed, 32)
            REPORT[-1]['person_colours'] = len(person)
            pairs += list(zip(raws, idxs))
        sheet(pairs, 9, 3, os.path.join(REVIEW, '%s_before_after.png' % key[:6]))


STEPS = [('b02_01_visitors', visitors), ('b02_02_currency_icons', currency_icons), ('b02_03_herb_cards_common', herb_cards),
         ('b02_06_herb_growth_stages', growth_stages), ('b02_07_floor09_soap_workshop_props', soap_props),
         ('b02_08_backwalls_soap_hq', walls), ('b02_09_pip_guide', pip), ('b02_10_workers_floor04_garden_shed', workers)]
for k, step in STEPS:
    if os.path.isdir(pkg(k)) or (step is herb_cards and any(os.path.isdir(pkg(c)) for c in CARDS)):
        step()
os.makedirs(REVIEW, exist_ok=True)
json.dump(REPORT, open(os.path.join(REVIEW, 'report.json'), 'w'), indent=1)
for rel, data in MANIFESTS.items():
    os.makedirs(os.path.dirname(os.path.join(OUT, rel)), exist_ok=True)
    json.dump(data, open(os.path.join(OUT, rel), 'w'), indent=1)
for r in REPORT:
    print('%-6s %-44s %3dx%-3d colours %2d -> %2d (budget %d %s)%s outline %3d  move mean %.3f max %.3f' % (
        r['cls'], r['name'][:44], r['size'][0], r['size'][1], r['source_colours'], r['colours'], r['budget'],
        'ok' if r['within_budget'] else 'OVER',
        (' person %d' % r['person_colours']) if 'person_colours' in r else '',
        r['outline_pixels_fixed'], r['mean_move'], r['max_move']))
