# 04. Data-driven content pipeline

Status: recommended, Phase 0. Owner: Engine Architect. Brought in line with design version 0.2 on 2026-11-26. The GDD decides what the tables contain; this document decides their shape and how they reach the game. Rules are in [GDD.md](../design/GDD.md) and every row is in [CONTENT.md](../design/CONTENT.md). Where this page and those two disagree about a field or a value, they win and this page is corrected.

## Principles

1. **Content is data, not code.** Worlds, floors, managers and their abilities, plants and their traits, heirlooms, chests, skills, research, shops, quests, achievements, visitors, events and every named constant are rows in tables. Adding a floor or a card never needs a programmer.
2. **One source, three consumers.** The game, the balance simulator and the tests all load the same compiled bundle. There is no second copy of any number.
3. **Numbers, words and pictures are separate files** so the Economy thread, the Writer and the artists do not edit the same lines.
4. **Bad data cannot reach a build.** A compiler validates everything and CI fails on any error.
5. **Small files, one owner each**, so parallel agents rarely touch the same file.

## Where things live

```
packages/content/
  tables/                     numbers and structure (YAML)
    constants.yaml            every named constant in GDD Appendix A, under the same name
    currencies.yaml
    unlocks.yaml              the reveal order (GDD 16)
    worlds/      worlds.yaml                      one row per world: D, T, COMPOST_K, ticket, deed, twist
                 w1.floors.yaml ...               who each floor is (written by hand)
                 w1.floors.gen.yaml ...           what each floor costs and pays (generated, see below)
    managers/    managers.yaml abilities.yaml
    plants/      families.yaml traits.yaml plants.yaml recipes.yaml
    chests/      chests.yaml special.yaml copies.yaml
    artifacts/   artifacts.yaml sets.yaml         heirlooms. The id prefix stays artifact.
    skills/      green_thumb.yaml botanist.yaml tycoon.yaml
    research/    tools.yaml soil_science.yaml botany.yaml people_and_luck.yaml
    shops/       compost.yaml ribbon.yaml gems.yaml
    quests/      story.yaml daily.yaml weekly.yaml
    achievements.yaml
    visitors.yaml
    codex.yaml
    events/      weekend.yaml fair_stall.yaml
    retired.yaml              ids removed from the game and what replaces them
  text/en/                    every player-facing word, keyed by id
    floors.yaml managers.yaml plants.yaml ui.yaml tutorial.yaml ...
  src/                        the compiler
  generated/                  compiler output, not committed
art/                          cleaned sprites, rigs, effects (see below)
audio/                        final OGG files and loop metadata
```

Every file in a table folder is merged by the compiler, so two people adding cards create two different files. Ids must be unique across all files.

## File format

YAML 1.2, parsed strictly (duplicate keys are errors; only `true` and `false` are booleans). YAML is chosen over JSON because designers' comments matter in balance tables and multi-line text reads well; it is chosen over spreadsheets because nested effects do not fit in cells and because diffs must be reviewable. Each file is a list of records.

The first floor of Thymeford, with the values of CONTENT.md 1.1. A floor is two short records with the same id: who the floor is, written by hand, and what it costs and pays, which is generated.

```yaml
# packages/content/tables/worlds/w1.floors.yaml        written by hand
- id: floor.w1.windowsill
  world: world.w1
  order: 1
  favouredFamily: mint
  art: { room: rooms/w1/windowsill, actors: [actor.gardener_a], ambience: amb.w1.windowsill }
```

```yaml
# packages/content/tables/worlds/w1.floors.gen.yaml    generated. Do not edit by hand
- id: floor.w1.windowsill
  openCost: 0
  basePayout: 1
  baseCycle: 0.6            # seconds
  levelBaseCost: 4
  growth: 1.07
  hireFee: 1000
```

Its words live elsewhere:

```yaml
# packages/content/text/en/floors.yaml
floor.w1.windowsill:
  name: "Windowsill Planter"
  product: "Fresh mint"
```

### Generated floor rows

Every world's floors come from one template and two numbers per world, the cost scale `D` and the payout taper `T` (GDD 5.3 and 14.2). Those six rows of world parameters are the most sensitive numbers in the game, so they are the only place a floor's economy is typed in.

- The template is one pure function in the core (`systems/floors/template.ts`), written once from GDD 5.3.
- `pnpm content:floors` runs it over `worlds/worlds.yaml` and writes the `.gen.yaml` files. They are committed, so a change to `D` or `T` arrives as a reviewable diff of every floor it moves.
- CI runs the generator again and fails if the committed files differ. Nobody can hand-edit a generated number or forget to regenerate.
- The compiler joins the two records by id. A hand-written file may not contain a generated field, and a generated file may not contain anything else.
- The simulator calls the same function with trial values of `D` and `T`, in memory, when it searches for better world parameters. The fair stall (GDD 15.3) uses it too.

### Managers

**One fixed manager per floor.** Lawson decided this on 2026-11-26. The shape below follows design 0.3, which the Game Designer has in progress and which still goes to an audit, so check it against the merged GDD before building on it.

```yaml
# packages/content/tables/managers/managers.yaml
- id: card.manager.basil_brumble
  rarity: common
  floor: floor.w1.balcony          # the one floor this manager runs. A manager never moves
  perk: { stat: floor.profit, op: inc, value: 0.20, scope: floor }
  art: { portrait: managers/basil_brumble, actor: actor.basil_brumble }
```

- A manager is still a card with a rarity, copies and levels. There are 50, one per floor.
- The card is owned at level 1 from the first time its floor is ever opened. That "met" flag is save state and survives a Replant and a Harvest Festival.
- Hiring is paying the floor's `hireFee`, once per run. It switches on the floor's automation, the manager's perk and its ability. The fee stays on the floor row.
- Copies come from chests. A manager slot picks among the managers the player has met at the rolled rarity, so managers have no `poolWorld`. Exotic managers are never in a chest pool: their copies come from World Mastery and from the Starlight Chest's fixed slot.
- A perk's scope is read from the manager's own floor and counts only while that manager is hired.

An ability is its own record. It is a timed boost, a payout or a named special, with a cooldown:

```yaml
# packages/content/tables/managers/abilities.yaml
- id: ability.sunday_best
  owner: card.manager.granny_evergreen
  cooldown: 900                                     # seconds
  boost: { target: world, size: 5, seconds: 30 }    # adds 4 to that world's Boost (GDD 13.5)

- id: ability.heave_ho
  owner: card.manager.bjorn_barrow
  cooldown: 1200
  payout: { of: world, seconds: 120 }               # always paid from the steady rate

- id: ability.tea_break
  owner: card.manager.old_moss
  cooldown: 480
  special: ability.tea_break                        # a rule change, implemented by the tapping system
```

## Shared building blocks

These few shapes are reused by every table. Learning them once is learning the whole content format.

**Ids.** Lowercase, dotted, namespaced by kind: `floor.w1.windowsill`, `card.manager.nana_sprig`, `plant.mint.frosted`, `artifact.sprouting_trowel`, `skill.gt.firm_grip`, `shop.compost.rich_soil`, `cur.coins`. Heirlooms keep the `artifact.` prefix. Players only ever see the word Heirloom. An id is permanent once it has shipped in a build, because saves refer to it. To remove or rename something, add a line to `retired.yaml` saying what it becomes (a replacement id, or a refund).

**Numbers.** Small values are plain numbers. Anything that can grow large is written as a number or a string such as `"7.25e12"` and is loaded as a big number (see 05).

**Constants.** Every named constant in GDD Appendix A is one line in `constants.yaml` under the same name (`MILESTONE_MULT`, `BOOST_CAP`, `OFFLINE_CAP_BASE`). Code reads constants by name and never carries its own copy of a number, so the GDD, the table and the game cannot drift apart.

**Effect.** How anything changes a stat. Used by manager perks, plant traits, heirlooms, set bonuses, skills, research, shop items, achievements, world twists and events.

```yaml
- stat: floor.profit        # a registered stat. The names are those of CONTENT.md 0.2
  op: inc                   # inc: a percentage, added up inside its bucket
                            # add: a flat amount     mul: its own multiplier
                            # set: switches on a named special
  value: 0.20
  scope: floor              # floor | adjacent | world | global
  family: hemp              # optional: limits a plant bonus to one family
  when: { ... }             # optional condition
```

- **Scope is relative to where the owner is.** For a manager it is their own floor. For a plant it is the floor it is planted on. `adjacent` is the floors directly above and below, `world` is every floor in that world, and `global` is everything, counted once. Things that are not placed anywhere (skills, research, shop items, heirlooms) use `global` or name their target, as in `scope: { world: world.w4 }`.
- **The bucket is not written on the row.** It comes from the kind of owner, as CONTENT.md 0.1 lists them: a manager's own multiplier is `manager`, manager perks and plant traits share `floor`, heirlooms and their sets are `heirloom`, then `skill`, `research`, `compost`, `ribbon`, `achievement`, `codex`, `mastery` and `twist`. A row cannot land in the wrong bucket through a typo.
- **Scaling with level is not written on the row either.** It is one rule per kind of owner (CONTENT.md 0.1): a manager perk grows by `PERK_PER_LEVEL`, an heirloom passive by `HEIRLOOM_PER_LEVEL` unless the row says `fixed: true`, a plant trait by the formula in GDD 8.5. Abilities and set bonuses never scale.
- **A timed bonus to income or taps is a `boost`**, not an effect: a target (`world`, `floor` or `tap`), a size, and seconds or taps. Boosts add into one capped Boost per world and never multiply each other (GDD 13.5). The schema has no way to write a timed multiplier, on purpose. The few timed things that are not boosts (GDD 13.5 rule 6) are named specials: Dig In, which is a timed discount on one floor's level costs, and the guaranteed Bumpers of Best in Show and Sharp Season.

How each stat combines its bonuses, and where it is capped, is declared once with the stat (see 02).

**Condition.** Used for unlocks, quest goals and `when` clauses. This one is the Welcome Chest rule:

```yaml
all:
  - { holds: [cur.coins, 1000] }
  - { open: floor.w1.hemp_patch }
any: [ ... ]
not: { ... }
```

**Cost.** A curve named by its formula, or a list: `{ currency: cur.compost, formula: geometric, base: 20, growth: 1.8, maxLevel: 10 }` or `{ currency: cur.ribbons, levels: [3, 10, 40, 150, 600] }`. Formulas are implemented once in the core and named here. There are no formula strings to evaluate.

**Reward.** `{ currency: cur.gems, amount: 5 }`, `{ chest: chest.wooden, count: 1 }`, `{ card: plant.mint.garden, copies: 2 }`, `{ xp: 1500 }`, `{ unlock: feature.research }`.

**Chest.** One record per tier, straight from the table in GDD 8.3:

```yaml
# packages/content/tables/chests/chests.yaml
- id: chest.silver
  tier: 3
  cards: 8
  guaranteed: [{ count: 1, atLeast: rare }]
  weights: { common: 48, uncommon: 32, rare: 15, epic: 4.2, legendary: 0.8 }
  pollen: 30
  heirloomChance: 0.20
```

The order of the rolling rules (guarantee slots, which card, new-card help, pity, luck, the heirloom roll) is code in the chests system, written once from GDD 8.3. Their numbers (`PITY_EPIC`, `PITY_LEGENDARY`, `PITY_HEIRLOOM`, `NEW_CARD_CHESTS`) are named constants. Which cards a chest can give is worked out, never listed by hand: a plant by its `rarity` and `poolWorld`, a manager by its `rarity` and whether the player has met it. A new card joins the right pool by existing. The odds shown to the player come from the same function with the player's luck applied, so shown odds cannot drift from real odds.

**Special.** Behaviour that is not a number change is a named hook implemented by the owning system: `special: keystone.thunder_thumb`.

## Table list

The GDD and CONTENT.md are the authority on fields. This is the starting set and who owns each schema.

| Table | Key fields | Schema owner (core system) |
|---|---|---|
| `constants` | name, value, unit | kernel |
| `currencies` | id, kind (a world's currency, Gems, Compost, Ribbons, Insight, Pollen, Skill Points, Fair Tickets), big or integer, icon | wallet |
| `worlds` | id, climate, currency, floor count, `D`, `T`, `COMPOST_K`, ticket, deed, twist special, art set, music | worlds |
| `floors` | by hand: id, world, order, favoured family, art. Generated: open cost, base payout, base cycle, level base cost, growth, hire fee | floors |
| `managers`, `abilities` | rarity, floor, perk; ability cooldown and its boost, payout or special | managers |
| `families`, `traits`, `plants`, `recipes` | family, rarity, pool world, one or two traits; trait base, scope and stat; recipe parents or parent and climate | plants, bench |
| `chests`, `special`, `copies` | tier, card count, guarantees, weights, Pollen, heirloom chance; fixed contents of the special chests; copies needed per level for each rarity | chests, cards |
| `artifacts`, `sets` | rarity, set, passive effect, ability, two-piece and three-piece bonuses | artifacts (heirlooms) |
| `skills` | branch, tier, ranks, effect per rank or keystone special | skills |
| `research` | lane, Insight cost, time, what it needs first, effect or unlock | research |
| `shops` | effect per level, level cap, cost | resets (Compost Shop, Ribbon Shop), wallet (Gem shop) |
| `quests` | the story chain in order; daily and weekly pools with goal, rewards and the feature each needs | quests |
| `achievements` | family, five tiers, condition, rewards | achievements |
| `visitors` | unlock, weight, outcome | visitors |
| `codex` | entry, what fills it | codex |
| `events` | week slot, weekend bonus, fair stall rows, reward track | events |
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
   - **the generated floor rows match the template** for the world parameters in `worlds.yaml`
   - **the design's guard rules hold.** Each stat lists the buckets that may feed it: `chest.luck` takes skills and research only, and `compost.gain` takes skills and the Compost Shop only (GDD 13.4). Anything bought with Compost or Ribbons that multiplies profit per level has a level cap. No Exotic card and no hybrid is in a chest pool (GDD 8.3 rule 3). Each stat only takes the operations its rule allows
   - **the unlock graph has no cycles and everything is reachable** from a new game, which catches orphaned content and one class of dead zone before the simulator even runs
   - every entity has its text keys; every art and audio key exists (a warning until Phase 3, an error after)
   - **the word check.** Every line of text is checked against the do-not-use list in GDD 2.3 and `docs/art/HEMP_ART.md`. Words that are never acceptable fail the build. Words that are only wrong in some uses are listed in the report for the reviewer, with an allow file for lines a person has approved. A hand-written 420 or 69 in a table or in text is listed the same way (GDD 2.2 rule 7)
4. Emit `generated/content.json` (the bundle, with a content hash), `generated/ids.d.ts` (so code that names an id is checked at compile time) and `generated/report.html` (every table as a readable page).

The report page is published with the phone preview (see 08) so Lawson can read the actual shipped numbers and text without opening YAML.

In development the compiler watches for changes and the running game hot-reloads content, so a balance tweak is visible in seconds.

## Text and localisation

All player-facing text is in `text/en/`, keyed by id, with named placeholders (`"Earns {amount} every {time}"`). Version 1 ships English only, but nothing in code contains display text, so another language is a new folder. The Writer owns this folder. A CI check lists any text key that is missing or unused.

## Art and audio assets

```
art/
  floors/ actors/ plants/ props/ cards/ icons/ ui/ vfx/ bg/
                    cleaned, palette-locked PNG sprites by class. The source of truth
  rigs/             rig JSON (see 03)
  fx/               effect YAML
  fonts/            bitmap font sources
audio/
  music/<track>/    stems as OGG plus loop metadata
  sfx/  amb/
```

- **The style bible sets where sprites go and what they are called** (STYLE_BIBLE section 3): one folder per class under `art/`, and lowercase snake case file names such as `plant_mint_stage3.png`. The scaffold follows it. An art key in a content table is the file name without `.png`, so the art keys in the examples on this page are stand-ins until the real files exist.
- **Raw generated images do not go in git.** They are large and get replaced often. They stay in the project's shared files, in the batch folders the Art Director keeps under `/mnt/project-files/art/`. Only the cleaned sprites that the clean-up step produces are committed. This keeps the repository small and avoids any paid storage.
- The clean-up route (palette quantising, pixel snapping, slicing, splitting parts for rigs) belongs to the Art Director; its scripts live in `tools/art/` and run headless.
- `pnpm assets:build` packs sprites into atlases and writes an asset manifest. Atlases are build output and are not committed.
- **Art lint** runs in CI on the sprite folders: only palette colours, hard alpha unless flagged as a soft layer, correct canvas size for the asset class, correct naming. It is the automated half of the art-consistency review.
- Content refers to art by key, never by file path or atlas position.

## Who edits what

| Role | Files |
|---|---|
| Game Designer | `tables/unlocks.yaml`, `tables/quests/`, `tables/skills/`, `tables/research/`, structure of every table |
| Economy and Balance | `constants.yaml`, `worlds/worlds.yaml` and the generated floor rows, `shops/`, numbers in `chests/` |
| Content Builder | bulk rows in `tables/managers/`, `plants/`, `artifacts/`, `achievements.yaml`, `codex.yaml` |
| Writer | `text/en/` |
| Art, Animation and VFX | `art/` |
| Audio | `audio/` |
| Gameplay programmers | schemas in their system folder |

Where numbers come from a formula, the generator is committed and its output is the table, so a regenerated table shows up as an ordinary reviewable diff. The floor rows above are the first case. Any later one follows the same pattern: a `.gen.yaml` file, a command, and a CI check that the committed file is current.
