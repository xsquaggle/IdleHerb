"""Make a zoomed montage of part files. Usage: zoom_parts.py OUT.png SCALE_NATIVE ZOOM file1 file2 ..."""
import sys
import numpy as np
from PIL import Image
out, s, z = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
tiles = []
for f in sys.argv[4:]:
    im = np.array(Image.open(f).convert('RGBA'))
    nat = im[::s, ::s]
    a = nat[..., 3] > 0
    ys, xs = np.where(a)
    nat = nat[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    bg = np.zeros(nat.shape[:2] + (3,), np.uint8); bg[:] = (96, 88, 110)
    m = nat[..., 3] > 0
    bg[m] = nat[m][:, :3]
    tiles.append(np.repeat(np.repeat(bg, z, 0), z, 1))
    print(f.split('/')[-1], nat.shape[1], 'x', nat.shape[0])
H = max(t.shape[0] for t in tiles)
row = []
for t in tiles:
    pad = np.zeros((H, t.shape[1] + 12, 3), np.uint8); pad[:] = (40, 36, 50)
    pad[H - t.shape[0]:, 6:6 + t.shape[1]] = t
    row.append(pad)
Image.fromarray(np.concatenate(row, 1)).save(out)
