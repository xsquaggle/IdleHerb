# Art Director handoff

Kept current so that work can stop at any moment and resume cleanly. Last update: 2026-11-26, early morning (US Eastern).

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
2. **Write Batch 2** as a prompt file (`ASSET_BATCH_02.md`). Batch 1 is checked, so nothing blocks it except the manager list. Ask for the same package as before: the big sheet, the true-size parts and a slices file. Try two lead workers per sheet (see BATCH_PLAN.md).
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
