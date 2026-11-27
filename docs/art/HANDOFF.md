# Art Director handoff

Kept current so that work can stop at any moment and resume cleanly. Last update: 2026-11-27, about 7:30 AM (US Eastern).

## Start here if you are a new thread

On 2026-11-26 Lawson asked whether to hand everything to the coordinator for an audit and resume in a new thread with fresh context. The first Art Director thread said yes: Batch 1 is finished, nothing is half-done, and everything a new thread needs is in the repo, in the project files or in project memory. Nothing lives only in the old thread.

**Update, 10:15 AM the same day:** the model chosen for audits ran out of usage, so the audit of PR #2 could not run yet. Lawson asked to move on and audit later. The same thread wrote all of Batch 2 (see Done). The coordinator was told; the later audit should cover PR #2 including Batch 2.

**Update, 11:40 AM:** Batch 2 prompts 7 to 17 are back, passed and cleaned (see Done).

**Update, 12:20 PM:** prompts 2 to 6 are back, passed and cleaned too. Only prompt 1 (visitors) is still owed. Lawson also asked for rarity reveals that build up more the rarer the item is, and for two more tiers (Mythic, Godly) above Exotic; the tier count went to the Game Designer through the coordinator (see Open questions).

**Update, 8:45 PM:** round 7 (the rarity reveal kit, prompts 18 to 23) is back, passed and cleaned. Design 0.3 (PR #5) has merged into `main`, so the manager round was written right after as Batch 2, round 8 (prompts 24 to 27, all ten World 1 managers), and sent to Lawson as a master file.

**Update, 10:30 PM:** round 8 came back at 9:59 PM in one zip. Sheets 24 and 25 (floors 1 to 6) passed and are cleaned. Sheets 26 and 27 (floors 7 to 10) drew everyone about 40% too big, and Old Moss held his cup at his mouth in pose 4, so Lawson was asked to redo those two (the paste text is in the round 8 entry under Done).

**Update, 10:40 PM:** the redo of sheet 26 came back at 10:26 PM at the right size, with Old Moss offering his cup forward. It passed and is cleaned: managers of floors 1 to 8 are done. Only sheet 27 (Clementine Zest, Granny Evergreen) is still owed.

**Update, 10:50 PM:** the redo of sheet 27 came back at 10:39 PM, passed and is cleaned. **Batch 2 is finished: all 27 images are back and cleaned, and all ten World 1 managers are in `art/actors/`.**

**Update, 11 PM:** Batch 3 (Loomington rooms and collection, 17 prompts) is written as [`ASSET_BATCH_03.md`](ASSET_BATCH_03.md) by `tools/build_asset_batch_03.py` and sent to Lawson as one master file plus a reference zip (project files `art/batch03/master/Sprout_Tower_Batch3_Master.md` and `Sprout_Tower_Batch3_References.zip`, made by the new general `tools/build_master.py`).

**Update, 11:05 PM: this thread stops here.** Lawson asked for a fresh thread and a check of all work against the roadmap. The coordinator is doing that check, and Batch 3 continues in a new Art Director thread. State at the stop:

- **PR #2 is open, not yet merged and not yet audited.** Branch `claude/project-thread-xt8mqt`, head commit `aa44977` or later. It holds the style bible v1.5, hemp art rules, clean-up route, batch plan, the Batch 1, 2 and 3 prompt files and builders, the clean-up tools, and every cleaned sprite of Batches 1 and 2 under `art/`. The fresh-eyes Fable audit of PR #2 has waited since Batch 1 and should cover all of this.
- **Batch 1:** 17 of 18 back and cleaned; prompt 18 replaced by Batch 2 round 8.
- **Batch 2:** all 27 back and cleaned, including the ten World 1 managers (96×96 frames, feet on y 92).
- **Batch 3:** written and sent to Lawson at about 10:50 PM as a master file plus reference zip (project files `art/batch03/master/`). Nothing has come back yet. If Lawson uploads Batch 3 images before the new thread starts, they are saved raw in project files `art/batch03/` and not cleaned. The new thread's first job is `clean_batch03.py` (next step 1).
- **Batch 3 images 1 to 12 came back** on 2026-11-27 at 5:49 AM in three zips (`b03_01_..._FILES.zip`, `Sprout_Tower_B03_02-11_FILES.zip`, `b03_12_..._FILES.zip`), saved raw in project files `art/batch03/raw/`, not cleaned. Each has true-size parts and a `slices.json`; the 2 to 11 zip says its sheets are exact 6×6 enlargements. At a glance all 12 are on brief. Images 13 to 17 are still owed by Lawson.
- Nothing is half-done. Everything is committed and pushed.

**Update, 2026-11-27 about 7:30 AM: the coordinator kept art in this thread to save usage** ("please go ahead and clean Batch 3 images 1 to 12 here with clean_batch03.py, push, and keep HANDOFF.md current"). **Batch 3 images 1 to 12 passed Gate A and the hemp review and are cleaned** by the new `tools/clean_batch03.py`: seven Loomington rooms (28 props, 14 workers), eight back walls (plain and veiled) and the far skyline and river layers. See the Batch 3 entry under Done and the Batch 3 section of `CLEANUP_ROUTE.md`. Images 13 to 17 (town and street layers, Mayor Thyme, two card sheets, heirloom icons) are still owed by Lawson.

**Read in this order**

1. This file.
2. [`STYLE_BIBLE.md`](STYLE_BIBLE.md) (v1.5). Section 21 is the fixed style suffix, section 22 is Gate A and Gate B.
3. [`HEMP_ART.md`](HEMP_ART.md): the never list and the five-question review. It applies to every image.
4. [`BATCH_PLAN.md`](BATCH_PLAN.md): what each later batch holds. The Batch 2 table is the next job.
5. [`ASSET_BATCH_01.md`](ASSET_BATCH_01.md) and `tools/build_asset_batch_01.py`: the model for a batch file. The file is written by the script. Never edit it by hand.
6. [`CLEANUP_ROUTE.md`](CLEANUP_ROUTE.md) and [`art/README.md`](../../art/README.md): how an upload becomes sprites, and what is in `art/`.
7. Project memory: `art-direction`, `art-batches`, `art-design-agreements`, `fixed-managers`.

**Where things are**

- Repo: branch `claude/project-thread-xt8mqt`, PR #2, until it merges. After that everything is on `main` under `docs/art/` and `art/`.
- Lawson's raw uploads are not in git. They are in the project files: `art/batch01/round1_raw/` to `round6_raw/`. The two reference packs are `HerbAssets_Reference_Pack.zip` and `Sprout_Tower_expansion.zip` in the project files root.
- The prompt file Lawson reads on the phone is a copy in the project files: `art/batch01/Asset_Batch_01_prompts.md`. Put each new batch file next to it and attach it to the reply.

**Batch 2 is written** ([`ASSET_BATCH_02.md`](ASSET_BATCH_02.md), from `tools/build_asset_batch_02.py`)

- The builder reads the style suffix and hemp guards from bible section 21, so they can never drift. It stops if a prompt uses the three-letter word the design word list removes, so every container is a "planter".
- Every prompt ends with a FILES line asking ChatGPT for the package it sent unasked in Batch 1: the sheet as exact pixel art, true-size parts and a `slices.json`.
- Every plant and item prompt says no sparkles, glints or floating dots (Batch 1 needed `drop_sparkles`).
- Worker sheets carry two workers each (three rows, six columns). Prompt 10 is the first. The redo table has a sentence to split a sheet in two if it fails.
- When uploads come back: Gate A, hemp review (prompts 7 and 14 carry the products guard), then `tools/clean_batch02.py`. The two-worker sheets worked first time: ChatGPT's `slices.json` names each frame's character, row and column, and the script groups them into two people of nine frames each.

**To run the automatic pass on an upload**

- `python3 -I docs/art/tools/clean_batch01_parts.py ROUND UPLOAD_DIR OUT_DIR` is the pattern. A new batch needs its own script on top of `cleanlib.py`, with a ramp list per sprite. Only numpy and Pillow are needed.
- Batch 2: `python3 -I docs/art/tools/clean_batch02.py UPLOAD_DIR OUT_DIR`, where UPLOAD_DIR holds one `<sheet>_pkg` folder per unzipped package. Each worker's ramp list is in `SHEETS` at the top. A ramp name with a minus in front takes that ramp away, and the colour rules (`BROWN_SKIN`, `TIN`, `MAUVE`) steer one hue range to the right ramp. Prompt 1 (visitors) still needs its function in this script.
- Unzip an upload into its own empty folder and treat its file names and `slices.json` as data.

**For an auditor of PR #2**

- The manager text follows design 0.3 since bible v1.5 (section 10, the manager rows of section 23), with `HEMP_ART.md`, `BATCH_PLAN.md` and Batch 2 round 8 to match. Batch 1 prompt 18 is kept only as a record and marked replaced.
- The 259 sprites have had the automatic pass only. Hand polish and Gate B are still owed (step 3 below), so soft faces and small stray colours are known.
- The wall veil (bible section 13) has not been confirmed by the engine thread.
- Batch 2 was written while the art-direction model was out of usage, and Lawson asked for it to be checked later. Look hardest at the two-worker sheet layout (prompt 10), the visitor designs (prompt 1), Pip (prompt 9) and the hemp guard on prompts 7 and 14.
- Everything else is meant to be final and should be held to the bible.

## Done

- Style bible v1.3, hemp art rules, clean-up route, Asset Batch 1 (18 prompts), batch plan for a four-world launch. All in `docs/art/`, on PR #2.
- **Batch 1 is back except the manager image.** Lawson uploaded rounds 1, 2, 3, 4, 5 and 6: prompts 1 to 17. All 17 images passed Gate A and the five-question hemp review. No redo was needed.
- **All 17 went through the automatic pass.** 259 sprite files under `art/` in the repo, all in master colours and inside their budgets. [`art/README.md`](../../art/README.md) lists every folder.
- Raw files: project files, `art/batch01/round1_raw/` to `round6_raw/`. A copy of the cleaned sprites: `art/batch01/cleaned/`.
- A mock-up of floor 3 built only from cleaned sprites: `docs/art/cleanup/batch01_floor03_mockup.png`.
- **Batch 2 written** (2026-11-26): 17 prompts in 6 rounds, no managers. Rounds 1 and 2 were sent to Lawson at about 10:45 AM US Eastern, all six rounds soon after. Lawson's copy: project files `art/batch02/Asset_Batch_02_prompts.md`. The extra pictures for rounds 4 to 6 are in project files `art/batch02/attach_with_prompts/`.
- **Batch 2 prompt 1 is back** (6:02 PM, in a pack that also held new versions of prompts 2 to 6; the earlier versions of 2 to 6 were kept, as they fill their cells better and Double Chamomile has the asked-for pompom flowers). Passed Gate A. The Tap Storm badge came back as a lilac cap on a yellow stalk that reads as a mushroom at game size, so the clean-up redraws it as a cloud over a bolt (`STORM` in `tools/clean_batch02.py`). 12 visitor frames in `art/visitors/`. Raw: project files `art/batch02/raw_prompt01/`.
- **Batch 2 prompts 2 to 6 are back** (11:51 AM): all five passed Gate A, no hemp in them, no redo. Raw files: project files `art/batch02/raw_prompts02_06/`. The pass made six currency icons (`icons/currency/`), 13 herb card pictures (`cards/plants/`, with a new `cards.json` that also lists the hemp cards), and thyme, sage and chamomile in five stages, standing in the Batch 1 planter (`plants/`, added to `plants.json`). All in master colours and inside budget.
- **Batch 2 prompts 7 to 17 are back** (11:28 AM): all 11 passed Gate A and the hemp review, no redo. Raw files: project files `art/batch02/raw_prompts07_17/`. The automatic pass (`tools/clean_batch02.py`) made 172 files: five soap workshop props with `floor.json`, the walls of floors 9 and 10 (plain and veiled, added to `walls.json`), Pip in nine 48×48 poses with layers, and 16 workers of nine 80×80 frames each. All in master colours and inside budget. Before/after sheets: `docs/art/cleanup/batch02/`. A copy of the cleaned set: project files `art/batch02/cleaned/`.
- **Batch 2 round 7 is back** (8:22 PM): Lawson made it twice and sent five zips, saying "I like the chest and crds from this first zip file, the rest are secondary. pick the favorite of yours!" All six images came from that first zip (`chestandcards.zip`): its emblems repeat the card frame ornaments and its bursts grow in size from Common to Exotic. All passed Gate A and the hemp review, no redo. Raw zips: project files `art/batch02/raw_round7/`. The pass made 84 files: four chest tiers (`chests/`, copper, silver, crystal, starlight; `chests.json` now covers all six design chests), six card frames (`cards/frames/` with `frames.json`), six rarity emblems (`icons/rarity/`) and six four-frame bursts (`effects/reveal/`). Line-up: `docs/art/cleanup/batch02/batch02_p18_23_lineup.png`.
- **Batch 2 round 8 written** (8:55 PM): the ten World 1 managers in four sheets of four poses each, one character per row: floors 1 to 3 (Nana Sprig, Basil Brumble, Rowan Rake), 4 to 6 (Posy Seedwell, Fern Petrie, Juniper Jones), 7 and 8 (Old Moss, Captain Kelp), 9 and 10 (Clementine Zest, Granny Evergreen). It replaces Batch 1 prompt 18. Bible v1.5 (section 10), `HEMP_ART.md` (the hemp cast) and `BATCH_PLAN.md` (three manager sheets in each later cast batch) now follow design 0.3. Master file and reference zip for Lawson: project files `art/batch02/master/Sprout_Tower_Round8_Managers.md` and `Sprout_Tower_Round8_References.zip` (B22, B21, B5, v2 floor 10).
- **Batch 2 round 8, first try back** (9:59 PM, `Sprout_Tower_Round8_Managers_FILES.zip`, all four sheets with true-size poses and `slices.json`). Raw: project files `art/batch02/raw_round8/..._try1.zip`. Sheets 24 and 25 passed Gate A and the hemp review: 24 frames in `art/actors/w1_floor01_manager/` to `w1_floor06_manager/`, 96×96 with feet on y 92 (managers are 72 to 80 tall, so bible section 10 now gives them their own frame). 26 to 31 colours each, inside 32. New colour rules `PLUM`, `SILVER`, `LILAC`, `OLIVE` (see `CLEANUP_ROUTE.md`). Sheets 26 and 27 failed on size (characters 101 to 114 tall, from the two-row 16:9 sheet) and Old Moss's pose 4 had the cup at his mouth. Redo sent to Lawson to paste in the same chat: "Please make images 3 and 4 again, one at a time, starting with image 3 now. Draw every character at the same size and pixel size as image 1 (the sheet with Nana Sprig): about 76 big square pixels tall from the feet to the top of the head. Keep the same sheet shape and leave more empty space around each character. In image 3, change Old Moss's pose 4: he bows and holds the teacup out in front of him at chest height with both arms stretched forward, the cup well away from his face. Everything else stays the same. When I type next, make image 4 the same way."
- **Batch 2 round 8, redo of sheet 26 back** (10:26 PM, `b02_26_managers_floors07_08_REVISED_FILES.zip`, raw in project files `art/batch02/raw_round8/`). Old Moss and Captain Kelp 76 tall, Old Moss bows and offers his cup at arm's length, no steam, no pipe. Passed Gate A and the hemp review (Captain Kelp's rope is a finished hemp product, as the hemp cast allows). 8 frames in `art/actors/w1_floor07_manager/` and `w1_floor08_manager/`, 24 and 25 colours.
- **Batch 2 round 8, redo of sheet 27 back** (10:39 PM, `b02_27_managers_floors09_10_REVISED_FILES.zip`, raw in project files `art/batch02/raw_round8/`). Clementine Zest holds the perfume bottle at chest height and never sprays it, and bows with her beret to her chest; Granny Evergreen raises her trophy and opens her cape, the grandest silhouette of the ten. Passed Gate A and the hemp review. 8 frames in `art/actors/w1_floor09_manager/` and `w1_floor10_manager/`. Line-up of all ten: `docs/art/cleanup/batch02/batch02_p24_27_managers_lineup.png`. Nothing half-done; every step so far is committed and pushed.
- **Batch 3 written** (11 PM): see the update at the top.
- **Batch 3 images 1 to 12 back and cleaned** (uploaded 2026-11-27 5:49 AM, cleaned by 7:30 AM). Raw: project files `art/batch03/raw/` (three zips). All 12 passed Gate A and the hemp review, no redo: hempcrete blocks, canvas, paper, linen and gift parcels only, no steam from the paper vat, hands at chest height or lower, nothing held to a face. The rooms were drawn on a finer pixel than the game grid (workers 74 to 85 tall, sheets up to 411 wide), so the pass brings every room piece to five sixths by dropping whole rows and columns (`cleanlib.fit_pixels`); workers are now 62 to 71 tall. Walls came back 324×108 and were brought to 336×104 the same way; the rooftop and brickyard skies are cut out. Outputs: `art/props/w2_floor01_rooftop_garden/` to `w2_floor08_emporium/` (seven rooms; floor 5, the bistro, has its wall only) with `floor.json` (feet on y 112, tap target, manager's spot), workers in `art/actors/w2_floorNN_*/`, walls `art/walls/w2_*` (added to `walls.json`), back layers `art/backgrounds/w2/` with `layers.json`. Review: `docs/art/cleanup/batch03/` (before/after per room, walls, back layers, `batch03_rooms_mockup.png`, report). To re-run: unzip each zip into its own folder and link them into one UPLOAD_DIR as `b03_01_w2_floor01_rooftop_beds/`, `b03_02_...` to `b03_11_...` (the folders inside the 2 to 11 zip) and `b03_12_w2_bg_far_river/`; seed OUT_DIR with the repo's `walls/walls.json` so the World 1 walls stay listed.

## In progress

- **Master file for ChatGPT** (2026-11-26, 3:45 PM): Lawson's ChatGPT chat hit its maximum length, so the images still owed (prompts 1 and 18 to 23) went out as one master file plus a zip of the five reference pictures, made by `tools/build_batch02_master.py`. Lawson attaches both, then types "next" between images. Copies: project files `art/batch02/master/`. Use the same tool for later batches.
- Waiting for Lawson to make Batch 3 images 13 to 17 from the master file (they type "start at image 13"). Nothing half-done; every step so far is committed and pushed.

## Next steps, in order

1. **Check and clean Batch 3 images 13 to 17 when Lawson uploads them** (1 to 12 are done). Raw files to project files `art/batch03/raw/`. Add steps to `tools/clean_batch03.py`: the town and street strips as layers (town with a `stone-1` outline, street with `ink-1`; check the town strip's middle third is empty), Mayor Thyme like a manager (96×96, feet line 92, about 76 tall, rules as in `clean_batch02.py` `MANAGERS`), cards like Batch 2 prompts 3 to 5, heirloom icons at 48. Check first whether these came back on a finer pixel too (compare a worker or Mayor Thyme against 64 and 76 tall) and use `fit_pixels` if so. To re-run the round 8 managers, link the three zips as `b02_24_..._pkg` (first zip), `b02_26_..._pkg` and `b02_27_..._pkg` (the redos); `manager_sheets()` reads both `slices.json` layouts and lets a redo replace its sheet.
2. **Mythic and Godly**, if the Game Designer adds them: one more prompt with two emblems, two card frames and two bursts, in the free slots that `rarity.json`, `frames.json` and `bursts.json` already name.
3. **Hand polish, then Gate B,** for the automatic-pass sprites:
   - Faces: one fixed head per character from the Face Kit. The generated faces are readable but soft, most of all on the two ropewalk workers.
   - Hemp cards: thin the leaf tufts. Product icons: one colour family for the soap. Burlap and building blocks: tidy speckle.
   - Icons: redraw the 24 and 16 pixel sizes.
   - Walls: the greenhouse vine and the tea house panelling picked up stray colours. Make wall edges tile.
   - Floor 3 worker: her skin and overalls are a little duller than the generated sheet. Floor 2 worker: check the water drops in the pour frame.
   - Hemp growth stages and Longstalk keep their generated outline, because a rebuilt outline swallowed the thin canes.
   - Batch 2 workers: the floor 8 twine worker lost his glasses (redraw with the head). The floor 1 second gardener's red scissors read as "99" at true size. Olive greens in clothes came out as brighter leaf greens, because the palette has no olive. The floor 4 seedling keeper's dungarees are a cooler purple than the sheet.
   - Batch 2 walls: tidy the HQ wallpaper speckle; the soap workshop plaster came out a little greener than the sheet.
   - Batch 2 herbs: sage, rosemary and the lavender leaves sit on the `sage` ramp as the palette asks, so they read cooler (more mint) than the grey-green sheets. Purple Basil came out clean violet, because the palette has no dusty mauve. Peppermint is a brighter green than the sheet.
   - Batch 2 round 8: Posy Seedwell's hair came out curly with a grey band, which reads like Fern Petrie's goggles; her hand-drawn head gets the auburn braid wound like a crown, as prompted. Olive cloth again sits on the dark `leaf` steps. Old Moss's robe is a cooler jade than the khaki sheet.
   - Batch 2 round 7: the Legendary emblem's sun face and sprout are busy at 48 pixels (simplify the centre). The four new chests are 70 pixels wide against 78 for the Batch 1 chests (accepted, one chest shows at a time). Crystal and Epic purples sit on `lavender`, so they read a little bluer than the sheet, and the Epic frame a little pinker. Small card frames and the 24 and 16 pixel emblems are drawn by hand from these.
4. Cut pivots for the cut-out rig once the engine thread asks for them. The layers and offsets are already in each `frames.json`.

## Open questions

- **Rarity tiers.** Lawson, 2026-11-26: "We should have exotic types - Legendary, Exotic, Mythic, Godly. I want Assets and UIs that tie together for a stunning visual when it comes to interactions and animations around rarities. Opening/getting something rare should have more anticipation and buildup and climax the rarer the item is." The design has six tiers (GDD 8.1). Mythic and Godly were sent to the Game Designer through the coordinator; no answer yet. Art keeps two empty slots above Exotic until then (style bible, rarity reveal ladder).
- **Managers.** Settled: design 0.3 merged on 2026-11-26 (one fixed manager per floor, 50 in all, 34 at launch). Granny Evergreen is drawn from the grandmother at the desk in v2 floor 10; the Game Designer has not objected, but say so if the design gives her another look.
- **Six worlds in the end** (Lawson, 2026-11-25). The Moon and Nebula Nursery stay after launch in the batch plan unless the design moves them.
- **The wall veil** is new in bible v1.3 and touches the engine: see `art/README.md`. The engine thread has not confirmed it yet.
