# Art Director handoff

Kept current so that work can stop at any moment and resume cleanly. Last update: 2026-11-25, evening (US Eastern).

## Done

- Style bible v1.2, hemp art rules, clean-up route, Asset Batch 1 (18 prompts), batch plan for a four-world launch. All in `docs/art/`, on PR #2.
- Batch 1 round 4 (prompts 11 to 14) came back from Lawson. All four sheets passed Gate A and the five-question hemp review, with no redos.
- Those four sheets went through the automatic pass: 28 true-size sprites in the master palette under `art/` (chests with separate lids, six hemp card pictures, eight seed items, twelve product icons).
- Raw files: project files, `art/batch01/round4_raw/`. Cleaned copies: `art/batch01/round4_cleaned/`.

## In progress

- Nothing half-done. Every step so far is committed and pushed.

## Next steps, in order

1. When Lawson uploads more of Batch 1 (prompts 1 to 10 and 15 to 17 are asked for first): check each image against Gate A (bible section 22) and the hemp review, name any redo with the fix-it sentence from the batch file, then run the automatic pass. `docs/art/tools/clean_batch01_round4.py` is the model for sheets that arrive with a slices file. `cleanup_prototype.py` is for sheets that do not.
2. Take in the Game Designer's revised manager list (see open questions), then update the manager sections of the bible (section 10) and HEMP_ART.md, prompt 18, and the manager rows of BATCH_PLAN.md.
3. Hand polish for the round 4 sprites: thin the hemp leaf tufts, tidy speckle, one colour family for the soap, redraw the 16 pixel icons. Then Gate B.
4. Write Batch 2 as a prompt file once most of Batch 1 is checked.

## Open questions

- **Managers.** Lawson chose one fixed manager per floor (2026-11-25), not cards for any floor. The Game Designer is revising the design and will say what changes for manager art. Lawson was asked to hold prompt 18 until then.
- **Six worlds in the end** (Lawson, 2026-11-25). The Moon and Nebula Nursery stay after launch in the batch plan unless the design moves them.
- **Worker sheets.** Batch 1 prompts 8 to 10 will show whether two workers can share one sheet. That decides about 15 images in the plan.
