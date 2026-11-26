# 09. Repository layout, ownership and the Phase 1 start

Status: recommended, Phase 0. Owner: Engine Architect.

## Layout

```
/
  README.md
  CLAUDE.md                      rules and commands every agent starts with
  package.json  pnpm-workspace.yaml  tsconfig.base.json
  .github/workflows/             ci.yml desktop.yml preview.yml release.yml

  docs/
    design/                      GDD, system specs, balance reports
    art/                         style bible, palette, asset specs, prompt batches
    audio/                       music and SFX direction, sourcing plan
    tech/                        this plan. Later decisions go in tech/adr/
    qa/                          test plans, phase verification reports

  packages/
    core/                        rules, formulas, state, saves (no rendering)
      src/kernel/                Num, formatter, RNG, stats engine, system contract, Game, save codec, time
      src/systems/<name>/        one folder per gameplay system
      src/systems/index.ts       the registry: one line per system
    content/
      tables/  text/             the data (see 04)
      src/                       compiler and validators
    save-io/                     atomic file writes, backups, recovery (Node)
    game/
      src/engine/                renderer, resolution, assets, scenes, tween, particles, post effects,
                                 audio mixer, input, UI kit
      src/features/<name>/       one folder per system, mirroring core/src/systems
      src/app/                   boot, main loop, settings, debug bridge

  apps/
    desktop/                     Electron main, preload, installer config
    sim/                         balance simulator

  art/
    sprites/  rigs/  fx/  fonts/ cleaned production assets only
  audio/
    music/  sfx/  amb/

  tools/
    art/                         clean-up, slicing, palette and lint scripts
    capture/                     screenshot tour, rig preview, video capture
    preview/                     the phone preview's holding page, until the first web build replaces it

  tests/
    e2e/                         Playwright tests against the running game
    fixtures/saves/<version>/    saves from every released version
```

Not committed: compiled content, atlases, build output, screenshots other than the small set of baselines, raw generated art, uncompressed audio masters.

## Ownership

One owner per folder. Work in someone else's folder goes through its owner or a small, separate pull request.

| Role | Owns |
|---|---|
| Engine Architect (integration) | `packages/core/src/kernel/`, `packages/game/src/engine/` structure, `packages/game/src/app/`, registries, root config, `docs/tech/` |
| Gameplay Programmer, per system | `packages/core/src/systems/<name>/` and `packages/game/src/features/<name>/` for their systems |
| Save and Offline Programmer | `packages/save-io/`, `core/src/kernel/save/`, `core/src/systems/time/`, `core/src/systems/offline/`, platform adapters, `apps/desktop/` main process |
| UI/UX | `game/src/engine/ui/`, the UI kit gallery, screen layouts inside feature folders by agreement with the system owner |
| Animation and VFX | `game/src/engine/fx/`, `game/src/engine/rig/`, shaders, `art/rigs/`, `art/fx/` |
| Art Director | `docs/art/`, `art/sprites/`, `tools/art/` |
| Audio Director | `docs/audio/`, `audio/`, mix settings |
| Game Designer | `docs/design/`, structure of `content/tables/` |
| Economy and Balance | `apps/sim/`, numeric content, formulas in `core/src/kernel/formulas/` by agreement with the architect |
| Content Builder | bulk rows in `content/tables/` |
| Writer | `content/text/` |
| QA and Test | `tests/`, `docs/qa/` |
| Build and Release | `.github/workflows/`, `apps/desktop/` packaging config, README, changelog |

## Rules that keep parallel work from colliding

1. **A system is a folder.** Adding a system adds two folders and one line in each registry. Registries are alphabetical with one entry per line, so two additions merge cleanly.
2. **Core and features mirror each other** by name, so ownership is obvious.
3. **Interfaces before implementations.** The kernel contracts (the system module shape, commands, events, stats, the platform interface) are agreed first. A change to a contract is its own pull request, reviewed by the architect, announced to the other threads.
4. **Content is split into small files** by world, kind and owner, and words are separate from numbers (see 04).
5. **Nothing generated is committed**, so generated files never conflict.
6. **Dependencies are added on purpose.** A new package or a lockfile change is its own pull request through the integration owner. Versions are pinned.
7. **Baseline images** change only in the pull request that means to change them.
8. **Every pull request** stays inside one owner's area where possible, passes `pnpm check` and its tests, and attaches screenshots or a clip for anything visible.

## Conventions

- TypeScript strict. No `any` in `packages/core`. Named exports.
- Ids are lowercase and dotted (see 04). Files are kebab-case.
- No display text in code; no number formatting outside the formatter; no rules in views. Each is a lint rule, not a guideline.
- Decisions that change this plan are recorded as short notes in `docs/tech/adr/`.

## Starting Phase 1

The vertical slice is World 1 with four or five floors, tap feel, managers, a first chest, a first card level-up and a first Replant, at final quality.

**Step 0: scaffold. One thread, before anything else.**
Workspace, configs, lint and import rules, `CLAUDE.md`, empty packages, CI, a calibration scene on the 640x360 grid, the crispness test, and the Windows workflow producing an installer that opens that scene. Done when: CI is green, the preview link shows the scene, and Lawson can install and launch a build. This flushes out every toolchain surprise on day one.

If the balance simulator is built before Phase 1, it should be built inside this structure (`packages/core`, `packages/content`, `apps/sim`), so the simulator's formulas are the game's formulas from the start. In that case Step 0 comes first there.

**Step 1: kernel. One or two threads.**
`Num` and the formatter, RNG streams, the stats engine, the system contract and `Game`, the save codec, the content compiler with the first tables. Done when the simulator can play floors from data and a save round-trips.

**Step 2: in parallel.**

| Stream | Builds | Needs |
|---|---|---|
| A. Engine shell | Resolution manager, asset loading, scene and panel managers, tween, input map, debug bridge, screenshot tour | Step 0 |
| B. UI kit | Components, layout, bitmap text, tooltips, gallery page | A's renderer setup, style bible UI kit |
| C. Effects | Particles, juice service, shaders, glow and light layers | A |
| D. Rigs | Rig runtime, preview tool, first actor and plant | A, first cleaned sprites |
| E. Audio | Mixer, stems, SFX voices | A |
| F. Saves and shell | save-io, platform adapters, Electron main process, torture tests, time and offline | Step 1 |
| G. Gameplay | wallet, floors, tapping, managers, then chests and cards, then Replant; each with its feature views | Step 1 for the core half; A and B for the views |

**Step 3: slice assembly and polish.** Tower and floor views with real art, the chest opening sequence, the welcome-back screen, tutorial beats, the audio mix, then the verification run in 08 and a build for Lawson.

## What a new programmer reads first

1. `docs/tech/TECH_PLAN.md` for the decisions.
2. `02-architecture.md` for the contracts.
3. The section of the GDD for their system, and `04-content-pipeline.md` for its tables.
4. `CLAUDE.md` for commands and rules.
