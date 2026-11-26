# Sprout Tower game sprites

True-size sprites on the 640×360 art-pixel grid, in the 76-colour master palette. Rules are in [docs/art/STYLE_BIBLE.md](../docs/art/STYLE_BIBLE.md).

| Folder | Contents | State |
|---|---|---|
| `chests/` | Common and Legendary chest: one base, four lids and a crack shadow each, 96×80. `chests.json` gives the draw order. `frames/` holds the four composed frames of each chest | Automatic pass |
| `cards/plants/` | The six hemp card pictures, 108×100 | Automatic pass |
| `icons/seeds/` | Four hemp seed packets, two seed jars, scoop and sack, 48×48 | Automatic pass |
| `icons/products/` | Twelve hemp product icons, 48×48 | Automatic pass |

**Automatic pass** means the sprite has the right size, only master palette colours, a colour count within budget, on-or-off transparency and a rebuilt ink outline. It still needs the hand polish and the Gate B review from the style bible before it counts as final. It is good enough to build and test the game with.

Source: Asset Batch 1, round 4 (prompts 11 to 14). The raw sheets are in project files under `art/batch01/round4_raw/`. The pass is `docs/art/tools/clean_batch01_round4.py`, and before/after sheets are in `docs/art/cleanup/batch01_round4/`.

Still to make by hand: 32 and 16 pixel versions of the icons.
