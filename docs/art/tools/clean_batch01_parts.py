"""Automatic clean-up pass for Batch 1 rounds 1, 2, 3, 5 and 6 (prompts 1 to 10 and 15 to 17).

These rounds arrived with every part already cut at true size, so the pass is:
snap the colours to the master palette (limited to the ramps that sprite may use),
drop baked sparkles, rebuild the ink outline, hold the colour budget, write the sprite.

Usage: python3 -I clean_batch01_parts.py ROUND UPLOAD_DIR OUT_DIR

ROUND is 1, 2, 3, 5 or 6. UPLOAD_DIR is that round's unpacked zip.
OUT_DIR receives the sprite folders and review/ with before/after sheets and a report.
"""
import sys, os, json
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cleanlib import (load, snap_many, reduce_many, outline, drop_small, drop_sparkles, save, used,  # noqa: E402
                      sheet, to_rgba, INK, NO_SKIN)

ROUND, SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SLICES = json.load(open(os.path.join(SRC, 'slices.json')))['sheets']
REPORT = []
MANIFEST = {}
MANIFEST_FILE = {'1': 'props/floor03_hemp_patch/props.json', '2': 'plants/plants.json', '3': 'actors/workers.json',
                 '5': 'props/floor08_ropewalk/props.json', '6': 'icons/ui/icons.json'}
INKSET = {'ink'}


def src(rel):
    return load(os.path.join(SRC, rel))


def out(idx, rel):
    save(idx, os.path.join(OUT, rel))


def note(cls, name, idxs, st, fixed, budget):
    if not isinstance(idxs, list):
        idxs = [idxs]
    cols = used(idxs)
    h, w = idxs[0].shape
    REPORT.append(dict(cls=cls, name=name, size=[w, h], files=len(idxs), source_colours=st['src'],
                       colours=len(cols), budget=budget, within_budget=len(cols) <= budget,
                       outline_pixels_fixed=fixed, mean_move=round(st['mean'], 3),
                       max_move=round(st['max'], 3), palette=cols))


def clean(cls, name, items, ramps, budget, drop=0, edge=True, thin=False, over=None, lift=0.0):
    """items = [(source file, output file)]. All items share one colour map and one budget.
    Returns [(raw, cleaned index image)] for the review sheet."""
    raws = [src(a) for a, _ in items]
    if drop:
        raws = [drop_small(r, drop)[0] for r in raws]
    idxs, st = snap_many(raws, set(ramps) | INKSET, over, lift)
    fixed = 0
    if edge:
        for i in range(len(idxs)):
            idxs[i], n = outline(idxs[i], keep_thin=thin)
            fixed += n
    idxs, _ = reduce_many(idxs, budget)
    for idx, (_, rel) in zip(idxs, items):
        out(idx, rel)
    note(cls, name, idxs, st, fixed, budget)
    return list(zip(raws, idxs))


def paste(canvas, idx, x, y):
    h, w = idx.shape
    m = idx >= 0
    canvas[y:y + h, x:x + w][m] = idx[m]


# ---------------------------------------------------------------- round 2: crops
def round2():
    HEMP = {'sage', 'leaf-5', 'gold', 'wood', 'clay', 'cream'}
    LIFT = 0.04      # keeps living hemp as pale as the hemp chart
    # prompt 5: the five growth stages of fibre hemp, 32x96, one colour map so growth cannot flicker
    order = SLICES['b01_05_hemp_growth_stages.png']['growth_order']
    items = [('parts/05_fibre_growth/%s.png' % k, 'plants/hemp_fibre_%d_%s_32x96.png' % (i + 1, k))
             for i, k in enumerate(order)]
    p5 = clean('plant', 'hemp_fibre (5 growth stages)', items, HEMP, 16, edge=False, lift=LIFT)
    MANIFEST['hemp_fibre'] = dict(frame=[32, 96], anchor_bottom_center=[16, 96],
                                  stages=[os.path.basename(o) for _, o in items])

    # prompt 6: two more hemp plants and the harvest props
    p6 = []
    p6 += clean('plant', 'hemp_seed_with_sparrow', [('parts/06_varieties_harvest/seed_hemp_and_sparrow.png',
                'plants/hemp_seed_with_sparrow_83x95.png')], HEMP, 16, thin=True, lift=LIFT)
    p6 += clean('plant', 'hemp_longstalk_staked', [('parts/06_varieties_harvest/longstalk_hemp.png',
                'plants/hemp_longstalk_staked_47x103.png')], HEMP | {'sky'}, 16, edge=False, lift=LIFT)
    # cut stalks are pale straw with a green cast: cream, the quiet golds and the light end of sage
    CUT = {'cream', 'gold-1', 'gold-2', 'gold-5', 'sage-4', 'sage-5'}
    for k, size, ramps in (('tied_sheaf', '49x95', CUT),
                           ('stook', '91x94', CUT),
                           ('drying_rack', '93x86', CUT | {'wood-1', 'wood-2', 'wood-3', 'wood-4'}),
                           ('combed_fibre', '51x100', {'cream', 'gold', 'wood', 'sage'})):
        p6 += clean('prop', 'hemp_' + k, [('parts/06_varieties_harvest/%s.png' % k,
                    'props/harvest/hemp_%s_%s.png' % (k, size))], ramps, 16)
    # the giant cane is three pieces that stack, so they share one colour map
    ga = SLICES['b01_06_hemp_varieties_harvest.png']['giant_cane_assembly']['native_parts']
    p6 += clean('plant', 'hemp_giant_cane (top, repeat, base)', [
        (ga['top']['file'], 'plants/hemp_giant_cane_top_68x115.png'),
        (ga['repeat']['file'], 'plants/hemp_giant_cane_repeat_25x40.png'),
        (ga['base']['file'], 'plants/hemp_giant_cane_base_81x112.png')],
        HEMP | {'sky', 'steel'}, 16, edge=False, lift=LIFT)
    MANIFEST['hemp_giant_cane'] = dict(
        stack_top_to_bottom=['top', 'repeat (zero or more)', 'base'],
        shaft_center_x=dict(top=ga['top']['shaft_center_x_in_part'], repeat=ga['repeat']['shaft_center_x_in_part'],
                            base=ga['base']['shaft_center_x_in_part']),
        files=dict(top='hemp_giant_cane_top_68x115.png', repeat='hemp_giant_cane_repeat_25x40.png',
                   base='hemp_giant_cane_base_81x112.png'))

    # prompt 7: basil, rosemary, lavender. Planter and foliage are separate layers; frames are composed from them
    s7 = SLICES['b01_07_herb_growth_stages.png']
    lay = s7['layers']
    px, py = lay['planter']['offset_in_frame']
    planter_raw = src(lay['planter']['file'])
    seeds_raw = src('layers/07_herbs/seeds.png')
    (planter, seeds), st_pl = snap_many([planter_raw, seeds_raw], {'clay', 'wood', 'gold', 'cream'} | INKSET)
    (planter, seeds), _ = reduce_many([planter, seeds], 7)
    # the palette gives rosemary and other cool foliage the sage ramp; basil is the hero leaf green
    HERB = {'basil': {'leaf'}, 'rosemary': {'sage', 'sky'}, 'lavender': {'sage', 'lavender'}}
    p7 = []
    herbs = {}
    for herb, ramps in HERB.items():
        keys = ['%s_%s' % (herb, g) for g in s7['growth_order']]
        fol_raw = {k: src(lay['plants'][k]['file']) for k in keys[1:]}
        hk = keys[-1]                                   # harvest-ready carries baked sparkles
        fol_raw[hk] = drop_small(drop_sparkles(fol_raw[hk])[0], 60)[0]
        idxs, st = snap_many(list(fol_raw.values()), ramps | {'gold', 'wood'} | INKSET)
        idxs, _ = reduce_many(idxs, 9)
        fol = dict(zip(fol_raw.keys(), idxs))
        herbs[herb] = (keys, fol, st)
    # outline on the composed frame, written back to the layer that owns the pixel
    fixed = 0
    for herb, (keys, fol, st) in herbs.items():
        for k in keys:
            top = seeds if k.endswith('_seed') else fol[k]
            ox, oy = lay['plants'][k]['offset_in_frame']
            for _ in range(2):
                comp = np.full((90, 72), -1, np.int32)
                own = np.zeros((90, 72), np.int8)
                paste(comp, planter, px, py)
                h, w = top.shape
                m = top >= 0
                comp[oy:oy + h, ox:ox + w][m] = top[m]
                own[oy:oy + h, ox:ox + w][m] = 1
                fx, n = outline(comp, keep_thin=True)
                ch = fx != comp
                fixed += n
                if not n:
                    break
                ys, xs = np.nonzero(ch & (own == 1))
                top[ys - oy, xs - ox] = INK
                ys, xs = np.nonzero(ch & (own == 0))
                planter[ys - py, xs - px] = INK
    out(planter, 'plants/herb_layers/planter_36x33.png')
    out(seeds, 'plants/herb_layers/seeds_21x10.png')
    MANIFEST['herbs'] = dict(frame=[72, 90], anchor_bottom_center=s7['parts']['basil_seed']['anchor_bottom_center'],
                             planter=dict(file='herb_layers/planter_36x33.png', offset_in_frame=[px, py]), stages={})
    for herb, (keys, fol, st) in herbs.items():
        frames = []
        for i, k in enumerate(keys):
            top = seeds if k.endswith('_seed') else fol[k]
            ox, oy = lay['plants'][k]['offset_in_frame']
            comp = np.full((90, 72), -1, np.int32)
            paste(comp, planter, px, py)
            paste(comp, top, ox, oy)
            stage = s7['growth_order'][i]
            fname = '%s_%d_%s_72x90.png' % (herb, i + 1, stage)
            out(comp, 'plants/' + fname)
            lname = 'herb_layers/seeds_21x10.png'
            if not k.endswith('_seed'):
                lname = 'herb_layers/%s_%d_%s_foliage_%dx%d.png' % (herb, i + 1, stage, top.shape[1], top.shape[0])
                out(top, 'plants/' + lname)
            MANIFEST['herbs']['stages'][k] = dict(frame=fname, layer=lname, offset_in_frame=[ox, oy])
            frames.append(comp)
            raw = src(s7['parts'][k]['file'])
            p7.append((raw, comp))
        note('plant', '%s (5 growth stages, planter + foliage)' % herb, frames,
             dict(src=st['src'] + st_pl['src'], mean=st['mean'], max=max(st['max'], st_pl['max'])), 0, 16)
    REPORT[-1]['outline_pixels_fixed'] = fixed
    sheet(p5, 5, 4, os.path.join(OUT, 'review', 'p05_hemp_growth_before_after.png'))
    sheet(p6, 5, 2, os.path.join(OUT, 'review', 'p06_hemp_varieties_before_after.png'))
    sheet(p7, 5, 3, os.path.join(OUT, 'review', 'p07_herb_growth_before_after.png'))


ROUNDS = {'2': round2}
ROUNDS[ROUND]()
os.makedirs(os.path.join(OUT, 'review'), exist_ok=True)
json.dump(REPORT, open(os.path.join(OUT, 'review', 'report.json'), 'w'), indent=1)
if MANIFEST:
    os.makedirs(os.path.dirname(os.path.join(OUT, MANIFEST_FILE[ROUND])), exist_ok=True)
    json.dump(MANIFEST, open(os.path.join(OUT, MANIFEST_FILE[ROUND]), 'w'), indent=1)
for r in REPORT:
    print('%-6s %-46s %3dx%-3d colours %2d -> %2d (budget %d %s) outline fixed %3d  move mean %.3f max %.3f' % (
        r['cls'], r['name'], r['size'][0], r['size'][1], r['source_colours'], r['colours'], r['budget'],
        'ok' if r['within_budget'] else 'OVER', r['outline_pixels_fixed'], r['mean_move'], r['max_move']))
