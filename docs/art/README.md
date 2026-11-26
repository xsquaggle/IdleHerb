# Sprout Tower art direction

Everything about how the game looks lives here.

| Read this | When |
|---|---|
| [STYLE_BIBLE.md](STYLE_BIBLE.md) | Always first. The look, the pixel grid, the palette, the UI, the rules, the checklists |
| [HEMP_ART.md](HEMP_ART.md) | Before drawing, prompting or reviewing anything with hemp in it |
| [CLEANUP_ROUTE.md](CLEANUP_ROUTE.md) | To turn a generated image into a game sprite. Includes the before/after proof |
| [ASSET_BATCH_01.md](ASSET_BATCH_01.md) | The first 18 image prompts, ready to paste into ChatGPT |
| [BATCH_PLAN.md](BATCH_PLAN.md) | To see which later batch makes which art, up to a four-world launch |
| [HANDOFF.md](HANDOFF.md) | To pick the art work up where it stopped: done, next steps, open questions |

## Folders

| Folder | Contents |
|---|---|
| `palette/` | The locked 76-colour master palette as a labelled sheet, `.hex`, `.gpl` and `.json` |
| `cleanup/` | Before/after figures and true-size cleaned sprites from the proof |
| `hemp/` | The hemp silhouette chart |
| `boards/` | Do and don't boards built from the reference packs |
| `tools/` | `build_asset_batch_01.py` (writes the batch file so every prompt carries the identical style suffix), `cleanlib.py` with `clean_batch01_parts.py` and `clean_batch01_round4.py` (the automatic pass that made the sprites in `art/`), `cleanup_prototype.py` (the first clean-up proof), and three small helpers: `zoom_parts.py` (enlarged review sheet), `veil_fit.py` (how the wall veil was measured) and `mock_floor03.py` (the floor 3 mock-up) |

## The short version

- HD pixel art, warm golden hour, cozy purples and greens, chunky cheerful characters.
- One 640×360 art-pixel grid, scaled by whole numbers. One 76-colour palette. Hard edges only.
- Rooms are built from separate parts so everything can move.
- Hemp is a tall cane crop that becomes rope, cloth, paper and building blocks. The only plant emblem is the two-leaf sprout.

## Where images live

Raw generated images and the reference packs stay in project files, not in git. Cleaned game sprites live in the repo under [`art/`](../../art/README.md).
