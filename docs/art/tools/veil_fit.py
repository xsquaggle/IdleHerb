"""Fit the wall veil: raw ~ (1-a)*snapped + a*c over all wall pixels. Then write a raw | snapped | veiled sheet.

Usage: veil_fit.py ALPHA,#RRGGBB OUT.png RAW1.png CLEAN1.png [RAW2.png CLEAN2.png ...]
ALPHA and the colour are the veil to preview (the bible uses 0.25 and stone-3, #6B5F87). RAW files are true-size walls.
"""
import sys, glob, os
import numpy as np
from PIL import Image
pairs = []
for raw, cl in zip(sys.argv[3::2], sys.argv[4::2]):
    r = np.array(Image.open(raw).convert('RGBA')); c = np.array(Image.open(cl).convert('RGBA'))
    pairs.append((r, c))
R = np.concatenate([r[r[..., 3] == 255][:, :3] for r, c in pairs]).astype(float)
S = np.concatenate([c[r[..., 3] == 255][:, :3] for r, c in pairs]).astype(float)
# shared slope m, per-channel offset b
Sm, Rm = S.mean(0), R.mean(0)
m = ((S - Sm) * (R - Rm)).sum() / ((S - Sm) ** 2).sum()
b = Rm - m * Sm
a = 1 - m
c = b / a
print('slope %.3f  veil alpha %.3f  veil colour #%02x%02x%02x' % (m, a, *np.clip(c, 0, 255).astype(int)))
va = float(sys.argv[1].split(',')[0]); vc = np.array([int(sys.argv[1].split(',')[1][i:i + 2], 16) for i in (1, 3, 5)], float)
rows = []
for r, cimg in pairs:
    v = cimg.copy().astype(float)
    v[..., :3] = (1 - va) * v[..., :3] + va * vc
    v = v.round().astype(np.uint8)
    def bg(x):
        o = np.zeros(x.shape[:2] + (3,), np.uint8); o[:] = (255, 190, 120)
        mk = x[..., 3] == 255; o[mk] = x[mk][:, :3]; return o
    gap = np.full((r.shape[0], 4, 3), 255, np.uint8)
    rows.append(np.concatenate([bg(r), gap, bg(cimg), gap, bg(v)], 1))
    rows.append(np.full((4, rows[-1].shape[1], 3), 255, np.uint8))
img = np.concatenate(rows, 0)
Image.fromarray(img).save(sys.argv[2]); print(img.shape)
