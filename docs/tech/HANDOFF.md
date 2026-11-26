# Tech plan thread: handoff note

Kept current so the work can be picked up after any stop. Delete this file when the thread closes.

Last updated: 2026-11-26.

## Done

- Tech plan (TECH_PLAN.md and 01 to 09), merged to main as PR #1 on 2026-11-26 after a fresh-eyes audit passed it.
- The plan is in line with design 0.2 and the final style bible. The manager section of 04 follows the Game Designer's in-progress design 0.3 (one fixed manager per floor).
- Phone preview: live at https://xsquaggle.github.io/IdleHerb/ since 2026-11-26. The first Preview run (push to main) built and published the holding page, and the address was checked. GitHub Pages is switched on (Lawson).
- The audit's notes 1 to 7 and 9 are folded in, in a follow-up pull request from the same branch: the bulk-buy formula in the GDD's form (05), the committed `.gen.yaml` exception (09), a wall-clock jump alone is not time away (07), the luck and Compost gain guards per stat (02, 04), timed specials and hybrids out of chest pools (04), art folders and file names as the style bible sets them (04, 09), where the save hash comes from (06).

## In progress

- Nothing.

## Next

1. When design 0.3 is merged: check the manager and ability records in 04 against it (`ability.tea_break`, `card.manager.old_moss`, the "met" flag, no `poolWorld` on managers, `MGR_STEP` per rarity), and whether the Starlight Chest still gives an Exotic manager copy.
2. Phase 1 Step 0 (the scaffold) replaces the "Assemble the site" step in `.github/workflows/preview.yml` with the real web build, and shows a "turn your phone sideways" prompt in portrait.
3. Keep the copy in the shared project files (`/mnt/project-files/tech-plan/`) current after each change.

## Open

- Audit note 8 is for the Game Designer: GDD 15.2 rule 5 lists Morning Baskets under the day counter, while GDD 15.1 and 07 treat them as game-time timers. `MAX_AWAY` (30 days) could join the GDD's constants.
- Audit note 9, optional and not done: the Pages permissions could sit on the deploy job alone. Left as it is because the workflow works and the reviewer called the current form acceptable.
- Not verified by anyone: the package versions listed in 01.
