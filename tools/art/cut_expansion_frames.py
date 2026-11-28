"""Tower frame pieces and World 1 background layers for the Phase 1 slice, cut from the
expansion pack with the automatic pass (shrink to the grid, snap to the master palette).
Stand-ins until the Art Director's hand pass; the sources are named in each output's json.

Usage: python3 -I tools/art/cut_expansion_frames.py EXPANSION_DIR ART_DIR
"""
import sys, os, json
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'docs', 'art', 'tools'))
import cleanlib as cl  # noqa: E402


def hard(path):
    im = np.array(Image.open(path).convert('RGBA'))
    im[..., 3] = np.where(im[..., 3] >= 128, 255, 0)
    im[im[..., 3] == 0, :3] = 0
    return im


def crop_alpha(im):
    ys, xs = np.nonzero(im[..., 3])
    return im[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def to_grid(im, w, h):
    small = cl.shrink_pixels(im, w, h)
    idx, _ = cl.snap(small, cl.RAMPS)
    return idx


def bands(im, min_gap=6):
    """Row ranges that hold opaque pixels, split at fully transparent gaps."""
    rows = im[..., 3].any(1)
    out, start, gap = [], None, 0
    for y, r in enumerate(rows):
        if r:
            if start is None:
                start = y
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                out.append((start, y - gap + 1))
                start, gap = None, 0
    if start is not None:
        out.append((start, len(rows)))
    return out


def main():
    src, art = sys.argv[1], sys.argv[2]
    made = {}
    # Floor module overlays: exact 6x of the 360x120 module.
    for name, f in (('shell', 'B4_floor_frame_shell.png'), ('shutter', 'B4_floor_locked_shutter.png'),
                    ('construction', 'B4_floor_under_construction.png')):
        idx = to_grid(hard(os.path.join(src, f)), 360, 120)
        p = os.path.join(art, 'floors', '%s_360x120.png' % name)
        cl.save(idx, p)
        made[name] = dict(file=os.path.relpath(p, art), source=f)
    # Tower roof and entrance (B20): roof 376 wide over the 360 tower, entrance one module wide.
    b20 = hard(os.path.join(src, 'B20_tower_parts.png'))
    H, W = b20.shape[:2]
    for name, box, width in (('roof', (0, 0, W // 2, H // 2), 376), ('entrance', (W // 2, 0, W, H // 2), 360)):
        x0, y0, x1, y1 = box
        part = crop_alpha(b20[y0:y1, x0:x1])
        h = round(part.shape[0] * width / part.shape[1])
        idx = to_grid(part, width, h)
        p = os.path.join(art, 'tower', 'w1_%s_%dx%d.png' % (name, width, h))
        cl.save(idx, p)
        made[name] = dict(file=os.path.relpath(p, art), size=[width, h], source='B20_tower_parts.png')
    # World 1 background (B26): the painted sky band is skipped (the game draws flat bands, bible 14).
    b26 = hard(os.path.join(src, 'B26_world1_parallax_layers.png'))
    names = ['sky_painted', 'far_hills_lake', 'town_street', 'foreground_street']
    layers = {}
    for name, (y0, y1) in zip(names, bands(b26)):
        if name == 'sky_painted':
            continue
        part = b26[y0:y1]
        h = round(part.shape[0] * 640 / part.shape[1])
        idx = to_grid(part, 640, h)
        p = os.path.join(art, 'backgrounds', 'w1', '%s_640x%d.png' % (name, h))
        cl.save(idx, p)
        layers[name] = dict(file=os.path.relpath(p, art), size=[640, h], source_rows=[int(y0), int(y1)])
    made['backgrounds'] = layers
    json.dump(made, open(os.path.join(art, 'tower', 'frames.json'), 'w'), indent=1)
    print(json.dumps(made, indent=1))


if __name__ == '__main__':
    main()
