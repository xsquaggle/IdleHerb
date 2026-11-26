# Balance simulator: handoff note

Kept current so the work can be picked up after any stop. Last update: 2026-11-26, about 01:40 UTC.

## Where things are

- Branch `claude/project-thread-qda3cu`. The core (`packages/core`), the tables (`packages/content/tables`) and the simulator (`apps/sim`) are on **design 0.3** (one fixed manager per floor, PR #5 of the Game Designer, not merged yet). The 0.2 numbers were measured before the move and are summarised below.
- Commands from the repo root: `pnpm install`, `pnpm check`, `pnpm content:build`, `pnpm sim` (every run plus the report), `pnpm sim run --profile active --days 7`, `pnpm sim suite --only baseline`, `pnpm sim calibrate --base <overlay>` (fits gate prices to the pacing table), `pnpm test`.
- Results of single runs land in `apps/sim/out/` (ignored by git). Overlays that try number changes are in `apps/sim/proposals/`.

## Done

1. Economy core, content tables, overlays, save format.
2. Simulator: three profiles, daily schedule, offline gaps, greedy buyer, Replant and Festival rules, a new-player model fitted to the GDD's first-hour table, recorder (timeline, samples, sessions, XP by source, tap parts, manager multipliers).
3. Check against the designer's rough script: with every content system off the core lands on it (top floor 29 min, first Replant 51 min for a new player; World 2 at 210 minutes of play).
4. Suite of runs (`suite.ts`) and the gate-fitting command (`calibrate.ts`).
5. Design 0.3 in the core and tables: managers fixed to floors, met on first opening, `MGR_BASE` and `MGR_STEP`, chest pool of met managers, Welcome Chest and Hiring Crates, Head copies from Mastery stars and the Starlight Chest, abilities per world (the world must be on screen), Star Pupil, the `managers` achievement, the 31-row unlock table, six new abilities.

## Findings so far

Design 0.2, active player (60-day runs, new-player model as first written):

- Far ahead of the pacing table in week 1: World 2 at 3.3 h (target day 0.5), World 3 at 5.8 h (day 2.6), first Festival at 13.8 h (day 4.1), World 4 on day 1.25 (6.7), World 5 on day 2.4 (12.2), World 6 on day 6.4 (19.5).
- Then it slows to a crawl: 14 Festivals by day 13, the next four on days 19, 26, 33 and 43, none after that. One Replant a day from day 30.
- Mixed is 2 to 4 times early. Idle is on target up to World 3 and 2 to 3 times early from World 4.
- So the late gates (World 4 to 6 tickets and deeds) are too cheap for everyone, and active play is far stronger than the budget in the first days.
- Why active play is strong: tap income. Tap multiple (6 taps a second) is 8 at hour 6 against a budget of 1.9 to 2.5, because Combo cap reaches 50 inside the first hour and the Green Thumb branch is full on day 1. Taps are 72 to 86 percent of active income.
- XP: 38,000 in the first hour against 8,750 for level 8. Sources: first daily quests (6,000 by minute 15), achievements already earned when the book opens (6,700), Compost records.
- "Everything else" multiplier against the budget: 4 to 13 times over on days 0 to 3, on budget at day 30, half the budget at day 60. The content gives its bonuses too early and then runs dry.
- No single system explains the rush: each one alone moves World 2 by 10 to 35 percent (minutes of play), together 210 to 76 minutes.
- Fitting the first three gates to the active targets needs FIRST_REPLANT_MIN 60 to 790, the World 2 ticket 5e19 to 5.8e23 and the World 3 ticket 2e19 to 1e24. With those, idle reaches World 2 on day 9 (target 3.2). So prices alone cannot fix it: active power has to come down to the budget first.

Design 0.3, first 3-day active run: about the same pace as 0.2 (top floor 19 min, first Replant 27 min, World 2 at 3.6 h, first Festival at 14 h). Income-weighted manager multiplier 3.1 to 3.5 in the first hour and 4.8 at hour 6 (budget 2 and 2.5).

## Next steps, in order

1. Run the suite on 0.3 (`pnpm sim suite`), about 3 minutes.
2. `metrics.ts`, `charts.ts` (load the dataviz skill first), `report.ts`: `docs/balance/REPORT.md` with verdicts on dead zones, runaway growth, pacing targets and longevity, the timeline tables, charts, CSV timelines.
3. Proposal overlays on 0.3: XP numbers (`p1-levels.yaml` is the 0.2 draft), tap power to the budget, then `pnpm sim calibrate` for the gates. Report before and after for the three profiles.
4. Tests (Vitest, fast-check): Num, formatter, save round trip, bulk buy, offline against stepped time, chest rules of 0.3, Compost and Ribbon formulas, boost rule, content validation.
5. Pull request (depends on PR #1, tech plan, and PR #5, design 0.3). Copy the report to `/mnt/project-files/balance/`.

## Open questions and assumptions to list in the report

- New-player model: 0.3 purchases a second and 30 percent of taps landed for 2 minutes, then 0.35 and 35 percent to minute 10, 0.4 and 35 percent to the end of the first hour, then 2 a second and every tap. Fitted to the GDD's first-hour table on the bare game.
- A manager's ability can be pressed only while its world is on screen. Leaving a world ends what an ability gave the taps (Combo lock, Liftoff).
- Tea Party adds 120 s of the world's steady income to the bubbles. Wake-Up Call makes the next missed sunrise pay as caught.
- Auto-Gardener as one switch, Head Start money on first entry to a new world, purchases do not interrupt tapping, Autopilot taps are not counted taps.
- The reviewer's two notes for the simulator: event track every weekend in the card and heirloom rates, and the ten Mastery levels from cost.
