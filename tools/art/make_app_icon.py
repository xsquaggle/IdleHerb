"""Makes the Windows app icon from Pip's smile pose (art/story/pip/01_smile_48x48.png).

Sizes that fit the trimmed sprite (28x40) at least once are whole-number
nearest-neighbour scales, so the pixels stay square. The 16, 24 and 32 pixel
sizes are smaller than the sprite and are smoothly scaled down, keeping its shape.

Run from the repository root:
    python3 -I tools/art/make_app_icon.py art apps/desktop/build
"""
import sys
from pathlib import Path

from PIL import Image


def main(art: Path, out: Path) -> None:
    pip = Image.open(art / 'story' / 'pip' / '01_smile_48x48.png').convert('RGBA')
    box = pip.getbbox() or (0, 0, 48, 48)
    sprite = pip.crop(box)
    out.mkdir(parents=True, exist_ok=True)

    def fit(size: int) -> Image.Image:
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        w, h = sprite.size
        k = max(1, min(size // w, size // h))
        img = sprite.resize((w * k, h * k), Image.NEAREST)
        if img.width > size or img.height > size:
            f = size / max(w, h)
            img = sprite.resize((max(1, round(w * f)), max(1, round(h * f))), Image.LANCZOS)
        canvas.alpha_composite(img, ((size - img.width) // 2, (size - img.height) // 2))
        return canvas

    big = fit(256)
    big.save(out / 'icon.png')
    sizes = [256, 128, 64, 48, 32, 24, 16]
    frames = [fit(s) for s in sizes]
    frames[0].save(out / 'icon.ico', sizes=[(s, s) for s in sizes], append_images=frames[1:])
    print(f'wrote {out / "icon.png"} and {out / "icon.ico"} from a {sprite.width}x{sprite.height} sprite')


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
