# Game client handoff (Phase 1 vertical slice)

Last updated 2026-11-28 by the Phase 1 build thread. Branch `claude/project-thread-da91tw`.

## What this is

The playable game: `packages/game` (PixiJS 8 client on the shared `@sprout/core` economy) and `apps/desktop` (the Electron shell for Windows). Design 0.4 numbers, frozen by the balance simulator (PR #6). Art from `art/` (PR #2).

## How to run

| Command | Does |
|---|---|
| `pnpm install` | Installs everything |
| `pnpm dev` | Bundles content and runs the game in a browser with hot reload (port 5173) |
| `pnpm check` / `pnpm test` | Type check / unit tests |
| `pnpm build:web` | The web build in `packages/game/dist` (the phone preview, published by `preview.yml` on merge to main) |
| `pnpm build:single` | One self-contained page in `packages/game/dist-single/index.html`, art and fonts inlined (the Windows app ships it) |
| `node packages/game/scripts/artifact-page.mjs <out.html>` | Turns the one-file build into a claude.ai Artifact page body |
| `pnpm build:desktop` | One-file build, then the Windows installer and portable .exe (needs Windows; CI does it) |
| `cd apps/desktop && npx electron-builder --linux dir && xvfb-run -a node smoke.cjs release/linux-unpacked/sprout-tower` | Packages the shell for Linux and runs the smoke test, to check shell changes in a cloud session |

The private playable link for Lawson is the Artifact https://claude.ai/artifact/BoVfSTfN5PwMWVvqmJBmhh. Republish to the same link after changes: `pnpm build:single`, then the artifact-page script into the same output file, then publish that file again.

Debug bridge in the browser console: `__sprout.game` (the core), `__sprout.give(coins)`, `__sprout.skipReveals()`, `__sprout.save()`.

## Done

- Tower with the entrance, floors 1 to 10 of Thymeford as they open, roof, drag and wheel scrolling with inertia; the backdrop at golden hour.
- Floors: tap to harvest, crop growth in five stages, workers walk, work, carry and cheer, buy levels (x1, x10, Next, Max, hold to repeat), milestones, hiring the floor's manager, construction when a floor opens.
- HUD: Coins with rolling count and rate, player level and XP, Gems, Combo meter and Growth Spurt after they unlock, the quest pin, bottom bar (buy mode, chests, cards, Replant, settings).
- Chests and the reveal ladder (Arrive, Build, Tell, Burst, Show) scaled by rarity, the Cards panel (level up, plant on a floor), Replant with the Compost Shop, settings (sound, reduce motion, two-tap reset), Welcome Back with time-away earnings, Pip's lines, visitors to catch.
- Phone portrait and landscape and PC windows, whole-pixel scaling, safe areas for notches.
- Saves: localStorage in browsers; files in the Windows app (temp file, flush, read-back, atomic rename, backup) in `%APPDATA%\Sprout Tower\saves\main\` or `SproutTowerData\` beside the portable .exe.
- Windows app: one locked-down window (no menus, navigation, new windows or network), single instance, full speed in the background, F11 full screen, app icon from Pip.
- Workflows: `ci.yml` (check, tests, web build), `desktop.yml` (Windows installer and portable .exe, smoke test, checksums, uploaded to each run as "SproutTower-Windows"), `preview.yml` (now the real game).

## In progress

Design 0.5 foundations for the slice (EXPANSION.md 15.1, asked by the design thread on 2026-11-28): eleven tiers as one data table, cards with `tier` and `nativeTier`, one reveal player taking (tier, form) with a debug reveal theatre for all eleven, one `moment(tier, place, form)` effect, chests by tier 1 to 11 with fixed extras as data, reset layers as a list, counted taps as a flag on the input source. Version 0.4 numbers stay.

## Known gaps

- Manager abilities have no buttons yet.
- Coins, Gems and Compost icons in `art/ui/` are drawn stand-ins until B12 is cleaned (`tools/art/draw_ui_icons.py`).
- Sound is procedural placeholder (`src/engine/audio.ts`) until Lawson's sound pack.
- Tiers above Legendary use placeholder looks until Batch 4 art.
- The debug bridge is always on; docs/tech/02 wants it compiled out of release builds.
- Saves are the slice's simple envelope, not yet the SPROUTSAVE format with SHA-256, slices and migrations of docs/tech/06; no export or import yet.
- The Windows builds are unsigned (docs/tech/08, "Code signing").

## Open questions

None blocking.
