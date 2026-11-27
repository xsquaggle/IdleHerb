"""Shared steps of the automatic clean-up pass (style bible section 21, CLEANUP_ROUTE.md).

Every step works on an index image: one master palette index per pixel, -1 for transparent.
The functions are the ones proven on Batch 1 round 4 (clean_batch01_round4.py keeps its own copy).
"""
import os, json
import numpy as np
from PIL import Image

from oklab import rgb_to_oklab

HERE = os.path.dirname(os.path.abspath(__file__))
PAL = json.load(open(os.path.join(HERE, '..', 'palette', 'sprout_master_palette_v1.json')))
P_NAMES, P_RGB = [], []
for _r in PAL['ramps']:
    for _i, _c in enumerate(_r['colors']):
        P_NAMES.append('%s-%d' % (_r['id'], _i + 1))
        P_RGB.append([int(_c[j:j + 2], 16) for j in (1, 3, 5)])
P_RGB = np.array(P_RGB, np.uint8)
P_LAB = rgb_to_oklab(P_RGB.astype(np.float64))
INK = P_NAMES.index('ink-1')
RAMPS = [r['id'] for r in PAL['ramps']]
# skin and blush belong to people only: on props they pull tan and olive off their ramp
NO_SKIN = set(RAMPS) - {'skin', 'blush'}


def load(path):
    im = np.array(Image.open(path).convert('RGBA'))
    a = im[..., 3]
    assert ((a == 0) | (a == 255)).all(), 'soft alpha in ' + path
    return im


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


def snap_map(colors, ramps, overrides=None, green_lift=0.0, all_lift=0.0, rules=None):
    """Nearest master colour for each source colour, inside the allowed ramps.
    Greens stay green, blues stay blue and purples stay purple when the sprite has such a ramp.
    green_lift raises the lightness of green source colours before matching. The sage ramp is
    darker and stronger than the pale greens ChatGPT paints for hemp, so nearest-colour alone
    lands one step too dark; a small lift keeps the canes pale."""
    allow = allowed(ramps)
    lab = rgb_to_oklab(colors.astype(np.float64))
    if green_lift or all_lift:
        # all_lift (negative) is for back walls, which must sit a step darker than the props
        lab = lab.copy()
        lab[hue_class(lab) == 2, 0] += green_lift
        lab[..., 0] += all_lift
    d = np.sqrt(((lab[:, None, :] - P_LAB[None, :, :]) ** 2).sum(-1))
    d[:, ~allow] = 9
    if rules:
        # rules = [(test(L, chroma, hue), ramps)]: source colours that pass the test may only use those ramps
        chroma = np.sqrt(lab[:, 1] ** 2 + lab[:, 2] ** 2)
        hue = np.degrees(np.arctan2(lab[:, 2], lab[:, 1])) % 360
        for test, only in rules:
            hit = np.array([bool(test(lab[i, 0], chroma[i], hue[i])) for i in range(len(colors))])
            d[np.ix_(hit, ~allowed(set(only) | {'ink'}))] = 9
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


def snap_many(imgs, ramps, overrides=None, green_lift=0.0, all_lift=0.0, rules=None):
    """One shared colour map for several images, so frames of one thing cannot flicker.
    Returns the index images and the stats of the move."""
    cols = np.unique(np.concatenate([im[im[..., 3] == 255][:, :3] for im in imgs]), axis=0)
    near, dist = snap_map(cols, ramps, overrides, green_lift, all_lift, rules)
    key = (cols[:, 0].astype(np.int64) << 16) | (cols[:, 1].astype(np.int64) << 8) | cols[:, 2]
    out, total, moved = [], 0, 0.0
    for im in imgs:
        op = im[..., 3] == 255
        px = im[op][:, :3].astype(np.int64)
        pos = np.searchsorted(key, (px[:, 0] << 16) | (px[:, 1] << 8) | px[:, 2])
        idx = np.full(im.shape[:2], -1, np.int32)
        idx[op] = near[pos]
        out.append(idx)
        total += len(pos)
        moved += float(dist[pos].sum())
    return out, dict(src=len(cols), mean=moved / max(1, total), max=float(dist.max()) if len(dist) else 0.0)


def snap(img, ramps, overrides=None):
    idxs, st = snap_many([img], ramps, overrides)
    return idxs[0], st


def merge_plan(idxs, budget, keep=()):
    """Which colours to fold into which so that the images together hold a budget.
    The least used colour goes into its nearest used neighbour, again and again.
    keep = ramps or single colours that are never folded away (small accents such as
    spectacles or water drops would otherwise always be the first to go)."""
    kept = allowed(set(keep)) if keep else np.zeros(len(P_NAMES), bool)
    allv = np.concatenate([i[i >= 0] for i in idxs])
    vals, cnt = np.unique(allv, return_counts=True)
    count = {int(v): int(c) for v, c in zip(vals, cnt)}
    plan = {}
    while len(count) > budget:
        cands = [v for v in sorted(count, key=lambda v: (count[v], v)) if v != INK and not kept[v]]
        if not cands:
            break
        v = cands[0]
        others = [x for x in count if x != v]
        dd = np.sqrt(((P_LAB[others] - P_LAB[v]) ** 2).sum(-1))
        t = others[int(dd.argmin())]
        count[t] += count.pop(v)
        for k in list(plan):
            if plan[k] == v:
                plan[k] = t
        plan[v] = t
    return plan


def apply_plan(idxs, plan):
    out = []
    for i in idxs:
        o = i.copy()
        for v, t in plan.items():
            o[i == v] = t
        out.append(o)
    return out


def reduce_many(idxs, budget, keep=()):
    """Hold a colour budget counted over all the images together."""
    plan = merge_plan(idxs, budget, keep)
    return apply_plan(idxs, plan), len(plan)


def reduce_to(idx, budget):
    idxs, merged = reduce_many([idx], budget)
    return idxs[0], merged


def outline(idx, thresh=0.36, keep_thin=False):
    """Opaque pixels that touch transparency (4 neighbours) become ink unless already dark.
    keep_thin leaves strokes of one or two pixels in their colour (thin leaves, needles, twine):
    an edge pixel is inked only when it has an inner neighbour to stay visible behind it."""
    a = idx >= 0
    p = np.pad(a, 1)
    h, w = a.shape
    inside = p[0:h, 1:w + 1] & p[2:h + 2, 1:w + 1] & p[1:h + 1, 0:w] & p[1:h + 1, 2:w + 2]
    L = P_LAB[:, 0]
    fix = a & ~inside & (L[np.where(a, idx, 0)] > thresh)
    if keep_thin:
        q = np.pad(a & inside, 1)
        fix &= q[0:h, 1:w + 1] | q[2:h + 2, 1:w + 1] | q[1:h + 1, 0:w] | q[1:h + 1, 2:w + 2]
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


def drop_small(img, max_px):
    """Remove detached specks (sparkles, stray pixels) from an RGBA image."""
    lab, n = components(img[..., 3] == 255)
    out = img.copy()
    dropped = 0
    for k in range(1, n + 1):
        m = lab == k
        if m.sum() <= max_px:
            out[m] = 0
            dropped += 1
    return out, dropped


def _grow(mask):
    p = np.pad(mask, 1)
    h, w = mask.shape
    out = np.zeros_like(mask)
    for dy in (0, 1, 2):
        for dx in (0, 1, 2):
            out |= p[dy:dy + h, dx:dx + w]
    return out


def drop_sparkles(img, max_core=45):
    """Remove baked four-point sparkles, also when they touch the plant.
    A sparkle is a small bright warm shape with mostly outline or empty space around it."""
    op = img[..., 3] == 255
    lab = rgb_to_oklab(img[..., :3].astype(np.float64))
    dark = op & (lab[..., 0] < 0.33)
    chroma = np.sqrt(lab[..., 1] ** 2 + lab[..., 2] ** 2)
    hue = np.degrees(np.arctan2(lab[..., 2], lab[..., 1])) % 360
    L = lab[..., 0]
    # the brown-to-gold rim, and the pale yellow centre that sits just on the green side of yellow
    warm = op & (chroma > 0.05) & (((hue_class(lab) == 1) & (L > 0.36)) | ((L > 0.85) & (hue >= 85) & (hue < 125)))
    cl, n = components(warm)
    spark = np.zeros_like(op)
    for k in range(1, n + 1):
        m = cl == k
        ring = _grow(m) & ~m
        if m.sum() <= max_core and L[m].max() > 0.8 and (dark | ~op)[ring].mean() >= 0.6:
            spark |= m
    if not spark.any():
        return img, 0
    rest = op & ~dark & ~spark
    ring = _grow(spark) & dark & ~_grow(rest)
    out = img.copy()
    out[spark | ring] = 0
    return out, int(spark.sum())


def to_rgba(idx):
    out = np.zeros(idx.shape + (4,), np.uint8)
    a = idx >= 0
    out[a, :3] = P_RGB[idx[a]]
    out[a, 3] = 255
    return out


VEIL = ('stone-3', 0.25)


def veil(rgba, colour=VEIL[0], alpha=VEIL[1]):
    """The wall veil: every wall pixel moves a quarter of the way to stone-3.
    Back walls are drawn in plain master colours and shown through this veil, which makes them
    quieter, a little darker and cooler than the props in front. Each master colour has exactly
    one veiled twin, so a veiled wall still holds at most as many colours as before."""
    c = P_RGB[P_NAMES.index(colour)].astype(np.float64)
    out = rgba.copy()
    out[..., :3] = np.round((1 - alpha) * rgba[..., :3].astype(np.float64) + alpha * c).astype(np.uint8)
    out[rgba[..., 3] == 0] = 0
    return out


def save(idx, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(to_rgba(idx), 'RGBA').save(path)


def used(idxs):
    if not isinstance(idxs, (list, tuple)):
        idxs = [idxs]
    allv = np.concatenate([i[i >= 0] for i in idxs])
    return sorted(set(P_NAMES[i] for i in np.unique(allv)))


BG = (60, 52, 78)


def _tile(img_rgba, p):
    o = np.zeros(img_rgba.shape[:2] + (3,), np.uint8)
    o[:] = BG
    m = img_rgba[..., 3] == 255
    o[m] = img_rgba[m][:, :3]
    return np.repeat(np.repeat(o, p, 0), p, 1)


def sheet(pairs, cols, p, path):
    """Contact sheet: raw on the left, cleaned on the right. pairs = [(raw rgba, index image)]."""
    hh = max(a.shape[0] for a, _ in pairs)
    ww = max(a.shape[1] for a, _ in pairs)
    rows = (len(pairs) + cols - 1) // cols
    gap = 4

    def grid(sel):
        g = np.zeros((rows * (hh + gap) * p, cols * (ww + gap) * p, 3), np.uint8)
        g[:] = BG
        for i, pr in enumerate(pairs):
            t = _tile(sel(pr), p)
            y, x = (i // cols) * (hh + gap) * p, (i % cols) * (ww + gap) * p
            g[y:y + t.shape[0], x:x + t.shape[1]] = t
        return g
    left = grid(lambda pr: pr[0])
    right = grid(lambda pr: to_rgba(pr[1]))
    bar = np.full((left.shape[0], 6, 3), 255, np.uint8)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(np.concatenate([left, bar, right], 1)).save(path)


def _resize_rows(img, n_out):
    """Change the row count of an RGBA pixel-art image by dropping or doubling whole rows.
    The rows are spread evenly over the image; inside each stretch the row chosen is the one that changes
    least (a row equal to a neighbour can go without losing anything). Two neighbouring rows are never
    both dropped, so a line two pixels thick keeps at least one pixel."""
    n_in = img.shape[0]
    k = abs(n_out - n_in)
    if k == 0:
        return img
    prev = np.concatenate([img[:1], img[:-1]])
    nxt = np.concatenate([img[1:], img[-1:]])
    dp = (img != prev).any(-1)
    dn = (img != nxt).any(-1)
    # dropping a row loses the pixels that differ from both neighbours; doubling one shows where it differs
    cost = (dp & dn).sum(1) * 4.0 + (dp | dn).sum(1) if n_out < n_in else (dp | dn).sum(1) * 1.0
    edges = np.linspace(0, n_in, k + 1)
    pick = []
    for j in range(k):
        lo, hi = int(round(edges[j])), int(round(edges[j + 1]))
        cand = [i for i in range(lo, max(hi, lo + 1)) if i < n_in and (not pick or i > pick[-1] + 1)]
        if not cand:
            cand = [min(n_in - 1, pick[-1] + 2)]
        mid = (lo + hi - 1) / 2
        pick.append(min(cand, key=lambda i: (cost[i], abs(i - mid))))
    if n_out < n_in:
        keep = np.ones(n_in, bool)
        keep[pick] = False
        return img[keep]
    return np.repeat(img, np.bincount(pick, minlength=n_in) + 1, axis=0)


def fit_pixels(img, w, h):
    """Bring an RGBA pixel-art image to w x h by dropping or doubling whole rows and columns (never blending).
    Used where ChatGPT drew at a finer pixel than the game grid: shapes move by one pixel at most."""
    out = _resize_rows(img, h)
    out = _resize_rows(out.transpose(1, 0, 2), w).transpose(1, 0, 2)
    return np.ascontiguousarray(out)
