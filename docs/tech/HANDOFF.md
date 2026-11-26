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

1. When the Game Designer sends the revised manager rules (one fixed manager per floor): update the manager and ability records in 04, the `managers` and `cards` systems in 02, and anything in 06 about saved placements.
2. After PR #1 is merged and Pages is on: check the first Preview run and the public address, and fix the workflow if it fails. It can be started by hand from the Actions tab (workflow "Preview").
3. Keep the copy in the shared project files (`/mnt/project-files/tech-plan/`) current after each change.

## Open

- Managers are one fixed manager per floor (Lawson, 2026-11-26). The Game Designer is revising the GDD. The manager record in 04 is a placeholder until the exact fields arrive.
