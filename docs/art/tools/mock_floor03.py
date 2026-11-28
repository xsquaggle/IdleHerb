"""Mock-up: the Backyard Hemp Patch put together from cleaned Batch 1 sprites. Not a game screen.

Usage: mock_floor03.py REPO_ART_DIR OUT.png   (writes docs/art/cleanup/batch01_floor03_mockup.png at 4x)
"""
import sys, json
from PIL import Image
A = sys.argv[1]            # repo art/ folder
OUT = sys.argv[2]
def im(rel): return Image.open(A + '/' + rel).convert('RGBA')
W, H, G = 360, 120, 108    # floor module and ground line
scene = Image.new('RGBA', (W, H), (0xF7, 0xBC, 0x66, 255))
# flat sky bands, golden hour
for y0, y1, c in ((0, 22, (0xBB, 0x99, 0xF0)), (22, 40, (0xFF, 0xC2, 0xDC)), (40, 60, (0xF9, 0xAA, 0x6E)), (60, 120, (0xF7, 0xBC, 0x66))):
    scene.paste(Image.new('RGBA', (W, y1 - y0), c + (255,)), (0, y0))
wall = im('walls/veiled/w1_floor03_backyard_336x104.png')
scene.alpha_composite(wall, (12, G + 4 - 104))
def put(rel, x, bottom=G):
    s = im(rel); scene.alpha_composite(s, (x, bottom - s.size[1]))
P = 'props/floor03_hemp_patch/'
put(P + 'scarecrow_fence_46x56.png', 6)
put(P + 'loaded_wheelbarrow_44x37.png', 58)
for x, st in ((118, 'plants/hemp_fibre_5_harvest_ready_32x96.png'), (150, 'plants/hemp_fibre_4_tall_32x96.png'), (182, 'plants/hemp_fibre_5_harvest_ready_32x96.png')):
    put(st, x, G - 8)
put(P + 'empty_raised_bed_116x18.png', 108)
w = im('actors/w1_floor03_gardener/09_carry_sheaf_80x80.png')
scene.alpha_composite(w, (212, G - 76))
put(P + 'barrel_and_watering_can_34x24.png', 292)
put(P + 'stool_crate_and_bell_31x23.png', 327)
# floor beam
scene.paste(Image.new('RGBA', (W, H - G), (0x8C, 0x44, 0x26, 255)), (0, G))
scene.paste(Image.new('RGBA', (W, 1), (0x1A, 0x10, 0x24, 255)), (0, G))
scene.paste(Image.new('RGBA', (W, 2), (0xBC, 0x64, 0x2B, 255)), (0, G + 1))
scene.convert('RGB').resize((W * 4, H * 4), Image.NEAREST).save(OUT)
