# Game client handoff (Phase 1 vertical slice)

Last updated 2026-11-28, about 07:25 UTC, by the Phase 1 build thread. Branch `claude/project-thread-da91tw`.

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
- Design 0.5 foundations (EXPANSION 15.1, all seven):
  - Eleven tiers are one table (`tables/tiers.yaml`); a test fails if any source quotes a tier id. Rules that single out a tier name it in `tuning.yaml`.
  - Cards carry `nativeTier`, and the save an optional raised `tier` (`cardTier`, `tierUps`).
  - One reveal player takes (tier, form); Settings, Reveal theatre plays all eleven in either form. Tiers without art borrow the nearest lower art plus a colour band.
  - One `moment(tier, place, form)` effect, with `tables/moments.yaml` naming each event's tier.
  - Chests by tier 1 to 11 (Prism, Sunburst, Eclipse, Pearl, Grail added) with fixed extras as data; card slots capped at `CHEST_CARD_TOP`.
  - Reset layers as a list (`tables/resets/layers.yaml`): Replant and Festival are rows walked by one reset path; New Generation and Big Bloom are rows not enabled yet. One `reset` event and a general `reset` command.
  - Counted taps are a flag on the input source (`tower`, `key`, `field`).
  - Design 0.4's numbers are unchanged: the simulator's 14-day active and 10-day idle runs are identical before and after.
- Tech docs 02, 03, 04, 08, 09 and TECH_PLAN brought in line with design 0.5, the built tables and phone and PC (the 0.5 audit's four places and the PR #5 review's wording list).
- Workflows: `ci.yml` (check, tests, web build), `desktop.yml` (Windows installer and portable .exe, smoke test, checksums, uploaded to each run as "SproutTower-Windows"), `preview.yml` (now the real game).

## In progress

Nothing. PR #12 (design 0.4 in the tables, Auto-Gardener switches per floor) is merged in: the bundle loads the plain tables, and the simulator's 14-day active and 10-day idle runs are identical to PR #12's own. A Windows smoke run failed once at the second launch (the game did not start within 60 s) on a commit that changed no game code; the same test passes here on the Linux build, and the smoke test now prints the page state, the page console and the shell's output, with a screenshot, if a launch stalls again.

## Next

1. Manager ability buttons (keys 1 to 4 and tap buttons), then the screenshot tour and the crispness test of docs/tech/08.
2. Phase 2 per ROADMAP once Lawson has played the slice.

## Known gaps

- Manager abilities have no buttons yet.
- Coins, Gems and Compost icons in `art/ui/` are drawn stand-ins until B12 is cleaned (`tools/art/draw_ui_icons.py`).
- Sound is procedural placeholder (`src/engine/audio.ts`) until Lawson's sound pack.
- Tiers above Legendary use borrowed art with a colour band until Batch 4 and later art (`tiers.yaml` emblem, burst and chest set to null).
- The debug bridge is always on; docs/tech/02 wants it compiled out of release builds.
- Saves are the slice's simple envelope, not yet the SPROUTSAVE format with SHA-256, slices and migrations of docs/tech/06; no export or import yet. Lawson's playable link keeps a save on their phone, so from now on a change to the save's shape needs `SAVE_VERSION` raised and a migration. Every field added so far is optional, and a save from before PR #12 loads (checked 2026-11-28).
- The Windows builds are unsigned (docs/tech/08, "Code signing").

## Open questions

None blocking.
