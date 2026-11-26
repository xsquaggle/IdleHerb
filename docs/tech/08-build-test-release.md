# 08. Build, testing and release

Status: recommended, Phase 0. Owner: Engine Architect. CI and packaging are implemented in Phase 1 by Build and Release with QA.

Everything here runs without a person at a desktop. Cost is $0: the repository is public, and GitHub's standard hosted runners, Linux and Windows, are free for public repositories.

## Commands

| Command | Does |
|---|---|
| `pnpm install` | Installs everything |
| `pnpm dev` | Runs the game in a browser with hot reload |
| `pnpm check` | Type check, lint, import-boundary rules |
| `pnpm test` | Unit and property tests (core, content, save-io) |
| `pnpm content:build` | Validates and compiles the data tables |
| `pnpm content:floors` | Regenerates the floor rows from the world parameters (see 04) |
| `pnpm assets:build` | Packs sprites into atlases, runs the art lint |
| `pnpm sim` | Balance simulator |
| `pnpm e2e` | Drives the real game in headless Chromium |
| `pnpm tour` | Screenshot of every screen, as a gallery |
| `pnpm rig:preview <id>` | Contact sheet and animation of a rig |
| `pnpm capture <script>` | Frame-accurate video of a scripted play session |
| `pnpm build:web` | Production web build (the phone preview) |
| `pnpm build:desktop` | Windows installer and portable build (CI) |

## What runs where

| Place | What it can prove |
|---|---|
| An agent's cloud session (Linux, no GPU) | Types, lint, all unit tests, content validation, the simulator, and the real game rendered in headless Chromium with screenshots, rig previews and video frames. This is the everyday loop and it needs nothing installed beyond `pnpm install` |
| CI on Linux | The same, as the merge gate on every pull request |
| CI on Windows | File-level save torture tests on NTFS; building the installer and portable build; launching the packaged .exe and running a smoke test through it |
| Lawson's PC | The real GPU: frame rate, feel, sound. Through the benchmark mode and ordinary play |

Agents do not need to run Electron themselves. The game is a web app that is tested in the same browser engine Electron ships; the shell is thin and is exercised in CI.

## CI workflows

All triggered by pushes, pull requests, tags or a manual button. **Nothing is scheduled.**

| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | Every pull request and push to `main` | Install, check, unit tests, content build, short simulator run, web build, end-to-end tests, screenshot tour uploaded as an artifact |
| `desktop.yml` | Push to `main`, tags, manual | On a Windows runner: save-io tests, package, launch the packaged app with Playwright, smoke test, upload installer and portable build |
| `preview.yml` | Push to `main`, manual | Publish the web build, content report, screenshot gallery and latest balance charts to GitHub Pages. In the repository since Phase 0, publishing a holding page until the first web build exists |
| `release.yml` | Tag `vX.Y.Z` | Build, generate save fixtures for this version, create a GitHub Release with installer, portable build, checksums and changelog |

Runs for the same branch cancel their predecessors, and dependency and Electron downloads are cached, to keep each run short.

## How each verification item in the brief is automated

| Brief requirement | How |
|---|---|
| Run the balance sim | `pnpm sim` in CI (short profile) and in full by the Economy thread. It uses the shipped core and tables |
| Automated tests | Vitest and fast-check for the core; Playwright for the running game |
| A real playthrough with screenshots of every new screen | A scripted bot plays the real game through the debug bridge. Every screen registers itself in a screen registry, and the tour fails if a registered screen has no screenshot, so a new screen cannot be missed |
| Checked against the GDD and style bible | Content compiler checks (04) and art lint (03) cover what can be automated; the fresh-eyes reviewers use the tour gallery for the rest |
| Crash mid-save, corrupted file, version migration | Save torture tests (06) |
| Offline catch-up of 1 minute, 8 hours, 30 days | Time tests (07) |
| Big numbers never overflow or lose precision; one formatter | Number tests (05); a lint rule forbids number-to-text conversion outside the formatter |
| Art-consistency review | Art lint plus the UI kit gallery and tour gallery for the reviewer |

## Screenshots and video

- **Repeatable.** Captures run with a fixed seed and a hand-stepped presentation clock, with fonts bundled, in the same Chromium build everywhere. Two runs of the same commit give identical images.
- **Crispness test.** A calibration scene is rendered at 1280x720, 1920x1080, 2560x1440, 3440x1440 and 3840x2160, and at Windows scaling factors of 100, 125, 150 and 200 percent. Every art pixel must be a uniform square block. This is the automated proof of "crisp at any resolution".
- **Visual regression.** A small set of stable images (calibration scene, UI kit gallery) is compared against committed baselines. The full tour is for review and is not diff-gated until the polish phase, so parallel work does not fight over baseline images.
- **Video.** `pnpm capture` steps the game one frame at a time, saves each frame and encodes with ffmpeg, so the result is a smooth 60 fps video even though the capture machine has no GPU. These are the videos attached to phase reports.

Software rendering in CI is exact for layout, pixels and logic. It is not a measure of speed, and subtle shader output can differ from a real GPU, which is why each phase also includes a run on real hardware.

## Windows builds

Built by electron-builder on the Windows runner. 64-bit only.

| Artifact | What it is |
|---|---|
| `SproutTower-Setup-X.Y.Z.exe` | Installer. Installs for the current user with no administrator prompt, lets the player pick the folder, adds Start menu and optional desktop shortcuts, and includes an uninstaller that leaves saves in place unless asked |
| `SproutTower-X.Y.Z-portable.exe` | Single-file portable build. Unpacks itself on launch, so it starts a little slower. Saves go in a folder beside it |
| `SproutTower-X.Y.Z-portable.zip` | The same app as a folder. Starts quickly, also keeps saves beside it |
| `SHA256SUMS.txt` | Checksums for all of the above |

Expect a download of roughly 100 MB plus audio. That is the cost of bundling the browser engine and is normal for a PC game.

### Code signing

The builds will be **unsigned** unless Lawson decides otherwise, because signing costs money.

What that means for a player: Windows SmartScreen shows "Windows protected your PC" the first time the installer runs, and they click "More info" then "Run anyway". Some browsers and antivirus tools are also more suspicious of unsigned installers. The brief accepts "a signed or clearly documented installer", so the README will show this step with screenshots and the release will publish checksums.

Options if signing is wanted later, all needing Lawson's approval first:

| Option | Approximate cost | Notes |
|---|---|---|
| Stay unsigned, documented | Free | The plan |
| A free signing programme for open-source projects | Free | Needs an application and an open-source licence on the repository |
| Cloud signing subscription | Around $10 a month | Has identity checks and regional eligibility limits |
| Traditional code-signing certificate | A few hundred dollars a year | Simplest to obtain |

Prices are approximate and should be rechecked at Phase 5.

## Releases and versions

- Semantic versions. `0.x` during development, `1.0.0` at ship.
- A tag builds everything and creates a GitHub Release. Phase builds for Lawson are pre-releases with a short changelog.
- No auto-updater in version 1. It would need a network connection and an update server. A new version is a new download; saves carry over through migrations.

## Phone preview

**Decided: Lawson said yes on 2026-11-26.** The web build runs in a phone browser, so every merge to `main` publishes a playable preview at `https://xsquaggle.github.io/IdleHerb/`, alongside the content report, the screenshot gallery and the balance charts.

- It is a public address, like the repository itself. The page asks search engines not to list it.
- It is the same game code, saving to the browser instead of to disk. It is a review tool, not a second product: layouts target desktop, and it works best with the phone held sideways.
- It is free, because the repository is public.

**What exists now.** `.github/workflows/preview.yml` and a holding page in `tools/preview/`. There is no game to play in Phase 0, so the address shows the holding page with the build it was published from. Phase 1 Step 0 swaps the workflow's "Assemble the site" step for the real web build, and nothing else changes.

**The one setting, switched on once by the repository owner:**

1. Open `https://github.com/xsquaggle/IdleHerb/settings/pages` in a web browser and sign in. On a phone this is the browser, not the GitHub app.
2. Under "Build and deployment", open the "Source" list and choose "GitHub Actions".
3. That is all. There is nothing to save.

Until that setting is on, the workflow ends green with a notice and publishes nothing. Once it is on, the next merge to `main` publishes the page, or the workflow can be run by hand from the Actions tab. GitHub only lets the default branch publish, so nothing appears before the workflow itself is merged.

## Checking on the real PC

Automated tests cannot measure frame rate on an RTX 3060 or judge feel. Two tools cover that.

- **Benchmark mode.** `SproutTower.exe --benchmark` (also a button in settings) plays a fixed 60-second stress scene and writes `benchmark.json` with average and worst-case frame times, GPU details and resolution. Lawson can run it and upload the file.
- **Performance overlay.** A toggle showing frame time, draw calls and particle count.

With Lawson's permission each time, a session can also run the build and the benchmark on the linked PC remotely and read the result. Nothing in the plan depends on that.

## Agent session notes

- Chromium and Playwright are preinstalled in cloud sessions. The project pins its own Playwright version; test config points at the preinstalled browser when it is present and installs one in CI.
- A root `CLAUDE.md` carries these commands, the import rules and the ownership map so every agent starts with them.
- Re-run only failing tests while fixing; the full suite is the CI gate.
