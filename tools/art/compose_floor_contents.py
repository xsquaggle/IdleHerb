"""Floor contents layers for the World 1 floors whose props were cleaned piece by piece
(floors 3, 8 and 9 in art/props/), in the same 360x120 form that cut_v2_floors.py writes
for the others. Pieces marked as actors are left out: the game draws the animated workers.
Each floor.json has its own ground line; every floor is moved so its feet sit on y 112.

Usage: python3 -I tools/art/compose_floor_contents.py ART_DIR
"""
import sys, os, json
from PIL import Image

FLOORS = {3: 'floor03_hemp_patch', 8: 'floor08_ropewalk', 9: 'floor09_soap_workshop'}
FLOOR_LINE = 112


def main():
    art = sys.argv[1]
    for n, folder in FLOORS.items():
        d = json.load(open(os.path.join(art, 'props', folder, 'floor.json')))
        dy = FLOOR_LINE - d.get('baseline_y', FLOOR_LINE)
        out = Image.new('RGBA', (360, 120), (0, 0, 0, 0))
        for name, p in d['parts'].items():
            if p.get('cls') == 'actor':
                continue
            im = Image.open(os.path.join(art, 'props', folder, p['file'])).convert('RGBA')
            x, y = p['origin_on_floor']
            out.alpha_composite(im, (x, y + dy))
        path = os.path.join(art, 'floors', 'w1', 'floor%02d_contents_360x120.png' % n)
        out.save(path)
        print('wrote', path, 'moved down', dy)


if __name__ == '__main__':
    main()
