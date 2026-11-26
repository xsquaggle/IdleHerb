# Art Director handoff

Kept current so that work can stop at any moment and resume cleanly. Last update: 2026-11-26, about 12:20 PM (US Eastern).

## Start here if you are a new thread

On 2026-11-26 Lawson asked whether to hand everything to the coordinator for an audit and resume in a new thread with fresh context. The first Art Director thread said yes: Batch 1 is finished, nothing is half-done, and everything a new thread needs is in the repo, in the project files or in project memory. Nothing lives only in the old thread.

**Update, 10:15 AM the same day:** the model chosen for audits ran out of usage, so the audit of PR #2 could not run yet. Lawson asked to move on and audit later. The same thread wrote all of Batch 2 (see Done). The coordinator was told; the later audit should cover PR #2 including Batch 2.

**Update, 11:40 AM:** Batch 2 prompts 7 to 17 are back, passed and cleaned (see Done).

**Update, 12:20 PM:** prompts 2 to 6 are back, passed and cleaned too. Only prompt 1 (visitors) is still owed. Lawson also asked for rarity reveals that build up more the rarer the item is, and for two more tiers (Mythic, Godly) above Exotic; the tier count went to the Game Designer through the coordinator (see Open questions).

**Read in this order**

1. This file.
2. [`STYLE_BIBLE.md`](STYLE_BIBLE.md) (v1.3). Section 21 is the fixed style suffix, section 22 is Gate A and Gate B.
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

- The manager text is out of date on purpose and waits for design 0.3 (PR #5): bible section 10 and the manager rows of section 23, the manager lines of `HEMP_ART.md`, the manager rows of `BATCH_PLAN.md`, and prompt 18 of Batch 1.
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
- **Batch 2 prompts 2 to 6 are back** (11:51 AM): all five passed Gate A, no hemp in them, no redo. Raw files: project files `art/batch02/raw_prompts02_06/`. The pass made six currency icons (`icons/currency/`), 13 herb card pictures (`cards/plants/`, with a new `cards.json` that also lists the hemp cards), and thyme, sage and chamomile in five stages, standing in the Batch 1 planter (`plants/`, added to `plants.json`). All in master colours and inside budget.
- **Batch 2 prompts 7 to 17 are back** (11:28 AM): all 11 passed Gate A and the hemp review, no redo. Raw files: project files `art/batch02/raw_prompts07_17/`. The automatic pass (`tools/clean_batch02.py`) made 172 files: five soap workshop props with `floor.json`, the walls of floors 9 and 10 (plain and veiled, added to `walls.json`), Pip in nine 48×48 poses with layers, and 16 workers of nine 80×80 frames each. All in master colours and inside budget. Before/after sheets: `docs/art/cleanup/batch02/`. A copy of the cleaned set: project files `art/batch02/cleaned/`.

## In progress

- Nothing half-done. Every step so far is committed and pushed. Round 7 of Batch 2 (rarity reveal kit) was written 2026-11-26 about 12:45 PM and sent to Lawson; the reveal ladder it serves is in style bible section 19 (v1.4).

## Next steps, in order

1. **Managers, when design 0.3 (PR #5) merges.** See the open question below. Then rewrite prompt 18, update the manager text in the bible (section 10 and the manager rows of section 23) and in HEMP_ART.md, redo the manager rows of BATCH_PLAN.md, and tell Lawson which manager prompt to run.
2. **Check and clean Batch 2 prompt 1 (visitors) and round 7 (prompts 18 to 23, the rarity reveal kit) when Lawson uploads them.** Put raw files in project files `art/batch02/raw_prompt01/` and `art/batch02/raw_round7/`. Round 7 needs new functions in `tools/clean_batch02.py`: emblems (16 colours), chests like Batch 1 (`clean_batch01_round4.py` has the chest code: base, lids, crack shadow, `chests.json`), card frames (32 colours, the window stays transparent), bursts (16 colours, no outline step). If the design adds Mythic and Godly, write one more prompt for their emblems, frames and bursts.
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
4. Cut pivots for the cut-out rig once the engine thread asks for them. The layers and offsets are already in each `frames.json`.

## Open questions

- **Rarity tiers.** Lawson, 2026-11-26: "We should have exotic types - Legendary, Exotic, Mythic, Godly. I want Assets and UIs that tie together for a stunning visual when it comes to interactions and animations around rarities. Opening/getting something rare should have more anticipation and buildup and climax the rarer the item is." The design has six tiers (GDD 8.1). Mythic and Godly were sent to the Game Designer through the coordinator; no answer yet. Art keeps two empty slots above Exotic until then (style bible, rarity reveal ladder).
- **Managers.** Lawson chose one fixed manager per floor (2026-11-25). The Game Designer's design 0.3 is PR #5, open and waiting for its audit on 2026-11-26. What it means for art, from the Game Designer's note: 50 managers in all, 34 at launch, 12 already pictured and 22 new (it was 16). A manager belongs to one room, so floor-neutral poses are no longer needed, but every floor keeps a manager spot. Thymeford needs four new sprites first: Rowan Rake (floor 3), Posy Seedwell (floor 4), Captain Kelp (floor 8) and Granny Evergreen (floor 10, Head of Thymeford). Seven new launch characters have no ability: Tansy Treadle, Kit Foldaway, Marina Bolt, Ned Knotwell, Wren Woolsey, Bertie Bundle, Purl Garter. Mayor Thyme becomes a story character. Each world's top-floor manager is its Head with an Exotic frame. Floors are in design CONTENT 2.1, hemp-floor casting in 2.4. Lawson was asked to keep holding prompt 18. Art Director's pick, not yet agreed with the designer: the grandmother at the desk in v2 floor 10 (green suit, white curls, green glasses, holding a sprout trophy) becomes Granny Evergreen, so she needs no new design. Batch 2 gives her no worker sheet for that reason.
- **Six worlds in the end** (Lawson, 2026-11-25). The Moon and Nebula Nursery stay after launch in the batch plan unless the design moves them.
- **The wall veil** is new in bible v1.3 and touches the engine: see `art/README.md`. The engine thread has not confirmed it yet.
