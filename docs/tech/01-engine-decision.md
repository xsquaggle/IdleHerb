# 01. Engine decision

Status: recommended, Phase 0. Owner: Engine Architect.

## Decision

Build Sprout Tower in **TypeScript on PixiJS 8 (WebGL2)**, shipped as a Windows desktop app inside an **Electron** shell.

| Layer | Choice |
|---|---|
| Language | TypeScript, strict mode, one language for game, simulator, tools and tests |
| Renderer | PixiJS 8, WebGL2 backend only, shaders in GLSL ES 3.0 |
| Desktop shell | Electron (bundles its own Chromium, so the game renders the same on every PC) |
| Build | Vite, pnpm workspaces |
| Tests | Vitest (logic), fast-check (property tests), Playwright (real game, screenshots, video) |
| Packaging | electron-builder: NSIS installer plus portable .exe, built on GitHub Actions |
| Big numbers | break_infinity.js behind our own `Num` wrapper (see 05) |
| Cost | $0. Every tool and library is free and open source |

## What the engine has to do

From the brief, plus the working constraints the coordinator set:

1. Premium 2D: skeletal animation, particles, shaders, a deep UI, layered adaptive audio.
2. Pixel art that stays crisp from 1080p to 4K and on ultrawide.
3. 60 fps or better on an RTX 3060.
4. Windows installer and portable .exe, with solid local saves.
5. **Everything is written, built, tested and screenshotted by AI agents in headless Linux cloud sessions.** Nobody can open an editor GUI. Lawson reviews from a phone.
6. The balance simulator must share the game's formulas and data, not reimplement them.
7. Free tooling. Ask before spending.

Points 1 to 4 can be met by several engines. Points 5 and 6 are what separate them.

## What I checked in the build environment (2026-11-25)

These are measurements from a cloud session identical to the ones the team will work in, not assumptions.

| Check | Result |
|---|---|
| Preinstalled tools | Node 22, pnpm, Chromium with Playwright, ffmpeg, Xvfb. No Godot, no .NET SDK, no Unity |
| PixiJS 8.23 in headless Chromium | Renders through software WebGL2 (SwiftShader). No GPU needed |
| Screenshots at 1920x1080, 2560x1440, 3840x2160, 3440x1440, 1366x768 | All produced, 2 to 11 seconds each including page load |
| Integer-scale crispness | A 640x360 art-pixel scene scaled 3x, 4x, 6x, 4x and 2x. 3,150 art pixels checked per resolution, zero blended or uneven pixels |
| Particles and a bloom shader | 5,000 batched particles and the pixi-filters bloom filter ran without errors |
| npm registry | Reachable. Dependencies install in about 9 seconds |
| Electron and Godot release downloads | Both reachable from the session |
| Godot 4.7.2 headless run | **Not verified.** The 78 MB binary downloaded, but this session was not permitted to execute it |
| Repository visibility | Public, so GitHub Actions standard runners (Linux and Windows) are free, and GitHub Pages is available |

The consequence: with the web stack an agent can install, run, test and look at the game with what is already in its session. Nothing has to be added to the environment.

## Options compared

Scores are relative for this project, not general verdicts on the engines.

| Criterion | TS + PixiJS + Electron | Godot 4.7 (GDScript) | Godot 4.7 (C#) | Unity 6 | MonoGame / FNA | Bevy (Rust) |
|---|---|---|---|---|---|---|
| Agents author everything as plain text, no editor | Excellent. It is all code and data | Fair. Scenes and resources are text but designed to be edited in the editor; import and UID files add friction | Fair. Same, plus a .NET build | Poor. Scenes and prefabs are editor-owned YAML with GUIDs; CI needs a licence activation | Good | Good |
| Agent can see the result in its own session | Excellent. Verified above | Unverified here. Needs the engine binary plus a virtual display with software GL | Same | Poor | Fair, needs a virtual display | Fair |
| 2D features out of the box (UI, particles, lights, audio buses, skeletal) | Fair. Renderer, filters, particles, bitmap text exist; UI kit, rig runtime and audio mixer are ours to build | Excellent | Excellent | Excellent | Poor | Fair. UI is immature |
| Pixel-perfect integer scaling | Excellent. Verified above | Excellent. Built-in integer scale mode | Excellent | Good | Excellent | Good |
| One formula codebase for game and simulator, fast unit tests | Excellent. Plain TypeScript package, tests run in milliseconds | Poor. Logic runs only inside the engine; no operator overloading or fast test runner | Excellent. Pure .NET library | Good | Excellent | Excellent |
| Windows installer and portable build with no human | Excellent on a free Windows CI runner | Excellent. Cross-exports from Linux | Good | Fair | Good | Good |
| Playable preview on Lawson's phone | Excellent. The same build runs in a phone browser | Good. Web export exists, heavier | Poor. As far as I could confirm C# projects still cannot export to web (not verified against the 4.7 docs) | Poor | None | Fair |
| Agent fluency and error rate | Excellent | Fair. Frequent Godot 3 versus 4 API mix-ups | Good | Good | Good | Fair. API changes every release |
| Runtime footprint | Fair. About 100 MB download, 300 to 500 MB RAM | Excellent | Good | Fair | Excellent | Excellent |
| Cost | Free | Free | Free | Free tier, with account and licence handling | Free | Free |

LÖVE and Defold were also considered and dropped early: both are Lua (no static types across a many-agent codebase) and neither brings a UI system.

## Why the web stack wins here

1. **The development loop is the binding constraint, and this stack has the best one.** Agents cannot play the game. They can only run it, drive it with scripts and look at screenshots. Here that loop is seconds long and already works. Every visual claim in a pull request can be backed by a screenshot taken by the same agent that made the change.
2. **The simulator and the game are literally the same code.** The simulation core is a plain TypeScript package with no rendering in it. The balance simulator imports it, the game imports it, the tests import it. A balance change proven in the simulator is the balance in the build.
3. **No opaque project files.** A Godot or Unity project is partly a set of editor-managed files. With no editor, agents would be hand-writing a format that was never meant to be hand-written. In this stack the whole project is ordinary code and data that review well in a diff.
4. **Lawson can play it on the phone.** The game is a web app first. Every merge can publish a playable preview link (see 08). That is worth more to a phone-only creator than any engine feature.
5. **The genre fits.** An idle game is a deep UI over a small, mostly static 2D scene. It needs a fast sprite renderer, shaders and a good layout system, not physics, tilemaps or 3D. The best known games of this kind on PC took the same route: to my knowledge Cookie Clicker's Steam release is an Electron app, and Vampire Survivors and CrossCode shipped first as web-technology games in a desktop shell.

Performance is not a concern at this scale. PixiJS batches tens of thousands of sprites per frame on far weaker GPUs than an RTX 3060, and the scene here is a few hundred sprites plus particles.

## Why not Godot

Godot 4 is the strongest alternative and would be my pick if a person could sit at the editor.

What it does better: UI containers and themes, particles, 2D lights, glow, audio buses and interactive music, input mapping and integer scaling all exist on day one. The executable is smaller and there is no Chromium.

Why it loses for this project:

- Its productivity comes from the editor: scene composition, the animation timeline, particle and shader preview, UI anchoring. Used headless, Godot becomes a runtime that agents feed with hand-written scene text or build entirely in code, which gives up most of the advantage while keeping the engine's project-file friction.
- The shared simulator pushes the game logic out of GDScript and into C#. Godot with C# works, but adds the .NET SDK and a second build system to every agent session and CI job, and loses the phone preview.
- I could not run it in the build environment today, so its screenshot loop is unproven where the web loop is measured.
- Driving the editor through remote computer use on Lawson's PC is possible in principle, but it is slow, serial, and only works while that PC is on. It is not a foundation for a team of parallel agents.

Revisit Godot if a human editor operator joins, or if the game is later ported natively to consoles or mobile stores. The simulation core, data tables, art and audio would all carry over (see "Exit cost" below).

## Sub-decisions

**PixiJS, not Phaser.** Phaser 4 is a full game framework (scenes, physics, tilemaps, cameras). We need almost none of that and would still have to build the UI ourselves. PixiJS is a rendering library with the faster batcher, the cleaner filter pipeline and first-party UI, layout and asset-packing companions. It fits inside our own architecture instead of imposing one.

**Electron, not Tauri or NW.js.** Tauri builds are tiny because they use the WebView already installed on the PC, which means the game would render on whatever version that PC happens to have. Electron pins one Chromium, the same engine the tests run on, so what the agents verified is what Lawson plays. Playwright can also launch and drive a packaged Electron app directly, which gives us an automated smoke test of the real .exe. The price is a download of roughly 100 MB, which is fine for a PC game. The game talks to the shell through one small interface (see 02), so swapping shells later is contained.

**WebGL2 only, not WebGPU.** PixiJS 8 supports both. Supporting both means writing every shader twice (GLSL and WGSL). WebGL2 is the mature path and is what the software renderer in CI runs. WebGPU buys nothing at this scene size.

**Our own rig runtime, not Spine.** Spine and similar tools are editor-driven, and Spine's runtime licence requires buying the editor. With no one at an editor, rigs have to be authored as data either way. A small data-driven cutout rig system is described in 03.

## What we build because we did not take a full engine

| Module | Rough size | Libraries to lean on | Risk |
|---|---|---|---|
| Resolution and pixel-grid manager | 300 lines | PixiJS | Low. Prototyped in the spike |
| UI kit (buttons, panels, scroll lists, tabs, tooltips, focus, rich bitmap text) | 3,000 to 4,000 lines | PixiJS BitmapText and NineSliceSprite; evaluate @pixi/ui and @pixi/layout | Medium. Largest in-house piece; gets its own gallery page and screenshot tests |
| Tween, spring and timeline system | 500 lines | none | Low |
| Particle and VFX system | 800 lines | PixiJS ParticleContainer, pixi-filters | Low |
| Cutout rig runtime and preview tool | 800 lines | none | Medium. Quality depends on animation data, not code |
| Audio mixer with synced stems | 500 lines | Web Audio API | Low to medium |
| Input map with rebinding | 300 lines | none | Low |
| Scene and panel manager | 400 lines | none | Low |

About 7,000 lines of engine-side code, all of it ordinary, well-understood work, and all of it testable by screenshot. This is the real cost of the decision and it is budgeted in Phase 1 (see 09).

## Exit cost if the choice proves wrong

Low by design. The architecture in 02 keeps all rules, formulas, saves and content in a renderer-free core. The art, rig data, particle data and audio are plain files. Only the presentation layer (views, UI kit, effects) would be rewritten for another engine.

## Versions current at the time of writing

Pin exact versions in the scaffold pull request and upgrade only on purpose.

| Package | Version seen 2026-11-25 |
|---|---|
| pixi.js | 8.23.0 |
| pixi-filters | 6.1.5 |
| @pixi/ui, @pixi/layout | 2.4.1, 3.2.1 |
| electron | 45.5.0 |
| electron-builder | 26.18.0 |
| vite, vitest | 8.3.8, 5.1.2 |
| playwright | 1.65.1 (1.63.0 is preinstalled in agent sessions) |
| break_infinity.js | 2.2.0 |
| zod | 4.6.7 |
| Godot (for reference) | 4.7.2 stable |

## Sources

- GitHub Actions billing: standard GitHub-hosted runners are free in public repositories. https://docs.github.com/en/billing/concepts/product-billing/github-actions
- Godot releases: https://github.com/godotengine/godot/releases
- Package versions: npm registry, queried from the build session.
- Spike code and screenshots were throwaway and are not in the repository. The crispness check becomes a permanent automated test in Phase 1 (see 08).
