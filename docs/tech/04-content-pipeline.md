# 04. Data-driven content pipeline

Status: recommended, Phase 0. Owner: Engine Architect. The GDD decides what the tables contain; this document decides their shape and how they reach the game.

## Principles

1. **Content is data, not code.** Floors, cards, seeds and plants, traits, artifacts, chests, skills, research, quests, worlds, currencies, shops, achievements and events are rows in tables. Adding a floor or a card never needs a programmer.
2. **One source, three consumers.** The game, the balance simulator and the tests all load the same compiled bundle. There is no second copy of any number.
3. **Numbers, words and pictures are separate files** so the Economy thread, the Writer and the artists do not edit the same lines.
4. **Bad data cannot reach a build.** A compiler validates everything and CI fails on any error.
5. **Small files, one owner each**, so parallel agents rarely touch the same file.

## Where things live

```
packages/content/
  tables/                     numbers and structure (YAML)
    tuning.yaml               global constants: offline cap, crit base, combo window ...
    currencies.yaml
    unlocks.yaml              the reveal order: which feature appears when
    worlds/      w1.yaml w2.yaml ...
    floors/      w1.yaml w2.yaml ...
    milestones/  ladders.yaml
    cards/       managers.w1.yaml plants.herbs.yaml plants.hemp.yaml ...
    plants/      plants.yaml traits.yaml mutations.yaml
    chests/      chests.yaml loot.w1.yaml ...
    artifacts/   artifacts.yaml sets.yaml
    skills/      tree.yaml
    research/    tree.yaml
    quests/      daily.yaml weekly.yaml story.w1.yaml ...
    resets/      rebirth.yaml prestige.yaml
    achievements.yaml
    events/      ...
    retired.yaml              ids removed from the game and what replaces them
  text/en/                    every player-facing word, keyed by id
    floors.yaml cards.yaml plants.yaml ui.yaml tutorial.yaml ...
  src/                        the compiler
  generated/                  compiler output, not committed
art/                          cleaned sprites, rigs, effects (see below)
audio/                        final OGG files and loop metadata
```

Every file in a table folder is merged by the compiler, so two people adding cards create two different files. Ids must be unique across all files.

## File format

YAML 1.2, parsed strictly (duplicate keys are errors; only `true` and `false` are booleans). YAML is chosen over JSON because designers' comments matter in balance tables and multi-line text reads well; it is chosen over spreadsheets because nested effects do not fit in cells and because diffs must be reviewable. Each file is a list of records.

A floor, using the measured first floor from the Cash, Inc. bible as the example values:

```yaml
# packages/content/tables/floors/w1.yaml
- id: floor.w1.windowsill
  world: world.w1
  order: 1
  openCost: 0
  basePayout: 1
  baseCycleSec: 0.6
  levelCost: { base: 4, growth: 1.07 }
  milestones: ladder.fast
  art: { room: rooms/w1/windowsill, actors: [actor.gardener_a], ambience: amb.w1.windowsill }
```

A card (names are placeholders for the Writer):

```yaml
# packages/content/tables/cards/managers.w1.yaml
- id: card.manager.w1_balcony
  kind: manager
  rarity: rare
  floor: floor.w1.balcony
  dupes: curve.dupes.rare          # copies needed per level
  effects:
    - { stat: floor.autoCollect, scope: { floor: floor.w1.balcony }, op: set, value: 1 }
    - { stat: floor.payoutMult,  scope: { floor: floor.w1.balcony }, op: mul, value: 1.5, perLevel: 0.25, bucket: manager }
  art: { portrait: cards/managers/w1_balcony, actor: actor.manager_balcony }
```

Its words live elsewhere:

```yaml
# packages/content/text/en/cards.yaml
card.manager.w1_balcony:
  name: "..."
  bio: "..."
```

## Shared building blocks

These few shapes are reused by every table. Learning them once is learning the whole content format.

**Ids.** Lowercase, dotted, namespaced by kind: `floor.w1.windowsill`, `card.manager.w1_balcony`, `plant.mint.frosted`, `artifact.golden_trowel`, `stat.floor.payoutMult`. An id is permanent once it has shipped in a build, because saves refer to it. To remove or rename something, add a line to `retired.yaml` saying what it becomes (a replacement id, or a refund).

**Numbers.** Small values are plain numbers. Anything that can grow large is written as a number or a string such as `"7.25e12"` and is loaded as a big number (see 05).

**Effect.** How anything changes a stat. Used by cards, traits, artifacts, set bonuses, skills, research, shop upgrades, milestones, achievements, world twists and events.

```yaml
- stat: floor.payoutMult        # must be a registered stat
  scope: { tag: herb }          # global | { world } | { floor } | { plant } | { tag }
  op: mul                       # add | inc (percent, summed per bucket) | mul | set
  value: 2
  perLevel: 0.1                 # optional growth with the owner's level
  bucket: artifact              # which stacking group it belongs to
  when: { state: frenzy }       # optional condition
```

**Condition.** Used for unlocks, quest goals and `when` clauses.

```yaml
all:
  - { stat: lifetime.cash, gte: "1e6" }
  - { level: [floor.w1.windowsill, 25] }
  - { owned: floor.w1.greenhouse }
any: [ ... ]
not: { ... }
```

**Cost** `{ currency: cur.cash, base: 100, growth: 1.15 }` and **Reward** `{ currency: cur.gems, amount: 5 }`, `{ chest: chest.wooden, count: 1 }`, `{ card: card.x, copies: 2 }`, `{ unlock: feature.research }`.

**Loot table.** Weighted entries plus pity rules.

```yaml
- id: loot.w1.wooden
  rolls: 3
  rarity: { common: 70, uncommon: 22, rare: 6.5, epic: 1.3, legendary: 0.19, exotic: 0.01 }
  pity: [{ rarity: epic, within: 20 }]
  pools: { common: pool.w1.common, rare: pool.w1.rare }
```

The odds shown to the player are computed from this same record at run time, so displayed odds cannot drift from real odds.

**Formula reference.** Where a table needs a curve it names a formula implemented once in the core and gives its parameters: `gain: { formula: prestige.root, params: { divisor: "1e9", power: 0.5 } }`. There are no formula strings to evaluate.

**Special.** Behaviour that is not a number change is a named hook implemented by the owning system: `special: keystone.tap_adds_level`.

## Table list

The GDD is the authority on fields. This is the starting set and who owns the schema.

| Table | Key fields | Schema owner (core system) |
|---|---|---|
| `tuning` | named constants | kernel |
| `currencies` | id, kind (run, rebirth, prestige, world, premium-free), big or integer, decimals shown, icon | wallet |
| `worlds` | id, order, floors, twist special and parameters, currency, art set, music | worlds |
| `floors` | id, world, order, open cost, base payout, base cycle, level cost curve, milestone ladder, art | floors |
| `milestones` | ladder id, thresholds, reward effects, global ladders | floors |
| `cards` | id, kind (manager, plant, seed), rarity, dupe curve, effects, art | cards, managers |
| `plants`, `traits`, `mutations` | plant types, trait effects, cross-pollination recipes and conditions | plants, mutations |
| `chests`, `loot` | chest types, sources, loot tables, pity | chests |
| `artifacts`, `sets` | slots, passive effects, active ability special, cooldown, set bonuses | artifacts |
| `skills`, `research` | node id, position, parents, cost, effects or special, research time | skills, research |
| `quests` | kind (daily, weekly, story), goal condition, rewards, weights | quests |
| `resets` | per reset layer: gain formula, what it keeps, shop items | resets |
| `achievements` | condition, reward, hidden flag | achievements |
| `events` | schedule rule, modifiers, rewards | events |
| `unlocks` | feature id, condition, how it is introduced | unlocks |
| `tutorial` | step list, triggers, highlight targets | tutorial |

Schemas live next to the system that uses them (`packages/core/src/systems/<name>/schema.ts`) and are written with zod, so the TypeScript types and the validation rules are the same thing.

## The compiler

`pnpm content:build` (also run automatically by the dev server, tests, simulator and CI):

1. Read every table and text file.
2. Validate each record against its schema.
3. Cross-check:
   - ids unique and well-formed; every reference points at something that exists
   - every stat named by an effect is registered; every special and formula named has an implementation
   - cost growth is above 1, cycles are positive, weights sum above zero, pity rules are satisfiable
   - **the unlock graph has no cycles and everything is reachable** from a new game, which catches orphaned content and one class of dead zone before the simulator even runs
   - every entity has its text keys; every art and audio key exists (a warning until Phase 3, an error after)
4. Emit `generated/content.json` (the bundle, with a content hash), `generated/ids.d.ts` (so code that names an id is checked at compile time) and `generated/report.html` (every table as a readable page).

The report page is published with the phone preview (see 08) so Lawson can read the actual shipped numbers and text without opening YAML.

In development the compiler watches for changes and the running game hot-reloads content, so a balance tweak is visible in seconds.

## Text and localisation

All player-facing text is in `text/en/`, keyed by id, with named placeholders (`"Earns {amount} every {time}"`). Version 1 ships English only, but nothing in code contains display text, so another language is a new folder. The Writer owns this folder. A CI check lists any text key that is missing or unused.

## Art and audio assets

```
art/
  sprites/          cleaned, palette-locked PNG sprites. The source of truth
  rigs/             rig JSON (see 03)
  fx/               effect YAML
  fonts/            bitmap font sources
audio/
  music/<track>/    stems as OGG plus loop metadata
  sfx/  amb/
```

- **Raw generated images do not go in git.** They are large and get replaced often. They stay in the project's shared files (`/mnt/project-files/art/raw/batchNN/`), with the batch number matching the prompt batch. Only the cleaned sprites that the clean-up step produces are committed. This keeps the repository small and avoids any paid storage.
- The clean-up route (palette quantising, pixel snapping, slicing, splitting parts for rigs) belongs to the Art Director; its scripts live in `tools/art/` and run headless.
- `pnpm assets:build` packs sprites into atlases and writes an asset manifest. Atlases are build output and are not committed.
- **Art lint** runs in CI on `art/sprites/`: only palette colours, hard alpha unless flagged as a soft layer, correct canvas size for the asset class, correct naming. It is the automated half of the art-consistency review.
- Content refers to art by key (`rooms/w1/windowsill`), never by file path or atlas position.

## Who edits what

| Role | Files |
|---|---|
| Game Designer | `tables/unlocks.yaml`, `tables/quests/`, `tables/skills/`, `tables/research/`, structure of every table |
| Economy and Balance | numeric fields in `tables/floors/`, `milestones/`, `resets/`, `tuning.yaml`, curves |
| Content Builder | bulk rows in `tables/cards/`, `plants/`, `artifacts/`, `achievements.yaml` |
| Writer | `text/en/` |
| Art, Animation and VFX | `art/` |
| Audio | `audio/` |
| Gameplay programmers | schemas in their system folder |

Where the Economy thread generates numbers from a formula (for example a cost ladder), the generator script is committed beside the table and its output is the table, so a regenerated table shows up as an ordinary reviewable diff.
