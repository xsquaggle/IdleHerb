"""Hand-pixelled HUD icons for the game client (style bible 16 and 17).

Coins, Gems and Compost come from B12 and are still to be cleaned (art/icons/currency/currency.json),
so the game ships these small hand-drawn versions at 16 and 10 pixels until then. Each icon is one
object from slightly above, a 1 pixel ink outline, three tones and one accent, in master palette colours.

Run: python3 -I tools/art/draw_ui_icons.py art
Writes art/ui/*.png.
"""
import sys
from pathlib import Path
from PIL import Image

PAL = {
    '.': None,
    'k': '#1A1024',  # ink-1
    'K': '#2C1D3A',  # ink-2
    'g': '#B9781A',  # gold-2
    'G': '#EBA92B',  # gold-3
    'y': '#FFD447',  # gold-4
    'Y': '#FFF19C',  # gold-5
    'o': '#7A4A12',  # gold-1
    't': '#178688',  # teal-2
    'T': '#3BBFB1',  # teal-3
    'u': '#98E8D6',  # teal-4
    'n': '#0D4F5C',  # teal-1
    'w': '#FFFBEF',  # white
    'b': '#5E2C2A',  # wood-2
    'B': '#8C4426',  # wood-3
    'r': '#3B1D29',  # wood-1
    'c': '#BC642B',  # wood-4
    'l': '#35853A',  # leaf-3
    'L': '#6BB536',  # leaf-4
    'e': '#B2D838',  # leaf-5
    'd': '#1D5A38',  # leaf-2
    'p': '#8F68DA',  # lavender-4
    'P': '#BB99F0',  # lavender-5
    'v': '#6746AE',  # lavender-3
}

ICONS = {
    # A gold coin with the two-leaf sprout pressed into it.
    'coin_16': """
.....kkkkkk.....
...kkyyyyyykk...
..kyyYYyyyyGGk..
.kyYYyyyyyyGGgk.
.kyYyyygyGyyGgk.
kyYyyyyggGyyGGgk
kyyyGgyygyyyGGgk
kyyyGggygyGgGGgk
kyyyyGggggGgGGgk
kyyyyyygyyyyGGgk
kyGyyyygyyyyGggk
.kGGyyyyyyyGGgk.
.kgGGGyyyGGGggk.
..kggGGGGGgggk..
...kkggggggkk...
.....kkkkkk.....
""",
    'coin_10': """
...kkkk...
.kkyyyGkk.
.kyYyyyGk.
kyYyGyyGgk
kyyGgGyGgk
kyyyGyyGgk
kyGyyyGGgk
.kgGGGGgk.
.kkggggkk.
...kkkk...
""",
    # A cut gem in teal, the premium currency.
    'gem_16': """
................
....kkkkkkkk....
...kuuwuTTTTk...
..kuuwuTTTttTk..
.kuwwuTTTTtttTk.
kkkkkkkkkkkkkkkk
kuuuTTTTTTTtttnk
.kuTTTTTTTttttk.
..kTTTTTTtttnk..
...kTTTTTtttk...
....kTTTttnk....
.....kTTtnk.....
......kTnk......
.......kk.......
................
................
""",
    'gem_10': """
..kkkkkk..
.kuwuTTtk.
kkkkkkkkkk
kuTTTTttnk
.kTTTttnk.
..kTTtnk..
...kTnk...
....kk....
..........
..........
""",
    # A heap of rich compost with a sprout on top.
    'compost_16': """
.......kk.......
......kLek......
....kkkLLkkk....
...kekklkkLek...
...kLLdlkLLdk...
....kkklkkkk....
.....kkBkk......
...kkcBBBckk....
..kcBBbBBBBck...
.kcBbBBBbBBBck..
.kBBBbBBBBbBBk..
kcBbBBBbBBBbBBk.
kBBBBbBBBBBBbBk.
kbBBBBBBbBBBBbk.
.kbbbbbbbbbbbk..
..kkkkkkkkkkk...
""",
    'compost_10': """
....kk....
...kLek...
..kkdlkk..
...kkBk...
..kcBBBk..
.kcBbBBck.
kBBBBbBBk.
kbBBBBBbk.
.kkkkkkk..
..........
""",
    # A small chest for the bottom bar.
    'chest_16': """
................
................
...kkkkkkkkkk...
..kcccccccccck..
.kcyyBBBBBByyck.
.kcyBBBBBBBByck.
.kkkkkkkkkkkkkk.
.kcyBBBkykBBycK.
.kcyBBBkYkBBycK.
.kcyBBBBkBBBycK.
.kcyBBBBBBBBycK.
.kbyybbbbbbyybk.
.kkkkkkkkkkkkkk.
................
................
................
""",
}


def draw(spec: str) -> Image.Image:
    rows = [r for r in spec.strip('\n').split('\n')]
    h = len(rows)
    w = max(len(r) for r in rows)
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            col = PAL.get(ch)
            if col:
                img.putpixel((x, y), tuple(int(col[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return img


def main() -> None:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else 'art') / 'ui'
    out.mkdir(parents=True, exist_ok=True)
    for name, spec in ICONS.items():
        draw(spec).save(out / f'{name}.png')
    print(f'wrote {len(ICONS)} icons to {out}')


if __name__ == '__main__':
    main()
