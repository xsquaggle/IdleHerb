# Sprout Tower game sprites

True-size sprites on the 640×360 art-pixel grid, in the 76-colour master palette. Rules are in [docs/art/STYLE_BIBLE.md](../docs/art/STYLE_BIBLE.md).

Everything here comes from Asset Batch 1 (17 of its 18 images; its manager image was replaced by Batch 2 round 8) and Asset Batch 2 (prompts 1 to 23, plus the first two manager sheets of round 8). All of it is at the **automatic pass** stage.

| Folder | Contents |
|---|---|
| `walls/` | All ten World 1 back walls, 336×104, floors 1 to 10, in plain master colours. `walls/veiled/` holds each wall as the game shows it. `walls.json` lists floors, open-sky walls and the veil |
| `props/floor03_hemp_patch/` | Seven props for the Backyard Hemp Patch. `floor.json` gives each prop's place on the 360×120 floor |
| `props/floor08_ropewalk/` | Five props for the Ropewalk and Twine Shop, with `floor.json` |
| `props/floor09_soap_workshop/` | Five props for the Soap and Scent Workshop (kettle and stove, mould table, drying rack, lotion shelf, the manager's stool and side table), with `floor.json` |
| `props/harvest/` | Tied sheaf, stook, drying rack and combed fibre |
| `plants/` | Fibre hemp in five growth stages (32×96), Seed Hemp, staked Longstalk Hemp, the Giant Show-Hemp cane in three stacking pieces, and basil, rosemary, lavender, thyme, sage and chamomile in five stages each (72×90), all in the one shared planter. `plants/herb_layers/` holds the planter and each foliage layer on its own. `plants.json` gives anchors, layer offsets and the cane stacking |
| `actors/w1_floor01_gardener/`, `…floor02…`, `…floor03…` | The lead workers of floors 1 to 3: nine 80×80 frames each (idle, blink, cheer, three walk frames, two work frames, carry). `layers/` holds the shared head, blink patch, body layers and props. `frames.json` gives the frame list, head offsets and the layer recipe |
| `actors/floor08_ropewalk/` | The two ropewalk workers, one standing pose each |
| `actors/w1_floor04_worker1/` to `…floor10_worker1/` | Batch 2 workers: two per floor for floors 4 to 9 and the HQ clerk of floor 10. Nine 80×80 frames each, in the same order as the gardeners. `frames.json` names the person, the source sheet and the feet line |
| `actors/w1_floor01_worker2/`, `…floor02…`, `…floor03…` | The second worker of floors 1 to 3, same layout |
| `actors/w1_floor01_manager/` to `…floor06_manager/` | The fixed managers of floors 1 to 6 (Nana Sprig, Basil Brumble, Rowan Rake, Posy Seedwell, Fern Petrie, Juniper Jones): four 96×96 frames each (stand, work, cheer, big moment), feet on y 92. `frames.json` names the person, design id, rarity and floor. Floors 7 to 10 follow when their redrawn sheets come back |
| `visitors/` | The six visitors in two-frame loops, 32×32: Golden Sprout, Sunbeam Sprout, Tap Storm Sprout, Dewdrop, Mystery Crate, Busy Bee. `visitors.json` gives the frames and pivots |
| `story/pip/` | Pip, the sprout helper: nine 48×48 poses (smile, blink, talk, wave, jump, surprised, thinking, sad, peek). `layers/` and `pip.json` hold the parts |
| `chests/` | All six chest tiers, 96×80. Wooden Crate (`common`) and Golden Chest (`legendary`) from Batch 1: one base, four lids and a crack shadow each. Copper, Silver, Crystal and Starlight from Batch 2: a base and a lid for each of the four steps. `chests.json` gives the draw order and maps the design ids (`chest.copper` and so on) to these names. `frames/` holds the four composed frames of each chest |
| `cards/frames/` | The six large card frames, 180×240, Common to Exotic. The picture window is transparent. `frames.json` gives each window and where the 108×100 card picture goes. Two free slots for Mythic and Godly |
| `icons/rarity/` | The six rarity emblems, 48×48. `rarity.json` gives the order and the two free slots |
| `effects/reveal/` | One burst per rarity, four frames each (start, expand, peak, scatter), 48×48 with the origin at the centre. `bursts.json` lists them. Played at the Burst beat of the reveal ladder (style bible section 19) |
| `cards/plants/` | 19 card pictures, 108×100: the six hemp cards and 13 World 1 herbs. `cards.json` gives each picture's plant id and rarity |
| `icons/seeds/` | Four hemp seed packets, two seed jars, scoop and sack, 48×48 |
| `icons/products/` | Twelve hemp product icons, 48×48 |
| `icons/currency/` | Six currency icons, 48×48: Insight, Pollen, Skill Points, Shells, Snowmarks, Fair Tickets. Coins, Notes, Gems, Compost and Ribbons come from B12 later |
| `icons/ui/` | 24 menu and stat icons at 32 pixels. The 24 and 16 pixel files are stand-ins until those sizes are redrawn by hand |

**Automatic pass** means the sprite has the right size, only master palette colours, a colour count within budget, on-or-off transparency and an ink outline. It still needs the hand polish and the Gate B review from the style bible before it counts as final. It is good enough to build and test the game with.

## Three things the engine needs to know

- **The wall veil.** Back walls are drawn in plain master colours and shown a quarter of the way toward `stone-3` (`#6B5F87`). That is what keeps a wall quieter, darker and cooler than the props in front of it. Use the files in `walls/veiled/`, or apply the same blend to the plain files. The veil is the only place where a drawn pixel is not a master colour.
- **Open-sky walls.** The backyard and market walls are transparent above the hedge and the stone wall. The world's sky shows through.
- **Worker frames are flip-book frames and a rig at once.** The nine frames can be played as they are. The layers rebuild every frame from one shared head, a body per pose and a prop, by the recipe in `frames.json`.

## Where it came from

The raw sheets are in project files under `art/batch01/round1_raw/` to `round6_raw/` and `art/batch02/raw_prompts07_17/`. The passes are `docs/art/tools/clean_batch01_round4.py` (round 4), `docs/art/tools/clean_batch01_parts.py` (all other Batch 1 rounds) and `docs/art/tools/clean_batch02.py`, and the before/after sheets are in `docs/art/cleanup/`.

Still to make by hand: one fixed head per character from the Face Kit, the 24 and 16 pixel icons, and the polish items listed in `docs/art/HANDOFF.md`.
