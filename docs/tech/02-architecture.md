# 02. Architecture

Status: recommended, Phase 0. Owner: Engine Architect.

The one rule everything else follows from: **the game's rules live in a core that knows nothing about rendering, files, clocks or randomness sources.** The core is given time, random seeds and content, and it returns state and events. That is what lets the simulator, the tests, the offline catch-up and the real game all run the same code.

## Layers

```
            content (YAML tables, text)                 art / audio (files)
                      |                                        |
                      v                                        v
  +---------------------------+        +----------------------------------------+
  |  @sprout/core             |        |  @sprout/game  (presentation)          |
  |  rules, formulas, state,  | <----- |  PixiJS scenes, views, UI kit, FX,     |
  |  saves (pure TypeScript)  | events |  audio, input. No rules in here.       |
  +---------------------------+        +----------------------------------------+
        ^           ^                         |
        |           |                         v
  +-----------+  +--------------+      +----------------------------------------+
  | apps/sim  |  | tests        |      |  Platform interface                    |
  | balance   |  | unit, torture|      |  saves, clocks, window, dialogs        |
  | simulator |  |              |      +----------------------------------------+
  +-----------+  +--------------+         |                |               |
                                          v                v               v
                                    Electron shell    browser preview   in-memory
                                    (the product)     (phone, tests)    (unit tests)
```

## Packages

| Package | What it is | May import |
|---|---|---|
| `packages/core` | The simulation: numbers, RNG, time, stats, every gameplay system, save encoding and migrations | break_infinity.js, zod. Nothing else |
| `packages/content` | The data tables, the text, and the compiler that validates them into one bundle | core (for schemas) |
| `packages/save-io` | Node-only file handling: atomic writes, backup rotation, recovery | core |
| `packages/game` | The PixiJS client | core, content bundle, pixi.js |
| `apps/desktop` | Electron main process, preload bridge, installer config | save-io |
| `apps/sim` | Balance simulator command-line tool | core, content |
| `tools/` | Art pipeline, rig preview, screenshot tour | anything |
| `tests/e2e` | Playwright tests against the real game | none of the source directly |

The import rules are enforced by a lint step in CI, so a wrong import fails the build rather than relying on review.

Forbidden inside `packages/core`: `Date`, `Math.random`, `performance`, timers, DOM, Node APIs, PixiJS. A lint rule bans them.

## The core

### Public surface

```ts
export function createGame(opts: {
  content: Content;        // compiled bundle from packages/content
  seed: number;            // only used for a new game
  save?: SaveBody;         // resume from a save
}): Game;

export interface Game {
  readonly state: DeepReadonly<GameState>;
  dispatch(cmd: Command): CommandResult;         // every player action
  tick(dtMs: number): void;                      // live time
  fastForward(awayMs: number): OfflineReport;    // time away, computed in closed form
  on<K extends EventName>(name: K, fn: (e: GameEvent<K>) => void): () => void;
  readonly q: Queries;                           // derived values and stat breakdowns
  toSave(): SaveBody;
}
```

Three ideas carry the design.

**Commands in.** Every player action is a plain serialisable object: `{ type: 'floor.collect', floorId }`, `{ type: 'floor.buyLevels', floorId, count: 'max' }`, `{ type: 'chest.open', chestId }`. The UI sends commands. The simulator's bots send the same commands. Tests replay recorded lists of them. A command returns `{ ok: true }` or `{ ok: false, reason }`, never throws for a normal refusal such as not enough cash.

**Events out.** The core announces what happened: `floor.collected { floorId, amount, crit, combo }`, `chest.opened { rolls }`, `milestone.reached`, `unlock.revealed`. The presentation layer turns events into juice (coin bursts, popups, sounds). The core never knows whether anyone is listening.

**Queries for reading.** Views read cheap continuous values each frame (cycle progress, cash) and ask for derived values through `q` (income per second, next milestone, whether a button is affordable, the full breakdown of a stat for a tooltip).

### State

One plain object tree, one slice per system, serialisable as is. The core mutates it in place for speed; nothing outside the core may write to it (it is typed read-only and frozen in development builds).

### Systems are plug-ins

Each gameplay system is one folder with a fixed shape. This is what lets several gameplay programmers work at once without sharing files.

```
packages/core/src/systems/chests/
  index.ts          the module (below)
  schema.ts         content tables this system owns, and its save slice
  commands.ts       command handlers
  logic.ts          pure functions and formulas
  migrations.ts     save slice upgrades
  chests.test.ts
```

```ts
export interface SystemModule<S> {
  id: string;                       // also the save slice key. Never renamed
  version: number;                  // save slice version
  schema: ZodType<S>;               // validates the slice on load
  tables?: Record<string, ZodType>; // content tables this system owns
  init(ctx: Ctx): S;                // fresh state for a new game
  migrations: Record<number, (old: unknown) => unknown>;
  commands?: CommandHandlers;
  tick?(ctx: Ctx, dtMs: number): void;
  fastForward?(ctx: Ctx, awayMs: number, report: OfflineReport): void;
  modifiers?(ctx: Ctx, out: ModifierSink): void;      // what this system adds to stats
  reset: Record<ResetLayer, 'wipe' | 'keep' | ((s: S, ctx: Ctx) => void)>;   // required for every layer
  stats?: StatDecl[];               // stat keys it introduces
  specials?: Record<string, SpecialHandler>;          // code hooks that data can name
}
```

Systems are listed in one registry file, `systems/index.ts`, one line each in alphabetical order. That file and the kernel are the only shared touch points.

Planned systems, each one folder: `wallet` (currencies), `floors` (cycles, levels, milestones), `tapping` (crits, combo, frenzy), `pickups` (golden sprouts), `managers`, `cards`, `plants` (seeds, traits), `mutations`, `chests` (loot, pity), `artifacts` (slots, sets, actives), `skills`, `research`, `quests`, `resets` (rebirth, prestige and their shops), `worlds`, `achievements`, `codex`, `events`, `unlocks` (the slow reveal), `tutorial`, `offline`, `time`. The GDD has the final list; adding or removing one is adding or removing a folder and a registry line.

**Resets are declared, not coded centrally.** Each system states what a rebirth or a prestige does to its own slice (`wipe`, `keep` or a function). The reset code simply walks the systems. A new system cannot be forgotten by a reset, because the type requires it to answer for every reset layer.

### Stats and modifiers

Almost everything in an idle game is "something changes a number". One mechanism handles all of it.

- A **stat** is a named value such as `floor.payoutMult`, `floor.speedMult`, `tap.critChance`, `offline.capHours`, `chest.luck`. Systems declare the stats they introduce.
- A **modifier** is a contribution to a stat: its source (which card, artifact, skill, milestone), a scope (global, a world, a floor, a plant type, a tag), an operation and a value.
- Final value, default rule: `(base + sum of flat adds) x product over buckets of (1 + sum of percent bonuses in that bucket) x product of multipliers`, then any cap. Bonuses from the same kind of source add; different kinds multiply. The Economy thread owns the bucket policy and can change the stacking rule in one function.
- Modifiers are recomputed only when something that grants them changes (a purchase, an equip, a level-up), not every frame.
- Because every contribution keeps its source, `q.breakdown(stat, scope)` returns the full list for free. That is the "tooltips with full stat breakdowns" requirement, and it also gives the balance simulator a way to attribute income to systems.

Cards, traits, artifacts, set bonuses, skills, research, shop upgrades, milestones, achievements and world twists all express their effects as modifiers written in the data tables (see 04). Behaviour that cannot be a number change (a keystone such as "taps also add a level") is a named **special**: the data names it, the owning system implements it, and the content compiler refuses data that names a special nobody implemented.

### Time, ticks and determinism

- `tick(dt)` is exact for any `dt`. Floors compute how many cycles completed inside the step with division, not by looping, so `tick(a + b)` gives the same result as `tick(a)` then `tick(b)`. Frame rate cannot change the economy. A property test holds this.
- `fastForward(awayMs)` is the same maths over a long span, plus the offline rules (cap, offline multipliers, no random events). See 07.
- Timers (buffs, cooldowns, research, expeditions) store **time remaining in game time**, never a wall-clock end time. The system clock cannot touch them.
- Randomness comes from seeded generator streams whose state is in the save: one each for loot, crits, events and mutations. Consequences: a simulator run is reproducible from its seed, and reopening the game cannot reroll a chest. Visual-only randomness (particle scatter) uses a separate unsaved generator so effects never disturb gameplay results.
- The core never asks what time it is. Time is handed in by the platform layer after it has been checked (see 07).

### Formulas

Every formula that both the simulator and the game need (level cost, bulk buy cost, maximum affordable levels, payout, cycle time with the speed cap, prestige currency gain) is a pure function in `core`, written once. Data tables carry the parameters. Where a table needs a formula it names one with parameters (`{ id: 'prestige.root', params: { divisor: '1e9', power: 0.5 } }`); there are no formula strings to evaluate.

## The presentation layer

```
packages/game/src/
  engine/        renderer setup, resolution manager, asset loader, scene and panel managers,
                 tween and springs, particles, post effects, audio mixer, input map, UI kit
  features/      one folder per system, mirroring core/src/systems
    floors/      TowerView, FloorView, floor strip UI
    chests/      chest opening sequence, odds panel
    cards/       collection screen, card view
    ...
  app/           boot, main loop, settings, debug bridge
```

Rules:

1. **No rules in views.** A view may read state, send commands and react to events. It never computes a price, a payout or an unlock. If a view needs a number, the core exposes a query for it. Lint blocks imports of core internals; only the public surface is importable.
2. **Push for moments, pull for continuous values.** Discrete things arrive as events. Progress bars and counters read state each frame.
3. **Two clocks.** The simulation runs on real elapsed time. Effects, tweens and animations run on a presentation clock that can be slowed or frozen for hit-pause and scaled or simplified for the reduce-motion setting, without affecting earnings. In tests the presentation clock is stepped by hand, which makes screenshots repeatable.
4. **Every effect declares a motion class** (`essential`, `decorative`, `shake`, `flash`). The reduce-motion and screen-shake settings are applied centrally from that tag, so no effect can ignore them.
5. **Feature folders mirror system folders.** Whoever owns the `chests` system owns `core/src/systems/chests` and `game/src/features/chests`.

Main loop, per frame: read the monotonic clock, hand `dt` to the core (or route a long gap through the away path), drain core events into the feature views, advance the presentation clock, render.

## The platform interface

The game reaches the outside world only through this, so the same game runs in Electron, in a browser tab and in tests.

```ts
export interface Platform {
  saves: {
    read(slot: string): Promise<SaveReadResult>;       // includes which file was used and why
    write(slot: string, bytes: Uint8Array, meta: SaveMeta): Promise<void>;
    listBackups(slot: string): Promise<BackupInfo[]>;
    restoreBackup(slot: string, id: string): Promise<void>;
    exportToFile(bytes: Uint8Array): Promise<boolean>;
    importFromFile(): Promise<Uint8Array | null>;
  };
  clock: { wallMs(): number; monoMs(): number; uptimeMs(): number | null };
  settings: { load(): Promise<unknown>; store(s: unknown): Promise<void> };
  window: {
    setMode(m: 'windowed' | 'borderless'): void;
    quit(): void;
    onSuspendResume(fn: (e: 'suspend' | 'resume') => void): void;
  };
  clipboard: { writeText(s: string): Promise<void>; readText(): Promise<string> };
  log(level: 'info' | 'warn' | 'error', msg: string, data?: unknown): void;
  info: { version: string; build: string; portable: boolean };
}
```

Adapters: `ElectronPlatform` (the product; file work happens in the main process through `save-io`), `BrowserPlatform` (IndexedDB; for the phone preview and Playwright), `MemoryPlatform` (unit tests, with fault injection for the save torture tests).

## Electron shell

- Renderer runs with `contextIsolation` on, `sandbox` on, Node integration off. The preload script exposes only the `Platform` calls above.
- The app loads its own bundled files and nothing else. Navigation and new windows are blocked. **The game makes no network requests at all**; the shell blocks them, which also means no firewall prompt and nothing to worry about on privacy.
- Single-instance lock, so two copies cannot write the same save.
- The main process always holds the latest save snapshot the renderer sent, so it can write it out if the renderer crashes or Windows is shutting down (see 06).
- Background throttling is disabled; the game does its own slowing down: 30 fps when unfocused, rendering paused when minimised, and any gap is settled through the same away-time path as offline earnings.
- Autoplay is allowed so music starts without a click.
- Windows display scaling (125 percent, 150 percent) is handled in the resolution manager by sizing the canvas in true device pixels (see 03).

## Settings

Stored in their own file, separate from the save, so a save can be imported without changing the player's setup: audio volumes per bus, number format, screen shake, reduce motion, colour-blind rarity cues, UI scale, key bindings, window mode, frame cap.

## Debug and test bridge

Development and test builds expose `window.__sprout`: send a command, advance time, load a state fixture, open any screen by id, freeze effects at a timestamp, set the seed. The end-to-end tests, the screenshot tour and the video capture all drive the game through it. It is compiled out of release builds.

## Logging and failures

- A rotating local log file records errors, save and recovery decisions, and time anomalies. A "copy debug info" button in settings puts version, GPU, last errors and save metadata on the clipboard for bug reports.
- An uncaught error in a feature view is contained: the view is replaced by a small fallback and the error is logged; the simulation and autosave keep running.
- In development builds every big-number result is checked for NaN and infinity and fails loudly. In release builds the save writer refuses to persist a non-finite value and keeps the last good one.

## Performance budget

Targets to hold from the first Windows build, confirmed by the benchmark mode in 08.

| Item | Budget |
|---|---|
| Frame rate on the RTX 3060 | 120 fps or better at 4K, never below 60 |
| Simulation per frame | under 1 ms |
| Draw calls per frame | under 150 typical |
| Live particles | 4,000 cap, pooled |
| Texture memory | under 512 MB |
| JS heap | under 300 MB excluding decoded music |
| Cold start to title | under 3 seconds on an SSD |
| 30-day offline catch-up | under 50 ms |

How: floors outside the view are not drawn or animated (their simulation still runs, it is just maths); particles and popups are pooled; full-screen filters are avoided in favour of a small glow layer at half resolution (see 03); text is bitmap text.
