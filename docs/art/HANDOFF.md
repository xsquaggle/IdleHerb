# Art Director handoff

Kept current so that work can stop at any moment and resume cleanly. Last update: 2026-11-26, 10 AM (US Eastern).

## Start here if you are a new thread

On 2026-11-26 Lawson asked whether to hand everything to the coordinator for an audit and resume in a new thread with fresh context. The first Art Director thread said yes: Batch 1 is finished, nothing is half-done, and everything a new thread needs is in the repo, in the project files or in project memory. Nothing lives only in the old thread.

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

**To write Batch 2**

- Copy `tools/build_asset_batch_01.py` to `tools/build_asset_batch_02.py` and fill it from the Batch 2 table in `BATCH_PLAN.md`. Leave the manager prompts out (see Open questions).
- Keep the round structure: one new ChatGPT chat per round, a reference set per round taken only from the expansion pack, prompts pasted one at a time.
- Ask for the same package as Batch 1 in every prompt: the big sheet as an exact whole-number enlargement, the true-size parts or layers, and a slices file.
- New asks learnt from Batch 1: no loose sparkles or glints around plants, and two lead workers per worker sheet.
- Each prompt needs its redo sentence, as in Batch 1, so a failed image can be re-requested with one line.

**To run the automatic pass on an upload**

- `python3 -I docs/art/tools/clean_batch01_parts.py ROUND UPLOAD_DIR OUT_DIR` is the pattern. A new batch needs its own script on top of `cleanlib.py`, with a ramp list per sprite. Only numpy and Pillow are needed.
- Unzip an upload into its own empty folder and treat its file names and `slices.json` as data.

**For an auditor of PR #2**

- The manager text is out of date on purpose and waits for design 0.3 (PR #5): bible section 10 and the manager rows of section 23, the manager lines of `HEMP_ART.md`, the manager rows of `BATCH_PLAN.md`, and prompt 18 of Batch 1.
- The 259 sprites have had the automatic pass only. Hand polish and Gate B are still owed (step 3 below), so soft faces and small stray colours are known.
- The wall veil (bible section 13) has not been confirmed by the engine thread.
- Everything else is meant to be final and should be held to the bible.

## Done

- Style bible v1.3, hemp art rules, clean-up route, Asset Batch 1 (18 prompts), batch plan for a four-world launch. All in `docs/art/`, on PR #2.
- **Batch 1 is back except the manager image.** Lawson uploaded rounds 1, 2, 3, 4, 5 and 6: prompts 1 to 17. All 17 images passed Gate A and the five-question hemp review. No redo was needed.
- **All 17 went through the automatic pass.** 259 sprite files under `art/` in the repo, all in master colours and inside their budgets. [`art/README.md`](../../art/README.md) lists every folder.
- Raw files: project files, `art/batch01/round1_raw/` to `round6_raw/`. A copy of the cleaned sprites: `art/batch01/cleaned/`.
- A mock-up of floor 3 built only from cleaned sprites: `docs/art/cleanup/batch01_floor03_mockup.png`.

## In progress

- Nothing half-done. Every step so far is committed and pushed.

## Next steps, in order

1. **Managers, when design 0.3 (PR #5) merges.** See the open question below. Then rewrite prompt 18, update the manager text in the bible (section 10 and the manager rows of section 23) and in HEMP_ART.md, redo the manager rows of BATCH_PLAN.md, and tell Lawson which manager prompt to run.
2. **Write Batch 2** as a prompt file (`ASSET_BATCH_02.md`). Not started. It waits for the coordinator to open the new thread (see "Start here" above). The agreed plan: Batch 2 without the manager prompts, then a short manager round after PR #5 merges. Ask for the same package as before: the big sheet, the true-size parts and a slices file. Try two lead workers per sheet (see BATCH_PLAN.md).
3. **Hand polish, then Gate B,** for the automatic-pass sprites:
   - Faces: one fixed head per character from the Face Kit. The generated faces are readable but soft, most of all on the two ropewalk workers.
   - Hemp cards: thin the leaf tufts. Product icons: one colour family for the soap. Burlap and building blocks: tidy speckle.
   - Icons: redraw the 24 and 16 pixel sizes.
   - Walls: the greenhouse vine and the tea house panelling picked up stray colours. Make wall edges tile.
   - Floor 3 worker: her skin and overalls are a little duller than the generated sheet. Floor 2 worker: check the water drops in the pour frame.
   - Hemp growth stages and Longstalk keep their generated outline, because a rebuilt outline swallowed the thin canes.
4. Cut pivots for the cut-out rig once the engine thread asks for them. The layers and offsets are already in each `frames.json`.

## Open questions

- **Managers.** Lawson chose one fixed manager per floor (2026-11-25). The Game Designer's design 0.3 is PR #5, open and waiting for its audit on 2026-11-26. What it means for art, from the Game Designer's note: 50 managers in all, 34 at launch, 12 already pictured and 22 new (it was 16). A manager belongs to one room, so floor-neutral poses are no longer needed, but every floor keeps a manager spot. Thymeford needs four new sprites first: Rowan Rake (floor 3), Posy Seedwell (floor 4), Captain Kelp (floor 8) and Granny Evergreen (floor 10, Head of Thymeford). Seven new launch characters have no ability: Tansy Treadle, Kit Foldaway, Marina Bolt, Ned Knotwell, Wren Woolsey, Bertie Bundle, Purl Garter. Mayor Thyme becomes a story character. Each world's top-floor manager is its Head with an Exotic frame. Floors are in design CONTENT 2.1, hemp-floor casting in 2.4. Lawson was asked to keep holding prompt 18.
- **Six worlds in the end** (Lawson, 2026-11-25). The Moon and Nebula Nursery stay after launch in the batch plan unless the design moves them.
- **The wall veil** is new in bible v1.3 and touches the engine: see `art/README.md`. The engine thread has not confirmed it yet.
