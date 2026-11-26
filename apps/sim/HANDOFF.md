# Balance simulator: handoff note

Kept current so the work can be picked up after any stop. Newest state first.

## State on 2026-11-26 (design version 0.2, main at c635977)

**Done**
- `packages/core`: the rendering-free economy core (big numbers, formulas, every system, commands, exact tick, closed-form offline pass, save text). `pnpm check` passes.
- `packages/content`: the YAML tables for GDD/CONTENT 0.2, the loader, proposal overlays (`applyOverlay`), `pnpm content:build`, `pnpm content:floors`.
- `apps/sim/src/profiles.ts`, `bot.ts`, `run.ts`: the three GDD player profiles, the simulated player, the daily schedule and the recorder. A 30-day active run takes about 40 seconds.
- Check against the designer's rough script: with every content system switched off (`off` list in `PlayStyle`) and perfect play, the core gives World 1 top floor at 16:30, first Replant at 26:25 and World 2 on day 0.47. The designer's script gives 17 min, 36 min and day 0.5. So the base economy agrees.

**First finding (not yet in a report)**
- With the real content systems on, an active new player is far ahead of the GDD pacing table: top floor about 12:35 (target 32:00), first Replant 13:00 (target about 50:00), World 2 after 68 minutes of play (target end of day 1), World 3 after 90 minutes (target day 3), first Festival at day 0.6 (target day 4 to 5), World 4 at day 1.25 (target week 1 to 2), level 79 on day 30 (target about 70).
- Causes seen so far: daily-quest XP (6,000 XP in the first 15 minutes, so the skill tree opens at 9 minutes and tap power doubles), managers at x3 to x4.8 in the first ten minutes against a budget of x2, Head Start money scaled by a new world's cost, and permanent multipliers about six times the budget on day 1 and far more by day 30.

**In progress**
- `apps/sim/src/try.ts` is a scratch runner. It is to be replaced by `cli.ts` (`pnpm sim`).

**Next steps, in order**
1. `apps/sim/src/cli.ts`: run profiles x tap rates x seeds, write JSON to `apps/sim/out/`.
2. `metrics.ts`, `charts.ts` (SVG; load the dataviz skill first), `report.ts`: write `docs/balance/REPORT.md` and charts.
3. Tests (Vitest + fast-check) for big numbers, formatting, formulas, tick additivity, offline, chests, save round trip, soak.
4. System-by-system ablation table, the burst-stacking before and after (`apps/sim/proposals/gdd-v0.1-boosts.yaml`), both tap rates, Mastery levels from cost, the fair track, offline build, XP.
5. Proposal overlays that bring pacing back to the targets, with before and after tables.
6. Pull request (depends on PR #1, the tech plan), project memory, final reply.

**Open questions**
- Lawson chose one fixed manager per floor (2026-11-26). The Game Designer thread is revising the GDD and will send the exact rules. Seating lives in `Bot.seats()` and the `hire` / `seatManager` commands in `packages/core/src/game/game.ts`; final runs must wait for that revision.
- Standing rule from Lawson (2026-11-26): be usage aware, stop at about 95% of the limit and leave a handoff. Work in small steps, commit and push often.
