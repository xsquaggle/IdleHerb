"""Automatic clean-up pass for Batch 1 rounds 1, 2, 3, 5 and 6 (prompts 1 to 10 and 15 to 17).

These rounds arrived with every part already cut at true size, so the pass is:
snap the colours to the master palette (limited to the ramps that sprite may use),
drop baked sparkles, rebuild the ink outline, hold the colour budget, write the sprite.

Usage: python3 -I clean_batch01_parts.py ROUND UPLOAD_DIR OUT_DIR

ROUND is 1, 2, 3, 5 or 6. UPLOAD_DIR is that round's unpacked zip.
OUT_DIR receives the sprite folders and review/roundN/ with before/after sheets and a report.
Run every round into the same OUT_DIR: the JSON files next to the sprites are added to, not replaced.
"""
import sys, os, json
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402
from cleanlib import (load, snap_many, reduce_many, merge_plan, apply_plan, outline, drop_small, drop_sparkles, save, used,  # noqa: E402
                      sheet, to_rgba, veil, VEIL, INK, NO_SKIN)

ROUND, SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SLICES = json.load(open(os.path.join(SRC, 'slices.json')))['sheets']
REVIEW = os.path.join(OUT, 'review', 'round' + ROUND)
REPORT = []
MANIFESTS = {}


def manifest(rel):
    """A JSON file next to the sprites. Rounds add to it, so one OUT_DIR can take every round."""
    if rel not in MANIFESTS:
        path = os.path.join(OUT, rel)
        MANIFESTS[rel] = json.load(open(path)) if os.path.exists(path) else {}
    return MANIFESTS[rel]


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


def clean(cls, name, items, ramps, budget, drop=0, edge=True, thin=False, over=None, lift=0.0, dim=0.0):
    """items = [(source file, output file)]. All items share one colour map and one budget.
    Returns [(raw, cleaned index image)] for the review sheet."""
    raws = [src(a) for a, _ in items]
    if drop:
        raws = [drop_small(r, drop)[0] for r in raws]
    idxs, st = snap_many(raws, set(ramps) | INKSET, over, lift, dim)
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
    manifest('plants/plants.json')['hemp_fibre'] = dict(frame=[32, 96], anchor_bottom_center=[16, 96],
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
    manifest('plants/plants.json')['hemp_giant_cane'] = dict(
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
    mh = manifest('plants/plants.json')
    mh['herbs'] = dict(frame=[72, 90], anchor_bottom_center=s7['parts']['basil_seed']['anchor_bottom_center'],
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
            mh['herbs']['stages'][k] = dict(frame=fname, layer=lname, offset_in_frame=[ox, oy])
            frames.append(comp)
            raw = src(s7['parts'][k]['file'])
            p7.append((raw, comp))
        note('plant', '%s (5 growth stages, planter + foliage)' % herb, frames,
             dict(src=st['src'] + st_pl['src'], mean=st['mean'], max=max(st['max'], st_pl['max'])), 0, 16)
    REPORT[-1]['outline_pixels_fixed'] = fixed
    sheet(p5, 5, 4, os.path.join(REVIEW, 'p05_hemp_growth_before_after.png'))
    sheet(p6, 5, 2, os.path.join(REVIEW, 'p06_hemp_varieties_before_after.png'))
    sheet(p7, 5, 3, os.path.join(REVIEW, 'p07_herb_growth_before_after.png'))


# ---------------------------------------------------------------- back walls and floor props (rounds 1 and 5)
def walls(sheet_key, table, tag):
    """table = [(part name, floor number, short name, ramps)]. Walls are full panels: no outline pass.
    The flat sky colour of open-air walls arrives already cut out, so the game's own sky shows there.
    Each wall is written twice: in plain master colours, and under veiled/ as the game shows it."""
    parts = SLICES[sheet_key]['parts']
    rows = []
    for name, floor, short, ramps in table:
        fname = 'w1_floor%02d_%s_336x104.png' % (floor, short)
        raw, idx = clean('wall', 'w1_floor%02d_%s' % (floor, short), [(parts[name]['file'], 'walls/' + fname)],
                         ramps, 32, edge=False)[0]
        shown = veil(to_rgba(idx))
        os.makedirs(os.path.join(OUT, 'walls', 'veiled'), exist_ok=True)
        Image.fromarray(shown, 'RGBA').save(os.path.join(OUT, 'walls', 'veiled', fname))
        mw = manifest('walls/walls.json')
        mw.setdefault('walls', {})[fname] = dict(
            world=1, floor=floor, size=[336, 104], open_sky=bool(parts[name].get('sky_removed')))
        mw['veil'] = dict(colour=VEIL[0], alpha=VEIL[1], note='veiled/ holds each wall as the game shows it')
        rows.append((raw, to_rgba(idx), shown))
    # review sheet: raw, plain master colours, veiled
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
    Image.fromarray(np.concatenate(lines[:-1], 0)).save(os.path.join(REVIEW, '%s_walls_raw_plain_veiled.png' % tag))


def floor_props(sheet_key, table, folder, tag, cols):
    """table = [(part name, class, budget, ramps, thin)]. Positions on the 360x120 floor go to the manifest."""
    s = SLICES[sheet_key]
    pairs = []
    mf = manifest('props/%s/floor.json' % folder)
    mf.update(size=[360, 120], baseline_y=s['native_baseline_y_exclusive'], parts={})
    for name, cls, budget, ramps, thin in table:
        part = s['parts'][name]
        w, h = part['native_size']
        sub = 'actors' if cls == 'actor' else 'props'
        rel = '%s/%s/%s_%dx%d.png' % (sub, folder, name, w, h)
        pairs += clean(cls, name, [(part['file'], rel)], ramps, budget, thin=thin)
        mf['parts'][name] = dict(file='../../' + rel if cls == 'actor' else os.path.basename(rel),
                                               size=[w, h], origin_on_floor=part['native_origin_on_sheet'], cls=cls)
    sheet(pairs, cols, 4, os.path.join(REVIEW, '%s_before_after.png' % tag))


# Back walls are snapped to plain master colours here. They are made quiet by the wall veil (see walls()).
WALL = {'wood', 'cream', 'gold', 'stone', 'ash', 'steel', 'clay', 'lavender'}
CUT = {'cream', 'gold-1', 'gold-2', 'gold-5', 'sage-4', 'sage-5'}
DARKWOOD = {'wood-1', 'wood-2', 'wood-3', 'wood-4'}


def round1():
    walls('b01_01_backwalls_windowsill_balcony.png', [('windowsill_room', 1, 'windowsill', WALL | {'rose', 'sage'}),
                                                     ('balcony_wall', 2, 'balcony', WALL | {'rose', 'sage'})], 'p01')
    p = SLICES['b01_02_backwalls_backyard_shed.png']['parts']
    walls('b01_02_backwalls_backyard_shed.png', [('backyard', 3, 'backyard', {'leaf', 'wood', 'clay', 'red', 'cream', 'gold', 'steel', 'stone'}),
                                                ('garden_shed', 4, 'garden_shed', WALL)], 'p02')
    walls('b01_03_backwalls_greenhouse_ropewalk.png', [('greenhouse', 5, 'greenhouse', {'steel', 'cream', 'stone-1', 'stone-2', 'teal-1', 'teal-2'}),
                                                      ('ropewalk', 8, 'ropewalk', WALL)], 'p03')
    floor_props('b01_04_floor03_hemp_patch_props.png', [
        ('scarecrow_fence', 'prop', 16, {'wood', 'gold', 'cream', 'clay', 'red', 'sage'}, False),
        ('tied_stook', 'prop', 16, CUT, False),
        ('loaded_wheelbarrow', 'prop', 16, CUT | DARKWOOD | {'steel'}, False),
        ('empty_raised_bed', 'prop', 16, {'wood', 'clay', 'gold'}, False),
        ('tool_rack', 'prop', 16, {'wood', 'steel', 'ash', 'gold', 'clay'}, True),
        ('barrel_and_watering_can', 'prop', 16, {'wood', 'steel', 'ash', 'gold', 'sky'}, False),
        ('stool_crate_and_bell', 'prop', 16, {'wood', 'gold', 'cream'}, False),
    ], 'floor03_hemp_patch', 'p04_hemp_patch_props', 4)


def round5():
    floor_props('b01_15_floor08_ropewalk_twine_shop.png', [
        ('fibre_shelf', 'prop', 16, {'wood', 'cream', 'gold'}, False),
        ('rope_wheel', 'prop', 16, {'wood', 'cream', 'gold', 'steel', 'stone'}, True),
        ('crank_worker', 'actor', 24, {'skin', 'blush', 'wood', 'gold', 'cream', 'sage', 'clay', 'white'}, False),
        ('rope_run_and_post', 'prop', 16, {'wood', 'cream', 'gold', 'steel', 'stone'}, True),
        ('twine_bench', 'prop', 16, {'wood', 'cream', 'gold', 'steel', 'stone'}, False),
        ('twine_worker', 'actor', 24, {'skin', 'blush', 'ash', 'white', 'rose-1', 'stone', 'cream', 'wood',
                                       'gold', 'steel'}, False),
        ('shop_counter_and_stool', 'prop', 16, {'wood', 'cream', 'gold', 'lavender', 'stone'}, False),
    ], 'floor08_ropewalk', 'p15_ropewalk', 4)
    walls('b01_16_backwalls_market_teahouse.png', [('farmers_market', 6, 'market', {'cream', 'stone-1', 'stone-2', 'stone-3', 'gold', 'lavender', 'rose',
                                                                         'wood-1', 'wood-2'}),
                                                  ('tea_house', 7, 'tea_house', WALL | {'sage'})], 'p16')


# ---------------------------------------------------------------- round 6: menu and stat icons
def round6():
    """24 icons at 32, 24 and 16 pixels. The three sizes of one icon share a colour map.
    The 24 and 16 pixel versions are stand-ins until they are redrawn by hand (style bible section 15)."""
    U = {'cream', 'white'}
    ICON = {
        'card_stack': {'gold', 'lavender', 'sky', 'leaf'}, 'sprout_lightbulb': {'gold', 'leaf', 'wood', 'ash'},
        'skill_nodes': {'gold', 'lavender'}, 'quest_scroll': {'gold', 'red', 'clay', 'wood'},
        'market_stall': {'wood', 'red', 'clay', 'leaf', 'gold'}, 'prestige_wreath': {'leaf', 'gold', 'red', 'clay'},
        'trophy': {'gold', 'lavender', 'wood'}, 'sprout_book': {'lavender', 'gold', 'leaf', 'red', 'clay'},
        'event_calendar': {'gold', 'red', 'clay', 'wood', 'sky'}, 'settings_gear': {'lavender'},
        'speaker': {'clay', 'red', 'gold', 'wood', 'lavender'}, 'music_note': {'lavender'},
        'lock': {'gold', 'lavender', 'wood'}, 'check_mark': {'leaf'}, 'close': {'red', 'clay'},
        'magnifying_glass': {'gold', 'sky', 'wood', 'clay'}, 'upgrade_arrow': {'leaf'},
        'hourglass': {'wood', 'clay', 'gold', 'sky', 'rose'}, 'sprout': {'leaf', 'wood'}, 'lightning': {'gold', 'wood'},
        'starburst': {'gold', 'wood'}, 'triple_chevrons': {'leaf'}, 'moon_and_stars': {'gold', 'wood'},
        'golden_sprout': {'gold', 'wood'},
    }
    by_size = {32: [], 24: [], 16: []}
    mi = manifest('icons/ui/icons.json')
    mi['note'] = '32 pixel icons are the designs. 24 and 16 are stand-ins until redrawn by hand.'
    mi['icons'] = list(ICON)
    for name, ramps in ICON.items():
        items = [('parts/%dpx/%s.png' % (z, name), 'icons/ui/%s_%d.png' % (name, z)) for z in (32, 24, 16)]
        pairs = clean('icon', 'ui_' + name, items, ramps | U, 16)
        for z, pr in zip((32, 24, 16), pairs):
            by_size[z].append(pr)
    sheet(by_size[32], 6, 5, os.path.join(REVIEW, 'p17_ui_icons_32_before_after.png'))
    sheet(by_size[24] + by_size[16], 12, 4, os.path.join(REVIEW, 'p17_ui_icons_24_16_before_after.png'))


# ---------------------------------------------------------------- round 3: worker animation sheets
def round3():
    """Three lead workers, nine 80x80 frames each. The frames, the shared head, the body layers and the
    props of one worker share a colour map, so nothing flickers between poses.
    Budget: 24 colours for the person (the six poses without a prop), 32 with the held props.
    The outline is rebuilt on the composed frames; the layers are colour-snapped for the cut-out rig.
    People keep their warm lights on the skin ramp: the bright ends of wood and clay are left out."""
    PEOPLE = {'skin', 'blush', 'ash', 'white', 'cream', 'gold', 'wood-1', 'wood-2', 'wood-3', 'wood-4',
              'clay-1', 'clay-2', 'clay-3'}
    # her hair is a beige grey that would land on cream and skin; it belongs on ash
    GREY_HAIR = {'#dacead': 'ash-4', '#f6ebca': 'white-1', '#c7ba90': 'ash-3', '#9e926e': 'ash-3'}
    # the tin watering can and its water drops are grey-greens with almost no colour: they belong on steel
    TIN = (lambda L, C, h: C < 0.04 and 100 <= h < 260 and L > 0.28, {'steel'})
    # a deep brown skin sits between the skin ramp and the dark golds; it must not turn khaki
    BROWN_SKIN = (lambda L, C, h: h < 56 and C > 0.08 and 0.28 < L < 0.72, {'skin'})
    WORKERS = [
        ('b01_08_worker_sheet_floor1_gardener.png', 'w1_floor01_gardener',
         PEOPLE | {'rose', 'red', 'leaf', 'clay-4'}, {'rose'}, {'leaf'}, GREY_HAIR, None, []),
        ('b01_10_worker_sheet_floor2_gardener.png', 'w1_floor02_gardener',
         PEOPLE | {'red', 'steel', 'leaf'}, set(), {'steel', 'leaf'}, None, [TIN],
         ['layers/props/watering_can_tipped.png', 'layers/props/watering_can_upright.png']),
        ('b01_09_worker_sheet_floor3_gardener.png', 'w1_floor03_gardener',
         (PEOPLE - {'wood-3', 'wood-4', 'clay-1', 'clay-2', 'clay-3'}) | {'steel', 'sage-3', 'sage-4', 'sage-5'},
         set(), {'steel'}, None, [BROWN_SKIN],
         ['layers/props/rake_extended.png', 'layers/props/rake_extended_ground_stalks.png',
          'layers/props/rake_pulled.png', 'layers/props/rake_pulled_ground_stalks.png',
          'layers/props/shouldered_sheaf.png']),
    ]
    for sheet_key, who, ramps, keep_person, keep_props, over, rules, props in WORKERS:
        s = SLICES[sheet_key]
        poses = s['poses']
        frames = [p['frame'] for p in poses]
        heads = [s['head_master']] + [v['file'] for v in s['head_patches'].values()]
        bodies = [p['body'] for p in poses]
        layer_files = heads + bodies + props
        raws = [src(f) for f in frames + layer_files]
        idxs, st = snap_many(raws, ramps | INKSET, over, rules=rules)
        nf, nh = len(frames), len(heads)
        # the person: the six poses that hold nothing, with the head and their body layers
        person = list(range(6)) + list(range(nf, nf + nh)) + list(range(nf + nh, nf + nh + 6))
        idxs = apply_plan(idxs, merge_plan([idxs[i] for i in person], 24, {'blush'} | keep_person))
        person_cols = used([idxs[i] for i in person])
        idxs = apply_plan(idxs, merge_plan(idxs, 32, set(person_cols) | keep_props))
        fixed = 0
        for i in range(nf):
            idxs[i], n = outline(idxs[i], keep_thin=True)
            fixed += n
        lay = lambda f: 'layers/' + os.path.basename(f)   # noqa: E731
        mf = manifest('actors/%s/frames.json' % who)
        mf.update(frame=[80, 80], baseline_y=s['baseline_native_y_exclusive'], frames=[],
                  head=dict(file=lay(s['head_master']),
                            patches={k: dict(file=lay(v['file']), replace_at=v['replace_at_native'])
                                     for k, v in s['head_patches'].items()}),
                  recipe='Ground layer and prop at the origin, then the shared head at head_offset, then the body at the origin.')
        pairs = []
        for i, p in enumerate(poses):
            fname = '%02d_%s_80x80.png' % (i + 1, p['name'])
            out(idxs[i], 'actors/%s/%s' % (who, fname))
            entry = dict(name=p['name'], file=fname, head_offset=p['head_offset_native'], body=lay(p['body']))
            if 'head_patch' in p:
                entry['head_patch'] = p['head_patch']
            for k in ('prop', 'ground'):
                if k in p:
                    entry[k] = lay(p[k])
            mf['frames'].append(entry)
            pairs.append((raws[i], idxs[i]))
        for f, idx in zip(layer_files, idxs[nf:]):
            out(idx, 'actors/%s/%s' % (who, lay(f)))
        note('actor', '%s (9 frames, head, bodies, props)' % who, idxs[:nf], st, fixed, 32)
        REPORT[-1]['person_colours'] = len(person_cols)
        REPORT[-1]['person_budget'] = 24
        print('   person alone: %d colours (budget 24)' % len(person_cols))
        sheet(pairs, 3, 3, os.path.join(REVIEW, '%s_before_after.png' % who))


ROUNDS = {'1': round1, '2': round2, '3': round3, '5': round5, '6': round6}
ROUNDS[ROUND]()
os.makedirs(REVIEW, exist_ok=True)
json.dump(REPORT, open(os.path.join(REVIEW, 'report.json'), 'w'), indent=1)
for rel, data in MANIFESTS.items():
    os.makedirs(os.path.dirname(os.path.join(OUT, rel)), exist_ok=True)
    json.dump(data, open(os.path.join(OUT, rel), 'w'), indent=1)
for r in REPORT:
    print('%-6s %-46s %3dx%-3d colours %2d -> %2d (budget %d %s) outline fixed %3d  move mean %.3f max %.3f' % (
        r['cls'], r['name'], r['size'][0], r['size'][1], r['source_colours'], r['colours'], r['budget'],
        'ok' if r['within_budget'] else 'OVER', r['outline_pixels_fixed'], r['mean_move'], r['max_move']))
