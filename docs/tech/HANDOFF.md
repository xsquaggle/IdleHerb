# Tech plan thread: handoff note

Kept current so the work can be picked up after any stop. Newest state first. Delete this file when the thread closes.

Last updated: 2026-11-26.

## Done

- Tech plan (TECH_PLAN.md and 01 to 09), delivered as PR #1.
- 03 matched to the final style bible numbers.
- 04 brought in line with design 0.2: generated floor rows, the design's stat names, buckets and scopes, chest and ability shapes, table list, compiler guard checks.
- Phone preview: `.github/workflows/preview.yml` and the holding page in `tools/preview/` are pushed. Lawson was given the steps to switch on GitHub Pages (2026-11-26). The workflow has not run yet: it first runs when PR #1 is merged to main.
- 02 brought in line with design 0.2: stat rules and caps, the Boost and the steady rate, systems in the design's words, two reset layers, background play at the full online rate.

- 07 brought in line with design 0.2: what time away pays (efficiency, stored hours, twists, Morning Dew, Time Warp, the fair stall), background play is not time away, tests for the five rules of GDD 15.2.
- Old vocabulary replaced with the design's words in 03, 05, 06 and 09.

## In progress

- Nothing. The plan is in line with design 0.2 and the style bible.

## Next

1. When design 0.3 is merged: check the manager and ability records in 04 against it. They were written on 2026-11-26 from the Game Designer's in-progress notes (one manager per floor, the "met" flag, no `poolWorld` on managers, `MGR_STEP` per rarity, four abilities per world).
2. After PR #1 is merged: check the first Preview run and the public address, and fix the workflow if it fails. GitHub Pages is switched on (Lawson, 2026-11-26). The workflow can also be started by hand from the Actions tab (workflow "Preview").
3. Keep the copy in the shared project files (`/mnt/project-files/tech-plan/`) current after each change.

## Open

- Design 0.3 (fixed managers) is not merged or audited yet. The Game Designer confirmed two engine readings of GDD 15.1 on 2026-11-26: boosts run out while away and pay nothing offline, and weather uses loop averages plus the exact part-loop.
