# Tech plan thread: handoff note

Kept current so the work can be picked up after any stop. Delete this file when the thread closes.

Last updated: 2026-11-28 by the Phase 1 build thread (branch `claude/project-thread-da91tw`, PR #9).

## Done

- Tech plan (TECH_PLAN.md and 01 to 09), merged to main as PR #1 on 2026-11-26 after a fresh-eyes audit passed it.
- The plan is in line with design 0.2 and the final style bible. The manager section of 04 follows the Game Designer's in-progress design 0.3 (one fixed manager per floor).
- Phone preview: live at https://xsquaggle.github.io/IdleHerb/ since 2026-11-26. The first Preview run (push to main) built and published the holding page, and the address was checked. GitHub Pages is switched on (Lawson).
- 2026-11-28, with the Phase 1 build (PR #9): the plan brought in line with design 0.3 and 0.5 and with what was built. 04: the table layout as built (`tuning.yaml`, `floors/template.yaml` and the generated `floors/wN.yaml`, abilities inline in `cards/managers.yaml`), the manager section against merged design 0.3 (date 2026-11-25, Showstopper, the Starlight Chest's Head rule, abilities only in their own world, keys 1 to 4, Star Pupil), the chest rules (other type then one tier down, new-card help for plants only, the special chests' contents), and the new tiers, moments and reset layer tables. 02: reset layers as a list of four, counted taps by input source, automation once a second. 03: phone and PC alike, portrait views, the action map with `ability1` to `ability4`, the moment effect and the reveal player. 08 and TECH_PLAN: phone and PC. 09: the generated floor file names. This closes the PR #5 review's list for `docs/tech/` and the four places behind 0.5 that the 0.5 audit found.
- The audit's notes 1 to 7 and 9 are folded in, in a follow-up pull request from the same branch: the bulk-buy formula in the GDD's form (05), the committed `.gen.yaml` exception (09), a wall-clock jump alone is not time away (07), the luck and Compost gain guards per stat (02, 04), timed specials and hybrids out of chest pools (04), art folders and file names as the style bible sets them (04, 09), where the save hash comes from (06).

## In progress

- Nothing.

## Next

1. `LEVEL_CAP` is a table value: 112 in the slice (design 0.4's numbers are frozen) and 250 when design 0.5's longer tree is built in Phase 2 (EXPANSION 8.2). No code assumes 112.
2. When the core is split into systems (the PR #6 review, note 2), move the schemas next to their systems and give each system its own reset steps (02).
3. Keep the copy in the shared project files (`/mnt/project-files/tech-plan/`) current after each change.

## Open

- Audit note 8 (Morning Baskets as timers, `MAX_AWAY` in the GDD's constants) is settled in design 0.4: GDD 15.2 rule 5 and Appendix A.
- Audit note 9, optional and not done: the Pages permissions could sit on the deploy job alone. Left as it is because the workflow works and the reviewer called the current form acceptable.
- Not verified by anyone: the package versions listed in 01.
