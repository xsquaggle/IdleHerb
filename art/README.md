# Sprout Tower game sprites

True-size sprites on the 640×360 art-pixel grid, in the 76-colour master palette. Rules are in [docs/art/STYLE_BIBLE.md](../docs/art/STYLE_BIBLE.md).

Everything here comes from Asset Batch 1 (17 of its 18 images; the manager image is on hold). All of it is at the **automatic pass** stage.

| Folder | Contents |
|---|---|
| `walls/` | Eight World 1 back walls, 336×104, floors 1 to 8, in plain master colours. `walls/veiled/` holds each wall as the game shows it. `walls.json` lists floors, open-sky walls and the veil |
| `props/floor03_hemp_patch/` | Seven props for the Backyard Hemp Patch. `floor.json` gives each prop's place on the 360×120 floor |
| `props/floor08_ropewalk/` | Five props for the Ropewalk and Twine Shop, with `floor.json` |
| `props/harvest/` | Tied sheaf, stook, drying rack and combed fibre |
| `plants/` | Fibre hemp in five growth stages (32×96), Seed Hemp, staked Longstalk Hemp, the Giant Show-Hemp cane in three stacking pieces, and basil, rosemary and lavender in five stages each (72×90). `plants/herb_layers/` holds the planter and each foliage layer on its own. `plants.json` gives anchors, layer offsets and the cane stacking |
| `actors/w1_floor01_gardener/`, `…floor02…`, `…floor03…` | The lead workers of floors 1 to 3: nine 80×80 frames each (idle, blink, cheer, three walk frames, two work frames, carry). `layers/` holds the shared head, blink patch, body layers and props. `frames.json` gives the frame list, head offsets and the layer recipe |
| `actors/floor08_ropewalk/` | The two ropewalk workers, one standing pose each |
| `chests/` | Common and Legendary chest: one base, four lids and a crack shadow each, 96×80. `chests.json` gives the draw order. `frames/` holds the four composed frames of each chest |
| `cards/plants/` | The six hemp card pictures, 108×100 |
| `icons/seeds/` | Four hemp seed packets, two seed jars, scoop and sack, 48×48 |
| `icons/products/` | Twelve hemp product icons, 48×48 |
| `icons/ui/` | 24 menu and stat icons at 32 pixels. The 24 and 16 pixel files are stand-ins until those sizes are redrawn by hand |

**Automatic pass** means the sprite has the right size, only master palette colours, a colour count within budget, on-or-off transparency and an ink outline. It still needs the hand polish and the Gate B review from the style bible before it counts as final. It is good enough to build and test the game with.

## Three things the engine needs to know

- **The wall veil.** Back walls are drawn in plain master colours and shown a quarter of the way toward `stone-3` (`#6B5F87`). That is what keeps a wall quieter, darker and cooler than the props in front of it. Use the files in `walls/veiled/`, or apply the same blend to the plain files. The veil is the only place where a drawn pixel is not a master colour.
- **Open-sky walls.** The backyard and market walls are transparent above the hedge and the stone wall. The world's sky shows through.
- **Worker frames are flip-book frames and a rig at once.** The nine frames can be played as they are. The layers rebuild every frame from one shared head, a body per pose and a prop, by the recipe in `frames.json`.

## Where it came from

The raw sheets are in project files under `art/batch01/round1_raw/` to `round6_raw/`. The passes are `docs/art/tools/clean_batch01_round4.py` (round 4) and `docs/art/tools/clean_batch01_parts.py` (all other rounds), and the before/after sheets are in `docs/art/cleanup/`.

Still to make by hand: one fixed head per character from the Face Kit, the 24 and 16 pixel icons, and the polish items listed in `docs/art/HANDOFF.md`.
