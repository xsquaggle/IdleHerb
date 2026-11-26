# Sprout Tower tech plan

Phase 0 deliverable. Owner: Engine Architect. Date: 2026-11-25. Updated 2026-11-26 for design version 0.2 ([GDD](../design/GDD.md), [content tables](../design/CONTENT.md)), the final style bible and Lawson's answers.

This page is the summary. Each decision links to a short document with the detail a programmer needs.

## In one paragraph

Sprout Tower will be written in **TypeScript**, drawn with **PixiJS** (a fast 2D WebGL renderer), and shipped as a normal Windows program inside an **Electron** shell, with an installer and a portable .exe built automatically on GitHub. All game rules live in a small core with no graphics in it, so the balance simulator, the automated tests, the offline catch-up and the real game run exactly the same code and read exactly the same data tables. The game is drawn on a 640x360 pixel-art canvas and scaled by whole numbers, so it is perfectly crisp at 1080p, 1440p and 4K, and ultrawide simply shows more. Every tool is free.

## Why this stack

The team is AI agents working in headless Linux sessions. Nobody can open an editor. So the engine that wins is the one agents can build, run, test and *look at* by themselves.

- It was tested, not assumed. In a team-identical cloud session, PixiJS rendered a pixel-art scene and produced screenshots at 1080p, 1440p, 4K, ultrawide and 1366x768. An automated check found every art pixel uniform at every size.
- The simulator and the game are one codebase, which is what makes the balance proofs trustworthy.
- The whole project is plain code and data that reviews well, with no editor-owned files.
- The same build runs in a phone browser, so Lawson can play each milestone from the phone.
- Godot 4 is the strong alternative and would win if a person were at the editor. Without one, its advantage is mostly lost. The full comparison is in [01](01-engine-decision.md).

The price of not taking a full engine is about 7,000 lines of our own engine-side code (UI kit, effects, rig playback, audio mixer). That work is ordinary, budgeted in Phase 1, and listed in [01](01-engine-decision.md).

## Decisions at a glance

| Topic | Decision | Detail |
|---|---|---|
| Engine | TypeScript, PixiJS 8 on WebGL2, Electron shell, Vite, pnpm | [01](01-engine-decision.md) |
| Architecture | A rendering-free core (commands in, events out), a presentation layer with no rules in it, and one small platform interface | [02](02-architecture.md) |
| Parallel work | Each gameplay system is one folder in the core and one mirrored folder in the client; shared files are two registries | [02](02-architecture.md), [09](09-repo-layout-and-ownership.md) |
| Stats | One modifier pipeline for every bonus in the game, which also produces tooltip breakdowns | [02](02-architecture.md) |
| Pixel grid | 640x360 logical canvas, whole-number scaling: 3x at 1080p, 4x at 1440p, 6x at 4K. Agreed with the Art Director | [03](03-rendering-animation-audio.md) |
| Animation | Cutout rigs described in JSON: posed body frames with attached head, face kit and props, plus keyframes and procedural motion. No animation editor needed | [03](03-rendering-animation-audio.md) |
| Effects and shaders | Data-driven pooled particles, a small GLSL shader set that works in art-pixel space, soft light and bloom only where the style bible allows | [03](03-rendering-animation-audio.md) |
| UI | Drawn in the same canvas on the same grid, from one UI kit with a gallery page | [03](03-rendering-animation-audio.md) |
| Audio | Web Audio mixer with buses, sample-aligned music stems that layer with progress, SFX variation and voice limits | [03](03-rendering-animation-audio.md) |
| Content | YAML data tables for everything, words separate from numbers, validated and compiled into one bundle used by game, simulator and tests | [04](04-content-pipeline.md) |
| Big numbers | break_infinity.js behind our own `Num` type, exact text form in saves, one formatter for every number on screen | [05](05-big-numbers.md) |
| Saves | Atomic writes, rolling backups, automatic recovery, per-system migrations, export and import, fixtures from every version | [06](06-save-system.md) |
| Offline and time | Live play on a clock that cannot be set; time away checked, bounded and computed by formula | [07](07-offline-and-time.md) |
| Build and test | GitHub Actions on free runners: tests, screenshot tour, Windows installer and portable build, smoke test of the real .exe | [08](08-build-test-release.md) |
| Repo layout | Monorepo with `packages/`, `apps/`, `art/`, `audio/`, `docs/` | [09](09-repo-layout-and-ownership.md) |

## How the brief's targets are met

| Target | How |
|---|---|
| Polished 2D with skeletal animation, particles, shaders | PixiJS renderer and filters, our rig runtime, data-driven particles, GLSL shaders ([03](03-rendering-animation-audio.md)) |
| Windows installer and portable .exe | electron-builder on a Windows CI runner ([08](08-build-test-release.md)) |
| Mouse and keyboard first, hotkeys | Action map with rebinding; hover, hold, wheel and keyboard focus built into the UI kit ([03](03-rendering-animation-audio.md)) |
| Crisp from 1080p to 4K, ultrawide-safe | Whole-number scaling of a 640x360 canvas, handled in true device pixels, proven by an automated crispness test ([03](03-rendering-animation-audio.md), [08](08-build-test-release.md)) |
| 60 fps or better on an RTX 3060 | A few hundred sprites and capped particles is far inside the renderer's range. Budgets are set in [02](02-architecture.md) and measured on the real PC with a benchmark mode ([08](08-build-test-release.md)) |
| Local saves with autosave, backups, export and import | [06](06-save-system.md) |
| Offline earnings the system clock cannot break | [07](07-offline-and-time.md) |
| Data-driven floors, cards, seeds and plants, artifacts, worlds, quests | [04](04-content-pipeline.md) |
| Big numbers that never overflow or lose precision | [05](05-big-numbers.md) |
| Simulator shares the game's formulas and tables | The core and content packages are imported by both ([02](02-architecture.md)) |

## What was checked and what was not

Checked in the build environment on 2026-11-25:

- PixiJS 8.23 renders in headless Chromium through software WebGL2, with particles and a bloom filter, and screenshots at five resolutions take seconds.
- Whole-number scaling is pixel-exact at 2x, 3x, 4x and 6x.
- Native numbers overflow where the game needs them (1.15^6000); the chosen library handles it, at about nine million multiply-and-add pairs a second.
- The library's own number-to-text conversion is not perfectly reversible (114 misses in 100,000), and our explicit form is (0 misses). Saves use ours.
- Subtraction never goes negative when the balance covers the cost (200,000 cases); bulk-buy formulas match one-at-a-time buying (3,000 cases).
- The repository is public, so CI on standard runners is free.

Not checked, and flagged where relied on:

- Godot's headless rendering in the build environment. The binary downloaded but the session was not allowed to run it.
- Real frame rate on the RTX 3060. Expected to be far above target; measured with the first Windows build.
- Electron packaging end to end. Standard practice, first exercised in Phase 1 Step 0.
- Whether Godot 4.7 can export C# projects to the web. Believed not; it did not affect the decision.

## Cost

$0. Every library and tool is free and open source, and CI is free because the repository is public.

Things that would cost money, none of which are in the plan: code signing (see below), cloud saves, an update server.

**The installer will be unsigned**, so Windows shows a "Windows protected your PC" screen the first time and the player clicks "More info" then "Run anyway". The brief allows a clearly documented installer, so the README will show that step. Signing options and rough prices are in [08](08-build-test-release.md) for a later decision.

## Risks

| Risk | Likelihood | What we do about it |
|---|---|---|
| Our own UI kit, rig playback and audio mixer take longer or feel less polished than an engine's built-ins | Medium | Built first in Phase 1 with a gallery page and screenshot tests; use PixiJS's own UI and layout libraries where they fit; scope is listed and bounded |
| Animation quality: agents author motion as data and cannot scrub a timeline | Medium | Rig preview tool renders contact sheets and clips for every change; posed-frame rigs keep the look in the hand-drawn sprites; a fresh-eyes art review per batch |
| Agents cannot hear audio or feel input | Certain | Loudness, peaks and loop seams are measured automatically; Lawson's ears and hands are the final check on each build |
| Real-GPU output or speed differs from software rendering in CI | Low | Windows build and benchmark mode from the first step of Phase 1; avoid driver-dependent shader tricks |
| Pixel art shimmers when rotated or scaled | Medium | Motion rules in [03](03-rendering-animation-audio.md): row-shear sway, spin frames, brief squash only; strict grid mode available per layer |
| Save damaged by antivirus or sync tools locking files | Low | Temp-file writes with read-back, retries, backups, recovery, torture tests on real Windows |
| A determined player cheats offline earnings by moving the clock forward | Certain, low impact | Bounded per launch and stated openly; optional hardening described in [07](07-offline-and-time.md) |
| Unsigned installer puts players off | Medium | Documented with screenshots and checksums; signing can be added later |
| Download size and memory from bundling a browser engine | Certain, low impact | About 100 MB download; fine for a PC game. The shell is swappable behind the platform interface |
| Music memory use from decoded stems | Low | Stem count and loop length budget for the Audio Director; one world's music loaded at a time |
| Parallel agents collide in the same files | Medium | Folder-per-system, mirrored ownership, small content files, nothing generated committed ([09](09-repo-layout-and-ownership.md)) |
| Library updates break things mid-project | Low | Pinned versions, a lockfile, upgrades only on purpose |
| The repository is public, so work in progress and art are visible to anyone | Certain | Lawson's call; noted so it is a choice rather than a surprise |

## Needed before Phase 1 code starts

1. This plan reviewed by the coordinator.
2. The scaffold (Phase 1 Step 0 in [09](09-repo-layout-and-ownership.md)). If the balance simulator is written in Phase 0, the scaffold should land first so the simulator is built inside `packages/core` and its formulas become the game's.
3. From Lawson: one setting to switch on for the phone preview, described below. Nothing else.

## Lawson's answers (2026-11-26)

- **A playable preview at a public web link: yes.** The publishing workflow and a holding page are in the repository. The address is `https://xsquaggle.github.io/IdleHerb/`. It shows the holding page until the first playable build in Phase 1, then the game, a readable page of the current game data and a screenshot gallery after every merge. It needs one setting switched on once: open `https://github.com/xsquaggle/IdleHerb/settings/pages` in a browser, and under "Build and deployment" set "Source" to "GitHub Actions". Detail in [08](08-build-test-release.md).
- **One fixed manager per floor**, not cards seated at any desk. The Game Designer is revising the GDD. The manager table in [04](04-content-pipeline.md) keeps a `floor` field and takes its other fields from that revision.
- **Six worlds in the end.** Worlds are rows in the content tables, so this changes no part of the plan.

## Documents

| | |
|---|---|
| [01 Engine decision](01-engine-decision.md) | The choice, the alternatives, what was measured |
| [02 Architecture](02-architecture.md) | Core, systems, stats, presentation, platform, budgets |
| [03 Rendering, animation, UI and audio](03-rendering-animation-audio.md) | Pixel grid, layers, rigs, effects, UI kit, input, audio |
| [04 Content pipeline](04-content-pipeline.md) | Data tables, shared shapes, compiler, assets |
| [05 Big numbers](05-big-numbers.md) | Number type, rules, saving, formatting |
| [06 Save system](06-save-system.md) | Format, writing, backups, recovery, migrations, torture tests |
| [07 Offline and time](07-offline-and-time.md) | Clocks, guarantees, catch-up maths, scenarios |
| [08 Build, testing and release](08-build-test-release.md) | Commands, CI, verification, Windows builds, signing, preview |
| [09 Repository layout and ownership](09-repo-layout-and-ownership.md) | Folders, owners, rules, the Phase 1 start order |
